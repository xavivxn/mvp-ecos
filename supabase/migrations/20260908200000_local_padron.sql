-- Padrón local de Yaguarón: hashes + mesa. Retira cache TSJE y cookie WAF.
create table private.padron_electores (
  cedula_hash text primary key,
  birth_date_hash text not null,
  district_code text not null,
  local_code text,
  mesa text,
  created_at timestamptz not null default now()
);

alter table private.padron_electores enable row level security;

revoke all on table private.padron_electores from public, anon, authenticated;

create or replace function public.app_lookup_padron(
  p_secret text,
  p_cedula_hash text,
  p_birth_date_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, extensions, pg_temp
as $$
declare
  v_row private.padron_electores%rowtype;
begin
  perform private.assert_app_secret(p_secret);

  if p_cedula_hash is null or p_cedula_hash = ''
     or p_birth_date_hash is null or p_birth_date_hash = '' then
    return jsonb_build_object(
      'eligible', false,
      'districtCode', null,
      'localCode', null,
      'mesa', null
    );
  end if;

  select * into v_row
  from private.padron_electores
  where cedula_hash = p_cedula_hash
    and birth_date_hash = p_birth_date_hash;

  if not found then
    return jsonb_build_object(
      'eligible', false,
      'districtCode', null,
      'localCode', null,
      'mesa', null
    );
  end if;

  return jsonb_build_object(
    'eligible', true,
    'districtCode', v_row.district_code,
    'localCode', v_row.local_code,
    'mesa', v_row.mesa
  );
end;
$$;

create or replace function public.app_seed_padron_batch(
  p_secret text,
  p_rows jsonb
)
returns int
language plpgsql
security definer
set search_path = public, private, extensions, pg_temp
as $$
declare
  v_count int;
begin
  perform private.assert_app_secret(p_secret);

  if p_rows is null or jsonb_typeof(p_rows) is distinct from 'array' then
    raise exception 'invalid_rows' using errcode = '22023';
  end if;

  insert into private.padron_electores (
    cedula_hash, birth_date_hash, district_code, local_code, mesa
  )
  select
    r.cedula_hash,
    r.birth_date_hash,
    r.district_code,
    r.local_code,
    r.mesa
  from jsonb_to_recordset(p_rows) as r(
    cedula_hash text,
    birth_date_hash text,
    district_code text,
    local_code text,
    mesa text
  )
  where r.cedula_hash is not null
    and r.cedula_hash <> ''
    and r.birth_date_hash is not null
    and r.birth_date_hash <> ''
    and r.district_code is not null
    and r.district_code <> ''
  on conflict (cedula_hash)
  do update set
    birth_date_hash = excluded.birth_date_hash,
    district_code = excluded.district_code,
    local_code = excluded.local_code,
    mesa = excluded.mesa;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

drop function if exists public.app_get_padron_cache(text, text);
drop function if exists public.app_upsert_padron_cache(text, text, boolean, text, text);
drop function if exists public.app_get_waf_cookies(text);
drop function if exists public.app_set_waf_cookies(text, text, timestamptz);

drop table if exists public.padron_cache;
drop table if exists private.waf_cookie_jar;

grant execute on function public.app_lookup_padron(text, text, text) to anon, authenticated, service_role;
grant execute on function public.app_seed_padron_batch(text, jsonb) to anon, authenticated, service_role;
