'use client';

/* ============================================================
   KoliBus — Page d'accueil : porte d'entrée des 3 interfaces
   ============================================================ */
import Link from 'next/link';
import { Package, MapPin, ShieldCheck, Truck, ArrowRight, LayoutDashboard, Smartphone, Compass } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-dvh bg-kb-green text-white">
      <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-5 py-8 sm:px-8">
        {/* Bannière officielle fournie — non modifiée */}
        <div className="animate-yb-pop">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/kolibus-banner.jpeg"
            alt="KoliBus — Réserver. Suivre. Récupérer."
            className="w-full max-w-md rounded-2xl shadow-2xl"
          />
        </div>

        <p className="mt-6 max-w-2xl text-[14.5px] leading-relaxed text-white/85">
          Transport de colis par <b className="text-kb-amber">Tata</b> et transporteurs partenaires au Sénégal.
          Un expéditeur réserve, le véhicule est suivi en temps réel, le destinataire récupère
          avec un code sécurisé. <b>Pilote actuel : ligne Keur Massar ⇄ Pikine.</b>
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link
            href="/app"
            className="group rounded-2xl border border-white/15 bg-white/5 p-5 transition-colors hover:border-kb-amber/60 hover:bg-white/10"
          >
            <Package className="h-7 w-7 text-kb-amber" />
            <div className="mt-3 flex items-center justify-between">
              <h2 className="text-[16px] font-black">KoliBus Client</h2>
              <ArrowRight className="h-4 w-4 text-kb-amber transition-transform group-hover:translate-x-1" />
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-white/70">
              Application PWA : réserver un envoi, suivre son colis, notifier le destinataire.
            </p>
          </Link>

          <Link
            href="/transport"
            className="group rounded-2xl border border-white/15 bg-white/5 p-5 transition-colors hover:border-kb-amber/60 hover:bg-white/10"
          >
            <Truck className="h-7 w-7 text-kb-amber" />
            <div className="mt-3 flex items-center justify-between">
              <h2 className="text-[16px] font-black">KoliBus Transport</h2>
              <ArrowRight className="h-4 w-4 text-kb-amber transition-transform group-hover:translate-x-1" />
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-white/70">
              Missions, statuts, GPS réel et vérification du code de retrait.
              <span className="mt-1 block text-[10px] font-bold text-kb-amber">
                Ici : version web de test — l&apos;app mobile Expo est livrée dans /kolibus-transport
              </span>
            </p>
          </Link>

          <Link
            href="/admin"
            className="group rounded-2xl border border-white/15 bg-white/5 p-5 transition-colors hover:border-kb-amber/60 hover:bg-white/10"
          >
            <LayoutDashboard className="h-7 w-7 text-kb-amber" />
            <div className="mt-3 flex items-center justify-between">
              <h2 className="text-[16px] font-black">KoliBus Admin</h2>
              <ArrowRight className="h-4 w-4 text-kb-amber transition-transform group-hover:translate-x-1" />
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-white/70">
              Console privée : validation, affectation aux trajets, tarifs, incidents, audit.
            </p>
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11.5px] text-white/60">
          <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-kb-amber" /> Keur Massar ⇄ Pikine</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-kb-amber" /> Code de retrait vérifié côté serveur</span>
          <span className="flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5 text-kb-amber" /> FCFA · +221 · Français</span>
          <Link href="/atlas" className="flex items-center gap-1.5 underline decoration-white/30 underline-offset-2 hover:text-white">
            <Compass className="h-3.5 w-3.5" /> Atlas UI (archive prototype)
          </Link>
        </div>

          <p className="mt-auto pt-8 text-[10px] leading-relaxed text-white/40">
          MVP pilote — aucune fonctionnalité simulée n&apos;est présentée comme réelle : les partenaires d&apos;exemple sont
          marqués « démo », la simulation GPS est explicitement étiquetée, et les paiements réels ne sont pas intégrés.
          Backend Supabase connecté (Auth + RLS + RPC) — le mode démo local reste disponible hors connexion.
        </p>
      </div>
    </main>
  );
}
