/* KoliBus Transport — Profil professionnel & véhicule */
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { APP } from '../lib/config';
import { currentProfile, signOut, fetchMyTrips, sb, type Trip } from '../lib/supabase';

interface Vehicle { id: string; plate: string; type: string; capacity: number; model: string | null }
interface Partner { id: string; name: string; contact_name: string; contact_phone: string }

export default function ProfileScreen({ navigation }: { navigation: { replace: (s: string) => void } }) {
  const [profile, setProfile] = useState<{ full_name: string; phone: string; role: string } | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [nextTrip, setNextTrip] = useState<Trip | null>(null);

  useFocusEffect(useCallback(() => {
    void (async () => {
      const p = await currentProfile();
      setProfile(p);
      const trips = await fetchMyTrips();
      setNextTrip(trips.find(t => t.status !== 'termine') ?? null);
      if (trips[0]) {
        const { data: v } = await sb().from('vehicles').select('*').eq('id', trips[0].vehicle_id).single();
        setVehicle((v as Vehicle) ?? null);
        if (v) {
          const { data: pt } = await sb().from('transport_partners').select('*').eq('id', (v as Vehicle).partner_id).single();
          setPartner((pt as Partner) ?? null);
        }
      }
    })();
  }, []));

  return (
    <ScrollView style={s.wrap} contentContainerStyle={{ padding: 16 }}>
      <View style={s.head}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{(profile?.full_name ?? 'K').slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{profile?.full_name ?? 'Transporteur'}</Text>
          <Text style={s.sub}>{profile?.phone ?? ''} · rôle : {profile?.role ?? '—'}</Text>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Véhicule & mission</Text>
        <Text style={s.line}>Véhicule : {vehicle ? `${vehicle.plate} · ${vehicle.type} · ${vehicle.capacity} places colis` : '—'}</Text>
        <Text style={s.line}>Modèle : {vehicle?.model ?? '—'}</Text>
        <Text style={s.line}>Partenaire : {partner?.name ?? '—'}</Text>
        <Text style={s.line}>
          Mission à venir : {nextTrip ? `${nextTrip.direction === 'aller' ? 'Aller' : 'Retour'} · ${new Date(nextTrip.depart_at).toLocaleString('fr-FR')}` : '—'}
        </Text>
        <Text style={s.note}>
          Les données affichées proviennent de votre compte (RLS) : vous ne voyez que
          les véhicules et missions qui vous concernent.
        </Text>
      </View>

      <TouchableOpacity
        style={s.logoutBtn}
        onPress={() => {
          Alert.alert('Déconnexion', 'Fermer votre session transporteur ?', [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Se déconnecter',
              style: 'destructive',
              onPress: () => {
                void signOut().then(() => navigation.replace('Login'));
              },
            },
          ]);
        }}
      >
        <Text style={s.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      <Text style={s.foot}>KoliBus Transport v0.1.0 · pilote Keur Massar ⇄ Pikine</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: APP.colors.cream },
  head: { backgroundColor: APP.colors.green, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: APP.colors.white, fontWeight: '900', fontSize: 18 },
  name: { color: APP.colors.white, fontWeight: '900', fontSize: 16 },
  sub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  card: { backgroundColor: APP.colors.white, borderRadius: 16, padding: 16, marginTop: 12, borderWidth: 1, borderColor: APP.colors.line },
  cardTitle: { fontWeight: '900', fontSize: 14, color: APP.colors.ink, marginBottom: 6 },
  line: { fontSize: 12.5, color: APP.colors.ink, marginTop: 5, fontWeight: '600' },
  note: { fontSize: 11, color: APP.colors.slate, marginTop: 10, lineHeight: 16 },
  logoutBtn: { borderRadius: 14, borderWidth: 1.5, borderColor: APP.colors.red, paddingVertical: 14, alignItems: 'center', marginTop: 14 },
  logoutText: { color: APP.colors.red, fontWeight: '800' },
  foot: { textAlign: 'center', color: APP.colors.slate, fontSize: 10, marginTop: 18, marginBottom: 20 },
});
