'use client';

/* ============================================================
   YOOBANTÉ — Groupe B : Envoi d’un colis (B1–B7)
   ============================================================ */
import * as React from 'react';
import {
  StatusBar, YHeader, YBtn, YCard, YInput, YBadge, YStepper, YRow, YToast,
  MapMock, DriverCard, YBottomNav, cx, YbLogo,
} from '@/components/yb/ui';
import {
  MapPin, Package, Clock, Shield, Star, ArrowUpDown, Plus, Minus,
  Wallet, Check, Info, Smartphone, Banknote, Copy, Share2, Zap, Boxes, Apple, Sparkles,
} from 'lucide-react';

/* ---------- B1 · Adresses ---------- */
export function SendAddrScr() {
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="Nouvel envoi" sub="Étape 1 sur 5 — Trajet" back />
      <YStepper step={0} total={5} />
      <div className="flex-1 space-y-4 overflow-y-auto yb-scroll px-4 pb-4 pt-4">
        <YCard className="relative">
          <div className="absolute left-[27px] top-[46px] h-[38px] w-0.5 border-l-2 border-dashed border-yb-green/40" />
          <div className="space-y-3">
            <YInput label="Départ — point relais" value="Marché Keur Massar, Villa 42" focus trailing={<MapPin className="h-4 w-4 text-yb-green" />} />
            <YInput label="Destination — point relais" value="Rond-point Pikine, Boutique Awa" trailing={<MapPin className="h-4 w-4 text-yb-red" />} />
          </div>
          <button className="absolute -right-0.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-yb-line bg-white shadow-sm">
            <ArrowUpDown className="h-4 w-4 text-yb-green" />
          </button>
        </YCard>
        <div className="flex flex-wrap gap-1.5">
          {['Marché Keur Massar', 'Pikine Rond-point', 'Guédiawaye Gare', 'Ouakam', 'Parcelles U26'].map(q => (
            <span key={q} className="rounded-full border border-yb-line bg-white px-2.5 py-1.5 text-[11px] font-semibold text-yb-slate">{q}</span>
          ))}
        </div>
        <div>
          <div className="mb-2 px-1 text-[12px] font-bold text-yb-ink">Aperçu du trajet</div>
          <MapMock className="h-40 rounded-2xl" markers={[{ x: 80, y: 210, kind: 'pickup', pulse: true }, { x: 320, y: 100, kind: 'drop', pulse: true }]} route="M80 210 Q 190 110 320 100" />
        </div>
        <div className="flex items-start gap-2 rounded-xl bg-yb-blue-soft p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-yb-blue" />
          <span className="text-[11px] leading-relaxed text-yb-blue">Distance estimée : 11,4 km via la N1. Points relais ouverts 8h–20h, receveur vérifié à chaque extrémité.</span>
        </div>
      </div>
      <div className="border-t border-yb-line bg-white px-4 py-3">
        <YBtn full size="lg">Continuer — 11,4 km</YBtn>
      </div>
    </div>
  );
}

/* ---------- B2 · Colis ---------- */
export function SendParcelScr() {
  const types = [
    { icon: <Boxes className="h-6 w-6" />, label: 'Sac / Tissus', ex: 'Wax, basins', tone: 'green' },
    { icon: <Smartphone className="h-6 w-6" />, label: 'Électronique', ex: 'Téléphone, radio', tone: 'blue' },
    { icon: <Apple className="h-6 w-6" />, label: 'Nourriture', ex: 'Mangues, poisson', tone: 'amber' },
  ] as const;
  const [sel, setSel] = React.useState(0);
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="Nouvel envoi" sub="Étape 2 sur 5 — Le colis" back />
      <YStepper step={1} total={5} />
      <div className="flex-1 space-y-4 overflow-y-auto yb-scroll px-4 pb-4 pt-4">
        <div>
          <div className="mb-2 px-1 text-[12px] font-bold text-yb-ink">Type de colis</div>
          <div className="grid grid-cols-3 gap-2">
            {types.map((t, i) => (
              <button key={t.label} onClick={() => setSel(i)} className={cx('flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-center transition-all', sel === i ? 'border-yb-green bg-yb-green-soft' : 'border-yb-line bg-white')}>
                <span className={sel === i ? 'text-yb-green' : 'text-yb-slate'}>{t.icon}</span>
                <span className="text-[11px] font-bold leading-tight">{t.label}</span>
                <span className="text-[9px] text-yb-slate">{t.ex}</span>
              </button>
            ))}
          </div>
        </div>
        <YCard>
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold">Poids estimé</span>
            <span className="text-[16px] font-black text-yb-green">6 kg</span>
          </div>
          <div className="relative mt-4">
            <div className="h-2 rounded-full bg-yb-line">
              <div className="h-2 w-[30%] rounded-full bg-yb-green" />
            </div>
            <div className="absolute left-[30%] -top-2.5 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-md border-2 border-yb-green">
              <span className="h-2 w-2 rounded-full bg-yb-green" />
            </div>
            <div className="mt-2.5 flex justify-between text-[10px] font-semibold text-yb-slate"><span>0</span><span>10</span><span>20</span><span>30 kg</span></div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { icon: <Minus className="h-4 w-4" />, l: '−2 kg' },
              { l: 'Définir à 5 kg' },
              { icon: <Plus className="h-4 w-4" />, l: '+2 kg' },
            ].map((b, i) => (
              <button key={i} className={cx('flex items-center justify-center gap-1 rounded-lg border border-yb-line py-2 text-[11px] font-bold', i === 1 ? 'text-yb-green' : 'text-yb-slate')}>{b.icon}{b.l}</button>
            ))}
          </div>
        </YCard>
        <YInput label="Description (facultatif)" placeholder="Ex : sac de riz fermé, 2 téléphones en chargeurs…" />
        <div className="flex items-center justify-between rounded-2xl border border-yb-amber/40 bg-yb-amber-soft p-3.5">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-yb-amber-deep" />
            <div>
              <div className="text-[12px] font-bold text-yb-amber-deep">Estimation immédiate</div>
              <div className="text-[11px] text-yb-slate">Base : 600 FCFA + 200 FCFA/kg au-delà de 5 kg</div>
            </div>
          </div>
          <div className="text-[15px] font-black text-yb-amber-deep">1 200 F</div>
        </div>
      </div>
      <div className="border-t border-yb-line bg-white px-4 py-3">
        <YBtn full size="lg">Continuer</YBtn>
      </div>
    </div>
  );
}

/* ---------- B3 · Options ---------- */
export function SendOptionsScr() {
  const opts = [
    { icon: <Shield className="h-5 w-5" />, t: 'Colis fragile', d: 'Emballage renforcé par le receveur', p: '+300 F', on: true },
    { icon: <Zap className="h-5 w-5" />, t: 'Express', d: 'Départ dans l’heure, priorité chargement', p: '+500 F', on: false },
    { icon: <Shield className="h-5 w-5" />, t: 'Assurance 25 000 F', d: 'Remboursement en cas de perte ou casse', p: '+400 F', on: true },
  ];
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="Nouvel envoi" sub="Étape 3 sur 5 — Options" back />
      <YStepper step={2} total={5} />
      <div className="flex-1 space-y-3 overflow-y-auto yb-scroll px-4 pb-4 pt-4">
        {opts.map(o => (
          <YCard key={o.t}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yb-green-soft text-yb-green">{o.icon}</div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold">{o.t}</div>
                <div className="text-[11px] leading-snug text-yb-slate">{o.d}</div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[11px] font-bold text-yb-amber-deep">{o.p}</span>
                <div className={cx('relative h-6.5 w-11 rounded-full transition-colors', o.on ? 'bg-yb-green' : 'bg-yb-line')} style={{ height: 26 }}>
                  <div className={cx('absolute top-0.5 h-[22px] w-[22px] rounded-full bg-white shadow transition-all', o.on ? 'left-[22px]' : 'left-0.5')} />
                </div>
              </div>
            </div>
          </YCard>
        ))}
        <YCard className="border-yb-green/30 bg-yb-green-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yb-green text-white"><Package className="h-5 w-5" /></div>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-yb-green">Photo à la remise</div>
              <div className="text-[11px] text-yb-green/70">Le receveur photographie chaque colis remis — inclus gratuitement</div>
            </div>
            <Check className="h-5 w-5 text-yb-green" strokeWidth={3} />
          </div>
        </YCard>
        <div className="rounded-2xl border border-yb-line bg-white p-4">
          <YRow label="Base trajet (11,4 km · 6 kg)" value="1 200 FCFA" />
          <YRow label="Fragile" value="+300 FCFA" />
          <YRow label="Assurance 25 000 F" value="+400 FCFA" />
          <div className="mt-2 border-t border-dashed border-yb-line pt-2">
            <YRow label="Total estimé" value="1 900 FCFA" bold tone="green" />
          </div>
        </div>
      </div>
      <div className="border-t border-yb-line bg-white px-4 py-3">
        <YBtn full size="lg">Voir les Tatas disponibles</YBtn>
      </div>
    </div>
  );
}

/* ---------- B4 · Choix du Tata ---------- */
export function SendTataScr() {
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="Nouvel envoi" sub="Étape 4 sur 5 — Votre Tata" back />
      <YStepper step={3} total={5} />
      <div className="flex-1 space-y-3 overflow-y-auto yb-scroll px-4 pb-4 pt-4">
        <div className="flex gap-1.5">
          {['Recommandé', 'Le moins cher', 'Le plus rapide'].map((c, i) => (
            <span key={c} className={cx('rounded-full px-3 py-1.5 text-[11px] font-bold', i === 0 ? 'bg-yb-green text-white' : 'border border-yb-line bg-white text-yb-slate')}>{c}</span>
          ))}
        </div>
        <div className="relative">
          <div className="absolute -left-1 top-4 bottom-4 w-1 rounded-full bg-yb-amber" />
          <DriverCard name="Moussa Sow" tata="Tata bleu — Ligne 27" rating={4.9} trips={412} plate="DK-4821-AB" price="1 900 F" eta="6 min" />
          <div className="mt-1.5 flex items-center justify-end">
            <span className="rounded-full bg-yb-amber px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-yb-green-deep">Le plus rapide</span>
          </div>
        </div>
        <DriverCard name="Ibrahima Fall" tata="Tata blanc — Ligne 12" rating={4.7} trips={286} plate="DK-1290-CD" price="1 700 F" eta="12 min" />
        <DriverCard name="Cheikh Diop" tata="Tata vert — Ligne 27" rating={4.8} trips={508} plate="DK-3305-EF" price="2 100 F" eta="9 min" />
        <div className="flex items-start gap-2 rounded-xl bg-yb-muted p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-yb-slate" />
          <span className="text-[11px] leading-relaxed text-yb-slate">Prix TTC : dont 15% de commission receveur (points relais départ et arrivée inclus). Aucun supplément à la remise.</span>
        </div>
      </div>
      <div className="border-t border-yb-line bg-white px-4 py-3">
        <YBtn full size="lg">Choisir Moussa — 1 900 FCFA</YBtn>
      </div>
    </div>
  );
}

/* ---------- B5 · Paiement ---------- */
export function SendPayScr() {
  const pays = [
    { icon: <Wallet className="h-5 w-5" />, t: 'Wave', d: 'Solde : 14 500 FCFA', badge: 'Populaire' },
    { icon: <Smartphone className="h-5 w-5" />, t: 'Orange Money', d: 'Solde : 8 200 FCFA' },
    { icon: <Smartphone className="h-5 w-5" />, t: 'Free Money', d: 'Solde : 3 100 FCFA' },
    { icon: <Banknote className="h-5 w-5" />, t: 'Espèces au point relais', d: 'Payer au dépôt du colis' },
  ];
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="Nouvel envoi" sub="Étape 5 sur 5 — Paiement" back />
      <YStepper step={4} total={5} />
      <div className="flex-1 space-y-3 overflow-y-auto yb-scroll px-4 pb-4 pt-4">
        <div className="space-y-2">
          {pays.map((p, i) => (
            <button key={p.t} className={cx('flex w-full items-center gap-3 rounded-2xl border-2 bg-white p-3.5 text-left transition-all', i === 0 ? 'border-yb-green ring-2 ring-yb-green/10' : 'border-yb-line')}>
              <div className={cx('flex h-10 w-10 items-center justify-center rounded-xl', i === 0 ? 'bg-yb-green text-white' : 'bg-yb-muted text-yb-slate')}>{p.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-[13px] font-bold">{p.t}
                  {p.badge && <span className="rounded-full bg-yb-amber px-2 py-0.5 text-[9px] font-black text-yb-green-deep">{p.badge}</span>}
                </div>
                <div className="text-[11px] text-yb-slate">{p.d}</div>
              </div>
              <div className={cx('flex h-5 w-5 items-center justify-center rounded-full border-2', i === 0 ? 'border-yb-green bg-yb-green' : 'border-yb-line')}>
                {i === 0 && <Check className="h-3 w-3 text-white" strokeWidth={3.5} />}
              </div>
            </button>
          ))}
        </div>
        <YCard className="bg-yb-amber-soft border-yb-amber/40">
          <div className="flex items-start gap-2.5">
            <KeyIcon />
            <div>
              <div className="text-[12px] font-bold text-yb-amber-deep">Votre code de retrait</div>
              <div className="mt-0.5 text-[11px] leading-relaxed text-yb-slate">Généré après paiement : <b className="text-yb-ink">4 chiffres</b> à donner au destinataire. Il l’affiche au receveur pour récupérer le colis à Pikine.</div>
            </div>
          </div>
        </YCard>
        <div className="rounded-2xl border border-yb-line bg-white p-4">
          <YRow label="Trajet + colis" value="1 200 FCFA" />
          <YRow label="Options (fragile + assurance)" value="700 FCFA" />
          <YRow label="Frais de service" value="0 FCFA" tone="green" />
          <div className="mt-2 border-t border-dashed border-yb-line pt-2">
            <YRow label="À payer maintenant" value="1 900 FCFA" bold tone="green" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-yb-slate">
          <Shield className="h-3.5 w-3.5 text-yb-green" /> Paiement chiffré · Remboursement garanti si non livré sous 48h
        </div>
      </div>
      <div className="border-t border-yb-line bg-white px-4 py-3">
        <YBtn full size="lg" icon={<Wallet className="h-4 w-4" />}>Payer 1 900 FCFA avec Wave</YBtn>
      </div>
    </div>
  );
}

function KeyIcon() {
  return <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yb-amber text-yb-green-deep"><Star className="h-4 w-4" /></div>;
}

/* ---------- B6 · Matching ---------- */
export function MatchingScr() {
  return (
    <div className="flex h-full flex-col bg-yb-green-deep text-white">
      <StatusBar dark />
      <YHeader title="Recherche d’un Tata…" sub="Keur Massar → Pikine · 6 kg" dark center />
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <div className="relative flex h-52 w-52 items-center justify-center">
          {[0, 1, 2].map(i => (
            <span key={i} className="absolute h-24 w-24 rounded-full border-2 border-yb-amber/60 animate-yb-ping" style={{ animationDelay: `${i * 0.55}s` }} />
          ))}
          <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-yb-amber text-yb-green-deep shadow-2xl animate-yb-breathe">
            <Package className="h-9 w-9" />
          </div>
        </div>
        <div className="text-center">
          <div className="text-[17px] font-black">3 Tatas sur le trajet…</div>
          <div className="mt-1 text-[12px] text-white/60">Ligne 27 · N1 · départ dans l’heure</div>
        </div>
        <div className="w-full space-y-2">
          {[
            { n: 'Ibrahima Fall', d: 'a accepté votre trajet', t: 'il y a 2s', ok: true },
            { n: 'Moussa Sow', d: 'a accepté votre trajet', t: 'il y a 1s', ok: true },
          ].map(c => (
            <div key={c.n} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 animate-yb-pop">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yb-green text-[10px] font-bold">{c.n.split(' ').map(x => x[0]).join('')}</div>
              <div className="flex-1">
                <div className="text-[12px] font-bold">{c.n}</div>
                <div className="text-[10.5px] text-white/60">{c.d}</div>
              </div>
              <Check className="h-4 w-4 text-yb-amber" strokeWidth={3} />
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 pb-9">
        <div className="mb-3 flex items-center justify-center gap-2 text-[11px] font-semibold text-white/60">
          <Clock className="h-3.5 w-3.5" /> Meilleure offre sélectionnée automatiquement dans 2,1 s
        </div>
        <button className="w-full rounded-xl border border-white/20 py-3 text-[13px] font-bold text-white/80">Annuler la recherche</button>
      </div>
    </div>
  );
}

/* ---------- B7 · Confirmé ---------- */
export function SendConfirmScr() {
  return (
    <div className="relative flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <div className="flex flex-col items-center gap-2 px-5 pt-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yb-green text-white shadow-lg animate-yb-pop">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>
        <div className="text-[20px] font-black text-yb-ink">Envoi confirmé !</div>
        <div className="text-[12px] text-yb-slate">YB-4821 · Keur Massar → Pikine</div>
      </div>
      <div className="flex-1 space-y-3.5 overflow-y-auto yb-scroll px-4 pb-4 pt-5">
        <YCard className="border-yb-amber/50 bg-white text-center">
          <div className="text-[11px] font-bold uppercase tracking-widest text-yb-slate">Code de retrait</div>
          <div className="mt-1 text-[44px] font-black leading-none tracking-[0.18em] text-yb-amber-deep">5831</div>
          <div className="mt-1.5 text-[11px] text-yb-slate">À transmettre à Awa Diop (destinataire) — valable 48h</div>
          <div className="mt-3 flex justify-center gap-2">
            <YBtn variant="outline" size="sm" icon={<Copy className="h-3.5 w-3.5" />}>Copier</YBtn>
            <YBtn variant="outline" size="sm" icon={<Share2 className="h-3.5 w-3.5" />}>Partager sur WhatsApp</YBtn>
          </div>
        </YCard>
        <YCard>
          <div className="text-[13px] font-bold">Votre receveur</div>
          <div className="mt-2.5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-yb-green text-[13px] font-bold text-white">MD</div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-[13px] font-bold">Modou Gueye
                <span className="flex items-center gap-0.5 rounded-full bg-yb-green-soft px-1.5 py-0.5 text-[9px] font-bold text-yb-green"><Check className="h-2.5 w-2.5" /> Vérifié</span>
              </div>
              <div className="text-[11px] text-yb-slate">Tata DK-4821-AB · 412 voyages · ★ 4,9</div>
            </div>
          </div>
          <div className="mt-3 rounded-xl bg-yb-muted p-3 text-[11px] leading-relaxed text-yb-slate">
            <b className="text-yb-ink">Point relais départ :</b> Marché Keur Massar, Villa 42 — ouvert 8h–20h. Déposez le colis avant 17h pour un départ aujourd’hui.
          </div>
        </YCard>
        <div className="rounded-2xl border border-yb-line bg-white p-4">
          <YRow label="Moussa Sow (Tata ligne 27)" value="1 900 FCFA" bold />
          <YRow label="Payé avec Wave" value="Transaction #WV-8842" />
          <YRow label="Photo de remise" value="Activée" tone="green" />
        </div>
        <div className="flex flex-col items-center gap-1.5 pb-1 pt-2">
          <YbLogo h={34} />
          <div className="text-[10px] font-bold tracking-wide text-yb-slate">Réserver. Suivre. <span className="text-yb-amber-deep">Récupérer.</span></div>
        </div>
      </div>
      <div className="space-y-2 border-t border-yb-line bg-white px-4 py-3">
        <YBtn full size="lg">Suivre mon colis en direct</YBtn>
        <YBtn full variant="ghost" size="sm">Retour à l’accueil</YBtn>
      </div>
      <YToast>Reçu envoyé par SMS à Fatou</YToast>
    </div>
  );
}
