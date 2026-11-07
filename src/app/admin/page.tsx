'use client';

/* ============================================================
   KoliBus Admin — console privée (mode démo : PIN 0000)
   Onglets : Vue d'ensemble · Colis · Trajets · Partenaires ·
             Tarifs · Incidents · Audit
   Toutes les actions passent par la couche métier (rôles vérifiés)
   ============================================================ */
import * as React from 'react';
import {
  LayoutDashboard, Package, Route, Handshake, BadgeDollarSign,
  TriangleAlert, ScrollText, Lock, ArrowLeft, CheckCircle2, XCircle,
  LogOut, Plus, Truck, Flag,
} from 'lucide-react';
import { kb, useKbSync, IS_DEMO } from '@/lib/kb/store';
import { Kpi, StatusBadge, Section, Field, inputCls, useToast, Toast, Freshness } from '@/components/kb/ui';
import { fcfa, dateTimeFr, phonePretty } from '@/lib/kb/domain';
import type { Parcel, ParcelStatus, Trip } from '@/lib/kb/types';

const TABS = [
  { id: 'overview', label: 'Vue d\u2019ensemble', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'parcels', label: 'Colis', icon: <Package className="h-4 w-4" /> },
  { id: 'trips', label: 'Trajets', icon: <Route className="h-4 w-4" /> },
  { id: 'partners', label: 'Partenaires', icon: <Handshake className="h-4 w-4" /> },
  { id: 'tariffs', label: 'Tarifs', icon: <BadgeDollarSign className="h-4 w-4" /> },
  { id: 'incidents', label: 'Incidents', icon: <TriangleAlert className="h-4 w-4" /> },
  { id: 'audit', label: 'Audit', icon: <ScrollText className="h-4 w-4" /> },
] as const;

type TabId = typeof TABS[number]['id'];
const PIN = '0000'; /* réservé au MODE DÉMO — en production (Supabase) le PIN est ignoré :
                       le rôle « admin » est vérifié côté serveur par RLS (is_admin()) */

export default function AdminPage() {
  const v = useKbSync();
  const [unlocked, setUnlocked] = React.useState(false);
  const [pin, setPin] = React.useState('');
  const [tab, setTab] = React.useState<TabId>('overview');
  const [toast, showToast] = useToast();

  /* MODE SUPABASE : le PIN démo est inopérant — on déverrouille UNIQUEMENT si
     la session connectée porte le rôle « admin » (garanti par la RLS serveur). */
  React.useEffect(() => {
    if (IS_DEMO) return;
    const sess = kb().session();
    if (sess?.role === 'admin') setUnlocked(true);
  }, [v]);

  if (!unlocked) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center bg-kb-green px-6 text-white">
        <Lock className="h-8 w-8 text-kb-amber" />
        <h1 className="mt-3 text-[22px] font-black">KoliBus Admin</h1>
        <p className="mt-1 text-[12px] leading-relaxed text-white/70">
          Accès réservé aux opérateurs. {IS_DEMO
            ? 'Mode démo protégé par un code fixe.'
            : 'Connexion requise : le rôle « admin » est vérifié côté serveur (RLS Supabase).'}
        </p>
        {IS_DEMO ? (
          <div className="mt-6 rounded-2xl border border-dashed border-yb-amber/50 bg-yb-amber-soft/95 p-4 text-yb-ink">
            <div className="text-[10px] font-black tracking-widest text-yb-amber-deep">MODE DÉMO</div>
            <Field label="Code de démonstration" hint="0000">
              <input
                className={`${inputCls()} mt-1 text-center text-[22px] tracking-[0.4em]`}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                placeholder="····"
                autoFocus
              />
            </Field>
            <button
              onClick={() => (pin === PIN ? setUnlocked(true) : showToast('!Code incorrect'))}
              className="mt-3 w-full rounded-xl bg-kb-green py-3 text-[13px] font-black text-white"
            >
              Déverrouiller
            </button>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
            <div className="text-[10px] font-black tracking-widest text-kb-amber">ACCÈS SÉCURISÉ</div>
            <p className="mt-2 text-[12px] leading-relaxed text-white/70">
              Connectez-vous avec un compte dont le rôle <b className="text-kb-amber">admin</b> a été promu
              via SQL par le propriétaire du projet. Aucun code de secours n&apos;existe en cette variante.
            </p>
            <a href="/app/connexion" className="mt-3 block w-full rounded-xl bg-kb-amber py-3 text-center text-[13px] font-black text-yb-ink">
              Se connecter en tant qu&apos;admin
            </a>
            <a href="/admin" className="mt-2 block text-center text-[11.5px] font-bold text-white/70 underline decoration-white/30 underline-offset-2">
              Je suis déjà connecté — recharger
            </a>
          </div>
        )}
        <a href="/" className="mx-auto mt-6 flex items-center gap-1.5 text-[11.5px] font-bold text-white/70"><ArrowLeft className="h-3.5 w-3.5" /> Retour à l&apos;accueil</a>
        <Toast msg={toast} />
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-yb-cream">
      <header className="flex items-center justify-between border-b border-yb-line bg-kb-green px-5 py-3.5 text-white">
        <div>
          <div className="text-[15px] font-black">KoliBus <span className="text-kb-amber">Admin</span></div>
          <div className="text-[9.5px] text-white/60">Pilote Keur Massar ⇄ Pikine · opérateur : Admin</div>
        </div>
        <button onClick={() => setUnlocked(false)} className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[10.5px] font-bold">
          <LogOut className="h-3.5 w-3.5" /> Verrouiller
        </button>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-yb-line bg-white px-3 py-2 yb-scroll">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[11.5px] font-bold transition-colors ${
              tab === t.id ? 'bg-kb-green text-white' : 'text-yb-slate hover:bg-yb-cream'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      <div className="mx-auto max-w-5xl p-4">
        {tab === 'overview' && <Overview v={v} onGoto={setTab} showToast={showToast} />}
        {tab === 'parcels' && <ParcelsTab v={v} showToast={showToast} />}
        {tab === 'trips' && <TripsTab v={v} showToast={showToast} />}
        {tab === 'partners' && <PartnersTab v={v} />}
        {tab === 'tariffs' && <TariffsTab v={v} showToast={showToast} />}
        {tab === 'incidents' && <IncidentsTab v={v} showToast={showToast} />}
        {tab === 'audit' && <AuditTab v={v} />}
      </div>
      <Toast msg={toast} />
    </main>
  );
}

/* ================= VUE D'ENSEMBLE ================= */
function Overview({ v, onGoto, showToast }: { v: number; onGoto: (t: TabId) => void; showToast: (m: string) => void }) {
  const parcels = kb().parcels();
  const trips = kb().trips();
  const incidents = kb().incidents().filter(i => i.status !== 'resolu');
  const by = (s: ParcelStatus) => parcels.filter(p => p.status === s).length;
  const revenue = parcels.filter(p => p.payment_status === 'paye').reduce((n, p) => n + p.price_fcfa, 0);
  const activeTrip = trips.find(t => t.status === 'en_cours');
  const loc = activeTrip ? kb().latestLocation(activeTrip.id) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Colis enregistrés" value={parcels.length} sub={`${by('en_attente')} en attente de validation`} />
        <Kpi label="En transit" value={by('en_transit') + by('prise_en_charge')} tone="blue" sub={`${by('pret_a_recuperer')} prêts au retrait`} />
        <Kpi label="Livrés" value={by('livre')} tone="green" sub={`${by('annule')} annulés`} />
        <Kpi label="Encaissé" value={fcfa(revenue)} tone="amber" sub="paiements enregistrés" />
      </div>

      {IS_DEMO && (
        <div className="rounded-xl border border-yb-amber/40 bg-yb-amber-soft px-3.5 py-2.5 text-[10.5px] font-bold leading-relaxed text-yb-amber-deep">
          MODE DÉMO — données locales à ce navigateur. Le pilote réel exige Supabase (docs/supabase-setup.md).
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <Section title="MISSION EN COURS" icon={<Truck className="h-4 w-4" />}>
          {activeTrip && loc ? (
            <>
              <div className="text-[12.5px] font-bold text-yb-ink">
                {activeTrip.direction === 'aller' ? 'Keur Massar → Pikine' : 'Pikine → Keur Massar'} · {activeTrip.driver_name}
              </div>
              <div className="mt-1"><Freshness location={loc} /></div>
              <div className="mt-1 text-[11px] text-yb-slate">
                Position : {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)} · précision ±{Math.round(loc.accuracy_m ?? 0)} m
              </div>
            </>
          ) : (
            <p className="text-[12px] text-yb-slate">Aucune mission active. Démarrez un trajet depuis l&apos;onglet Trajets.</p>
          )}
        </Section>

        <Section title="ACTIONS RAPIDES">
          <div className="grid grid-cols-2 gap-2 text-[11.5px] font-bold">
            <button onClick={() => onGoto('parcels')} className="rounded-xl border border-yb-line bg-white px-3 py-2.5 text-left text-yb-ink hover:border-kb-green">
              ✅ {by('en_attente')} colis à valider
            </button>
            <button onClick={() => onGoto('parcels')} className="rounded-xl border border-yb-line bg-white px-3 py-2.5 text-left text-yb-ink hover:border-kb-green">
              📦 {by('confirmee')} à affecter
            </button>
            <button onClick={() => onGoto('trips')} className="rounded-xl border border-yb-line bg-white px-3 py-2.5 text-left text-yb-ink hover:border-kb-green">
              🚌 {trips.filter(t => t.status === 'planifie').length} trajets planifiés
            </button>
            <button onClick={() => onGoto('incidents')} className="rounded-xl border border-yb-line bg-white px-3 py-2.5 text-left text-yb-ink hover:border-kb-green">
              ⚠️ {incidents.length} incidents ouverts
            </button>
          </div>
          <p className="mt-2 text-[9.5px] text-yb-slate">Toutes ces actions sont réelles et journalisées dans l&apos;onglet Audit.</p>
        </Section>
      </div>
    </div>
  );
}

/* ================= COLIS ================= */
function ParcelsTab({ v, showToast }: { v: number; showToast: (m: string) => void }) {
  const parcels = kb().parcels();
  const trips = kb().trips().filter(t => t.status !== 'termine');
  const stops = kb().stops();
  const [assignFor, setAssignFor] = React.useState<string | null>(null);
  const [tripId, setTripId] = React.useState('');

  const act = (fn: () => void, okMsg: string) => {
    try { fn(); showToast(okMsg); } catch (e) { showToast(`!${e instanceof Error ? e.message : 'Action refusée'}`); }
  };

  return (
    <div className="space-y-3">
      {parcels.length === 0 && <Empty text="Aucun colis — créez un envoi depuis l'app client." />}
      {parcels.map((p: Parcel) => {
        const stop = stops.find(s => s.id === p.pickup_stop_id);
        return (
          <div key={p.id} className="rounded-2xl border border-yb-line bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[12.5px] font-black text-kb-green">{p.reference}</span>
                <span className="ml-2 text-[11px] text-yb-slate">{p.sender_name} → {p.recipient_name} · {stop?.name}</span>
              </div>
              <StatusBadge status={p.status} size="sm" />
            </div>
            <div className="mt-1 text-[10.5px] text-yb-slate">
              {p.category} · {p.weight_kg} kg · {fcfa(p.price_fcfa)} · {p.payment_status === 'paye' ? 'payé' : 'non payé'} · créé {dateTimeFr(p.created_at)}
            </div>

            {/* Actions admin selon statut */}
            <div className="mt-2.5 flex flex-wrap gap-2">
              {p.status === 'en_attente' && (
                <ActBtn onClick={() => act(() => kb().setStatus(p.id, 'confirmee', 'Admin', 'admin', 'Validée au comptoir'), `${p.reference} confirmée`)} tone="green">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Confirmer l&apos;envoi
                </ActBtn>
              )}
              {p.status === 'confirmee' && (
                <ActBtn onClick={() => { setAssignFor(p.id); setTripId(''); }} tone="violet">
                  <Truck className="h-3.5 w-3.5" /> Affecter à un trajet
                </ActBtn>
              )}
              {p.payment_status !== 'paye' && ['confirmee', 'en_attente', 'affecte'].includes(p.status) && (
                <ActBtn onClick={() => act(() => { kb().recordPayment(p.id, 'especes', `CASH-${p.reference.slice(-4)}`, 'Admin'); }, 'Paiement espèces enregistré')} tone="amber">
                  💵 Encaisser espèces
                </ActBtn>
              )}
              {!['livre', 'annule'].includes(p.status) && (
                <ActBtn onClick={() => act(() => kb().setStatus(p.id, 'annule', 'Admin', 'admin', 'Annulé par l\'administration'), `${p.reference} annulée`)} tone="red">
                  <XCircle className="h-3.5 w-3.5" /> Annuler
                </ActBtn>
              )}
            </div>

            {/* Affectation */}
            {assignFor === p.id && (
              <div className="mt-2.5 rounded-xl border border-yb-violet/30 bg-[#EFE9F8] p-3">
                <div className="text-[10.5px] font-black text-yb-violet">AFFECTER À UN TRAJET</div>
                <div className="mt-2 flex gap-2">
                  <select value={tripId} onChange={e => setTripId(e.target.value)} className={`${inputCls()} flex-1 text-[12px]`}>
                    <option value="">Choisir un trajet planifié…</option>
                    {trips.map((t: Trip) => (
                      <option key={t.id} value={t.id}>
                        {t.direction === 'aller' ? 'Aller' : 'Retour'} · {dateTimeFr(t.depart_at)} · {t.driver_name} / {t.receiver_name} · {t.vehicle_id === 'veh_1' ? 'Tata DK 4521 BC' : 'Tata DK 8730 FG'}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (!tripId) { showToast('!Choisissez un trajet'); return; }
                      act(() => {
                        kb().assignParcel(p.id, tripId, 'Admin');
                      }, 'Colis affecté — visible par le transporteur');
                      setAssignFor(null);
                    }}
                    className="rounded-xl bg-yb-violet px-4 py-2 text-[12px] font-bold text-white"
                  >
                    Affecter
                  </button>
                  <button onClick={() => setAssignFor(null)} className="rounded-xl border border-yb-line bg-white px-3 text-[12px] font-bold text-yb-slate">Fermer</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ================= TRAJETS ================= */
function TripsTab({ v, showToast }: { v: number; showToast: (m: string) => void }) {
  const trips = kb().trips();
  const vehicles = kb().vehicles();
  const [showForm, setShowForm] = React.useState(false);
  const [f, setF] = React.useState({ driver_name: '', driver_phone: '', receiver_name: '', direction: 'aller', depart_at: '', vehicle_id: '' });

  const act = (fn: () => void, okMsg: string) => {
    try { fn(); showToast(okMsg); } catch (e) { showToast(`!${e instanceof Error ? e.message : 'Action refusée'}`); }
  };

  return (
    <div className="space-y-3">
      <button onClick={() => setShowForm(s => !s)} className="flex items-center gap-1.5 rounded-xl bg-kb-green px-4 py-2.5 text-[12px] font-bold text-white">
        <Plus className="h-4 w-4 text-kb-amber" /> Nouveau trajet
      </button>

      {showForm && (
        <div className="rounded-2xl border border-yb-line bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Chauffeur (nom)">
              <input className={inputCls()} value={f.driver_name} onChange={e => setF({ ...f, driver_name: e.target.value })} placeholder="Mamadou Diallo" />
            </Field>
            <Field label="Téléphone chauffeur">
              <input className={inputCls()} value={f.driver_phone} onChange={e => setF({ ...f, driver_phone: e.target.value })} placeholder="77 512 34 10" />
            </Field>
            <Field label="Receveur du tata">
              <input className={inputCls()} value={f.receiver_name} onChange={e => setF({ ...f, receiver_name: e.target.value })} placeholder="Awa Cissé" />
            </Field>
            <Field label="Véhicule">
              <select className={inputCls()} value={f.vehicle_id} onChange={e => setF({ ...f, vehicle_id: e.target.value })}>
                <option value="">Choisir…</option>
                {vehicles.map(vh => <option key={vh.id} value={vh.id}>{vh.plate} · {vh.model}</option>)}
              </select>
            </Field>
            <Field label="Direction">
              <select className={inputCls()} value={f.direction} onChange={e => setF({ ...f, direction: e.target.value })}>
                <option value="aller">Aller — Keur Massar → Pikine</option>
                <option value="retour">Retour — Pikine → Keur Massar</option>
              </select>
            </Field>
            <Field label="Départ prévu">
              <input type="datetime-local" className={inputCls()} value={f.depart_at} onChange={e => setF({ ...f, depart_at: e.target.value })} />
            </Field>
          </div>
          <button
            onClick={() => {
              if (!f.driver_name || !f.receiver_name || !f.vehicle_id || !f.depart_at) { showToast('!Remplissez tous les champs'); return; }
              const route = kb().routes()[0];
              act(() => {
                kb().createTrip({
                  route_id: route.id, vehicle_id: f.vehicle_id,
                  driver_name: f.driver_name, driver_phone: f.driver_phone || '+221700000000',
                  receiver_name: f.receiver_name, direction: f.direction as Trip['direction'],
                  depart_at: new Date(f.depart_at).toISOString(),
                });
              }, 'Trajet créé');
              setShowForm(false);
            }}
            className="mt-3 w-full rounded-xl bg-kb-green py-2.5 text-[12.5px] font-bold text-white"
          >
            Créer le trajet
          </button>
        </div>
      )}

      {trips.map(t => {
        const veh = vehicles.find(x => x.id === t.vehicle_id);
        const parcelsOnTrip = kb().parcels().filter(p => p.trip_id === t.id);
        const loc = t.status === 'en_cours' ? kb().latestLocation(t.id) : null;
        return (
          <div key={t.id} className="rounded-2xl border border-yb-line bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[13px] font-black text-yb-ink">
                  {t.direction === 'aller' ? 'Aller · Keur Massar → Pikine' : 'Retour · Pikine → Keur Massar'}
                </div>
                <div className="mt-0.5 text-[11px] text-yb-slate">
                  {veh?.plate} · {t.driver_name} {t.driver_phone && `(${phonePretty(t.driver_phone)})`} · receveur {t.receiver_name}
                </div>
                <div className="text-[10.5px] text-yb-slate">Départ : {dateTimeFr(t.depart_at)} · {parcelsOnTrip.length} colis affecté(s)</div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                t.status === 'en_cours' ? 'bg-yb-blue-soft text-yb-blue'
                  : t.status === 'termine' ? 'bg-yb-cream text-yb-slate'
                  : 'bg-yb-amber-soft text-yb-amber-deep'
              }`}>
                {t.status === 'planifie' ? 'Planifié' : t.status === 'en_cours' ? 'En cours' : 'Terminé'}
              </span>
            </div>
            {loc && <div className="mt-2"><Freshness location={loc} /></div>}
            <div className="mt-2.5 flex flex-wrap gap-2">
              {t.status === 'planifie' && (
                <ActBtn onClick={() => act(() => kb().startTrip(t.id, 'Admin'), 'Trajet démarré — le transporteur peut transmettre sa position GPS')} tone="green">
                  ▶ Démarrer le trajet
                </ActBtn>
              )}
              {t.status === 'en_cours' && (
                <ActBtn onClick={() => act(() => kb().endTrip(t.id, 'Admin'), 'Trajet terminé — transmission GPS arrêtée')} tone="slate">
                  ⏹ Terminer le trajet
                </ActBtn>
              )}
            </div>
          </div>
        );
      })}
      {trips.length === 0 && <Empty text="Aucun trajet — créez le premier." />}
    </div>
  );
}

/* ================= PARTENAIRES & VÉHICULES ================= */
function PartnersTab({ v }: { v: number }) {
  const partners = kb().partners();
  const vehicles = kb().vehicles();
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-yb-amber/40 bg-yb-amber-soft px-3.5 py-2.5 text-[10.5px] font-bold leading-relaxed text-yb-amber-deep">
        Partenaires d&apos;EXEMPLE (démo) — aucun partenariat réel n&apos;est simulé. Remplacez-les par les GIE
        signés avant le pilote. {IS_DEMO ? 'Ajout : via migrations SQL en production.' : ''}
      </div>
      {partners.map(pt => (
        <div key={pt.id} className="rounded-2xl border border-yb-line bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-black text-yb-ink">{pt.name}</div>
              <div className="text-[11px] text-yb-slate">{pt.contact_name} · {phonePretty(pt.contact_phone)}</div>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${pt.status === 'actif' ? 'bg-yb-green-soft text-yb-green' : 'bg-yb-red-soft text-yb-red'}`}>
              {pt.status === 'actif' ? 'Actif' : 'Suspendu'}
            </span>
          </div>
          {pt.note && <p className="mt-1.5 text-[10px] italic text-yb-slate">{pt.note}</p>}
          <div className="mt-2.5 space-y-1.5">
            {vehicles.filter(x => x.partner_id === pt.id).map(vh => (
              <div key={vh.id} className="flex items-center justify-between rounded-xl bg-yb-cream px-3 py-2 text-[11.5px]">
                <span className="font-bold text-yb-ink">{vh.plate} · {vh.type}</span>
                <span className="text-yb-slate">{vh.capacity} places colis · {vh.model}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================= TARIFS ================= */
function TariffsTab({ v, showToast }: { v: number; showToast: (m: string) => void }) {
  const grid = kb().tariffs()[0];
  const [form, setForm] = React.useState(grid);
  React.useEffect(() => { setForm(kb().tariffs()[0]); }, [v]);

  return (
    <div className="max-w-xl space-y-3">
      <Section title="GRILLE TARIFAIRE — FCFA (ligne pilote)" icon={<BadgeDollarSign className="h-4 w-4" />}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Base (prise en charge)"><input type="number" className={inputCls()} value={form.base_fcfa} onChange={e => setForm({ ...form, base_fcfa: Number(e.target.value) })} /></Field>
          <Field label="Par tronçon entre arrêts"><input type="number" className={inputCls()} value={form.per_segment_fcfa} onChange={e => setForm({ ...form, per_segment_fcfa: Number(e.target.value) })} /></Field>
          <Field label="Poids inclus (kg)"><input type="number" step="0.5" className={inputCls()} value={form.free_weight_kg} onChange={e => setForm({ ...form, free_weight_kg: Number(e.target.value) })} /></Field>
          <Field label="FCFA par kg au-delà"><input type="number" className={inputCls()} value={form.per_kg_extra_fcfa} onChange={e => setForm({ ...form, per_kg_extra_fcfa: Number(e.target.value) })} /></Field>
          <Field label="Option fragile"><input type="number" className={inputCls()} value={form.fragile_fcfa} onChange={e => setForm({ ...form, fragile_fcfa: Number(e.target.value) })} /></Field>
          <Field label="Option express"><input type="number" className={inputCls()} value={form.express_fcfa} onChange={e => setForm({ ...form, express_fcfa: Number(e.target.value) })} /></Field>
        </div>
        <p className="mt-2 text-[10.5px] leading-relaxed text-yb-slate">
          Exemple : Keur Massar → Pikine (4 tronçons, 3 kg, standard) = {fcfa(grid.base_fcfa + 4 * grid.per_segment_fcfa)}.
          La grille s&apos;applique immédiatement aux nouveaux envois.
        </p>
        <button
          onClick={() => { kb().updateTariff(form.route_id, form, 'Admin'); showToast('Grille tarifaire mise à jour (journalisée)'); }}
          className="mt-3 w-full rounded-xl bg-kb-green py-2.5 text-[12.5px] font-bold text-white"
        >
          Enregistrer la grille
        </button>
      </Section>
    </div>
  );
}

/* ================= INCIDENTS ================= */
function IncidentsTab({ v, showToast }: { v: number; showToast: (m: string) => void }) {
  const incidents = kb().incidents();
  const parcels = kb().parcels();
  return (
    <div className="space-y-3">
      {incidents.length === 0 && <Empty text="Aucun incident signalé." />}
      {incidents.map(i => {
        const parcel = parcels.find(p => p.id === i.parcel_id);
        return (
          <div key={i.id} className="rounded-2xl border border-yb-line bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-yb-red" />
                <span className="text-[12.5px] font-black text-yb-ink">{i.type}</span>
                {parcel && <span className="text-[10.5px] font-bold text-kb-green">{parcel.reference}</span>}
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                i.status === 'resolu' ? 'bg-yb-green-soft text-yb-green' : i.status === 'en_cours' ? 'bg-yb-amber-soft text-yb-amber-deep' : 'bg-yb-red-soft text-yb-red'
              }`}>{i.status}</span>
            </div>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-yb-slate">{i.description}</p>
            <div className="mt-1 text-[10px] text-yb-slate">Signalé par {i.reported_by} · {dateTimeFr(i.created_at)}</div>
            {i.status !== 'resolu' && (
              <div className="mt-2.5 flex gap-2">
                <ActBtn onClick={() => { kb().resolveIncident(i.id, 'Admin'); showToast('Incident résolu (journalisé)'); }} tone="green">
                  ✅ Résoudre l&apos;incident
                </ActBtn>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ================= AUDIT ================= */
function AuditTab({ v }: { v: number }) {
  const logs = kb().audit();
  return (
    <div className="rounded-2xl border border-yb-line bg-white p-4">
      <div className="text-[11px] font-black text-yb-slate">
        JOURNAL D&apos;AUDIT — actions sensibles (validation, affectation, paiements, codes, annulations)
      </div>
      <div className="mt-3 space-y-1.5">
        {logs.length === 0 && <Empty text="Aucune action sensible enregistrée." />}
        {logs.map(l => (
          <div key={l.id} className="flex flex-wrap items-baseline gap-x-2 border-b border-yb-line py-1.5 text-[11px] last:border-0">
            <span className="font-mono text-[9.5px] text-yb-slate">{new Date(l.created_at).toLocaleTimeString('fr-FR')}</span>
            <span className="rounded bg-yb-cream px-1.5 py-0.5 font-mono text-[9.5px] font-black text-kb-green">{l.action}</span>
            <span className="font-bold text-yb-ink">{l.entity} {l.entity_id.slice(-6)}</span>
            <span className="text-yb-slate">par {l.actor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
function ActBtn({ onClick, tone, children }: { onClick: () => void; tone: 'green' | 'red' | 'amber' | 'violet' | 'slate'; children: React.ReactNode }) {
  const map = {
    green: 'bg-yb-green-soft text-yb-green border-yb-green/30 hover:bg-yb-green hover:text-white',
    red: 'bg-yb-red-soft text-yb-red border-yb-red/30 hover:bg-yb-red hover:text-white',
    amber: 'bg-yb-amber-soft text-yb-amber-deep border-yb-amber/40 hover:bg-yb-amber hover:text-kb-green',
    violet: 'bg-[#EFE9F8] text-yb-violet border-yb-violet/30 hover:bg-yb-violet hover:text-white',
    slate: 'bg-yb-cream text-yb-slate border-yb-line hover:bg-yb-slate hover:text-white',
  } as const;
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-bold transition-colors ${map[tone]}`}>
      {children}
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-yb-line bg-white/60 p-8 text-center text-[12px] text-yb-slate">
      {text}
    </div>
  );
}
