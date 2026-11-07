'use client';

/* ============================================================
   YOOBANTÉ — Système de design
   Composants réutilisables pour les 35 écrans
   ============================================================ */
import * as React from 'react';
import { ChevronLeft, ChevronRight, Star, Check, X, Phone, MessageCircle, Plus, Minus, Package, TrendingUp } from 'lucide-react';

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

/* ---------- Logo Yoobanté — image officielle fournie (NE PAS redessiner) ---------- */
export function YbLogo({ h = 40, full = false, className }: { h?: number; full?: boolean; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={full ? '/brand/yoobante-full.png' : '/brand/yoobante-mark.png'}
      alt="Yoobanté"
      className={cx('w-auto select-none', className)}
      style={{ height: h }}
      draggable={false}
    />
  );
}

/* ---------- Logotype Yoobanté (texte) ---------- */
export function YbWordmark({ dark, size = 'md', className }: { dark?: boolean; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = size === 'sm' ? 'text-[15px]' : size === 'lg' ? 'text-[27px]' : 'text-[19px]';
  return (
    <span className={cx('font-black leading-none tracking-tight', s, dark ? 'text-white' : 'text-yb-green', className)}>
      Yoobant<span className="text-yb-amber">é</span>
    </span>
  );
}

/* ---------- Bouton ---------- */
export function YBtn({
  children, variant = 'primary', size = 'md', full, disabled, onClick, icon, className,
}: {
  children: React.ReactNode; variant?: 'primary' | 'amber' | 'ghost' | 'outline' | 'dark' | 'danger';
  size?: 'sm' | 'md' | 'lg'; full?: boolean; disabled?: boolean; onClick?: () => void; icon?: React.ReactNode; className?: string;
}) {
  const variants: Record<string, string> = {
    primary: 'bg-yb-green text-white hover:bg-yb-green-deep shadow-sm',
    amber: 'bg-yb-amber text-yb-green-deep hover:brightness-105 shadow-sm',
    ghost: 'bg-transparent text-yb-green hover:bg-yb-green-soft',
    outline: 'bg-white text-yb-ink border border-yb-line hover:border-yb-green hover:text-yb-green',
    dark: 'bg-yb-green-deep text-white hover:bg-yb-green',
    danger: 'bg-yb-red text-white hover:brightness-105',
  };
  const sizes: Record<string, string> = {
    sm: 'h-8 px-3 text-[11px] gap-1',
    md: 'h-11 px-4 text-[13px] gap-1.5',
    lg: 'h-12 px-5 text-[14px] gap-2',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all active:scale-[0.97] select-none',
        variants[variant], sizes[size], full && 'w-full', disabled && 'opacity-40 pointer-events-none', className
      )}
    >
      {icon}{children}
    </button>
  );
}

/* ---------- Badge ---------- */
export function YBadge({ children, tone = 'green', className }: { children: React.ReactNode; tone?: 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'violet'; className?: string }) {
  const tones: Record<string, string> = {
    green: 'bg-yb-green-soft text-yb-green',
    amber: 'bg-yb-amber-soft text-yb-amber-deep',
    red: 'bg-yb-red-soft text-yb-red',
    blue: 'bg-yb-blue-soft text-yb-blue',
    gray: 'bg-yb-muted text-yb-slate',
    violet: 'bg-yb-violet-soft text-yb-violet',
  };
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', tones[tone], className)}>{children}</span>;
}

/* ---------- Icône en pastille ---------- */
export function YIcon({ children, tone = 'green', size = 'md' }: { children: React.ReactNode; tone?: 'green' | 'amber' | 'red' | 'blue' | 'dark' | 'violet'; size?: 'sm' | 'md' | 'lg' }) {
  const tones: Record<string, string> = {
    green: 'bg-yb-green-soft text-yb-green', amber: 'bg-yb-amber-soft text-yb-amber-deep',
    red: 'bg-yb-red-soft text-yb-red', blue: 'bg-yb-blue-soft text-yb-blue',
    dark: 'bg-yb-green-deep text-amber-300', violet: 'bg-yb-violet-soft text-yb-violet',
  };
  const sizes: Record<string, string> = { sm: 'h-7 w-7', md: 'h-9 w-9', lg: 'h-12 w-12' };
  return <div className={cx('inline-flex items-center justify-center rounded-xl shrink-0', tones[tone], sizes[size])}>{children}</div>;
}

/* ---------- Barre de statut ---------- */
export function StatusBar({ dark }: { dark?: boolean }) {
  return (
    <div className={cx('flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold', dark ? 'text-white' : 'text-yb-ink')}>
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <span className="flex items-end gap-[2px]">
          {[4, 6, 8, 10].map((h, i) => <span key={i} className={cx('w-[3px] rounded-sm', dark ? 'bg-white' : 'bg-yb-ink')} style={{ height: h }} />)}
        </span>
        <svg viewBox="0 0 16 12" className="h-2.5 w-3.5" fill="currentColor"><path d="M8 9.5 L10.5 6.5 A4 4 0 0 0 5.5 6.5 Z M12.2 4.2 A7 7 0 0 0 3.8 4.2 L5.2 5.8 A5 5 0 0 1 10.8 5.8 Z M15 1.5 A10.5 10.5 0 0 0 1 1.5 L2.4 3.1 A8.5 8.5 0 0 1 13.6 3.1 Z" /></svg>
        <span className={cx('inline-block h-3 w-6 rounded-[4px] border', dark ? 'border-white' : 'border-yb-ink')}>
          <span className={cx('m-[1.5px] block h-[calc(100%-3px)] w-[70%] rounded-[2px]', dark ? 'bg-white' : 'bg-yb-ink')} />
        </span>
      </div>
    </div>
  );
}

/* ---------- En-tête d'écran mobile ---------- */
export function YHeader({
  title, sub, back, dark, action, center,
}: { title: string; sub?: string; back?: boolean; dark?: boolean; action?: React.ReactNode; center?: boolean }) {
  return (
    <div className={cx('flex items-center gap-3 px-4 pb-3 pt-2', dark && 'text-white')}>
      {back && (
        <button className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', dark ? 'bg-white/10' : 'bg-white border border-yb-line')}>
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <div className={cx('min-w-0 flex-1', center && 'text-center')}>
        <div className="truncate text-[16px] font-bold leading-tight">{title}</div>
        {sub && <div className={cx('truncate text-[11px]', dark ? 'text-white/60' : 'text-yb-slate')}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Carte ---------- */
export function YCard({ children, className, onClick, pad = true }: { children: React.ReactNode; className?: string; onClick?: () => void; pad?: boolean }) {
  return (
    <div onClick={onClick} className={cx('rounded-2xl border border-yb-line bg-white shadow-[0_1px_3px_rgba(23,37,31,0.05)]', pad && 'p-4', onClick && 'cursor-pointer active:scale-[0.99] transition-transform', className)}>
      {children}
    </div>
  );
}

/* ---------- Ligne de résumé clé/valeur ---------- */
export function YRow({ label, value, bold, tone }: { label: string; value: React.ReactNode; bold?: boolean; tone?: 'green' | 'amber' | 'red' }) {
  const toneCls = tone === 'green' ? 'text-yb-green' : tone === 'amber' ? 'text-yb-amber-deep' : tone === 'red' ? 'text-yb-red' : 'text-yb-ink';
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-[12px] text-yb-slate">{label}</span>
      <span className={cx('text-[13px] text-right', bold ? 'font-bold' : 'font-medium', toneCls)}>{value}</span>
    </div>
  );
}

/* ---------- Stepper progression ---------- */
export function YStepper({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 px-4">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={cx('h-1.5 flex-1 rounded-full transition-colors', i < step ? 'bg-yb-green' : i === step ? 'bg-yb-amber' : 'bg-yb-line')} />
      ))}
    </div>
  );
}

/* ---------- Feuille / bottom sheet ---------- */
export function YSheet({ children, title, onClose }: { children: React.ReactNode; title?: string; onClose?: () => void }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 rounded-t-3xl bg-white pb-5 shadow-[0_-8px_30px_rgba(23,37,31,0.18)] animate-yb-pop">
      <div className="flex items-center justify-between px-5 pb-2 pt-3">
        <div className="mx-auto h-1 w-10 rounded-full bg-yb-line" />
      </div>
      {(title || onClose) && (
        <div className="flex items-center justify-between px-5 pb-2">
          <div className="text-[15px] font-bold">{title}</div>
          {onClose && <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full bg-yb-muted"><X className="h-4 w-4" /></button>}
        </div>
      )}
      <div className="px-5">{children}</div>
    </div>
  );
}

/* ---------- Champ de saisie ---------- */
export function YInput({ label, placeholder, value, trailing, type = 'text', focus }: { label?: string; placeholder?: string; value?: string; trailing?: React.ReactNode; type?: string; focus?: boolean }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-yb-slate">{label}</span>}
      <div className={cx('flex items-center gap-2 rounded-xl border bg-white px-3.5 h-12 transition-colors', focus ? 'border-yb-green ring-2 ring-yb-green/15' : 'border-yb-line')}>
        <input type={type} placeholder={placeholder} defaultValue={value} className="w-full bg-transparent text-[13px] font-medium outline-none placeholder:text-yb-slate/50 placeholder:font-normal" />
        {trailing}
      </div>
    </label>
  );
}

/* ---------- Code de retrait ---------- */
export function YCodeInput({ length = 4, filled }: { length?: number; filled: number }) {
  const code = ['5', '8', '3', '1'];
  return (
    <div className="flex justify-center gap-2.5">
      {Array.from({ length }).map((_, i) => (
        <div key={i} className={cx('flex h-14 w-12 items-center justify-center rounded-xl border-2 text-[22px] font-extrabold transition-all', i < filled ? 'border-yb-green bg-yb-green-soft text-yb-green' : 'border-yb-line bg-white text-yb-slate')}>
          {i < filled ? code[i] : ''}
        </div>
      ))}
    </div>
  );
}

/* ---------- Chronologie de suivi ---------- */
export function YTimeline({ steps }: { steps: Array<{ label: string; time?: string; state: 'done' | 'active' | 'todo' }> }) {
  return (
    <div className="relative pl-1">
      {steps.map((s, i) => (
        <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
          {i < steps.length - 1 && <div className={cx('absolute left-[11px] top-6 h-[calc(100%-20px)] w-0.5', s.state === 'done' ? 'bg-yb-green' : 'bg-yb-line')} />}
          <div className={cx('relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2', s.state === 'done' ? 'border-yb-green bg-yb-green' : s.state === 'active' ? 'animate-yb-breathe border-yb-amber bg-yb-amber' : 'border-yb-line bg-white')}>
            {s.state === 'done' && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
            {s.state === 'active' && <span className="h-2 w-2 rounded-full bg-white" />}
          </div>
          <div className="flex-1 pt-0.5">
            <div className={cx('text-[13px] font-semibold', s.state === 'todo' ? 'text-yb-slate' : 'text-yb-ink')}>{s.label}</div>
            {s.time && <div className="text-[11px] text-yb-slate">{s.time}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Note en étoiles ---------- */
export function StarRating({ value = 5, size = 'md' }: { value?: number; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'h-3.5 w-3.5' : 'h-[18px] w-[18px]';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => <Star key={i} className={cx(s, i <= value ? 'fill-yb-amber text-yb-amber' : 'text-yb-line')} />)}
    </div>
  );
}

/* ---------- Avatar initiales ---------- */
export function YAvatar({ name, tone = 'green', size = 'md' }: { name: string; tone?: 'green' | 'amber' | 'blue' | 'violet'; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  const tones: Record<string, string> = { green: 'bg-yb-green text-white', amber: 'bg-yb-amber text-yb-green-deep', blue: 'bg-yb-blue text-white', violet: 'bg-yb-violet text-white' };
  const sizes: Record<string, string> = { sm: 'h-8 w-8 text-[10px]', md: 'h-10 w-10 text-[12px]', lg: 'h-14 w-14 text-[16px]' };
  return <div className={cx('flex items-center justify-center rounded-full font-bold shrink-0', tones[tone], sizes[size])}>{initials}</div>;
}

/* ---------- Carte conducteur Tata ---------- */
export function DriverCard({ name, tata, rating, trips, plate, price, eta, compact }: { name: string; tata: string; rating: number; trips: number; plate: string; price: string; eta?: string; compact?: boolean }) {
  return (
    <YCard className="animate-yb-rise">
      <div className="flex items-center gap-3">
        <YAvatar name={name} tone="green" size={compact ? 'sm' : 'md'} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[14px] font-bold">{name}</span>
            <span className="flex items-center gap-0.5 text-[11px] font-bold text-yb-amber-deep"><Star className="h-3 w-3 fill-yb-amber text-yb-amber" />{rating}</span>
          </div>
          <div className="text-[11px] text-yb-slate">{tata} · {trips} voyages · plaque {plate}</div>
          {eta && <div className="mt-0.5 text-[11px] font-semibold text-yb-green">Arrive dans {eta}</div>}
        </div>
        <div className="text-right">
          <div className="text-[15px] font-extrabold text-yb-green">{price}</div>
          <div className="text-[10px] text-yb-slate">FCFA</div>
        </div>
      </div>
    </YCard>
  );
}

/* ---------- Faux onglets ---------- */
export function YTabs({ tabs, active = 0 }: { tabs: string[]; active?: number }) {
  return (
    <div className="flex gap-1 rounded-xl bg-yb-muted p-1">
      {tabs.map((t, i) => (
        <div key={t} className={cx('flex-1 rounded-lg py-2 text-center text-[12px] font-semibold transition-colors', i === active ? 'bg-white text-yb-green shadow-sm' : 'text-yb-slate')}>{t}</div>
      ))}
    </div>
  );
}

/* ---------- Actions rapides ---------- */
export function QuickActions({ items }: { items: Array<{ icon: React.ReactNode; label: string }> }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((it, i) => (
        <button key={i} className="flex flex-col items-center gap-1.5 rounded-2xl border border-yb-line bg-white py-3 transition-transform active:scale-95">
          <span className="text-yb-green">{it.icon}</span>
          <span className="text-[10px] font-semibold text-yb-ink leading-tight text-center px-1">{it.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Ligne historique ---------- */
export function HistoryRow({ code, route, date, price, tone }: { code: string; route: string; date: string; price: string; tone: 'green' | 'amber' | 'gray' }) {
  const tones: Record<string, string> = { green: 'bg-yb-green-soft text-yb-green', amber: 'bg-yb-amber-soft text-yb-amber-deep', gray: 'bg-yb-muted text-yb-slate' };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-yb-line bg-white p-3.5">
      <div className={cx('flex h-10 w-10 items-center justify-center rounded-xl', tones[tone])}><Package className="h-5 w-5" /></div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold">{route}</div>
        <div className="text-[11px] text-yb-slate">{code} · {date}</div>
      </div>
      <div className="text-[13px] font-bold text-yb-ink">{price}</div>
    </div>
  );
}

/* ============================================================
   CARTE SVG — carte stylisée de Dakar
   ============================================================ */
export function MapMock({
  className, variant = 'light', markers, route, radar, driver,
}: {
  className?: string; variant?: 'light' | 'dark';
  markers?: Array<{ x: number; y: number; kind: 'pickup' | 'drop' | 'tata' | 'hub'; pulse?: boolean }>;
  route?: string; radar?: { x: number; y: number }; driver?: { x: number; y: number };
}) {
  const isDark = variant === 'dark';
  return (
    <div className={cx('relative overflow-hidden', isDark ? 'bg-yb-green-deep' : 'bg-[#EDE8DA]', className)}>
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="300" fill={isDark ? '#06332B' : '#E9E4D3'} />
        <ellipse cx="80" cy="70" rx="70" ry="46" fill={isDark ? '#0A4438' : '#DED7C1'} />
        <ellipse cx="330" cy="220" rx="88" ry="60" fill={isDark ? '#0A4438' : '#DED7C1'} />
        <ellipse cx="260" cy="60" rx="52" ry="30" fill={isDark ? '#0D5040' : '#E5DFC9'} />
        <path d="M0 260 Q 120 240 220 270 T 400 250 L400 300 L0 300 Z" fill={isDark ? '#0A2E44' : '#BFD9E8'} />
        <path d="M30 40 L150 90 L280 70 L370 130" stroke={isDark ? '#14594A' : '#FFFFFF'} strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M40 200 L160 170 L300 200 L380 160" stroke={isDark ? '#14594A' : '#FFFFFF'} strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d="M150 90 L160 170 M280 70 L300 200 M30 40 L40 200 M370 130 L380 160" stroke={isDark ? '#114C3F' : '#F6F3E9'} strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M20 120 Q 200 95 390 115" stroke={isDark ? '#3E7A5E' : '#F9A50A55'} strokeWidth="5" fill="none" strokeLinecap="round" />
        {route && <path d={route} stroke="#F9A50A" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeDasharray="10 7" />}
        {radar && (
          <g>
            <circle cx={radar.x} cy={radar.y} r="14" fill="none" stroke="#084C41" strokeWidth="2" className="animate-yb-ping" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
            <circle cx={radar.x} cy={radar.y} r="24" fill="none" stroke="#084C41" strokeWidth="1.2" opacity="0.35" className="animate-yb-ping" style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: '0.5s' }} />
          </g>
        )}
        {markers?.map((m, i) => {
          const fill = m.kind === 'pickup' ? '#084C41' : m.kind === 'drop' ? '#D64545' : m.kind === 'tata' ? '#F9A50A' : '#2C6BA8';
          return (
            <g key={i} className="animate-yb-pop" style={{ animationDelay: `${i * 0.12}s`, transformBox: 'fill-box', transformOrigin: 'center' }}>
              {m.pulse && <circle cx={m.x} cy={m.y} r="10" fill={fill} opacity="0.3" className="animate-yb-ping" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />}
              <circle cx={m.x} cy={m.y} r="8.5" fill="#fff" stroke={fill} strokeWidth="3" />
              <circle cx={m.x} cy={m.y} r="3" fill={fill} />
            </g>
          );
        })}
        {driver && (
          <g className="animate-yb-drive" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <rect x={driver.x - 9} y={driver.y - 5.5} width="18" height="11" rx="4" fill="#F9A50A" stroke="#C27B06" strokeWidth="1.5" />
            <rect x={driver.x - 4} y={driver.y - 3} width="4" height="6" rx="1" fill="#06332B" opacity="0.6" />
          </g>
        )}
      </svg>
      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold text-yb-green shadow-sm backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-yb-green animate-yb-pulse-dot" /> GPS DAKAR · VIVANT
      </div>
    </div>
  );
}

/* ============================================================
   Composants console (desktop 1440×900)
   ============================================================ */
export function AKpi({ label, value, delta, icon, tone = 'green' }: { label: string; value: string; delta?: string; icon: React.ReactNode; tone?: 'green' | 'amber' | 'red' | 'blue' }) {
  const tones: Record<string, string> = {
    green: 'bg-yb-green-soft text-yb-green', amber: 'bg-yb-amber-soft text-yb-amber-deep',
    red: 'bg-yb-red-soft text-yb-red', blue: 'bg-yb-blue-soft text-yb-blue',
  };
  return (
    <div className="rounded-xl border border-[#1E5446] bg-[#0A382E] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#8FB3A6]">{label}</span>
        <span className={cx('flex h-8 w-8 items-center justify-center rounded-lg', tones[tone])}>{icon}</span>
      </div>
      <div className="mt-2 text-[24px] font-extrabold text-white leading-none">{value}</div>
      {delta && (
        <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold">
          <TrendingUp className="h-3 w-3 text-[#7FD4A8]" /> <span className="text-[#7FD4A8]">{delta}</span>
        </div>
      )}
    </div>
  );
}

export function ATable({ headers, rows, title, action }: { headers: string[]; rows: Array<React.ReactNode[]>; title: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#1E5446] bg-[#0A382E] overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#1E5446] px-4 py-3">
        <span className="text-[13px] font-bold text-white">{title}</span>
        {action}
      </div>
      <div className="overflow-x-auto yb-scroll-dark">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-[#1E5446]">
              {headers.map(h => <th key={h} className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#7FA89A]">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-[#16493C] last:border-0 hover:bg-[#0E4236] transition-colors">
                {r.map((c, j) => <td key={j} className="px-4 py-3 text-[12px] text-[#D7E5DD]">{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ABadge({ children, tone = 'green' }: { children: React.ReactNode; tone?: 'green' | 'amber' | 'red' | 'blue' | 'gray' }) {
  const tones: Record<string, string> = {
    green: 'bg-[#0E4236] text-[#7FD4B0]', amber: 'bg-[#3B2F12] text-[#F0B95A]',
    red: 'bg-[#3B1616] text-[#F09A9A]', blue: 'bg-[#122B3B] text-[#7FB8F0]', gray: 'bg-[#16493C] text-[#8FB3A6]',
  };
  return <span className={cx('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold', tones[tone])}>{children}</span>;
}

export function ASidebar({ active = 0 }: { active?: number }) {
  const items = [
    { icon: <Package className="h-4 w-4" />, label: 'Vue générale' },
    { icon: <TrendingUp className="h-4 w-4" />, label: 'Colis' },
    { icon: <MessageCircle className="h-4 w-4" />, label: 'Tatas & Chauffeurs' },
    { icon: <Phone className="h-4 w-4" />, label: 'Litiges' },
    { icon: <Plus className="h-4 w-4" />, label: 'Partenaires' },
  ];
  return (
    <div className="flex h-full w-56 flex-col border-r border-[#1E5446] bg-[#072B24] px-3 py-4">
      <div className="mb-6 flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white"><YbLogo h={26} /></div>
        <div>
          <div className="text-[13px] font-extrabold text-white leading-none">Yoobanté</div>
          <div className="text-[9px] font-semibold text-[#8FB3A6]">CONSOLE OPÉRATEUR</div>
        </div>
      </div>
      {items.map((it, i) => (
        <div key={it.label} className={cx('mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12px] font-semibold transition-colors', i === active ? 'bg-yb-green text-white' : 'text-[#8FB3A6] hover:bg-[#0E4236]')}>
          {it.icon}{it.label}
        </div>
      ))}
      <div className="mt-auto rounded-xl bg-[#0A382E] p-3">
        <div className="text-[10px] font-bold text-[#8FB3A6]">OPÉRATEUR</div>
        <div className="mt-1 text-[12px] font-bold text-white">Aminata Diallo</div>
        <div className="text-[10px] text-[#7FA89A]">Admin · Dakar</div>
      </div>
    </div>
  );
}

/* ---------- Toast interne ---------- */
export function YToast({ children, tone = 'green' }: { children: React.ReactNode; tone?: 'green' | 'amber' }) {
  const tones: Record<string, string> = { green: 'bg-yb-green-deep text-white', amber: 'bg-yb-amber text-yb-green-deep' };
  return (
    <div className={cx('absolute bottom-24 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold shadow-lg animate-yb-pop', tones[tone])}>
      {children}
    </div>
  );
}

/* ---------- Navigation bas ---------- */
export function YBottomNav({ active = 0 }: { active?: number }) {
  const items: Array<{ label: string; d?: string; logo?: boolean }> = [
    { label: 'Accueil', logo: true },
    { label: 'Envoyer', d: 'M12 2 L15 9 L22 9 L16.5 13.5 L19 21 L12 16.5 L5 21 L7.5 13.5 L2 9 L9 9 Z' },
    { label: 'Suivi', d: 'M12 2 A 7 7 0 1 1 11.9 2 M12 9 V12 L15 13' },
    { label: 'Profil', d: 'M12 12 A 4 4 0 1 0 12 4 A 4 4 0 0 0 12 12 M4 21 C4 16 8 14 12 14 C16 14 20 16 20 21' },
  ];
  return (
    <div className="absolute inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-yb-line bg-white/95 pb-4 pt-2 backdrop-blur">
      {items.map((it, i) => (
        <div key={it.label} className={cx('flex flex-col items-center gap-0.5 px-3', i === active ? 'text-yb-green' : 'text-yb-slate')}>
          {it.logo ? (
            <span className="flex h-5 items-center"><YbLogo h={18} className={i === active ? '' : 'opacity-80'} /></span>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={i === active ? 2.4 : 1.8} strokeLinecap="round" strokeLinejoin="round"><path d={it.d} /></svg>
          )}
          <span className={cx('text-[9px]', i === active ? 'font-bold' : 'font-medium')}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Paire d'actions appel/discussion ---------- */
export function ActionPair({ onCall, onChat }: { onCall?: string; onChat?: string }) {
  return (
    <div className="flex gap-2">
      <YBtn variant="outline" size="sm" icon={<Phone className="h-3.5 w-3.5" />}>{onCall ?? 'Appeler'}</YBtn>
      <YBtn variant="outline" size="sm" icon={<MessageCircle className="h-3.5 w-3.5" />}>{onChat ?? 'Discuter'}</YBtn>
    </div>
  );
}

export { ChevronLeft, ChevronRight, Star, Check, X, Phone, MessageCircle, Plus, Minus, Package, TrendingUp };
