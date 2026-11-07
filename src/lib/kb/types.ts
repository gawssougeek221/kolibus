/* ============================================================
   KoliBus — Types partagés (Client / Transport / Admin / SQL)
   Miroir exact du schéma Supabase (supabase/migrations)
   ============================================================ */

export type Role = 'client' | 'chauffeur' | 'receveur' | 'flotte' | 'admin';

export type ParcelStatus =
  | 'en_attente'
  | 'confirmee'
  | 'affecte'
  | 'prise_en_charge'
  | 'en_transit'
  | 'arrive'
  | 'pret_a_recuperer'
  | 'livre'
  | 'annule'
  | 'incident';

export type PaymentMethod = 'especes' | 'mobile_money' | 'a_definir';
export type PaymentStatus = 'en_attente' | 'paye';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;            /* format +22177XXXXXXXX */
  email?: string;
  role: Role;
  created_at: string;
}

export interface TransportPartner {
  id: string;
  name: string;
  contact_name: string;
  contact_phone: string;
  status: 'actif' | 'suspendu';
  note?: string;            /* mention « démo » pour les partenaires d'exemple */
  created_at: string;
}

export interface Vehicle {
  id: string;
  partner_id: string;
  type: 'tata' | 'minibus' | 'voiture';
  plate: string;
  capacity: number;         /* places colis */
  model?: string;
  created_at: string;
}

export interface Stop {
  id: string;
  route_id: string;
  name: string;
  area: string;             /* commune / quartier */
  lat: number;
  lng: number;
  position_order: number;
}

export interface Route {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}

export interface Trip {
  id: string;
  route_id: string;
  vehicle_id: string;
  driver_name: string;
  driver_phone: string;
  receiver_name: string;    /* receveur du tata */
  direction: 'aller' | 'retour';
  depart_at: string;        /* ISO */
  status: 'planifie' | 'en_cours' | 'termine';
  created_at: string;
}

export interface Parcel {
  id: string;
  reference: string;        /* KB-AAJJ-XXXXXX */
  sender_id?: string;       /* profile id (Supabase) */
  sender_name: string;
  sender_phone: string;
  recipient_name: string;
  recipient_phone: string;
  category: string;
  description: string;
  weight_kg: number;
  quantity: number;
  fragile: boolean;
  express: boolean;
  dropoff_stop_id: string;  /* dépôt expéditeur */
  pickup_stop_id: string;   /* retrait destinataire */
  price_fcfa: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: ParcelStatus;
  trip_id?: string;
  pickup_code_hash?: string;/* SHA-256 — jamais le code en clair */
  pickup_attempts: number;
  created_at: string;
  updated_at: string;
}

export interface StatusEvent {
  id: string;
  parcel_id: string;
  status: ParcelStatus;
  note?: string;
  actor: string;            /* libellé lisible : « Admin », « Transporteur »… */
  created_at: string;
}

export interface VehicleLocation {
  id: string;
  trip_id: string;
  vehicle_id: string;
  lat: number;
  lng: number;
  accuracy_m?: number;
  speed_kmh?: number;
  captured_at: string;      /* horodatage téléphone */
  received_at: string;      /* horodatage serveur */
  source: 'gps_reel' | 'simulation'; /* jamais mélangés */
}

export interface PickupVerification {
  id: string;
  parcel_id: string;
  success: boolean;
  attempt_index: number;
  actor: string;
  created_at: string;
}

export interface Payment {
  id: string;
  parcel_id: string;
  amount_fcfa: number;
  method: PaymentMethod;
  status: 'en_attente' | 'paye';
  reference?: string;
  recorded_by: string;
  created_at: string;
}

export interface Incident {
  id: string;
  parcel_id?: string;
  trip_id?: string;
  reported_by: string;
  type: 'retard' | 'colis_endommage' | 'colis_perdu' | 'adresse_introuvable' | 'autre';
  description: string;
  status: 'ouvert' | 'en_cours' | 'resolu';
  created_at: string;
  resolved_at?: string;
}

export interface KbNotification {
  id: string;
  audience: 'sender' | 'recipient' | 'both';
  parcel_id?: string;
  parcel_ref?: string;
  type: string;
  title: string;
  body: string;
  read_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;           /* ex : parcel_validate, code_verify… */
  entity: string;
  entity_id: string;
  meta?: Record<string, unknown>;
  created_at: string;
}

export interface TariffGrid {
  route_id: string;
  base_fcfa: number;        /* prise en charge de base */
  per_segment_fcfa: number; /* par tronçon entre arrêts */
  free_weight_kg: number;   /* poids inclus */
  per_kg_extra_fcfa: number;/* par kg au-delà */
  fragile_fcfa: number;
  express_fcfa: number;
  updated_at: string;
}

/* ===== Session (démo) / profil connecté ===== */
export interface Session {
  role: Role;
  name: string;
  phone?: string;
  email?: string;
  demo: boolean;
  started_at: string;
}

/* ===== Position temps réel exposée au suivi ===== */
export interface LivePosition {
  lat: number;
  lng: number;
  captured_at: string;
  received_at: string;
  accuracy_m?: number;
  speed_kmh?: number;
  source: 'gps_reel' | 'simulation';
  trip_id: string;
  vehicle_id: string;
}
