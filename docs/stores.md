# Préparation aux stores (Google Play · Apple App Store)

## Identifiants d'applications (documentés, distincts)
| Application | Android package | iOS bundle |
|---|---|---|
| KoliBus Client (PWA → wrap natif ultérieur) | `sn.kolibus.client` | `sn.kolibus.client` |
| KoliBus Transport (app Expo livrée) | `sn.kolibus.transport` | `sn.kolibus.transport` |

## 1 · KoliBus Transport (app Expo)
Le projet `kolibus-transport/` est prêt pour EAS :

```bash
cd kolibus-transport
npm install -g eas-cli && eas login
eas build:configure
# Comptes/variables :
eas secret:create --name SUPABASE_URL --value "https://xxx.supabase.co"
eas secret:create --name SUPABASE_ANON_KEY --value "eyJ…anon…"
# Builds de test (APK interne / IPA) :
eas build -p android --profile preview
eas build -p ios --profile preview      # compte Apple Developer requis
# Production :
eas build -p android --profile production   # AAB signé
eas submit -p android                       # après création fiche Play Console
```

Icône & splash : ajouter `assets/icon.png` (1024×1024, dérivé de la bannière officielle)
et `assets/splash.png` dans `app.json` (`icon`, `splash.image`).
⚠️ Aucun APK/AAB/IPA n'a été généré dans cet environnement — la procédure ci-dessus
est fournie pour exécution par vos soins.

## 2 · KoliBus Client
- Le MVP est une **PWA installable** (manifest + icônes 192/512 + maskable fournis,
  `theme_color #123D33`, mode standalone). Installation : menu navigateur →
  « Ajouter à l'écran d'accueil ». **Ne bloque pas le pilote** en attendant les stores.
- Pour une future présence store : enveloppement Capacitor (recommandé : réutilise
  exactement ce code web) avec les identifiants ci-dessus, ou React Native dérivé
  de `kolibus-transport` (le domaine métier `src/lib/kb` est partagé).

## 3 · Exigences stores (à préparer)
- **Politique de confidentialité** — modèle à compléter selon les données réellement
  collectées au pilote : nom, téléphone, e-mail, contenu/description du colis,
  position GPS **du véhicule uniquement pendant les missions actives** (7 jours de
  conservation), événements de colis. Héberger la page (ex. `/confidentialite`) et
  coller l'URL dans les fiches stores.
- **Permission localisation** :
  - Android : remplir la déclaration Play Console (Data safety) + vidéo de la
    permission « autoriser tout le temps » pour la démo de validation ;
  - iOS : `NSLocationWhenInUseUsageDescription` et
    `NSLocationAlwaysAndWhenInUseUsageDescription` déjà renseignées dans `app.json`.
- **Comptes** : compte Google Play Console (25 $ une fois), Apple Developer (99 $/an).
- **Test interne** : publier d'abord en « test interne/clos » aux transporteurs réels.

## 4 · Procédure de tests sur appareils réels
Reprendre la checklist du `kolibus-transport/README.md` (GPS premier plan,
arrière-plan Android, mode avion, fin de mission, code de retrait) et archiver les
captures pour les déclarations stores.
