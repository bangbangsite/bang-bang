import type { Metadata } from "next"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { OndeEncontrarBody } from "@/components/onde-encontrar/OndeEncontrarBody"
import { getMergedPDVs } from "@/lib/pdvs/server"

export const metadata: Metadata = {
  title: "Onde encontrar Bang Bang — PDVs parceiros",
  description:
    "Ache o bar, mercado ou distribuidora Bang Bang mais perto de você. Busca por CEP, cidade ou estado. Ainda não tem aí? Peça a cidade.",
  openGraph: {
    title: "Onde encontrar Bang Bang",
    description:
      "Ache o PDV Bang Bang mais perto. Busca por CEP, cidade, estado — ou indique sua cidade pra chegar aí.",
  },
}

export default async function OndeEncontrarPage() {
  const { pdvs, activeUfs } = await getMergedPDVs()

  return (
    <>
      <Header />
      <main>
        <OndeEncontrarBody pdvs={pdvs} activeUfs={activeUfs} />
      </main>
      <Footer />
    </>
  )
}
