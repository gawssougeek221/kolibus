'use client';

/* KoliBus Client — Détail d'un colis : timeline, code, lien de suivi, signalement */
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Copy, Route, ShieldCheck, TriangleAlert, Phone, ReceiptText,
} from 'lucide-react';
import { kb, useKbSync } from '@/lib/kb/store';
import { StatusBadge, Timeline, Section, Freshness, inputCls, useToast, Toast } from '@/components/kb/ui';
import { fcfa, timeAgo, dateTimeFr } from '@/lib/kb/domain';
import type { Parcel } from '@/lib/kb/types';

export default function ParcelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const v = useKbSync();
  const [toast, showToast] = useToast();
  const [showCode, setShowCode] = React.useState(false);
  const [reporting, setReporting] = React.useState(false);
  const [reportText, setReportText] = React.useState('');

  const parcel = React.useMemo(() => kb().parcelById(id), [v, id]);
  if (!parcel) {
    return (
      <div className="p-6 text-center">
        <p className="text-[13px] text-yb-slate">Colis introuvable.</p>
        <button onClick={() => router.push('/app/colis')} className="mt-3 rounded-xl bg-kb-green px-4 py-2 text-[12px] font-bold text-white">Retour</button>
      </div>
    );
  }

  const stops = kb().stops();
  const dropoff = stops.find(s => s.id === parcel.dropoff_stop_id);
  const pickup = stops.find(s => s.id === parcel.pickup_stop_id);
  const events = kb().eventsFor(parcel.id);
  const trip = kb().trips().find(t => t.id === parcel.trip_id);
  const loc = trip ? kb().latestLocation(trip.id) : null;
  const payments = kb().payments().filter(p => p.parcel_id === parcel.id);
  const demoCode = (kb() as unknown as { db?: () => { pickupCodes: Record<string, string> } }).db?.()?.pickupCodes?.[parcel.id];

  return (
    <div className="px-4 pb-8 pt-2">
      <button onClick={() => router.push('/app/colis')} className="flex items-center gap-1.5 text-[12px] font-bold text-yb-slate">
        <ArrowLeft className="h-4 w-4" /> Mes colis
      </button>

      {/* En-tête */}
      <div className="mt-3 rounded-2xl bg-kb-green p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9.5px] font-black tracking-widest text-white/60">RÉFÉRENCE</div>
            <div className="text-[20px] font-black">{parcel.reference}</div>
          </div>
          <StatusBadge status={parcel.status} />
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-white/80">
          <span className="rounded-lg bg-white/10 px-2 py-1">{dropoff?.name}</span>
          <span className="h-0.5 flex-1 border-t border-dashed border-white/40" />
          <span className="rounded-lg bg-white/10 px-2 py-1">{pickup?.name}</span>
        </div>
        {loc && (
          <div className="mt-2.5 border-t border-white/10 pt-2">
            <Freshness location={loc} />
          </div>
        )}
      </div>

      {/* Lien de suivi destinataire */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => { void navigator.clipboard?.writeText(`${window.location.origin}/suivi/${parcel.reference}`); showToast('Lien de suivi copié — partagez-le au destinataire'); }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-yb-line bg-white py-2.5 text-[11.5px] font-bold text-yb-ink"
        >
          <Copy className="h-3.5 w-3.5" /> Copier le lien de suivi
        </button>
        <Link href={`/suivi/${parcel.reference}`} className="flex items-center justify-center gap-1.5 rounded-xl bg-kb-green px-3 py-2.5 text-[11.5px] font-bold text-white">
          <Route className="h-3.5 w-3.5 text-kb-amber" /> Suivi
        </Link>
      </div>

      {/* Code de retrait */}
      <Section>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-black tracking-wide text-kb-green">
            <ShieldCheck className="h-4 w-4" /> CODE DE RETRAIT DESTINATAIRE
          </div>
          {!showCode && parcel.status !== 'livre' && (
            <button onClick={() => setShowCode(true)} className="text-[11px] font-bold text-kb-green underline">Afficher</button>
          )}
        </div>
        {parcel.status === 'livre' ? (
          <p className="mt-2 text-[11.5px] text-yb-slate">Colis livré — code consommé.</p>
        ) : showCode ? (
          <>
            <div className="mt-2 text-center text-[30px] font-black tracking-[0.3em] text-kb-green">{demoCode ?? '····'}</div>
            <p className="mt-1 text-center text-[9.5px] leading-relaxed text-yb-slate">
              À transmettre au destinataire. Vérifié contre le hachage serveur au retrait (5 tentatives max).
              {IS_DEMO_NOTE && ' Affichage démo : en production, le code n\u2019est montré qu\u2019une fois à la création.'}
            </p>
          </>
        ) : (
          <p className="mt-2 text-[11.5px] text-yb-slate">Code masqué — affichez-le uniquement au destinataire.</p>
        )}
      </Section>

      {/* Détails */}
      <Section title="DÉTAILS DE L'ENVOI">
        <dl className="space-y-2 text-[12px]">
          <Info label="Contenu" value={`${parcel.category} — ${parcel.description}`} />
          <Info label="Poids / Quantité" value={`${parcel.weight_kg} kg · ×${parcel.quantity}${parcel.fragile ? ' · Fragile' : ''}${parcel.express ? ' · Express' : ''}`} />
          <Info label="Expéditeur" value={`${parcel.sender_name} · ${parcel.sender_phone}`} icon />
          <Info label="Destinataire" value={`${parcel.recipient_name} · ${parcel.recipient_phone}`} icon />
          <Info label="Prix" value={fcfa(parcel.price_fcfa)} />
          <Info label="Paiement" value={`${parcel.payment_method === 'especes' ? 'Espèces' : parcel.payment_method === 'mobile_money' ? 'Mobile Money' : 'À définir'} — ${parcel.payment_status === 'paye' ? 'payé' : 'en attente'}`} />
          <Info label="Créé" value={`${dateTimeFr(parcel.created_at)} (${timeAgo(parcel.created_at)})`} />
          {trip && <Info label="Trajet affecté" value={`${trip.direction === 'aller' ? 'Keur Massar → Pikine' : 'Pikine → Keur Massar'} · ${trip.driver_name} / ${trip.receiver_name}`} />}
        </dl>
        {payments.map(p => (
          <div key={p.id} className="mt-2 flex items-center gap-1.5 rounded-xl bg-yb-green-soft px-3 py-2 text-[11px] font-bold text-yb-green">
            <ReceiptText className="h-3.5 w-3.5" /> Paiement enregistré : {fcfa(p.amount_fcfa)} · {p.method}{p.reference ? ` · réf. ${p.reference}` : ''} · par {p.recorded_by}
          </div>
        ))}
      </Section>

      {/* Timeline */}
      <div className="mt-3">
        <Section title="HISTORIQUE DU COLIS">
          <Timeline events={events} current={parcel.status} />
        </Section>
      </div>

      {/* Signaler un problème */}
      {!reporting ? (
        <button
          onClick={() => setReporting(true)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-yb-red/40 bg-yb-red-soft py-3 text-[12px] font-bold text-yb-red"
        >
          <TriangleAlert className="h-4 w-4" /> Signaler un problème sur ce colis
        </button>
      ) : (
        <div className="mt-3 rounded-2xl border border-yb-red/40 bg-white p-4">
          <div className="text-[11px] font-black text-yb-red">SIGNALER UN PROBLÈME</div>
          <textarea
            className={`${inputCls()} mt-2 min-h-20 resize-none`}
            placeholder="Décrivez le problème (colis endommagé, retard…)"
            value={reportText}
            onChange={e => setReportText(e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <button onClick={() => setReporting(false)} className="flex-1 rounded-xl border border-yb-line py-2.5 text-[12px] font-bold text-yb-slate">Annuler</button>
            <button
              disabled={reportText.trim().length < 5}
              onClick={() => {
                kb().reportIncident({
                  parcel_id: parcel.id, reported_by: kb().session()?.name ?? 'Expéditeur',
                  type: 'autre', description: reportText.trim(),
                });
                setReporting(false);
                showToast('Incident signalé — notre équipe intervient');
              }}
              className="flex-1 rounded-xl bg-yb-red py-2.5 text-[12px] font-bold text-white disabled:opacity-50"
            >
              Envoyer le signalement
            </button>
          </div>
        </div>
      )}
      <Toast msg={toast} />
    </div>
  );
}

const IS_DEMO_NOTE = process.env.NEXT_PUBLIC_SUPABASE_URL ? false : true;

function Info({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-yb-line pb-2 last:border-0 last:pb-0">
      <dt className="shrink-0 text-yb-slate">{label}</dt>
      <dd className="text-right font-bold text-yb-ink">
        {icon && <Phone className="mr-1 inline h-3 w-3 text-yb-slate" />}
        {value}
      </dd>
    </div>
  );
}
