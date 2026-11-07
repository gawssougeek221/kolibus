/* ============================================================
   KoliBus — Couche de données unique pour les 3 interfaces
   · MODE DÉMO  : backend local (localStorage), testable immédiatement
   · SUPABASE   : activé automatiquement si NEXT_PUBLIC_SUPABASE_URL
                  est défini (Auth + PostgREST + Realtime + RPC)
   Les deux implémentent la même interface KbBackend.
   ============================================================ */
'use client';

import * as React from 'react';
import type {
  AuditLog, Incident, KbNotification, Parcel, ParcelStatus, Payment,
  PickupVerification, Role, Route, Session, Stop, TariffGrid, Trip,
  TransportPartner, Vehicle, VehicleLocation, LivePosition, StatusEvent,
} from './types';
import {
  canTransitionAsRole, computeTariff, hashPickupCode, makePickupCode,
  makeReference, normalizePhone, pickupLocked, validateParcelInput,
  type CreateParcelInput,
} from './domain';

export const DB_KEY = 'kolibus_db_v1';
export const SESSION_KEY = 'kolibus_session_v1';

/* ============================================================
   Interface commune
   ============================================================ */

export interface CreateParcelResult {
  parcel: Parcel;
  pickup_code: string;   /* affiché UNE seule fois à l'expéditeur */
}

export interface KbBackend {
  readonly mode: 'demo' | 'supabase';

  /* Référentiel */
  stops(): Stop[];
  routes(): Route[];
  trips(): Trip[];
  partners(): TransportPartner[];
  vehicles(): Vehicle[];
  tariffs(): TariffGrid[];
  updateTariff(routeId: string, patch: Partial<TariffGrid>, actor: string): void;

  /* Session */
  session(): Session | null;
  setSession(s: Session | null): void;
  signIn(email: string, password: string): Promise<Session>;
  signUp(email: string, password: string, name: string, phone: string): Promise<Session>;
  signOut(): void;

  /* Colis */
  parcels(): Parcel[];
  parcelById(id: string): Parcel | null;
  parcelByRef(ref: string): Parcel | null;
  eventsFor(parcelId: string): StatusEvent[];
  createParcel(input: CreateParcelInput): Promise<CreateParcelResult>;

  /* Transitions de statut (rôles vérifiés) */
  setStatus(parcelId: string, to: ParcelStatus, actor: string, role: Role, note?: string): Parcel;
  assignParcel(parcelId: string, tripId: string, actor: string): Parcel;

  /* Retrait */
  verifyPickupCode(parcelId: string, code: string, actor: string): Promise<{ ok: boolean; error?: string }>;

  /* Trajets */
  createTrip(t: Omit<Trip, 'id' | 'created_at' | 'status'>): Trip;
  startTrip(tripId: string, actor: string): void;
  endTrip(tripId: string, actor: string): void;

  /* GPS */
  pushLocation(loc: Omit<VehicleLocation, 'id' | 'received_at'>): { ok: boolean; error?: string };
  latestLocation(tripId: string): VehicleLocation | null;
  locationsFor(tripId: string): VehicleLocation[];

  /* Notifications / incidents / paiements / audit */
  notifications(): KbNotification[];
  markNotificationsRead(): void;
  incidents(): Incident[];
  reportIncident(i: Omit<Incident, 'id' | 'created_at' | 'status'>): Incident;
  resolveIncident(id: string, actor: string): void;
  payments(): Payment[];
  recordPayment(parcelId: string, method: Payment['method'], reference: string, actor: string): Payment;
  audit(): AuditLog[];

  /* Abonnement aux changements (realtime local ou Supabase) */
  subscribe(fn: () => void): () => void;
}

/* ============================================================
   Générateurs d'id / horodatage
   ============================================================ */

let seq = 0;
export function uid(prefix: string): string {
  seq += 1;
  return `${prefix}_${Date.now().toString(36)}${seq.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
const nowIso = () => new Date().toISOString();

/* ============================================================
   Backend DÉMO — localStorage, données du pilote pré-chargées
   ============================================================ */

interface KbDb {
  version: 1;
  routes: Route[];
  stops: Stop[];
  trips: Trip[];
  partners: TransportPartner[];
  vehicles: Vehicle[];
  parcels: Parcel[];
  events: StatusEvent[];
  locations: VehicleLocation[];
  verifications: PickupVerification[];
  payments: Payment[];
  incidents: Incident[];
  notifications: KbNotification[];
  audit: AuditLog[];
  tariffs: TariffGrid[];
  pickupCodes: Record<string, string>; /* démo uniquement — haché en production */
}

const todayAt = (h: number, m: number): string => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

function seedDb(): KbDb {
  const r1 = 'route_km_pk';
  const iso = nowIso();
  return {
    version: 1,
    routes: [{ id: r1, name: 'Ligne pilote — Keur Massar ⇄ Pikine', active: true, created_at: iso }],
    stops: [
      { id: 'st_km', route_id: r1, name: 'Gare Keur Massar', area: 'Keur Massar', lat: 14.7708, lng: -17.3163, position_order: 0 },
      { id: 'st_malika', route_id: r1, name: 'Malika', area: 'Malika', lat: 14.7560, lng: -17.3330, position_order: 1 },
      { id: 'st_yeumbeul', route_id: r1, name: 'Yeumbeul', area: 'Yeumbeul', lat: 14.7447, lng: -17.3533, position_order: 2 },
      { id: 'st_diamaguene', route_id: r1, name: 'Diamaguène', area: 'Pikine', lat: 14.7380, lng: -17.3690, position_order: 3 },
      { id: 'st_pikine', route_id: r1, name: 'Gare Pikine', area: 'Pikine', lat: 14.7510, lng: -17.3880, position_order: 4 },
    ],
    trips: [
      {
        id: 'trip_aller', route_id: r1, vehicle_id: 'veh_1',
        driver_name: 'Mamadou Diallo', driver_phone: '+221775123410',
        receiver_name: 'Awa Cissé', direction: 'aller',
        depart_at: todayAt(7, 30), status: 'planifie', created_at: iso,
      },
      {
        id: 'trip_retour', route_id: r1, vehicle_id: 'veh_2',
        driver_name: 'Ibrahima Sarr', driver_phone: '+221776543210',
        receiver_name: 'Modou Fall', direction: 'retour',
        depart_at: todayAt(17, 30), status: 'planifie', created_at: iso,
      },
    ],
    partners: [
      {
        id: 'partner_1', name: 'GIE Keur Massar Express', contact_name: 'Ousmane Ba',
        contact_phone: '+221770112233', status: 'actif',
        note: 'Partenaire d\u2019exemple (démo) — à remplacer par un GIE réel signé', created_at: iso,
      },
      {
        id: 'partner_2', name: 'Coopérative Tata Pikine', contact_name: 'Ndeye Diop',
        contact_phone: '+221770445566', status: 'actif',
        note: 'Partenaire d\u2019exemple (démo) — convention à finaliser', created_at: iso,
      },
    ],
    vehicles: [
      { id: 'veh_1', partner_id: 'partner_1', type: 'tata', plate: 'DK 4521 BC', capacity: 18, model: 'Tata blanc — exemple démo', created_at: iso },
      { id: 'veh_2', partner_id: 'partner_2', type: 'tata', plate: 'DK 8730 FG', capacity: 15, model: 'Tata bleu — exemple démo', created_at: iso },
    ],
    parcels: [],
    events: [],
    locations: [],
    verifications: [],
    payments: [],
    incidents: [],
    notifications: [],
    audit: [],
    tariffs: [{
      route_id: r1, base_fcfa: 1000, per_segment_fcfa: 200, free_weight_kg: 5,
      per_kg_extra_fcfa: 150, fragile_fcfa: 300, express_fcfa: 500, updated_at: iso,
    }],
    pickupCodes: {},
  };
}

function loadDb(): KbDb {
  if (typeof window === 'undefined') return seedDb();
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (!raw) {
      const fresh = seedDb();
      window.localStorage.setItem(DB_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return JSON.parse(raw) as KbDb;
  } catch {
    return seedDb();
  }
}

export class LocalBackend implements KbBackend {
  readonly mode = 'demo' as const;
  private listeners = new Set<() => void>();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', e => {
        if (e.key === DB_KEY) this.emit();
      });
    }
  }

  private db(): KbDb { return loadDb(); }
  private save(db: KbDb) {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
    this.emit();
  }
  private emit() { this.listeners.forEach(fn => fn()); }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private addAudit(db: KbDb, actor: string, action: string, entity: string, entity_id: string, meta?: Record<string, unknown>) {
    db.audit.unshift({ id: uid('aud'), actor, action, entity, entity_id, meta, created_at: nowIso() });
    db.audit = db.audit.slice(0, 500);
  }

  private notify(db: KbDb, audience: KbNotification['audience'], type: string, title: string, body: string, parcel?: Parcel) {
    db.notifications.unshift({
      id: uid('ntf'), audience, type, title, body,
      parcel_id: parcel?.id, parcel_ref: parcel?.reference, created_at: nowIso(),
    });
  }

  /* ----- référentiel ----- */
  stops() { return this.db().stops; }
  routes() { return this.db().routes; }
  trips() { return this.db().trips; }
  partners() { return this.db().partners; }
  vehicles() { return this.db().vehicles; }
  tariffs() { return this.db().tariffs; }

  updateTariff(routeId: string, patch: Partial<TariffGrid>, actor: string) {
    const db = this.db();
    db.tariffs = db.tariffs.map(t => t.route_id === routeId ? { ...t, ...patch, updated_at: nowIso() } : t);
    this.addAudit(db, actor, 'tariff_update', 'tariffs', routeId, patch);
    this.save(db);
  }

  /* ----- session ----- */
  session(): Session | null {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as Session : null;
  }
  setSession(s: Session | null) {
    if (typeof window === 'undefined') return;
    if (s) window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else window.localStorage.removeItem(SESSION_KEY);
    this.emit();
  }
  async signIn(email: string, _password: string): Promise<Session> {
    const s: Session = { role: 'client', name: email.split('@')[0], email, demo: true, started_at: nowIso() };
    this.setSession(s);
    return s;
  }
  async signUp(email: string, _password: string, name: string, phone: string): Promise<Session> {
    const s: Session = { role: 'client', name, email, phone, demo: true, started_at: nowIso() };
    this.setSession(s);
    return s;
  }
  signOut() { this.setSession(null); }

  /* ----- colis ----- */
  parcels() { return this.db().parcels; }
  parcelById(id: string) { return this.db().parcels.find(p => p.id === id) ?? null; }
  parcelByRef(ref: string) { return this.db().parcels.find(p => p.reference === ref) ?? null; }
  eventsFor(parcelId: string) { return this.db().events.filter(e => e.parcel_id === parcelId); }

  async createParcel(input: CreateParcelInput): Promise<CreateParcelResult> {
    const errors = validateParcelInput(input);
    if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
    const senderPhone = normalizePhone(input.sender_phone)!;
    const recipPhone = normalizePhone(input.recipient_phone)!;
    const db = this.db();
    const grid = db.tariffs.find(t => t.route_id === db.stops[0]?.route_id)!;
    const price = computeTariff(db.stops, grid, input);
    if (!price) throw new Error('Trajet dépôt → retrait invalide (même arrêt ou inconnu)');
    const code = makePickupCode();
    const hash = await hashPickupCode(code);
    const parcel: Parcel = {
      id: uid('pcl'),
      reference: makeReference(),
      sender_name: input.sender_name.trim(),
      sender_phone: senderPhone,
      recipient_name: input.recipient_name.trim(),
      recipient_phone: recipPhone,
      category: input.category,
      description: input.description.trim(),
      weight_kg: Number(input.weight_kg),
      quantity: Number(input.quantity),
      fragile: input.fragile,
      express: input.express,
      dropoff_stop_id: input.dropoff_stop_id,
      pickup_stop_id: input.pickup_stop_id,
      price_fcfa: price.total,
      payment_method: input.payment_method,
      payment_status: input.payment_method === 'especes' ? 'en_attente' : 'en_attente',
      status: 'en_attente',
      pickup_code_hash: hash,
      pickup_attempts: 0,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    db.parcels.unshift(parcel);
    db.pickupCodes[parcel.id] = code; /* démo uniquement */
    db.events.push({ id: uid('evt'), parcel_id: parcel.id, status: 'en_attente', actor: input.sender_name, note: 'Envoi créé par l\u2019expéditeur', created_at: nowIso() });
    this.notify(db, 'both', 'parcel_created', 'Envoi créé', `Colis ${parcel.reference} enregistré. En attente de validation.`, parcel);
    this.addAudit(db, input.sender_name, 'parcel_create', 'parcels', parcel.id, { reference: parcel.reference, price: price.total });
    this.save(db);
    return { parcel, pickup_code: code };
  }

  setStatus(parcelId: string, to: ParcelStatus, actor: string, role: Role, note?: string): Parcel {
    const db = this.db();
    const parcel = db.parcels.find(p => p.id === parcelId);
    if (!parcel) throw new Error('Colis introuvable');
    if (!canTransitionAsRole(parcel.status, to, role)) {
      throw new Error(`Transition non autorisée : ${parcel.status} → ${to} (rôle ${role})`);
    }
    if (to === 'livre' && pickupLocked(parcel)) {
      throw new Error('Vérification bloquée : trop de tentatives de code erroné');
    }
    parcel.status = to;
    parcel.updated_at = nowIso();
    db.events.push({ id: uid('evt'), parcel_id: parcel.id, status: to, actor, note, created_at: nowIso() });
    const labels: Partial<Record<ParcelStatus, string>> = {
      confirmee: 'Envoi confirmé par KoliBus',
      affecte: 'Colis affecté à un trajet',
      prise_en_charge: 'Colis pris en charge par le transporteur',
      en_transit: 'Colis en transit — suivez la position du véhicule',
      arrive: 'Véhicule arrivé au point de récupération',
      pret_a_recuperer: 'Colis prêt à récupérer — présentez votre code',
      livre: 'Colis livré. Merci !',
      annule: 'Colis annulé',
      incident: 'Incident signalé — notre équipe intervient',
    };
    if (labels[to]) this.notify(db, 'both', `parcel_${to}`, labels[to]!, `Colis ${parcel.reference}`, parcel);
    if (to === 'annule' || to === 'incident') {
      this.addAudit(db, actor, `parcel_${to}`, 'parcels', parcel.id, { note });
    }
    this.save(db);
    return parcel;
  }

  /* Affectation d'un colis à un trajet (admin) : pose trip_id + statut */
  assignParcel(parcelId: string, tripId: string, actor: string): Parcel {
    const db = this.db();
    const parcel = db.parcels.find(p => p.id === parcelId);
    if (!parcel) throw new Error('Colis introuvable');
    const trip = db.trips.find(t => t.id === tripId);
    if (!trip) throw new Error('Trajet introuvable');
    if (trip.status === 'termine') throw new Error('Impossible d\u2019affecter à un trajet terminé');
    if (!canTransitionAsRole(parcel.status, 'affecte', 'admin')) {
      throw new Error(`Transition non autorisée : ${parcel.status} → affecte`);
    }
    parcel.trip_id = tripId;
    parcel.status = 'affecte';
    parcel.updated_at = nowIso();
    db.events.push({ id: uid('evt'), parcel_id: parcel.id, status: 'affecte', actor, note: 'Affectée à un trajet', created_at: nowIso() });
    this.notify(db, 'both', 'parcel_affecte', 'Colis affecté à un trajet', `Colis ${parcel.reference} chargé sur le tata \u2014 suivi bientôt disponible.`, parcel);
    this.addAudit(db, actor, 'parcel_assign', 'parcels', parcel.id, { trip_id: tripId });
    this.save(db);
    return parcel;
  }

  async verifyPickupCode(parcelId: string, code: string, actor: string): Promise<{ ok: boolean; error?: string }> {
    const db = this.db();
    const parcel = db.parcels.find(p => p.id === parcelId);
    if (!parcel) return { ok: false, error: 'Colis introuvable' };
    if (parcel.status !== 'pret_a_recuperer') return { ok: false, error: `Retrait impossible : colis « ${parcel.status} » (attendu : prêt à récupérer)` };
    if (pickupLocked(parcel)) return { ok: false, error: 'Vérification bloquée : 5 tentatives erronées. Contactez le support.' };
    const hash = await hashPickupCode(code);
    const ok = hash === parcel.pickup_code_hash;
    const attempt: PickupVerification = {
      id: uid('vrf'), parcel_id: parcel.id, success: ok,
      attempt_index: parcel.pickup_attempts + 1, actor, created_at: nowIso(),
    };
    db.verifications.push(attempt);
    if (ok) {
      parcel.status = 'livre';
      parcel.updated_at = nowIso();
      parcel.payment_status = parcel.payment_method === 'especes' ? 'paye' : parcel.payment_status;
      db.events.push({ id: uid('evt'), parcel_id: parcel.id, status: 'livre', actor, note: 'Code de retrait vérifié — remise confirmée', created_at: nowIso() });
      this.notify(db, 'both', 'parcel_livre', 'Colis livré', `Colis ${parcel.reference} remis contre code vérifié.`, parcel);
      this.addAudit(db, actor, 'code_verify_ok', 'parcels', parcel.id, { attempt: attempt.attempt_index });
      this.save(db);
      return { ok: true };
    }
    parcel.pickup_attempts += 1;
    parcel.updated_at = nowIso();
    this.addAudit(db, actor, 'code_verify_ko', 'parcels', parcel.id, { attempt: parcel.pickup_attempts });
    this.save(db);
    if (pickupLocked(parcel)) return { ok: false, error: 'Code erroné — 5 tentatives atteintes, vérification bloquée.' };
    return { ok: false, error: `Code erroné (${parcel.pickup_attempts}/5 tentatives)` };
  }

  /* ----- trajets ----- */
  createTrip(t: Omit<Trip, 'id' | 'created_at' | 'status'>): Trip {
    const db = this.db();
    const trip: Trip = { ...t, id: uid('trip'), status: 'planifie', created_at: nowIso() };
    db.trips.unshift(trip);
    this.addAudit(db, 'Admin', 'trip_create', 'trips', trip.id);
    this.save(db);
    return trip;
  }
  startTrip(tripId: string, actor: string) {
    const db = this.db();
    const trip = db.trips.find(t => t.id === tripId);
    if (!trip) throw new Error('Trajet introuvable');
    if (trip.status !== 'planifie') throw new Error('Trajet déjà démarré ou terminé');
    trip.status = 'en_cours';
    this.addAudit(db, actor, 'trip_start', 'trips', tripId);
    this.save(db);
  }
  endTrip(tripId: string, actor: string) {
    const db = this.db();
    const trip = db.trips.find(t => t.id === tripId);
    if (!trip) throw new Error('Trajet introuvable');
    if (trip.status !== 'en_cours') throw new Error('Trajet non démarré');
    trip.status = 'termine';
    this.addAudit(db, actor, 'trip_end', 'trips', tripId);
    this.save(db);
  }

  /* ----- GPS ----- */
  pushLocation(loc: Omit<VehicleLocation, 'id' | 'received_at'>): { ok: boolean; error?: string } {
    const db = this.db();
    const trip = db.trips.find(t => t.id === loc.trip_id);
    if (!trip) return { ok: false, error: 'Trajet introuvable' };
    if (trip.status !== 'en_cours') return { ok: false, error: 'Trajet non démarré — GPS refusé (aucune position hors mission)' };
    db.locations.push({ ...loc, id: uid('loc'), received_at: nowIso() });
    if (db.locations.length > 2000) db.locations = db.locations.slice(-2000);
    this.save(db);
    return { ok: true };
  }
  latestLocation(tripId: string): VehicleLocation | null {
    const list = this.db().locations.filter(l => l.trip_id === tripId);
    return list.length ? list[list.length - 1] : null;
  }
  locationsFor(tripId: string): VehicleLocation[] {
    return this.db().locations.filter(l => l.trip_id === tripId);
  }

  /* ----- notifications / incidents / paiements / audit ----- */
  notifications() { return this.db().notifications; }
  markNotificationsRead() {
    const db = this.db();
    db.notifications = db.notifications.map(n => ({ ...n, read_at: n.read_at ?? nowIso() }));
    this.save(db);
  }
  incidents() { return this.db().incidents; }
  reportIncident(i: Omit<Incident, 'id' | 'created_at' | 'status'>): Incident {
    const db = this.db();
    const incident: Incident = { ...i, id: uid('inc'), status: 'ouvert', created_at: nowIso() };
    db.incidents.unshift(incident);
    if (incident.parcel_id) {
      const parcel = db.parcels.find(p => p.id === incident.parcel_id);
      if (parcel && parcel.status !== 'livre' && parcel.status !== 'annule') {
        parcel.status = 'incident';
        parcel.updated_at = nowIso();
        db.events.push({ id: uid('evt'), parcel_id: parcel.id, status: 'incident', actor: i.reported_by, note: i.description, created_at: nowIso() });
        this.notify(db, 'both', 'parcel_incident', 'Incident signalé', `Colis ${parcel.reference} : ${i.type}`, parcel);
      }
    }
    this.addAudit(db, i.reported_by, 'incident_report', 'incidents', incident.id, { type: i.type });
    this.save(db);
    return incident;
  }
  resolveIncident(id: string, actor: string) {
    const db = this.db();
    const inc = db.incidents.find(i => i.id === id);
    if (!inc) throw new Error('Incident introuvable');
    inc.status = 'resolu';
    inc.resolved_at = nowIso();
    this.addAudit(db, actor, 'incident_resolve', 'incidents', id);
    this.save(db);
  }
  payments() { return this.db().payments; }
  recordPayment(parcelId: string, method: Payment['method'], reference: string, actor: string): Payment {
    const db = this.db();
    const parcel = db.parcels.find(p => p.id === parcelId);
    if (!parcel) throw new Error('Colis introuvable');
    const payment: Payment = {
      id: uid('pay'), parcel_id: parcelId, amount_fcfa: parcel.price_fcfa,
      method, status: 'paye', reference, recorded_by: actor, created_at: nowIso(),
    };
    db.payments.unshift(payment);
    parcel.payment_status = 'paye';
    parcel.payment_method = method;
    parcel.updated_at = nowIso();
    this.addAudit(db, actor, 'payment_record', 'payments', payment.id, { amount: payment.amount_fcfa, method });
    this.save(db);
    return payment;
  }
  audit() { return this.db().audit; }
}

/* ============================================================
   Backend SUPABASE — activé si les variables d'environnement
   NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY existent.
   Toute la sécurité est déléguée aux politiques RLS + RPC SQL.
   ============================================================ */

export class SupabaseBackend implements KbBackend {
  readonly mode = 'supabase' as const;
  private client: import('@supabase/supabase-js').SupabaseClient;
  private listeners = new Set<() => void>();
  private channel?: import('@supabase/supabase-js').RealtimeChannel;

  constructor(url: string, anonKey: string) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@supabase/supabase-js') as typeof import('@supabase/supabase-js');
    this.client = createClient(url, anonKey);
    this.channel = this.client.channel('kolibus')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => this.listeners.forEach(fn => fn()))
      .subscribe();
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  private emit() { this.listeners.forEach(fn => fn()); }

  /* Référentiel : en mode Supabase, les pages chargent ces listes via
     les tables publiques (RLS select) — voir docs. Ici : stubs synchrones. */
  stops(): Stop[] { return []; }
  routes() { return []; }
  trips() { return []; }
  partners() { return []; }
  vehicles() { return []; }
  tariffs() { return []; }
  updateTariff(): void { throw new Error('Mode Supabase : utiliser la console d\u2019administration connectée'); }

  session(): Session | null {
    const s = this.sessionCache;
    return s;
  }
  private sessionCache: Session | null = null;
  setSession(s: Session | null) {
    this.sessionCache = s;
    if (!s) void this.client.auth.signOut();
    this.emit();
  }
  async signIn(email: string, password: string): Promise<Session> {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const s: Session = { role: 'client', name: data.user?.email ?? 'Utilisateur', email, demo: false, started_at: nowIso() };
    this.setSession(s);
    return s;
  }
  async signUp(email: string, password: string, name: string, phone: string): Promise<Session> {
    const { error } = await this.client.auth.signUp({ email, password, options: { data: { full_name: name, phone } } });
    if (error) throw new Error(error.message);
    const s: Session = { role: 'client', name, email, phone, demo: false, started_at: nowIso() };
    this.setSession(s);
    return s;
  }
  signOut() { this.setSession(null); }

  parcels(): Parcel[] { return []; }
  parcelById(): Parcel | null { return null; }
  parcelByRef(): Parcel | null { return null; }
  eventsFor(): StatusEvent[] { return []; }

  async createParcel(input: CreateParcelInput): Promise<CreateParcelResult> {
    const { data, error } = await this.client.rpc('kolibus_create_parcel', { p_input: input });
    if (error) throw new Error(error.message);
    return data as CreateParcelResult;
  }

  setStatus(): Parcel { throw new Error('Mode Supabase : transitions via RPC côté serveur'); }
  assignParcel(): Parcel { throw new Error('Mode Supabase : affectation via console admin connectée'); }

  async verifyPickupCode(parcelId: string, code: string): Promise<{ ok: boolean; error?: string }> {
    const { data, error } = await this.client.rpc('kolibus_verify_pickup_code', {
      p_parcel_id: parcelId, p_code: code,
    });
    if (error) return { ok: false, error: error.message };
    return data as { ok: boolean; error?: string };
  }

  createTrip(): Trip { throw new Error('Mode Supabase : via console admin connectée'); }
  startTrip(): void { throw new Error('Mode Supabase : via app transport connectée'); }
  endTrip(): void { throw new Error('Mode Supabase : via app transport connectée'); }

  pushLocation(loc: Omit<VehicleLocation, 'id' | 'received_at'>): { ok: boolean; error?: string } {
    void this.client.from('vehicle_locations').insert({ ...loc, received_at: nowIso() })
      .then(() => this.emit());
    return { ok: true };
  }
  latestLocation(): VehicleLocation | null { return null; }
  locationsFor(): VehicleLocation[] { return []; }

  notifications(): KbNotification[] { return []; }
  markNotificationsRead(): void { void this.client.from('notifications').update({ read_at: nowIso() }).is('read_at', null); }
  incidents(): Incident[] { return []; }
  reportIncident(): Incident { throw new Error('Mode Supabase : via interfaces connectées'); }
  resolveIncident(): void { throw new Error('Mode Supabase : via console admin'); }
  payments(): Payment[] { return []; }
  recordPayment(): Payment { throw new Error('Mode Supabase : via console admin'); }
  audit(): AuditLog[] { return []; }
}

/* ============================================================
   Fabrique + hooks React
   ============================================================ */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

let backend: KbBackend | null = null;

export function kb(): KbBackend {
  if (!backend) {
    backend = SUPABASE_URL && SUPABASE_ANON_KEY
      ? new SupabaseBackend(SUPABASE_URL, SUPABASE_ANON_KEY)
      : new LocalBackend();
  }
  return backend;
}

export const IS_DEMO = !(SUPABASE_URL && SUPABASE_ANON_KEY);

/** S'abonne aux changements du backend et force le re-rendu. */
export function useKbSync(): number {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    const unsub = kb().subscribe(() => setV(x => x + 1));
    return () => { unsub(); };
  }, []);
  return v;
}

/** Horloge réactive (1 s) pour les libellés de fraîcheur GPS. */
export function useClock(intervalMs = 1000): number {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function pushLiveLocation(
  loc: Omit<VehicleLocation, 'id' | 'received_at'>,
): { ok: boolean; error?: string } {
  return kb().pushLocation(loc);
}

export function livePositionFor(tripId: string): LivePosition | null {
  const l = kb().latestLocation(tripId);
  return l ? {
    lat: l.lat, lng: l.lng, captured_at: l.captured_at, received_at: l.received_at,
    accuracy_m: l.accuracy_m, speed_kmh: l.speed_kmh, source: l.source,
    trip_id: l.trip_id, vehicle_id: l.vehicle_id,
  } : null;
}
