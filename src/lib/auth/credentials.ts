/**
 * PLACEHOLDER AUTH — for the staff login prototype only.
 *
 * These credentials are bundled into the client. Anyone who views the network
 * requests or source code can read them. That's acceptable for this phase
 * (fake login gating a future staff area), but BEFORE any real deploy:
 *
 *   - Move validation to a server action / API route.
 *   - Store the password hash (not the plain value) in a secret store.
 *   - Issue a signed session cookie, and protect staff routes with middleware.
 *
 * Until then, edit the values below to change the test account.
 */

const STAFF_EMAIL = "staff@bangbang.com.br"
const STAFF_PASSWORD = "bangbang2026"

export function validateCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === STAFF_EMAIL &&
    password === STAFF_PASSWORD
  )
}
