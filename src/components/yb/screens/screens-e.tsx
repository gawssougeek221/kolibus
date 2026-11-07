'use client';

/* ============================================================
   YOOBANTÉ — Groupe E : Receveur Tata (E1–E7)
   ============================================================ */
import * as React from 'react';
import {
  StatusBar, YHeader, YBtn, YCard, YBadge, YRow, YCodeInput, cx, YAvatar, YToast,
} from '@/components/yb/ui';
import {
  ScanLine, Package, Check, Clock, MapPin, Camera, PenLine, Wallet, TrendingUp,
  BadgeCheck, FileText, Truck, Users, ChevronRight, Delete, QrCode, AlertCircle, X, Bell,
} from 'lucide-react';

/* ---------- E1 · Tableau de bord Receveur ---------- */
export function RecDashboardScr() {
  const queue = [
    { code: '5831', to: 'Ouakam — Boutique Awa', p: 'Sac tissus · 4 kg', state: 'À remettre', tone: 'green' },
    { code: '7245', to: 'Pikine — Rond-point', p: 'Carton · 9 kg', state: 'À remettre', tone: 'green' },
    { code: '9016', to: 'Guédiawaye — Gare', p: 'Sac riz · 12 kg', state: 'À bord', tone: 'amber' },
    { code: '3388', to: 'Parcelles — U26', p: 'Pli documents', state: 'À bord', tone: 'amber' },
    { code: '5510', to: 'Ouakam — Pharmacie', p: 'Colis fragile · 3 kg', state: 'Remis ✓', tone: 'gray' },
    { code: '1187', to: 'Pikine — Tally', p: 'Sac tissus · 6 kg', state: 'Remis ✓', tone: 'gray' },
  ] as const;
  return (
    <div className="flex h-full flex-col bg-yb-green-deep">
      <StatusBar dark />
      <YHeader title="Bonjour, Modou 👷" sub="Tata DK-4821-AB · Ligne 27 · En service" dark
        action={<YBadge tone="amber" className="bg-yb-amber text-yb-green-deep">Journée active</YBadge>} />
      <div className="grid grid-cols-3 gap-2 px-4 pb-4">
        {[
          { v: '4', l: 'à bord', c: 'bg-yb-amber text-yb-green-deep' },
          { v: '2', l: 'à remettre', c: 'bg-white text-yb-green' },
          { v: '6', l: 'remis', c: 'bg-white/15 text-white' },
        ].map(k => (
          <div key={k.l} className="rounded-2xl bg-white/10 p-3 text-center backdrop-blur">
            <div className={cx('mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-black', k.c)}>{k.v}</div>
            <div className="mt-1.5 text-[10px] font-bold text-white/70">{k.l}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto yb-scroll rounded-t-3xl bg-yb-cream px-4 pb-24 pt-4">
        <div className="mb-3 flex items-center gap-3 rounded-2xl border border-yb-amber/40 bg-yb-amber-soft p-3">
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yb-amber text-yb-green-deep">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-yb-amber-soft bg-yb-red animate-yb-pulse-dot" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-black text-yb-ink">3 demandes en direct</div>
            <div className="text-[10.5px] font-semibold text-yb-amber-deep">Proches de la Ligne 27 · répondre en 5 s</div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-yb-amber-deep" />
        </div>
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="text-[14px] font-bold text-yb-ink">Colis du jour</span>
          <span className="text-[11px] font-bold text-yb-green">Ordre de route</span>
        </div>
        <div className="space-y-2.5">
          {queue.map(q => (
            <div key={q.code} className="flex items-center gap-3 rounded-2xl border border-yb-line bg-white p-3.5">
              <div className={cx('flex h-11 w-11 flex-col items-center justify-center rounded-xl text-center',
                q.tone === 'green' ? 'bg-yb-green-soft' : q.tone === 'amber' ? 'bg-yb-amber-soft' : 'bg-yb-muted')}>
                <span className="text-[12px] font-black leading-none">{q.code.slice(0, 2)}</span>
                <span className="text-[12px] font-black leading-none">{q.code.slice(2)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-bold">{q.to}</div>
                <div className="text-[10.5px] text-yb-slate">{q.p}</div>
              </div>
              {q.tone === 'gray'
                ? <YBadge tone="gray">Remis</YBadge>
                : <ChevronRight className="h-4 w-4 text-yb-slate" />}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-5 z-40 flex justify-center">
        <button className="flex items-center gap-2.5 rounded-full bg-yb-amber px-7 py-4 text-[14px] font-black text-yb-green-deep shadow-2xl transition-transform active:scale-95">
          <ScanLine className="h-5 w-5" /> Scanner / saisir un code
        </button>
      </div>
    </div>
  );
}

/* ---------- E2 · Demandes en temps réel (INTERACTIF) ---------- */
type ReqState = 'pending' | 'accepted' | 'refused';
interface Demande {
  id: number; name: string; ago: string; dist: string;
  from: string; to: string; parcel: string; opts: string[];
  price: string; part: string; expire: string; bar: number;
}
const DEMANDES: Demande[] = [
  { id: 1, name: 'Aminata Sow', ago: 'il y a 8 s', dist: '0,8 km', from: 'Keur Massar — Gare routière', to: 'Ouakam — Boutique Awa', parcel: 'Sac tissus · 6 kg', opts: ['Express'], price: '2 000', part: '1 700', expire: '45 s', bar: 62 },
  { id: 2, name: 'Ibrahima Fall', ago: 'il y a 24 s', dist: '1,4 km', from: 'Pikine — Rond-point Tally', to: 'Parcelles — U26', parcel: 'Carton électronique · 9 kg', opts: ['Fragile'], price: '2 500', part: '2 125', expire: '32 s', bar: 45 },
  { id: 3, name: 'Fatou Ndiaye', ago: 'il y a 1 min', dist: '2,0 km', from: 'Guédiawaye — Gare', to: 'Point E — Pharmacie Ndiaye', parcel: 'Sac riz · 12 kg', opts: [], price: '3 000', part: '2 550', expire: '18 s', bar: 26 },
];
const POOL: Demande[] = [
  { id: 4, name: 'Moussa Diop', ago: 'à l’instant', dist: '1,1 km', from: 'Yoff — Virage', to: 'Médina — Marché Sandaga', parcel: 'Pli documents · 1 kg', opts: ['Express'], price: '1 500', part: '1 275', expire: '60 s', bar: 100 },
  { id: 5, name: 'Khady Sarr', ago: 'à l’instant', dist: '1,8 km', from: 'Rufisque — Zone B', to: 'Plateau — Rue Abdoulaye Seck', parcel: 'Panier mangues · 8 kg', opts: [], price: '2 200', part: '1 870', expire: '60 s', bar: 100 },
];
const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function DemandCard({ d, onAccept, onRefuse }: {
  d: Demande & { state: ReqState; fresh?: boolean };
  onAccept: () => void; onRefuse: () => void;
}) {
  if (d.state === 'accepted') {
    return (
      <div className="animate-yb-pop rounded-2xl border-2 border-yb-green/50 bg-yb-green-soft p-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yb-green text-white">
            <Check className="h-4.5 w-4.5" strokeWidth={3} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-black text-yb-green">Demande acceptée</div>
            <div className="truncate text-[10.5px] font-semibold text-yb-green/80">
              Colis à récupérer à {d.from.split(' — ')[0]} · le client suit en direct
            </div>
          </div>
          <span className="shrink-0 text-[13px] font-black text-yb-green">{d.part} F</span>
        </div>
      </div>
    );
  }
  if (d.state === 'refused') {
    return (
      <div className="rounded-2xl border border-yb-line bg-white/60 p-3.5 opacity-75">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yb-muted text-yb-slate">
            <X className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-bold text-yb-slate">Demande refusée</div>
            <div className="truncate text-[10.5px] text-yb-slate">
              {d.from.split(' — ')[0]} → {d.to.split(' — ')[0]} · transmise à un autre Tata
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={cx('animate-yb-pop rounded-2xl border bg-white p-3.5 shadow-[0_1px_3px_rgba(23,37,31,0.05)]', d.fresh ? 'border-yb-amber' : 'border-yb-line')}>
      <div className="flex items-center gap-2.5">
        <YAvatar name={d.name} tone="green" size="sm" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.5px] font-bold">{d.name}</div>
          <div className="flex items-center gap-1.5 text-[10px] text-yb-slate">
            {d.ago} · {d.dist}
          </div>
        </div>
        {d.fresh && <YBadge tone="amber" className="bg-yb-amber text-yb-green-deep">Nouveau</YBadge>}
        <div className="shrink-0 text-right">
          <div className="text-[15px] font-black leading-none text-yb-green">{d.price}</div>
          <div className="text-[9px] font-semibold text-yb-slate">FCFA</div>
        </div>
      </div>
      <div className="mt-3 space-y-1.5 rounded-xl bg-yb-muted/50 p-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-yb-green" />
          <span className="truncate text-[11.5px] font-semibold">{d.from}</span>
        </div>
        <div className="ml-[3px] h-2.5 w-0.5 border-l border-dashed border-yb-slate/40" />
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-yb-red" />
          <span className="truncate text-[11.5px] font-semibold">{d.to}</span>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="truncate text-[10.5px] text-yb-slate">{d.parcel}</span>
        <div className="flex shrink-0 gap-1">
          {d.opts.map(o => <YBadge key={o} tone={o === 'Fragile' ? 'red' : 'blue'}>{o}</YBadge>)}
        </div>
      </div>
      <div className="mt-2.5 flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-black text-yb-green">Votre part : {d.part} FCFA</span>
        <span className="text-[9.5px] text-yb-slate">après commission 15%</span>
      </div>
      <div className="mt-2.5">
        <div className="flex items-center justify-between text-[9.5px] font-bold text-yb-slate">
          <span>Déclinaison automatique</span><span>{d.expire}</span>
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-yb-line">
          <div className="h-full rounded-full bg-yb-amber transition-all duration-700" style={{ width: `${d.bar}%` }} />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <YBtn variant="outline" size="md" className="flex-1" onClick={onRefuse}>Refuser</YBtn>
        <YBtn variant="primary" size="md" className="flex-1" onClick={onAccept} icon={<Check className="h-4 w-4" />}>Accepter</YBtn>
      </div>
    </div>
  );
}

export function RecRequestsScr() {
  const [list, setList] = React.useState<Array<Demande & { state: ReqState; fresh?: boolean }>>(
    () => DEMANDES.map(d => ({ ...d, state: 'pending' as ReqState }))
  );
  const [toast, setToast] = React.useState<string | null>(null);
  const poolIdx = React.useRef(0);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 1900);
  };

  /* Simulateur temps réel : une nouvelle demande arrive toutes les 9 s */
  React.useEffect(() => {
    const t = window.setInterval(() => {
      const d = POOL[poolIdx.current];
      if (!d) { window.clearInterval(t); return; }
      poolIdx.current += 1;
      setList(prev => [
        { ...d, state: 'pending' as ReqState, fresh: true },
        ...prev.map(x => ({ ...x, fresh: false })),
      ]);
      flash('Nouvelle demande reçue');
    }, 9000);
    return () => window.clearInterval(t);
  }, []);

  const accept = (id: number) => {
    setList(prev => prev.map(x => x.id === id ? { ...x, state: 'accepted', fresh: false } : x));
    flash('Acceptée — colis à charger au prochain arrêt');
  };
  const refuse = (id: number) => {
    setList(prev => prev.map(x => x.id === id ? { ...x, state: 'refused', fresh: false } : x));
    flash('Refusée — transmise à un autre Tata');
  };

  const pending = list.filter(x => x.state === 'pending').length;
  const accepted = list.filter(x => x.state === 'accepted').length;
  const gains = list
    .filter(x => x.state === 'accepted')
    .reduce((s, x) => s + Number(x.part.replace(/\s/g, '')), 0);

  return (
    <div className="relative flex h-full flex-col bg-yb-green-deep">
      <StatusBar dark />
      <YHeader title="Demandes en direct" sub="Modou · Tata DK-4821-AB · Ligne 27 · En service" dark
        action={
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7FD4A8] animate-yb-pulse-dot" /> EN DIRECT
          </span>
        } />
      <div className="grid grid-cols-3 gap-2 px-4 pb-4">
        {[
          { v: String(pending), l: 'en attente', c: 'text-yb-amber' },
          { v: String(accepted), l: 'acceptées', c: 'text-[#7FD4A8]' },
          { v: `${fmt(gains)} F`, l: 'gains acceptés', c: 'text-white' },
        ].map(k => (
          <div key={k.l} className="rounded-2xl bg-white/10 p-2.5 text-center backdrop-blur">
            <div className={cx('text-[15px] font-black leading-none', k.c)}>{k.v}</div>
            <div className="mt-1 text-[9.5px] font-bold text-white/60">{k.l}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto yb-scroll rounded-t-3xl bg-yb-cream px-4 pb-8 pt-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="text-[14px] font-bold text-yb-ink">Demandes proche de votre ligne</span>
          <span className="text-[11px] font-bold text-yb-green">Répondez en 5 s</span>
        </div>
        <div className="space-y-3">
          {list.map(d => (
            <DemandCard key={d.id} d={d} onAccept={() => accept(d.id)} onRefuse={() => refuse(d.id)} />
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-yb-line bg-white p-3.5 text-center">
          <div className="text-[11px] font-bold text-yb-ink">Vous ne voyez que l’utile</div>
          <div className="mt-0.5 text-[10.5px] leading-relaxed text-yb-slate">
            Départs à ≤ 2 km de votre itinéraire Ligne 27 · sans réponse, la demande est transmise automatiquement après 60 s
          </div>
        </div>
      </div>
      {toast && (
        <YToast tone={toast.startsWith('Acceptée') ? 'green' : 'amber'}>{toast}</YToast>
      )}
    </div>
  );
}

/* ---------- E3 · Vérification colis ---------- */
export function RecScanScr() {
  const [checks, setChecks] = React.useState<boolean[]>([true, false]);
  const allOk = checks.every(Boolean);
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="Colis 5831" sub="Scan · Keur Massar → Ouakam" back />
      <div className="flex-1 space-y-3.5 overflow-y-auto yb-scroll px-4 pb-6 pt-1">
        <YCard pad={false} className="overflow-hidden">
          <div className="relative flex h-40 items-center justify-center bg-yb-green-deep">
            <Package className="h-12 w-12 text-yb-amber" />
            <div className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">Photo au chargement · 09:38</div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 p-4">
            <YRow label="Type" value="Sac / Tissus" />
            <YRow label="Poids" value="4 kg" />
            <YRow label="Destinataire" value="Awa Diop" />
            <YRow label="Options" value="Fragile" />
            <YRow label="Valeur" value="25 000 FCFA" />
            <YRow label="Point d’arrivée" value="Boutique Awa" />
          </div>
        </YCard>
        <YCard>
          <div className="text-[13px] font-bold">Contrôles avant remise</div>
          <div className="mt-3 space-y-2.5">
            {[
              'Emballage intact, aucune trace d’ouverture',
              'Destinataire présent et identifié',
            ].map((c, i) => (
              <button key={i} onClick={() => setChecks(prev => prev.map((v, j) => j === i ? !v : v))} className="flex w-full items-center gap-3 rounded-xl border border-yb-line bg-white p-3 text-left">
                <span className={cx('flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-colors', checks[i] ? 'border-yb-green bg-yb-green' : 'border-yb-line')}>
                  {checks[i] && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3.5} />}
                </span>
                <span className="text-[12px] font-semibold">{c}</span>
              </button>
            ))}
          </div>
        </YCard>
        <div className={cx('flex items-center gap-2.5 rounded-xl p-3 transition-colors', allOk ? 'bg-yb-green-soft' : 'bg-yb-amber-soft')}>
          {allOk
            ? <><Check className="h-4.5 w-4.5 text-yb-green" /><span className="text-[11.5px] font-semibold text-yb-green">Contrôles OK — vous pouvez saisir le code de retrait.</span></>
            : <><AlertCircle className="h-4.5 w-4.5 text-yb-amber-deep" /><span className="text-[11.5px] font-semibold text-yb-amber-deep">Complétez les 2 contrôles pour débloquer la saisie du code.</span></>}
        </div>
      </div>
      <div className="border-t border-yb-line bg-white px-4 py-3">
        <YBtn full size="lg" disabled={!allOk} icon={<ScanLine className="h-4 w-4" />}>Saisir le code de retrait</YBtn>
      </div>
    </div>
  );
}

/* ---------- E4 · Saisie du code (INTERACTIF 5831) ---------- */
export function RecCodeScr() {
  const CODE = '5831';
  const [entered, setEntered] = React.useState('');
  const [error, setError] = React.useState(false);
  const unlock = entered.length === 4 && entered === CODE;

  const press = (d: string) => {
    setError(false);
    setEntered(v => (v.length < 4 ? v + d : v));
  };
  const back = () => {
    setError(false);
    setEntered(v => v.slice(0, -1));
  };

  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="Code de retrait" sub="Colis 5831 · Awa Diop" back />
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-yb-slate">Le client présente ce code</div>
        <div className="mt-3">
          <YCodeInput filled={entered.length} />
        </div>
        {error && <div className="mt-2 text-[11.5px] font-bold text-yb-red">Code incorrect — demandez au client de vérifier</div>}
        {entered.length === 4 && !unlock && (
          <button onClick={() => { setError(true); setEntered(''); }} className="mt-3 rounded-full border border-yb-red/30 bg-yb-red-soft px-3 py-1.5 text-[11px] font-bold text-yb-red">
            Code refusé · Réessayer
          </button>
        )}
        <div className="mt-7 grid w-full max-w-[260px] grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
            <button key={d} onClick={() => press(d)} className="flex h-16 items-center justify-center rounded-2xl border border-yb-line bg-white text-[22px] font-black text-yb-ink transition-all active:scale-95 active:bg-yb-green-soft">
              {d}
            </button>
          ))}
          <button onClick={back} className="flex h-16 items-center justify-center rounded-2xl border border-yb-line bg-white transition-all active:scale-95"><Delete className="h-6 w-6 text-yb-slate" /></button>
          <button onClick={() => press('0')} className="flex h-16 items-center justify-center rounded-2xl border border-yb-line bg-white text-[22px] font-black text-yb-ink transition-all active:scale-95 active:bg-yb-green-soft">0</button>
          <button className="flex h-16 items-center justify-center rounded-2xl bg-yb-green-soft text-yb-green"><QrCode className="h-6 w-6" /></button>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-[10.5px] text-yb-slate">
          <QrCode className="h-3.5 w-3.5" /> Le client peut aussi présenter son QR Yoobanté
        </div>
      </div>
      <div className="border-t border-yb-line bg-white px-4 py-3">
        <YBtn full size="lg" variant={unlock ? 'primary' : 'outline'} disabled={!unlock}>
          {unlock ? 'Valider la remise du colis' : 'Entrez les 4 chiffres…'}
        </YBtn>
      </div>
    </div>
  );
}

/* ---------- E5 · Remise (photo + signature) ---------- */
export function RecHandoverScr() {
  const [photo, setPhoto] = React.useState(false);
  const [signed, setSigned] = React.useState(false);
  const ready = photo && signed;
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="Remise du colis" sub="5831 validé · Awa Diop" back />
      <div className="flex-1 space-y-3.5 overflow-y-auto yb-scroll px-4 pb-6 pt-1">
        <button onClick={() => setPhoto(true)} className={cx('flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-5 transition-colors', photo ? 'border-yb-green bg-yb-green-soft' : 'border-yb-line bg-white')}>
          {photo
            ? <><div className="flex h-12 w-12 items-center justify-center rounded-full bg-yb-green text-white"><Check className="h-6 w-6" strokeWidth={3} /></div><span className="text-[12px] font-bold text-yb-green">Photo prise · 11:42</span></>
            : <><Camera className="h-8 w-8 text-yb-slate" /><span className="text-[12.5px] font-bold text-yb-ink">Photographier le colis remis</span><span className="text-[10.5px] text-yb-slate">Obligatoire — preuve horodatée</span></>}
        </button>
        <YCard pad={false} className="overflow-hidden">
          <div className="border-b border-yb-line bg-yb-muted/60 px-4 py-2 text-[11px] font-bold text-yb-slate">SIGNATURE DU DESTINATAIRE</div>
          <div className="relative h-40 bg-white">
            {!signed ? (
              <div className="flex h-full flex-col items-center justify-center gap-1.5">
                <PenLine className="h-6 w-6 text-yb-slate/50" />
                <span className="text-[11px] text-yb-slate">Demandez à Awa de signer ici</span>
              </div>
            ) : (
              <svg viewBox="0 0 300 120" className="h-full w-full">
                <line x1="20" y1="95" x2="280" y2="95" stroke="#E5E9E6" strokeWidth="1.5" />
                <path d="M30 80 Q 55 20 80 65 T 130 55 Q 150 30 170 70 T 225 60 Q 245 45 265 75" fill="none" stroke="#084C41" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
            <div className="absolute bottom-2 left-4 text-[9px] font-semibold uppercase tracking-widest text-yb-slate/60">Awa Diop · 13 avril 2026</div>
          </div>
        </YCard>
        <button onClick={() => setSigned(true)} className="w-full rounded-xl bg-yb-muted py-2.5 text-[11.5px] font-bold text-yb-slate transition-colors active:bg-yb-line">
          {signed ? 'Effacer la signature' : 'Capturer la signature au doigt'}
        </button>
        <div className="rounded-2xl border border-yb-line bg-white p-4">
          <YRow label="Colis" value="Sac tissus · 4 kg · intact" />
          <YRow label="Code vérifié" value="5831 ✔" bold tone="green" />
          <YRow label="Heure" value="11:42" />
          <YRow label="Notification" value="SMS + push (client & expéditeur)" />
        </div>
      </div>
      <div className="border-t border-yb-line bg-white px-4 py-3">
        <YBtn full size="lg" disabled={!ready}>Terminer la remise</YBtn>
      </div>
    </div>
  );
}

/* ---------- E6 · Revenus ---------- */
export function RecEarningsScr() {
  const days = [
    { d: 'L', v: 3400 }, { d: 'M', v: 2800 }, { d: 'M', v: 4100 }, { d: 'J', v: 2200 },
    { d: 'V', v: 4600 }, { d: 'S', v: 5200 }, { d: 'D', v: 1800 },
  ];
  const max = Math.max(...days.map(x => x.v));
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="Mes revenus" sub="Receveur · Ligne 27" back />
      <div className="flex-1 space-y-3.5 overflow-y-auto yb-scroll px-4 pb-6 pt-1">
        <div className="rounded-3xl bg-yb-green-deep p-5 text-white">
          <div className="text-[11px] font-bold text-white/60">SOLDE DISPONIBLE</div>
          <div className="mt-1 text-[34px] font-black leading-none">34 800 <span className="text-[15px] font-bold text-white/60">FCFA</span></div>
          <div className="mt-2 flex items-center gap-1.5 text-[11.5px] font-bold text-yb-amber">
            <TrendingUp className="h-3.5 w-3.5" /> +18% vs semaine dernière
          </div>
          <YBtn variant="amber" size="sm" className="mt-4" icon={<Wallet className="h-3.5 w-3.5" />}>Retirer sur Wave</YBtn>
        </div>
        <YCard>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold">7 derniers jours</span>
            <span className="text-[12px] font-black text-yb-green">24 100 F</span>
          </div>
          <div className="mt-4 flex h-28 items-end justify-between gap-2">
            {days.map((x, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="w-full rounded-t-md bg-yb-green" style={{ height: `${(x.v / max) * 88}px`, opacity: i === 5 ? 1 : 0.55 }} />
                <span className="text-[9px] font-bold text-yb-slate">{x.d}</span>
              </div>
            ))}
          </div>
        </YCard>
        <YCard>
          <div className="text-[13px] font-bold">Détail du jour · 6 colis</div>
          <div className="mt-2">
            <YRow label="Commissions colis (6 × ~400 F)" value="2 400 FCFA" />
            <YRow label="Bonus ponctualité" value="500 FCFA" tone="green" />
            <YRow label="Commission plateforme (15%)" value="−510 FCFA" tone="red" />
            <div className="mt-1.5 border-t border-dashed border-yb-line pt-1.5">
              <YRow label="Net aujourd’hui" value="2 390 FCFA" bold />
            </div>
          </div>
        </YCard>
        <div className="flex items-center justify-between rounded-2xl border border-yb-line bg-white p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yb-blue-soft text-yb-blue"><Wallet className="h-4.5 w-4.5" /></div>
            <div>
              <div className="text-[12px] font-bold">Payout Wave automatique</div>
              <div className="text-[10.5px] text-yb-slate">Chaque samedi · +77 123 45 67</div>
            </div>
          </div>
          <YBadge tone="blue">Actif</YBadge>
        </div>
      </div>
    </div>
  );
}

/* ---------- E7 · Profil receveur ---------- */
export function RecProfileScr() {
  const docs = [
    { t: 'Pièce d’identité (CNI)', s: 'Vérifié', exp: 'Expire 08/2029', tone: 'green' },
    { t: 'Permis de conduire B', s: 'Vérifié', exp: 'Expire 03/2027', tone: 'green' },
    { t: 'Carte grise Tata', s: 'Vérifié', exp: 'Expire dans 12 j', tone: 'amber' },
  ] as const;
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="Profil Receveur" sub="Modou Gueye · +221 77 123 45 67" back />
      <div className="flex-1 space-y-3.5 overflow-y-auto yb-scroll px-4 pb-6 pt-1">
        <YCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yb-green text-[20px] font-black text-white">MG</div>
          <div className="mt-2.5 flex items-center justify-center gap-1.5">
            <span className="text-[16px] font-black">Modou Gueye</span>
            <span className="flex items-center gap-1 rounded-full bg-yb-green-soft px-2 py-0.5 text-[9px] font-black text-yb-green"><BadgeCheck className="h-3 w-3" /> VÉRIFIÉ</span>
          </div>
          <div className="mt-1 text-[11px] text-yb-slate">Partenaire depuis mars 2025 · 412 voyages</div>
          <div className="mt-3 grid grid-cols-3 divide-x divide-yb-line rounded-2xl bg-yb-muted/60 py-3">
            {[
              { v: '4,9', l: 'Note' },
              { v: '98%', l: 'Livré à l’heure' },
              { v: '187', l: 'Clients réguliers' },
            ].map(s => (
              <div key={s.l}>
                <div className="text-[15px] font-black text-yb-green">{s.v}</div>
                <div className="text-[9.5px] font-semibold text-yb-slate">{s.l}</div>
              </div>
            ))}
          </div>
        </YCard>
        <div className="rounded-2xl border border-yb-line bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yb-amber-soft text-yb-amber-deep"><Truck className="h-6 w-6" /></div>
            <div className="flex-1">
              <div className="text-[13px] font-bold">Tata bleu · Ligne 27</div>
              <div className="text-[11px] text-yb-slate">Plaque DK-4821-AB · 18 places</div>
              <div className="text-[11px] text-yb-slate">Capacité colis : 14 sacs standards</div>
            </div>
            <ChevronRight className="h-4 w-4 text-yb-slate" />
          </div>
        </div>
        <div>
          <div className="mb-2 px-1 text-[12px] font-bold text-yb-ink">Documents</div>
          <div className="space-y-2">
            {docs.map(d => (
              <div key={d.t} className="flex items-center gap-3 rounded-2xl border border-yb-line bg-white p-3.5">
                <div className={cx('flex h-9 w-9 items-center justify-center rounded-xl',
                  d.tone === 'green' ? 'bg-yb-green-soft text-yb-green' : 'bg-yb-amber-soft text-yb-amber-deep')}>
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1">
                  <div className="text-[12.5px] font-bold">{d.t}</div>
                  <div className="text-[10.5px] text-yb-slate">{d.exp}</div>
                </div>
                <YBadge tone={d.tone === 'green' ? 'green' : 'amber'}>{d.s}</YBadge>
              </div>
            ))}
          </div>
        </div>
        <YCard className="flex items-center justify-between bg-yb-green-soft border-yb-green/20">
          <div>
            <div className="text-[12.5px] font-bold text-yb-green">Formation code de retrait</div>
            <div className="text-[10.5px] text-yb-green/70">Réviser les bonnes pratiques · 4 min</div>
          </div>
          <YBtn size="sm" variant="primary">Ouvrir</YBtn>
        </YCard>
        <YBtn variant="outline" full size="md">Contacter le support partenaires</YBtn>
      </div>
    </div>
  );
}
