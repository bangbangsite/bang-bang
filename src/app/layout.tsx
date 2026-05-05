import type { Metadata } from "next";
import { Inter, Oswald, Permanent_Marker, Bebas_Neue } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-heading-var",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const permanentMarker = Permanent_Marker({
  subsets: ["latin"],
  variable: "--font-accent-var",
  display: "swap",
  weight: "400",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-display-var",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bebabangbang.com.br"),
  title: "Bang Bang — A bebida que não espera a festa começar",
  description:
    "Bang Bang é a marca de drinks prontos que conquista o Brasil cidade por cidade. 4 sabores com atitude. Quer revender? Fale com a gente.",
  keywords: [
    "bang bang",
    "drink pronto",
    "RTD",
    "bebida pronta",
    "revenda bebidas",
    "distribuidor bebidas",
    "drink pronto alcoólico",
  ],
  authors: [{ name: "Bang Bang" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Bang Bang — A bebida que não espera a festa começar",
    description:
      "4 sabores com atitude. Drinks prontos para seu bar, restaurante ou evento. Fale com nosso comercial.",
    siteName: "Bang Bang",
    locale: "pt_BR",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Bang Bang — Drinks prontos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bang Bang — A bebida que não espera a festa começar",
    description: "4 sabores com atitude. Drinks prontos para seu negócio.",
    images: ["/og-image.jpg"],
  },
};

// JSON-LD Schema
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Bang Bang",
  description:
    "Marca de bebidas prontas (RTD) que conquista o Brasil cidade por cidade.",
  url: "https://bebabangbang.com.br",
  logo: "https://bebabangbang.com.br/logo.png",
  sameAs: ["https://www.instagram.com/bebabangbang"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    availableLanguage: "Portuguese",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${oswald.variable} ${permanentMarker.variable} ${bebasNeue.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
