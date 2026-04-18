-- Initial schema for Bang Bang site (Phase 2 of DEPLOY_WORKFLOW).
--
-- Creates 9 tables covering:
--   - profiles               (auth roles — admin/limited)
--   - contact_channels       (WhatsApp config, singleton)
--   - wishlist_requests      (user-submitted city requests)
--   - events                 (public event calendar)
--   - bangers                (ambassador applications)
--   - faq_items              (home FAQ, max 6 enforced in app layer)
--   - pdv_overrides          (JSONB patch over build-time xlsx, singleton)
--   - click_events           (CTA tracking, row-per-click for history)
--   - click_monthly_snapshots (aggregates populated by Phase 5 cron)
--
-- RLS is ENABLED on every table with NO policies — Phase 4 adds the real
-- policies per feature. With RLS on + no policies, public roles cannot
-- read or write anything (default-deny), which is the safe baseline.

-- ─────────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────────
-- pgcrypto gives us gen_random_uuid(). Supabase ships it by default but
-- creating it explicitly keeps the migration self-contained. We use
-- gen_random_uuid() (not uuid_generate_v4 from uuid-ossp) because Supabase
-- installs uuid-ossp in a separate schema by default, which makes the
-- function not directly callable from public.
create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────────
-- Generic updated_at trigger
-- ─────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────
-- profiles — extends auth.users with a role
-- ─────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'limited' check (role in ('admin', 'limited')),
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile row on signup. SECURITY DEFINER so the trigger can
-- insert into public.profiles even when RLS is on.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

-- ─────────────────────────────────────────────────────────────────
-- contact_channels — singleton row with WhatsApp numbers and links
-- ─────────────────────────────────────────────────────────────────
-- Singleton enforced via the `id boolean primary key default true check (id = true)`
-- trick: only one value (true) is allowed, so at most one row ever exists.
create table public.contact_channels (
  id boolean primary key default true check (id = true),
  whatsapp_revenda text not null default '',
  whatsapp_distribuidor text not null default '',
  whatsapp_eventos text not null default '',
  link_revenda text not null default '',
  link_distribuidor text not null default '',
  link_eventos text not null default '',
  updated_at timestamptz not null default now()
);

create trigger contact_channels_set_updated_at
  before update on public.contact_channels
  for each row execute function public.set_updated_at();

alter table public.contact_channels enable row level security;

-- ─────────────────────────────────────────────────────────────────
-- wishlist_requests — anonymous city-demand submissions
-- ─────────────────────────────────────────────────────────────────
create table public.wishlist_requests (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  whatsapp text not null default '',
  cep text not null default '',
  endereco text not null default '',
  numero text not null default '',
  complemento text not null default '',
  bairro text not null default '',
  cidade text not null default '',
  uf text not null default '' check (uf = '' or char_length(uf) = 2),
  created_at timestamptz not null default now()
);

create index wishlist_requests_created_at_idx
  on public.wishlist_requests (created_at desc);
create index wishlist_requests_uf_cidade_idx
  on public.wishlist_requests (uf, cidade);

alter table public.wishlist_requests enable row level security;

-- ─────────────────────────────────────────────────────────────────
-- events — public event calendar
-- ─────────────────────────────────────────────────────────────────
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  categoria text not null check (categoria in ('Festa', 'Show', 'Festival', 'Rooftop', 'Ativação')),
  cidade text not null,
  uf text not null default '' check (uf = '' or char_length(uf) = 2),
  data date not null,
  data_fim date,
  hora text,
  venue text,
  teaser text,
  cover_url text,
  ticket_url text,
  destaque boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create index events_data_idx on public.events (data);
create index events_destaque_idx on public.events (destaque) where destaque = true;

alter table public.events enable row level security;

-- ─────────────────────────────────────────────────────────────────
-- bangers — ambassador applications, managed via /dashboard
-- ─────────────────────────────────────────────────────────────────
-- `redes` is JSONB because the shape is an ordered array of
-- { platform, handle, seguidores } and platform counts vary per applicant.
create table public.bangers (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  whatsapp text not null default '',
  cidade text not null default '',
  uf text not null default '' check (uf = '' or char_length(uf) = 2),
  nicho text not null check (nicho in (
    'nightlife', 'musica', 'gastro', 'festival',
    'humor', 'lifestyle', 'esporte', 'moda', 'outro'
  )),
  redes jsonb not null default '[]'::jsonb,
  motivacao text not null default '',
  status text not null default 'novo' check (status in (
    'novo', 'em_conversa', 'aprovado', 'rejeitado', 'parceiro'
  )),
  favorito boolean not null default false,
  notas text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger bangers_set_updated_at
  before update on public.bangers
  for each row execute function public.set_updated_at();

create index bangers_status_idx on public.bangers (status);
create index bangers_created_at_idx on public.bangers (created_at desc);

alter table public.bangers enable row level security;

-- ─────────────────────────────────────────────────────────────────
-- faq_items — home FAQ (max 6 items enforced by application)
-- ─────────────────────────────────────────────────────────────────
create table public.faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  position smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger faq_items_set_updated_at
  before update on public.faq_items
  for each row execute function public.set_updated_at();

create index faq_items_position_idx on public.faq_items (position);

alter table public.faq_items enable row level security;

-- ─────────────────────────────────────────────────────────────────
-- pdv_overrides — singleton JSONB patch over build-time PDV data
-- ─────────────────────────────────────────────────────────────────
-- Mirrors the current localStorage shape exactly. Keep as JSONB for Phase 2
-- because (a) the app reads the full blob and merges in memory, and (b)
-- normalizing this would require FK into the generated pdvs.json which
-- isn't a DB table. If querying by PDV becomes a need, normalize later.
create table public.pdv_overrides (
  id boolean primary key default true check (id = true),
  added jsonb not null default '[]'::jsonb,            -- PDV[]
  edited jsonb not null default '{}'::jsonb,           -- { [pdvId]: Partial<PDV> }
  deleted_ids jsonb not null default '[]'::jsonb,      -- string[]
  created_at_map jsonb not null default '{}'::jsonb,   -- { [pdvId]: ISO timestamp }
  updated_at timestamptz not null default now()
);

create trigger pdv_overrides_set_updated_at
  before update on public.pdv_overrides
  for each row execute function public.set_updated_at();

alter table public.pdv_overrides enable row level security;

-- ─────────────────────────────────────────────────────────────────
-- click_events — one row per CTA click (source of truth for Phase 5)
-- ─────────────────────────────────────────────────────────────────
-- Row-per-click lets us build hourly/daily/monthly charts and compare
-- periods. If volume ever becomes a problem, the monthly snapshots table
-- below is the escape hatch (pre-aggregate old months, prune raw rows).
create table public.click_events (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('revenda', 'distribuidor', 'eventos')),
  created_at timestamptz not null default now(),
  session_id text,   -- optional client-side session fingerprint
  page text          -- page path where the click originated
);

create index click_events_category_created_idx
  on public.click_events (category, created_at desc);
create index click_events_created_at_idx
  on public.click_events (created_at desc);

alter table public.click_events enable row level security;

-- ─────────────────────────────────────────────────────────────────
-- click_monthly_snapshots — closed-month aggregates (Phase 5)
-- ─────────────────────────────────────────────────────────────────
-- Populated by a scheduled edge function on the 1st of each month. Stores
-- total + hourly/daily histograms so dashboards don't hammer the raw
-- click_events table for historical reads.
create table public.click_monthly_snapshots (
  id uuid primary key default gen_random_uuid(),
  year smallint not null,
  month smallint not null check (month between 1 and 12),
  category text not null check (category in ('revenda', 'distribuidor', 'eventos')),
  total_clicks integer not null default 0,
  hourly_buckets jsonb not null default '{}'::jsonb,  -- {"0": n, "1": n, ... "23": n}
  daily_buckets jsonb not null default '{}'::jsonb,   -- {"1": n, "2": n, ...}
  created_at timestamptz not null default now(),
  unique (year, month, category)
);

alter table public.click_monthly_snapshots enable row level security;
