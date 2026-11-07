/* KoliBus Transport — Écran de connexion sécurisée */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { APP } from '../lib/config';
import { signIn } from '../lib/supabase';

export default function LoginScreen({ navigation }: { navigation: { replace: (s: string) => void } }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !password) {
      Alert.alert('KoliBus', 'Renseignez votre e-mail et votre mot de passe.');
      return;
    }
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      navigation.replace('Missions');
    } catch (e) {
      Alert.alert('Connexion refusée', e instanceof Error ? e.message : 'Vérifiez vos identifiants.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.wrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={s.wordmark}>
        Koli<Text style={{ color: APP.colors.amber }}>Bus</Text>
      </Text>
      <Text style={s.slogan}>{APP.slogan}</Text>
      <Text style={s.sub}>Espace transporteur — chauffeurs & receveurs</Text>

      <TextInput
        style={s.input}
        placeholder="E-mail professionnel"
        placeholderTextColor={APP.colors.slate}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={s.input}
        placeholder="Mot de passe"
        placeholderTextColor={APP.colors.slate}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={s.btn} onPress={submit} disabled={busy}>
        <Text style={s.btnText}>{busy ? 'Connexion…' : 'Se connecter'}</Text>
      </TouchableOpacity>

      <Text style={s.note}>
        Accès limité aux missions qui vous sont attribuées. La vérification des droits
        se fait côté serveur (RLS).
      </Text>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: APP.colors.green, justifyContent: 'center', padding: 28 },
  wordmark: { color: APP.colors.white, fontSize: 34, fontWeight: '900' },
  slogan: { color: APP.colors.amber, fontSize: 13, fontWeight: '700', marginTop: 4 },
  sub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 18 },
  input: {
    backgroundColor: APP.colors.white, borderRadius: 14, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 15, marginTop: 14, color: APP.colors.ink,
  },
  btn: { backgroundColor: APP.colors.amber, borderRadius: 14, paddingVertical: 16, marginTop: 20, alignItems: 'center' },
  btnText: { color: APP.colors.green, fontWeight: '900', fontSize: 16 },
  note: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 26, lineHeight: 16 },
});
