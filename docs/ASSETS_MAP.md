# Bang Bang — Mapa de Assets Visuais
## Inventário de imagens, ícones e assets do projeto | v1.0

> Status: ✅ Disponível | 🔲 Placeholder | ❌ Precisa produzir
> Path base: /public/images/

---

## Latas dos Produtos

| Asset | Arquivo | Status | Notas |
|-------|---------|--------|-------|
| Caipi Vodka 3 Limões | `/images/latas/caipi.png` | 🔲 | Precisa recorte PNG sem fundo, min 800px height |
| Moscow Mule | `/images/latas/mule.png` | 🔲 | Idem |
| 40+3 Spritz | `/images/latas/spritz.png` | 🔲 | Idem |
| Whisky + Energy | `/images/latas/bang.png` | 🔲 | Idem |
| Composição 4 latas | `/images/latas/hero-group.png` | 🔲 | 4 latas juntas para o hero, PNG sem fundo |

**Quem produz:** Elder (recorte e tratamento)
**Fonte:** Fotos das latas no Drive do cliente ou packshot profissional

---

## Logo e Marca

| Asset | Arquivo | Status | Notas |
|-------|---------|--------|-------|
| Logo Bang Bang (branco) | `/images/logo/logo-white.svg` | 🔲 | SVG para header transparente |
| Logo Bang Bang (escuro) | `/images/logo/logo-dark.svg` | 🔲 | SVG para fundos claros |
| Logo Bang Bang (laranja) | `/images/logo/logo-orange.svg` | 🔲 | SVG para footer |
| Elemento BOOM | `/images/logo/boom.svg` | 🔲 | Estrela de impacto, SVG |
| Selo "Beba Trincando" | `/images/logo/selo.svg` | 🔲 | SVG para uso decorativo |

**Quem produz:** Elder (exportar dos arquivos master)

---

## Elementos Decorativos

| Asset | Arquivo | Status | Notas |
|-------|---------|--------|-------|
| Chapéu cowboy | `/images/decorative/chapeu.png` | 🔲 | PNG sem fundo, para FloatingElement |
| Estrela xerife | `/images/decorative/estrela.svg` | 🔲 | SVG, colorável via CSS |
| Gelo / ice cube | `/images/decorative/gelo.png` | 🔲 | PNG sem fundo, efeito flutuante |
| Limão fatiado | `/images/decorative/limao.png` | 🔲 | PNG sem fundo |
| Gengibre | `/images/decorative/gengibre.png` | 🔲 | PNG sem fundo |
| Textura western | `/images/decorative/textura-bg.jpg` | 🔲 | JPG para fundos de seção, sutil |

**Quem produz:** Elder/Celina
**Alternativa dev:** Usar emojis ou ícones Lucide como placeholder até assets reais chegarem

---

## Logos de Parceiros

| Asset | Arquivo | Status | Notas |
|-------|---------|--------|-------|
| Farid Supermercados | `/images/parceiros/farid.png` | 🔲 | PNG, fundo transparente, max 200px largura |
| Mercado Espeto Bar | `/images/parceiros/espeto-bar.png` | 🔲 | Idem |
| Bhzão | `/images/parceiros/bhzao.png` | 🔲 | Idem |
| DOS3 Distribuidora | `/images/parceiros/dos3.png` | 🔲 | Idem |
| Granezzo Distribuidora | `/images/parceiros/granezzo.png` | 🔲 | Idem |

**Fonte:** Site atual já tem alguns — extrair e tratar
**Quem produz:** Elder (limpeza e padronização de tamanho)

---

## Fotos Lifestyle (Seção B2C)

| Asset | Arquivo | Status | Notas |
|-------|---------|--------|-------|
| Foto evento 1 | `/images/lifestyle/evento-01.jpg` | 🔲 | Min 1200px largura, real (não banco) |
| Foto evento 2 | `/images/lifestyle/evento-02.jpg` | 🔲 | Idem |
| Foto praia/calor | `/images/lifestyle/praia-01.jpg` | 🔲 | Idem |
| Foto Ricardo (fundador) | `/images/lifestyle/ricardo.jpg` | 🔲 | Retrato autêntico, não posado |

**Fonte:** Acervo do cliente + Instagram @bebabangbang
**Quem produz:** Maria (curadoria) + Elder (tratamento)

---

## Ícones

| Asset | Fonte | Notas |
|-------|-------|-------|
| Ícones de features | Lucide React | Já instalado via shadcn |
| Ícone WhatsApp | Lucide ou SVG custom | Para botão CTA |
| Ícone Instagram | Lucide | Para footer e seção B2C |
| Ícone TikTok | SVG custom | Lucide não tem TikTok |

---

## OG Image (futuro)

| Asset | Arquivo | Status | Notas |
|-------|---------|--------|-------|
| OG Image da home | `/images/og-image.jpg` | ❌ | 1200x630px, fundo escuro, logo + latas |

**Quem produz:** Elder (quando site for ao ar)

---

## Favicon

| Asset | Arquivo | Status | Notas |
|-------|---------|--------|-------|
| Favicon ICO | `/favicon.ico` | 🔲 | Logo Bang Bang em fundo laranja, 32x32 |
| Favicon SVG | `/icon.svg` | 🔲 | SVG colorido |
| Apple Touch Icon | `/apple-touch-icon.png` | 🔲 | 180x180px |

---

## Instruções para o Frontend Dev

Enquanto os assets reais não chegarem:
1. Usar placeholder de cor sólida com o nome do asset como texto
2. Criar componente `PlaceholderImage` que renderiza um div colorido com label
3. Manter os paths corretos — quando o asset real chegar, é só substituir o arquivo
4. Nunca usar imagens de banco de imagens genéricas — preferir placeholder vazio a stock photo

```typescript
// Componente placeholder sugerido
function PlaceholderImage({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn("bg-bb-cream flex items-center justify-center text-bb-brown/40 text-sm font-mono", className)}>
      [{label}]
    </div>
  );
}
```
