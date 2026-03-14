create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'advisor', 'ops', 'compliance');
create type public.task_status as enum ('todo', 'in_progress', 'blocked', 'done');
create type public.opportunity_stage as enum (
  'qualifying',
  'proposal',
  'diligence',
  'commitment',
  'won',
  'lost'
);
create type public.communication_channel as enum (
  'email',
  'phone',
  'whatsapp',
  'meeting',
  'sms'
);
create type public.compliance_status as enum (
  'pending',
  'in_review',
  'approved',
  'flagged',
  'closed'
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  full_name text not null default 'New Advisor',
  role public.app_role not null default 'advisor',
  organization_name text,
  phone text,
  city text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  segment text not null,
  advisor_id uuid references public.profiles (id) on delete set null,
  total_aum numeric(14, 2) not null default 0,
  risk_profile text,
  status text not null default 'active',
  next_review_date date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  owner_id uuid references public.profiles (id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  city text,
  onboarding_stage text not null default 'prospect',
  kyc_status text not null default 'pending',
  date_of_birth date,
  pan_number text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  base_currency text not null default 'INR',
  objective text,
  benchmark text,
  total_value numeric(14, 2) not null default 0,
  performance_ytd numeric(8, 2) not null default 0,
  liquidity_ratio numeric(8, 2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios (id) on delete cascade,
  account_number text not null unique,
  custodian text not null,
  account_type text not null,
  cash_balance numeric(14, 2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.holdings (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios (id) on delete cascade,
  symbol text not null,
  security_name text not null,
  asset_class text not null,
  units numeric(14, 4) not null default 0,
  average_cost numeric(14, 2) not null default 0,
  market_price numeric(14, 2) not null default 0,
  market_value numeric(14, 2) not null default 0,
  weight numeric(8, 2),
  last_priced_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.accounts (id) on delete set null,
  portfolio_id uuid not null references public.portfolios (id) on delete cascade,
  transaction_type text not null,
  symbol text,
  quantity numeric(14, 4) not null default 0,
  price numeric(14, 2) not null default 0,
  gross_amount numeric(14, 2) not null default 0,
  fees numeric(14, 2) not null default 0,
  traded_at timestamptz not null,
  settlement_at date,
  source text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null,
  target_amount numeric(14, 2) not null default 0,
  current_amount numeric(14, 2) not null default 0,
  target_date date,
  priority text not null default 'medium',
  status text not null default 'on_track',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  owner_id uuid references public.profiles (id) on delete set null,
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  priority text not null default 'medium',
  due_at timestamptz,
  category text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households (id) on delete cascade,
  owner_id uuid references public.profiles (id) on delete set null,
  subject text not null,
  meeting_type text not null default 'review',
  location text,
  notes text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  uploaded_by uuid references public.profiles (id) on delete set null,
  title text not null,
  document_type text not null,
  classification text,
  storage_path text,
  version_label text not null default 'v1',
  signed boolean not null default false,
  uploaded_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.communication_logs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  owner_id uuid references public.profiles (id) on delete set null,
  channel public.communication_channel not null,
  subject text,
  summary text not null,
  logged_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete set null,
  company_name text,
  contact_name text not null,
  email text,
  phone text,
  source text,
  status text not null default 'new',
  score integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households (id) on delete set null,
  lead_id uuid references public.leads (id) on delete set null,
  owner_id uuid references public.profiles (id) on delete set null,
  title text not null,
  stage public.opportunity_stage not null default 'qualifying',
  expected_value numeric(14, 2) not null default 0,
  probability integer not null default 0,
  target_close_date date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.compliance_records (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households (id) on delete cascade,
  owner_id uuid references public.profiles (id) on delete set null,
  record_type text not null,
  status public.compliance_status not null default 'pending',
  due_at date,
  completed_at date,
  finding text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.fee_schedules (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  billing_frequency text not null default 'quarterly',
  advisory_fee_bps numeric(8, 2) not null default 0,
  last_invoice_date date,
  next_invoice_date date,
  collection_status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists households_advisor_id_idx on public.households (advisor_id);
create index if not exists clients_household_id_idx on public.clients (household_id);
create index if not exists portfolios_household_id_idx on public.portfolios (household_id);
create index if not exists tasks_owner_id_idx on public.tasks (owner_id, status);
create index if not exists meetings_household_id_idx on public.meetings (household_id);
create index if not exists opportunities_owner_stage_idx on public.opportunities (owner_id, stage);
create index if not exists compliance_records_status_idx on public.compliance_records (status, due_at);

create trigger handle_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.handle_updated_at();

create trigger handle_households_updated_at
before update on public.households
for each row
execute procedure public.handle_updated_at();

create trigger handle_clients_updated_at
before update on public.clients
for each row
execute procedure public.handle_updated_at();

create trigger handle_portfolios_updated_at
before update on public.portfolios
for each row
execute procedure public.handle_updated_at();

create trigger handle_accounts_updated_at
before update on public.accounts
for each row
execute procedure public.handle_updated_at();

create trigger handle_holdings_updated_at
before update on public.holdings
for each row
execute procedure public.handle_updated_at();

create trigger handle_goals_updated_at
before update on public.goals
for each row
execute procedure public.handle_updated_at();

create trigger handle_tasks_updated_at
before update on public.tasks
for each row
execute procedure public.handle_updated_at();

create trigger handle_meetings_updated_at
before update on public.meetings
for each row
execute procedure public.handle_updated_at();

create trigger handle_documents_updated_at
before update on public.documents
for each row
execute procedure public.handle_updated_at();

create trigger handle_leads_updated_at
before update on public.leads
for each row
execute procedure public.handle_updated_at();

create trigger handle_opportunities_updated_at
before update on public.opportunities
for each row
execute procedure public.handle_updated_at();

create trigger handle_compliance_records_updated_at
before update on public.compliance_records
for each row
execute procedure public.handle_updated_at();

create trigger handle_fee_schedules_updated_at
before update on public.fee_schedules
for each row
execute procedure public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      split_part(coalesce(new.email, 'advisor'), '@', 1)
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.clients enable row level security;
alter table public.portfolios enable row level security;
alter table public.accounts enable row level security;
alter table public.holdings enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.tasks enable row level security;
alter table public.meetings enable row level security;
alter table public.documents enable row level security;
alter table public.communication_logs enable row level security;
alter table public.leads enable row level security;
alter table public.opportunities enable row level security;
alter table public.compliance_records enable row level security;
alter table public.fee_schedules enable row level security;

create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "households_all_authenticated"
on public.households
for all
to authenticated
using (true)
with check (true);

create policy "clients_all_authenticated"
on public.clients
for all
to authenticated
using (true)
with check (true);

create policy "portfolios_all_authenticated"
on public.portfolios
for all
to authenticated
using (true)
with check (true);

create policy "accounts_all_authenticated"
on public.accounts
for all
to authenticated
using (true)
with check (true);

create policy "holdings_all_authenticated"
on public.holdings
for all
to authenticated
using (true)
with check (true);

create policy "transactions_all_authenticated"
on public.transactions
for all
to authenticated
using (true)
with check (true);

create policy "goals_all_authenticated"
on public.goals
for all
to authenticated
using (true)
with check (true);

create policy "tasks_all_authenticated"
on public.tasks
for all
to authenticated
using (true)
with check (true);

create policy "meetings_all_authenticated"
on public.meetings
for all
to authenticated
using (true)
with check (true);

create policy "documents_all_authenticated"
on public.documents
for all
to authenticated
using (true)
with check (true);

create policy "communication_logs_all_authenticated"
on public.communication_logs
for all
to authenticated
using (true)
with check (true);

create policy "leads_all_authenticated"
on public.leads
for all
to authenticated
using (true)
with check (true);

create policy "opportunities_all_authenticated"
on public.opportunities
for all
to authenticated
using (true)
with check (true);

create policy "compliance_records_all_authenticated"
on public.compliance_records
for all
to authenticated
using (true)
with check (true);

create policy "fee_schedules_all_authenticated"
on public.fee_schedules
for all
to authenticated
using (true)
with check (true);
