# Bang Bang — Workflow de Deploy (Vercel + Supabase)

Roteiro passo-a-passo pra subir produção. Cada fase tem dependência da anterior. Itens riscados quando concluídos.

---

## Decisões pendentes (responder antes da Fase 1)

- [x] **Domínio:** já existe, usar em produção (dominio real apontado pro Vercel).
- [x] **Conta Vercel e Supabase:** já criadas (dedicadas).
- [x] **Conta GitHub:** criada.
- [x] **Auth staff:** **email + senha**, com 2 níveis de role:
  - `admin` — acesso total ao dashboard
  - `limited` — acesso parcial (definir escopo na Fase 3)
- [x] **Dados localStorage:** subir com os dados fake que estão hoje. Um
      **botão "Zerar dados de teste"** no dashboard limpa tudo num clique
      quando for pro ar real (✅ já implementado em `src/lib/demo/reset.ts`
      + `ResetDemoDataCard`).

---

## Fase 0 — Pré-flight (local, 30 min)

Garantir que o build local tá saudável antes de mandar pra cloud.

- [ ] `npm run build` roda sem erro
- [ ] `npm run lint` limpo
- [ ] `npm run pdvs:validate` passa
- [ ] Remover imports não-usados, dead code, `console.log` de debug
- [ ] Confirmar que `package.json` tem só deps necessárias (sem lixo de experimentação)

---

## Fase 1 — GitHub + Vercel + Preview Gate (sem DB, 2-3h)

Deploy do domínio real com **gate de pré-lançamento**: público geral vê a
página "em construção", Pedro acessa o site completo via link único com token.

### 1.1 — Mecânica do preview gate (JÁ IMPLEMENTADA ✅)

- [x] `src/middleware.ts` — intercepta toda request; sem cookie de preview
      redireciona (rewrite) pra `/coming-soon`. Adiciona `X-Robots-Tag:
      noindex` em tudo enquanto o token existir.
- [x] `src/app/coming-soon/page.tsx` — teaser bonito na vibe da marca
      (logo, latas sangrando dos 4 cantos, headline "Algo tá gelando", CTA
      pro Instagram).
- [x] `.env.example` documenta `PREVIEW_TOKEN`.

**Como funciona:**
- Qualquer visitante do domínio → vê `/coming-soon`
- Pedro acessa `https://bebabangbang.com.br/?access=SEU_TOKEN` → middleware
  grava cookie de 90 dias → redireciona pra URL limpa → vê o site real
- O cookie funciona no device inteiro (todos os paths liberados depois do
  primeiro acesso)
- Pra **lançar**: basta remover a var `PREVIEW_TOKEN` do Vercel. Middleware
  deixa tudo passar sem redeploy

### 1.2 — Preparar repo

- [ ] Criar conta GitHub (se ainda não)
- [ ] Criar repo **privado** `bangbang-site`
- [ ] `git init` local (se ainda não) + primeiro commit
- [ ] `git remote add origin git@github.com:<user>/bangbang-site.git`
- [ ] `git push -u origin main`

### 1.3 — Deploy Vercel

- [ ] Importar repo na Vercel
- [ ] Framework detection → Next.js (automático)
- [ ] Build command padrão: `npm run build`
- [ ] Node.js version: 20.x
- [ ] **Environment Variables** (Production + Preview):
  - `PREVIEW_TOKEN` → gerar token forte (ex: `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`)
- [ ] Deploy inicial → validar URL `.vercel.app`
- [ ] Testar em `.vercel.app`:
  - URL raiz → redireciona pra `/coming-soon` (gate funcionando)
  - `.vercel.app/?access=TOKEN` → cookie setado, site real aparece
  - Abrir aba anônima → gate volta

### 1.4 — Apontar domínio

- [ ] Vercel → Domains → adicionar domínio comprado
- [ ] Ajustar DNS (A record ou CNAME conforme Vercel instrui)
- [ ] Aguardar propagação + HTTPS automático
- [ ] Salvar o link mágico `https://bebabangbang.com.br/?access=TOKEN`

**Saída da fase:** domínio real no ar exibindo `/coming-soon` pra público.
Pedro + convidados acessam o site completo via link com token. Zero DB
ainda — toda a funcionalidade roda em localStorage como hoje.

---

## Fase 2 — Supabase (projeto + schema, 2-3h)

- [ ] Criar projeto Supabase (região São Paulo pra latência BR)
- [ ] Copiar URL + anon key + service_role key
- [ ] Adicionar vars no Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Instalar `@supabase/ssr` e `@supabase/supabase-js`
- [ ] Criar helpers em `src/lib/supabase/`:
  - `client.ts` — browser client
  - `server.ts` — server client (cookies)
  - `middleware.ts` — session refresh
- [ ] Middleware raiz em `src/middleware.ts` pra refresh de sessão em toda request
- [ ] Migrations iniciais (SQL, roda no Supabase Studio ou via CLI):
  - `click_events` (analytics de CTAs)
  - `click_monthly_snapshots` (agregados fechados)
  - `wishlist_requests` (pedidos de cidade)
  - `contact_channels` (WhatsApp por categoria)
  - `events` (agenda pública)
  - `bangers` (lista interna)
  - `faq_items`
  - `pdv_overrides` (correções em cima do xlsx)
- [ ] RLS (Row Level Security) ativado em TODAS — policies por tabela na Fase 4

**Saída da fase:** Supabase conectado, schema pronto, nenhuma feature ainda usa.

---

## Fase 3 — Auth + roles (proteger /dashboard, 3h)

Email + senha, com **2 níveis de hierarquia**: `admin` (tudo) e `limited`
(acesso restrito — definir escopo quando chegar na fase). Supabase Auth não
tem roles nativas, então usamos uma tabela `profiles` + RLS pra implementar.

- [ ] Habilitar **Email auth** no Supabase (sem magic link; senha obrigatória)
- [ ] Criar tabela `public.profiles`:
  - `id uuid references auth.users on delete cascade primary key`
  - `role text not null default 'limited' check (role in ('admin','limited'))`
  - `full_name text`
  - `created_at timestamptz default now()`
- [ ] Trigger `on_auth_user_created` → insert em `profiles` com role default
      `limited` (admin promove manualmente via Studio ou UI)
- [ ] RLS em `profiles`: user vê/edita só próprio profile; admin vê todos
- [ ] Criar usuário admin inicial (Pedro) via Supabase Studio → setar
      `role='admin'` no profile
- [ ] `src/app/login/page.tsx` — formulário email + senha
- [ ] `src/lib/auth/` — helpers `getUser()`, `getProfile()`, `requireAdmin()`
- [ ] Middleware/Layout de `/dashboard`:
  - sem sessão → redirect `/login`
  - sem `role='admin'` → mostrar só as páginas permitidas pro `limited`
- [ ] Substituir `src/lib/auth/session.ts` (localStorage) por Supabase auth
- [ ] Botão logout no DashboardHeader
- [ ] UI de criação de novos usuários (só admin vê) — fluxo:
  - admin envia convite com email + role
  - novo usuário define senha no primeiro login
- [ ] Testar:
  - `/dashboard` sem login → `/login`
  - admin vê tudo
  - limited vê só o escopo restrito
  - logout limpa sessão

**Saída da fase:** dashboard com 2 níveis de acesso funcionando. Resto do
site inalterado.

---

## Fase 4 — Migrar features de localStorage pra Supabase (3-5h, incremental)

Uma feature por vez, testando cada uma. Ordem por risco (menor risco primeiro):

### 4.1 — `contact_channels` (WhatsApp links)
- [ ] Tabela + seed com valores atuais
- [ ] `useContacts` lê do Supabase (Server Component + SWR no client)
- [ ] Formulário no dashboard salva no DB
- [ ] RLS: leitura pública, escrita só autenticado

### 4.2 — `wishlist_requests` (pedidos de cidade)
- [ ] Tabela com schema de `EMPTY_REQUEST`
- [ ] `useWishlist.addRequest` → `POST /api/wishlist` → insert
- [ ] Dashboard `/dashboard/solicitacoes` lê direto do DB
- [ ] RLS: insert público, select só autenticado

### 4.3 — `click_events`
- [ ] Tabela `(id, category, created_at, session_id, page)`
- [ ] `trackClick` → insert (fire-and-forget)
- [ ] Dashboard agregado em tempo real (mes corrente)
- [ ] Remover botão "Zerar contadores" (não faz mais sentido com histórico)
- [ ] RLS: insert público, select só autenticado

### 4.4 — `events`, `bangers`, `faq_items`, `pdv_overrides`
- [ ] Tabelas + CRUD no dashboard
- [ ] Mesma pattern: leitura conforme necessidade, escrita autenticada

**Saída da fase:** todas as features funcionando via Supabase. `localStorage` só pra estado de UI ephemeral (tema, toasts recentes).

---

## Fase 5 — Analytics avançado (o que motivou tudo isso, 2-3h)

- [ ] Tabela `click_monthly_snapshots`: `(year, month, category, total_clicks, hourly_bucket, daily_bucket)`
- [ ] Edge Function `snapshot-monthly` que agrega `click_events` do mês anterior
- [ ] Supabase Cron: roda dia 1 de cada mês às 00:05
- [ ] Dashboard:
  - Gráfico por hora (hoje)
  - Gráfico por dia (mês corrente)
  - Comparativo dia-a-dia vs mês anterior (% )
  - View "mesma quantidade de dias" (se hoje é dia 12, compara 12 dias do mês anterior)
- [ ] Limpar botão "Zerar contadores" da UI

**Saída da fase:** analytics completo com histórico e comparativos.

---

## Fase 6 — Segurança + lançamento (1-2h)

- [ ] Review de RLS policies — rodar checklist do Supabase
- [ ] Verificar que `service_role` key só é usada server-side
- [ ] Backup schedule no Supabase (diário automático é default do plano free)
- [ ] Preview deploys no Vercel (branch → URL isolada)
- [ ] Lighthouse em produção: performance ≥ 90, SEO ≥ 95
- [ ] Domain custom + HTTPS
- [ ] Analytics Vercel (opcional)

**Saída da fase:** produção estável, monitorada, lançada.

---

## Notas operacionais

- **Rollback:** Vercel mantém deploys antigos — um clique volta.
- **Migrações:** todas em arquivo SQL versionado em `supabase/migrations/`. Nunca mudar schema via Studio sem versionar.
- **Env vars:** `NEXT_PUBLIC_*` são expostas ao cliente. Chave `service_role` **nunca** com prefixo `NEXT_PUBLIC_`.
- **Cache:** Next.js App Router cacheia agressivamente. Usar `revalidate` ou `dynamic = 'force-dynamic'` conscientemente no dashboard.
