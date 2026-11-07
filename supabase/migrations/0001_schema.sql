-- ============================================================
-- KoliBus — Migration 0001 : schéma PostgreSQL (Supabase)
-- Pilote : ligne Keur Massar ⇄ Pikine · Sénégal · FCFA
-- À exécuter dans l'éditeur SQL Supabase (ou supabase db push)
-- ============================================================

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  phone       text not null check (phone ~ '^\+2217[05678][0-9]{7}$'),
  role        text not null default 'client'
              check (role in ('client','chauffeur','receveur','flotte','admin')),
  created_at  timestamptz not null default now()
);
create index if not exists profiles_role_idx on public.profiles(role);

-- Création automatique du profil à l'inscription (rôle client par défaut)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'phone', '+221700000000'),
    'client'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Promotion admin : UNIQUEMENT via SQL par le propriétaire du projet
-- (jamais depuis les clients) :
--   update public.profiles set role='admin' where id='<uuid utilisateur de confiance>';

-- ---------- PARTENAIRES & VÉHICULES ----------
create table if not exists public.transport_partners (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  contact_name  text not null,
  contact_phone text not null,
  status        text not null default 'actif' check (status in ('actif','suspendu')),
  note          text,
  created_at    timestamptz not null default now()
);

create table if not exists public.vehicles (
  id         uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.transport_partners(id) on delete cascade,
  type       text not null check (type in ('tata','minibus','voiture')),
  plate      text not null unique,
  capacity   int  not null check (capacity between 1 and 100),
  model      text,
  created_at timestamptz not null default now()
);

-- ---------- LIGNES, ARRÊTS, TRAJETS ----------
create table if not exists public.routes (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.stops (
  id             uuid primary key default gen_random_uuid(),
  route_id       uuid not null references public.routes(id) on delete cascade,
  name           text not null,
  area           text not null,
  lat            double precision not null check (lat between -90 and 90),
  lng            double precision not null check (lng between -180 and 180),
  position_order int  not null check (position_order >= 0),
  unique (route_id, position_order)
);

create table if not exists public.trips (
  id             uuid primary key default gen_random_uuid(),
  route_id       uuid not null references public.routes(id),
  vehicle_id     uuid not null references public.vehicles(id),
  driver_id      uuid references public.profiles(id),
  receiver_id    uuid references public.profiles(id),
  driver_name    text not null,
  driver_phone   text not null,
  receiver_name  text not null,
  direction      text not null check (direction in ('aller','retour')),
  depart_at      timestamptz not null,
  status         text not null default 'planifie' check (status in ('planifie','en_cours','termine')),
  created_at     timestamptz not null default now()
);
create index if not exists trips_status_idx on public.trips(status);

-- ---------- TARIFS ----------
create table if not exists public.tariffs (
  route_id            uuid primary key references public.routes(id) on delete cascade,
  base_fcfa           int not null check (base_fcfa >= 0),
  per_segment_fcfa    int not null check (per_segment_fcfa >= 0),
  free_weight_kg      numeric(4,1) not null check (free_weight_kg >= 0),
  per_kg_extra_fcfa   int not null check (per_kg_extra_fcfa >= 0),
  fragile_fcfa        int not null default 0,
  express_fcfa        int not null default 0,
  updated_at          timestamptz not null default now()
);

-- ---------- COLIS ----------
create table if not exists public.parcels (
  id                uuid primary key default gen_random_uuid(),
  reference         text not null unique,
  sender_id         uuid references public.profiles(id),
  sender_name       text not null,
  sender_phone      text not null,
  recipient_name    text not null,
  recipient_phone   text not null,
  category          text not null,
  description       text not null,
  weight_kg         numeric(5,2) not null check (weight_kg > 0 and weight_kg <= 50),
  quantity          int not null default 1 check (quantity between 1 and 20),
  fragile           boolean not null default false,
  express           boolean not null default false,
  dropoff_stop_id   uuid not null references public.stops(id),
  pickup_stop_id    uuid not null references public.stops(id),
  price_fcfa        int not null check (price_fcfa >= 0),
  payment_method    text not null default 'a_definir' check (payment_method in ('especes','mobile_money','a_definir')),
  payment_status    text not null default 'en_attente' check (payment_status in ('en_attente','paye')),
  status            text not null default 'en_attente' check (status in (
                      'en_attente','confirmee','affecte','prise_en_charge','en_transit',
                      'arrive','pret_a_recuperer','livre','annule','incident')),
  trip_id           uuid references public.trips(id),
  pickup_code_hash  text,             -- SHA-256, jamais le code en clair
  pickup_attempts   int not null default 0 check (pickup_attempts >= 0),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (dropoff_stop_id <> pickup_stop_id)
);
create index if not exists parcels_status_idx    on public.parcels(status);
create index if not exists parcels_sender_idx    on public.parcels(sender_id);
create index if not exists parcels_recipient_idx on public.parcels(recipient_phone);
create index if not exists parcels_trip_idx      on public.parcels(trip_id);
create index if not exists parcels_reference_idx on public.parcels(reference);

-- Interdire la réécriture arbitraire des statuts : on logge tout changement
create or replace function public.log_parcel_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into public.parcel_status_events (parcel_id, status, note, actor, created_at)
    values (new.id, new.status,
            'changement automatique (base)',
            coalesce(current_setting('request.jwt.claims', true)::json->>'email','system'),
            now());
  end if;
  return new;
end $$;

drop trigger if exists parcels_status_log on public.parcels;
create trigger parcels_status_log
  after update on public.parcels
  for each row execute function public.log_parcel_status();

-- ---------- ÉVÉNEMENTS DE SUIVI (historique fiable, insert-only) ----------
create table if not exists public.parcel_status_events (
  id         uuid primary key default gen_random_uuid(),
  parcel_id  uuid not null references public.parcels(id) on delete cascade,
  status     text not null,
  note       text,
  actor      text not null default 'system',
  created_at timestamptz not null default now()
);
create index if not exists status_events_parcel_idx on public.parcel_status_events(parcel_id, created_at);

-- Lecture seule par design : seules les fonctions security definer y écrivent.
revoke insert, update, delete on public.parcel_status_events from anon, authenticated;

-- ---------- POSITIONS GPS ----------
create table if not exists public.vehicle_locations (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references public.trips(id) on delete cascade,
  vehicle_id  uuid not null references public.vehicles(id),
  lat         double precision not null check (lat between -90 and 90),
  lng         double precision not null check (lng between -180 and 180),
  accuracy_m  numeric(8,1),
  speed_kmh   numeric(6,1),
  captured_at timestamptz not null,           -- horodatage téléphone
  received_at timestamptz not null default now(), -- horodatage serveur
  source      text not null default 'gps_reel' check (source in ('gps_reel','simulation'))
);
-- Lecture optimisée de la DERNIÈRE position (la carte ne lit jamais l'historique complet)
create index if not exists locations_trip_recent_idx
  on public.vehicle_locations(trip_id, received_at desc);
-- Rétention : purge des positions > 7 jours (activer via pg_cron ou un cron externe)
-- select cron.schedule('purge_locations','0 3 * * *',
--   $$delete from public.vehicle_locations where received_at < now() - interval '7 days'$$);

-- ---------- VÉRIFICATIONS DE RETRAIT ----------
create table if not exists public.pickup_verifications (
  id            uuid primary key default gen_random_uuid(),
  parcel_id     uuid not null references public.parcels(id) on delete cascade,
  success       boolean not null,
  attempt_index int not null check (attempt_index between 1 and 5),
  actor         text not null,
  created_at    timestamptz not null default now()
);
create index if not exists verifications_parcel_idx on public.pickup_verifications(parcel_id, created_at);

-- ---------- PAIEMENTS ----------
create table if not exists public.payments (
  id          uuid primary key default gen_random_uuid(),
  parcel_id   uuid not null references public.parcels(id) on delete cascade,
  amount_fcfa int not null check (amount_fcfa >= 0),
  method      text not null check (method in ('especes','mobile_money','a_definir')),
  status      text not null check (status in ('en_attente','paye')),
  reference   text,
  recorded_by text not null,
  created_at  timestamptz not null default now()
);
create index if not exists payments_parcel_idx on public.payments(parcel_id);

-- ---------- INCIDENTS ----------
create table if not exists public.incidents (
  id          uuid primary key default gen_random_uuid(),
  parcel_id   uuid references public.parcels(id) on delete set null,
  trip_id     uuid references public.trips(id) on delete set null,
  reported_by text not null,
  type        text not null check (type in ('retard','colis_endommage','colis_perdu','adresse_introuvable','autre')),
  description text not null,
  status      text not null default 'ouvert' check (status in ('ouvert','en_cours','resolu')),
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists incidents_status_idx on public.incidents(status);

-- ---------- NOTIFICATIONS ----------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade,
  audience   text not null default 'sender' check (audience in ('sender','recipient','both')),
  parcel_id  uuid references public.parcels(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text not null,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);

-- ---------- JOURNAL D'AUDIT ----------
create table if not exists public.audit_logs (
  id         uuid primary key default gen_random_uuid(),
  actor      text not null,
  action     text not null,
  entity     text not null,
  entity_id  text not null,
  meta       jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_created_idx on public.audit_logs(created_at desc);
