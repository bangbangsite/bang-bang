-- RLS policies for every Phase 4 table (2026-04-19).
--
-- Until now every table had RLS on with NO policies (default-deny) so Phase 2
-- could land safely. Phase 4 starts migrating features off localStorage, so
-- each table needs explicit read/write rules.
--
-- Design:
--   - Site visitors (anon) are the public — they can read what's shown on
--     the site (contacts, events, faq, pdv overrides) and submit requests
--     (wishlist, bangers, click_events). They cannot read private data.
--   - Every signed-in user is admin (see 20260418000002), so "admin-only"
--     collapses to "authenticated". We still go through public.is_admin()
--     because it lets us reintroduce roles later without rewriting policies.
--   - profiles stays self-service + admin-sees-all (admin collapses to any
--     authenticated user, so this is effectively "any logged-in user sees
--     every profile" — fine for a single-staff setup).
--
-- The service role (used by edge functions / migrations / future cron jobs)
-- bypasses RLS entirely, so snapshot-populating cron on
-- click_monthly_snapshots doesn't need an explicit write policy.

-- ─────────────────────────────────────────────────────────────────
-- is_admin() — one-line role check used by every admin policy
-- ─────────────────────────────────────────────────────────────────
-- SECURITY DEFINER so the function can read public.profiles even when the
-- caller is anon. STABLE because the result only depends on auth.uid() and
-- the profiles row (which doesn't change within a statement).
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- ─────────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────────
-- Each user reads/updates their own row. Admins see every profile (useful
-- once we add a users list in the dashboard). No inserts from the app —
-- rows are created by the on_auth_user_created trigger.
create policy "profiles_select_self_or_admin"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

create policy "profiles_update_self"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────
-- contact_channels (singleton) — WhatsApp links shown on the site
-- ─────────────────────────────────────────────────────────────────
create policy "contact_channels_select_public"
  on public.contact_channels
  for select
  to anon, authenticated
  using (true);

create policy "contact_channels_update_admin"
  on public.contact_channels
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────
-- wishlist_requests — public submits, admin reads/deletes
-- ─────────────────────────────────────────────────────────────────
create policy "wishlist_requests_insert_public"
  on public.wishlist_requests
  for insert
  to anon, authenticated
  with check (true);

create policy "wishlist_requests_select_admin"
  on public.wishlist_requests
  for select
  to authenticated
  using (public.is_admin());

create policy "wishlist_requests_delete_admin"
  on public.wishlist_requests
  for delete
  to authenticated
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────
-- events — public reads (home calendar), admin CRUD
-- ─────────────────────────────────────────────────────────────────
create policy "events_select_public"
  on public.events
  for select
  to anon, authenticated
  using (true);

create policy "events_insert_admin"
  on public.events
  for insert
  to authenticated
  with check (public.is_admin());

create policy "events_update_admin"
  on public.events
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "events_delete_admin"
  on public.events
  for delete
  to authenticated
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────
-- bangers — public submits (/seja-um-banger form), admin manages
-- ─────────────────────────────────────────────────────────────────
create policy "bangers_insert_public"
  on public.bangers
  for insert
  to anon, authenticated
  with check (true);

create policy "bangers_select_admin"
  on public.bangers
  for select
  to authenticated
  using (public.is_admin());

create policy "bangers_update_admin"
  on public.bangers
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "bangers_delete_admin"
  on public.bangers
  for delete
  to authenticated
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────
-- faq_items — public reads (home FAQ), admin CRUD
-- ─────────────────────────────────────────────────────────────────
create policy "faq_items_select_public"
  on public.faq_items
  for select
  to anon, authenticated
  using (true);

create policy "faq_items_insert_admin"
  on public.faq_items
  for insert
  to authenticated
  with check (public.is_admin());

create policy "faq_items_update_admin"
  on public.faq_items
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "faq_items_delete_admin"
  on public.faq_items
  for delete
  to authenticated
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────
-- pdv_overrides (singleton JSONB) — public reads, admin writes
-- ─────────────────────────────────────────────────────────────────
-- Reads are public because the site needs to merge the overrides into the
-- build-time pdvs.json at render time. Only the dashboard mutates it.
create policy "pdv_overrides_select_public"
  on public.pdv_overrides
  for select
  to anon, authenticated
  using (true);

create policy "pdv_overrides_update_admin"
  on public.pdv_overrides
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────
-- click_events — public inserts (fire-and-forget), admin aggregates
-- ─────────────────────────────────────────────────────────────────
-- Anyone can record a click (no auth on marketing CTAs). Only admins can
-- read the raw click stream for dashboards. No update/delete policies —
-- the table is append-only; historical pruning goes through service role.
create policy "click_events_insert_public"
  on public.click_events
  for insert
  to anon, authenticated
  with check (true);

create policy "click_events_select_admin"
  on public.click_events
  for select
  to authenticated
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────
-- click_monthly_snapshots — admin reads only
-- ─────────────────────────────────────────────────────────────────
-- Inserts come from a scheduled cron that uses the service role, which
-- bypasses RLS. We only need the select policy for dashboards.
create policy "click_monthly_snapshots_select_admin"
  on public.click_monthly_snapshots
  for select
  to authenticated
  using (public.is_admin());
