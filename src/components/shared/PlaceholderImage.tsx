import { cn } from "@/lib/utils"

type FlavorKey = "caipi" | "mule" | "spritz" | "bang" | "neutral"

interface PlaceholderImageProps {
  label?: string
  aspectRatio?: string
  className?: string
  flavor?: FlavorKey
}

const flavorStyles: Record<FlavorKey, { bg: string; border: string; text: string }> = {
  caipi:   { bg: "bg-[#E8F5E9]", border: "border-[#4CAF50]", text: "text-[#4CAF50]" },
  mule:    { bg: "bg-[#F5E6D0]", border: "border-[#8B5E3C]", text: "text-[#8B5E3C]" },
  spritz:  { bg: "bg-[#FFF8F0]", border: "border-[#C49A6C]", text: "text-[#C49A6C]" },
  bang:    { bg: "bg-[#FFF0E6]", border: "border-[#E85D10]", text: "text-[#E85D10]" },
  neutral: { bg: "bg-[#F5E6D0]", border: "border-[#4A2C1A]", text: "text-[#4A2C1A]" },
}

export function PlaceholderImage({
  label,
  aspectRatio = "1/1",
  className,
  flavor = "neutral",
}: PlaceholderImageProps) {
  const styles = flavorStyles[flavor]

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border-2 border-dashed rounded-lg",
        styles.bg,
        styles.border,
        className
      )}
      style={{ aspectRatio }}
    >
      {/* Camera icon placeholder */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("mb-2 opacity-50", styles.text)}
        aria-hidden="true"
      >
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
      </svg>

      <p className={cn("text-xs font-body font-medium text-center px-2", styles.text)}>
        {label ? `Imagem pendente: ${label}` : "Imagem pendente"}
      </p>
    </div>
  )
}
