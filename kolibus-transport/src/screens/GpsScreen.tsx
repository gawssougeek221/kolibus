/* KoliBus Transport — Écran GPS : état du suivi, permissions, transmission */
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform,
} from 'react-native';
import * as Location from 'expo-location';
import {
  ensurePermissions, startForegroundGps, startBackgroundGps, stopAllGps,
  setActiveTrip, flushQueue,
} from '../lib/gps';
import { fetchMyTrips, type Trip } from '../lib/supabase';
import { APP } from '../lib/config';

interface Fix { lat: number; lng: number; accuracy: number | null; speedKmh: number | null; at: string }

export default function GpsScreen() {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [watching, setWatching] = useState(false);
  const [fix, setFix] = useState<Fix | null>(null);
  const [sent, setSent] = useState(0);
  const [failed, setFailed] = useState(0);
  const [queued, setQueued] = useState(0);
  const watcher = useRef<Location.LocationSubscription | null>(null);

  const loadTrip = async () => {
    const ts = await fetchMyTrips();
    const active = ts.find(t => t.status === 'en_cours') ?? null;
    setTrip(active);
    await setActiveTrip(active ? { id: active.id, vehicle_id: active.vehicle_id } : null);
  };

  useEffect(() => {
    void loadTrip();
    const iv = setInterval(() => { void flushQueue().then(n => n > 0 && setQueued(q => q)); }, 20000);
    return () => { clearInterval(iv); };
  }, []);

  const start = async () => {
    const perm = await ensurePermissions();
    if (!perm.ok) { Alert.alert('Permission requise', perm.reason); return; }
    if (!trip) { Alert.alert('KoliBus', 'Aucune mission en cours : démarrez une mission avant le suivi GPS.'); return; }
    try {
      watcher.current = await startForegroundGps(f => { setFix(f); setSent(n => n + 1); });
      setWatching(true);
      if (Platform.OS === 'android') {
        const bg = await startBackgroundGps();
        if (!bg.ok) {
          Alert.alert('Arrière-plan limité', bg.reason ?? 'Suivi en premier plan uniquement.');
        }
      }
      Alert.alert('Suivi GPS', 'Transmission démarrée. La position est envoyée uniquement pendant cette mission.');
    } catch (e) {
      Alert.alert('Erreur GPS', e instanceof Error ? e.message : 'Démarrage impossible');
    }
  };

  const stop = async () => {
    await stopAllGps(watcher.current);
    watcher.current = null;
    setWatching(false);
    Alert.alert('Suivi GPS', 'Transmission arrêtée. Aucune position n\u2019est collectée hors mission.');
  };

  return (
    <ScrollView style={s.wrap} contentContainerStyle={{ padding: 16 }}>
      {/* État */}
      <View style={s.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={s.cardTitle}>État du suivi</Text>
          <Text style={[s.state, watching ? { backgroundColor: '#E3F0EC', color: APP.colors.green } : { backgroundColor: APP.colors.cream, color: APP.colors.slate }]}>
            {watching ? 'ACTIF' : 'ARRÊTÉ'}
          </Text>
        </View>
        <Text style={s.sub}>
          Mission : {trip ? (trip.direction === 'aller' ? 'Aller Keur Massar → Pikine' : 'Retour Pikine → Keur Massar') : 'aucune mission en cours'}
        </Text>
        <Text style={s.sub}>· Fréquence : au déplacement (&gt; 25 m), période max 15 s</Text>
        <Text style={s.sub}>· Hors mission : aucune collecte, aucune transmission</Text>
        <Text style={s.sub}>· Réseau coupé : file d&apos;attente locale, renvoi au retour</Text>

        {fix && (
          <View style={s.fixBox}>
            <Text style={s.fixText}>{fix.lat.toFixed(5)}, {fix.lng.toFixed(5)}</Text>
            <Text style={s.fixSub}>
              Précision ±{Math.round(fix.accuracy ?? 0)} m · {fix.speedKmh != null ? `${Math.round(fix.speedKmh)} km/h · ` : ''}
              {new Date(fix.at).toLocaleTimeString('fr-FR')}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[s.btn, watching ? { backgroundColor: APP.colors.red } : { backgroundColor: APP.colors.green }]}
          onPress={() => void (watching ? stop() : start())}
        >
          <Text style={s.btnText}>{watching ? 'Arrêter le suivi' : 'Démarrer le suivi GPS'}</Text>
        </TouchableOpacity>
      </View>

      {/* Compteurs */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Transmission</Text>
        <View style={s.stats}>
          <View style={s.stat}><Text style={s.statNum}>{sent}</Text><Text style={s.statLbl}>Envoyées</Text></View>
          <View style={s.stat}><Text style={s.statNum}>{failed}</Text><Text style={s.statLbl}>Échecs</Text></View>
          <View style={s.stat}><Text style={s.statNum}>{queued}</Text><Text style={s.statLbl}>En file</Text></View>
        </View>
        <TouchableOpacity
          style={[s.btn, { backgroundColor: APP.colors.amber, marginTop: 12 }]}
          onPress={() => void flushQueue().then(n => Alert.alert('File d\u2019attente', n > 0 ? `${n} position(s) renvoyée(s).` : 'File vide — tout est transmis.'))}
        >
          <Text style={[s.btnText, { color: APP.colors.green }]}>Renvoyer les positions en attente</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.note}>
        ⚠️ Le suivi en arrière-plan doit être validé sur téléphone réel (Android : service en premier plan ;
        iOS : indicateur bleu). Tant que ce test n&apos;est pas effectué, ne pas annoncer la fonctionnalité aux utilisateurs.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: APP.colors.cream },
  card: { backgroundColor: APP.colors.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: APP.colors.line },
  cardTitle: { fontWeight: '900', fontSize: 15, color: APP.colors.ink },
  state: { fontSize: 11, fontWeight: '900', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  sub: { fontSize: 12, color: APP.colors.slate, marginTop: 5 },
  fixBox: { backgroundColor: APP.colors.cream, borderRadius: 12, padding: 12, marginTop: 10 },
  fixText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontWeight: '700', color: APP.colors.ink },
  fixSub: { fontSize: 11, color: APP.colors.slate, marginTop: 2 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 14 },
  btnText: { color: APP.colors.white, fontWeight: '900', fontSize: 14 },
  stats: { flexDirection: 'row', marginTop: 10 },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '900', color: APP.colors.ink },
  statLbl: { fontSize: 11, color: APP.colors.slate },
  note: { fontSize: 11, color: APP.colors.slate, lineHeight: 16, marginBottom: 30 },
});
