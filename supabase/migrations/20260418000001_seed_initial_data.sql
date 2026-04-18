-- Seed initial data — first migration after the schema is in place.
--
-- Lives as a migration (not just supabase/seed.sql) so it runs on every
-- environment via `db push`, and so we have an audit trail of when these
-- defaults were inserted. The companion supabase/seed.sql kept around
-- mirrors this content for local `supabase db reset` flows.
--
-- Every insert is idempotent (ON CONFLICT DO NOTHING), so re-running the
-- migration is a no-op.

-- ─── contact_channels (singleton) ─────────────────────────────────
insert into public.contact_channels (id)
values (true)
on conflict (id) do nothing;

-- ─── pdv_overrides (singleton) ────────────────────────────────────
insert into public.pdv_overrides (id)
values (true)
on conflict (id) do nothing;

-- ─── faq_items (6 defaults — mirrors DEFAULT_FAQ) ─────────────────
insert into public.faq_items (question, answer, position) values
  (
    'Como faço para revender Bang Bang?',
    'Entre em contato pelo WhatsApp comercial. Nossa equipe vai te orientar sobre pedido mínimo, condições e entrega na sua região.',
    0
  ),
  (
    'Qual o pedido mínimo?',
    'O pedido mínimo varia por região e canal. Fale com nosso comercial para receber a tabela atualizada.',
    1
  ),
  (
    'Vocês atendem minha região?',
    'Estamos expandindo cidade por cidade. Informe sua localização e verificamos a cobertura disponível.',
    2
  ),
  (
    'Tem material de apoio para PDV?',
    'Sim. Fornecemos material de PDV, kit de ativação para eventos e suporte de campanha para parceiros.',
    3
  ),
  (
    'Como funciona para eventos?',
    'Temos kit de cenografia reutilizável e suporte de ativação. Entre em contato com o briefing do evento e montamos a proposta.',
    4
  ),
  (
    'Qual a margem de lucro?',
    'A margem varia por canal e volume. Solicite a tabela comercial para ver as condições do seu perfil.',
    5
  )
on conflict do nothing;
