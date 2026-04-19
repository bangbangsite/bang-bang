"use server"

/**
 * Server Actions for mutating the pdv_overrides singleton in Supabase.
 *
 * All mutations follow the same read-modify-write pattern:
 *   1. requireUser() — 401-equivalent if not authenticated (admin only writes)
 *   2. Read the current row via .select().eq('id', true).single()
 *   3. Apply the in-memory transformation
 *   4. Persist via .update().eq('id', true)  — NEVER .upsert() (singleton seeded in migration)
 *   5. revalidatePath for pages that consume PDV data
 *
 * Concurrency note: because a single admin (Pedro) is the only writer, we do
 * not implement optimistic locking. If multi-admin ever becomes a need, add
 * an `updated_at` check here before committing.
 *
 * JSONB column naming: DB stores snake_case (deleted_ids, created_at_map).
 * In-memory shape uses camelCase (deletedIds, createdAt). The conversion
 * happens in rowToOverrides / overridesToPayload helpers below.
 */

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/supabase-auth"
import { EMPTY_OVERRIDES, type PDVOverrides } from "./overrides"
import type { PDV } from "@/lib/types/pdv"
import type { ImportPreview } from "./import"

// ─── DB types ────────────────────────────────────────────────────────────────

interface DBRow {
  added: PDV[]
  edited: Record<string, Partial<PDV>>
  deleted_ids: string[]
  created_at_map: Record<string, string>
}

function rowToOverrides(row: DBRow): PDVOverrides {
  return {
    added: Array.isArray(row.added) ? row.added : [],
    edited:
      row.edited && typeof row.edited === "object"
        ? (row.edited as Record<string, Partial<PDV>>)
        : {},
    deletedIds: Array.isArray(row.deleted_ids) ? row.deleted_ids : [],
    createdAt:
      row.created_at_map && typeof row.created_at_map === "object"
        ? (row.created_at_map as Record<string, string>)
        : {},
  }
}

function overridesToPayload(o: PDVOverrides) {
  return {
    added: o.added,
    edited: o.edited,
    deleted_ids: o.deletedIds,
    created_at_map: o.createdAt,
  }
}

// ─── Shared read/write helpers ────────────────────────────────────────────────

async function readRow(): Promise<PDVOverrides> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("pdv_overrides")
    .select("added, edited, deleted_ids, created_at_map")
    .eq("id", true)
    .single<DBRow>()
  if (error || !data) return { ...EMPTY_OVERRIDES }
  return rowToOverrides(data)
}

async function writeRow(next: PDVOverrides): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("pdv_overrides")
    .update(overridesToPayload(next))
    .eq("id", true)
  if (error) throw new Error(`pdv_overrides write failed: ${error.message}`)
}

function revalidatePDVPages() {
  revalidatePath("/onde-encontrar")
  revalidatePath("/dashboard/pdvs")
}

// ─── Public actions ───────────────────────────────────────────────────────────

export async function addPDVOverride(pdv: PDV): Promise<void> {
  await requireUser()
  const curr = await readRow()
  const next: PDVOverrides = {
    ...curr,
    added: [...curr.added, pdv],
    createdAt: { ...curr.createdAt, [pdv.id]: new Date().toISOString() },
  }
  await writeRow(next)
  revalidatePDVPages()
}

export async function editPDVOverride(
  pdvId: string,
  patch: Partial<PDV>,
): Promise<void> {
  await requireUser()
  const curr = await readRow()

  // If the PDV is in the added list, mutate that record in-place.
  const addedIdx = curr.added.findIndex((p) => p.id === pdvId)
  if (addedIdx !== -1) {
    const nextAdded = [...curr.added]
    nextAdded[addedIdx] = { ...nextAdded[addedIdx], ...patch }
    await writeRow({
      ...curr,
      added: nextAdded,
      createdAt: { ...curr.createdAt, [pdvId]: new Date().toISOString() },
    })
    revalidatePDVPages()
    return
  }

  const next: PDVOverrides = {
    ...curr,
    edited: {
      ...curr.edited,
      [pdvId]: { ...(curr.edited[pdvId] ?? {}), ...patch },
    },
    createdAt: { ...curr.createdAt, [pdvId]: new Date().toISOString() },
  }
  await writeRow(next)
  revalidatePDVPages()
}

export async function deletePDVOverride(pdvId: string): Promise<void> {
  await requireUser()
  const curr = await readRow()

  // PDVs added via dashboard are removed entirely; base PDVs are soft-deleted.
  const addedIdx = curr.added.findIndex((p) => p.id === pdvId)
  if (addedIdx !== -1) {
    const nextCreatedAt = { ...curr.createdAt }
    delete nextCreatedAt[pdvId]
    await writeRow({
      ...curr,
      added: curr.added.filter((_, i) => i !== addedIdx),
      createdAt: nextCreatedAt,
    })
    revalidatePDVPages()
    return
  }

  if (!curr.deletedIds.includes(pdvId)) {
    await writeRow({
      ...curr,
      deletedIds: [...curr.deletedIds, pdvId],
    })
    revalidatePDVPages()
  }
}

export async function restorePDVOverride(pdvId: string): Promise<void> {
  await requireUser()
  const curr = await readRow()
  const nextCreatedAt = { ...curr.createdAt }
  delete nextCreatedAt[pdvId]
  const next: PDVOverrides = {
    ...curr,
    deletedIds: curr.deletedIds.filter((id) => id !== pdvId),
    edited: Object.fromEntries(
      Object.entries(curr.edited).filter(([id]) => id !== pdvId),
    ),
    createdAt: nextCreatedAt,
  }
  await writeRow(next)
  revalidatePDVPages()
}

export async function resetPDVOverrides(): Promise<void> {
  await requireUser()
  await writeRow({ ...EMPTY_OVERRIDES })
  revalidatePDVPages()
}

/**
 * Batch import: applies a parsed ImportPreview in a single round-trip.
 * Merges toAdd into added[] and toUpdate into edited{}.
 */
export async function importPDVOverridesBatch(
  preview: Pick<ImportPreview, "toAdd" | "toUpdate">,
): Promise<void> {
  await requireUser()
  const curr = await readRow()
  const now = new Date().toISOString()

  const nextAdded = [...curr.added]
  const nextCreatedAt = { ...curr.createdAt }

  for (const pdv of preview.toAdd) {
    nextAdded.push(pdv)
    nextCreatedAt[pdv.id] = now
  }

  const nextEdited = { ...curr.edited }
  for (const { id, patch } of preview.toUpdate) {
    nextEdited[id] = { ...(nextEdited[id] ?? {}), ...patch }
    nextCreatedAt[id] = now
  }

  await writeRow({
    ...curr,
    added: nextAdded,
    edited: nextEdited,
    createdAt: nextCreatedAt,
  })
  revalidatePDVPages()
}
