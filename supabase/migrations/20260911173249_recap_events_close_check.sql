create or replace function public.app_record_recap_event(
  p_secret text,
  p_visitor_hash text,
  p_event text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, extensions, pg_temp
as $$
declare
  v_election public.elections%rowtype;
  v_invite boolean;
begin
  perform private.assert_app_secret(p_secret);

  if p_visitor_hash is null or length(p_visitor_hash) < 16 then
    return jsonb_build_object('ok', false, 'code', 'invalid_visitor');
  end if;

  if p_event not in (
    'recap_view',
    'share_click',
    'share_native',
    'share_copy',
    'invite_share_click',
    'invite_share_native',
    'invite_share_copy'
  ) then
    return jsonb_build_object('ok', false, 'code', 'invalid_event');
  end if;

  select * into v_election
  from public.elections
  where is_active = true
  order by created_at desc
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'no_election');
  end if;

  v_invite := p_event like 'invite_share_%';

  if not v_invite and now() <= v_election.closes_at then
    return jsonb_build_object('ok', false, 'code', 'not_recap');
  end if;

  insert into public.recap_events (election_id, visitor_id_hash, event)
  values (v_election.id, p_visitor_hash, p_event);

  return jsonb_build_object('ok', true);
end;
$$;
