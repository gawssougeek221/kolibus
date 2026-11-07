'use client';

/* KoliBus Client — Profil, paramètres, assistance */
import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Phone, User, LifeBuoy, ShieldCheck, FileText, Wifi, Download } from 'lucide-react';
import { kb, useKbSync, IS_DEMO } from '@/lib/kb/store';
import { Section, DemoBanner } from '@/components/kb/ui';
import { phonePretty } from '@/lib/kb/domain';

export default function ProfilPage() {
  const v = useKbSync();
  const router = useRouter();
  const session = React.useMemo(() => kb().session(), [v]);

  if (!session) return null;

  return (
    <div className="px-4 pb-6 pt-2">
      <div className="flex items-center gap-3.5 rounded-2xl bg-kb-green p-4 text-white">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[18px] font-black">
          {session.name.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <div className="text-[16px] font-black">{session.name}</div>
          {session.phone && (
            <div className="mt-0.5 flex items-center gap-1 text-[11.5px] text-white/75">
              <Phone className="h-3 w-3" /> {phonePretty(session.phone)}
            </div>
          )}
          {session.email && <div className="text-[11px] text-white/60">{session.email}</div>}
        </div>
      </div>

      {IS_DEMO && <div className="mt-3"><DemoBanner /></div>}

      <div className="mt-4 space-y-3">
        <Section title="ASSISTANCE">
          <div className="space-y-1">
            <Row icon={<LifeBuoy className="h-4 w-4" />} label="Support KoliBus" value="support@kolibus.sn · +221 33 800 00 00" />
            <Row icon={<ShieldCheck className="h-4 w-4" />} label="Assurance colis (pilote)" value="Plafond 25 000 FCFA par colis" />
            <Row icon={<Wifi className="h-4 w-4" />} label="Connexion" value="Le suivi reste consultable ; les positions se rafraîchissent au retour du réseau." />
          </div>
        </Section>

        <Section title="APPLICATION">
          <div className="space-y-1">
            <Row icon={<Download className="h-4 w-4" />} label="Installer l'app (PWA)" value="Menu navigateur → « Ajouter à l'écran d'accueil »" />
            <Row icon={<FileText className="h-4 w-4" />} label="Version" value="MVP pilote 0.1 · ligne Keur Massar ⇄ Pikine" />
          </div>
        </Section>

        <Section title="LIENS UTILES">
          <div className="grid grid-cols-2 gap-2 text-center">
            <Link href="/atlas" className="rounded-xl border border-yb-line bg-white py-2.5 text-[11px] font-bold text-yb-ink">Atlas UI (archive)</Link>
            <Link href="/suivi" className="rounded-xl border border-yb-line bg-white py-2.5 text-[11px] font-bold text-yb-ink hidden" aria-hidden>Suivi</Link>
            <Link href="/transport" className="rounded-xl border border-yb-line bg-white py-2.5 text-[11px] font-bold text-yb-ink">Espace transport (test)</Link>
            <Link href="/admin" className="rounded-xl border border-yb-line bg-white py-2.5 text-[11px] font-bold text-yb-ink">Console admin</Link>
          </div>
        </Section>

        <button
          onClick={() => { kb().signOut(); router.replace('/app/connexion'); }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-yb-red/40 bg-yb-red-soft py-3 text-[13px] font-bold text-yb-red"
        >
          <LogOut className="h-4 w-4" /> Se déconnecter
        </button>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-yb-line py-2.5 last:border-0">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-kb-green-soft text-kb-green">{icon}</span>
      <div className="min-w-0">
        <div className="text-[12px] font-bold text-yb-ink">{label}</div>
        <div className="text-[10.5px] leading-relaxed text-yb-slate">{value}</div>
      </div>
    </div>
  );
}
