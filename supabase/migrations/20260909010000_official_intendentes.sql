-- Reemplaza intendentes de ejemplo por los tres candidatos oficiales de Yaguarón.
delete from public.votes
where intendente_choice in (
  '00000000-0000-4000-8000-000000000011',
  '00000000-0000-4000-8000-000000000012',
  '00000000-0000-4000-8000-000000000013',
  '00000000-0000-4000-8000-000000000014',
  '00000000-0000-4000-8000-000000000015'
);

delete from public.candidates
where id in (
  '00000000-0000-4000-8000-000000000011',
  '00000000-0000-4000-8000-000000000012',
  '00000000-0000-4000-8000-000000000013',
  '00000000-0000-4000-8000-000000000014',
  '00000000-0000-4000-8000-000000000015'
);

insert into public.candidates (id, election_id, race, name, party, color, photo_url, sort_order)
values
  (
    '00000000-0000-4000-8000-000000000031',
    '00000000-0000-4000-8000-000000000001',
    'intendente',
    'Ing. Chope del Puerto',
    'Partido Liberal Radical Auténtico (PLRA)',
    '#1E5AA8',
    '/candidates/chope-del-puerto.webp',
    1
  ),
  (
    '00000000-0000-4000-8000-000000000032',
    '00000000-0000-4000-8000-000000000001',
    'intendente',
    'Ing. César Riquelme',
    'Asociación Nacional Republicana (ANR)',
    '#CE1126',
    '/candidates/cesar-riquelme.webp',
    2
  ),
  (
    '00000000-0000-4000-8000-000000000033',
    '00000000-0000-4000-8000-000000000001',
    'intendente',
    'Alberto Sosa Vera',
    'Partido Encuentro Nacional (PEN)',
    '#F5C518',
    '/candidates/alberto-sosa-vera.webp',
    3
  );
