-- ─────────────────────────────────────────────────────────────
-- Balanza Energética Argentina — initial schema + seed data
-- ─────────────────────────────────────────────────────────────

-- Annual balance 2011–2023
create table if not exists balance_anual (
  year        int primary key,
  balance_usd numeric(12,3) not null,
  government  text          not null,
  context     text
);

-- Monthly balance 2024+
create table if not exists balance_mensual (
  year         int  not null,
  month        int  not null check (month between 1 and 12),
  exports_usd  numeric(12,3),
  imports_usd  numeric(12,3),
  government   text not null,
  is_record    boolean not null default false,
  observations text,
  primary key (year, month)
);

-- Historical exports 1990+  (used for long-run charts)
create table if not exists exportaciones_historicas (
  year        int  not null,
  month       int  not null check (month between 1 and 12),
  exports_usd numeric(12,3),
  primary key (year, month)
);

-- Projections
create table if not exists proyecciones (
  year          int primary key,
  exports_usd   numeric(12,3),
  imports_usd   numeric(12,3),
  balance_usd   numeric(12,3),
  scenario      text,
  notes         text
);

-- Admins (for future auth wiring)
create table if not exists admins (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  name         text,
  email        text unique,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ─── View: monthly balance with computed fields ───────────────
create or replace view v_balance_mensual as
select
  year,
  month,
  exports_usd,
  imports_usd,
  (exports_usd - coalesce(imports_usd, 0)) as balance_usd,
  government,
  is_record,
  observations,
  sum(exports_usd - coalesce(imports_usd, 0))
    over (partition by year order by month) as ytd_balance
from balance_mensual;

-- ─── Enable Row Level Security ────────────────────────────────
alter table balance_anual             enable row level security;
alter table balance_mensual           enable row level security;
alter table exportaciones_historicas  enable row level security;
alter table proyecciones              enable row level security;
alter table admins                    enable row level security;

-- Public read on data tables (no auth required to view data)
create policy "public read balance_anual"
  on balance_anual for select using (true);

create policy "public read balance_mensual"
  on balance_mensual for select using (true);

create policy "public read exportaciones_historicas"
  on exportaciones_historicas for select using (true);

create policy "public read proyecciones"
  on proyecciones for select using (true);

-- Admins only write (authenticated + in admins table)
create policy "admin write balance_anual"
  on balance_anual for all
  using (auth.uid() in (select auth_user_id from admins where is_active = true));

create policy "admin write balance_mensual"
  on balance_mensual for all
  using (auth.uid() in (select auth_user_id from admins where is_active = true));

create policy "admin write exportaciones_historicas"
  on exportaciones_historicas for all
  using (auth.uid() in (select auth_user_id from admins where is_active = true));

create policy "admin write proyecciones"
  on proyecciones for all
  using (auth.uid() in (select auth_user_id from admins where is_active = true));

-- ─────────────────────────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────────────────────────

-- Annual 2011–2023
insert into balance_anual (year, balance_usd, government, context) values
  (2011, -3083.0, 'CFK',     'Inicio del déficit energético estructural'),
  (2012, -2947.0, 'CFK',     null),
  (2013, -2898.0, 'CFK',     null),
  (2014, -2441.0, 'CFK',     null),
  (2015, -2636.0, 'CFK',     null),
  (2016,  -835.0, 'Macri',   null),
  (2017, -2966.0, 'Macri',   null),
  (2018, -2013.0, 'Macri',   null),
  (2019, -1591.0, 'Macri',   null),
  (2020,   137.0, 'AF',      'Único superávit 2011-2022 (pandemia redujo importaciones)'),
  (2021, -2407.0, 'AF',      null),
  (2022, -4029.0, 'AF',      'Déficit récord histórico'),
  (2023, -1243.0, 'Massa/AF',null)
on conflict (year) do nothing;

-- Monthly 2024
insert into balance_mensual (year, month, exports_usd, imports_usd, government, is_record, observations) values
  (2024,  1,  677,  287, 'Milei', false, null),
  (2024,  2,  718,  160, 'Milei', false, null),
  (2024,  3,  825,  132, 'Milei', false, null),
  (2024,  4,  945,  242, 'Milei', false, null),
  (2024,  5,  892,  392, 'Milei', false, null),
  (2024,  6,  629,  761, 'Milei', false, 'Único mes con déficit en 2024'),
  (2024,  7,  864,  650, 'Milei', false, null),
  (2024,  8,  758,  445, 'Milei', false, null),
  (2024,  9,  776,  166, 'Milei', false, null),
  (2024, 10,  817,  199, 'Milei', false, null),
  (2024, 11,  641,  128, 'Milei', false, null),
  (2024, 12, 1032,  180, 'Milei', true,  'Récord diciembre')
on conflict (year, month) do nothing;

-- Monthly 2025
insert into balance_mensual (year, month, exports_usd, imports_usd, government, is_record, observations) values
  (2025,  1,  879,  201, 'Milei', false, null),
  (2025,  2,  847,  230, 'Milei', false, null),
  (2025,  3,  753,  226, 'Milei', false, null),
  (2025,  4,  851,  278, 'Milei', false, null),
  (2025,  5,  647,  302, 'Milei', false, null),
  (2025,  6, 1064,  325, 'Milei', true,  'Mayor exportación mensual del año'),
  (2025,  7,  763,  546, 'Milei', false, null),
  (2025,  8, 1056,  307, 'Milei', true,  null),
  (2025,  9,  967,  191, 'Milei', true,  null),
  (2025, 10,  913,  205, 'Milei', true,  null),
  (2025, 11, 1008,  149, 'Milei', false, null),
  (2025, 12, 1067,  174, 'Milei', false, null)
on conflict (year, month) do nothing;

-- Monthly 2026 (Jan–Apr confirmed, rest pending)
insert into balance_mensual (year, month, exports_usd, imports_usd, government, is_record, observations) values
  (2026,  1,  781,  163, 'Milei', false, null),
  (2026,  2,  631,  145, 'Milei', false, null),
  (2026,  3, 1235,  145, 'Milei', true,  'Superávit más alto de la historia para un mes'),
  (2026,  4, 1554,  152, 'Milei', false, null)
on conflict (year, month) do nothing;
