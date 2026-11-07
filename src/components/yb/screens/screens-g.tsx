'use client';

/* ============================================================
   YOOBANTÉ — Groupe G : Système & états (G1–G3)
   ============================================================ */
import * as React from 'react';
import {
  StatusBar, YHeader, YBtn, YCard, YRow, cx, MapMock,
} from '@/components/yb/ui';
import {
  WifiOff, RefreshCw, Send, Shield, ChevronRight, Languages, Bell, Lock,
  Globe, FileText, HelpCircle, MessageCircle, Phone, Eye, Trash2, CircleAlert, Loader,
} from 'lucide-react';

/* ---------- G1 · États vides & chargement ---------- */
export function SysEmptyScr() {
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="États & chargement" sub="Bibliothèque système Yoobanté" back />
      <div className="flex-1 space-y-4 overflow-y-auto yb-scroll px-4 pb-6 pt-1">
        <div>
          <div className="mb-2 px-1 text-[12px] font-bold text-yb-ink">Skeletons (shimmer)</div>
          <YCard>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full yb-shimmer-bg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 rounded yb-shimmer-bg" />
                <div className="h-2.5 w-1/2 rounded yb-shimmer-bg" />
              </div>
              <div className="h-4 w-14 rounded yb-shimmer-bg" />
            </div>
            <div className="mt-3 h-24 rounded-xl yb-shimmer-bg" />
          </YCard>
        </div>
        <div>
          <div className="mb-2 px-1 text-[12px] font-bold text-yb-ink">Liste en chargement</div>
          <div className="space-y-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-yb-line bg-white p-3.5">
                <div className="h-10 w-10 rounded-xl yb-shimmer-bg" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 rounded yb-shimmer-bg" style={{ width: `${70 - i * 12}%` }} />
                  <div className="h-2 w-1/3 rounded yb-shimmer-bg" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 px-1 text-[12px] font-bold text-yb-ink">Empty state — aucun envoi</div>
          <YCard className="flex flex-col items-center py-7 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yb-green-soft"><Send className="h-6 w-6 text-yb-green" /></div>
            <div className="mt-3 text-[14px] font-bold">Aucun colis pour le moment</div>
            <p className="mt-1 max-w-[240px] text-[11.5px] leading-snug text-yb-slate">Votre premier envoi prend 3 minutes. Vos colis voyagent avec les Tatas que vous croisez déjà.</p>
            <YBtn size="md" className="mt-3.5" icon={<Send className="h-3.5 w-3.5" />}>Créer un envoi</YBtn>
          </YCard>
        </div>
        <div>
          <div className="mb-2 px-1 text-[12px] font-bold text-yb-ink">Loader de marque</div>
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-yb-line bg-white py-6">
            <div className="flex h-11 w-11 animate-yb-breathe items-center justify-center rounded-2xl bg-yb-green text-[18px] font-black text-white">Y</div>
            <div className="text-[12px] font-semibold text-yb-slate">Connexion au réseau Yoobanté…</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- G2 · Erreurs & réseau ---------- */
export function SysErrorScr() {
  const [offline, setOffline] = React.useState(true);
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="Erreurs & réseau" sub="Système · récupération guidée" back />
      {offline && (
        <div className="mx-4 mb-2 flex items-center gap-2.5 rounded-xl bg-yb-amber px-3.5 py-2.5">
          <WifiOff className="h-4 w-4 shrink-0 text-yb-green-deep" />
          <span className="flex-1 text-[11.5px] font-bold text-yb-green-deep">Pas de connexion — vos envois seront synchronisés dès le retour du réseau</span>
          <button onClick={() => setOffline(false)} className="rounded-full bg-yb-green-deep px-2.5 py-1 text-[10px] font-black text-white">OK</button>
        </div>
      )}
      <div className="flex-1 space-y-4 overflow-y-auto yb-scroll px-4 pb-6 pt-1">
        <YCard>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yb-red-soft text-yb-red"><CircleAlert className="h-5 w-5" /></div>
            <div className="flex-1">
              <div className="text-[13.5px] font-bold">Paiement Wave non confirmé</div>
              <p className="mt-1 text-[11.5px] leading-snug text-yb-slate">Votre banque a débité 1 900 FCFA mais Wave n’a pas confirmé la transaction #WV-8842. Aucune inquiétude : l’envoi est réservé.</p>
              <div className="mt-2 rounded-xl bg-yb-muted p-2.5 text-[10.5px] leading-snug text-yb-slate">Référence à conserver : <b className="text-yb-ink">YB-4821 · WV-8842</b></div>
              <div className="mt-3 flex gap-2">
                <YBtn size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />}>Réessayer Wave</YBtn>
                <YBtn size="sm" variant="outline">Payer autrement</YBtn>
              </div>
            </div>
          </div>
        </YCard>
        <YCard>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yb-muted text-yb-slate"><Globe className="h-5 w-5" /></div>
            <div className="flex-1">
              <div className="text-[13.5px] font-bold">Service momentanément indisponible</div>
              <p className="mt-1 text-[11.5px] leading-snug text-yb-slate">Nous ne joignons pas les serveurs Yoobanté (erreur 500). L’équipe est prévenue automatiquement — réessayez dans quelques minutes.</p>
              <div className="mt-2 flex items-center gap-1.5 text-[10.5px] font-semibold text-yb-slate">
                <span className="h-1.5 w-1.5 rounded-full bg-yb-red" /> system.yoobante.sn : incident en cours · maj 10:14
              </div>
              <YBtn size="sm" variant="outline" className="mt-3" icon={<RefreshCw className="h-3.5 w-3.5" />}>Réessayer</YBtn>
            </div>
          </div>
        </YCard>
        <YCard className="bg-yb-green-soft border-yb-green/20">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yb-green text-white"><Send className="h-5 w-5" /></div>
            <div>
              <div className="text-[13px] font-bold text-yb-green">File d’attente hors ligne</div>
              <p className="mt-1 text-[11.5px] leading-snug text-yb-green/80">2 actions en attente : confirmation de remise 5831 + message au chauffeur. Elles partiront seules à la reconnexion.</p>
            </div>
          </div>
        </YCard>
        <div>
          <div className="mb-2 px-1 text-[12px] font-bold text-yb-ink">Carte sans données GPS</div>
          <MapMock className="h-32 rounded-2xl opacity-60" />
          <div className="mt-1.5 text-center text-[10.5px] text-yb-slate">Position du Tata figée à 10:02 — actualisation dès le retour du signal</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- G3 · Paramètres ---------- */
export function SysSettingsScr() {
  return (
    <div className="flex h-full flex-col bg-yb-cream">
      <StatusBar />
      <YHeader title="Paramètres" sub="Fatou Ndiaye · +221 77 123 45 67" back />
      <div className="flex-1 space-y-4 overflow-y-auto yb-scroll px-4 pb-6 pt-1">
        <div>
          <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-yb-slate">Compte</div>
          <YCard pad={false} className="divide-y divide-yb-line">
            <SetRow icon={<Eye className="h-4 w-4" />} t="Informations personnelles" d="Nom, téléphone, adresses favorites" />
            <SetRow icon={<Shield className="h-4 w-4" />} t="Vérification d’identité" d="Pièce d’identité vérifiée ✔" />
            <SetRow icon={<Languages className="h-4 w-4" />} t="Langue" d="Français" trailing="FR · WO · FUL" />
          </YCard>
        </div>
        <div>
          <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-yb-slate">Confidentialité</div>
          <YCard pad={false} className="divide-y divide-yb-line">
            <ToggleRow icon={<Bell className="h-4 w-4" />} t="Notifications colis" d="Étapes, arrivée au relais, retrait" on />
            <ToggleRow icon={<MessageCircle className="h-4 w-4" />} t="Offres & actualités" d="2 messages max par mois" on={false} />
            <SetRow icon={<FileText className="h-4 w-4" />} t="Mes données" d="Exporter ou supprimer mon compte" danger />
          </YCard>
        </div>
        <div>
          <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-yb-slate">Sécurité</div>
          <YCard pad={false} className="divide-y divide-yb-line">
            <ToggleRow icon={<Lock className="h-4 w-4" />} t="PIN d’ouverture" d="Demander un code à chaque ouverture" on />
            <SetRow icon={<Globe className="h-4 w-4" />} t="Sessions actives" d="1 appareil · Xiaomi Redmi 12" />
          </YCard>
        </div>
        <div>
          <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-yb-slate">Aide</div>
          <YCard pad={false} className="divide-y divide-yb-line">
            <SetRow icon={<HelpCircle className="h-4 w-4" />} t="Centre d’aide" d="FAQ, codes de retrait, litiges" />
            <SetRow icon={<Phone className="h-4 w-4" />} t="Ligne verte Yoobanté" d="800 00 12 12 · 8h–20h" />
            <SetRow icon={<MessageCircle className="h-4 w-4" />} t="WhatsApp support" d="Réponse moyenne : 12 min" />
          </YCard>
        </div>
        <div className="pt-1 text-center">
          <div className="text-[11px] font-bold text-yb-ink">Yoobanté v1.0.0</div>
          <div className="text-[10px] text-yb-slate">Fait à Dakar avec ❤️ · Conditions · Confidentialité</div>
        </div>
      </div>
    </div>
  );
}

function SetRow({ icon, t, d, trailing, danger }: { icon: React.ReactNode; t: string; d: string; trailing?: string; danger?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', danger ? 'bg-yb-red-soft text-yb-red' : 'bg-yb-green-soft text-yb-green')}>{icon}</div>
      <div className="flex-1">
        <div className={cx('text-[12.5px] font-bold', danger && 'text-yb-red')}>{t}</div>
        <div className="text-[10.5px] text-yb-slate">{d}</div>
      </div>
      {trailing && <span className="text-[10px] font-bold text-yb-slate">{trailing}</span>}
      <ChevronRight className="h-4 w-4 text-yb-slate/60" />
    </div>
  );
}

function ToggleRow({ icon, t, d, on }: { icon: React.ReactNode; t: string; d: string; on: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yb-green-soft text-yb-green">{icon}</div>
      <div className="flex-1">
        <div className="text-[12.5px] font-bold">{t}</div>
        <div className="text-[10.5px] text-yb-slate">{d}</div>
      </div>
      <div className={cx('relative h-[26px] w-11 rounded-full transition-colors', on ? 'bg-yb-green' : 'bg-yb-line')}>
        <div className={cx('absolute top-0.5 h-[22px] w-[22px] rounded-full bg-white shadow transition-all', on ? 'left-[22px]' : 'left-0.5')} />
      </div>
    </div>
  );
}
