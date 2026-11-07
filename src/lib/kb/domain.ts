/* ============================================================
   KoliBus — Logique métier pure (testable sans backend)
   Machine à états colis · tarifs FCFA · validation Sénégal
   Références · codes de retrait · fraîcheur GPS
   ============================================================ */
import type {
  Parcel, ParcelStatus, Stop, TariffGrid, PaymentMethod, Role,
} from './types';

/* ---------- Libellés utilisateurs ---------- */

export const STATUS_LABEL: Record<ParcelStatus, string> = {
  en_attente: 'En attente de validation',
  confirmee: 'Confirmé',
  affecte: 'Affecté à un trajet',
  prise_en_charge: 'Pris en charge',
  en_transit: 'En transit',
  arrive: 'Arrivé au point de récupération',
  pret_a_recuperer: 'Prêt à récupérer',
  livre: 'Livré',
  annule: 'Annulé',
  incident: 'Incident signalé',
};

export const STATUS_TONE: Record<ParcelStatus, 'amber' | 'green' | 'blue' | 'red' | 'slate' | 'violet'> = {
  en_attente: 'amber',
  confirmee: 'blue',
  affecte: 'violet',
  prise_en_charge: 'violet',
  en_transit: 'blue',
  arrive: 'green',
  pret_a_recuperer: 'amber',
  livre: 'green',
  annule: 'slate',
  incident: 'red',
};

/* Statuts visibles par le destinataire sur un lien de suivi public */
export const PUBLIC_STATUSES: ParcelStatus[] = [
  'confirmee', 'affecte', 'prise_en_charge', 'en_transit',
  'arrive', 'pret_a_recuperer', 'livre', 'incident',
];

/* ---------- Machine à états ---------- */

const TRANSITIONS: Record<ParcelStatus, ParcelStatus[]> = {
  en_attente: ['confirmee', 'annule'],
  confirmee: ['affecte', 'annule'],
  affecte: ['prise_en_charge', 'annule', 'incident'],
  prise_en_charge: ['en_transit', 'incident'],
  en_transit: ['arrive', 'incident'],
  arrive: ['pret_a_recuperer'],
  pret_a_recuperer: ['livre', 'incident'],
  livre: [],
  annule: [],
  incident: ['en_transit', 'pret_a_recuperer', 'annule'], /* reprise après résolution (admin) */
};

/* Qui a le droit d'appliquer chaque statut cible */
const TRANSITION_ROLES: Record<Exclude<ParcelStatus, 'en_attente'>, Role[]> = {
  confirmee: ['admin'],
  affecte: ['admin'],
  prise_en_charge: ['chauffeur', 'receveur'],
  en_transit: ['chauffeur', 'receveur'],
  arrive: ['chauffeur', 'receveur'],
  pret_a_recuperer: ['chauffeur', 'receveur', 'admin'],
  livre: ['chauffeur', 'receveur', 'admin'],
  annule: ['admin', 'client'],
  incident: ['chauffeur', 'receveur', 'admin', 'client'],
};

export function canTransition(from: ParcelStatus, to: ParcelStatus): boolean {
  return (TRANSITIONS[from] ?? []).includes(to);
}

export function canTransitionAsRole(from: ParcelStatus, to: ParcelStatus, role: Role): boolean {
  if (!canTransition(from, to)) return false;
  if (to === 'en_attente') return false;
  return (TRANSITION_ROLES[to as Exclude<ParcelStatus, 'en_attente'>] ?? []).includes(role);
}

/* Le statut du colis doit-il bloquer la transmission GPS (hors mission) ? */
export function tripNeedsLiveGps(tripStatus: 'planifie' | 'en_cours' | 'termine'): boolean {
  return tripStatus === 'en_cours';
}

/* ---------- Formatage FCFA & téléphones ---------- */

export function fcfa(n: number): string {
  return `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} F`;
}

/* Normalise un numéro sénégalais en +221XXXXXXXXX, sinon null */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[\s.-]/g, '');
  const local = digits.replace(/^\+?221/, '');
  if (/^7[05678]\d{7}$/.test(local)) return `+221${local}`;
  return null;
}

export function phonePretty(p: string): string {
  const m = p.replace('+221', '');
  return `+221 ${m.slice(0, 2)} ${m.slice(2, 5)} ${m.slice(5, 7)} ${m.slice(7, 9)}`;
}

/* ---------- Référence & code de retrait ---------- */

const REF_ALPHABET = 'ACDEFGHJKLMNPQRSTUVWXYZ23456789'; /* sans I,O,0,1, ambiguïtés */

export function makeReference(now = new Date()): string {
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  let code = '';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 6; i++) code += REF_ALPHABET[bytes[i] % REF_ALPHABET.length];
  return `KB-${yy}${mm}-${code}`;
}

export function makePickupCode(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b % 10).join('');
}

/* SHA-256 hex — le code en clair n'est JAMAIS stocké */
export async function hashPickupCode(code: string): Promise<string> {
  const data = new TextEncoder().encode(`kolibus:${code.trim()}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const PICKUP_MAX_ATTEMPTS = 5;

export function pickupLocked(parcel: Pick<Parcel, 'pickup_attempts'>): boolean {
  return parcel.pickup_attempts >= PICKUP_MAX_ATTEMPTS;
}

/* ---------- Tarification ---------- */

export interface TariffInput {
  dropoff_stop_id: string;
  pickup_stop_id: string;
  weight_kg: number;
  fragile: boolean;
  express: boolean;
}

export interface TariffBreakdown {
  base: number;
  segments: number;      /* nombre de tronçons */
  segment_cost: number;
  extra_kg: number;
  extra_kg_cost: number;
  fragile_cost: number;
  express_cost: number;
  total: number;
}

export function computeTariff(
  stops: Stop[], grid: TariffGrid, input: TariffInput,
): TariffBreakdown | null {
  const from = stops.find(s => s.id === input.dropoff_stop_id);
  const to = stops.find(s => s.id === input.pickup_stop_id);
  if (!from || !to) return null;
  const segments = Math.abs(to.position_order - from.position_order);
  if (segments < 1) return null;
  const extraKg = Math.max(0, Math.ceil(input.weight_kg - grid.free_weight_kg));
  const extraKgCost = extraKg * grid.per_kg_extra_fcfa;
  const fragileCost = input.fragile ? grid.fragile_fcfa : 0;
  const expressCost = input.express ? grid.express_fcfa : 0;
  const total =
    grid.base_fcfa + segments * grid.per_segment_fcfa + extraKgCost + fragileCost + expressCost;
  return {
    base: grid.base_fcfa,
    segments,
    segment_cost: segments * grid.per_segment_fcfa,
    extra_kg: extraKg,
    extra_kg_cost: extraKgCost,
    fragile_cost: fragileCost,
    express_cost: expressCost,
    total,
  };
}

/* ---------- Fraîcheur GPS ---------- */

export type Freshness = 'live' | 'recent' | 'stale' | 'none';

export function positionAgeMinutes(receivedAt?: string | null, now = Date.now()): number | null {
  if (!receivedAt) return null;
  const t = new Date(receivedAt).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.round((now - t) / 60000));
}

export function freshnessOf(receivedAt?: string | null, now = Date.now()): Freshness {
  const age = positionAgeMinutes(receivedAt, now);
  if (age === null) return 'none';
  if (age < 3) return 'live';
  if (age <= 15) return 'recent';
  return 'stale';
}

export function freshnessLabel(receivedAt?: string | null, now = Date.now()): string {
  const age = positionAgeMinutes(receivedAt, now);
  if (age === null) return 'Position indisponible';
  if (age < 1) return 'Position reçue à l\u2019instant';
  if (age === 1) return 'Dernière position reçue il y a 1 minute';
  return `Dernière position reçue il y a ${age} minutes`;
}

export function timeAgo(iso: string, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'à l\u2019instant';
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return `le ${new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`;
}

export function dateTimeFr(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

/* ---------- Validation d'un envoi (côté client avant soumission) ---------- */

export interface CreateParcelInput {
  sender_name: string; sender_phone: string;
  recipient_name: string; recipient_phone: string;
  category: string; description: string;
  weight_kg: number; quantity: number;
  fragile: boolean; express: boolean;
  dropoff_stop_id: string; pickup_stop_id: string;
  payment_method: PaymentMethod;
}

export function validateParcelInput(
  input: Partial<CreateParcelInput>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.sender_name || input.sender_name.trim().length < 3) errors.sender_name = 'Nom complet requis (min. 3 caractères)';
  if (!input.sender_phone || !normalizePhone(input.sender_phone)) errors.sender_phone = 'Numéro sénégalais invalide (ex. +221 77 123 45 67)';
  if (!input.recipient_name || input.recipient_name.trim().length < 3) errors.recipient_name = 'Nom du destinataire requis';
  if (!input.recipient_phone || !normalizePhone(input.recipient_phone)) errors.recipient_phone = 'Numéro du destinataire invalide';
  if (!input.category) errors.category = 'Catégorie requise';
  if (!input.description || input.description.trim().length < 5) errors.description = 'Décrivez le colis (min. 5 caractères)';
  const w = Number(input.weight_kg);
  if (!w || w <= 0 || w > 50) errors.weight_kg = 'Poids entre 0,1 et 50 kg';
  const q = Number(input.quantity);
  if (!q || q < 1 || q > 20) errors.quantity = 'Quantité entre 1 et 20';
  if (!input.dropoff_stop_id) errors.dropoff_stop_id = 'Point de dépôt requis';
  if (!input.pickup_stop_id) errors.pickup_stop_id = 'Point de retrait requis';
  if (input.dropoff_stop_id && input.pickup_stop_id && input.dropoff_stop_id === input.pickup_stop_id) {
    errors.pickup_stop_id = 'Le point de retrait doit différer du dépôt';
  }
  if (!input.payment_method) errors.payment_method = 'Mode de paiement requis';
  return errors;
}

/* ---------- Étapes de suivi (timeline) ---------- */

export const TIMELINE_ORDER: ParcelStatus[] = [
  'en_attente', 'confirmee', 'affecte', 'prise_en_charge',
  'en_transit', 'arrive', 'pret_a_recuperer', 'livre',
];

/* Distance haversine (km) — contrôle de cohérence des positions */
export function distanceKm(
  a: { lat: number; lng: number }, b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
