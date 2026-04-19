"use client"

import { useActionState, useState } from "react"
import { loginAction, type LoginState } from "./actions"

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  )
}

const INITIAL_STATE: LoginState = { error: null }

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL_STATE)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form
      action={formAction}
      className="w-full rounded-3xl bg-white text-[#2D1810] p-8 md:p-10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col gap-5"
      noValidate
    >
      <div className="flex flex-col items-center text-center gap-3">
        <span className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.28em] uppercase px-3 py-1.5 rounded-full border border-[#E87A1E]/35 bg-[#E87A1E]/5 text-[#E87A1E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E87A1E] shadow-[0_0_8px_#E87A1E]" />
          Área restrita
        </span>
        <h1
          className="font-black uppercase leading-tight tracking-tight text-[#1A1A1A] text-2xl md:text-3xl"
          style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
        >
          Acesso staff
        </h1>
        <p className="text-[#4A2C1A]/70 text-sm">
          Login exclusivo da equipe Bang Bang.
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-email"
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4A2C1A]/70"
          >
            E-mail
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="voce@bangbang.com.br"
            disabled={pending}
            className="h-11 px-4 rounded-xl border-2 border-[#4A2C1A]/15 bg-white text-[#2D1810] placeholder:text-[#4A2C1A]/40 text-base focus:border-[#E87A1E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]/40 disabled:opacity-60 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-password"
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4A2C1A]/70"
          >
            Senha
          </label>
          <div className="relative flex items-center">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              disabled={pending}
              className="w-full h-11 pl-4 pr-11 rounded-xl border-2 border-[#4A2C1A]/15 bg-white text-[#2D1810] placeholder:text-[#4A2C1A]/40 text-base focus:border-[#E87A1E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]/40 disabled:opacity-60 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              className="absolute right-2 w-8 h-8 flex items-center justify-center rounded-md text-[#4A2C1A]/60 hover:text-[#2D1810] hover:bg-[#4A2C1A]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]"
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>
      </div>

      {state.error && (
        <div
          role="alert"
          className="rounded-xl px-4 py-3 text-sm bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B]"
        >
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg font-bold text-sm tracking-[0.08em] uppercase bg-[#E87A1E] text-white hover:bg-[#C4650F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] focus-visible:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Verificando…" : "Entrar"}
      </button>

      <p className="text-center text-xs text-[#4A2C1A]/50">
        Problemas pra entrar?{" "}
        <a
          href="#"
          className="font-semibold text-[#E87A1E] hover:text-[#C4650F] underline underline-offset-2"
        >
          Fale com o administrador
        </a>
      </p>
    </form>
  )
}
