/* ============================================================
   KoliBus — Tests de la logique métier (sans backend)
   Exécution : node scripts/test-kb-domain.ts
   ============================================================ */
import {
  canTransition, canTransitionAsRole, computeTariff, fcfa, normalizePhone,
  makeReference, hashPickupCode, pickupLocked, freshnessOf, freshnessLabel,
  distanceKm, validateParcelInput, PICKUP_MAX_ATTEMPTS,
} from '../src/lib/kb/domain.ts';
import type { Stop, TariffGrid, Parcel } from '../src/lib/kb/types.ts';

let passed = 0, failed = 0;
function check(name: string, cond: boolean) {
  if (cond) { passed += 1; console.log(`  ✔ ${name}`); }
  else { failed += 1; console.error(`  ✘ ${name}`); }
}

console.log('\n=== Machine à états ===');
check('en_attente → confirmee autorisée', canTransition('en_attente', 'confirmee'));
check('en_attente → en_transit interdite', !canTransition('en_attente', 'en_transit'));
check('livre → n\u2019importe quoi interdit', !canTransition('livre', 'pret_a_recuperer'));
check('pret_a_recuperer → livre autorisée', canTransition('pret_a_recuperer', 'livre'));
check('admin peut confirmer', canTransitionAsRole('en_attente', 'confirmee', 'admin'));
check('client NE peut PAS confirmer', !canTransitionAsRole('en_attente', 'confirmee', 'client'));
check('chauffeur peut mettre en transit', canTransitionAsRole('prise_en_charge', 'en_transit', 'chauffeur'));
check('receveur peut marquer prêt', canTransitionAsRole('arrive', 'pret_a_recuperer', 'receveur'));
check('client ne peut pas prendre en charge', !canTransitionAsRole('affecte', 'prise_en_charge', 'client'));
check('admin peut annuler un colis affecté', canTransitionAsRole('affecte', 'annule', 'admin'));
check('arrive → pret obligatoire (pas de saut)', !canTransition('arrive', 'livre'));

console.log('\n=== Tarification FCFA ===');
const stops: Stop[] = [
  { id: 's0', route_id: 'r', name: 'A', area: 'A', lat: 14.7708, lng: -17.3163, position_order: 0 },
  { id: 's1', route_id: 'r', name: 'B', area: 'B', lat: 14.7560, lng: -17.3330, position_order: 1 },
  { id: 's4', route_id: 'r', name: 'E', area: 'E', lat: 14.7510, lng: -17.3880, position_order: 4 },
];
const grid: TariffGrid = {
  route_id: 'r', base_fcfa: 1000, per_segment_fcfa: 200, free_weight_kg: 5,
  per_kg_extra_fcfa: 150, fragile_fcfa: 300, express_fcfa: 500, updated_at: '',
};
const t1 = computeTariff(stops, grid, { dropoff_stop_id: 's0', pickup_stop_id: 's4', weight_kg: 3, fragile: false, express: false });
check('KM→PK 4 tronçons 3 kg = 1800 F', t1?.total === 1800);
const t2 = computeTariff(stops, grid, { dropoff_stop_id: 's0', pickup_stop_id: 's4', weight_kg: 8, fragile: true, express: false });
check('8 kg (+3 kg) fragile = 1800+450+300 = 2550 F', t2?.total === 2550);
const t3 = computeTariff(stops, grid, { dropoff_stop_id: 's0', pickup_stop_id: 's0', weight_kg: 3, fragile: false, express: false });
check('même arrêt refusé (null)', t3 === null);
check('format FCFA 2550 → "2 550 F"', fcfa(2550) === '2 550 F');

console.log('\n=== Téléphones sénégalais ===');
check('77 123 45 67 → +221771234567', normalizePhone('77 123 45 67') === '+221771234567');
check('+221788901234 accepté', normalizePhone('+221788901234') === '+221788901234');
check('05… refusé (pas un mobile SN)', normalizePhone('0512345678') === null);
check('76 valide', normalizePhone('765432198') === '+221765432198');

console.log('\n=== Codes de retrait ===');
const ref1 = makeReference(), ref2 = makeReference();
check('format référence KB-AAMM-XXXXXX', /^KB-\d{4}-[A-Z2-9]{6}$/.test(ref1));
check('références uniques', ref1 !== ref2);
const p1: Parcel = { pickup_attempts: 5 } as Parcel;
const p2: Parcel = { pickup_attempts: 4 } as Parcel;
check('5 tentatives → verrouillé', pickupLocked(p1));
check('4 tentatives → pas verrouillé', !pickupLocked(p2));
check('PICKUP_MAX_ATTEMPTS = 5', PICKUP_MAX_ATTEMPTS === 5);
const h1 = await hashPickupCode('5831');
const h2 = await hashPickupCode('5832');
check('hachage SHA-256 stable', h1 === await hashPickupCode('5831'));
check('codes différents → hachés différents', h1 !== h2);

console.log('\n=== Fraîcheur GPS ===');
check('aucune position → none', freshnessOf(null) === 'none');
check('position 1 min → live', freshnessOf(new Date(Date.now() - 60_000).toISOString()) === 'live');
check('position 8 min → recent', freshnessOf(new Date(Date.now() - 8 * 60_000).toISOString()) === 'recent');
check('position 45 min → stale', freshnessOf(new Date(Date.now() - 45 * 60_000).toISOString()) === 'stale');
check('libellé indisponible', freshnessLabel(null) === 'Position indisponible');
check('libellé stale contient minutes', freshnessLabel(new Date(Date.now() - 45 * 60_000).toISOString()).includes('45 minutes'));

console.log('\n=== Géographie & validation ===');
const d = distanceKm({ lat: 14.7708, lng: -17.3163 }, { lat: 14.7510, lng: -17.3880 });
check('Keur Massar → Pikine ≈ 6-9 km', d > 5 && d < 10);
const errs = validateParcelInput({ sender_name: 'Fa', sender_phone: 'xx' });
check('validation rejette nom court + téléphone', Object.keys(errs).length >= 2);

console.log(`\n=== RÉSULTAT : ${passed} réussis · ${failed} échoués ===`);
if (failed > 0) process.exit(1);
