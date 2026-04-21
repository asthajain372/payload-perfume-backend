-- Allow public (anonymous) visitors to view perfumes and categories on the storefront
drop policy if exists "Authenticated can view perfumes" on public.perfumes;
drop policy if exists "Authenticated can view categories" on public.categories;

create policy "Anyone can view perfumes"
on public.perfumes
for select
to anon, authenticated
using (true);

create policy "Anyone can view categories"
on public.categories
for select
to anon, authenticated
using (true);

-- Allow anyone to place an order (insert), but only admins can read/update them (existing policy stays)
create policy "Anyone can place orders"
on public.orders
for insert
to anon, authenticated
with check (true);