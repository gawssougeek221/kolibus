'use client';

/* ============================================================
   YOOBANTÉ — Groupe D : Retrait (D1–D4)
   ============================================================ */
import * as React from 'react';
import {
  StatusBar, YHeader, YBtn, YCard, YBadge, YRow, StarRating, MapMock, cx, YbLogo,
} from '@/components/yb/ui';
import {
  MapPin, Clock, KeyRound, Sun, Package, Check, Camera, ShieldCheck, AlertTriangle, User,
} from 'lucide-react';

/* ---------- D1 · Arrivée au relais ---------- */
export function PickupArriveScr() {
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="YB-4776" sub="Parcelles Assainies → Ouakam" back />
      <div className="relative">
        <div className="bg-yb-amber px-4 py-2.5 text-center text-[12px] font-black uppercase tracking-wide text-yb-green-deep">
          Prêt pour retrait depuis 18:20
        </div>
      </div>
      <div className="flex-1 space-y-3.5 overflow-y-auto yb-scroll px-4 pb-6 pt-4">
        <YCard>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yb-green-soft text-yb-green"><MapPin className="h-5 w-5" /></div>
            <div>
              <div className="text-[13.5px] font-bold">Boutique Awa · Ouakam</div>
              <div className="text-[11.5px] leading-snug text-yb-slate">Rond-point Ouakam, à côté de la pharmacie Ndar — repère jaune Yoobanté</div>
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-yb-green"><Clock className="h-3.5 w-3.5" /> Ouvert 8h – 20h</div>
            </div>
          </div>
        </YCard>
        <MapMock className="h-36 rounded-2xl" markers={[{ x: 200, y: 150, kind: 'drop', pulse: true }]} radar={{ x: 200, y: 150 }} />
        <YCard>
          <div className="text-[13px] font-bold">Pour récupérer le colis</div>
          <div className="mt-2.5 space-y-2.5">
            {[
              'Présentez votre code de retrait à 4 chiffres',
              'Le receveur vérifie et photographie la remise',
              'Vérifiez le colis avant de partir',
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-yb-green text-[10px] font-black text-white" style={{ height: 22, width: 22 }}>{i + 1}</span>
                <span className="text-[12px] text-yb-ink">{s}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-yb-blue-soft p-2.5">
            <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yb-blue" />
            <span className="text-[10.5px] leading-snug text-yb-blue">Astuce : une pièce d’identité peut être demandée si le receveur ne vous connaît pas.</span>
          </div>
        </YCard>
        <YCard className="flex items-center justify-between bg-yb-muted/60">
          <div>
            <div className="text-[11px] font-semibold text-yb-slate">Destinataire</div>
            <div className="text-[13.5px] font-bold">Awa Diop</div>
          </div>
          <YBtn variant="outline" size="sm">Transférer le code</YBtn>
        </YCard>
      </div>
      <div className="border-t border-yb-line bg-white px-4 py-3">
        <YBtn full size="lg" variant="amber" icon={<KeyRound className="h-4 w-4" />}>Voir mon code de retrait</YBtn>
      </div>
    </div>
  );
}

/* ---------- D2 · Code de retrait ---------- */
export function PickupCodeScr() {
  const [bright, setBright] = React.useState(false);
  return (
    <div className={cx('flex h-full flex-col transition-colors', bright ? 'bg-white' : 'bg-yb-cream')}>
      <StatusBar />
      <YHeader title="Code de retrait" sub="YB-4776 · Boutique Awa, Ouakam" back />
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <YCard className="w-full border-yb-green/30 text-center" pad>
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-yb-green-soft text-yb-green"><KeyRound className="h-5 w-5" /></div>
          <div className="mt-3 text-[11px] font-bold uppercase tracking-widest text-yb-slate">Présentez ce code au receveur</div>
          <div className="mt-2 text-[76px] font-black leading-none tracking-[0.14em] text-yb-ink">5831</div>
          <div className="mx-auto mt-3 h-0.5 w-16 rounded bg-yb-line" />
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[12px] font-bold text-yb-amber-deep">
            <Clock className="h-4 w-4" /> Valable encore 38 h
          </div>
          <div className="mt-1 text-[11px] text-yb-slate">Expire le 14 avril à 08:00</div>
        </YCard>
        <div className="mt-4 flex w-full items-center justify-between rounded-2xl border border-yb-line bg-white p-3.5">
          <div className="flex items-center gap-2.5">
            <Sun className="h-5 w-5 text-yb-amber-deep" />
            <div>
              <div className="text-[12px] font-bold">Mode plein soleil</div>
              <div className="text-[10.5px] text-yb-slate">Luminosité maximale + fond blanc</div>
            </div>
          </div>
          <button onClick={() => setBright(b => !b)} className={cx('relative h-6.5 w-11 rounded-full transition-colors', bright ? 'bg-yb-green' : 'bg-yb-line')} style={{ height: 26 }}>
            <span className={cx('absolute top-0.5 h-[22px] w-[22px] rounded-full bg-white shadow transition-all', bright ? 'left-[22px]' : 'left-0.5')} />
          </button>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-yb-muted p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-yb-green" />
          <span className="text-[10.5px] leading-snug text-yb-slate">Ne partagez ce code avec personne d’autre que le receveur Yoobanté. Il sera invalidé dès la remise.</span>
        </div>
      </div>
      <div className="border-t border-yb-line bg-white px-4 py-3">
        <YBtn full size="lg">C’est bon, j’ai récupéré mon colis</YBtn>
      </div>
    </div>
  );
}

/* ---------- D3 · Remise confirmée ---------- */
export function PickupConfirmScr() {
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="Remise confirmée" sub="YB-4776 · Terminé" back />
      <div className="flex-1 space-y-3.5 overflow-y-auto yb-scroll px-4 pb-6 pt-3">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yb-green text-white animate-yb-pop"><Check className="h-7 w-7" strokeWidth={3} /></div>
          <div className="text-[18px] font-black">Colis récupéré !</div>
          <div className="text-[12px] text-yb-slate">Retiré par Awa Diop à 11:42 — Boutique Awa, Ouakam</div>
        </div>
        <YCard className="p-0 overflow-hidden">
          <div className="relative flex h-44 items-center justify-center bg-yb-green-deep">
            <Package className="h-14 w-14 text-yb-amber" />
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
              <Camera className="h-3 w-3" /> Photo de remise
            </div>
            <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">11:42 · 13 avril</div>
          </div>
          <div className="p-4">
            <YRow label="Receveur" value="Modou Gueye · Vérifié" />
            <YRow label="Code vérifié" value="5831 ✔" bold tone="green" />
            <YRow label="Colis" value="Sac tissus · 4 kg · intact" />
            <YRow label="Signature" value="Capturée sur place" />
          </div>
        </YCard>
        <div className="flex items-start gap-2.5 rounded-2xl border border-yb-amber/40 bg-yb-amber-soft p-3.5">
          <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-yb-amber-deep" />
          <div>
            <div className="text-[12px] font-bold text-yb-amber-deep">Un problème ?</div>
            <div className="text-[11px] leading-snug text-yb-slate">Signalez un colis endommagé ou manquant sous 48h. L’assurance 25 000 FCFA couvre cet envoi.</div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5 pb-1 pt-2">
          <YbLogo h={34} />
          <div className="text-[10px] font-bold tracking-wide text-yb-slate">Réserver. Suivre. <span className="text-yb-amber-deep">Récupérer.</span></div>
        </div>
      </div>
      <div className="space-y-2 border-t border-yb-line bg-white px-4 py-3">
        <YBtn full size="lg" variant="amber">Noter le voyage</YBtn>
        <YBtn full variant="ghost" size="sm">Signaler un problème</YBtn>
      </div>
    </div>
  );
}

/* ---------- D4 · Notation ---------- */
export function RatingScr() {
  const [stars, setStars] = React.useState(5);
  const tags = stars <= 3
    ? ['Retard important', 'Colis abîmé', 'Receveur absent', 'Manque d’information']
    : ['Colis intact', 'Ponctuel', 'Sympathique', 'Emballage soigné'];
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="Noter le voyage" sub="YB-4776 · Keur Massar → Ouakam" back />
      <div className="flex flex-1 flex-col items-center overflow-y-auto yb-scroll px-6 pt-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yb-green text-[16px] font-black text-white">MS</div>
        <div className="mt-2.5 text-[16px] font-black">Moussa Sow</div>
        <div className="text-[11.5px] text-yb-slate">Tata DK-4821-AB · Ligne 27</div>
        <div className="mt-5 flex gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <button key={i} onClick={() => setStars(i)} className="transition-transform active:scale-90" style={{ transform: i <= stars ? 'scale(1.05)' : 'scale(0.95)' }}>
              <svg viewBox="0 0 24 24" className="h-11 w-11" fill={i <= stars ? '#F9A50A' : '#E5E9E6'} stroke={i <= stars ? '#C27B06' : '#E5E9E6'} strokeWidth="1.5">
                <path d="M12 2 L15 9 L22 9 L16.5 13.5 L19 21 L12 16.5 L5 21 L7.5 13.5 L2 9 L9 9 Z" />
              </svg>
            </button>
          ))}
        </div>
        <div className="mt-2 text-[13px] font-bold text-yb-ink">
          {stars === 5 ? 'Excellent !' : stars === 4 ? 'Très bien !' : stars === 3 ? 'Correct' : stars === 2 ? 'Décevant' : 'Problème sérieux'}
        </div>
        <div className="mt-6 w-full">
          <div className="mb-2 px-1 text-[12px] font-bold">Quoi souligner ? <span className="font-normal text-yb-slate">(facultatif)</span></div>
          <div className="flex flex-wrap gap-2">
            {tags.map(t => (
              <span key={t} className="rounded-full border border-yb-line bg-white px-3.5 py-2 text-[12px] font-semibold text-yb-ink">{t}</span>
            ))}
          </div>
        </div>
        {stars >= 4 && (
          <div className="mt-5 w-full rounded-2xl border border-yb-line bg-white p-4">
            <div className="text-[12.5px] font-bold">Pourboire pour Moussa</div>
            <div className="mt-2.5 flex justify-between gap-2">
              {['0 F', '200 F', '500 F', '1 000 F'].map((t, i) => (
                <span key={t} className={cx('flex-1 rounded-xl border py-2.5 text-center text-[12px] font-bold', i === 1 ? 'border-yb-green bg-yb-green-soft text-yb-green' : 'border-yb-line text-yb-slate')}>{t}</span>
              ))}
            </div>
            <div className="mt-2 text-[10px] text-yb-slate">100% du pourboire va au receveur. Payé via Wave.</div>
          </div>
        )}
        <textarea placeholder="Un mot pour les autres expéditeurs… (facultatif)" className="mt-4 h-20 w-full resize-none rounded-2xl border border-yb-line bg-white p-3.5 text-[12.5px] outline-none placeholder:text-yb-slate/60" />
      </div>
      <div className="border-t border-yb-line bg-white px-4 py-3">
        <YBtn full size="lg">Envoyer mon avis</YBtn>
      </div>
    </div>
  );
}
