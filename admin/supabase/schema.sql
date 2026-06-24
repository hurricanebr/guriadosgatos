-- =============================================
-- profiles: complementa auth.users com role e first_login
-- =============================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text not null,
  role        text not null check (role in ('admin', 'catsitter')),
  first_login boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Trigger: cria profile automaticamente ao criar usuário no Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, role, first_login)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'catsitter'),
    true
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- clientes
-- =============================================
create table if not exists public.clientes (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  telefone    text,
  endereco    text,
  observacoes text,
  created_at  timestamptz not null default now()
);

-- =============================================
-- gatos
-- =============================================
create table if not exists public.gatos (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null references public.clientes(id) on delete cascade,
  nome        text not null,
  observacoes text
);

-- =============================================
-- agendamentos
-- =============================================
create table if not exists public.agendamentos (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid not null references public.clientes(id),
  cat_sitter_id   uuid not null references public.profiles(id),
  data_hora       timestamptz not null,
  status          text not null default 'agendado'
                    check (status in ('agendado', 'confirmado', 'realizado', 'cancelado')),
  valor           numeric(10,2),
  endereco_visita text,
  observacoes     text,
  created_at      timestamptz not null default now(),
  created_by      uuid references public.profiles(id)
);

-- =============================================
-- Helper: verifica role sem disparar RLS recursivamente
-- (security definer = roda com permissão do criador, bypassando RLS)
-- =============================================
create or replace function public.get_my_role()
returns text as $$
  select role from public.profiles where id = auth.uid()
$$ language sql security definer stable;

-- =============================================
-- Row Level Security
-- =============================================

-- profiles
alter table public.profiles enable row level security;

create policy "admin_all_profiles"
  on public.profiles for all
  using (public.get_my_role() = 'admin');

create policy "self_select_profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "self_update_profile"
  on public.profiles for update
  using (id = auth.uid());

-- clientes
alter table public.clientes enable row level security;

create policy "admin_all_clientes"
  on public.clientes for all
  using (public.get_my_role() = 'admin');

-- gatos
alter table public.gatos enable row level security;

create policy "admin_all_gatos"
  on public.gatos for all
  using (public.get_my_role() = 'admin');

-- agendamentos
alter table public.agendamentos enable row level security;

create policy "admin_all_agendamentos"
  on public.agendamentos for all
  using (public.get_my_role() = 'admin');

create policy "catsitter_own_agendamentos"
  on public.agendamentos for select
  using (cat_sitter_id = auth.uid());
