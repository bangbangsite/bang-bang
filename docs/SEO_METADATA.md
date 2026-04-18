# Bang Bang — SEO & Metadata da Home
## Meta tags, Open Graph e Schema Markup | v1.0

> Estes dados ficam preparados no código para quando o site for ao ar.
> Campos com [DADO] precisam ser preenchidos pelo cliente.

---

## Meta Tags Básicas

```html
<title>Bang Bang — A bebida que não espera a festa começar</title>
<meta name="description" content="Bang Bang é a marca de drinks prontos que conquista o Brasil cidade por cidade. 4 sabores com atitude. Quer revender? Fale com a gente." />
<meta name="keywords" content="bang bang, drink pronto, RTD, bebida pronta, revenda bebidas, distribuidor bebidas, drink pronto alcoólico" />
<meta name="author" content="Bang Bang" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://[DOMINIO]/" />
```

## Open Graph (Facebook / WhatsApp / LinkedIn)

```html
<meta property="og:type" content="website" />
<meta property="og:title" content="Bang Bang — A bebida que não espera a festa começar" />
<meta property="og:description" content="4 sabores com atitude. Drinks prontos para seu bar, restaurante ou evento. Fale com nosso comercial." />
<meta property="og:image" content="https://[DOMINIO]/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://[DOMINIO]/" />
<meta property="og:site_name" content="Bang Bang" />
<meta property="og:locale" content="pt_BR" />
```

## Twitter Card

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Bang Bang — A bebida que não espera a festa começar" />
<meta name="twitter:description" content="4 sabores com atitude. Drinks prontos para seu negócio." />
<meta name="twitter:image" content="https://[DOMINIO]/og-image.jpg" />
```

## Favicon e Touch Icons

```html
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" href="/icon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

> Nota: Gerar favicons a partir do logo Bang Bang (fundo laranja + logo branco)

---

## Schema Markup (JSON-LD)

### Organization

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Bang Bang",
  "description": "Marca de bebidas prontas (RTD) que conquista o Brasil cidade por cidade.",
  "url": "https://[DOMINIO]",
  "logo": "https://[DOMINIO]/logo.png",
  "sameAs": [
    "https://www.instagram.com/bebabangbang",
    "https://www.tiktok.com/@[DADO]"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "[DADO]",
    "contactType": "sales",
    "availableLanguage": "Portuguese"
  }
}
```

### Product (para cada sabor — exemplo com Caipi)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Bang Bang Caipi Vodka 3 Limões",
  "description": "Drink pronto alcoólico. Cítrico, refrescante e vibrante. Lata 473mL, 5.5% VOL.",
  "brand": {
    "@type": "Brand",
    "name": "Bang Bang"
  },
  "category": "Bebidas Alcoólicas > Ready-to-Drink"
}
```

### FAQPage (para a seção de FAQ)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Como faço para revender Bang Bang?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Entre em contato pelo WhatsApp comercial. Nossa equipe vai te orientar sobre pedido mínimo, condições e entrega na sua região."
      }
    },
    {
      "@type": "Question",
      "name": "Qual o pedido mínimo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "O pedido mínimo varia por região e canal. Fale com nosso comercial para receber a tabela atualizada."
      }
    },
    {
      "@type": "Question",
      "name": "Vocês atendem minha região?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Estamos expandindo cidade por cidade. Informe sua localização e verificamos a cobertura disponível."
      }
    },
    {
      "@type": "Question",
      "name": "Tem material de apoio para PDV?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sim. Fornecemos material de PDV, kit de ativação para eventos e suporte de campanha para parceiros."
      }
    },
    {
      "@type": "Question",
      "name": "Como funciona para eventos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Temos kit de cenografia reutilizável e suporte de ativação. Entre em contato com o briefing do evento e montamos a proposta."
      }
    },
    {
      "@type": "Question",
      "name": "Qual a margem de lucro?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A margem varia por canal e volume. Solicite a tabela comercial para ver as condições do seu perfil."
      }
    }
  ]
}
```

---

## Heading Hierarchy da Home

```
h1: A bebida que não espera a festa começar    (Hero — 1 único h1)
h2: Cada lata, uma atitude                     (Sabores)
h2: O tiro certo pro seu negócio               (Por que revender)
h2: A Bang Bang em números                     (Credibilidade)
h2: Quem vende, sabe                           (Parceiros)
h2: Todo dia é dia de Bang                     (B2C Lifestyle)
h2: Perguntas frequentes                       (FAQ)
h2: Quer a Bang Bang no seu negócio?           (CTA Fechamento)
```

## Notas de Implementação no Next.js

```typescript
// Em src/app/layout.tsx
export const metadata: Metadata = {
  title: "Bang Bang — A bebida que não espera a festa começar",
  description: "...",
  openGraph: { ... },
  twitter: { ... },
};

// Schema JSON-LD via <script type="application/ld+json"> no layout
```

---

## OG Image

Criar imagem 1200x630px com:
- Fundo --bb-brown-dark
- Logo Bang Bang centralizado
- 4 latas em composição
- Tagline abaixo

> Asset a ser criado pelo Elder quando o site for ao ar.
