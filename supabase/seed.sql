-- Initial seed data for Bang Bang site. Runs once after migrations (or any
-- time via `supabase db reset`). Every insert is idempotent.
--
-- What we seed:
--   - contact_channels : empty singleton row so the dashboard has something
--                        to edit. Actual WhatsApp numbers come from the
--                        client when they deliver them.
--   - pdv_overrides    : empty singleton so reads never return null.
--   - faq_items        : the six default Q&As currently shipped in
--                        src/lib/faq/config.ts (DEFAULT_FAQ).

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
