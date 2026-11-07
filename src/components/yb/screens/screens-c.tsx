'use client';

/* ============================================================
   YOOBANTÉ — Groupe C : Suivi en direct (C1–C5)
   ============================================================ */
import * as React from 'react';
import {
  StatusBar, YHeader, YBtn, YCard, YBadge, YRow, YTimeline, YTabs, YSheet,
  MapMock, HistoryRow, ActionPair, StarRating, YBottomNav, YInput, cx, YbLogo,
} from '@/components/yb/ui';
import {
  Phone, MessageCircle, Search, Bell, Package, Camera, FileText, AlertTriangle,
  ChevronDown, ChevronRight, Check, Clock, MapPin, Route, Send, Star, KeyRound,
} from 'lucide-react';

/* ---------- C1 · Suivi temps réel ---------- */
export function TrackLiveScr() {
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="YB-4821 · En route" sub="Keur Massar → Pikine" back
        action={<div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white border border-yb-line">
          <Bell className="h-4 w-4 text-yb-ink" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-yb-red" />
        </div>} />
      <MapMock
        className="h-[300px] shrink-0"
        markers={[{ x: 70, y: 220, kind: 'pickup' }, { x: 330, y: 110, kind: 'drop', pulse: true }, { x: 210, y: 90, kind: 'tata' }]}
        route="M70 220 Q 170 170 210 90 T 330 110"
        radar={{ x: 210, y: 90 }}
      />
      <div className="relative -mt-5 flex-1 overflow-y-auto yb-scroll rounded-t-3xl bg-yb-cream pb-6">
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-yb-line" />
        <div className="flex items-center justify-between px-4 pt-3">
          <div>
            <div className="text-[15px] font-black text-yb-ink">Arrivée dans 22 min</div>
            <div className="text-[11px] text-yb-slate">N1 · trafic fluide · prochain arrêt Guédiawaye</div>
          </div>
          <YBadge tone="amber">En route</YBadge>
        </div>
        <div className="px-4 pt-4">
          <YTimeline steps={[
            { label: 'Colis déposé au point relais Keur Massar', time: '09:12', state: 'done' },
            { label: 'Chargé dans le Tata de Moussa Sow', time: '09:38', state: 'done' },
            { label: 'En route vers Pikine — Rond-point', time: 'ETA 10:26', state: 'active' },
            { label: 'Retrait par Awa Diop avec code 5831', time: '—', state: 'todo' },
          ]} />
        </div>
        <div className="mx-4 rounded-2xl border border-yb-line bg-white p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yb-green text-[12px] font-bold text-white">MS</div>
            <div className="flex-1">
              <div className="text-[13px] font-bold">Moussa Sow</div>
              <div className="flex items-center gap-1 text-[11px] text-yb-slate"><Star className="h-3 w-3 fill-yb-amber text-yb-amber" /> 4,9 · Tata DK-4821-AB · Ligne 27</div>
            </div>
            <ActionPair />
          </div>
        </div>
        <div className="mt-3 flex gap-2 px-4">
          <YBtn variant="outline" size="sm" full icon={<Camera className="h-3.5 w-3.5" />}>Photo de remise</YBtn>
          <YBtn variant="outline" size="sm" full icon={<AlertTriangle className="h-3.5 w-3.5" />}>Signaler</YBtn>
        </div>
      </div>
    </div>
  );
}

/* ---------- C2 · Détails colis ---------- */
export function TrackDetailScr() {
  const proofs = ['🖼️', '📦', '🧾'];
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="Détails du colis" sub="YB-4821 · 6 kg · Sac / Tissus" back />
      <div className="flex-1 space-y-3 overflow-y-auto yb-scroll px-4 pb-6 pt-1">
        <YCard className="flex items-center justify-between">
          <div>
            <YBadge tone="amber">En route</YBadge>
            <div className="mt-2 text-[15px] font-black">Keur Massar → Pikine</div>
            <div className="text-[11px] text-yb-slate">Créé le 12 avril 2026 · 09:05</div>
          </div>
          <MapPin className="h-8 w-8 text-yb-green/30" />
        </YCard>
        <YCard>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold">Colis</span>
            <ChevronDown className="h-4 w-4 text-yb-slate" />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-4">
            <YRow label="Type" value="Sac / Tissus" />
            <YRow label="Poids" value="6 kg" />
            <YRow label="Dimensions" value="40 × 30 × 20 cm" />
            <YRow label="Options" value="Fragile + Assurance" />
            <YRow label="Description" value="2 pagnes wax, basins" />
            <YRow label="Valeur déclarée" value="25 000 FCFA" />
          </div>
        </YCard>
        <YCard>
          <div className="text-[13px] font-bold">Trajet</div>
          <div className="mt-2">
            <YRow label="Départ" value="Marché Keur Massar, Villa 42" />
            <YRow label="Arrivée" value="Rond-point Pikine, Boutique Awa" />
            <YRow label="Distance" value="11,4 km via N1" />
            <YRow label="Receveur" value="Modou Gueye · DK-4821-AB" />
          </div>
        </YCard>
        <YCard>
          <div className="text-[13px] font-bold">Paiement</div>
          <div className="mt-2">
            <YRow label="Total" value="1 900 FCFA" bold />
            <YRow label="Méthode" value="Wave · Transaction #WV-8842" />
            <YRow label="Reçu" value="Envoyé par SMS" tone="green" />
          </div>
        </YCard>
        <YCard>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold">Preuves de remise</span>
            <span className="text-[11px] font-semibold text-yb-slate">2 éléments</span>
          </div>
          <div className="mt-2.5 flex gap-2">
            {proofs.map((p, i) => (
              <div key={i} className="flex h-14 w-14 items-center justify-center rounded-xl bg-yb-muted text-[20px]">{p}</div>
            ))}
            <div className="flex h-14 flex-1 items-center justify-center rounded-xl border-2 border-dashed border-yb-line text-[10px] font-semibold text-yb-slate">Photo à la remise</div>
          </div>
        </YCard>
        <YBtn variant="outline" full size="md" icon={<AlertTriangle className="h-4 w-4 text-yb-red" />}>
          <span className="text-yb-red">Ouvrir un litige</span>
        </YBtn>
      </div>
    </div>
  );
}

/* ---------- C3 · Chat ---------- */
export function ChatScr() {
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <div className="flex items-center gap-3 border-b border-yb-line bg-white px-4 pb-3 pt-2">
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-yb-muted"><ChevronRight className="h-5 w-5 rotate-180 text-yb-ink" /></button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yb-green text-[12px] font-bold text-white">MS</div>
        <div className="flex-1">
          <div className="text-[14px] font-bold">Moussa Sow</div>
          <div className="flex items-center gap-1 text-[10.5px] text-yb-green"><span className="h-1.5 w-1.5 rounded-full bg-yb-green animate-yb-pulse-dot" /> En ligne · Tata ligne 27</div>
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-yb-green-soft"><Phone className="h-4 w-4 text-yb-green" /></button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto yb-scroll px-4 py-4">
        <div className="text-center"><span className="rounded-full bg-yb-muted px-3 py-1 text-[10px] font-semibold text-yb-slate">Aujourd’hui · 09:41</span></div>
        <div className="flex gap-2">
          <div className="max-w-[75%] rounded-2xl rounded-bl-md border border-yb-line bg-white p-3 text-[12.5px] leading-relaxed">Waaw Fatou ! Le colis est bien chargé, on part maintenant 🚐</div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[75%] rounded-2xl rounded-br-md bg-yb-green p-3 text-[12.5px] leading-relaxed text-white">Parfait ! Vous arrivez vers quelle heure à Pikine ?</div>
        </div>
        <div className="flex gap-2">
          <div className="max-w-[75%] rounded-2xl rounded-bl-md border border-yb-line bg-white p-3 text-[12.5px] leading-relaxed">Vers 10h30 incha Allah. Awa doit montrer le code 5831 à la boutique ✅</div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[75%] rounded-2xl rounded-br-md bg-yb-green p-3 text-[12.5px] leading-relaxed text-white">Oui c’est noté. Je préviens Awa tout de suite 🙏</div>
        </div>
        <div className="flex items-center justify-end gap-1 text-[9px] text-yb-slate">Lu 09:43 <Check className="h-3 w-3 text-yb-green" /></div>
      </div>
      <div className="px-4 pb-2">
        <div className="mb-2 flex gap-1.5 overflow-x-auto yb-scroll">
          {['Je suis en route', 'Arrivé au point', 'Un retard de 10 min', 'Colis bien remis ?'].map(q => (
            <span key={q} className="shrink-0 rounded-full border border-yb-green/30 bg-yb-green-soft px-3 py-1.5 text-[11px] font-semibold text-yb-green">{q}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-yb-line bg-white px-4 py-2.5">
          <input placeholder="Écrivez votre message…" className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-yb-slate/60" />
          <Send className="h-4 w-4 text-yb-green" />
        </div>
      </div>
    </div>
  );
}

/* ---------- C4 · Notifications ---------- */
export function NotificationsScr() {
  const today = [
    { icon: <Package className="h-4.5 w-4.5" />, t: 'Votre colis est en route', d: 'YB-4821 · Tata de Moussa Sow · ETA 10:26', time: '09:38', unread: true, tone: 'amber' },
    { icon: <Check className="h-4.5 w-4.5" />, t: 'Paiement Wave confirmé', d: '1 900 FCFA · Transaction #WV-8842', time: '09:12', unread: true, tone: 'green' },
    { icon: <MapPin className="h-4.5 w-4.5" />, t: 'Colis déposé au point relais', d: 'Marché Keur Massar, Villa 42', time: '09:05', unread: true, tone: 'green' },
  ];
  const yesterday = [
    { icon: <KeyRoundIcon />, t: 'Colis YB-4776 prêt pour retrait', d: 'Boutique Awa · Ouakam · code 5831', time: '18:20', unread: false, tone: 'blue' },
    { icon: <StarIcon />, t: 'Notez votre dernier voyage', d: 'Tata Cheikh Diop · Keur Massar → Guédiawaye', time: '16:02', unread: false, tone: 'amber' },
  ];
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="Notifications" sub="3 non lues" back action={<button className="text-[11px] font-bold text-yb-green">Tout marquer lu</button>} />
      <div className="flex-1 space-y-4 overflow-y-auto yb-scroll px-4 pb-6 pt-1">
        <div>
          <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-yb-slate">Aujourd’hui</div>
          <div className="space-y-2">
            {today.map((n, i) => (
              <div key={i} className={cx('flex items-start gap-3 rounded-2xl border bg-white p-3.5', n.unread ? 'border-yb-green/30' : 'border-yb-line opacity-60')}>
                <div className="relative mt-0.5 shrink-0">
                  <div className={cx('flex h-9 w-9 items-center justify-center rounded-xl',
                    n.tone === 'amber' ? 'bg-yb-amber-soft text-yb-amber-deep' : 'bg-yb-green-soft text-yb-green')}>{n.icon}</div>
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-[5px] border border-yb-line bg-white shadow-sm">
                    <YbLogo h={11} />
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    {n.unread && <span className="h-2 w-2 rounded-full bg-yb-green" />}
                    <span className={cx('text-[12.5px]', n.unread ? 'font-bold' : 'font-semibold')}>{n.t}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] leading-snug text-yb-slate">{n.d}</div>
                </div>
                <span className="text-[10px] font-semibold text-yb-slate">{n.time}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-yb-slate">Hier</div>
          <div className="space-y-2">
            {yesterday.map((n, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl border border-yb-line bg-white p-3.5 opacity-60">
                <div className="relative mt-0.5 shrink-0">
                  <div className={cx('flex h-9 w-9 items-center justify-center rounded-xl',
                    n.tone === 'amber' ? 'bg-yb-amber-soft text-yb-amber-deep' : 'bg-yb-blue-soft text-yb-blue')}>{n.icon}</div>
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-[5px] border border-yb-line bg-white shadow-sm">
                    <YbLogo h={11} />
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-[12.5px] font-semibold">{n.t}</div>
                  <div className="mt-0.5 text-[11px] leading-snug text-yb-slate">{n.d}</div>
                </div>
                <span className="text-[10px] font-semibold text-yb-slate">{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <YBottomNav active={2} />
    </div>
  );
}
function KeyRoundIcon() { return <KeyRound className="h-4.5 w-4.5" />; }
function StarIcon() { return <Star className="h-4.5 w-4.5" />; }

/* ---------- C5 · Historique ---------- */
export function HistoryScr() {
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="Mes envois" sub="12 colis transportés" back />
      <div className="px-4 pb-3">
        <YInput placeholder="Rechercher un code (YB-…)" trailing={<Search className="h-4 w-4 text-yb-slate" />} />
      </div>
      <div className="px-4 pb-3">
        <YTabs tabs={['En cours (2)', 'Terminés (10)', 'Litiges (0)']} active={0} />
      </div>
      <div className="flex-1 space-y-2.5 overflow-y-auto yb-scroll px-4 pb-24">
        <HistoryRow code="YB-4821" route="Keur Massar → Pikine" date="En route · ETA 10:26" price="1 900 F" tone="amber" />
        <HistoryRow code="YB-4776" route="Parcelles Assainies → Ouakam" date="Prêt au retrait · Boutique Awa" price="1 400 F" tone="amber" />
        <div className="pt-2 text-[11px] font-bold uppercase tracking-wide text-yb-slate">Terminés</div>
        <HistoryRow code="YB-4611" route="Keur Massar → Guédiawaye" date="Livré le 10 avril · 11:24" price="1 200 F" tone="green" />
        <HistoryRow code="YB-4502" route="Pikine → Ouakam" date="Livré le 8 avril · 14:02" price="1 600 F" tone="green" />
        <HistoryRow code="YB-4488" route="Keur Massar → Parcelles" date="Livré le 6 avril · 09:47" price="900 F" tone="green" />
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-yb-green-soft p-4">
          <div>
            <div className="text-[11px] font-bold text-yb-green">Économies réalisées</div>
            <div className="text-[11px] text-yb-green/70">vs coursier classique</div>
          </div>
          <div className="text-[20px] font-black text-yb-green">9 800 F</div>
        </div>
      </div>
      <YBottomNav active={2} />
    </div>
  );
}
