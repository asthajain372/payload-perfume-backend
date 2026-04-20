-- Roles enum + table
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can view their own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can view all roles"
  on public.user_roles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- First-signup-as-admin trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_count int;
begin
  select count(*) into user_count from auth.users;
  if user_count = 1 then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name)
);

alter table public.categories enable row level security;

create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create policy "Authenticated can view categories"
  on public.categories for select
  to authenticated using (true);

create policy "Admins manage categories"
  on public.categories for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Perfumes
create table public.perfumes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  price numeric(10,2) not null check (price > 0),
  description text,
  image_url text,
  stock integer not null default 0 check (stock >= 0),
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.perfumes enable row level security;

create trigger perfumes_updated_at
  before update on public.perfumes
  for each row execute function public.set_updated_at();

create policy "Authenticated can view perfumes"
  on public.perfumes for select
  to authenticated using (true);

create policy "Admins manage perfumes"
  on public.perfumes for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create index perfumes_category_id_idx on public.perfumes(category_id);

-- Orders
create type public.order_status as enum ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (length(trim(customer_name)) > 0),
  phone text not null check (length(trim(phone)) > 0),
  items jsonb not null default '[]'::jsonb,
  total_price numeric(10,2) not null check (total_price >= 0),
  status order_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create policy "Admins manage orders"
  on public.orders for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for perfume images
insert into storage.buckets (id, name, public)
values ('perfume-images', 'perfume-images', true);

create policy "Public can view perfume images"
  on storage.objects for select
  using (bucket_id = 'perfume-images');

create policy "Admins upload perfume images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'perfume-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins update perfume images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'perfume-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins delete perfume images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'perfume-images' and public.has_role(auth.uid(), 'admin'));