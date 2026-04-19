/**
 * Shape definition for the PDV overrides layer.
 *
 * These types are shared between:
 *   - overrides-server.ts  (reads from Supabase on the server)
 *   - actions.ts           (mutates via Server Actions)
 *   - usePDVs.ts           (reads from Supabase on the client, reactive hook)
 *   - export.ts            (uses PDVOverrides for createdAt lookup)
 *
 * The JSONB columns in Supabase use snake_case (deleted_ids, created_at_map);
 * in-memory we always use camelCase (deletedIds, createdAt). Conversion
 * happens at the DB boundary in overrides-server.ts and actions.ts.
 */
import type { PDV } from "@/lib/types/pdv"

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
