'use client';

/* Wrapper client-only pour la carte Leaflet (Next.js : pas de SSR) */
import dynamic from 'next/dynamic';
import type { Stop, VehicleLocation } from '@/lib/kb/types';

const KbMapInner = dynamic(() => import('./map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center rounded-2xl border border-yb-line bg-yb-green-soft text-[12px] font-bold text-yb-slate" style={{ height: 320 }}>
      Chargement de la carte…
    </div>
  ),
});

export default function MapPanel(props: {
  stops: Pick<Stop, 'id' | 'name' | 'lat' | 'lng' | 'position_order'>[];
  position?: VehicleLocation | null;
  trail?: VehicleLocation[];
  height?: number;
  zoom?: number;
  simulating?: boolean;
}) {
  return <KbMapInner {...props} />;
}
