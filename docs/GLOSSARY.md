# Bang Bang — Glossário do Projeto
## Termos, convenções e nomes canônicos

---

## Termos da Marca (usar exatamente assim)

| Termo | Uso correto | Errado |
|-------|-------------|--------|
| Bang Bang | Sempre com espaço, ambas maiúsculas | BangBang, bang bang, BANG BANG (exceto logo) |
| BOOM | Sempre caps — é elemento gráfico | Boom, boom |
| RTD | Ready-to-Drink — sigla, sem hífen interno | R.T.D., Rtd |
| Bangers | ⚠️ Em validação — usar com cautela | bangers, BANGERS |
| Todo dia é dia de Bang | Manifesto — "Bang" sem "Bang Bang" | "Todo dia é dia de Bang Bang" |
| Abre o seu | Gatilho — sem ponto final | "Abra o seu", "Abre o teu" |

## Nomes dos Sabores (canônicos)

| Nome oficial | Apelido | Variável CSS |
|-------------|---------|-------------|
| Caipi Vodka 3 Limões | O Verde | `--bb-caipi-*` |
| Moscow Mule | O Mule | `--bb-mule-*` |
| 40+3 Spritz | O Spritz | `--bb-spritz-*` |
| Whisky + Energy | O Bang | `--bb-bang-*` |

## Termos Técnicos do Projeto

| Termo | Significado |
|-------|-------------|
| Seção / Section | Bloco da home (hero, FAQ, etc.) |
| Dobra | Sinônimo de seção — uso do Pedro |
| Token | Variável de design (cor, font, spacing) |
| Maestro | Agente orquestrador |
| Build section | Pipeline completo de criação de seção |

## Nomes de Arquivo (convenções)

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componente React | PascalCase.tsx | `HeroSection.tsx` |
| Story Storybook | PascalCase.stories.tsx | `HeroSection.stories.tsx` |
| CSS token | `--bb-[grupo]-[variante]` | `--bb-caipi-primary` |
| Classe custom | `bb-[nome]` | `bb-marquee` |
| Imagem de lata | kebab-case.png | `caipi.png` |
| Doc do projeto | UPPER_SNAKE.md | `COPY_HOME.md` |
| Agente | kebab-case.md | `ux-architect.md` |
