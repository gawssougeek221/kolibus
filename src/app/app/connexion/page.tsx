'use client';

/* KoliBus Client — Connexion / inscription
   Mode démo : session locale. Mode Supabase : Auth réelle (email + mot de passe,
   le téléphone sénégalais est enregistré dans le profil). */
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Phone, User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { kb, IS_DEMO } from '@/lib/kb/store';
import { KbWordmark, Field, inputCls, useToast, Toast } from '@/components/kb/ui';
import { normalizePhone } from '@/lib/kb/domain';

export default function ConnexionPage() {
  const router = useRouter();
  const [mode, setMode] = React.useState<'login' | 'signup'>('login');
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [busy, setBusy] = React.useState(false);
  const [toast, showToast] = useToast();

  const submit = async () => {
    setBusy(true);
    setErrors({});
    try {
      const errs: Record<string, string> = {};
      if (mode === 'signup') {
        if (name.trim().length < 3) errs.name = 'Nom complet requis';
        if (!normalizePhone(phone)) errs.phone = 'Numéro sénégalais invalide (ex. 77 123 45 67)';
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Adresse e-mail invalide';
      if (password.length < 6) errs.password = 'Mot de passe : 6 caractères minimum';
      if (Object.keys(errs).length) { setErrors(errs); return; }

      const session = mode === 'signup'
        ? await kb().signUp(email, password, name.trim(), normalizePhone(phone)!)
        : await kb().signIn(email, password);
      showToast(`Bienvenue ${session.name} !`);
      router.replace('/app');
    } catch (e) {
      showToast(`!${e instanceof Error ? e.message : 'Connexion impossible'}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col px-5 py-6">
      <div className="flex items-center gap-3">
        <KbWordmark size={26} />
        <span className="rounded-full bg-kb-green-soft px-2 py-0.5 text-[9px] font-black text-kb-green">PILOTE SN</span>
      </div>

      <h1 className="mt-8 text-[24px] font-black leading-tight text-yb-ink">
        {mode === 'login' ? 'Content de vous revoir' : 'Bienvenue chez KoliBus'}
      </h1>
      <p className="mt-1.5 text-[13px] leading-relaxed text-yb-slate">
        Réservez l&apos;envoi de vos colis par Tata, suivez le véhicule en direct et récupérez avec un code sécurisé.
      </p>

      <div className="mt-5 flex rounded-xl bg-yb-muted p-1">
        {(['login', 'signup'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-lg py-2 text-[12.5px] font-bold transition-all ${
              mode === m ? 'bg-white text-kb-green shadow-sm' : 'text-yb-slate'
            }`}
          >
            {m === 'login' ? 'Connexion' : 'Inscription'}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {mode === 'signup' && (
          <>
            <Field label="Nom complet" error={errors.name}>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yb-slate" />
                <input className={`${inputCls(errors.name)} pl-9`} value={name} onChange={e => setName(e.target.value)} placeholder="Fatou Ndiaye" />
              </div>
            </Field>
            <Field label="Téléphone (Sénégal)" error={errors.phone} hint="+221">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yb-slate" />
                <input className={`${inputCls(errors.phone)} pl-9`} value={phone} onChange={e => setPhone(e.target.value)} placeholder="77 123 45 67" inputMode="tel" />
              </div>
            </Field>
          </>
        )}
        <Field label="E-mail" error={errors.email}>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yb-slate" />
            <input className={`${inputCls(errors.email)} pl-9`} value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.sn" inputMode="email" />
          </div>
        </Field>
        <Field label="Mot de passe" error={errors.password}>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yb-slate" />
            <input className={`${inputCls(errors.password)} pl-9`} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
        </Field>
      </div>

      <button
        onClick={submit}
        disabled={busy}
        className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-kb-green py-3.5 text-[14px] font-black text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {busy ? 'Connexion…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
        {!busy && <ArrowRight className="h-4 w-4" />}
      </button>

      {IS_DEMO && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-yb-amber/40 bg-yb-amber-soft p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-yb-amber-deep" />
          <p className="text-[10.5px] leading-relaxed text-yb-amber-deep">
            MODE DÉMO : la session reste dans ce navigateur. En production, l&apos;authentification passe par
            Supabase Auth (migrations fournies). Le destinataire, lui, n&apos;a jamais besoin de compte : il suit
            le colis via le lien /suivi.
          </p>
        </div>
      )}
      <Toast msg={toast} />
    </div>
  );
}
