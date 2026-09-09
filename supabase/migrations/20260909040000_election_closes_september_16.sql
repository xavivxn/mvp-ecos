-- La encuesta cierra el 16 de septiembre de 2026 a las 23:59 (hora de Paraguay).
update public.elections
set closes_at = timestamptz '2026-09-16 23:59:59-03'
where id = '00000000-0000-4000-8000-000000000001';
