-- Vacía votos, registro, visitas, rate limits y eventos del Acta.
-- No toca elección, candidatos, padrón ni secretos.
-- No es una migración: corre a mano con npm run reset:survey.

truncate
  public.votes,
  public.voter_registry,
  public.visits,
  public.verification_sessions,
  public.rate_limits,
  public.recap_events
restart identity;
