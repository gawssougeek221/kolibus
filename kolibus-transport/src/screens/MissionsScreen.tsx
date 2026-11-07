/* KoliBus Transport — Missions : trajets attribués + colis affectés */
import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { APP } from '../lib/config';
import { fetchMyTrips, fetchTripParcels, setParcelStatus, setTripStatus, subscribeMissions, type Trip, type Parcel } from '../lib/supabase';
import { setActiveTrip } from '../lib/gps';

const STATUS_LABEL: Record<string, string> = {
  en_attente: 'En attente de validation',
  confirmee: 'Confirmé',
  affecte: 'Affecté',
  prise_en_charge: 'Pris en charge',
  en_transit: 'En transit',
  arrive: 'Arrivé au point',
  pret_a_recuperer: 'Prêt à récupérer',
  livre: 'Livré',
  annule: 'Annulé',
  incident: 'Incident',
};

export default function MissionsScreen({ navigation }: { navigation: { navigate: (s: string) => void } }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const ts = await fetchMyTrips();
      setTrips(ts);
      const current = ts.find(t => t.id === selectedTrip?.id) ?? ts.find(t => t.status === 'en_cours') ?? ts[0] ?? null;
      setSelectedTrip(current);
      if (current) {
        setParcels(await fetchTripParcels(current.id));
        /* Le GPS n'est actif que pour une mission EN COURS (contrôlé serveur aussi) */
        await setActiveTrip(current.status === 'en_cours' ? { id: current.id, vehicle_id: current.vehicle_id } : null);
      } else {
        setParcels([]);
        await setActiveTrip(null);
      }
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Chargement impossible');
    } finally {
      setLoading(false);
    }
  }, [selectedTrip]);

  useFocusEffect(useCallback(() => { void load(); const un = subscribeMissions(() => void load()); return un; }, [load]));

  const transition = async (p: Parcel, to: string, okMsg: string) => {
    setBusy(true);
    try {
      await setParcelStatus(p.id, to, okMsg);
      await load();
    } catch (e) {
      Alert.alert('Action refusée', e instanceof Error ? e.message : 'Transition non autorisée');
    } finally {
      setBusy(false);
    }
  };

  const nextAction = (p: Parcel): { label: string; to: string; msg: string } | null => {
    switch (p.status) {
      case 'affecte': return { label: 'Confirmer la prise en charge', to: 'prise_en_charge', msg: 'Colis chargé dans le tata' };
      case 'prise_en_charge': return { label: 'Démarrer le transit', to: 'en_transit', msg: 'Colis en transit' };
      case 'en_transit': return { label: "Confirmer l'arrivée", to: 'arrive', msg: 'Véhicule arrivé au point' };
      case 'arrive': return { label: 'Marquer prêt à récupérer', to: 'pret_a_recuperer', msg: 'Colis prêt au retrait' };
      default: return null;
    }
  };

  return (
    <View style={s.wrap}>
      {/* Sélecteur de trajet */}
      <FlatList
        horizontal
        data={trips}
        keyExtractor={t => t.id}
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 74 }}
        contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedTrip(item)}
            style={[s.tripChip, selectedTrip?.id === item.id && s.tripChipActive]}
          >
            <Text style={[s.tripChipTitle, selectedTrip?.id === item.id && { color: APP.colors.white }]}>
              {item.direction === 'aller' ? 'Aller KM→PK' : 'Retour PK→KM'}
            </Text>
            <Text style={[s.tripChipSub, selectedTrip?.id === item.id && { color: 'rgba(255,255,255,0.7)' }]}>
              {item.status === 'en_cours' ? 'EN COURS' : item.status === 'planifie' ? 'Planifié' : 'Terminé'} · {new Date(item.depart_at).toLocaleDateString('fr-FR')}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={null}
      />

      {selectedTrip && selectedTrip.status === 'planifie' && (
        <TouchableOpacity
          style={s.startBtn}
          disabled={busy}
          onPress={() => {
            Alert.alert(
              'Démarrer le trajet',
              'Le suivi GPS sera autorisé et les colis passent en chargeable. Confirmer ?',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Démarrer',
                  onPress: () => {
                    void (async () => {
                      setBusy(true);
                      try {
                        await setTripStatus(selectedTrip.id, 'en_cours');
                        await load();
                      } catch (e) {
                        Alert.alert('Action refusée', e instanceof Error ? e.message : 'Transition non autorisée');
                      } finally {
                        setBusy(false);
                      }
                    })();
                  },
                },
              ],
            );
          }}
        >
          <Text style={s.startBtnText}>Démarrer le trajet (GPS autorisé)</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} color={APP.colors.green} />
      ) : (
        <FlatList
          data={parcels}
          keyExtractor={p => p.id}
          contentContainerStyle={{ padding: 14, paddingBottom: 30 }}
          refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}
          ListEmptyComponent={<Text style={s.empty}>Aucun colis affecté à ce trajet.</Text>}
          renderItem={({ item }) => {
            const act = nextAction(item);
            return (
              <TouchableOpacity style={s.card} onPress={() => navigation.navigate('ParcelDetail' as never, { parcelId: item.id } as never)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={s.ref}>{item.reference}</Text>
                  <Text style={[s.badge, item.status === 'livre' && { backgroundColor: '#E3F0EC' }, item.status === 'incident' && { backgroundColor: '#FBE9E9' }]}>
                    {STATUS_LABEL[item.status] ?? item.status}
                  </Text>
                </View>
                <Text style={s.title}>{item.recipient_name} · {item.category}</Text>
                <Text style={s.sub}>
                  {item.weight_kg} kg · ×{item.quantity}{item.fragile ? ' · fragile' : ''}{item.express ? ' · express' : ''} · {item.price_fcfa} F
                </Text>
                {act && (
                  <TouchableOpacity
                    style={s.actionBtn}
                    disabled={busy}
                    onPress={() => void transition(item, act.to, act.msg)}
                  >
                    <Text style={s.actionText}>{act.label}</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      <View style={s.footer}>
        <TouchableOpacity style={s.footerBtn} onPress={() => navigation.navigate('Gps')}>
          <Text style={s.footerBtnText}>GPS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.footerBtn} onPress={() => navigation.navigate('History')}>
          <Text style={s.footerBtnText}>Historique</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.footerBtn} onPress={() => navigation.navigate('Profile')}>
          <Text style={s.footerBtnText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: APP.colors.cream },
  tripChip: {
    backgroundColor: APP.colors.white, borderRadius: 14, padding: 12, marginRight: 8,
    borderWidth: 1, borderColor: APP.colors.line, minWidth: 140,
  },
  tripChipActive: { backgroundColor: APP.colors.green, borderColor: APP.colors.green },
  tripChipTitle: { fontWeight: '900', fontSize: 13, color: APP.colors.ink },
  tripChipSub: { fontSize: 11, color: APP.colors.slate, marginTop: 2 },
  startBtn: { backgroundColor: APP.colors.amber, marginHorizontal: 14, marginTop: 10, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  startBtnText: { color: APP.colors.green, fontWeight: '900' },
  card: { backgroundColor: APP.colors.white, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: APP.colors.line },
  ref: { fontWeight: '900', color: APP.colors.green, fontSize: 13 },
  badge: { fontSize: 10, fontWeight: '800', backgroundColor: '#FDF2DC', color: '#C27B06', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  title: { fontWeight: '700', fontSize: 14, color: APP.colors.ink, marginTop: 6 },
  sub: { fontSize: 12, color: APP.colors.slate, marginTop: 2 },
  actionBtn: { backgroundColor: APP.colors.green, borderRadius: 12, paddingVertical: 11, alignItems: 'center', marginTop: 10 },
  actionText: { color: APP.colors.white, fontWeight: '800', fontSize: 13 },
  empty: { textAlign: 'center', color: APP.colors.slate, marginTop: 30 },
  footer: { flexDirection: 'row', borderTopWidth: 1, borderColor: APP.colors.line, backgroundColor: APP.colors.white },
  footerBtn: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  footerBtnText: { fontWeight: '800', fontSize: 13, color: APP.colors.green },
});
