import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "transition-all duration-150 hover:scale-[1.02] font-semibold inline-flex items-center gap-2 cursor-pointer outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]",
  {
    variants: {
      variant: {
        primary:   "bg-[#E87A1E] text-white hover:bg-[#C4650F] focus-visible:ring-[#E87A1E]",
        secondary: "bg-[#4CAF50] text-white hover:bg-[#3d9140] focus-visible:ring-[#4CAF50]",
        outline:   "border-2 border-[#E87A1E] text-[#E87A1E] bg-transparent hover:bg-[#E87A1E] hover:text-white focus-visible:ring-[#E87A1E]",
        whatsapp:  "bg-[#25D366] text-white hover:bg-[#1ea854] focus-visible:ring-[#25D366]",
        ghost:     "bg-transparent text-current hover:bg-black/10 focus-visible:ring-current",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-[8px]",
        md: "h-11 px-6 text-base rounded-[8px]",
        lg: "h-14 px-8 text-lg rounded-[8px] font-bold",
      },
      fullWidth: {
        true: "w-full justify-center",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

// Shared event type so callers can use the same onClick signature for both
// the button and anchor forms.
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
  const content = (
    <>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </>
  )

  if (href) {
    // External link autodetection — wa.me, mailto, https all get target=_blank
    // unless the caller explicitly overrides.
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
