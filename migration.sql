-- Kredesh — Supabase schema
-- Paste and run in: Supabase dashboard → SQL Editor → New query

-- ── 1. profiles ────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null,
  initials     text not null default '',
  email        text,
  role         text not null default 'Driver',
  avatar_color text not null default '#00A884',
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ── 2. chats ───────────────────────────────────────────────────────────────
create table if not exists public.chats (
  id         text primary key,
  name       text,
  kind       text not null check (kind in ('group','dm')),
  pinned     boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── 3. chat_members ────────────────────────────────────────────────────────
create table if not exists public.chat_members (
  chat_id text references public.chats(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (chat_id, user_id)
);

-- ── 4. messages ────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id        uuid primary key default gen_random_uuid(),
  chat_id   text not null references public.chats(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  body      text not null,
  sent_at   timestamptz not null default now()
);
alter table public.messages replica identity full;

-- ── 5. tasks ───────────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id             uuid primary key default gen_random_uuid(),
  chat_id        text references public.chats(id) on delete set null,
  title          text not null,
  status         text not null default 'pending' check (status in ('pending','complete','incomplete')),
  priority       text not null default 'med'     check (priority in ('high','med','low')),
  due            text,
  extracted_from text,
  created_at     timestamptz not null default now()
);

-- ── 6. loads ───────────────────────────────────────────────────────────────
create table if not exists public.loads (
  id         uuid primary key default gen_random_uuid(),
  chat_id    text references public.chats(id) on delete set null,
  direction  text not null check (direction in ('inbound','outbound')),
  cargo      text,
  vehicle    text,
  eta        text,
  customer   text,
  status     text not null default 'scheduled' check (status in ('scheduled','en route','arrived','loaded out')),
  logged_at  text,
  created_at timestamptz not null default now()
);

-- ── RLS ────────────────────────────────────────────────────────────────────
alter table public.profiles     enable row level security;
alter table public.chats        enable row level security;
alter table public.chat_members enable row level security;
alter table public.messages     enable row level security;
alter table public.tasks        enable row level security;
alter table public.loads        enable row level security;

-- Authenticated users have full access (internal team app)
do $$ begin
  if not exists (select 1 from pg_policies where tablename='profiles'     and policyname='auth_all') then
    create policy "auth_all" on public.profiles     for all to authenticated using (true) with check (true); end if;
  if not exists (select 1 from pg_policies where tablename='chats'        and policyname='auth_all') then
    create policy "auth_all" on public.chats        for all to authenticated using (true) with check (true); end if;
  if not exists (select 1 from pg_policies where tablename='chat_members' and policyname='auth_all') then
    create policy "auth_all" on public.chat_members for all to authenticated using (true) with check (true); end if;
  if not exists (select 1 from pg_policies where tablename='messages'     and policyname='auth_all') then
    create policy "auth_all" on public.messages     for all to authenticated using (true) with check (true); end if;
  if not exists (select 1 from pg_policies where tablename='tasks'        and policyname='auth_all') then
    create policy "auth_all" on public.tasks        for all to authenticated using (true) with check (true); end if;
  if not exists (select 1 from pg_policies where tablename='loads'        and policyname='auth_all') then
    create policy "auth_all" on public.loads        for all to authenticated using (true) with check (true); end if;
end; $$;

-- ── Trigger: auto-create profile on signup ─────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, initials, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    upper(left(coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 2)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'Driver')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Seed chats ─────────────────────────────────────────────────────────────
insert into public.chats (id, name, kind, pinned) values
  ('c1', 'WHS 24 OPERATIONS', 'group', true),
  ('c2', null, 'dm', false),
  ('c3', null, 'dm', false),
  ('c4', null, 'dm', false),
  ('c5', 'Allied Bookings', 'group', false),
  ('c6', null, 'dm', false),
  ('c7', null, 'dm', false)
on conflict (id) do nothing;
