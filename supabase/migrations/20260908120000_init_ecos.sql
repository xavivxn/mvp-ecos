-- Ecos: esquema inicial, RLS deny-all y RPCs con secreto de aplicación.
create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to postgres, service_role;

create table private.app_config (
  key text primary key,
  value text not null
);

create table private.waf_cookie_jar (
  id text primary key default 'default',
  cookie_header text not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create table public.elections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  district_code text,
  opens_at timestamptz not null,
  closes_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  race text not null check (race in ('intendente', 'concejal_lista')),
  name text not null,
  party text not null,
  color text not null,
  photo_url text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create index candidates_election_race_idx
  on public.candidates (election_id, race, sort_order);

create table public.voter_registry (
  election_id uuid not null references public.elections(id) on delete cascade,
  cedula_hash text not null,
  voted_at timestamptz not null default now(),
  district_code text,
  primary key (election_id, cedula_hash)
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  intendente_choice text not null,
  concejal_choice text not null,
  cast_at timestamptz not null default now(),
  ip_hash text,
  ua_hash text
);

create index votes_election_cast_idx on public.votes (election_id, cast_at desc);

create table public.verification_sessions (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  cedula_hash text not null,
  district_code text,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index verification_sessions_lookup_idx
  on public.verification_sessions (id, used_at, expires_at);
create index verification_sessions_election_id_idx
  on public.verification_sessions (election_id);

create table public.padron_cache (
  cedula_hash text primary key,
  eligible boolean not null,
  district_code text,
  source text not null default 'unknown',
  checked_at timestamptz not null default now()
);

create table public.visits (
  visitor_id_hash text primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  page_views int not null default 1
);

create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (key, window_start)
);

alter table public.elections enable row level security;
alter table public.candidates enable row level security;
alter table public.voter_registry enable row level security;
alter table public.votes enable row level security;
alter table public.verification_sessions enable row level security;
alter table public.padron_cache enable row level security;
alter table public.visits enable row level security;
alter table public.rate_limits enable row level security;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

create or replace function private.assert_app_secret(p_secret text)
returns void
language plpgsql
security definer
set search_path = private, extensions, pg_temp
as $$
declare
  v_expected text;
begin
  select value into v_expected
  from private.app_config
  where key = 'rpc_secret_hash';

  if v_expected is null
     or encode(digest(coalesce(p_secret, ''), 'sha256'), 'hex') is distinct from v_expected then
    raise exception 'unauthorized' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.app_check_rate_limit(
  p_secret text,
  p_key text,
  p_limit int,
  p_window_seconds int
)
returns boolean
language plpgsql
security definer
set search_path = public, private, extensions, pg_temp
as $$
declare
  v_window timestamptz;
  v_count int;
begin
  perform private.assert_app_secret(p_secret);

  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.rate_limits(key, window_start, count)
  values (p_key, v_window, 1)
  on conflict (key, window_start)
  do update set count = public.rate_limits.count + 1
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

create or replace function public.app_get_active_election(p_secret text)
returns jsonb
language plpgsql
security definer
set search_path = public, private, extensions, pg_temp
as $$
declare
  v_row public.elections%rowtype;
begin
  perform private.assert_app_secret(p_secret);

  select * into v_row
  from public.elections
  where is_active = true
  order by created_at desc
  limit 1;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'id', v_row.id,
    'name', v_row.name,
    'city', v_row.city,
    'districtCode', v_row.district_code,
    'opensAt', v_row.opens_at,
    'closesAt', v_row.closes_at,
    'isActive', v_row.is_active,
    'isOpen', now() >= v_row.opens_at and now() <= v_row.closes_at
  );
end;
$$;

create or replace function public.app_list_candidates(
  p_secret text,
  p_election_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, extensions, pg_temp
as $$
begin
  perform private.assert_app_secret(p_secret);

  return coalesce(
    (
      select jsonb_agg(jsonb_build_object(
        'id', c.id,
        'race', c.race,
        'name', c.name,
        'party', c.party,
        'color', c.color,
        'photoUrl', c.photo_url,
        'sortOrder', c.sort_order
      ) order by c.sort_order, c.name)
      from public.candidates c
      where c.election_id = p_election_id
        and c.is_active = true
    ),
    '[]'::jsonb
  );
end;
$$;

create or replace function public.app_has_voted(
  p_secret text,
  p_election_id uuid,
  p_cedula_hash text
)
returns boolean
language plpgsql
security definer
set search_path = public, private, extensions, pg_temp
as $$
begin
  perform private.assert_app_secret(p_secret);

  return exists (
    select 1
    from public.voter_registry
    where election_id = p_election_id
      and cedula_hash = p_cedula_hash
  );
end;
$$;

create or replace function public.app_get_padron_cache(
  p_secret text,
  p_cedula_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, extensions, pg_temp
as $$
declare
  v_row public.padron_cache%rowtype;
begin
  perform private.assert_app_secret(p_secret);

  select * into v_row
  from public.padron_cache
  where cedula_hash = p_cedula_hash
    and checked_at > now() - interval '30 days';

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'eligible', v_row.eligible,
    'districtCode', v_row.district_code,
    'source', v_row.source,
    'checkedAt', v_row.checked_at
  );
end;
$$;

create or replace function public.app_upsert_padron_cache(
  p_secret text,
  p_cedula_hash text,
  p_eligible boolean,
  p_district_code text,
  p_source text
)
returns void
language plpgsql
security definer
set search_path = public, private, extensions, pg_temp
as $$
begin
  perform private.assert_app_secret(p_secret);

  insert into public.padron_cache (cedula_hash, eligible, district_code, source, checked_at)
  values (p_cedula_hash, p_eligible, p_district_code, p_source, now())
  on conflict (cedula_hash)
  do update set
    eligible = excluded.eligible,
    district_code = excluded.district_code,
    source = excluded.source,
    checked_at = now();
end;
$$;

create or replace function public.app_create_session(
  p_secret text,
  p_election_id uuid,
  p_cedula_hash text,
  p_district_code text,
  p_expires_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public, private, extensions, pg_temp
as $$
declare
  v_id uuid;
begin
  perform private.assert_app_secret(p_secret);

  insert into public.verification_sessions (
    election_id, cedula_hash, district_code, expires_at
  )
  values (p_election_id, p_cedula_hash, p_district_code, p_expires_at)
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.app_cast_vote(
  p_secret text,
  p_session_id uuid,
  p_cedula_hash text,
  p_intendente text,
  p_concejal text,
  p_ip_hash text,
  p_ua_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, extensions, pg_temp
as $$
declare
  v_session public.verification_sessions%rowtype;
  v_election public.elections%rowtype;
begin
  perform private.assert_app_secret(p_secret);

  select * into v_session
  from public.verification_sessions
  where id = p_session_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_session');
  end if;

  if v_session.cedula_hash is distinct from p_cedula_hash then
    return jsonb_build_object('ok', false, 'code', 'invalid_session');
  end if;

  if v_session.used_at is not null then
    return jsonb_build_object('ok', false, 'code', 'session_used');
  end if;

  if v_session.expires_at < now() then
    return jsonb_build_object('ok', false, 'code', 'session_expired');
  end if;

  select * into v_election
  from public.elections
  where id = v_session.election_id
  for update;

  if not found or not v_election.is_active then
    return jsonb_build_object('ok', false, 'code', 'closed');
  end if;

  if now() < v_election.opens_at or now() > v_election.closes_at then
    return jsonb_build_object('ok', false, 'code', 'closed');
  end if;

  if v_election.district_code is not null
     and v_election.district_code is distinct from v_session.district_code then
    return jsonb_build_object('ok', false, 'code', 'wrong_district');
  end if;

  if p_intendente not in ('blanco', 'nulo') then
    if not exists (
      select 1 from public.candidates
      where id::text = p_intendente
        and election_id = v_election.id
        and race = 'intendente'
        and is_active = true
    ) then
      return jsonb_build_object('ok', false, 'code', 'invalid_choice');
    end if;
  end if;

  if p_concejal not in ('blanco', 'nulo') then
    if not exists (
      select 1 from public.candidates
      where id::text = p_concejal
        and election_id = v_election.id
        and race = 'concejal_lista'
        and is_active = true
    ) then
      return jsonb_build_object('ok', false, 'code', 'invalid_choice');
    end if;
  end if;

  begin
    insert into public.voter_registry (election_id, cedula_hash, district_code)
    values (v_election.id, p_cedula_hash, v_session.district_code);
  exception
    when unique_violation then
      return jsonb_build_object('ok', false, 'code', 'already_voted');
  end;

  update public.verification_sessions
  set used_at = now()
  where id = v_session.id;

  insert into public.votes (
    election_id, intendente_choice, concejal_choice, ip_hash, ua_hash
  )
  values (
    v_election.id, p_intendente, p_concejal, p_ip_hash, p_ua_hash
  );

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.app_get_results(
  p_secret text,
  p_election_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, extensions, pg_temp
as $$
declare
  v_total bigint;
  v_last24 bigint;
  v_visitors bigint;
  v_views bigint;
begin
  perform private.assert_app_secret(p_secret);

  select count(*) into v_total
  from public.votes
  where election_id = p_election_id;

  select count(*) into v_last24
  from public.votes
  where election_id = p_election_id
    and cast_at >= now() - interval '24 hours';

  select count(*), coalesce(sum(page_views), 0)
  into v_visitors, v_views
  from public.visits;

  return jsonb_build_object(
    'totalVotes', v_total,
    'votesLast24h', v_last24,
    'uniqueVisitors', coalesce(v_visitors, 0),
    'pageViews', coalesce(v_views, 0),
    'intendente', coalesce((
      select jsonb_agg(jsonb_build_object('choice', intendente_choice, 'votes', votes))
      from (
        select intendente_choice, count(*)::int as votes
        from public.votes
        where election_id = p_election_id
        group by intendente_choice
      ) s
    ), '[]'::jsonb),
    'concejal', coalesce((
      select jsonb_agg(jsonb_build_object('choice', concejal_choice, 'votes', votes))
      from (
        select concejal_choice, count(*)::int as votes
        from public.votes
        where election_id = p_election_id
        group by concejal_choice
      ) s
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.app_record_visit(
  p_secret text,
  p_visitor_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, extensions, pg_temp
as $$
begin
  perform private.assert_app_secret(p_secret);

  insert into public.visits (visitor_id_hash, first_seen, last_seen, page_views)
  values (p_visitor_hash, now(), now(), 1)
  on conflict (visitor_id_hash)
  do update set
    last_seen = now(),
    page_views = public.visits.page_views + 1;

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.app_get_waf_cookies(p_secret text)
returns jsonb
language plpgsql
security definer
set search_path = public, private, extensions, pg_temp
as $$
declare
  v_row private.waf_cookie_jar%rowtype;
begin
  perform private.assert_app_secret(p_secret);

  select * into v_row
  from private.waf_cookie_jar
  where id = 'default'
    and expires_at > now();

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'cookieHeader', v_row.cookie_header,
    'expiresAt', v_row.expires_at
  );
end;
$$;

create or replace function public.app_set_waf_cookies(
  p_secret text,
  p_cookie_header text,
  p_expires_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public, private, extensions, pg_temp
as $$
begin
  perform private.assert_app_secret(p_secret);

  insert into private.waf_cookie_jar (id, cookie_header, expires_at, updated_at)
  values ('default', p_cookie_header, p_expires_at, now())
  on conflict (id)
  do update set
    cookie_header = excluded.cookie_header,
    expires_at = excluded.expires_at,
    updated_at = now();
end;
$$;

revoke all on function private.assert_app_secret(text) from public, anon, authenticated;

grant execute on function public.app_check_rate_limit(text, text, int, int) to anon, authenticated, service_role;
grant execute on function public.app_get_active_election(text) to anon, authenticated, service_role;
grant execute on function public.app_list_candidates(text, uuid) to anon, authenticated, service_role;
grant execute on function public.app_has_voted(text, uuid, text) to anon, authenticated, service_role;
grant execute on function public.app_get_padron_cache(text, text) to anon, authenticated, service_role;
grant execute on function public.app_upsert_padron_cache(text, text, boolean, text, text) to anon, authenticated, service_role;
grant execute on function public.app_create_session(text, uuid, text, text, timestamptz) to anon, authenticated, service_role;
grant execute on function public.app_cast_vote(text, uuid, text, text, text, text, text) to anon, authenticated, service_role;
grant execute on function public.app_get_results(text, uuid) to anon, authenticated, service_role;
grant execute on function public.app_record_visit(text, text) to anon, authenticated, service_role;
grant execute on function public.app_get_waf_cookies(text) to anon, authenticated, service_role;
grant execute on function public.app_set_waf_cookies(text, text, timestamptz) to anon, authenticated, service_role;
