# KoliBus — MVP fonctionnel (pilote Keur Massar ⇄ Pikine)

**Réserver. Suivre. Récupérer.** — Transport de colis par Tata et transporteurs partenaires au Sénégal · FCFA · +221 · Français.

Ce dépôt transforme le prototype visuel « Yoobanté » en **MVP opérationnel** : trois interfaces
partageant la même couche de données, un schéma PostgreSQL/Supabase complet avec RLS,
un suivi GPS réel et un cycle de vie colis contrôlé de bout en bout.

---

## 1 · Ce qui est RÉELLEMENT opérationnel (testé ici)

| Fonctionnalité | État | Où tester |
|---|---|---|
| Création d'un envoi (4 étapes, tarification FCFA en direct) | ✅ Réel | `/app` → Envoyer |
| Génération référence unique `KB-AAMM-XXXXXX` + code de retrait à 4 chiffres (haché SHA-256) | ✅ Réel | Écran de confirmation |
| Validation / annulation / affectation à un trajet (rôles contrôlés) | ✅ Réel | `/admin` (PIN démo 0000) |
| Cycle complet : en_attente → confirmée → affecté → prise_en_charge → en_transit → arrivé → prêt → livré | ✅ Réel | Client + Admin + Transport |
| Encaissement espèces / référence mobile money (registre) | ✅ Réel (manuel) | `/admin` → Colis |
| Suivi public **sans compte** pour le destinataire (info minimale, aucune PII) | ✅ Réel | `/suivi/KB-…` |
| **GPS réel** du téléphone transporteur (navigateur) → carte client OpenStreetMap | ✅ Réel même navigateur | `/transport` → GPS |
| Indicateur de fraîcheur (« dernière position il y a X min », live/récent/périmé) | ✅ Réel | `/suivi` |
| Simulation GPS de démonstration — **étiquetée SIMULATION**, jamais mélangée au GPS réel | ✅ | `/suivi` (mode démo uniquement) |
| Vérification du code : usage unique, 5 tentatives max, verrouillage, journal d'audit | ✅ Réel | `/transport` → colis prêt |
| Notifications in-app à chaque étape (expéditeur + destinataire) | ✅ Réel | `/app` → Alertes |
| Journal d'audit des actions sensibles | ✅ Réel | `/admin` → Audit |
| App mobile Expo complète (source : GPS avant/arrière-plan, file hors-ligne) | ✅ Code livré — **non compilé ici** | `/kolibus-transport` |
| Migrations SQL + politiques RLS + 4 RPC sécurisées | ✅ Prêt à exécuter | `supabase/` |
| Tests logique métier (machine à états, tarifs, codes, fraîcheur) | ✅ **34/34** | `node scripts/test-kb-domain.ts` |

## 2 · Ce qui NÉCESSITE une action externe de votre part

- **Multi-appareils** : en mode démo les données sont locales au navigateur (localStorage).
  Dès que vous créez le projet Supabase et renseignez `.env.local`, les trois interfaces
  partagent la même base avec Realtime — 10 minutes de configuration (doc dédiée).
- **Authentification réelle** : le code Supabase Auth est branché ; il s'active avec les clés.
  En démo, la session est locale.
- **App mobile** : exécuter `eas build` avec un compte Expo (procédure dans
  `kolibus-transport/README.md`). Le GPS d'arrière-plan doit être **testé sur téléphone réel**
  avant toute communication publique.
- **Paiement mobile réel** (Wave/OM) : NON intégré — aucune clé prestataire, aucune
  transaction simulée. Le MVP enregistre les paiements espèces et les références manuellement.
- **Partenaires** : les deux GIE de la base sont des **exemples de démonstration** explicitement
  étiquetés. Remplacez-les après signature.
- **Notifications push externes** : architecture prête (table notifications + types), aucune
  notification SMS/push réelle n'est envoyée dans ce MVP.

## 3 · Démarrage local

```bash
# Application web (Client PWA + Admin + Transport web + Suivi public)
npm install
npm run dev           # http://localhost:3000

# Tests logique métier
node scripts/test-kb-domain.ts

# App mobile (code source, requires Expo)
cd kolibus-transport && npm install && npx expo start
```

Pages : `/` accueil · `/app` client · `/admin` console (démo : PIN 0000) ·
`/transport` espace transporteur web de test · `/suivi/[ref]` suivi public ·
`/atlas` archive du prototype visuel (36 écrans).

## 4 · Activer le pilote réel (résumé)

1. Créer un projet Supabase (gratuit) → exécuter les 3 fichiers SQL de `supabase/`.
2. Copier `.env.example` → `.env.local`, renseigner URL + clé anon → redémarrer.
3. Promouvoir votre compte admin (SQL fourni dans la doc), créer les comptes transporteurs.
4. Suivre `docs/gps.md` pour valider le GPS sur 2 téléphones réels.

Détails : **docs/supabase-setup.md** · GPS : **docs/gps.md** · Stores : **docs/stores.md**.

## 5 · Budget

| Poste | Coût pilote |
|---|---|
| Supabase (base, auth, realtime, stockage) | 0 F (offre gratuite) |
| Expo / EAS build (quota gratuit) | 0 F |
| Cartes OpenStreetMap (tuiles OSM, usage modéré) | 0 F — respecter la politique d'usage |
| Hébergement web (Vercel/Netlify gratuit) | 0 F |
| Téléphones (existants), data mobile | coût opérateur |
| **Total technique** | **< 100 000 FCFA** (essentiellement data + éventuel compte Apple 99 $/an si publication iOS) |

## 6 · Limites connues & prochaines étapes

- Les coordonnées des arrêts sont indicatives → relevé terrain pour calage précis.
- Une seule ligne (KM⇄PK) ; le schéma supporte déjà plusieurs lignes/arrêts.
- Pas d'app natif compilé ni de publication stores dans ce livrable (procédure fournie).
- Historique GPS purgé au-delà de 2 000 points en démo ; retention SQL 7 jours fournie
  (pg_cron à activer chez Supabase).
- Les codes de retrait en mode démo sont stockés localement pour l'affichage de confirmation ;
  en mode Supabase seul le hachage quitte le serveur (voir RPC).
- Vitrine statique historique (`download/yoobante-vitrine-statique.zip`) = archive du prototype,
  à ne pas confondre avec le MVP.
