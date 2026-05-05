import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// ============================================================================
// Button — DS validated (Bang Bang Boom DS v0)
// Source: https://design-system-bang.vercel.app/ — section "Botões"
//
// Variants map directly to the DS catalog:
//   primary  → "Compre Agora"  (Brand Amber, white text, dark stroke)
//   dark     → "Ver Sabores"   (Espresso/Brand Dark, white text)
//   outline  → "Onde Comprar"  (White bg, Brand Dark border + text)
//   ghost    → "Saiba Mais"    (White bg, hairline border, Brand Dark text)
//   whatsapp → conversion CTA  (kept for WhatsApp links)
//   secondary → legacy alias mapped to `dark` for backwards-compat with callers
//
// Sizes mirror the DS three-step scale: Pequeno · Padrão · Grande.
// All buttons use Bebas Neue uppercase to match the DS display style.
// ============================================================================

const buttonVariants = cva(
  [
    "transition-all duration-150 inline-flex items-center justify-center gap-2 cursor-pointer select-none",
    "uppercase tracking-[0.12em] whitespace-nowrap",
    "outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5ECD7]",
    "active:translate-y-0 hover:-translate-y-px",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-[#C07828] text-white border border-[#2C1505] shadow-[0_8px_20px_-8px_rgba(192,120,40,0.55)] hover:bg-[#A06230] hover:shadow-[0_12px_24px_-10px_rgba(160,98,48,0.7)] focus-visible:ring-[#C8902C]",
        dark:
          "bg-[#270C08] text-white border border-[#270C08] shadow-[0_8px_20px_-10px_rgba(39,12,8,0.6)] hover:bg-[#2C1505] hover:border-[#2C1505] focus-visible:ring-[#C8902C]",
        secondary:
          "bg-[#270C08] text-white border border-[#270C08] shadow-[0_8px_20px_-10px_rgba(39,12,8,0.6)] hover:bg-[#2C1505] focus-visible:ring-[#C8902C]",
        outline:
          "bg-white text-[#2C1505] border border-[#2C1505] hover:bg-[#F5ECD7] focus-visible:ring-[#C07828]",
        ghost:
          "bg-white text-[#2C1505] border border-[#2C1505]/15 hover:border-[#2C1505]/40 hover:bg-[#F5ECD7]/60 focus-visible:ring-[#C07828]",
        whatsapp:
          "bg-[#25D366] text-white border border-[#1ea854]/40 shadow-[0_8px_20px_-8px_rgba(37,211,102,0.55)] hover:bg-[#1ea854] focus-visible:ring-[#25D366]",
      },
      size: {
        // Pequeno
        sm: "h-10 px-4 text-[12px] rounded-lg",
        // Padrão
        md: "h-12 px-6 text-[13px] rounded-lg",
        // Grande
        lg: "h-14 px-8 text-[15px] rounded-lg",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
)

type ClickHandler = (
  e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
) => void

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode
  fullWidth?: boolean
  href?: string
  target?: React.HTMLAttributeAnchorTarget
  rel?: string
  onClick?: ClickHandler
  className?: string
  children?: React.ReactNode
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  "aria-label"?: string
}

export function Button({
  variant,
  size,
  fullWidth,
  icon,
  href,
  target,
  rel,
  onClick,
  children,
  className,
  disabled,
  type,
  "aria-label": ariaLabel,
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, fullWidth }), className)
  // DS button labels use Bebas Neue display; loaded via --font-display-var.
  const labelStyle = { fontFamily: "var(--font-display-var)", fontWeight: 400 }
  const content = (
    <>
      {icon && <span className="shrink-0">{icon}</span>}
      <span style={labelStyle}>{children}</span>
    </>
  )

  if (href) {
    const isExternal =
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    return (
      <a
        href={href}
        className={classes}
        onClick={onClick}
        target={target ?? (isExternal ? "_blank" : undefined)}
        rel={rel ?? (isExternal ? "noopener noreferrer" : undefined)}
        aria-label={ariaLabel}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      type={type ?? "button"}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  )
}
