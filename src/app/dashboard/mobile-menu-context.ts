"use client"

import { createContext, useContext } from "react"

// Tiny context that lets a dashboard page open the mobile sidebar from its
// own header (the layout owns the sidebar state, the pages own their headers).
// Lives outside layout.tsx because Next.js App Router layouts can only export
// default + Next-reserved metadata.
export const MobileMenuContext = createContext<{ open: () => void }>({
  open: () => {},
})

export function useMobileMenu() {
  return useContext(MobileMenuContext)
}
