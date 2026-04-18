import Image from "next/image"
import logoWhite from "@/../public/images/logo/bang-bang-white.webp"
import logoDark from "@/../public/images/logo/bang-bang-dark.webp"
import { cn } from "@/lib/utils"

// Source aspect — keeps all scaled renders visually identical.
const LOGO_RATIO = 567 / 375

interface LogoProps {
  /** Pick between the white mark (dark bg) and the dark mark (light bg). */
  variant?: "white" | "dark"
  /** Rendered height in pixels. Width is derived from the source aspect. */
  height?: number
  className?: string
  priority?: boolean
  /** For icon-only contexts where surrounding text already names the brand. */
  alt?: string
}

export function Logo({
  variant = "white",
  height = 32,
  className,
  priority = false,
  alt = "Bang Bang",
}: LogoProps) {
  const src = variant === "white" ? logoWhite : logoDark
  const width = Math.round(height * LOGO_RATIO)
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("block", className)}
      style={{ height, width }}
      priority={priority}
      sizes={`${width}px`}
    />
  )
}
