"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Trash2 } from "lucide-react"
import { clearAllDemoData, DEMO_STORAGE_KEYS } from "@/lib/demo/reset"

// "Danger zone" card. Staff-only gate — removes every localStorage key the
// site owns (PDV overrides, contacts, clicks, wishlist, events, bangers,
// FAQ). Auth cookies live outside localStorage so the admin isn't kicked out.
//
// Flow is 2-step (click → confirm) so a stray click can't nuke the data
// by accident. Confirm state auto-dismisses after 4s, matching the pattern
// used elsewhere in the dashboard (ver CTAEngagement).
//
// After the Supabase migration, swap the onClick body for a server action
// that truncates the corresponding tables under an admin-only RLS policy.

export function ResetDemoDataCard() {
  const [confirming, setConfirming] = useState(false)
  const [doneAt, setDoneAt] = useState<number | null>(null)

  useEffect(() => {
    if (!confirming) return
    const t = setTimeout(() => setConfirming(false), 4000)
    return () => clearTimeout(t)
  }, [confirming])

  const handleClick = () => {
    if (!confirming) {
      setConfirming(true)
      return
    }
    clearAllDemoData()
    setConfirming(false)
    setDoneAt(Date.now())
    // Full reload so demo-seed flags kick back in and the dashboard rebuilds
    // from scratch with the freshly empty stores.
    setTimeout(() => window.location.reload(), 400)
  }

  return (
    <section className="rounded-2xl bg-white border border-[#D32F2F]/20 p-5 md:p-6">
      <header className="flex items-start gap-3 mb-3">
        <span className="shrink-0 w-9 h-9 rounded-lg bg-[#D32F2F]/10 text-[#D32F2F] flex items-center justify-center">
          <AlertTriangle size={16} strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black tracking-[0.28em] uppercase text-[#D32F2F]">
            Zona de perigo
          </p>
          <h2
            className="font-black uppercase text-[#1A1A1A] text-lg md:text-xl tracking-tight mt-0.5"
            style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
          >
            Zerar dados de teste
          </h2>
        </div>
      </header>

      <p className="text-[13px] text-[#4A2C1A]/75 leading-relaxed mb-4">
        Remove <strong>tudo</strong> o que foi cadastrado até aqui —
        solicitações, eventos, bangers, FAQ, canais de WhatsApp, cliques nos
        CTAs, overrides de PDV. Usado quando a Bang Bang for pro ar de
        verdade, pra limpar o ambiente antes dos dados reais entrarem. Sua
        sessão staff é preservada.
      </p>

      <details className="mb-4 text-[12px] text-[#4A2C1A]/60">
        <summary className="cursor-pointer select-none hover:text-[#2D1810] transition-colors">
          Ver o que será apagado ({DEMO_STORAGE_KEYS.length} chaves)
        </summary>
        <ul className="mt-2 pl-4 flex flex-col gap-0.5 font-mono text-[11px] text-[#4A2C1A]/55">
          {DEMO_STORAGE_KEYS.map((k) => (
            <li key={k}>· {k}</li>
          ))}
        </ul>
      </details>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleClick}
          className={
            confirming
              ? "inline-flex items-center gap-2 h-10 px-4 rounded-md bg-[#D32F2F] text-white text-xs font-black tracking-[0.18em] uppercase hover:bg-[#B71C1C] transition-colors"
              : "inline-flex items-center gap-2 h-10 px-4 rounded-md border border-[#D32F2F]/40 text-[#D32F2F] text-xs font-black tracking-[0.18em] uppercase hover:bg-[#D32F2F]/5 transition-colors"
          }
        >
          <Trash2 size={14} strokeWidth={2.4} />
          {confirming ? "Confirmar — isto é irreversível" : "Zerar tudo"}
        </button>
        {confirming && (
          <span className="text-[11px] text-[#D32F2F] font-semibold">
            Clique novamente em até 4s pra confirmar
          </span>
        )}
        {doneAt && !confirming && (
          <span className="text-[11px] text-[#4A2C1A]/60 font-semibold">
            Limpo. Recarregando…
          </span>
        )}
      </div>
    </section>
  )
}
