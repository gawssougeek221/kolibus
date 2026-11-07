'use client';

/* ============================================================
   KoliBus — Composants UI partagés (Client / Transport / Admin)
   Identité : bannière officielle fournie (#123D33 · #F6C25C)
   Slogan réservé : « Réserver. Suivre. Récupérer. »
   ============================================================ */
import * as React from 'react';
import { cx } from '@/components/yb/ui';
import type { Parcel, ParcelStatus, StatusEvent, VehicleLocation } from '@/lib/kb/types';
import { STATUS_LABEL, STATUS_TONE, fcfa, timeAgo, dateTimeFr, freshnessLabel, freshnessOf } from '@/lib/kb/domain';

/* ---------- Wordmark KoliBus (texte fidèle à la bannière) ---------- */
export function KbWordmark({ size = 22, light = false }: { size?: number; light?: boolean }) {
  return (
    <span className="font-black leading-none tracking-tight" style={{ fontSize: size }}>
      <span className={light ? 'text-white' : 'text-kb-green'}>Koli</span>
      <span className="text-kb-amber">Bus</span>
    </span>
  );
}

/* ---------- Bannière officielle (image fournie, non modifiée) ---------- */
export function KbBanner({ h = 96 }: { h?: number }) {
  return (
    <img
      src="/brand/kolibus-banner.jpeg"
      alt="KoliBus — Réserver. Suivre. Récupérer."
      className="rounded-2xl object-cover shadow-lg"
      style={{ height: h, maxWidth: '100%' }}
    />
  );
}

/* ---------- Badge de statut ---------- */
const TONES: Record<string, string> = {
  amber: 'bg-yb-amber-soft text-yb-amber-deep border-yb-amber/30',
  green: 'bg-yb-green-soft text-yb-green border-yb-green/25',
  blue: 'bg-yb-blue-soft text-yb-blue border-yb-blue/25',
  red: 'bg-yb-red-soft text-yb-red border-yb-red/30',
  slate: 'bg-yb-cream text-yb-slate border-yb-line',
  violet: 'bg-[#EFE9F8] text-yb-violet border-yb-violet/25',
};

export function StatusBadge({ status, size = 'md' }: { status: ParcelStatus; size?: 'sm' | 'md' }) {
  return (
    <span className={cx(
      'inline-flex items-center gap-1.5 rounded-full border font-bold',
      TONES[STATUS_TONE[status]],
      size === 'sm' ? 'px-2 py-0.5 text-[9.5px]' : 'px-2.5 py-1 text-[10.5px]',
    )}>
      {status === 'en_transit' && <span className="h-1.5 w-1.5 rounded-full bg-yb-blue animate-yb-ping-slow" />}
      {STATUS_LABEL[status]}
    </span>
  );
}

/* ---------- Fraîcheur GPS ---------- */
export function Freshness({ location, compact = false }: { location: VehicleLocation | null; compact?: boolean }) {
  const fresh = freshnessOf(location?.received_at);
  const label = freshnessLabel(location?.received_at);
  const dot = fresh === 'live' ? 'bg-yb-green' : fresh === 'recent' ? 'bg-yb-amber' : 'bg-yb-slate/50';
  return (
    <span className={cx(
      'inline-flex items-center gap-1.5 font-semibold',
      compact ? 'text-[9.5px]' : 'text-[11px]',
      fresh === 'stale' || fresh === 'none' ? 'text-yb-slate' : 'text-yb-ink',
    )}>
      <span className={cx('h-2 w-2 rounded-full', dot, fresh === 'live' && 'animate-yb-ping-slow')} />
      {label}
      {location && <span className="text-yb-slate/70">· {location.source === 'simulation' ? 'SIMULATION' : 'GPS réel'}</span>}
    </span>
  );
}

/* ---------- Carte colis ---------- */
export function ParcelCard({
  parcel, pickupName, onClick, showRecipient = false,
}: {
  parcel: Parcel; pickupName?: string; onClick?: () => void; showRecipient?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-yb-line bg-white p-4 text-left shadow-[0_1px_3px_rgba(20,35,30,0.05)] transition-all hover:border-yb-green/40 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-black tracking-wide text-yb-green">{parcel.reference}</span>
        <StatusBadge status={parcel.status} size="sm" />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[13.5px] font-bold text-yb-ink">
            {showRecipient ? `→ ${parcel.recipient_name}` : parcel.category}
          </div>
          <div className="mt-0.5 text-[11px] text-yb-slate">
            {parcel.description} · {parcel.weight_kg} kg{pickupName ? ` · retrait ${pickupName}` : ''}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[14px] font-black text-yb-ink">{fcfa(parcel.price_fcfa)}</div>
          <div className="text-[9.5px] text-yb-slate">{timeAgo(parcel.created_at)}</div>
        </div>
      </div>
    </button>
  );
}

/* ---------- Timeline de statuts ---------- */
export function Timeline({ events, current }: { events: StatusEvent[]; current: ParcelStatus }) {
  const done = new Set(events.map(e => e.status));
  const order: ParcelStatus[] = [
    'en_attente', 'confirmee', 'affecte', 'prise_en_charge',
    'en_transit', 'arrive', 'pret_a_recuperer', 'livre',
  ];
  const idx = order.indexOf(current);
  const visible = current === 'annule' || current === 'incident'
    ? order
    : idx >= 0 ? order.slice(0, idx + 1) : order;
  return (
    <ol className="space-y-0">
      {visible.map((s, i) => {
        const evt = [...events].reverse().find(e => e.status === s);
        const isDone = done.has(s) && s !== current;
        const isCurrent = s === current && current !== 'annule' && current !== 'incident';
        const failed = current === 'annule' || current === 'incident';
        return (
          <li key={s} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={cx(
                'mt-1 flex h-4 w-4 items-center justify-center rounded-full border-2',
                isCurrent ? 'border-yb-amber bg-yb-amber/30 animate-yb-breathe'
                  : isDone ? 'border-yb-green bg-yb-green'
                  : failed && i === visible.length - 1 ? 'border-yb-red bg-yb-red/20'
                  : 'border-yb-line bg-white',
              )}>
                {isDone && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              {i < visible.length - 1 && <span className={cx('w-0.5 flex-1', isDone ? 'bg-yb-green/40' : 'bg-yb-line')} />}
            </div>
            <div className="pb-4">
              <div className={cx('text-[12.5px] font-bold leading-tight',
                isCurrent ? 'text-yb-amber-deep' : isDone ? 'text-yb-ink' : failed && i === visible.length - 1 ? 'text-yb-red' : 'text-yb-slate')}>
                {STATUS_LABEL[s]}
              </div>
              {evt && (
                <div className="mt-0.5 text-[10.5px] text-yb-slate">
                  {dateTimeFr(evt.created_at)} · {evt.actor}{evt.note ? ` · ${evt.note}` : ''}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- Shell mobile (Client / Transport web de test) ---------- */
export function KbShell({
  title, subtitle, dark = false, children, right,
}: {
  title?: string; subtitle?: string; dark?: boolean;
  children: React.ReactNode; right?: React.ReactNode;
}) {
  return (
    <div className={cx('min-h-full', dark ? 'bg-kb-green text-white' : 'bg-yb-cream')}>
      {(title || right) && (
        <div className={cx(
          'sticky top-0 z-40 flex items-center justify-between gap-3 border-b px-5 py-4 backdrop-blur',
          dark ? 'border-white/10 bg-kb-green/90' : 'border-yb-line bg-white/80',
        )}>
          <div className="min-w-0">
            {title && <div className={cx('truncate text-[16px] font-black', dark ? 'text-white' : 'text-yb-ink')}>{title}</div>}
            {subtitle && <div className={cx('truncate text-[11px]', dark ? 'text-white/60' : 'text-yb-slate')}>{subtitle}</div>}
          </div>
          {right}
        </div>
      )}
      <div className="px-4 pb-8 pt-4">{children}</div>
    </div>
  );
}

/* ---------- Navigation basse ---------- */
export function KbBottomNav({
  items, active, onNavigate,
}: {
  items: { href: string; label: string; icon: React.ReactNode }[];
  active: string; onNavigate?: (href: string) => void;
}) {
  return (
    <nav className="sticky bottom-0 z-40 flex border-t border-yb-line bg-white/95 backdrop-blur">
      {items.map(it => (
        <button
          key={it.href}
          onClick={() => onNavigate?.(it.href)}
          className={cx(
            'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[9.5px] font-bold transition-colors',
            active === it.href ? 'text-kb-green' : 'text-yb-slate hover:text-yb-ink',
          )}
        >
          <span className={cx('flex h-7 w-7 items-center justify-center rounded-xl', active === it.href && 'bg-kb-green-soft')}>
            {it.icon}
          </span>
          {it.label}
        </button>
      ))}
    </nav>
  );
}

/* ---------- Bloc générique ---------- */
export function Section({
  icon, title, children, tone = 'white',
}: {
  icon?: React.ReactNode; title?: string; children: React.ReactNode; tone?: 'white' | 'none';
}) {
  return (
    <section className={cx(
      'rounded-2xl border p-4 shadow-[0_1px_3px_rgba(20,35,30,0.05)]',
      tone === 'white' ? 'border-yb-line bg-white' : 'border-transparent bg-transparent p-0 shadow-none',
    )}>
      {title && (
        <div className="mb-2.5 flex items-center gap-2 text-[11px] font-black tracking-wide text-kb-green">
          {icon}{title}
        </div>
      )}
      {children}
    </section>
  );
}

/* ---------- Champ formulaire ---------- */
export function Field({
  label, error, children, hint,
}: {
  label: string; error?: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-[11px] font-bold text-yb-ink">
        {label}
        {hint && <span className="font-medium text-yb-slate/70">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-[10.5px] font-semibold text-yb-red">{error}</span>}
    </label>
  );
}

export const inputCls = (hasError?: unknown) => cx(
  'w-full rounded-xl border bg-white px-3.5 py-2.5 text-[13.5px] text-yb-ink outline-none transition-colors placeholder:text-yb-slate/50 focus:border-kb-green',
  hasError ? 'border-yb-red' : 'border-yb-line',
);

/* ---------- KPI admin ---------- */
export function Kpi({ label, value, sub, tone = 'green' }: {
  label: string; value: React.ReactNode; sub?: string; tone?: 'green' | 'amber' | 'blue' | 'red';
}) {
  const bar = { green: 'bg-kb-green', amber: 'bg-yb-amber', blue: 'bg-yb-blue', red: 'bg-yb-red' }[tone];
  return (
    <div className="rounded-2xl border border-yb-line bg-white p-3.5 shadow-[0_1px_3px_rgba(20,35,30,0.05)]">
      <span className={cx('mb-2 block h-1 w-8 rounded-full', bar)} />
      <div className="text-[20px] font-black leading-none text-yb-ink">{value}</div>
      <div className="mt-1 text-[10.5px] font-bold text-yb-slate">{label}</div>
      {sub && <div className="mt-0.5 text-[9.5px] text-yb-slate/70">{sub}</div>}
    </div>
  );
}

/* ---------- Bandeau MODE DÉMO (honnêteté obligatoire) ---------- */
export function DemoBanner({ onOpenDocs }: { onOpenDocs?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-yb-amber/40 bg-yb-amber-soft px-3 py-2">
      <span className="text-[10.5px] font-bold leading-snug text-yb-amber-deep">
        MODE DÉMO — données locales à ce navigateur. Connectez Supabase pour le pilote réel (docs/supabase-setup.md).
      </span>
      {onOpenDocs && (
        <button onClick={onOpenDocs} className="shrink-0 rounded-lg bg-yb-amber px-2 py-1 text-[9.5px] font-black text-kb-green">
          Docs
        </button>
      )}
    </div>
  );
}

/* ---------- Toast ---------- */
export function useToast(): [string | null, (m: string) => void] {
  const [msg, setMsg] = React.useState<string | null>(null);
  const show = React.useCallback((m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 2600);
  }, []);
  return [msg, show];
}

export function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null;
  const isErr = msg.startsWith('!') ;
  return (
    <div className={cx(
      'fixed bottom-20 left-1/2 z-[100] max-w-[92vw] -translate-x-1/2 rounded-xl px-4 py-2.5 text-center text-[12px] font-bold shadow-2xl animate-yb-pop',
      isErr ? 'bg-yb-red text-white' : 'bg-kb-green text-white',
    )}>
      {isErr ? msg.slice(1) : msg}
    </div>
  );
}
