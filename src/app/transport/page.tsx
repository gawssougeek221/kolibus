'use client';

/* ============================================================
   KoliBus Transport — console web DE TEST pour le terrain
   (l'app mobile officielle est React Native/Expo : /kolibus-transport)
   Onglets : Missions · GPS réel · Historique · Profil
   GPS : navigator.geolocation → couche données → suivi client.
   Aucune transmission hors mission (statut du trajet vérifié).
   ============================================================ */
import * as React from 'react';
import {
  Truck, Navigation, History, User, ArrowLeft, Play, Square, MapPin,
  ShieldCheck, TriangleAlert, Radio, CircleCheck, XCircle, Package,
} from 'lucide-react';
import { kb, useKbSync, useClock } from '@/lib/kb/store';
import { StatusBadge, Section, Field, inputCls, Freshness, Kpi, useToast, Toast } from '@/components/kb/ui';
import MapPanel from '@/components/kb/map-panel';
import { fcfa, dateTimeFr, phonePretty, timeAgo, distanceKm } from '@/lib/kb/domain';
import type { Parcel, VehicleLocation } from '@/lib/kb/types';

type Tab = 'missions' | 'gps' | 'history' | 'profile';
const GPS_PERIOD_S = 15; /* fréquence d'envoi configurable (batterie/budget) */

export default function TransportPage() {
  const v = useKbSync();
  const now = useClock(5000);
  const [tab, setTab] = React.useState<Tab>('missions');
  const [driver, setDriver] = React.useState<string | null>(null);
  const [toast, showToast] = useToast();

  const trips = kb().trips();

  /* ---------- Écran de connexion (choix du profil démo) ---------- */
  if (!driver) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center bg-kb-green px-6 text-white">
        <Truck className="h-8 w-8 text-kb-amber" />
        <h1 className="mt-3 text-[22px] font-black">KoliBus Transport</h1>
        <p className="mt-1 text-[12px] leading-relaxed text-white/70">
          Application transporteur — missions, statuts, GPS et retrait par code.
          <span className="mt-1 block text-[10.5px] font-bold text-kb-amber">
            Version web de test. L&apos;app mobile Expo (Android/iOS) est dans /kolibus-transport.
          </span>
        </p>
        <div className="mt-6 space-y-2">
          {trips.slice(0, 2).map(t => (
            <button
              key={t.id}
              onClick={() => { setDriver(t.driver_name); showToast(`Connecté : ${t.driver_name}`); }}
              className="w-full rounded-2xl border border-white/15 bg-white/5 p-4 text-left transition-colors hover:border-kb-amber/60"
            >
              <div className="text-[14px] font-black">{t.driver_name} <span className="text-[10px] font-bold text-white/60">· chauffeur</span></div>
              <div className="mt-0.5 text-[11px] text-white/70">
                {t.direction === 'aller' ? 'Aller' : 'Retour'} · départ {dateTimeFr(t.depart_at)} · receveur {t.receiver_name}
              </div>
            </button>
          ))}
        </div>
        <p className="mt-5 text-[10px] leading-relaxed text-white/50">
          En production : connexion sécurisée par compte (Supabase Auth) et rôle vérifié côté serveur.
          Un transporteur ne voit QUE les colis de ses trajets.
        </p>
        <a href="/" className="mx-auto mt-6 flex items-center gap-1.5 text-[11.5px] font-bold text-white/70"><ArrowLeft className="h-3.5 w-3.5" /> Accueil</a>
        <Toast msg={toast} />
      </main>
    );
  }

  const myTrip = trips.find(t => t.driver_name === driver);
  const myParcels = myTrip ? kb().parcels().filter(p => p.trip_id === myTrip.id) : [];
  const loc = myTrip && myTrip.status === 'en_cours' ? kb().latestLocation(myTrip.id) : null;
  const stops = kb().stops().filter(s => s.route_id === myTrip?.route_id);

  const act = (fn: () => void, okMsg: string) => {
    try { fn(); showToast(okMsg); } catch (e) { showToast(`!${e instanceof Error ? e.message : 'Action refusée'}`); }
  };

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-yb-cream">
      <header className="flex items-center justify-between bg-kb-green px-4 py-3 text-white">
        <div>
          <div className="text-[14.5px] font-black">KoliBus <span className="text-kb-amber">Transport</span></div>
          <div className="text-[9.5px] text-white/60">{driver} · {myTrip?.direction === 'retour' ? 'Retour' : 'Aller'} KM⇄PK</div>
        </div>
        <button onClick={() => setDriver(null)} className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[10.5px] font-bold">Quitter</button>
      </header>

      <div className="min-h-[calc(100dvh-118px)] px-4 pb-4 pt-3">
        {tab === 'missions' && <Missions v={v} myTrip={myTrip} parcels={myParcels} showToast={showToast} act={act} onGoto={setTab} />}
        {tab === 'gps' && <GpsTab myTrip={myTrip} loc={loc} stops={stops} driver={driver} showToast={showToast} now={now} />}
        {tab === 'history' && <HistoryTab parcels={myParcels} />}
        {tab === 'profile' && <ProfileTab driver={driver} myTrip={myTrip} />}
      </div>

      <nav className="sticky bottom-0 flex border-t border-yb-line bg-white/95 backdrop-blur">
        {([
          ['missions', 'Missions', <Truck key="a" className="h-4.5 w-4.5" />],
          ['gps', 'GPS', <Navigation key="b" className="h-4.5 w-4.5" />],
          ['history', 'Historique', <History key="c" className="h-4.5 w-4.5" />],
          ['profile', 'Profil', <User key="d" className="h-4.5 w-4.5" />],
        ] as [Tab, string, React.ReactNode][]).map(([id, label, icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[9px] font-bold ${tab === id ? 'text-kb-green' : 'text-yb-slate'}`}
          >
            <span className={`flex h-7 w-7 items-center justify-center rounded-xl ${tab === id ? 'bg-kb-green-soft' : ''}`}>{icon}</span>
            {label}
          </button>
        ))}
      </nav>
      <Toast msg={toast} />
    </main>
  );
}

/* ================= MISSIONS ================= */
function Missions({ v, myTrip, parcels, showToast, act, onGoto }: {
  v: number; myTrip?: { id: string; status: string; direction: string; depart_at: string; vehicle_id: string; receiver_name: string };
  parcels: Parcel[]; showToast: (m: string) => void;
  act: (fn: () => void, m: string) => void; onGoto: (t: 'missions' | 'gps' | 'history' | 'profile') => void;
}) {
  if (!myTrip) return <Empty text="Aucun trajet attribué à ce profil." />;
  const vehicle = kb().vehicles().find(x => x.id === myTrip.vehicle_id);
  const loc = myTrip.status === 'en_cours' ? kb().latestLocation(myTrip.id) : null;
  const pending = parcels.filter(p => p.status === 'affecte').length;
  const transit = parcels.filter(p => ['prise_en_charge', 'en_transit'].includes(p.status)).length;
  const ready = parcels.filter(p => p.status === 'pret_a_recuperer').length;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2.5">
        <Kpi label="À charger" value={pending} tone="amber" />
        <Kpi label="En charge/transit" value={transit} tone="blue" />
        <Kpi label="À retirer" value={ready} tone="green" />
      </div>

      {/* Trajet du jour */}
      <div className="rounded-2xl bg-kb-green p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9.5px] font-black tracking-widest text-white/60">MISSION DU JOUR</div>
            <div className="text-[15px] font-black">
              {myTrip.direction === 'aller' ? 'Keur Massar → Pikine' : 'Pikine → Keur Massar'}
            </div>
            <div className="mt-0.5 text-[10.5px] text-white/70">
              {vehicle?.plate} · départ {dateTimeFr(myTrip.depart_at)} · receveur {myTrip.receiver_name}
            </div>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
            myTrip.status === 'en_cours' ? 'bg-white/15 text-kb-amber' : myTrip.status === 'termine' ? 'bg-white/10 text-white/60' : 'bg-white/10 text-white'
          }`}>
            {myTrip.status === 'planifie' ? 'Planifié' : myTrip.status === 'en_cours' ? 'EN COURS' : 'Terminé'}
          </span>
        </div>
        {loc && <div className="mt-2.5 border-t border-white/10 pt-2"><Freshness location={loc} /></div>}
        <div className="mt-3 flex gap-2">
          {myTrip.status === 'planifie' && (
            <button onClick={() => act(() => kb().startTrip(myTrip.id, 'Transporteur'), 'Trajet démarré — GPS autorisé')} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-kb-amber py-2.5 text-[12px] font-black text-kb-green">
              <Play className="h-4 w-4" /> Démarrer le trajet
            </button>
          )}
          {myTrip.status === 'en_cours' && (
            <button onClick={() => act(() => kb().endTrip(myTrip.id, 'Transporteur'), 'Trajet terminé — GPS arrêté')} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/10 py-2.5 text-[12px] font-black text-white">
              <Square className="h-4 w-4" /> Terminer le trajet
            </button>
          )}
          <button onClick={() => onGoto('gps')} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/10 py-2.5 text-[12px] font-black text-white">
            <Radio className="h-4 w-4 text-kb-amber" /> Écran GPS
          </button>
        </div>
      </div>

      {/* Colis affectés */}
      <div className="text-[12.5px] font-black text-yb-ink">Colis affectés ({parcels.length})</div>
      {parcels.length === 0 && <Empty text="Aucun colis affecté à ce trajet pour le moment." />}
      {parcels.map(p => <MissionParcel key={`${p.id}-${v}`} p={p} showToast={showToast} act={act} />)}
    </div>
  );
}

function MissionParcel({ p, showToast, act }: {
  p: Parcel; showToast: (m: string) => void; act: (fn: () => void, m: string) => void;
}) {
  const [code, setCode] = React.useState('');
  const [verifyResult, setVerifyResult] = React.useState<{ ok: boolean; msg: string } | null>(null);
  const stops = kb().stops();
  const pickup = stops.find(s => s.id === p.pickup_stop_id);
  const dropoff = stops.find(s => s.id === p.dropoff_stop_id);
  const [busy, setBusy] = React.useState(false);

  const verify = async () => {
    if (!/^\d{4}$/.test(code)) { showToast('!Saisissez les 4 chiffres du code'); return; }
    setBusy(true);
    try {
      const res = await kb().verifyPickupCode(p.id, code, 'Transporteur');
      setVerifyResult({ ok: res.ok, msg: res.ok ? 'Remise confirmée — colis livré' : res.error ?? 'Code erroné' });
      if (res.ok) setCode('');
    } finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl border border-yb-line bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-black text-kb-green">{p.reference}</span>
        <StatusBadge status={p.status} size="sm" />
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-[10.5px] text-yb-slate">
        <span className="rounded bg-yb-cream px-1.5 py-0.5 font-bold">{dropoff?.name}</span>
        <span className="h-0.5 flex-1 border-t border-dashed border-yb-line" />
        <span className="rounded bg-yb-cream px-1.5 py-0.5 font-bold">{pickup?.name}</span>
      </div>
      <div className="mt-1.5 text-[11px] text-yb-ink">
        <b>{p.recipient_name}</b> · {phonePretty(p.recipient_phone)} · {p.category} · {p.weight_kg} kg{p.fragile ? ' · fragile' : ''}{p.express ? ' · express' : ''} · {fcfa(p.price_fcfa)}
      </div>
      <div className="mt-1 text-[10px] text-yb-slate">Dépôt : {p.sender_name} · {p.description}</div>

      <div className="mt-2.5 flex flex-wrap gap-2">
        {p.status === 'affecte' && (
          <ActBtn onClick={() => act(() => kb().setStatus(p.id, 'prise_en_charge', 'Transporteur', 'receveur', 'Chargé dans le tata'), 'Prise en charge confirmée')} tone="violet">
            📥 Confirmer la prise en charge
          </ActBtn>
        )}
        {p.status === 'prise_en_charge' && (
          <ActBtn onClick={() => act(() => kb().setStatus(p.id, 'en_transit', 'Transporteur', 'chauffeur', 'Départ du tata'), 'En transit — les clients suivent le véhicule')} tone="blue">
            🚀 Démarrer le transit
          </ActBtn>
        )}
        {p.status === 'en_transit' && (
          <ActBtn onClick={() => act(() => kb().setStatus(p.id, 'arrive', 'Transporteur', 'chauffeur', 'Véhicule arrivé au point'), 'Arrivée confirmée')} tone="blue">
            📍 Confirmer l&apos;arrivée
          </ActBtn>
        )}
        {p.status === 'arrive' && (
          <ActBtn onClick={() => act(() => kb().setStatus(p.id, 'pret_a_recuperer', 'Transporteur', 'receveur', 'Disponible au point de retrait'), 'Colis prêt à récupérer — client notifié')} tone="amber">
            ✅ Marquer prêt à récupérer
          </ActBtn>
        )}
      </div>

      {/* Vérification du code de retrait */}
      {p.status === 'pret_a_recuperer' && (
        <div className="mt-2.5 rounded-xl border border-yb-amber/50 bg-yb-amber-soft p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-yb-amber-deep">
            <ShieldCheck className="h-3.5 w-3.5" /> VÉRIFICATION DU CODE DE RETRAIT (côté serveur)
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              inputMode="numeric"
              placeholder="····"
              className={`${inputCls()} w-24 text-center text-[20px] tracking-[0.25em]`}
            />
            <button onClick={verify} disabled={busy} className="flex-1 rounded-xl bg-kb-green py-2 text-[12px] font-black text-white disabled:opacity-60">
              {busy ? 'Vérification…' : 'Valider la remise'}
            </button>
          </div>
          {verifyResult && (
            <div className={`mt-2 flex items-center gap-1.5 text-[11px] font-bold ${verifyResult.ok ? 'text-yb-green' : 'text-yb-red'}`}>
              {verifyResult.ok ? <CircleCheck className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              {verifyResult.msg}
            </div>
          )}
          <p className="mt-1.5 text-[9px] leading-relaxed text-yb-amber-deep/80">
            5 tentatives max — au-delà, la vérification est bloquée et l&apos;incident est journalisé.
            Un code déjà consommé ne peut pas valider une seconde remise.
          </p>
        </div>
      )}

      {p.status !== 'livre' && p.status !== 'annule' && (
        <IncidentButton parcelId={p.id} showToast={showToast} />
      )}
    </div>
  );
}

function IncidentButton({ parcelId, showToast }: { parcelId: string; showToast: (m: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState('');
  const [type, setType] = React.useState<'retard' | 'colis_endommage' | 'colis_perdu' | 'adresse_introuvable' | 'autre'>('retard');
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-yb-red/30 bg-yb-red-soft py-2 text-[11px] font-bold text-yb-red">
        <TriangleAlert className="h-3.5 w-3.5" /> Déclarer un incident
      </button>
    );
  }
  return (
    <div className="mt-2 rounded-xl border border-yb-red/30 bg-white p-3">
      <Field label="Type d'incident">
        <select className={`${inputCls()} text-[12px]`} value={type} onChange={e => setType(e.target.value as typeof type)}>
          <option value="retard">Retard</option>
          <option value="colis_endommage">Colis endommagé</option>
          <option value="colis_perdu">Colis perdu</option>
          <option value="adresse_introuvable">Adresse introuvable</option>
          <option value="autre">Autre</option>
        </select>
      </Field>
      <div className="mt-2">
        <Field label="Description">
          <textarea className={`${inputCls()} min-h-16 resize-none text-[12px]`} value={text} onChange={e => setText(e.target.value)} placeholder="Décrivez le problème" />
        </Field>
      </div>
      <div className="mt-2 flex gap-2">
        <button onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-yb-line py-2 text-[11.5px] font-bold text-yb-slate">Annuler</button>
        <button
          disabled={text.trim().length < 5}
          onClick={() => {
            kb().reportIncident({ parcel_id: parcelId, reported_by: 'Transporteur', type, description: text.trim() });
            setOpen(false); setText('');
            showToast('Incident déclaré — admin notifié');
          }}
          className="flex-1 rounded-xl bg-yb-red py-2 text-[11.5px] font-bold text-white disabled:opacity-50"
        >
          Déclarer
        </button>
      </div>
    </div>
  );
}

/* ================= GPS RÉEL ================= */
function GpsTab({ myTrip, loc, stops, driver, showToast, now }: {
  myTrip?: { id: string; status: string; direction: string; vehicle_id: string };
  loc: VehicleLocation | null;
  stops: { id: string; name: string; lat: number; lng: number; position_order: number }[];
  driver: string; showToast: (m: string) => void; now: number;
}) {
  const [watching, setWatching] = React.useState(false);
  const [watchId, setWatchId] = React.useState<number | null>(null);
  const [lastSend, setLastSend] = React.useState<{ at: string; ok: boolean; err?: string } | null>(null);
  const [sent, setSent] = React.useState(0);
  const [failed, setFailed] = React.useState(0);
  const lastRef = React.useRef<{ lat: number; lng: number } | null>(null);

  /* Arrêt propre à la fermeture */
  React.useEffect(() => () => { if (watchId !== null) navigator.geolocation.clearWatch(watchId); }, [watchId]);

  const start = () => {
    if (!myTrip || myTrip.status !== 'en_cours') { showToast('!Démarrez le trajet avant le suivi GPS'); return; }
    if (!('geolocation' in navigator)) { showToast('!Géolocalisation indisponible sur cet appareil'); return; }
    const id = navigator.geolocation.watchPosition(
      pos => {
        const { latitude, longitude, accuracy, speed } = pos.coords;
        const prev = lastRef.current;
        /* Anti-spam : envoi si déplacement > 25 m ou 1re position */
        const moved = !prev || distanceKm(prev, { lat: latitude, lng: longitude }) * 1000 > 25;
        if (moved) {
          lastRef.current = { lat: latitude, lng: longitude };
          const res = kb().pushLocation({
            trip_id: myTrip.id, vehicle_id: myTrip.vehicle_id,
            lat: latitude, lng: longitude,
            accuracy_m: accuracy ?? undefined,
            speed_kmh: speed != null ? Math.max(0, speed * 3.6) : undefined,
            captured_at: new Date(pos.timestamp).toISOString(),
            source: 'gps_reel',
          });
          if (res.ok) { setSent(n => n + 1); setLastSend({ at: new Date().toISOString(), ok: true }); }
          else { setFailed(n => n + 1); setLastSend({ at: new Date().toISOString(), ok: false, err: res.error }); }
        }
      },
      err => {
        setFailed(n => n + 1);
        setLastSend({ at: new Date().toISOString(), ok: false, err: err.message });
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
    setWatchId(id);
    setWatching(true);
    showToast('Suivi GPS démarré — position transmise dès que le véhicule bouge');
  };

  const stop = () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    setWatchId(null);
    setWatching(false);
    showToast('Suivi GPS arrêté');
  };

  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const age = loc ? Math.round((now - new Date(loc.received_at).getTime()) / 1000) : null;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-yb-line bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px] font-black text-yb-ink">
            <Radio className={`h-4 w-4 ${watching ? 'text-yb-green' : 'text-yb-slate/50'}`} /> ÉTAT DU SUIVI GPS
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
            watching ? 'bg-yb-green-soft text-yb-green' : 'bg-yb-cream text-yb-slate'
          }`}>
            {watching ? 'ACTIF' : 'ARRÊTÉ'}
          </span>
        </div>
        <ul className="mt-2 space-y-1 text-[11px] text-yb-slate">
          <li>· Fréquence d&apos;envoi : au déplacement (&gt; 25 m), période max {GPS_PERIOD_S}s</li>
          <li>· Aucune transmission si le trajet n&apos;est pas « en cours »</li>
          <li>· Position refusée côté serveur hors mission (contrôle double)</li>
          <li>· Le téléphone demande la permission localisation au démarrage</li>
        </ul>
        {!online && (
          <div className="mt-2 rounded-lg bg-yb-red-soft px-2.5 py-1.5 text-[10.5px] font-bold text-yb-red">
            Hors ligne — les positions reprendront au retour du réseau.
          </div>
        )}
        <div className="mt-3 flex gap-2">
          {!watching ? (
            <button onClick={start} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-kb-green py-2.5 text-[12px] font-black text-white">
              <Play className="h-4 w-4 text-kb-amber" /> Démarrer le suivi GPS
            </button>
          ) : (
            <button onClick={stop} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-yb-red py-2.5 text-[12px] font-black text-white">
              <Square className="h-4 w-4" /> Arrêter le suivi
            </button>
          )}
        </div>
      </div>

      {/* Dernière transmission */}
      <div className="rounded-2xl border border-yb-line bg-white p-4">
        <div className="text-[11px] font-black text-yb-slate">DERNIÈRE TRANSMISSION</div>
        {loc ? (
          <>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-mono text-[13px] font-bold text-yb-ink">{loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</span>
            </div>
            <div className="mt-1"><Freshness location={loc} /></div>
            <div className="mt-1 text-[10.5px] text-yb-slate">
              Précision ±{Math.round(loc.accuracy_m ?? 0)} m · {loc.speed_kmh ? `${Math.round(loc.speed_kmh)} km/h · ` : ''}
              transmise {age !== null && age < 60 ? `il y a ${age}s` : timeAgo(loc.received_at, now)}
            </div>
          </>
        ) : (
          <p className="mt-1 text-[11.5px] text-yb-slate">Aucune position transmise pour ce trajet.</p>
        )}
        {lastSend && (
          <div className={`mt-2 rounded-lg px-2.5 py-1.5 text-[10.5px] font-bold ${lastSend.ok ? 'bg-yb-green-soft text-yb-green' : 'bg-yb-red-soft text-yb-red'}`}>
            {lastSend.ok ? 'Dernier envoi accepté par le backend' : `Échec : ${lastSend.err}`} · {timeAgo(lastSend.at, now)}
          </div>
        )}
        <div className="mt-2 text-[10px] text-yb-slate">
          Envoyées : {sent} · Échecs : {failed} · Source : {loc?.source === 'simulation' ? 'SIMULATION (test)' : 'GPS réel du téléphone'}
        </div>
      </div>

      {/* Carte */}
      <MapPanel stops={stops} position={loc} trail={myTrip ? kb().locationsFor(myTrip.id) : []} height={300} simulating={loc?.source === 'simulation'} />
      <p className="px-1 text-[9.5px] leading-relaxed text-yb-slate">
        Ce service de test diffuse la position GPS réelle de CE navigateur vers la couche données KoliBus.
        Le suivi client (/suivi) affiche la même position. Pour plusieurs appareils, connectez Supabase —
        l&apos;app Expo réalisera la même transmission via expo-location.
      </p>
    </div>
  );
}

/* ================= HISTORIQUE ================= */
function HistoryTab({ parcels }: { parcels: Parcel[] }) {
  const done = parcels.filter(p => ['livre', 'annule'].includes(p.status));
  return (
    <div className="space-y-2.5">
      <div className="text-[12.5px] font-black text-yb-ink">Opérations passées ({done.length})</div>
      {done.length === 0 && <Empty text="Aucune opération terminée." />}
      {done.map(p => (
        <div key={p.id} className="flex items-center justify-between rounded-2xl border border-yb-line bg-white p-3.5">
          <div>
            <div className="text-[12px] font-black text-kb-green">{p.reference}</div>
            <div className="text-[10.5px] text-yb-slate">{p.recipient_name} · {fcfa(p.price_fcfa)}</div>
          </div>
          <StatusBadge status={p.status} size="sm" />
        </div>
      ))}
    </div>
  );
}

/* ================= PROFIL ================= */
function ProfileTab({ driver, myTrip }: { driver: string; myTrip?: { direction: string; depart_at: string; vehicle_id: string; driver_phone: string; receiver_name: string } }) {
  const vehicle = kb().vehicles().find(x => x.id === myTrip?.vehicle_id);
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-kb-green p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[16px] font-black">
            {driver.split(' ').map(w => w[0]).slice(0, 2).join('')}
          </span>
          <div>
            <div className="text-[15px] font-black">{driver}</div>
            <div className="text-[10.5px] text-white/70">Chauffeur · pilote Keur Massar ⇄ Pikine</div>
          </div>
        </div>
      </div>
      <Section title="VÉHICULE & MISSION" icon={<Package className="h-4 w-4" />}>
        <dl className="space-y-2 text-[12px]">
          <Info label="Véhicule" value={vehicle ? `${vehicle.plate} · ${vehicle.type} · ${vehicle.capacity} places` : '—'} />
          <Info label="Modèle" value={vehicle?.model ?? '—'} />
          <Info label="Partenaire" value={vehicle ? kb().partners().find(p => p.id === vehicle.partner_id)?.name ?? '—' : '—'} />
          <Info label="Receveur" value={myTrip?.receiver_name ?? '—'} />
          <Info label="Prochaine mission" value={myTrip ? `${myTrip.direction === 'aller' ? 'Aller' : 'Retour'} · ${dateTimeFr(myTrip.depart_at)}` : '—'} />
        </dl>
        <p className="mt-2 text-[10px] leading-relaxed text-yb-slate">
          En production, ce profil est alimenté par le compte transporteur (rôle chauffeur/receveur/flotte)
          et les véhicules rattachés au partenaire — visibles uniquement via RLS.
        </p>
      </Section>
    </div>
  );
}

/* ---------- helpers ---------- */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-yb-line pb-2 last:border-0">
      <dt className="shrink-0 text-yb-slate">{label}</dt>
      <dd className="text-right font-bold text-yb-ink">{value}</dd>
    </div>
  );
}
function ActBtn({ onClick, tone, children }: { onClick: () => void; tone: 'green' | 'blue' | 'amber' | 'violet'; children: React.ReactNode }) {
  const map = {
    green: 'bg-yb-green-soft text-yb-green',
    blue: 'bg-yb-blue-soft text-yb-blue',
    amber: 'bg-yb-amber-soft text-yb-amber-deep',
    violet: 'bg-[#EFE9F8] text-yb-violet',
  } as const;
  return (
    <button onClick={onClick} className={`rounded-xl px-3 py-2 text-[11px] font-bold transition-transform active:scale-95 ${map[tone]}`}>
      {children}
    </button>
  );
}
function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-yb-line bg-white/60 p-8 text-center text-[12px] text-yb-slate">{text}</div>;
}
