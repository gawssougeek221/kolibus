# Configuration Supabase — KoliBus (≈ 10 minutes)

## 1 · Créer le projet
1. https://supabase.com → New project (offre gratuite, région la plus proche : eu-west / af-south).
2. Noter `Project URL` et `anon public key` (Settings → API). **Ne jamais utiliser la clé `service_role` dans un client.**

## 2 · Exécuter les migrations
SQL Editor → coller et exécuter dans l'ordre :
1. `supabase/migrations/0001_schema.sql` — tables, index, triggers, contraintes
2. `supabase/migrations/0002_rls_rpc.sql` — RLS + RPC sécurisées (création colis, statuts, code retrait, GPS, suivi public)
3. `supabase/seed.sql` — ligne pilote, 5 arrêts, grille tarifaire, partenaires D'EXEMPLE

## 3 · Connecter les applications web
```bash
cp .env.example .env.local   # remplir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```
→ Le badge « MODE DÉMO » disparaît ; les 3 interfaces utilisent PostgreSQL + Realtime.

## 4 · Créer les comptes
- **Admin** : s'inscrire sur `/app/connexion` puis dans le SQL Editor :
  `update public.profiles set role='admin' where phone='+221XXXXXXXXX';`
  (la promotion admin ne peut être faite QUE par SQL — aucun client ne peut s'auto-promouvoir,
  la policy RLS `profiles` bloque la modification du rôle).
- **Transporteur** : inscrire l'utilisateur, puis
  `update public.profiles set role='chauffeur';` (ou `receveur`) et le rattacher au trajet :
  `update public.trips set driver_id='<uuid profil>' where id='<uuid trajet>';`
  Dans l'app Expo, le chauffeur se connecte avec son e-mail ; il ne voit que SES trajets.

## 5 · Tester les politiques RLS (procédure)

| Test | Procédure | Résultat attendu |
|---|---|---|
| Client ne voit pas les autres colis | Requête `select * from parcels` avec son JWT (`anon` key + auth) | Seulement `sender_id = auth.uid()` |
| Transporteur limité à ses trajets | JWT chauffeur A : `select * from parcels` | Uniquement colis des trajets où driver/receiver = A **et** trajet `en_cours` |
| Auto-promotion admin impossible | `update profiles set role='admin' where id=self` (JWT client) | Refusé (policy `with check`) |
| Statuts non autorisés refusés | `select kolibus_set_parcel_status(id,'en_transit')` sur colis `affecte` | Exception « Transition interdite » |
| Transporteur hors mission ne poste pas de position | `kolibus_push_location` sur trajet `planifie` | `{ok:false, error:'Trajet non actif…'}` |
| Code erroné compté puis verrouillé | 5 × `kolibus_verify_pickup_code` avec mauvais code | 4 × « erroné (n/5) » puis « bloqué » |
| Double remise impossible | 2e `kolibus_verify_pickup_code` après succès | « Colis non prêt au retrait » (statut = livre) |
| Suivi public sans PII | `select kolibus_public_tracking('<ref>')` | Statut + arrêt + initiales + position ; aucune PII expéditeur |
| Colis non validé invisible publiquement | `kolibus_public_tracking` sur statut `en_attente` | Ligne vide |
| Réécriture d'historique impossible | `insert into parcel_status_events…` en tant qu'utilisateur | Refusé (revoke insert) |

Astuce : dans Supabase → Authentication → Users, « impersonate » un utilisateur pour rejouer
ces requêtes avec son rôle réel.

## 6 · Realtime
Les clients s'abonnent au schéma public (parcels, vehicle_locations, trips…).
Vérifier : Database → Replication → `supabase_realtime` activé sur `vehicle_locations`
et `parcels` (activé par défaut sur les migrations récentes).

## 7 · Retention GPS (optionnel, recommandé)
```sql
-- Extension cron, puis :
select cron.schedule('kolibus_purge_locations','0 3 * * *',
  $$delete from vehicle_locations where received_at < now() - interval '7 days'$$);
```
