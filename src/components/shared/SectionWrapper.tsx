import { cn } from "@/lib/utils"

type BgVariant = "dark" | "light" | "cream" | "orange" | "custom"
type PaddingVariant = "sm" | "md" | "lg"

interface SectionWrapperProps {
  children: React.ReactNode
  bg?: BgVariant
  customBg?: string
  py?: PaddingVariant
  id?: string
  className?: string
}

const bgMap: Record<Exclude<BgVariant, "custom">, string> = {
  dark:   "bg-[#2D1810] text-[#FAFAF8]",
  light:  "bg-[#FAFAF8] text-[#1A1A1A]",
  cream:  "bg-[#F5E6D0] text-[#1A1A1A]",
  orange: "bg-[#E87A1E] text-white",
}

const paddingMap: Record<PaddingVariant, string> = {
  sm: "py-12 md:py-16",
  md: "py-16 md:py-24",
  lg: "py-20 md:py-32",
}

export function SectionWrapper({
  children,
  bg = "light",
  customBg,
  py = "lg",
  id,
  className,
}: SectionWrapperProps) {
  const bgClass = bg === "custom" ? (customBg ?? "") : bgMap[bg]

  return (
    <section
      id={id}
      className={cn(bgClass, paddingMap[py], className)}
    >
      {children}
    </section>
  )
}
