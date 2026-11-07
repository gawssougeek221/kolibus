'use client';

/* KoliBus Client — Accueil : actions principales + colis en cours */
import * as React from 'react';
import Link from 'next/link';
import { Plus, Package, MapPin, Clock, ChevronRight, Radio } from 'lucide-react';
import { kb, useKbSync } from '@/lib/kb/store';
import { ParcelCard, StatusBadge } from '@/components/kb/ui';
import { STATUS_LABEL } from '@/lib/kb/domain';
import type { Parcel } from '@/lib/kb/types';

export default function AccueilPage() {
  const v = useKbSync();
  const session = React.useMemo(() => kb().session(), [v]);
  const parcels = React.useMemo(() => {
    const s = kb().session();
    return kb().parcels()
      .filter(p => p.sender_phone === s?.phone || p.sender_name === s?.name)
      .slice(0, 3);
  }, [v, session]);

  const active = parcels.filter(p => !['livre', 'annule'].includes(p.status));
  const stops = kb().stops();

  return (
    <div className="px-4 pb-6 pt-2">
      <h1 className="text-[22px] font-black leading-tight text-yb-ink">
        Bonjour {session?.name?.split(' ')[0] ?? 'vous'} 👋
      </h1>
      <p className="mt-1 text-[12.5px] text-yb-slate">
        Votre colis voyage avec le Tata. Ligne pilote : <b className="text-kb-green">Keur Massar ⇄ Pikine</b>.
      </p>

      {/* CTA principal */}
      <Link
        href="/app/envoyer"
        className="mt-4 flex items-center gap-3 rounded-2xl bg-kb-green p-4 text-white shadow-lg transition-transform active:scale-[0.98]"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
          <Plus className="h-5 w-5 text-kb-amber" />
        </span>
        <span className="flex-1">
          <span className="block text-[14.5px] font-black">Réserver un envoi</span>
          <span className="block text-[11px] text-white/70">Dépôt Keur Massar → retrait Pikine, à partir de 1 200 F</span>
        </span>
        <ChevronRight className="h-5 w-5 text-kb-amber" />
      </Link>

      {/* Colis en cours */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-[13px] font-black text-yb-ink">Colis en cours</h2>
        <Link href="/app/colis" className="text-[11px] font-bold text-kb-green">Tout voir</Link>
      </div>
      <div className="mt-2.5 space-y-2.5">
        {active.length === 0 && (
          <div className="rounded-2xl border border-dashed border-yb-line bg-white/60 p-6 text-center">
            <Package className="mx-auto h-6 w-6 text-yb-slate/50" />
            <p className="mt-2 text-[12px] text-yb-slate">
              Aucun colis en cours.<br />Réservez votre premier envoi en 2 minutes.
            </p>
          </div>
        )}
        {active.map((p: Parcel) => (
          <ParcelCard
            key={p.id}
            parcel={p}
            pickupName={stops.find(s => s.id === p.pickup_stop_id)?.name}
          />
        ))}
      </div>

      {/* Comment ça marche */}
      <h2 className="mt-7 text-[13px] font-black text-yb-ink">Comment ça marche ?</h2>
      <ol className="mt-2.5 space-y-2.5">
        {[
          { icon: <MapPin className="h-4 w-4" />, t: 'Réservez', d: 'Déposez votre colis à un arrêt de la ligne (Keur Massar, Malika, Yeumbeul…).' },
          { icon: <Radio className="h-4 w-4" />, t: 'Suivez en direct', d: 'Le position GPS du Tata est transmis pendant la mission. Vous voyez la fraîcheur de la position.' },
          { icon: <Clock className="h-4 w-4" />, t: 'Récupérez avec le code', d: 'Le destinataire présente son code à 4 chiffres au point de retrait. La remise est vérifiée côté serveur.' },
        ].map((s, i) => (
          <li key={s.t} className="flex gap-3 rounded-2xl border border-yb-line bg-white p-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-kb-green-soft text-kb-green">
              {s.icon}
            </span>
            <div>
              <div className="text-[12.5px] font-bold text-yb-ink">{i + 1}. {s.t}</div>
              <div className="mt-0.5 text-[11px] leading-relaxed text-yb-slate">{s.d}</div>
            </div>
          </li>
        ))}
      </ol>

      {/* Dernier statut utile */}
      {parcels.length > 0 && (
        <div className="mt-6 rounded-2xl border border-yb-line bg-white p-4">
          <div className="text-[11px] font-black text-yb-slate">DERNIÈRE ACTIVITÉ</div>
          {parcels.slice(0, 2).map(p => (
            <div key={p.id} className="mt-2 flex items-center justify-between gap-2 border-t border-yb-line pt-2 first:border-0 first:pt-0">
              <span className="text-[11.5px] font-bold text-yb-ink">{p.reference}</span>
              <StatusBadge status={p.status} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
