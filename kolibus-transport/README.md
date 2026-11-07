# KoliBus Transport — App mobile (React Native · Expo · TypeScript)

Application pour les téléphones des chauffeurs et receveurs partenaires :
missions attribuées, mise à jour des statuts, **transmission GPS réelle**
et vérification du code de retrait.

> ⚠️ **Statut honnête** : ce dossier contient le code source complet de l'app,
> prêt à exécuter. Il n'a PAS été compilé en APK/AAB/IPA dans cet environnement
> (voir « Procédure de build » ci-dessous). Le suivi GPS en arrière-plan doit
> être validé sur un téléphone réel avant toute communication publique.

## Écrans livrés

1. Connexion sécurisée (Supabase Auth, session persistante)
2. Missions — trajets attribués + colis affectés (RLS : uniquement les vôtres)
3. Détail colis — actions de statut (prise en charge → transit → arrivé → prêt)
4. Vérification du code de retrait (RPC serveur, 5 tentatives max, usage unique)
5. Écran GPS — état du suivi, précision, compteur d'envois, file d'attente hors-ligne
6. Déclaration d'incident (colis endommagé, retard, perdu…)
7. Historique des opérations
8. Profil professionnel + véhicule + partenaire (via RLS)

## GPS — fonctionnement réel

- **Premier plan** : `expo-location` `watchPositionAsync` — envoi si déplacement > 25 m.
- **Arrière-plan (Android)** : `startLocationUpdatesAsync` + `expo-task-manager`,
  service en premier plan notifié (« KoliBus — mission active »).
- **Arrière-plan (iOS)** : `UIBackgroundModes: location` + indicateur bleu iOS.
- **Refus hors mission** : la position n'est envoyée QUE si le trajet est `en_cours`
  (double contrôle : app + RPC serveur `kolibus_push_location`). Rien n'est collecté
  ni stocké hors des périodes de service.
- **Hors-ligne** : file d'attente locale (AsyncStorage, max 200 fixes) renvoyée au
  retour du réseau (`Renvoyer les positions en attente`).
- **Batterie/budget** : précision `Balanced`, distance min. 25 m, période max 15 s —
  configurable dans `src/lib/config.ts`.

## Configuration

1. Créer le projet Supabase et exécuter les migrations
   (`supabase/migrations/0001_schema.sql`, `0002_rls_rpc.sql`, `seed.sql`) —
   voir `docs/supabase-setup.md`.
2. Renseigner les clés **anon** (jamais service_role) :
   - `app.json` → `extra.supabaseUrl` / `extra.supabaseAnonKey`, ou
   - variables EAS : `eas secret:create` + `eas.json` (profil preview/production).
3. Créer un utilisateur transporteur : inscription côté web puis
   `update public.profiles set role='chauffeur' where id='…';`
   et rattacher le profil au trajet :
   `update public.trips set driver_id='<uuid>' where id='…';`

## Lancement en développement

```bash
cd kolibus-transport
npm install
npx expo start        # puis scanner le QR avec Expo Go
```

## Procédure de build (à exécuter avec un compte Expo)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview   # APK de test signé
eas build -p android --profile production  # AAB pour le Play Store
eas build -p ios --profile preview       # IPA de test (compte Apple requis)
```

Identifiants d'application : `sn.kolibus.transport` (Android), `sn.kolibus.transport` (iOS).
Voir `docs/stores.md` pour la préparation aux stores et la politique de confidentialité.

## Tests à effectuer sur appareils réels (checklist)

1. Connexion avec un compte chauffeur → seules SES missions s'affichent.
2. Démarrer une mission → l'écran GPS autorise le suivi.
3. GPS premier plan : se déplacer → le client web (/suivi) voit la position bouger.
4. Écran verrouillé / app en arrière-plan (Android) → la transmission continue.
5. Mode avion → les positions passent en file ; réseau rétabli → renvoi OK.
6. Fin de mission → arrêt du service, plus aucune position collectée.
7. Code de retrait : code correct → livré ; code erroné ×5 → vérification bloquée.
