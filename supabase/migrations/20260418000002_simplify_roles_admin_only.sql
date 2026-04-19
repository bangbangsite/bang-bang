-- Simplify roles: admin-only (Phase 3, 2026-04-18).
--
-- Phase 2 created profiles with a two-tier role enum ('admin','limited') to
-- support a future restricted-access profile. We're deferring that tier until
-- a real use-case appears. For now every staff account is admin — the
-- column stays to preserve the shape in case limited/editor/etc. come back.
--
-- Steps:
--   1. Drop the existing check (Postgres names it profiles_role_check).
--   2. Any row still carrying role='limited' (shouldn't exist yet, but be
--      safe) is promoted to admin before the narrower check goes back on.
--   3. Re-add the check with only 'admin', and flip the column default.
--   4. Update handle_new_user() so new auth signups land as admin. The
--      trigger definition is re-issued (CREATE OR REPLACE) so it picks up
--      the new default via explicit insert.

alter table public.profiles
  drop constraint if exists profiles_role_check;

update public.profiles
  set role = 'admin'
  where role <> 'admin';

alter table public.profiles
  alter column role set default 'admin';

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (new.id, 'admin', coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
