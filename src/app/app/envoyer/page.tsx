'use client';

/* KoliBus Client — Création d'un envoi (4 étapes + confirmation)
   Étapes : Expéditeur → Destinataire → Colis → Trajet & tarif → Succès
   Le code de retrait n'est affiché qu'UNE fois (haché côté backend). */
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, Check, User, Phone, Package, MapPin,
  Copy, Scale, Sparkles, ShieldCheck, CircleCheck, Route,
} from 'lucide-react';
import { kb, useKbSync } from '@/lib/kb/store';
import { Field, inputCls, Section, useToast, Toast } from '@/components/kb/ui';
import { computeTariff, fcfa, normalizePhone, validateParcelInput, type CreateParcelInput, type TariffBreakdown } from '@/lib/kb/domain';
import type { PaymentMethod } from '@/lib/kb/types';

const STEPS = ['Expéditeur', 'Destinataire', 'Colis', 'Trajet'];
const CATEGORIES = ['Vêtements', 'Documents', 'Électronique', 'Nourriture', 'Cosmétiques', 'Autre'];

const FIELD_MAP: Record<number, (keyof CreateParcelInput)[]> = {
  0: ['sender_name', 'sender_phone'],
  1: ['recipient_name', 'recipient_phone'],
  2: ['category', 'description', 'weight_kg', 'quantity', 'payment_method'],
  3: ['dropoff_stop_id', 'pickup_stop_id'],
};

export default function EnvoyerPage() {
  const router = useRouter();
  const v = useKbSync();
  const [toast, showToast] = useToast();
  const stops = React.useMemo(() => kb().stops().sort((a, b) => a.position_order - b.position_order), [v]);
  const grid = React.useMemo(() => kb().tariffs()[0], [v]);
  const session = React.useMemo(() => kb().session(), [v]);

  const [step, setStep] = React.useState(0);
  const [done, setDone] = React.useState<{ ref: string; code: string; id: string } | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState<CreateParcelInput>({
    sender_name: session?.name ?? '',
    sender_phone: session?.phone ?? '',
    recipient_name: '', recipient_phone: '',
    category: '', description: '',
    weight_kg: 2, quantity: 1,
    fragile: false, express: false,
    dropoff_stop_id: '', pickup_stop_id: '',
    payment_method: 'especes',
  });

  const set = (patch: Partial<CreateParcelInput>) => setForm(f => ({ ...f, ...patch }));

  const breakdown: TariffBreakdown | null = React.useMemo(() => {
    if (!grid) return null;
    return computeTariff(stops, grid, form);
  }, [stops, grid, form]);

  const validateStep = (i: number): boolean => {
    const all = validateParcelInput(form);
    const keys = FIELD_MAP[i] ?? [];
    const stepErrors: Record<string, string> = {};
    keys.forEach(k => { if (all[k]) stepErrors[k] = all[k]; });
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const next = () => { if (validateStep(step)) setStep(s => Math.min(3, s + 1)); };

  const submit = async () => {
    if (!validateStep(0) || !validateStep(1) || !validateStep(2) || !validateStep(3)) {
      showToast('!Vérifiez les informations des étapes');
      return;
    }
    setBusy(true);
    try {
      const { parcel, pickup_code } = await kb().createParcel(form);
      setDone({ ref: parcel.reference, code: pickup_code, id: parcel.id });
    } catch (e) {
      showToast(`!${e instanceof Error ? e.message : 'Création impossible'}`);
    } finally {
      setBusy(false);
    }
  };

  /* ---------- Écran de succès ---------- */
  if (done) {
    const trackUrl = typeof window !== 'undefined' ? `${window.location.origin}/suivi/${done.ref}` : '';
    return (
      <div className="px-4 pb-8 pt-2">
        <div className="rounded-3xl border border-yb-green/30 bg-white p-6 text-center shadow-lg animate-yb-pop">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-yb-green-soft">
            <CircleCheck className="h-8 w-8 text-yb-green" />
          </span>
          <h1 className="mt-3 text-[19px] font-black text-yb-ink">Envoi enregistré !</h1>
          <p className="mt-1 text-[12px] text-yb-slate">
            Statut : <b>en attente de validation</b> par KoliBus. Vous recevrez une alerte à chaque étape.
          </p>

          <div className="mt-4 rounded-2xl bg-kb-green p-4 text-white">
            <div className="text-[9.5px] font-black tracking-widest text-white/60">RÉFÉRENCE</div>
            <div className="text-[22px] font-black tracking-wide">{done.ref}</div>
          </div>

          <div className="mt-3 rounded-2xl border border-yb-amber/50 bg-yb-amber-soft p-4">
            <div className="flex items-center justify-center gap-1.5 text-[9.5px] font-black tracking-widest text-yb-amber-deep">
              <ShieldCheck className="h-3.5 w-3.5" /> CODE DE RETRAIT — À TRANSMETTRE AU DESTINATAIRE
            </div>
            <div className="mt-1.5 text-[34px] font-black leading-none tracking-[0.3em] text-kb-green">{done.code}</div>
            <p className="mt-2 text-[10px] leading-relaxed text-yb-amber-deep">
              Affiché une seule fois. Le destinataire le présentera au point de retrait ;
              le transporteur le vérifie contre le hachage serveur (5 tentatives max).
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => { void navigator.clipboard?.writeText(trackUrl); showToast('Lien de suivi copié'); }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-yb-line bg-white py-2.5 text-[12px] font-bold text-yb-ink"
            >
              <Copy className="h-3.5 w-3.5" /> Copier le lien de suivi
            </button>
            <Link
              href={`/suivi/${done.ref}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-kb-green py-2.5 text-[12px] font-bold text-white"
            >
              <Route className="h-3.5 w-3.5 text-kb-amber" /> Voir le suivi
            </Link>
          </div>
        </div>

        <button
          onClick={() => router.push('/app/colis')}
          className="mt-4 w-full rounded-xl border border-yb-line bg-white py-3 text-[13px] font-bold text-yb-ink"
        >
          Voir mes colis
        </button>
      </div>
    );
  }

  /* ---------- Formulaire ---------- */
  return (
    <div className="px-4 pb-6 pt-2">
      {/* Stepper */}
      <div className="flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black transition-colors ${
                i === step ? 'bg-kb-green text-white'
                  : i < step ? 'bg-yb-green-soft text-yb-green'
                  : 'bg-white text-yb-slate/60 border border-yb-line'
              }`}
            >
              {i < step ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
              <span className="hidden xs:inline">{s}</span>
            </button>
            {i < STEPS.length - 1 && <span className="h-0.5 flex-1 rounded bg-yb-line" />}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {/* Étape 0 — Expéditeur */}
        {step === 0 && (
          <Section icon={<User className="h-4 w-4" />} title="INFORMATIONS DE L'EXPÉDITEUR">
            <div className="space-y-3.5">
              <Field label="Votre nom complet" error={errors.sender_name}>
                <input className={inputCls(errors.sender_name)} value={form.sender_name} onChange={e => set({ sender_name: e.target.value })} placeholder="Fatou Ndiaye" />
              </Field>
              <Field label="Votre téléphone (Sénégal)" error={errors.sender_phone} hint="+221">
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yb-slate" />
                  <input className={`${inputCls(errors.sender_phone)} pl-9`} value={form.sender_phone} onChange={e => set({ sender_phone: e.target.value })} placeholder="77 123 45 67" inputMode="tel" />
                </div>
              </Field>
            </div>
          </Section>
        )}

        {/* Étape 1 — Destinataire */}
        {step === 1 && (
          <Section icon={<Phone className="h-4 w-4" />} title="DESTINATAIRE">
            <div className="space-y-3.5">
              <Field label="Nom du destinataire" error={errors.recipient_name}>
                <input className={inputCls(errors.recipient_name)} value={form.recipient_name} onChange={e => set({ recipient_name: e.target.value })} placeholder="Ibrahima Fall" />
              </Field>
              <Field label="Téléphone du destinataire" error={errors.recipient_phone} hint="+221">
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yb-slate" />
                  <input className={`${inputCls(errors.recipient_phone)} pl-9`} value={form.recipient_phone} onChange={e => set({ recipient_phone: e.target.value })} placeholder="78 890 12 34" inputMode="tel" />
                </div>
              </Field>
              <p className="text-[10.5px] leading-relaxed text-yb-slate">
                Le destinataire n&apos;a pas besoin de compte : il suivra le colis via le lien public
                et récupérera le colis avec le code de retrait.
              </p>
            </div>
          </Section>
        )}

        {/* Étape 2 — Colis */}
        {step === 2 && (
          <Section icon={<Package className="h-4 w-4" />} title="LE COLIS">
            <div className="space-y-3.5">
              <Field label="Catégorie" error={errors.category}>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      onClick={() => set({ category: c })}
                      className={`rounded-full border px-3 py-1.5 text-[11.5px] font-bold transition-colors ${
                        form.category === c ? 'border-kb-green bg-kb-green text-white' : 'border-yb-line bg-white text-yb-slate'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Description du contenu" error={errors.description}>
                <textarea
                  className={`${inputCls(errors.description)} min-h-20 resize-none`}
                  value={form.description}
                  onChange={e => set({ description: e.target.value })}
                  placeholder="Ex. : 2 sacs de vêtements pour ma sœur, bien fermés"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Poids total (kg)" error={errors.weight_kg} hint={`inclus : ${grid?.free_weight_kg ?? 5} kg`}>
                  <div className="relative">
                    <Scale className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yb-slate" />
                    <input
                      className={`${inputCls(errors.weight_kg)} pl-9`}
                      type="number" min="0.1" max="50" step="0.1"
                      value={form.weight_kg}
                      onChange={e => set({ weight_kg: Number(e.target.value) })}
                    />
                  </div>
                </Field>
                <Field label="Quantité" error={errors.quantity}>
                  <input
                    className={inputCls(errors.quantity)}
                    type="number" min="1" max="20"
                    value={form.quantity}
                    onChange={e => set({ quantity: Number(e.target.value) })}
                  />
                </Field>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => set({ fragile: !form.fragile })}
                  className={`flex-1 rounded-xl border py-2.5 text-[12px] font-bold transition-colors ${
                    form.fragile ? 'border-yb-red bg-yb-red-soft text-yb-red' : 'border-yb-line bg-white text-yb-slate'
                  }`}
                >
                  🫴 Fragile {form.fragile ? `(+${grid?.fragile_fcfa ?? 300} F)` : ''}
                </button>
                <button
                  onClick={() => set({ express: !form.express })}
                  className={`flex-1 rounded-xl border py-2.5 text-[12px] font-bold transition-colors ${
                    form.express ? 'border-yb-blue bg-yb-blue-soft text-yb-blue' : 'border-yb-line bg-white text-yb-slate'
                  }`}
                >
                  ⚡ Express {form.express ? `(+${grid?.express_fcfa ?? 500} F)` : ''}
                </button>
              </div>
              <Field label="Mode de paiement" error={errors.payment_method}>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ['especes', 'Espèces au dépôt'],
                    ['mobile_money', 'Mobile Money (réf.)'],
                    ['a_definir', 'À définir au comptoir'],
                  ] as [PaymentMethod, string][]).map(([m, label]) => (
                    <button
                      key={m}
                      onClick={() => set({ payment_method: m })}
                      className={`col-span-1 rounded-xl border py-2.5 text-[11.5px] font-bold transition-colors ${
                        form.payment_method === m ? 'border-kb-green bg-kb-green-soft text-kb-green' : 'border-yb-line bg-white text-yb-slate'
                      } ${m === 'a_definir' ? 'col-span-2' : ''}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {form.payment_method === 'mobile_money' && (
                  <p className="mt-1.5 text-[10px] leading-relaxed text-yb-amber-deep">
                    Le MVP n&apos;intègre pas encore de paiement mobile réel : la référence sera enregistrée
                    manuellement par l&apos;administration et visible dans le registre des paiements.
                  </p>
                )}
              </Field>
            </div>
          </Section>
        )}

        {/* Étape 3 — Trajet & tarif */}
        {step === 3 && (
          <>
            <Section icon={<MapPin className="h-4 w-4" />} title="TRAJET — LIGNE PILOTE">
              <div className="space-y-3.5">
                <Field label="Point de dépôt (vous)" error={errors.dropoff_stop_id}>
                  <select className={inputCls(errors.dropoff_stop_id)} value={form.dropoff_stop_id} onChange={e => set({ dropoff_stop_id: e.target.value })}>
                    <option value="">Choisir un arrêt…</option>
                    {stops.map(s => <option key={s.id} value={s.id}>{s.name} · {s.area}</option>)}
                  </select>
                </Field>
                <Field label="Point de retrait (destinataire)" error={errors.pickup_stop_id}>
                  <select className={inputCls(errors.pickup_stop_id)} value={form.pickup_stop_id} onChange={e => set({ pickup_stop_id: e.target.value })}>
                    <option value="">Choisir un arrêt…</option>
                    {stops.filter(s => s.id !== form.dropoff_stop_id).map(s => <option key={s.id} value={s.id}>{s.name} · {s.area}</option>)}
                  </select>
                </Field>
              </div>
            </Section>

            <Section icon={<Sparkles className="h-4 w-4" />} title="ESTIMATION DU TARIF">
              {breakdown && (
                <div className="space-y-2 text-[12.5px]">
                  <Row label="Prise en charge de base" value={fcfa(breakdown.base)} />
                  <Row label={`${breakdown.segments} tronçon${breakdown.segments > 1 ? 's' : ''} × ${grid?.per_segment_fcfa} F`} value={fcfa(breakdown.segment_cost)} />
                  {breakdown.extra_kg > 0 && <Row label={`Poids supplémentaire (${breakdown.extra_kg} kg)`} value={fcfa(breakdown.extra_kg_cost)} />}
                  {breakdown.fragile_cost > 0 && <Row label="Option fragile" value={fcfa(breakdown.fragile_cost)} />}
                  {breakdown.express_cost > 0 && <Row label="Option express" value={fcfa(breakdown.express_cost)} />}
                  <div className="flex items-center justify-between border-t border-yb-line pt-2.5 text-[15px] font-black text-yb-ink">
                    <span>Total à payer</span>
                    <span className="text-kb-green">{fcfa(breakdown.total)}</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-yb-slate">
                    Tarif indicatif calculé selon la grille en vigueur. Le paiement est confirmé au dépôt ;
                    aucune transaction en ligne réelle dans ce MVP.
                  </p>
                </div>
              )}
            </Section>
          </>
        )}
      </div>

      {/* Navigation d'étapes */}
      <div className="mt-6 flex gap-2.5">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="flex h-12 w-12 items-center justify-center rounded-xl border border-yb-line bg-white text-yb-ink">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {step < 3 ? (
          <button onClick={next} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-kb-green py-3.5 text-[14px] font-black text-white shadow-lg active:scale-[0.98]">
            Continuer <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={submit} disabled={busy} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-kb-green py-3.5 text-[14px] font-black text-white shadow-lg active:scale-[0.98] disabled:opacity-60">
            {busy ? 'Enregistrement…' : `Confirmer — ${breakdown ? fcfa(breakdown.total) : ''}`}
          </button>
        )}
      </div>
      <Toast msg={toast} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-yb-slate">{label}</span>
      <span className="font-bold text-yb-ink">{value}</span>
    </div>
  );
}
