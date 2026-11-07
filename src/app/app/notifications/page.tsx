'use client';

/* KoliBus Client — Centre de notifications */
import * as React from 'react';
import { Bell, PackageCheck, Truck, ShieldCheck, CircleCheck, TriangleAlert, PackageX, Package } from 'lucide-react';
import { kb, useKbSync, IS_DEMO } from '@/lib/kb/store';
import { DemoBanner } from '@/components/kb/ui';
import { timeAgo } from '@/lib/kb/domain';

const ICONS: Record<string, React.ReactNode> = {
  parcel_created: <Package className="h-4 w-4" />,
  parcel_confirmee: <ShieldCheck className="h-4 w-4" />,
  parcel_affecte: <Truck className="h-4 w-4" />,
  parcel_prise_en_charge: <Truck className="h-4 w-4" />,
  parcel_en_transit: <Truck className="h-4 w-4" />,
  parcel_arrive: <MapPinIcon />,
  parcel_pret_a_recuperer: <PackageCheck className="h-4 w-4" />,
  parcel_livre: <CircleCheck className="h-4 w-4" />,
  parcel_annule: <PackageX className="h-4 w-4" />,
  parcel_incident: <TriangleAlert className="h-4 w-4" />,
};

function MapPinIcon() {
  return <span className="text-[13px]">📍</span>;
}

export default function NotificationsPage() {
  const v = useKbSync();
  React.useEffect(() => {
    const t = setTimeout(() => kb().markNotificationsRead(), 1200);
    return () => clearTimeout(t);
  }, [v]);

  const all = kb().notifications();
  const session = React.useMemo(() => kb().session(), [v]);
  const mine = all.filter(n => n.audience !== 'recipient');

  return (
    <div className="px-4 pb-6 pt-2">
      <h1 className="text-[20px] font-black text-yb-ink">Alertes</h1>
      <p className="mt-1 text-[11.5px] text-yb-slate">
        Notifications de vos envois : création, prise en charge, transit, arrivée, retrait.
        {IS_DEMO && ' (Dans l\u2019app mobile, ces alertes deviendront des push Android/iOS — voir docs.)'}
      </p>
      {IS_DEMO && <div className="mt-3"><DemoBanner /></div>}

      <div className="mt-4 space-y-2.5">
        {mine.length === 0 && (
          <div className="rounded-2xl border border-dashed border-yb-line bg-white/60 p-8 text-center">
            <Bell className="mx-auto h-7 w-7 text-yb-slate/50" />
            <p className="mt-2 text-[12px] text-yb-slate">Aucune alerte pour le moment.</p>
          </div>
        )}
        {mine.map(n => (
          <div key={n.id} className={`flex gap-3 rounded-2xl border p-3.5 ${n.read_at ? 'border-yb-line bg-white' : 'border-yb-green/30 bg-yb-green-soft/50'}`}>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${n.type === 'parcel_incident' ? 'bg-yb-red-soft text-yb-red' : n.type === 'parcel_livre' ? 'bg-yb-green-soft text-yb-green' : 'bg-kb-green-soft text-kb-green'}`}>
              {ICONS[n.type] ?? <Bell className="h-4 w-4" />}
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[12.5px] font-black text-yb-ink">{n.title}</span>
                <span className="shrink-0 text-[9.5px] text-yb-slate">{timeAgo(n.created_at)}</span>
              </div>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-yb-slate">{n.body}</p>
              {n.parcel_ref && (
                <span className="mt-1 inline-block rounded-md bg-yb-cream px-1.5 py-0.5 text-[9.5px] font-black text-kb-green">{n.parcel_ref}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
