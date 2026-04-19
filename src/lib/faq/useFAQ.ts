"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  addFaqItem,
  updateFaqItem,
  removeFaqItem,
  swapFaqPositions,
  resetFaqToDefaults,
} from "./actions"
import { DEFAULT_FAQ, MAX_FAQ_ITEMS, type FAQItem } from "./config"

// Fetch items sorted by position from the browser client.
async function fetchItems(): Promise<FAQItem[]> {
  const supabase = createSupabaseBrowserClient()
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
}

export interface UseFAQApi {
  items: FAQItem[]
  loading: boolean
  count: number
  max: number
  canAdd: boolean
  /** ISO timestamp of the most recent updated_at among fetched rows, or null. */
  updatedAt: string | null
  addItem: (input: Omit<FAQItem, "id" | "position">) => Promise<void>
  updateItem: (id: string, patch: Partial<Pick<FAQItem, "question" | "answer">>) => Promise<void>
  removeItem: (id: string) => Promise<void>
  moveUp: (id: string) => Promise<void>
  moveDown: (id: string) => Promise<void>
  reset: () => Promise<void>
}

export function useFAQ(): UseFAQApi {
  const [items, setItems] = useState<FAQItem[]>(DEFAULT_FAQ)
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const reload = useCallback(async () => {
    const fetched = await fetchItems()
    setItems(fetched)
    setLoading(false)

    // Also read updated_at directly for the subtitle label.
    const supabase = createSupabaseBrowserClient()
    const { data } = await supabase
      .from("faq_items")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (data) setUpdatedAt(data.updated_at as string)
  }, [])

  useEffect(() => {
    // Syncing external (Supabase) state into React state on mount — exactly
    // what useEffect is for; the lint rule is overly conservative here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload()
  }, [reload])

  const addItem = useCallback(
    async (input: Omit<FAQItem, "id" | "position">) => {
      startTransition(async () => {
        await addFaqItem(input)
        await reload()
      })
    },
    [reload],
  )

  const updateItem = useCallback(
    async (id: string, patch: Partial<Pick<FAQItem, "question" | "answer">>) => {
      startTransition(async () => {
        await updateFaqItem(id, patch)
        await reload()
      })
    },
    [reload],
  )

  const removeItem = useCallback(
    async (id: string) => {
      startTransition(async () => {
        await removeFaqItem(id)
        await reload()
      })
    },
    [reload],
  )

  const moveUp = useCallback(
    async (id: string) => {
      const idx = items.findIndex((it) => it.id === id)
      if (idx <= 0) return
      const prev = items[idx - 1]
      startTransition(async () => {
        await swapFaqPositions(id, prev.id)
        await reload()
      })
    },
    [items, reload],
  )

  const moveDown = useCallback(
    async (id: string) => {
      const idx = items.findIndex((it) => it.id === id)
      if (idx < 0 || idx >= items.length - 1) return
      const next = items[idx + 1]
      startTransition(async () => {
        await swapFaqPositions(id, next.id)
        await reload()
      })
    },
    [items, reload],
  )

  const reset = useCallback(async () => {
    startTransition(async () => {
      await resetFaqToDefaults()
      await reload()
    })
  }, [reload])

  return {
    items,
    loading,
    count: items.length,
    max: MAX_FAQ_ITEMS,
    canAdd: items.length < MAX_FAQ_ITEMS,
    updatedAt,
    addItem,
    updateItem,
    removeItem,
    moveUp,
    moveDown,
    reset,
  }
}
