'use client';

/* ============================================================
   KoliBus — Carte de suivi (OpenStreetMap + react-leaflet)
   · Polyline de la ligne (arrêts réels du pilote)
   · Dernière position du véhicule + trace récente
   · Chargé dynamiquement (ssr:false) — voir map-panel.tsx
   ============================================================ */
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import type { Stop, VehicleLocation } from '@/lib/kb/types';

const AMBER = '#F6C25C';
const GREEN = '#123D33';

export default function KbMap({
  stops,
  position,
  trail = [],
  height = 320,
  zoom = 12,
  simulating = false,
}: {
  stops: Pick<Stop, 'id' | 'name' | 'lat' | 'lng' | 'position_order'>[];
  position?: VehicleLocation | null;
  trail?: VehicleLocation[];
  height?: number;
  zoom?: number;
  simulating?: boolean;
}) {
  const center: [number, number] = position
    ? [position.lat, position.lng]
    : stops.length
      ? [stops[0].lat, stops[0].lng]
      : [14.755, -17.35];

  const line = stops
    .slice()
    .sort((a, b) => a.position_order - b.position_order)
    .map(s => [s.lat, s.lng] as [number, number]);

  return (
    <div className="overflow-hidden rounded-2xl border border-yb-line" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {line.length >= 2 && (
          <Polyline positions={line} pathOptions={{ color: GREEN, weight: 3, dashArray: '7 7', opacity: 0.75 }} />
        )}
        {trail.slice(-30).map(l => (
          <CircleMarker
            key={l.id}
            center={[l.lat, l.lng]}
            radius={3}
            pathOptions={{ color: AMBER, fillColor: AMBER, fillOpacity: 0.5, weight: 1 }}
          />
        ))}
        {stops.map(s => (
          <CircleMarker
            key={s.id}
            center={[s.lat, s.lng]}
            radius={7}
            pathOptions={{ color: GREEN, fillColor: '#FFFFFF', fillOpacity: 1, weight: 2.5 }}
          >
            <Tooltip permanent direction="top" offset={[0, -6]} className="kb-stop-label">
              {s.name}
            </Tooltip>
          </CircleMarker>
        ))}
        {position && (
          <CircleMarker
            center={[position.lat, position.lng]}
            radius={9}
            pathOptions={{
              color: position.source === 'simulation' ? '#C27B06' : '#2C6BA8',
              fillColor: position.source === 'simulation' ? AMBER : '#5B9BD5',
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -8]} className="kb-stop-label">
              {simulating || position.source === 'simulation' ? 'Véhicule (simulation)' : 'Véhicule en mission'}
            </Tooltip>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}
