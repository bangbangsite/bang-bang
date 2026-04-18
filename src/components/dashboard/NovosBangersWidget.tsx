"use client"

import Link from "next/link"
import { Users, ArrowUpRight, Star, Sparkles } from "lucide-react"
import { useBangers } from "@/lib/bangers/useBangers"
import {
  BANGER_NICHE_LABEL,
  formatFollowers,
  parseFollowers,
  type BangerApplication,
} from "@/lib/bangers/config"

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return "agora"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}min`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`
  const days = Math.floor(diff / 86_400_000)
  return `${days}d`
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return (parts[0][0] ?? "?").toUpperCase()
  return ((parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")).toUpperCase()
}

/**
 * Compact widget on the dashboard home — surfaces the 4 most recent banger
 * applications with status "novo" so staff can triage quickly without leaving
 * the home screen.
 */
export function NovosBangersWidget() {
  const { applications, novosCount } = useBangers()
  const novosTop4 = applications
    .filter((a) => a.status === "novo")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4)

  return (
    <section
      aria-labelledby="novos-bangers-title"
      className="rounded-2xl bg-white border border-[#4A2C1A]/8 p-5 md:p-6 flex flex-col"
    >
      <header className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.22em] uppercase text-[#E87A1E] mb-1.5">
            <Sparkles size={12} strokeWidth={2.5} />
            Novos candidatos
          </div>
          <h2
            id="novos-bangers-title"
            className="font-black uppercase text-[#1A1A1A] text-lg md:text-xl tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
          >
            Bangers pra triagem
          </h2>
          <p className="text-[11px] text-[#4A2C1A]/55 mt-1">
            {novosCount === 0
              ? "Sem aplicações pendentes"
              : `${novosCount} ${novosCount === 1 ? "candidato" : "candidatos"} aguardando resposta`}
          </p>
        </div>
        <Link
          href="/dashboard/bangers"
          className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-[#E87A1E] hover:text-[#C4650F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] rounded"
        >
          Ver todos
          <ArrowUpRight size={12} strokeWidth={2.5} />
        </Link>
      </header>

      {novosTop4.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#E87A1E] flex items-center justify-center text-white">
            <Users size={16} strokeWidth={2.2} />
          </div>
          <p className="text-sm font-semibold text-[#4A2C1A]/70">
            {applications.length === 0 ? "Sem candidatos ainda" : "Tudo respondido"}
          </p>
          <p className="text-xs text-[#4A2C1A]/50 max-w-xs leading-relaxed">
            {applications.length === 0
              ? 'Quando alguém preencher "Quero ser Banger", aparece aqui.'
              : "Nenhum candidato pendente. Bom trabalho."}
          </p>
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {novosTop4.map((a) => (
            <BangerRow key={a.id} application={a} />
          ))}
        </ol>
      )}
    </section>
  )
}

function BangerRow({ application }: { application: BangerApplication }) {
  const a = application
  const totalReach = a.redes.reduce((sum, r) => sum + parseFollowers(r.seguidores), 0)
  const principalRede = a.redes[0]

  return (
    <li>
      <Link
        href="/dashboard/bangers"
        className="relative flex items-center gap-3 p-2.5 rounded-xl bg-[#FAFAF8] border border-[#4A2C1A]/8 hover:border-[#E87A1E]/40 hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]"
      >
        {/* Initials avatar */}
        <div className="w-10 h-10 rounded-full bg-[#E87A1E] text-white flex items-center justify-center shrink-0 font-black text-[13px] tracking-tight">
          {initials(a.nome)}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3
              className="font-black uppercase text-[#1A1A1A] text-[13px] leading-tight tracking-tight truncate"
              style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
            >
              {a.nome}
            </h3>
            {a.favorito && (
              <Star
                size={10}
                strokeWidth={2.4}
                className="text-[#E87A1E] fill-[#E87A1E] shrink-0"
                aria-label="Favorito"
              />
            )}
          </div>
          <p className="text-[11px] text-[#4A2C1A]/65 truncate">
            {BANGER_NICHE_LABEL[a.nicho]}
            {a.cidade && (
              <>
                {" · "}
                {a.cidade}
                {a.uf && `/${a.uf}`}
              </>
            )}
          </p>
          {principalRede && (
            <p className="text-[11px] text-[#4A2C1A]/55 truncate font-mono">
              {principalRede.handle}
              {principalRede.seguidores && (
                <span className="font-sans text-[#4A2C1A]/45"> · {principalRede.seguidores}</span>
              )}
            </p>
          )}
        </div>

        {/* Right meta — total reach + relative time */}
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          {totalReach > 0 && (
            <span
              className="text-[12px] font-black text-[#C4650F] tabular-nums leading-none"
              style={{ fontFamily: "var(--font-heading-var)" }}
            >
              {formatFollowers(totalReach)}
            </span>
          )}
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#4A2C1A]/45 tabular-nums">
            há {formatRelative(a.createdAt)}
          </span>
        </div>
      </Link>
    </li>
  )
}
