import basePDVsJson from "@/data/pdvs.json"
import type { PDV, PDVsByUF, UF } from "@/lib/types/pdv"
import { getPDVOverrides } from "./overrides-server"

// Server-side merge of the build-time pdvs.json with the dashboard overrides
// stored in Supabase. Use from Server Components (home, /onde-encontrar) so
// staff edits are visible to the public the moment they're saved, without
// waiting for a redeploy.

const BASE = basePDVsJson as PDV[]

interface MergedPDVs {
  pdvs: PDV[]
  activeUfs: PDVsByUF[]
}

export async function getMergedPDVs(): Promise<MergedPDVs> {
  const overrides = await getPDVOverrides()
  const deleted = new Set(overrides.deletedIds)

  const merged: PDV[] = []
  for (const base of BASE) {
    if (deleted.has(base.id)) continue
    const patch = overrides.edited[base.id]
    merged.push(patch ? { ...base, ...patch } : base)
  }
  for (const added of overrides.added) {
    if (!deleted.has(added.id)) merged.push(added)
  }

  const counts = new Map<UF, number>()
  for (const p of merged) counts.set(p.uf, (counts.get(p.uf) ?? 0) + 1)
  const activeUfs: PDVsByUF[] = [...counts.entries()]
    .map(([uf, count]) => ({ uf, count }))
    .sort((a, b) => b.count - a.count)

  return { pdvs: merged, activeUfs }
}
