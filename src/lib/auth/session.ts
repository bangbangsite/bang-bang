/**
 * Client-side session shim for the staff area.
 *
 * This is a prototype: the "session" is just a boolean flag in localStorage.
 * No real auth. Replace with a server-signed cookie + middleware protection
 * before production.
 */

const KEY = "bb_staff_session_v1"

export interface StaffSession {
  /** Timestamp (ms) when the session was issued. */
  at: number
}

export function setSession(): void {
  if (typeof window === "undefined") return
  try {
    const payload: StaffSession = { at: Date.now() }
    window.localStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    /* ignore — storage blocked or full */
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

export function readSession(): StaffSession | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StaffSession>
    if (typeof parsed?.at !== "number") return null
    return { at: parsed.at }
  } catch {
    return null
  }
}

export function hasSession(): boolean {
  return readSession() !== null
}
