import { createSupabaseServerClient } from "@/lib/supabase/server"
import { DEFAULT_FAQ, MAX_FAQ_ITEMS, type FAQItem } from "./config"

/** Fetch all FAQ items ordered by position. Falls back to defaults on error. */
export async function getFaqItems(): Promise<FAQItem[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (
    !url ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    url.includes("127.0.0.1") ||
    url.includes("localhost")
  ) {
    return DEFAULT_FAQ
  }
  try {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
      .from("faq_items")
      .select("id, question, answer, position, updated_at")
      .order("position", { ascending: true })
      .limit(MAX_FAQ_ITEMS)

    if (error || !data || data.length === 0) return DEFAULT_FAQ

    return data.map((row) => ({
      id: row.id as string,
      question: row.question as string,
      answer: row.answer as string,
      position: row.position as number,
    }))
  } catch {
    return DEFAULT_FAQ
  }
}
