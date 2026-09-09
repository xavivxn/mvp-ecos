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
  v_last_vote timestamptz;
begin
  perform private.assert_app_secret(p_secret);

  select count(*), max(cast_at) into v_total, v_last_vote
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
    'lastVoteAt', v_last_vote,
    'hourlyActivity', coalesce((
      select jsonb_agg(s.cnt order by s.hour)
      from (
        select gs as hour, count(v.id)::int as cnt
        from generate_series(
          date_trunc('hour', now()) - interval '23 hours',
          date_trunc('hour', now()),
          interval '1 hour'
        ) gs
        left join public.votes v
          on v.election_id = p_election_id
         and date_trunc('hour', v.cast_at) = gs
        group by gs
      ) s
    ), '[]'::jsonb),
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
