import { createSupabaseServerClient } from "@/lib/supabase/server"

export type CTACategoryKey = "revenda" | "distribuidor" | "eventos"

export interface ClickEngagement {
  /** Lifetime totals from click_events (all time). */
  totalByCategory: Record<CTACategoryKey, number>
  /** Per-hour slot counts for the current calendar month (index 0–23). */
  hourlyByCategory: Record<CTACategoryKey, number[]>
  /** Per-day slot counts for the current calendar month (index 0–30, day-1 based). */
  dailyByCategory: Record<CTACategoryKey, number[]>
  /** Per-day totals for the last 7 calendar days (index 0 = oldest). */
  last7Days: number[]
}

const CATEGORIES: CTACategoryKey[] = ["revenda", "distribuidor", "eventos"]

function emptyHourly(): number[] {
  return Array<number>(24).fill(0)
}

function emptyDaily(): number[] {
  return Array<number>(31).fill(0)
}

function emptyEngagement(): ClickEngagement {
  return {
    totalByCategory: { revenda: 0, distribuidor: 0, eventos: 0 },
    hourlyByCategory: {
      revenda: emptyHourly(),
      distribuidor: emptyHourly(),
      eventos: emptyHourly(),
    },
    dailyByCategory: {
      revenda: emptyDaily(),
      distribuidor: emptyDaily(),
      eventos: emptyDaily(),
    },
    last7Days: Array<number>(7).fill(0),
  }
}

/**
 * Fetches aggregated click engagement data from Supabase.
 *
 * Strategy: query raw click_events rows for the current month (bounded date
 * range keeps the result set small — max ~10k rows/month). Aggregate in JS
 * to avoid maintaining a stored procedure. Lifetime totals use a separate
 * count query per category.
 *
 * Must be called from a Server Component or Server Action only.
 * Requires admin RLS policy (SELECT on click_events).
 */
export async function getClickEngagement(): Promise<ClickEngagement> {
  const supabase = await createSupabaseServerClient()

  const now = new Date()
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth() // 0-based

  // First day of current month (UTC)
  const monthStart = new Date(Date.UTC(year, month, 1)).toISOString()
  // First day of next month (exclusive upper bound)
  const monthEnd = new Date(Date.UTC(year, month + 1, 1)).toISOString()

  // Seven days ago (UTC midnight)
  const sevenDaysAgo = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6),
  ).toISOString()

  const result = emptyEngagement()

  // ── 1. Lifetime totals ─────────────────────────────────────────
  // One count query per category keeps the query simple and the result typed.
  await Promise.all(
    CATEGORIES.map(async (cat) => {
      const { count, error } = await supabase
        .from("click_events")
        .select("id", { count: "exact", head: true })
        .eq("category", cat)
      if (!error && count !== null) {
        result.totalByCategory[cat] = count
      }
    }),
  )

  // ── 2. Current-month rows for hourly + daily breakdown ─────────
  const { data: monthRows, error: monthError } = await supabase
    .from("click_events")
    .select("category, created_at")
    .gte("created_at", monthStart)
    .lt("created_at", monthEnd)
    .order("created_at", { ascending: true })

  if (!monthError && monthRows) {
    for (const row of monthRows) {
      const cat = row.category as CTACategoryKey
      if (!CATEGORIES.includes(cat)) continue

      const d = new Date(row.created_at as string)
      const hour = d.getUTCHours() // 0–23
      const day = d.getUTCDate() - 1 // 0-based index for days 1–31

      result.hourlyByCategory[cat][hour] += 1
      result.dailyByCategory[cat][day] += 1
    }
  }

  // ── 3. Last 7 days (all categories combined) ───────────────────
  const { data: recentRows, error: recentError } = await supabase
    .from("click_events")
    .select("created_at")
    .gte("created_at", sevenDaysAgo)
    .order("created_at", { ascending: true })

  if (!recentError && recentRows) {
    const todayUtc = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    )
    for (const row of recentRows) {
      const d = new Date(row.created_at as string)
      const rowDay = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
      // Index 0 = 6 days ago, index 6 = today
      const idx = Math.round((rowDay - (todayUtc - 6 * 86_400_000)) / 86_400_000)
      if (idx >= 0 && idx < 7) {
        result.last7Days[idx] += 1
      }
    }
  }

  return result
}
