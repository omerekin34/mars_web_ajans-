-- Mars Web Ajans — yönetim paneli kullanıcıları
-- Supabase SQL Editor'da bir kez çalıştırın. Komutlar tekrar çalıştırmaya uygundur.
--
-- Panele giriş Authentication > Users kaydınızla (e-posta + şifre) yapılır.
-- public.users tablosunu doldurmanız gerekmez; boş kalabilir.
-- Şifreler tarayıcıya açık olmasın diye tablo select izni kapatılır.

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  password text not null,
  created_at timestamptz not null default now(),
  constraint users_username_not_blank check (char_length(btrim(username)) > 0),
  constraint users_password_not_blank check (char_length(password) > 0)
);

create unique index if not exists users_username_unique on public.users (lower(btrim(username)));

comment on table public.users is 'Yönetim paneli giriş bilgileri. Ön yüzde gösterilmez.';
comment on column public.users.username is 'Siteye özel kullanıcı adı';
comment on column public.users.password is 'Siteye özel şifre';

alter table public.users enable row level security;

revoke all on table public.users from anon, authenticated;

do $$
begin
  if to_regclass('public.user') is not null then
    execute 'alter table public."user" enable row level security';
    execute 'revoke all on table public."user" from anon, authenticated';
  end if;
end $$;

create or replace function public.verify_admin_user(p_username text, p_password text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  tbl text;
  user_col text;
  pass_col text;
  ok boolean := false;
  uname text := lower(btrim(coalesce(p_username, '')));
begin
  if uname = '' or coalesce(p_password, '') = '' then
    return false;
  end if;

  begin
    select exists (
      select 1
      from auth.users auth_user
      where lower(btrim(coalesce(auth_user.email, ''))) = uname
        and auth_user.encrypted_password is not null
        and auth_user.encrypted_password = extensions.crypt(p_password, auth_user.encrypted_password)
        and (auth_user.banned_until is null or auth_user.banned_until < now())
    ) into ok;
  exception
    when undefined_table or undefined_column or undefined_function then
      ok := false;
  end;

  if ok then
    return true;
  end if;

  foreach tbl in array array['users', 'user'] loop
    if to_regclass(format('public.%I', tbl)) is null then
      continue;
    end if;

    select c.column_name
    into user_col
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name = tbl
      and c.column_name in ('username', 'user_name', 'email', 'kullanici_adi')
    order by case c.column_name
      when 'username' then 1
      when 'user_name' then 2
      when 'kullanici_adi' then 3
      else 4
    end
    limit 1;

    select c.column_name
    into pass_col
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name = tbl
      and c.column_name in ('password', 'sifre', 'pass')
    order by case c.column_name
      when 'password' then 1
      when 'sifre' then 2
      else 3
    end
    limit 1;

    if user_col is null or pass_col is null then
      continue;
    end if;

    execute format(
      'select exists (select 1 from public.%I where lower(btrim(%I::text)) = $1 and %I::text = $2)',
      tbl,
      user_col,
      pass_col
    ) into ok using uname, p_password;

    if ok then
      return true;
    end if;
  end loop;

  return false;
end;
$$;

comment on function public.verify_admin_user(text, text) is 'Yönetim paneli girişini Authentication users veya public.users kaydına göre doğrular.';

revoke all on function public.verify_admin_user(text, text) from public;
grant execute on function public.verify_admin_user(text, text) to anon, authenticated;

-- Panel kullanıcı listesi şifre döndürmez. Liste ancak girişten sonra
-- kaydedilen sunucu gizli anahtarıyla çekilir; anon tablo okuyamaz.
create table if not exists public.admin_gate (
  id boolean primary key default true check (id),
  secret text not null,
  updated_at timestamptz not null default now(),
  constraint admin_gate_secret_not_blank check (char_length(secret) >= 16)
);

alter table public.admin_gate enable row level security;
revoke all on table public.admin_gate from anon, authenticated;

create or replace function public.register_admin_gate(p_username text, p_password text, p_secret text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if char_length(coalesce(p_secret, '')) < 16 then
    return false;
  end if;
  if not public.verify_admin_user(p_username, p_password) then
    return false;
  end if;

  insert into public.admin_gate (id, secret, updated_at)
  values (true, p_secret, now())
  on conflict (id) do update
    set secret = excluded.secret,
        updated_at = now();

  return true;
end;
$$;

comment on function public.register_admin_gate(text, text, text) is 'Başarılı panel girişinden sonra kullanıcı listesi anahtarını kaydeder.';

revoke all on function public.register_admin_gate(text, text, text) from public;
grant execute on function public.register_admin_gate(text, text, text) to anon, authenticated;

create or replace function public.list_site_users(p_secret text)
returns table (
  id uuid,
  display_name text,
  email text,
  phone text,
  providers text,
  provider_type text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed boolean := false;
begin
  select exists (
    select 1
    from public.admin_gate gate
    where gate.secret = p_secret
      and char_length(coalesce(p_secret, '')) >= 16
  ) into allowed;

  if not allowed then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  begin
    return query
    select listed.id, listed.display_name, listed.email, listed.phone, listed.providers, listed.provider_type, listed.created_at
    from (
      select
        auth_user.id,
        nullif(btrim(coalesce(
          auth_user.raw_user_meta_data->>'display_name',
          auth_user.raw_user_meta_data->>'full_name',
          auth_user.raw_user_meta_data->>'name',
          ''
        )), '') as display_name,
        auth_user.email::text as email,
        auth_user.phone::text as phone,
        coalesce(
          nullif(array_to_string(array(
            select jsonb_array_elements_text(
              case
                when jsonb_typeof(coalesce(auth_user.raw_app_meta_data->'providers', '[]'::jsonb)) = 'array'
                  then coalesce(auth_user.raw_app_meta_data->'providers', '[]'::jsonb)
                else '[]'::jsonb
              end
            )
          ), ', '), ''),
          nullif(auth_user.raw_app_meta_data->>'provider', ''),
          'Email'
        ) as providers,
        coalesce(nullif(auth_user.raw_app_meta_data->>'provider_type', ''), '-') as provider_type,
        auth_user.created_at
      from auth.users auth_user
      union all
      select
        panel_user.id,
        panel_user.username as display_name,
        case
          when panel_user.username like '%@%' then panel_user.username
          else null
        end as email,
        null::text as phone,
        'Panel' as providers,
        '-' as provider_type,
        panel_user.created_at
      from public.users panel_user
      where not exists (
        select 1
        from auth.users auth_user
        where lower(coalesce(auth_user.email, '')) = lower(btrim(panel_user.username))
      )
    ) listed
    order by listed.created_at desc nulls last;
    return;
  exception
    when undefined_table or insufficient_privilege then
      return query
      select
        panel_user.id,
        panel_user.username,
        case
          when panel_user.username like '%@%' then panel_user.username
          else null
        end,
        null::text,
        'Panel'::text,
        '-'::text,
        panel_user.created_at
      from public.users panel_user
      order by panel_user.created_at desc nulls last;
  end;
end;
$$;

comment on function public.list_site_users(text) is 'Yönetim paneli kullanıcı listesi. Şifre içermez.';

revoke all on function public.list_site_users(text) from public;
grant execute on function public.list_site_users(text) to anon, authenticated;
