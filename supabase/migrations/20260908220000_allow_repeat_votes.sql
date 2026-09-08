drop function if exists public.app_cast_vote(text, uuid, text, text, text, text, text);

create or replace function public.app_cast_vote(
  p_secret text,
  p_session_id uuid,
  p_cedula_hash text,
  p_intendente text,
  p_concejal text,
  p_ip_hash text,
  p_ua_hash text,
  p_allow_repeat boolean default false
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

  if p_intendente <> 'blanco' then
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

  if p_concejal <> 'blanco' then
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

  if coalesce(p_allow_repeat, false) then
    insert into public.voter_registry (election_id, cedula_hash, district_code)
    values (v_election.id, p_cedula_hash, v_session.district_code)
    on conflict (election_id, cedula_hash) do nothing;
  else
    begin
      insert into public.voter_registry (election_id, cedula_hash, district_code)
      values (v_election.id, p_cedula_hash, v_session.district_code);
    exception
      when unique_violation then
        return jsonb_build_object('ok', false, 'code', 'already_voted');
    end;
  end if;

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

grant execute on function public.app_cast_vote(text, uuid, text, text, text, text, text, boolean) to anon, authenticated, service_role;
