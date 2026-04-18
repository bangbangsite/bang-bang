/**
 * Staff-area edits live in localStorage as a set of overrides layered on top
 * of the immutable base JSON generated from the xlsx.
 *
 * Shape:
 *   - `added`:       new PDVs created via the dashboard
 *   - `edited`:      partial patches keyed by PDV id
 *   - `deletedIds`:  soft-deletes from the base set
 *   - `createdAt`:   map of id → ISO date — used to order "recently added"
 *
 * The overrides are visible only in the browser that made them. When a real
 * backend lands this module is replaced by a fetch/mutation layer, and the
 * consumer hook (`usePDVs`) stays the same.
 */
import type { PDV } from "@/lib/types/pdv"

const KEY = "bb_pdv_overrides_v1"

export interface PDVOverrides {
  added: PDV[]
  edited: Record<string, Partial<PDV>>
  deletedIds: string[]
  /** id → ISO timestamp. Includes both added and edited records. */
  createdAt: Record<string, string>
}

export const EMPTY_OVERRIDES: PDVOverrides = {
  added: [],
  edited: {},
  deletedIds: [],
  createdAt: {},
}

export function readOverrides(): PDVOverrides {
  if (typeof window === "undefined") return EMPTY_OVERRIDES
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return EMPTY_OVERRIDES
    const parsed = JSON.parse(raw) as Partial<PDVOverrides>
    return {
      added: Array.isArray(parsed.added) ? parsed.added : [],
      edited:
        parsed.edited && typeof parsed.edited === "object"
          ? (parsed.edited as Record<string, Partial<PDV>>)
          : {},
      deletedIds: Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [],
      createdAt:
        parsed.createdAt && typeof parsed.createdAt === "object"
          ? (parsed.createdAt as Record<string, string>)
          : {},
    }
  } catch {
    return EMPTY_OVERRIDES
  }
}

export function writeOverrides(next: PDVOverrides): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore — quota or blocked */
  }
}

export function resetOverrides(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
