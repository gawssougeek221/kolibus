'use client';

/* KoliBus Client — Liste des colis (en cours / historique) */
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';
import { kb, useKbSync } from '@/lib/kb/store';
import { ParcelCard } from '@/components/kb/ui';
import type { Parcel } from '@/lib/kb/types';

export default function ColisPage() {
  const v = useKbSync();
  const router = useRouter();
  const [tab, setTab] = React.useState<'encours' | 'historique'>('encours');
  const session = React.useMemo(() => kb().session(), [v]);

  const mine = React.useMemo(() => {
    const s = kb().session();
    return kb().parcels().filter(p => p.sender_phone === s?.phone || p.sender_name === s?.name);
  }, [v, session]);

  const enCours = mine.filter(p => !['livre', 'annule'].includes(p.status));
  const historique = mine.filter(p => ['livre', 'annule'].includes(p.status));
  const stops = kb().stops();
  const list = tab === 'encours' ? enCours : historique;

  return (
    <div className="px-4 pb-6 pt-2">
      <h1 className="text-[20px] font-black text-yb-ink">Mes colis</h1>

      <div className="mt-3 flex rounded-xl bg-yb-muted p-1">
        {([['encours', `En cours (${enCours.length})`], ['historique', `Historique (${historique.length})`]] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex-1 rounded-lg py-2 text-[12px] font-bold transition-all ${
              tab === k ? 'bg-white text-kb-green shadow-sm' : 'text-yb-slate'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-yb-line bg-white/60 p-8 text-center">
            <Package className="mx-auto h-7 w-7 text-yb-slate/50" />
            <p className="mt-2 text-[12px] text-yb-slate">
              {tab === 'encours' ? 'Aucun colis en cours.' : 'Aucun colis dans l\u2019historique.'}
            </p>
          </div>
        )}
        {list.map((p: Parcel) => (
          <ParcelCard
            key={p.id}
            parcel={p}
            showRecipient
            pickupName={stops.find(s => s.id === p.pickup_stop_id)?.name}
            onClick={() => router.push(`/app/colis/${p.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
