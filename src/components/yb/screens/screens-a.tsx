'use client';

/* ============================================================
   YOOBANTÉ — Groupe A : Découverte (A1–A5)
   ============================================================ */
import * as React from 'react';
import {
  StatusBar, YHeader, YBtn, YCard, YInput, YBadge, QuickActions,
  MapMock, YBottomNav, cx, YbLogo, YbWordmark,
} from '@/components/yb/ui';
import {
  MapPin, Package, Clock, Shield, Star, ChevronRight, Phone,
  Wallet, Truck, BadgeCheck, Send, History, LifeBuoy, KeyRound, Route,
} from 'lucide-react';

/* ---------- A1 · Splash ---------- */
export function SplashScr() {
  return (
    <div className="flex h-full flex-col bg-yb-green-deep text-white">
      <StatusBar dark />
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8">
        <div className="animate-yb-pop rounded-[32px] bg-white px-7 py-5 shadow-2xl">
          <YbLogo full h={128} />
        </div>
        <div className="text-center">
          <div className="text-[16px] font-black leading-relaxed tracking-wide text-white">Réserver. Suivre. <span className="text-yb-amber">Récupérer.</span></div>
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/40 animate-yb-pulse-dot" style={{ animationDelay: `${i * 0.25}s` }} />
          ))}
        </div>
      </div>
      <div className="px-10 pb-10 text-center">
        <div className="mx-auto h-1 w-28 overflow-hidden rounded-full bg-white/15">
          <div className="h-full w-1/3 rounded-full bg-yb-amber animate-yb-shimmer" />
        </div>
        <div className="mt-3 text-[10px] font-medium text-white/40">Dakar · Sénégal — v1.0.0</div>
      </div>
    </div>
  );
}

/* ---------- A2 · Onboarding ---------- */
export function OnboardingScr() {
  const slides = [
    {
      title: 'Vos colis prennent le Tata',
      text: 'Les Tatas relient déjà tous les quartiers de Dakar. Yoobanté y ajoute votre colis, au prix du trajet.',
      stats: ['500+ Tatas partenaires', '22 quartiers couverts'],
      icon: <Truck className="h-8 w-8" />,
    },
    {
      title: '3× moins cher qu’un coursier',
      text: 'Le véhicule faisait le trajet de toute façon : vous ne payez que la place de votre colis.',
      stats: ['800 FCFA en moyenne', 'Économie 12 000 FCFA/mois'],
      icon: <Wallet className="h-8 w-8" />,
    },
    {
      title: 'Retrait sécurisé par code',
      text: 'Un code à 4 chiffres, un receveur vérifié, une photo de remise. Rien ne se perd.',
      stats: ['Code 5831', 'Preuve photo obligatoire'],
      icon: <Shield className="h-8 w-8" />,
    },
  ];
  const [idx, setIdx] = React.useState(0);
  const s = slides[idx];
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <div className="flex items-center justify-between px-5 pt-2">
        <div className="flex items-center gap-1.5">
          <YbLogo h={22} />
          <YbWordmark size="sm" />
        </div>
        <button onClick={() => setIdx(2)} className="text-[12px] font-semibold text-yb-slate">Passer</button>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-6 px-7">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-yb-green text-white shadow-lg animate-yb-pop">{s.icon}</div>
        <div>
          <div className="text-[24px] font-black leading-tight text-yb-ink">{s.title}</div>
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-yb-slate">{s.text}</p>
        </div>
        <div className="flex gap-2">
          {s.stats.map(st => (
            <div key={st} className="rounded-xl border border-yb-green/20 bg-white px-3 py-2 text-[11px] font-bold text-yb-green">{st}</div>
          ))}
        </div>
      </div>
      <div className="px-7 pb-9">
        <div className="mb-4 flex items-center justify-center gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={cx('h-1.5 rounded-full transition-all', i === idx ? 'w-6 bg-yb-green' : 'w-1.5 bg-yb-line')} />
          ))}
        </div>
        <YBtn full size="lg" onClick={() => setIdx(Math.min(2, idx + 1))} icon={<ChevronRight className="h-4 w-4" />}>
          {idx === 2 ? 'Commencer' : 'Suivant'}
        </YBtn>
      </div>
    </div>
  );
}

/* ---------- A3 · Auth ---------- */
export function AuthScr() {
  const [mode, setMode] = React.useState<'login' | 'signup'>('login');
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <div className="flex items-center gap-2 px-5 pt-4">
        <YbLogo h={26} />
        <YbWordmark />
      </div>
      <div className="px-5 pt-4">
        <div className="text-[24px] font-black text-yb-ink">{mode === 'login' ? 'Content de vous revoir' : 'Bienvenue chez Yoobanté'}</div>
        <div className="mt-1 text-[13px] text-yb-slate">{mode === 'login' ? 'Connectez-vous pour suivre vos colis.' : 'Créez un compte en moins d’une minute.'}</div>
      </div>
      <div className="mt-5 px-5">
        <div className="flex rounded-xl bg-yb-muted p-1">
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className={cx('flex-1 rounded-lg py-2 text-[12.5px] font-bold transition-all', mode === m ? 'bg-white text-yb-green shadow-sm' : 'text-yb-slate')}>
              {m === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 space-y-3.5 px-5">
        <YInput label="Téléphone" value="+221 77 123 45 67" focus trailing={<Phone className="h-4 w-4 text-yb-green" />} />
        {mode === 'signup' && <YInput label="Nom complet" value="Fatou Ndiaye" />}
        <div>
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-yb-slate">Code OTP</span>
          <div className="flex justify-between">
            {['4', '9', '2', ''].map((d, i) => (
              <div key={i} className={cx('flex items-center justify-center rounded-xl border-2 text-[20px] font-extrabold', i < 3 ? 'border-yb-green bg-yb-green-soft text-yb-green' : 'border-yb-line bg-white border-dashed')} style={{ height: 52, width: 52 }}>
                {d}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px]">
            <span className="text-yb-slate">Code envoyé par SMS</span>
            <span className="font-bold text-yb-green">Renvoyer (0:28)</span>
          </div>
        </div>
      </div>
      <div className="mt-auto space-y-3 px-5 pb-8">
        <YBtn full size="lg">{mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</YBtn>
        <div className="flex items-center justify-center gap-3 pt-1">
          <span className="flex items-center gap-1 text-[10px] font-bold text-yb-amber-deep"><Wallet className="h-3.5 w-3.5" /> Wave</span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-yb-amber-deep"><Wallet className="h-3.5 w-3.5" /> Orange Money</span>
        </div>
        <p className="text-center text-[10px] leading-relaxed text-yb-slate/70">En continuant, vous acceptez les Conditions d’utilisation et la Politique de confidentialité de Yoobanté.</p>
      </div>
    </div>
  );
}

/* ---------- A4 · Accueil ---------- */
export function HomeScr() {
  return (
    <div className="relative flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader
        title="Salamalekum, Fatou 👋"
        sub="Keur Massar, Dakar"
        action={<div className="flex h-9 w-9 items-center justify-center rounded-full bg-yb-amber text-[12px] font-black text-yb-green-deep">FN</div>}
      />
      <div className="flex-1 space-y-4 overflow-y-auto yb-scroll px-4 pb-24 pt-1">
        <div className="relative overflow-hidden rounded-3xl bg-yb-green p-5 text-white shadow-lg">
          <div className="absolute -right-6 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-yb-amber/20" />
          <div className="relative">
            <YBadge tone="amber" className="bg-yb-amber text-yb-green-deep">Recommandé</YBadge>
            <div className="mt-2.5 text-[19px] font-black leading-tight">Envoyer un colis<br />en 3 minutes</div>
            <div className="mt-1 text-[11.5px] text-white/70">Dès 800 FCFA — Wave ou Orange Money</div>
            <YBtn variant="amber" size="md" className="mt-3.5" icon={<Send className="h-4 w-4" />}>Créer un envoi</YBtn>
          </div>
        </div>
        <QuickActions items={[
          { icon: <MapPin className="h-5 w-5" />, label: 'Adresses' },
          { icon: <KeyRound className="h-5 w-5" />, label: 'Code retrait' },
          { icon: <History className="h-5 w-5" />, label: 'Historique' },
          { icon: <LifeBuoy className="h-5 w-5" />, label: 'Aide' },
        ]} />
        <div className="flex items-center justify-between px-1">
          <span className="text-[14px] font-bold text-yb-ink">Envois en cours</span>
          <span className="text-[11px] font-bold text-yb-green">Tout voir</span>
        </div>
        <YCard>
          <div className="flex items-center justify-between">
            <YBadge tone="amber">En route</YBadge>
            <span className="text-[11px] font-bold text-yb-slate">YB-4821</span>
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-[13px] font-bold">
            <span className="text-yb-green">Keur Massar</span>
            <Route className="h-3.5 w-3.5 text-yb-slate" />
            <span className="text-yb-red">Pikine</span>
          </div>
          <MapMock className="mt-3 h-28 rounded-xl" markers={[{ x: 90, y: 200, kind: 'pickup' }, { x: 300, y: 120, kind: 'drop' }]} route="M90 200 Q 180 140 300 120" driver={{ x: 150, y: 175 }} />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yb-green text-[10px] font-bold text-white">MS</div>
              <div>
                <div className="text-[11.5px] font-bold">Moussa Sow · Tata</div>
                <div className="text-[10px] text-yb-slate">Plaque DK-4821-AB</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[13px] font-black text-yb-amber-deep">14 min</div>
              <div className="text-[10px] text-yb-slate">arrivée</div>
            </div>
          </div>
        </YCard>
        <YCard>
          <div className="flex items-center justify-between">
            <YBadge tone="blue">Au point relais</YBadge>
            <span className="text-[11px] font-bold text-yb-slate">YB-4776</span>
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-[13px] font-bold">
            <span className="text-yb-green">Parcelles Assainies</span>
            <Route className="h-3.5 w-3.5 text-yb-slate" />
            <span className="text-yb-red">Ouakam</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between rounded-xl bg-yb-amber-soft px-3 py-2">
            <span className="text-[11px] font-semibold text-yb-amber-deep">Prêt pour retrait — code requis</span>
            <span className="text-[13px] font-black text-yb-amber-deep">5831</span>
          </div>
        </YCard>
      </div>
      <YBottomNav active={0} />
    </div>
  );
}

/* ---------- A5 · Partenaire Tata ---------- */
export function DriverLandingScr() {
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="Devenez partenaire Tata" sub="Receveurs & chauffeurs — Dakar" back />
      <div className="flex-1 space-y-4 overflow-y-auto yb-scroll px-4 pb-6">
        <div className="relative overflow-hidden rounded-3xl bg-yb-green-deep p-5 text-white">
          <div className="absolute -right-8 -bottom-10 h-36 w-36 rounded-full bg-yb-amber/15" />
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yb-amber text-yb-green-deep"><Truck className="h-6 w-6" /></div>
            <div className="mt-3 text-[20px] font-black leading-tight">Votre Tata rapporte<br />tous les jours</div>
            <div className="mt-2 flex items-end gap-1.5">
              <span className="text-[28px] font-black text-yb-amber">85 000</span>
              <span className="pb-1 text-[12px] font-bold text-white/70">FCFA nets / mois*</span>
            </div>
            <div className="mt-1 text-[10.5px] text-white/50">*Moyenne des partenaires actifs, avril 2026</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <Truck className="h-5 w-5" />, v: '187', l: 'partenaires actifs' },
            { icon: <Package className="h-5 w-5" />, v: '176', l: 'colis / jour' },
            { icon: <Star className="h-5 w-5" />, v: '4,8', l: 'note moyenne' },
          ].map(s => (
            <div key={s.l} className="rounded-2xl border border-yb-line bg-white p-3 text-center">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-yb-green-soft text-yb-green">{s.icon}</div>
              <div className="mt-1.5 text-[16px] font-black text-yb-ink">{s.v}</div>
              <div className="text-[9px] font-semibold text-yb-slate">{s.l}</div>
            </div>
          ))}
        </div>
        <YCard>
          <div className="text-[13px] font-bold text-yb-ink">Inscription en 3 étapes</div>
          <div className="mt-3 space-y-3">
            {[
              { n: '1', t: 'Laissez votre numéro', d: 'Un agent vous rappelle sous 24h' },
              { n: '2', t: 'Déposez vos documents', d: 'Carte grise, permis, pièce d’identité' },
              { n: '3', t: 'Recevez votre kit', d: 'Formation code de retrait + badge vérifié' },
            ].map(st => (
              <div key={st.n} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yb-green text-[12px] font-black text-white">{st.n}</div>
                <div>
                  <div className="text-[12.5px] font-bold">{st.t}</div>
                  <div className="text-[11px] text-yb-slate">{st.d}</div>
                </div>
              </div>
            ))}
          </div>
        </YCard>
        <YInput label="Votre téléphone" value="+221 77 000 00 00" focus trailing={<Phone className="h-4 w-4 text-yb-green" />} />
        <YInput label="Rôle" value="Receveur de Tata" trailing={<BadgeCheck className="h-4 w-4 text-yb-green" />} />
        <YBtn full size="lg" variant="amber">Postuler maintenant</YBtn>
        <p className="text-center text-[10px] text-yb-slate">Aucun frais d’inscription. Commission de 15% uniquement sur les colis transportés.</p>
      </div>
    </div>
  );
}
