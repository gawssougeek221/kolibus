/* KoliBus Transport — Historique des opérations passées */
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { APP } from '../lib/config';
import { fetchMyTrips, fetchTripParcels, type Parcel } from '../lib/supabase';

export default function HistoryScreen() {
  const [items, setItems] = useState<Parcel[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const trips = await fetchMyTrips();
      const all: Parcel[] = [];
      for (const t of trips) {
        const list = await fetchTripParcels(t.id);
        all.push(...list.filter(p => p.status === 'livre' || p.status === 'annule'));
      }
      all.sort((a, b) => b.created_at.localeCompare(a.created_at));
      setItems(all);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <View style={s.wrap}>
      <FlatList
        data={items}
        keyExtractor={p => p.id}
        contentContainerStyle={{ padding: 14 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        ListEmptyComponent={<Text style={s.empty}>Aucune opération terminée pour vos trajets.</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={{ flex: 1 }}>
              <Text style={s.ref}>{item.reference}</Text>
              <Text style={s.sub}>{item.recipient_name} · {item.price_fcfa} F CFA · {new Date(item.created_at).toLocaleDateString('fr-FR')}</Text>
            </View>
            <Text style={[s.badge, item.status === 'livre' && { backgroundColor: '#E3F0EC', color: APP.colors.green }]}>
              {item.status === 'livre' ? 'Livré' : 'Annulé'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: APP.colors.cream },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: APP.colors.white, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: APP.colors.line },
  ref: { fontWeight: '900', color: APP.colors.green, fontSize: 13 },
  sub: { fontSize: 12, color: APP.colors.slate, marginTop: 2 },
  badge: { fontSize: 10, fontWeight: '800', backgroundColor: '#FDF2DC', color: '#C27B06', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  empty: { textAlign: 'center', color: APP.colors.slate, marginTop: 40 },
});
