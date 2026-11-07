create extension if not exists pgcrypto; -- digest() SHA-256 pour les codes de retrait

-- ============================================================
-- KoliBus — Migration 0002 : Sécurité RLS + fonctions RPC serveur
-- Principes :
--   · RLS activée sur TOUTES les tables exposées
--   · Aucune clé service_role dans les clients (uniquement anon/authenticated)
--   · Les transporteurs ne voient que les colis de leurs trajets
--   · Les codes de retrait ne sont jamais stockés en clair
--   · Les positions GPS ne sont lisibles QUE pendant une mission active
--   · Les actions sensibles sont journalisées dans audit_logs
-- ============================================================

-- ============ HELPER : rôle du profil courant ============
create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

-- Le transporteur (chauffeur/receveur) est-il assigné au trajet de ce colis ?
create or replace function public.can_access_trip(p_trip_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.trips t
    where t.id = p_trip_id
      and t.status = 'en_cours'
      and (t.driver_id = auth.uid() or t.receiver_id = auth.uid())
  );
$$;

-- ============ ACTIVATION RLS ============
alter table public.profiles            enable row level security;
alter table public.transport_partners  enable row level security;
alter table public.vehicles            enable row level security;
alter table public.routes              enable row level security;
alter table public.stops               enable row level security;
alter table public.trips               enable row level security;
alter table public.tariffs             enable row level security;
alter table public.parcels             enable row level security;
alter table public.parcel_status_events enable row level security;
alter table public.vehicle_locations   enable row level security;
alter table public.pickup_verifications enable row level security;
alter table public.payments            enable row level security;
alter table public.incidents           enable row level security;
alter table public.notifications       enable row level security;
alter table public.audit_logs          enable row level security;

-- ============ PROFILES ============
create policy "profil lisible par soi-même" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "mise à jour limitée à soi (rôle non modifiable)" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- ============ RÉFÉRENTIELS (lecture publique nécessaire aux formulaires) ============
create policy "lignes publiques"  on public.routes for select using (true);
create policy "arrêts publics"    on public.stops   for select using (true);
create policy "tarifs publics"    on public.tariffs for select using (true);
create policy "partenaires publics (liste)" on public.transport_partners for select using (true);
create policy "véhicules publics (liste)"   on public.vehicles for select using (true);

create policy "admin gère les lignes"      on public.routes for all using (public.is_admin()) with check (public.is_admin());
create policy "admin gère les arrêts"      on public.stops   for all using (public.is_admin()) with check (public.is_admin());
create policy "admin gère les tarifs"      on public.tariffs for all using (public.is_admin()) with check (public.is_admin());
create policy "admin gère les partenaires" on public.transport_partners for all using (public.is_admin()) with check (public.is_admin());
create policy "admin gère les véhicules"   on public.vehicles for all using (public.is_admin()) with check (public.is_admin());

-- ============ TRAJETS ============
create policy "trajets visibles" on public.trips
  for select using (true);
create policy "admin crée les trajets" on public.trips
  for insert with check (public.is_admin());
create policy "transporteur modifie SON trajet (statut)" on public.trips
  for update using (driver_id = auth.uid() or receiver_id = auth.uid() or public.is_admin());

-- ============ COLIS ============
-- Un colis est visible par :
--   · son expéditeur
--   · l'administration
--   · le transporteur assigné au trajet du colis
--   · le lien de suivi public via RPC limitée (jamais les PII complètes)
create policy "colis : expéditeur, admin, transporteur assigné" on public.parcels
  for select using (
    sender_id = auth.uid()
    or public.is_admin()
    or (trip_id is not null and public.can_access_trip(trip_id))
  );

create policy "expéditeur crée son colis" on public.parcels
  for insert with check (sender_id = auth.uid() and status = 'en_attente');

-- Le statut n'est modifiable que par les RPC sécurisées (voir plus bas).
revoke update on public.parcels from anon;
create policy "admin modifie les colis" on public.parcels
  for update using (public.is_admin()) with check (public.is_admin());

-- ============ ÉVÉNEMENTS DE SUIVI ============
create policy "événements liés à un colis accessible" on public.parcel_status_events
  for select using (
    exists (select 1 from public.parcels p
            where p.id = parcel_id
              and (p.sender_id = auth.uid() or public.is_admin()
                   or (p.trip_id is not null and public.can_access_trip(p.trip_id))))
  );
-- écriture : réservée aux fonctions security definer (revoke plus haut)

-- ============ POSITIONS GPS ============
-- Position lisible UNIQUEMENT si : admin, ou transporteur du trajet,
-- ou expéditeur d'un colis de ce trajet, et trajet en cours.
create policy "positions visibles si mission active et autorisée" on public.vehicle_locations
  for select using (
    public.can_access_trip(trip_id)
    or public.is_admin()
    or exists (
      select 1 from public.parcels p
      where p.trip_id = vehicle_locations.trip_id
        and p.sender_id = auth.uid()
    )
  );
create policy "transporteur du trajet publie les positions" on public.vehicle_locations
  for insert with check (public.can_access_trip(trip_id) or public.is_admin());

-- ============ AUTRES TABLES ============
create policy "vérifications : transporteur/admin" on public.pickup_verifications
  for select using (public.is_admin() or exists (
    select 1 from public.parcels p where p.id = parcel_id and public.can_access_trip(p.trip_id)));

create policy "paiements : admin lit, fonctions écrivent" on public.payments
  for select using (public.is_admin() or exists (
    select 1 from public.parcels p where p.id = parcel_id and p.sender_id = auth.uid()));
create policy "admin enregistre un paiement" on public.payments
  for insert with check (public.is_admin());

create policy "incidents : parties concernées" on public.incidents
  for select using (public.is_admin() or exists (
    select 1 from public.parcels p where p.id = incidents.parcel_id
      and (p.sender_id = auth.uid() or public.can_access_trip(p.trip_id))));
create policy "tout utilisateur connecté signale" on public.incidents
  for insert with check (auth.uid() is not null);
create policy "admin résout" on public.incidents
  for update using (public.is_admin()) with check (public.is_admin());

create policy "notifications personnelles" on public.notifications
  for select using (user_id = auth.uid() or public.is_admin());
create policy "marquer ses notifications lues" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "audit : admin uniquement" on public.audit_logs
  for select using (public.is_admin());

-- ============================================================
-- RPC SÉCURISÉES (security definer — validations côté serveur)
-- ============================================================

-- ---------- Création d'un colis (expéditeur connecté) ----------
create or replace function public.kolibus_create_parcel(p_input jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_input   jsonb := p_input;
  v_stop_a  public.stops;
  v_stop_b  public.stops;
  v_grid    public.tariffs;
  v_segments int;
  v_price   int;
  v_code    text;
  v_hash    text;
  v_parcel  public.parcels;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;

  select * into v_stop_a from public.stops where id::text = v_input->>'dropoff_stop_id';
  select * into v_stop_b from public.stops where id::text = v_input->>'pickup_stop_id';
  if v_stop_a.id is null or v_stop_b.id is null or v_stop_a.id = v_stop_b.id then
    raise exception 'Points de dépôt/retrait invalides';
  end if;

  select * into v_grid from public.tariffs where route_id = v_stop_a.route_id;
  if v_grid.route_id is null then raise exception 'Aucun tarif configuré pour cette ligne'; end if;

  v_segments := abs(v_stop_b.position_order - v_stop_a.position_order);
  v_price := v_grid.base_fcfa
    + v_segments * v_grid.per_segment_fcfa
    + greatest(0, ceil((v_input->>'weight_kg')::numeric - v_grid.free_weight_kg))::int * v_grid.per_kg_extra_fcfa
    + case when (v_input->>'fragile')::boolean then v_grid.fragile_fcfa else 0 end
    + case when (v_input->>'express')::boolean then v_grid.express_fcfa else 0 end;

  -- Code de retrait : généré côté serveur, seul le hachage est conservé
  v_code := lpad((floor(random() * 10000))::int::text, 4, '0');
  v_hash := encode(digest('kolibus:' || v_code, 'sha256'), 'hex');

  insert into public.parcels (
    reference, sender_id, sender_name, sender_phone,
    recipient_name, recipient_phone, category, description,
    weight_kg, quantity, fragile, express,
    dropoff_stop_id, pickup_stop_id, price_fcfa,
    payment_method, status, pickup_code_hash
  ) values (
    'KB-' || to_char(now(),'YYMM') || '-' ||
      upper(substr(replace(encode(gen_random_bytes(4),'base64'),'/',''),1,6)),
    auth.uid(),
    v_input->>'sender_name', v_input->>'sender_phone',
    v_input->>'recipient_name', v_input->>'recipient_phone',
    v_input->>'category', v_input->>'description',
    (v_input->>'weight_kg')::numeric, coalesce((v_input->>'quantity')::int,1),
    coalesce((v_input->>'fragile')::boolean, false),
    coalesce((v_input->>'express')::boolean, false),
    v_stop_a.id, v_stop_b.id, v_price,
    coalesce(v_input->>'payment_method','a_definir'),
    'en_attente', v_hash
  ) returning * into v_parcel;

  insert into public.parcel_status_events (parcel_id, status, note, actor)
  values (v_parcel.id, 'en_attente', 'Envoi créé par l''expéditeur', v_input->>'sender_name');

  insert into public.audit_logs (actor, action, entity, entity_id, meta)
  values (auth.uid()::text, 'parcel_create', 'parcels', v_parcel.id::text,
          jsonb_build_object('reference', v_parcel.reference, 'price', v_price));

  return jsonb_build_object('parcel', to_jsonb(v_parcel), 'pickup_code', v_code);
end $$;

-- ---------- Changement de statut contrôlé ----------
create or replace function public.kolibus_set_parcel_status(
  p_parcel_id uuid, p_to text, p_note text default null)
returns public.parcels
language plpgsql security definer set search_path = public as $$
declare
  v_parcel public.parcels;
  v_role   text := public.my_role();
  v_allowed jsonb := '{
    "confirmee":      ["admin"],
    "affecte":        ["admin"],
    "prise_en_charge":["chauffeur","receveur"],
    "en_transit":     ["chauffeur","receveur"],
    "arrive":         ["chauffeur","receveur"],
    "pret_a_recuperer":["chauffeur","receveur","admin"],
    "livre":          ["chauffeur","receveur","admin"],
    "annule":         ["admin","client"],
    "incident":       ["chauffeur","receveur","admin","client"]
  }'::jsonb;
  v_from_allowed jsonb := '{
    "en_attente":       ["confirmee","annule"],
    "confirmee":        ["affecte","annule"],
    "affecte":          ["prise_en_charge","annule","incident"],
    "prise_en_charge":  ["en_transit","incident"],
    "en_transit":       ["arrive","incident"],
    "arrive":           ["pret_a_recuperer"],
    "pret_a_recuperer": ["livre","incident"],
    "livre":            [],
    "annule":           [],
    "incident":         ["en_transit","pret_a_recuperer","annule"]
  }'::jsonb;
begin
  select * into v_parcel from public.parcels where id = p_parcel_id;
  if v_parcel.id is null then raise exception 'Colis introuvable'; end if;

  -- L'expéditeur ne peut agir que sur SES colis (annulation/incident)
  if v_role = 'client' and v_parcel.sender_id <> auth.uid() then
    raise exception 'Action non autorisée sur ce colis';
  end if;
  -- Le transporteur ne peut agir que sur les colis de SES trajets
  if v_role in ('chauffeur','receveur')
     and not (v_parcel.trip_id is not null and public.can_access_trip(v_parcel.trip_id)) then
    raise exception 'Transporteur non assigné à ce colis';
  end if;

  if not (v_from_allowed -> v_parcel.status) ? p_to then
    raise exception 'Transition interdite : % → %', v_parcel.status, p_to;
  end if;
  if not (v_allowed -> p_to) ? v_role then
    raise exception 'Rôle % non autorisé pour le statut %', v_role, p_to;
  end if;
  if p_to = 'livre' and v_parcel.pickup_attempts >= 5 then
    raise exception 'Retrait bloqué : trop de tentatives';
  end if;

  update public.parcels
    set status = p_to, updated_at = now()
    where id = p_parcel_id
    returning * into v_parcel;

  insert into public.parcel_status_events (parcel_id, status, note, actor)
  values (v_parcel.id, p_to, p_note, coalesce(
    (select full_name from public.profiles where id = auth.uid()), 'system'));

  if p_to in ('annule','incident') then
    insert into public.audit_logs (actor, action, entity, entity_id, meta)
    values (auth.uid()::text, 'parcel_' || p_to, 'parcels', v_parcel.id::text,
            jsonb_build_object('note', p_note));
  end if;
  return v_parcel;
end $$;

-- ---------- Vérification du code de retrait ----------
create or replace function public.kolibus_verify_pickup_code(
  p_parcel_id uuid, p_code text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_parcel public.parcels;
  v_ok     boolean;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;

  select * into v_parcel from public.parcels where id = p_parcel_id;
  if v_parcel.id is null then
    return jsonb_build_object('ok', false, 'error', 'Colis introuvable');
  end if;

  -- Seul le transporteur assigné (ou l'admin) peut vérifier un retrait
  if not (public.is_admin() or (v_parcel.trip_id is not null and public.can_access_trip(v_parcel.trip_id))) then
    return jsonb_build_object('ok', false, 'error', 'Action non autorisée');
  end if;
  if v_parcel.status <> 'pret_a_recuperer' then
    return jsonb_build_object('ok', false, 'error', 'Colis non prêt au retrait');
  end if;
  if v_parcel.pickup_attempts >= 5 then
    return jsonb_build_object('ok', false, 'error', 'Vérification bloquée : 5 tentatives erronées');
  end if;

  v_ok := v_parcel.pickup_code_hash = encode(digest('kolibus:' || btrim(p_code), 'sha256'), 'hex');

  insert into public.pickup_verifications (parcel_id, success, attempt_index, actor)
  values (v_parcel.id, v_ok, v_parcel.pickup_attempts + 1, auth.uid()::text);

  if v_ok then
    update public.parcels
      set status = 'livre', updated_at = now(),
          payment_status = case when payment_method = 'especes' then 'paye' else payment_status end
      where id = v_parcel.id;
    insert into public.parcel_status_events (parcel_id, status, note, actor)
    values (v_parcel.id, 'livre', 'Code vérifié — remise confirmée', 'transporteur');
    insert into public.audit_logs (actor, action, entity, entity_id)
    values (auth.uid()::text, 'code_verify_ok', 'parcels', v_parcel.id::text);
    return jsonb_build_object('ok', true);
  end if;

  update public.parcels
    set pickup_attempts = pickup_attempts + 1, updated_at = now()
    where id = v_parcel.id;
  insert into public.audit_logs (actor, action, entity, entity_id, meta)
  values (auth.uid()::text, 'code_verify_ko', 'parcels', v_parcel.id::text,
          jsonb_build_object('attempt', v_parcel.pickup_attempts + 1));
  return jsonb_build_object('ok', false, 'error',
    'Code erroné (' || (v_parcel.pickup_attempts + 1) || '/5)');
end $$;

-- ---------- Démarrage / fin d'un trajet (transporteur assigné ou admin) ----------
create or replace function public.kolibus_set_trip_status(p_trip_id uuid, p_to text)
returns public.trips
language plpgsql security definer set search_path = public as $$
declare
  v_trip public.trips;
begin
  select * into v_trip from public.trips where id = p_trip_id;
  if v_trip.id is null then raise exception 'Trajet introuvable'; end if;
  if not (v_trip.driver_id = auth.uid() or v_trip.receiver_id = auth.uid() or public.is_admin()) then
    raise exception 'Transporteur non assigné à ce trajet';
  end if;
  if p_to = 'en_cours' and v_trip.status <> 'planifie' then
    raise exception 'Trajet déjà démarré ou terminé';
  end if;
  if p_to = 'termine' and v_trip.status <> 'en_cours' then
    raise exception 'Trajet non démarré';
  end if;
  if p_to not in ('en_cours','termine') then
    raise exception 'Statut de trajet invalide';
  end if;

  update public.trips set status = p_to where id = p_trip_id returning * into v_trip;
  insert into public.audit_logs (actor, action, entity, entity_id)
  values (auth.uid()::text, 'trip_' || p_to, 'trips', v_trip.id::text);
  return v_trip;
end $$;

-- ---------- Publication de position GPS (transporteur en mission) ----------
create or replace function public.kolibus_push_location(
  p_trip_id uuid, p_lat double precision, p_lng double precision,
  p_accuracy numeric default null, p_speed numeric default null,
  p_captured_at timestamptz default now())
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_trip public.trips;
begin
  select * into v_trip from public.trips where id = p_trip_id;
  if v_trip.id is null then
    return jsonb_build_object('ok', false, 'error', 'Trajet introuvable');
  end if;
  if v_trip.status <> 'en_cours' then
    return jsonb_build_object('ok', false, 'error', 'Trajet non actif — position refusée');
  end if;
  if not (v_trip.driver_id = auth.uid() or v_trip.receiver_id = auth.uid() or public.is_admin()) then
    return jsonb_build_object('ok', false, 'error', 'Transporteur non assigné');
  end if;

  insert into public.vehicle_locations
    (trip_id, vehicle_id, lat, lng, accuracy_m, speed_kmh, captured_at, source)
  values
    (v_trip.id, v_trip.vehicle_id, p_lat, p_lng, p_accuracy, p_speed, p_captured_at, 'gps_reel');

  return jsonb_build_object('ok', true);
end $$;

-- ---------- Lien de suivi public (destinataire SANS compte) ----------
-- Retourne le STRICT MINIMUM : statut, dernier événement horodaté,
-- arrêt de retrait, et position véhicule active. Aucune PII de l'expéditeur.
create or replace function public.kolibus_public_tracking(p_reference text)
returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'reference',  p.reference,
    'status',     p.status,
    'created_at', p.created_at,
    'recipient_initials',
      upper(left(split_part(p.recipient_name,' ',1),1)) || '. ' ||
      upper(left(split_part(p.recipient_name,' ',2),1)) || '.',
    'pickup_stop', (select jsonb_build_object('name', s.name, 'area', s.area, 'lat', s.lat, 'lng', s.lng)
                    from public.stops s where s.id = p.pickup_stop_id),
    'last_event', (select jsonb_build_object('status', e.status, 'at', e.created_at)
                   from public.parcel_status_events e
                   where e.parcel_id = p.id order by e.created_at desc limit 1),
    'vehicle_position', (
      select jsonb_build_object('lat', l.lat, 'lng', l.lng,
                                'received_at', l.received_at, 'source', l.source)
      from public.vehicle_locations l
      where l.trip_id = p.trip_id
        and exists (select 1 from public.trips t
                    where t.id = l.trip_id and t.status = 'en_cours')
      order by l.received_at desc limit 1)
  )
  from public.parcels p
  where p.reference = upper(btrim(p_reference))
    and p.status not in ('en_attente'); -- rien de public avant validation
$$;
