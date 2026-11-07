-- ============================================================
-- KoliBus — Seed : données du pilote Keur Massar ⇄ Pikine
-- Exécuter APRÈS 0001 et 0002.
-- ATTENTION : les partenaires/véhicules ci-dessous sont des
-- EXEMPLES DE DÉMO — à remplacer par les partenaires réels signés.
-- ============================================================

-- Ligne pilote
insert into public.routes (id, name, active)
values ('11111111-1111-1111-1111-111111111111', 'Ligne pilote — Keur Massar ⇄ Pikine', true)
on conflict do nothing;

-- Arrêts (coordonnées indicatives à affiner par relevé terrain)
insert into public.stops (id, route_id, name, area, lat, lng, position_order) values
  ('a0000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Gare Keur Massar','Keur Massar', 14.7708,-17.3163,0),
  ('a0000000-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','Malika','Malika',       14.7560,-17.3330,1),
  ('a0000000-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','Yeumbeul','Yeumbeul',   14.7447,-17.3533,2),
  ('a0000000-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111','Diamaguène','Pikine',   14.7380,-17.3690,3),
  ('a0000000-0000-0000-0000-000000000005','11111111-1111-1111-1111-111111111111','Gare Pikine','Pikine',  14.7510,-17.3880,4)
on conflict do nothing;

-- Grille tarifaire (FCFA) — modifiable depuis l'administration
insert into public.tariffs
  (route_id, base_fcfa, per_segment_fcfa, free_weight_kg, per_kg_extra_fcfa, fragile_fcfa, express_fcfa)
values
  ('11111111-1111-1111-1111-111111111111', 1000, 200, 5, 150, 300, 500)
on conflict (route_id) do nothing;

-- Partenaires D'EXEMPLE (démo — jamais présenter comme réels)
insert into public.transport_partners (id, name, contact_name, contact_phone, note) values
  ('b0000000-0000-0000-0000-000000000001','GIE Keur Massar Express','Ousmane Ba','+221770112233','Partenaire d''exemple (démo) — à remplacer après signature'),
  ('b0000000-0000-0000-0000-000000000002','Coopérative Tata Pikine','Ndeye Diop','+221770445566','Partenaire d''exemple (démo) — convention à finaliser')
on conflict do nothing;

insert into public.vehicles (id, partner_id, type, plate, capacity, model) values
  ('c0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001','tata','DK 4521 BC',18,'Tata blanc — exemple démo'),
  ('c0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000002','tata','DK 8730 FG',15,'Tata bleu — exemple démo')
on conflict do nothing;
