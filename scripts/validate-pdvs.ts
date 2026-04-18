/**
 * Fast pre-build check. Doesn't touch network. Verifies that
 * src/data/pdvs.json, src/data/pdvs-active-ufs.json and src/data/pdvs-meta.json
 * exist and are well-formed. If missing, instructs to run `npm run pdvs:refresh`.
 *
 * Runs in the `prebuild` npm hook so production builds are fast.
 */
import * as fs from "node:fs"
import * as path from "node:path"

const ROOT = path.resolve(__dirname, "..")
const OUT_DIR = path.join(ROOT, "src", "data")

const REQUIRED = [
  { file: "pdvs.json", minLen: 1 },
  { file: "pdvs-active-ufs.json", minLen: 1 },
  { file: "pdvs-meta.json", minLen: 0 },
] as const

let ok = true
for (const { file, minLen } of REQUIRED) {
  const full = path.join(OUT_DIR, file)
  if (!fs.existsSync(full)) {
    console.error(`[validate-pdvs] ✗ missing: ${path.relative(ROOT, full)}`)
    ok = false
    continue
  }
  try {
    const raw = fs.readFileSync(full, "utf8")
    const parsed = JSON.parse(raw)
    const len = Array.isArray(parsed)
      ? parsed.length
      : typeof parsed === "object" && parsed !== null
      ? Object.keys(parsed).length
      : 0
    if (len < minLen) {
      console.error(`[validate-pdvs] ✗ ${file} empty or malformed`)
      ok = false
    } else {
      console.log(`[validate-pdvs] ✓ ${file} (${len} entries)`)
    }
  } catch (err) {
    console.error(`[validate-pdvs] ✗ invalid JSON: ${file}`, err)
    ok = false
  }
}

if (!ok) {
  console.error(
    "\n[validate-pdvs] dados ausentes/inválidos. Rode:\n  npm run pdvs:refresh\n",
  )
  process.exit(1)
}
