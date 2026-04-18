"use client"

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption<V extends string> {
  value: V
  label: string
  /** Secondary text shown right-aligned inside the option (e.g. counts). */
  hint?: string
  disabled?: boolean
}

interface SelectProps<V extends string> {
  id?: string
  value: V
  onChange: (value: V) => void
  options: SelectOption<V>[]
  /** Shown as the trigger label when `value` doesn't match any option. */
  placeholder?: string
  /** Icon rendered on the left side of the trigger (before the label). */
  leftIcon?: ReactNode
  /** Visual size — md is the default and matches other inputs on the site. */
  size?: "sm" | "md"
  /** Visual theme. `dark` renders a dark-glass trigger (for use on dark
   *  surfaces like the Banger page). The popup menu stays on a light paper
   *  background either way so legibility is consistent. */
  variant?: "light" | "dark"
  /** Highlights the trigger like the active-filter chip pattern. */
  active?: boolean
  className?: string
  /** Min width for the popup menu. Defaults to the trigger width. */
  menuMinWidth?: number
  "aria-label"?: string
}

const TRIGGER_SIZES = {
  sm: "h-9 pl-3 pr-9 text-[13px] rounded-lg",
  md: "h-11 pl-3.5 pr-10 text-sm rounded-xl",
} as const

/**
 * Custom select with a branded popup — replaces native <select> so the
 * dropdown shares the rounded / warm aesthetic used across the site.
 * Keyboard-nav, screen-reader and click-outside support included.
 */
export function Select<V extends string>({
  id,
  value,
  onChange,
  options,
  placeholder = "Selecionar",
  leftIcon,
  size = "md",
  variant = "light",
  active,
  className,
  menuMinWidth,
  "aria-label": ariaLabel,
}: SelectProps<V>) {
  const autoId = useId()
  const listId = `${id ?? autoId}-list`
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)
  const triggerLabel = selected?.label ?? placeholder

  // Open the menu and seed highlight with the current selection in one go,
  // so we don't need a setState-in-effect to keep them synced.
  const openMenu = useCallback(() => {
    const idx = options.findIndex((o) => o.value === value)
    setHighlight(idx >= 0 ? idx : 0)
    setOpen(true)
  }, [options, value])

  // Close on outside click and on Escape
  useEffect(() => {
    if (!open) return
    const handlePointer = (e: MouseEvent) => {
      const t = e.target as Node
      if (
        !triggerRef.current?.contains(t) &&
        !menuRef.current?.contains(t)
      ) {
        setOpen(false)
      }
    }
    const handleKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener("mousedown", handlePointer)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handlePointer)
      document.removeEventListener("keydown", handleKey)
    }
  }, [open])

  // Ensure highlighted item is visible inside the menu when navigating.
  useEffect(() => {
    if (!open) return
    const menu = menuRef.current
    if (!menu) return
    const el = menu.querySelector<HTMLElement>(`[data-idx="${highlight}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [highlight, open])

  const commit = useCallback(
    (next: V) => {
      onChange(next)
      setOpen(false)
      // Return focus to the trigger so keyboard flow stays predictable.
      triggerRef.current?.focus()
    },
    [onChange],
  )

  const moveHighlight = useCallback(
    (delta: number) => {
      setHighlight((prev) => {
        const n = options.length
        let i = prev
        for (let step = 0; step < n; step++) {
          i = (i + delta + n) % n
          if (!options[i].disabled) return i
        }
        return prev
      })
    },
    [options],
  )

  const handleTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      if (!open) {
        openMenu()
        return
      }
      moveHighlight(e.key === "ArrowDown" ? 1 : -1)
    } else if (e.key === "Enter" || e.key === " ") {
      if (open) {
        e.preventDefault()
        const opt = options[highlight]
        if (opt && !opt.disabled) commit(opt.value)
      } else {
        e.preventDefault()
        openMenu()
      }
    } else if (e.key === "Home") {
      if (open) {
        e.preventDefault()
        setHighlight(0)
      }
    } else if (e.key === "End") {
      if (open) {
        e.preventDefault()
        setHighlight(options.length - 1)
      }
    }
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleTriggerKey}
        className={cn(
          "w-full inline-flex items-center gap-2 border cursor-pointer transition-all",
          "focus:outline-none focus-visible:outline-none",
          TRIGGER_SIZES[size],
          variant === "dark"
            ? cn(
                "bg-white/[0.04] text-white hover:border-white/35",
                "focus-visible:ring-2 focus-visible:ring-[#d4ff4d]/50",
                active
                  ? "border-[#d4ff4d] text-[#d4ff4d] font-semibold bg-[#d4ff4d]/[0.08]"
                  : "border-white/15",
                open && "border-[#d4ff4d] ring-2 ring-[#d4ff4d]/30 bg-white/[0.06]",
              )
            : cn(
                "bg-white text-[#2D1810] hover:border-[#E87A1E]/60",
                "focus-visible:ring-2 focus-visible:ring-[#E87A1E]/40",
                active
                  ? "border-[#E87A1E] text-[#C4650F] font-semibold bg-[#E87A1E]/5"
                  : "border-[#4A2C1A]/15",
                open && "border-[#E87A1E] ring-2 ring-[#E87A1E]/40",
              ),
        )}
      >
        {leftIcon && (
          <span
            className={cn(
              "shrink-0 flex items-center",
              variant === "dark" ? "text-white/55" : "text-[#4A2C1A]/50",
            )}
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}
        <span className="truncate text-left flex-1">{triggerLabel}</span>
        <ChevronDown
          size={size === "sm" ? 13 : 15}
          strokeWidth={2.4}
          aria-hidden="true"
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 transition-transform",
            variant === "dark"
              ? cn("text-white/60", open && "rotate-180 text-[#d4ff4d]")
              : cn("text-[#4A2C1A]/55", open && "rotate-180 text-[#E87A1E]"),
          )}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="listbox"
          id={listId}
          aria-activedescendant={`${listId}-${highlight}`}
          tabIndex={-1}
          style={menuMinWidth ? { minWidth: menuMinWidth } : undefined}
          className={cn(
            "absolute z-50 left-0 top-full mt-2 min-w-full",
            "rounded-xl bg-white border border-[#4A2C1A]/15",
            "shadow-[0_20px_50px_-20px_rgba(45,24,16,0.35)]",
            "max-h-72 overflow-y-auto py-1.5",
            "animate-[fade-slide-down_120ms_ease-out]",
          )}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value
            const isActive = i === highlight
            return (
              <button
                key={opt.value}
                id={`${listId}-${i}`}
                data-idx={i}
                type="button"
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled || undefined}
                disabled={opt.disabled}
                onMouseEnter={() => !opt.disabled && setHighlight(i)}
                onClick={() => !opt.disabled && commit(opt.value)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                  opt.disabled
                    ? "text-[#4A2C1A]/30 cursor-not-allowed"
                    : isActive
                      ? "bg-[#E87A1E]/10 text-[#2D1810]"
                      : isSelected
                        ? "text-[#C4650F] font-semibold"
                        : "text-[#2D1810]",
                )}
              >
                <span
                  className={cn(
                    "w-4 shrink-0 flex items-center justify-center text-[#E87A1E]",
                    isSelected ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden="true"
                >
                  <Check size={13} strokeWidth={2.6} />
                </span>
                <span className="flex-1 truncate">{opt.label}</span>
                {opt.hint && (
                  <span
                    className={cn(
                      "text-[11px] tabular-nums shrink-0",
                      isActive || isSelected ? "text-[#4A2C1A]/70" : "text-[#4A2C1A]/45",
                    )}
                  >
                    {opt.hint}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
