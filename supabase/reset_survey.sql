-- Vacía votos, registro de votantes y visitas para arrancar la encuesta de cero.
-- No toca elección, candidatos, padrón ni secretos.
-- No es una migración: corre a mano con npm run reset:survey.

truncate
  public.votes,
  public.voter_registry,
  public.visits,
  public.verification_sessions,
  public.rate_limits
restart identity;
