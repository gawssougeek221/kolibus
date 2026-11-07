/* KoliBus Transport — Détail colis : statuts, code de retrait, incident */
import React, { useCallback, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { APP } from '../lib/config';
import { fetchTripParcels, setParcelStatus, verifyPickupCode, type Parcel } from '../lib/supabase';

const NEXT: Record<string, { label: string; to: string; msg: string }> = {
  affecte: { label: 'Confirmer la prise en charge', to: 'prise_en_charge', msg: 'Colis chargé' },
  prise_en_charge: { label: 'Démarrer le transit', to: 'en_transit', msg: 'Colis en transit' },
  en_transit: { label: "Confirmer l'arrivée", to: 'arrive', msg: 'Véhicule arrivé' },
  arrive: { label: 'Marquer prêt à récupérer', to: 'pret_a_recuperer', msg: 'Colis prêt au retrait' },
};

export default function ParcelDetailScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const route = useRoute<{ params: { parcelId: string } }>();
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [incident, setIncident] = useState('');
  const [showIncident, setShowIncident] = useState(false);

  const load = useCallback(async () => {
    const list = await fetchTripParcels(route.params.parcelId).catch(() => null);
    /* Le détail est chargé depuis la liste des trajets autorisés (RLS) ;
       si le colis n'est pas dans ce trajet, la requête ne le renvoie pas. */
    void list;
  }, [route.params.parcelId]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  /* Recharge par référence via les colis du trajet (fetchTripParcels par trip) :
     pour rester simple, on recharge depuis la liste globale du trajet actif. */
  useFocusEffect(useCallback(() => {
    void (async () => {
      try {
        const { fetchMyTrips } = await import('../lib/supabase');
        const trips = await fetchMyTrips();
        for (const t of trips) {
          const list = await fetchTripParcels(t.id);
          const found = list.find(p => p.id === route.params.parcelId);
          if (found) { setParcel(found); return; }
        }
      } catch { /* géré par l'écran missions */ }
    })();
  }, [route.params.parcelId]));

  const act = async (to: string, msg: string) => {
    if (!parcel) return;
    try {
      await setParcelStatus(parcel.id, to, msg);
      const { fetchMyTrips } = await import('../lib/supabase');
      const trips = await fetchMyTrips();
      for (const t of trips) {
        const list = await fetchTripParcels(t.id);
        const found = list.find(p => p.id === parcel.id);
        if (found) { setParcel(found); return; }
      }
    } catch (e) {
      Alert.alert('Action refusée', e instanceof Error ? e.message : 'Transition non autorisée');
    }
  };

  const verify = async () => {
    if (!parcel || !/^\d{4}$/.test(code)) {
      Alert.alert('KoliBus', 'Saisissez le code à 4 chiffres remis par le destinataire.');
      return;
    }
    setVerifying(true);
    try {
      const res = await verifyPickupCode(parcel.id, code);
      if (res.ok) {
        Alert.alert('Remise confirmée', `Colis ${parcel.reference} livré contre code vérifié.`);
        setCode('');
        void act('livre', 'Code vérifié — remise confirmée');
      } else {
        Alert.alert('Code refusé', res.error ?? 'Code erroné');
      }
    } finally {
      setVerifying(false);
    }
  };

  if (!parcel) {
    return <View style={s.wrap}><Text style={s.empty}>Colis introuvable ou non autorisé.</Text></View>;
  }

  const next = NEXT[parcel.status];

  return (
    <ScrollView style={s.wrap} contentContainerStyle={{ padding: 16 }}>
      <View style={s.head}>
        <Text style={s.ref}>{parcel.reference}</Text>
        <Text style={s.status}>{parcel.status}</Text>
      </View>

      <View style={s.card}>
        <Text style={s.title}>{parcel.recipient_name}</Text>
        <Text style={s.sub}>{parcel.recipient_phone}</Text>
        <Text style={s.sub}>
          {parcel.category} — {parcel.description}
        </Text>
        <Text style={s.sub}>
          {parcel.weight_kg} kg · ×{parcel.quantity}{parcel.fragile ? ' · FRAGILE' : ''}{parcel.express ? ' · EXPRESS' : ''} · {parcel.price_fcfa} F CFA
        </Text>
        <Text style={s.sub}>Paiement : {parcel.payment_status === 'paye' ? 'payé' : 'à encaisser'}</Text>
      </View>

      {next && (
        <TouchableOpacity style={s.btn} onPress={() => void act(next.to, next.msg)}>
          <Text style={s.btnText}>{next.label}</Text>
        </TouchableOpacity>
      )}

      {parcel.status === 'pret_a_recuperer' && (
        <View style={[s.card, { borderColor: '#F6C25C', borderWidth: 1.5 }]}>
          <Text style={s.cardTitle}>Vérification du code de retrait</Text>
          <Text style={s.sub}>Vérification côté serveur · 5 tentatives max · code à usage unique.</Text>
          <TextInput
            style={s.codeInput}
            value={code}
            onChangeText={t => setCode(t.replace(/\D/g, '').slice(0, 4))}
            keyboardType="number-pad"
            placeholder="····"
            maxLength={4}
          />
          <TouchableOpacity style={s.btn} onPress={() => void verify()} disabled={verifying}>
            <Text style={s.btnText}>{verifying ? 'Vérification…' : 'Valider la remise'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {parcel.status !== 'livre' && parcel.status !== 'annule' && (
        showIncident ? (
          <View style={[s.card, { borderColor: APP.colors.red, borderWidth: 1.5 }]}>
            <Text style={s.cardTitle}>Déclarer un incident</Text>
            <TextInput
              style={[s.codeInput, { height: 70, textAlignVertical: 'top' }]}
              value={incident}
              onChangeText={setIncident}
              placeholder="Décrivez le problème (retard, colis endommagé…)"
              multiline
            />
            <TouchableOpacity
              style={[s.btn, { backgroundColor: APP.colors.red }]}
              onPress={() => {
                if (incident.trim().length < 5) { Alert.alert('KoliBus', 'Décrivez le problème (5 caractères min.)'); return; }
                void act('incident', incident.trim());
                setShowIncident(false);
                setIncident('');
                Alert.alert('Incident signalé', 'L\u2019administration a été notifiée.');
              }}
            >
              <Text style={s.btnText}>Envoyer le signalement</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowIncident(false)} style={{ paddingVertical: 10 }}>
              <Text style={{ textAlign: 'center', color: APP.colors.slate, fontWeight: '700' }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={s.incidentBtn} onPress={() => setShowIncident(true)}>
            <Text style={s.incidentText}>Déclarer un incident</Text>
          </TouchableOpacity>
        )
      )}

      <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingVertical: 14 }}>
        <Text style={{ textAlign: 'center', color: APP.colors.green, fontWeight: '800' }}>Retour aux missions</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: APP.colors.cream },
  head: { backgroundColor: APP.colors.green, borderRadius: 16, padding: 16, marginBottom: 12 },
  ref: { color: APP.colors.white, fontWeight: '900', fontSize: 20 },
  status: { color: APP.colors.amber, fontWeight: '800', fontSize: 12, marginTop: 4 },
  card: { backgroundColor: APP.colors.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: APP.colors.line },
  cardTitle: { fontWeight: '900', fontSize: 14, color: APP.colors.ink, marginBottom: 4 },
  title: { fontWeight: '800', fontSize: 16, color: APP.colors.ink },
  sub: { fontSize: 12.5, color: APP.colors.slate, marginTop: 3 },
  btn: { backgroundColor: APP.colors.green, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 12 },
  btnText: { color: APP.colors.white, fontWeight: '900', fontSize: 14 },
  codeInput: { backgroundColor: APP.colors.cream, borderRadius: 12, fontSize: 22, letterSpacing: 8, textAlign: 'center', paddingVertical: 10, color: APP.colors.ink, marginTop: 8 },
  incidentBtn: { borderRadius: 14, borderWidth: 1.5, borderColor: APP.colors.red, paddingVertical: 13, alignItems: 'center', marginBottom: 12 },
  incidentText: { color: APP.colors.red, fontWeight: '800' },
  empty: { textAlign: 'center', marginTop: 40, color: APP.colors.slate },
});
