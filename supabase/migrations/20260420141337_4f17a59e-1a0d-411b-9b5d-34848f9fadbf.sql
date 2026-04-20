create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

-- Replace broad public select with: public can read individual files (already works via public bucket flag for direct URLs), but only admins can list bucket contents via storage API.
drop policy if exists "Public can view perfume images" on storage.objects;

create policy "Admins can list perfume images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'perfume-images' and public.has_role(auth.uid(), 'admin'));