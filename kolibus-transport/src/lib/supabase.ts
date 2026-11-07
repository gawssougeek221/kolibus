/* ============================================================
   KoliBus Transport — Client Supabase + API métier
   La sécurité est déléguée aux politiques RLS + RPC côté serveur
   (voir supabase/migrations/0002_rls_rpc.sql). La clé anon only.
   ============================================================ */
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

let client: SupabaseClient | null = null;

export function sb(): SupabaseClient {
  if (!client) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error(
        'Supabase non configuré : renseigner supabaseUrl / supabaseAnonKey dans app.json (extra) puis reconstruire.',
      );
    }
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
    });
  }
  return client;
}

/* ---------- Types minimaux (miroir du schéma) ---------- */
export interface Parcel {
  id: string; reference: string;
  sender_name: string; recipient_name: string; recipient_phone: string;
  category: string; description: string; weight_kg: number; quantity: number;
  fragile: boolean; express: boolean; price_fcfa: number;
  payment_status: string; status: string; trip_id: string | null;
  pickup_attempts: number; created_at: string;
}
export interface Trip {
  id: string; direction: 'aller' | 'retour'; depart_at: string;
  status: 'planifie' | 'en_cours' | 'termine';
  driver_name: string; receiver_name: string;
  vehicle_id: string;
}

/* ---------- Auth ---------- */
export async function signIn(email: string, password: string) {
  const { data, error } = await sb().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}
export async function signOut() {
  await sb().auth.signOut();
}
export async function currentProfile() {
  const uid = (await sb().auth.getUser()).data.user?.id;
  if (!uid) return null;
  const { data } = await sb().from('profiles').select('*').eq('id', uid).single();
  return data as { id: string; full_name: string; phone: string; role: string } | null;
}

/* ---------- Missions (trajets assignés au transporteur connecté) ---------- */
export async function fetchMyTrips(): Promise<Trip[]> {
  const { data, error } = await sb()
    .from('trips')
    .select('*')
    .or(`driver_id.eq.${(await sb().auth.getUser()).data.user?.id},receiver_id.eq.${(await sb().auth.getUser()).data.user?.id}`)
    .order('depart_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as Trip[];
}

/* ---------- Colis des trajets autorisés (RLS filtre) ---------- */
export async function fetchTripParcels(tripId: string): Promise<Parcel[]> {
  const { data, error } = await sb()
    .from('parcels')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Parcel[];
}

/* ---------- Transitions de statut (RPC contrôlée : rôles + machine à états) ---------- */
export async function setParcelStatus(parcelId: string, to: string, note?: string) {
  const { data, error } = await sb().rpc('kolibus_set_parcel_status', {
    p_parcel_id: parcelId, p_to: to, p_note: note ?? null,
  });
  if (error) throw error;
  return data;
}

/* ---------- Vérification du code de retrait (RPC serveur, 5 tentatives max) ---------- */
export async function verifyPickupCode(parcelId: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await sb().rpc('kolibus_verify_pickup_code', {
    p_parcel_id: parcelId, p_code: code,
  });
  if (error) return { ok: false, error: error.message };
  return data as { ok: boolean; error?: string };
}

/* ---------- Démarrage / fin de trajet (RPC contrôlée) ---------- */
export async function setTripStatus(tripId: string, to: 'en_cours' | 'termine') {
  const { data, error } = await sb().rpc('kolibus_set_trip_status', {
    p_trip_id: tripId, p_to: to,
  });
  if (error) throw error;
  return data;
}

/* ---------- Publication de position (RPC : refusée hors mission) ---------- */
export async function pushLocation(
  tripId: string, vehicleId: string,
  lat: number, lng: number, accuracy: number | null, speed: number | null,
  capturedAt: string,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await sb().rpc('kolibus_push_location', {
    p_trip_id: tripId, p_lat: lat, p_lng: lng,
    p_accuracy: accuracy, p_speed: speed, p_captured_at: capturedAt,
  });
  if (error) return { ok: false, error: error.message };
  return data as { ok: boolean; error?: string };
}

/* ---------- Temps réel : nouvelles affectations + demandes de statut ---------- */
export function subscribeMissions(onChange: () => void) {
  const ch = sb()
    .channel('missions')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'parcels' }, onChange)
    .subscribe();
  return () => { void sb().removeChannel(ch); };
}
