-- Datos de ejemplo para el MVP. Reemplazar por candidatos reales antes del lanzamiento.
insert into public.elections (id, name, city, district_code, opens_at, closes_at, is_active)
values (
  '00000000-0000-4000-8000-000000000001',
  'Elecciones Municipales 2026',
  'Yaguarón',
  null,
  now() - interval '1 day',
  timestamptz '2026-10-04 23:59:59-03',
  true
);

insert into public.candidates (id, election_id, race, name, party, color, sort_order) values
  ('00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', 'intendente', 'Marina Benítez', 'Alianza Ciudadana', '#2F6B4F', 1),
  ('00000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000001', 'intendente', 'Óscar Villalba', 'Movimiento Futuro', '#1F4E8C', 2),
  ('00000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000001', 'intendente', 'Lucía Ferreira', 'Frente Independiente', '#8C3A2F', 3),
  ('00000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000001', 'intendente', 'Héctor Núñez', 'Unión Vecinal', '#5B4B8C', 4),
  ('00000000-0000-4000-8000-000000000015', '00000000-0000-4000-8000-000000000001', 'intendente', 'Ana Romero', 'Encuentro Popular', '#B8860B', 5),
  ('00000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-000000000001', 'concejal_lista', 'Lista 1', 'Alianza Ciudadana', '#2F6B4F', 1),
  ('00000000-0000-4000-8000-000000000022', '00000000-0000-4000-8000-000000000001', 'concejal_lista', 'Lista 2', 'Movimiento Futuro', '#1F4E8C', 2),
  ('00000000-0000-4000-8000-000000000023', '00000000-0000-4000-8000-000000000001', 'concejal_lista', 'Lista 3', 'Frente Independiente', '#8C3A2F', 3),
  ('00000000-0000-4000-8000-000000000024', '00000000-0000-4000-8000-000000000001', 'concejal_lista', 'Lista 4', 'Unión Vecinal', '#5B4B8C', 4),
  ('00000000-0000-4000-8000-000000000025', '00000000-0000-4000-8000-000000000001', 'concejal_lista', 'Lista 5', 'Encuentro Popular', '#B8860B', 5),
  ('00000000-0000-4000-8000-000000000026', '00000000-0000-4000-8000-000000000001', 'concejal_lista', 'Lista 6', 'Voces del Barrio', '#3D6B8C', 6);
