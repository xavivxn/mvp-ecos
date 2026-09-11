-- Analíticas privadas. Pegá esto en el SQL editor de Supabase.
-- No va al Acta pública. Los hashes no identifican a nadie.

-- Acta: personas vs vistas
select
  count(*) filter (where event = 'recap_view') as recap_views,
  count(distinct visitor_id_hash) filter (where event = 'recap_view') as recap_visitors
from public.recap_events;

-- Acta: shares (clic vs native vs copy)
select
  count(*) filter (where event = 'share_click') as share_clicks,
  count(distinct visitor_id_hash) filter (where event = 'share_click') as people_who_tapped_share,
  count(*) filter (where event = 'share_native') as share_native,
  count(*) filter (where event = 'share_copy') as share_copy,
  count(distinct visitor_id_hash) filter (
    where event in ('share_native', 'share_copy')
  ) as people_who_shared
from public.recap_events;

-- Tasa de share del Acta
with acta as (
  select
    count(distinct visitor_id_hash) filter (where event = 'recap_view') as visitors,
    count(distinct visitor_id_hash) filter (
      where event in ('share_click', 'share_native', 'share_copy')
    ) as sharers
  from public.recap_events
)
select
  visitors,
  sharers,
  case when visitors = 0 then 0
       else round(100.0 * sharers / visitors, 1)
  end as share_rate_pct
from acta;

-- Curva diaria del Acta (hora de Paraguay)
select
  (created_at at time zone 'America/Asuncion')::date as day,
  count(*) filter (where event = 'recap_view') as views,
  count(distinct visitor_id_hash) filter (where event = 'recap_view') as visitors,
  count(*) filter (where event = 'share_click') as share_clicks,
  count(*) filter (where event in ('share_native', 'share_copy')) as shares_done
from public.recap_events
group by 1
order by 1;

-- Invite post-voto (durante la encuesta)
select
  count(*) filter (where event = 'invite_share_click') as invite_clicks,
  count(distinct visitor_id_hash) filter (where event = 'invite_share_click') as people_who_tapped_invite,
  count(*) filter (where event = 'invite_share_native') as invite_native,
  count(*) filter (where event = 'invite_share_copy') as invite_copy
from public.recap_events;

-- Embudo ya existente (encuesta viva, no el Acta)
select
  (select count(*) from public.visits) as visitors,
  (select coalesce(sum(page_views), 0) from public.visits) as page_views,
  (select count(*) from public.verification_sessions) as sessions_started,
  (select count(*) from public.verification_sessions where used_at is not null) as sessions_completed,
  (select count(*) from public.voter_registry) as unique_voters,
  (select count(*) from public.votes) as ballots;

-- % que llega al voto
select
  round(
    100.0 * count(*) filter (where used_at is not null) / nullif(count(*), 0),
    1
  ) as verify_to_vote_pct
from public.verification_sessions;

-- Votos en blanco vs listas
select
  count(*) filter (where intendente_choice = 'blanco') as intendente_blanco,
  count(*) filter (where concejal_choice = 'blanco') as concejal_blanco,
  count(*) filter (where intendente_choice <> 'blanco') as intendente_lista,
  count(*) filter (where concejal_choice <> 'blanco') as concejal_lista,
  count(*) as total
from public.votes;

-- Recargas: distribución de page_views por visitante de la encuesta
select
  page_views,
  count(*) as visitors
from public.visits
group by page_views
order by page_views;
