/* ============================================================
   KoliBus Transport — Service GPS
   · Premier plan  : expo-location watchPositionAsync
   · Arrière-plan  : expo-location startLocationUpdatesAsync
                     + expo-task-manager (déclaré UNE fois)
   · File d'attente hors-ligne : les positions non transmises sont
     conservées (AsyncStorage) et renvoyées au retour du réseau.
   ⚠️ HONNÊTETÉ : le suivi en arrière-plan doit être TESTÉ sur un
   téléphone réel (Android : service en premier plan + permission
   background ; iOS : UIBackgroundModes location). Tant que ce test
   n'est pas fait sur appareil réel, ne PAS annoncer la fonctionnalité.
   ============================================================ */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { GPS_CONFIG } from './config';
import { pushLocation } from './supabase';

export const LOCATION_TASK = 'kolibus-gps-task';

interface QueuedFix {
  trip_id: string; vehicle_id: string;
  lat: number; lng: number; accuracy: number | null; speed: number | null;
  captured_at: string;
}

const QUEUE_KEY = 'kolibus_gps_queue';
const ACTIVE_TRIP_KEY = 'kolibus_active_trip';

/* ---------- Contexte de mission active (partagé avec la tâche) ---------- */
export async function setActiveTrip(trip: { id: string; vehicle_id: string } | null) {
  if (trip) await AsyncStorage.setItem(ACTIVE_TRIP_KEY, JSON.stringify(trip));
  else await AsyncStorage.removeItem(ACTIVE_TRIP_KEY);
}
async function getActiveTrip(): Promise<{ id: string; vehicle_id: string } | null> {
  const raw = await AsyncStorage.getItem(ACTIVE_TRIP_KEY);
  return raw ? JSON.parse(raw) : null;
}

/* ---------- File d'attente hors-ligne ---------- */
async function enqueue(fix: QueuedFix) {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  const q: QueuedFix[] = raw ? JSON.parse(raw) : [];
  q.push(fix);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-200)));
}
export async function flushQueue(): Promise<number> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  const q: QueuedFix[] = raw ? JSON.parse(raw) : [];
  if (!q.length) return 0;
  const remaining: QueuedFix[] = [];
  let sent = 0;
  for (const fix of q) {
    try {
      const res = await pushLocation(
        fix.trip_id, fix.vehicle_id,
        fix.lat, fix.lng, fix.accuracy, fix.speed, fix.captured_at,
      );
      if (res.ok) sent += 1; else remaining.push(fix);
    } catch {
      remaining.push(fix);
    }
  }
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return sent;
}

/* ---------- Transmission d'une position (avec contrôle hors mission) ---------- */
async function transmit(fix: QueuedFix): Promise<boolean> {
  try {
    const res = await pushLocation(
      fix.trip_id, fix.vehicle_id, fix.lat, fix.lng,
      fix.accuracy, fix.speed, fix.captured_at,
    );
    if (res.ok) { void flushQueue(); return true; }
    /* Refus serveur (mission non active) → on ne stocke PAS : règle de
       conservation — aucune position hors période de service. */
    return false;
  } catch {
    await enqueue(fix); /* réseau indisponible → file d'attente */
    return false;
  }
}

/* ---------- Tâche d'arrière-plan (déclarée UNE fois, globalement) ---------- */
if (!TaskManager.isTaskDefined(LOCATION_TASK)) {
  TaskManager.defineTask(LOCATION_TASK, async ({ data, error }: TaskManager.TaskManagerTaskBody) => {
    if (error) return;
    const { locations } = data as { locations?: Location.LocationObject[] };
    if (!locations?.length) return;
    const trip = await getActiveTrip();
    if (!trip) return; /* aucune mission active → aucune transmission */
    for (const loc of locations) {
      await transmit({
        trip_id: trip.id,
        vehicle_id: trip.vehicle_id,
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        accuracy: loc.coords.accuracy ?? null,
        speed: loc.coords.speed != null ? loc.coords.speed * 3.6 : null,
        captured_at: new Date(loc.timestamp).toISOString(),
      });
    }
  });
}

/* ---------- Permissions ---------- */
export async function ensurePermissions(): Promise<
  { ok: true } | { ok: false; reason: string }
> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (!fg.granted) return { ok: false, reason: 'Permission de localisation refusée.' };
  return { ok: true };
}

export async function ensureBackgroundPermissions(): Promise<
  { ok: true } | { ok: false; reason: string }
> {
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (!bg.granted) {
    return { ok: false, reason: 'Autorisation arrière-plan refusée — le suivi continu sera limité à l\u2019app ouverte.' };
  }
  return { ok: true };
}

/* ---------- Suivi premier plan ---------- */
export async function startForegroundGps(onFix: (info: {
  lat: number; lng: number; accuracy: number | null; speedKmh: number | null; at: string;
}) => void) {
  const trip = await getActiveTrip();
  if (!trip) throw new Error('Aucune mission active : démarrez une mission avant le GPS.');
  return Location.watchPositionAsync(
    { accuracy: GPS_CONFIG.accuracy, distanceInterval: GPS_CONFIG.distanceInterval, timeInterval: GPS_CONFIG.timeInterval },
    loc => {
      const fix: QueuedFix = {
        trip_id: trip.id, vehicle_id: trip.vehicle_id,
        lat: loc.coords.latitude, lng: loc.coords.longitude,
        accuracy: loc.coords.accuracy ?? null,
        speed: loc.coords.speed != null ? loc.coords.speed * 3.6 : null,
        captured_at: new Date(loc.timestamp).toISOString(),
      };
      void transmit(fix);
      onFix({
        lat: fix.lat, lng: fix.lng, accuracy: fix.accuracy, speedKmh: fix.speed, at: fix.captured_at,
      });
    },
  );
}

/* ---------- Suivi arrière-plan (Android foreground service / iOS bg modes) ---------- */
export async function startBackgroundGps(): Promise<{ ok: boolean; reason?: string }> {
  const bg = await ensureBackgroundPermissions();
  if (!bg.ok) return bg;
  const trip = await getActiveTrip();
  if (!trip) return { ok: false, reason: 'Aucune mission active.' };
  await Location.startLocationUpdatesAsync(LOCATION_TASK, {
    accuracy: GPS_CONFIG.accuracy,
    distanceInterval: GPS_CONFIG.distanceInterval,
    deferredUpdatesInterval: GPS_CONFIG.timeInterval,
    pausesUpdatesAutomatically: false,
    foregroundService: GPS_CONFIG.foregroundService,
    showsBackgroundLocationIndicator: true, /* iOS : indicateur bleu, transparence */
  });
  return { ok: true };
}

export async function stopAllGps(watcher?: Location.LocationSubscription | null) {
  watcher?.remove();
  if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK);
  }
  await setActiveTrip(null);
}
