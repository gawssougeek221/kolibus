# GPS KoliBus — fonctionnement, fraîcheur, limites

## 1 · Chaîne complète (production, Supabase connecté)

```
Téléphone transporteur (app Expo)                 Client web (/suivi)
expo-location  ──RPC kolibus_push_location──▶  vehicle_locations (Postgres)
   lat, lng, précision,                              │
   vitesse, horodatage                       Realtime broadcast
   ▼                                                ▼
Contrôles serveur :                      MapPanel (react-leaflet + OSM)
 · trajet EN COURS obligatoire           + Freshness (« Dernière position
 · transporteur assigné au trajet           reçue il y a X min »)
```

## 2 · Économie batterie & budget
- Précision `Balanced` (± 30 m) — suffisante pour un suivi de tata.
- Envoi si déplacement > 25 m OU 15 s max (configurable `GPS_CONFIG`).
- Aucune collecte hors mission : la tâche d'arrière-plan s'arrête avec la mission
  et la RPC serveur refuse toute position d'un trajet non actif.
- Lecture carte = **dernière position uniquement** (index `trip_id, received_at desc`),
  jamais l'historique complet. Historique conservé 7 jours (purge pg_cron fournie).

## 3 · Fraîcheur affichée à l'utilisateur
| Âge | État | Libellé |
|---|---|---|
| < 3 min | live | « Position reçue à l'instant / il y a X min » (pastille verte pulsante) |
| 3–15 min | recent | « Dernière position reçue il y a X min » (pastille ambre) |
| > 15 min | stale | idem + « Position indisponible pour le moment » (gris) |
| aucune | none | « Position indisponible » |

## 4 · Mode démo (sans Supabase)
- `/transport` → écran GPS utilise `navigator.geolocation` **réel** du navigateur et
  publie dans la couche locale : le suivi fonctionne **dans le même navigateur**.
- `/suivi` propose un simulateur « le long de la ligne », explicitement étiqueté
  **SIMULATION GPS — DONNÉES DE TEST UNIQUEMENT** ; les positions simulées portent
  `source:'simulation'` et le marqueur carte affiche « Véhicule (simulation) ».
  Le GPS réel et la simulation ne sont jamais mélangés.

## 5 · Validation sur appareils réels (à faire avant le pilote)
1. Android (Expo Go d'abord, puis APK `eas build --profile preview`) :
   - permission premier plan OK → position visible sur /suivi ;
   - permission « autoriser tout le temps » → écran éteint, position continue ;
   - notification « KoliBus — mission active » présente (service foreground) ;
2. iOS : indicateur bleu visible en arrière-plan ; tester après build IPA réel.
3. Mode avion 2 min → positions en file ; retour réseau → « Renvoyer » OK.
4. Fin de mission → plus aucune position collectée (vérifier `vehicle_locations`).
5. Téléphone du passager du RECEVEUR : vérifier qu'un second compte assigné au
   même trajet peut aussi publier (receveur ≠ chauffeur).

⚠️ **Honnêteté** : tant que les étapes 1–5 ne sont pas passées sur de vrais
téléphones, ne pas annoncer « suivi GPS en arrière-plan » publiquement.

## 6 · Cartes OpenStreetMap — conditions d'usage
Le MVP utilise les tuiles `tile.openstreetmap.org` avec attribution obligatoire
(affichée sur la carte). Pour un usage commercial intensif, prévoir un fournisseur
de tuiles dédié (ex. offre gratuite communautaire ou payante) et conserver
l'attribution OSM ©.
