'use client';

/* ============================================================
   KoliBus — Suivi public /suivi/[ref]
   Accessible SANS compte au destinataire.
   Confidentialité : statut + arrêt de retrait + position véhicule.
   JAMAIS le nom complet du destinataire, jamais les autres colis,
   jamais les informations personnelles de l'expéditeur.
   ============================================================ */
import * as React from 'react';
import { useParams } from 'next/navigation';
import { Search, PackageSearch, MapPin, ShieldCheck, FlaskConical, Play, Square } from 'lucide-react';
import { kb, useKbSync, useClock } from '@/lib/kb/store';
import { StatusBadge, Freshness } from '@/components/kb/ui';
import MapPanel from '@/components/kb/map-panel';
import { PUBLIC_STATUSES, STATUS_LABEL, freshnessOf, timeAgo } from '@/lib/kb/domain';
import type { ParcelStatus } from '@/lib/kb/types';

export default function SuiviPage() {
  const params = useParams<{ ref: string }>();
  const v = useKbSync();
  const now = useClock(5000);
  const [input, setInput] = React.useState('');
  const [requested, setRequested] = React.useState<string | null>(
    typeof params?.ref === 'string' ? decodeURIComponent(params.ref).toUpperCase() : null,
  );
  const ref = requested;
  const [simOn, setSimOn] = React.useState(false);

  const parcel = React.useMemo(() => (ref ? kb().parcelByRef(ref) : null), [ref, v]);
  const events = React.useMemo(() => (parcel ? kb().eventsFor(parcel.id) : []), [parcel, v]);
  const trip = React.useMemo(() => (parcel?.trip_id ? kb().trips().find(t => t.id === parcel.trip_id) ?? null : null), [parcel, v]);
  const location = React.useMemo(() => (trip ? kb().latestLocation(trip.id) : null), [trip, v]);
  const stops = kb().stops();
  const pickupStop = stops.find(s => s.id === parcel?.pickup_stop_id);
  const routeStops = React.useMemo(
    () => stops.filter(s => s.route_id === trip?.route_id).sort((a, b) => a.position_order - b.position_order),
    [stops, trip, v],
  );

  /* ---------- Simulation GPS (DÉMO uniquement, étiquetée) ---------- */
  React.useEffect(() => {
    if (!simOn || !trip) return;
    const stopsSim = routeStops.length ? routeStops : stops;
    let t = 0;
    const iv = setInterval(() => {
      t += 1;
      const frac = (t % 60) / 60; /* cycle 3 min */
      const seg = Math.min(stopsSim.length - 2, Math.floor(frac * (stopsSim.length - 1)));
      const local = frac * (stopsSim.length - 1) - seg;
      const a = stopsSim[seg], b = stopsSim[seg + 1];
      if (!a || !b) return;
      kb().pushLocation({
        trip_id: trip.id, vehicle_id: trip.vehicle_id,
        lat: a.lat + (b.lat - a.lat) * local,
        lng: a.lng + (b.lng - a.lng) * local,
        accuracy_m: 12, speed_kmh: 24 + Math.round(Math.sin(t / 4) * 8),
        captured_at: new Date().toISOString(),
        source: 'simulation',
      });
    }, 3000);
    return () => clearInterval(iv);
  }, [simOn, trip, routeStops, stops]);

  const search = () => {
    if (input.trim().length >= 4) setRequested(input.trim().toUpperCase());
  };

  const lastEvent = events[events.length - 1];
  const fresh = freshnessOf(location?.received_at, now);
  const hiddenStatus = parcel && !PUBLIC_STATUSES.includes(parcel.status);

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-yb-cream px-4 pb-10 pt-5">
      {/* En-tête */}
      <div className="flex items-center justify-between rounded-2xl bg-kb-green px-4 py-3.5 text-white shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/kolibus-banner.jpeg" alt="KoliBus" className="h-10 rounded-lg" />
        <span className="text-[9px] font-bold tracking-widest text-white/60">SUIVI PUBLIC · SANS COMPTE</span>
      </div>

      {/* Recherche d'une autre référence */}
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="Référence colis (ex. KB-2601-A4B2CD)"
          className="flex-1 rounded-xl border border-yb-line bg-white px-3.5 py-2.5 text-[12.5px] font-semibold text-yb-ink outline-none focus:border-kb-green"
        />
        <button onClick={search} className="flex h-11 w-11 items-center justify-center rounded-xl bg-kb-green text-white">
          <Search className="h-4.5 w-4.5" />
        </button>
      </div>

      {!ref && (
        <div className="mt-6 rounded-2xl border border-dashed border-yb-line bg-white/60 p-8 text-center">
          <PackageSearch className="mx-auto h-8 w-8 text-yb-slate/50" />
          <p className="mt-2 text-[12.5px] text-yb-slate">
            Saisissez la référence reçue par l&apos;expéditeur pour suivre le colis.
          </p>
        </div>
      )}

      {ref && !parcel && (
        <div className="mt-6 rounded-2xl border border-yb-red/30 bg-yb-red-soft p-6 text-center">
          <PackageSearch className="mx-auto h-7 w-7 text-yb-red" />
          <p className="mt-2 text-[12.5px] font-bold text-yb-red">Aucun colis public pour « {ref} »</p>
          <p className="mt-1 text-[11px] text-yb-slate">Vérifiez la référence auprès de l&apos;expéditeur.</p>
        </div>
      )}

      {parcel && hiddenStatus && (
        <div className="mt-6 rounded-2xl border border-yb-amber/40 bg-yb-amber-soft p-6 text-center">
          <ShieldCheck className="mx-auto h-7 w-7 text-yb-amber-deep" />
          <p className="mt-2 text-[12.5px] font-bold text-yb-amber-deep">
            Ce colis n&apos;est pas encore visible en suivi public.
          </p>
          <p className="mt-1 text-[11px] text-yb-slate">Il apparaîtra dès sa validation par KoliBus.</p>
        </div>
      )}

      {parcel && !hiddenStatus && (
        <div className="mt-4 space-y-3.5 animate-yb-rise">
          {/* Carte principale */}
          <div className="rounded-2xl bg-kb-green p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[9.5px] font-black tracking-widest text-white/60">COLIS</div>
                <div className="text-[18px] font-black">{parcel.reference}</div>
              </div>
              <StatusBadge status={parcel.status} />
            </div>
            <div className="mt-2 text-[11px] text-white/70">
              Destinataire : {initials(parcel.recipient_name)} · retiré à <b>{pickupStop?.name}</b>
            </div>
          </div>

          {/* Carte + position */}
          <div>
            <MapPanel
              stops={routeStops}
              position={location}
              trail={trip ? kb().locationsFor(trip.id) : []}
              height={280}
              simulating={location?.source === 'simulation'}
            />
            <div className="mt-2 flex items-center justify-between">
              <Freshness location={location} />
              {fresh === 'stale' || fresh === 'none' ? (
                <span className="text-[9.5px] font-bold text-yb-slate">Position indisponible pour le moment</span>
              ) : null}
            </div>
          </div>

          {/* Contrôle simulation — visible UNIQUEMENT en mode démo */}
          {!process.env.NEXT_PUBLIC_SUPABASE_URL && trip && (
            <div className="rounded-2xl border border-dashed border-yb-amber/60 bg-yb-amber-soft p-3.5">
              <div className="flex items-center gap-2 text-[10.5px] font-black text-yb-amber-deep">
                <FlaskConical className="h-4 w-4" /> SIMULATION GPS — DONNÉES DE TEST UNIQUEMENT
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-yb-amber-deep/90">
                En démo, activez ce simulateur pour voir un véhicule se déplacer le long de la ligne.
                En production, la position vient de l&apos;app Transport (GPS réel du téléphone).
                Le marqueur indique toujours « simulation » si la position n&apos;est pas réelle.
              </p>
              <button
                onClick={() => setSimOn(s => !s)}
                className="mt-2 flex items-center gap-1.5 rounded-lg bg-yb-amber px-3 py-1.5 text-[10.5px] font-black text-kb-green"
              >
                {simOn ? <><Square className="h-3 w-3" /> Arrêter la simulation</> : <><Play className="h-3 w-3" /> Activer la simulation</>}
              </button>
            </div>
          )}

          {/* Dernier point de statut */}
          <div className="rounded-2xl border border-yb-line bg-white p-4">
            <div className="text-[11px] font-black text-yb-slate">DERNIÈRE MISE À JOUR</div>
            <div className="mt-1.5 text-[13px] font-bold text-yb-ink">
              {lastEvent ? STATUS_LABEL[lastEvent.status as ParcelStatus] : STATUS_LABEL[parcel.status]}
            </div>
            {lastEvent && (
              <div className="mt-0.5 text-[11px] text-yb-slate">{timeAgo(lastEvent.created_at, now)}</div>
            )}
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-yb-cream px-3 py-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-kb-green" />
              <div className="text-[11.5px] leading-snug">
                <b>Point de retrait :</b> {pickupStop?.name} ({pickupStop?.area})<br />
                <span className="text-yb-slate">Présentez votre code de retrait au receveur.</span>
              </div>
            </div>
          </div>

          {/* Mini timeline publique */}
          <div className="rounded-2xl border border-yb-line bg-white p-4">
            <div className="text-[11px] font-black text-yb-slate">PARCOURS</div>
            <ol className="mt-2 space-y-1.5">
              {events.filter(e => PUBLIC_STATUSES.includes(e.status as ParcelStatus)).map(e => (
                <li key={e.id} className="flex items-center justify-between border-b border-yb-line py-1.5 text-[11.5px] last:border-0">
                  <span className="font-bold text-yb-ink">{STATUS_LABEL[e.status as ParcelStatus]}</span>
                  <span className="text-yb-slate">{timeAgo(e.created_at, now)}</span>
                </li>
              ))}
            </ol>
          </div>

          <p className="px-2 text-center text-[9.5px] leading-relaxed text-yb-slate/80">
            Ce lien ne divulgue que le statut du colis et le point de retrait. Aucune donnée
            personnelle de l&apos;expéditeur, aucun autre colis n&apos;est accessible.
          </p>
        </div>
      )}
    </main>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0]?.toUpperCase() ?? '?';
  const last = parts[1]?.[0]?.toUpperCase() ?? '';
  return `${first}. ${last}.`;
}
