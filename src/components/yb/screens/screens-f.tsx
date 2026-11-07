'use client';

/* ============================================================
   YOOBANTÉ — Groupe F : Console opérateur desktop (F1–F5)
   Format 1440×900 · thème sombre salle d’opérations
   ============================================================ */
import * as React from 'react';
import {
  ASidebar, AKpi, ATable, ABadge, cx,
} from '@/components/yb/ui';
import {
  Package, Truck, CheckCircle2, AlertTriangle, Coins, Search, Filter, Download,
  ChevronRight, Clock, MapPin, Phone, Mail, MoreHorizontal, Plus, TrendingUp, Wallet, Users, Star,
} from 'lucide-react';

/* ---------- Trame commune console ---------- */
function AFrame({ children, title, sub, action }: { children: React.ReactNode; title: string; sub: string; action?: React.ReactNode }) {
  return (
    <div className="flex h-full bg-[#072B24] text-white">
      <ASidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#1E5446] bg-[#072B24] px-6 py-4">
          <div>
            <div className="text-[17px] font-black">{title}</div>
            <div className="text-[11px] text-[#8FB3A6]">{sub}</div>
          </div>
          <div className="flex items-center gap-2.5">
            {action}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yb-amber text-[12px] font-black text-yb-green-deep">AD</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto yb-scroll-dark p-6">{children}</div>
      </div>
    </div>
  );
}

/* Carte exploitation SVG animée */
function OpsMap() {
  const vans = [
    { x: 70, y: 120, d: '0s' }, { x: 180, y: 60, d: '0.7s' }, { x: 300, y: 170, d: '1.4s' },
  ];
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#1E5446] bg-[#0A382E]">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-[13px] font-bold">Exploitation en direct — Dakar</span>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#7FD4B0]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7FD4B0] animate-yb-pulse-dot" /> 31 véhicules actifs
        </div>
      </div>
      <svg viewBox="0 0 420 240" className="h-56 w-full">
        <rect width="420" height="240" fill="#0A382E" />
        <ellipse cx="90" cy="60" rx="75" ry="42" fill="#0A4438" />
        <ellipse cx="340" cy="180" rx="95" ry="55" fill="#0A4438" />
        <ellipse cx="270" cy="55" rx="55" ry="28" fill="#0D5040" />
        <path d="M0 205 Q 130 185 240 215 T 420 195 L420 240 L0 240 Z" fill="#0A2E44" />
        <path d="M25 35 L155 80 L290 60 L375 115" stroke="#14594A" strokeWidth="11" fill="none" strokeLinecap="round" />
        <path d="M35 175 L165 145 L305 175 L390 135" stroke="#14594A" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M155 80 L165 145 M290 60 L305 175 M25 35 L35 175 M375 115 L390 135" stroke="#114C3F" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M15 100 Q 210 78 410 96" stroke="#F9A50A" strokeWidth="3.5" fill="none" opacity="0.55" strokeDasharray="9 6" />
        {[
          { x: 75, y: 185, c: '#F9A50A' }, { x: 320, y: 90, c: '#F9A50A' }, { x: 210, y: 205, c: '#D64545' },
        ].map((m, i) => (
          <g key={i}>
            <circle cx={m.x} cy={m.y} r="9" fill={m.c} opacity="0.25" className="animate-yb-ping" style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: `${i * 0.4}s` }} />
            <circle cx={m.x} cy={m.y} r="5.5" fill="#0A382E" stroke={m.c} strokeWidth="2.5" />
          </g>
        ))}
        {vans.map((v, i) => (
          <g key={i} className="animate-yb-drive" style={{ animationDelay: v.d, transformBox: 'fill-box', transformOrigin: 'center' }}>
            <rect x={v.x - 8} y={v.y - 5} width="16" height="10" rx="3.5" fill="#F9A50A" stroke="#C27B06" strokeWidth="1.2" />
          </g>
        ))}
        <text x="30" y="228" fill="#6E9384" fontSize="9" fontWeight="700">KEUR MASSAR</text>
        <text x="340" y="228" fill="#6E9384" fontSize="9" fontWeight="700">PIKINE</text>
        <text x="245" y="40" fill="#6E9384" fontSize="9" fontWeight="700">GUÉDIAWAYE</text>
      </svg>
    </div>
  );
}

/* Histogramme CSS (père h-full requis) */
function HourBars() {
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  const vals = [4, 9, 14, 11, 7, 5, 8, 12, 15, 17, 12];
  const max = 17;
  return (
    <div className="rounded-xl border border-[#1E5446] bg-[#0A382E] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold">Colis par heure — aujourd’hui</span>
        <span className="text-[10px] font-semibold text-[#7FA89A]">Total 176</span>
      </div>
      <div className="mt-4 flex h-36 items-end gap-[6px]">
        {vals.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div className={cx('w-full rounded-t-sm', i === 9 ? 'bg-yb-amber' : 'bg-yb-green')} style={{ height: `${(v / max) * 112}px` }} />
            <span className="text-[8px] font-bold text-[#7FA89A]">{hours[i]}h</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventFeed() {
  const events = [
    { t: 'Colis YB-4821 chargé — Tata DK-4821-AB', time: '09:38', tone: 'green' },
    { t: 'Paiement Wave 1 900 FCFA validé', time: '09:12', tone: 'green' },
    { t: 'Incident #L-219 : retard 25 min — Guédiawaye', time: '08:57', tone: 'red' },
    { t: 'Nouveau partenaire vérifié : Ousmane B.', time: '08:41', tone: 'amber' },
    { t: 'Colis YB-4776 prêt au retrait — Ouakam', time: '08:20', tone: 'blue' },
    { t: 'Litige #L-218 résolu — remboursement émis', time: '07:55', tone: 'green' },
  ] as const;
  return (
    <div className="rounded-xl border border-[#1E5446] bg-[#0A382E] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold">Flux d’événements</span>
        <span className="flex items-center gap-1 text-[10px] font-bold text-[#7FD4B0]"><Clock className="h-3 w-3" /> TEMPS RÉEL</span>
      </div>
      <div className="mt-3 space-y-2.5">
        {events.map((e, i) => (
          <div key={i} className="flex items-start gap-2.5 rounded-lg bg-[#072B24] p-2.5">
            <span className={cx('mt-1 h-1.5 w-1.5 shrink-0 rounded-full',
              e.tone === 'green' ? 'bg-[#7FD4B0]' : e.tone === 'red' ? 'bg-[#F09A9A]' : e.tone === 'blue' ? 'bg-[#7FB8F0]' : 'bg-[#F0B95A]')} />
            <div className="flex-1">
              <div className="text-[11px] leading-snug text-[#D7E5DD]">{e.t}</div>
              <div className="text-[9px] font-semibold text-[#6E9384]">{e.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- F1 · Vue d'ensemble ---------- */
export function AdminOverviewScr() {
  return (
    <AFrame title="Vue générale" sub="Dimanche 12 avril 2026 · 10:14 · Dakar"
      action={
        <>
          <div className="flex h-9 items-center gap-2 rounded-lg bg-[#0A382E] px-3 text-[11px] font-semibold text-[#8FB3A6]"><Search className="h-3.5 w-3.5" /> Rechercher…</div>
          <div className="flex h-9 items-center gap-1.5 rounded-lg bg-yb-green px-3 text-[11px] font-bold text-white"><Download className="h-3.5 w-3.5" /> Export du jour</div>
        </>
      }>
      <div className="grid grid-cols-5 gap-3">
        <AKpi label="Colis aujourd’hui" value="176" delta="+12% / 7j" icon={<Package className="h-4 w-4" />} tone="green" />
        <AKpi label="En transit" value="31" icon={<Truck className="h-4 w-4" />} tone="amber" />
        <AKpi label="Livrés" value="141" delta="80,1% du total" icon={<CheckCircle2 className="h-4 w-4" />} tone="green" />
        <AKpi label="Incidents" value="4" delta="2,3% du total" icon={<AlertTriangle className="h-4 w-4" />} tone="red" />
        <AKpi label="Recettes commissions" value="35 200 F" delta="+9% / 7j" icon={<Coins className="h-4 w-4" />} tone="blue" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="col-span-2"><OpsMap /></div>
        <EventFeed />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <HourBars />
        <ATable
          title="Points relais — charge"
          headers={['Relais', 'En attente', 'Capacité', 'Statut']}
          rows={[
            ['Marché Keur Massar', '14', <div key="b" className="h-1.5 w-16 rounded-full bg-[#16493C]"><div className="h-full w-[70%] rounded-full bg-yb-green" /></div>, <ABadge key="s" tone="green">Fluide</ABadge>],
            ['Rond-point Pikine', '11', <div key="b" className="h-1.5 w-16 rounded-full bg-[#16493C]"><div className="h-full w-[55%] rounded-full bg-yb-green" /></div>, <ABadge key="s" tone="green">Fluide</ABadge>],
            ['Guédiawaye Gare', '9', <div key="b" className="h-1.5 w-16 rounded-full bg-[#16493C]"><div className="h-full w-[45%] rounded-full bg-yb-amber" /></div>, <ABadge key="s" tone="amber">Charge moyenne</ABadge>],
            ['Boutique Awa · Ouakam', '6', <div key="b" className="h-1.5 w-16 rounded-full bg-[#16493C]"><div className="h-full w-[30%] rounded-full bg-yb-green" /></div>, <ABadge key="s" tone="green">Fluide</ABadge>],
          ]}
        />
        <ATable
          title="Top Tatas du jour"
          headers={['Chauffeur', 'Ligne', 'Colis', 'Note']}
          rows={[
            ['Moussa Sow', '27', '14', <span key="n" className="font-bold text-[#F0B95A]">★ 4,9</span>],
            ['Ibrahima Fall', '12', '12', <span key="n" className="font-bold text-[#F0B95A]">★ 4,7</span>],
            ['Cheikh Diop', '27', '11', <span key="n" className="font-bold text-[#F0B95A]">★ 4,8</span>],
            ['Alassane Ndiaye', '8', '9', <span key="n" className="font-bold text-[#F0B95A]">★ 4,6</span>],
          ]}
        />
      </div>
    </AFrame>
  );
}

/* ---------- F2 · Gestion des colis ---------- */
export function AdminParcelsScr() {
  const [sel, setSel] = React.useState(1);
  const rows = [
    { code: 'YB-4821', route: 'Keur Massar → Pikine', statut: 'En route', tone: 'amber', risk: false },
    { code: 'YB-4776', route: 'Parcelles → Ouakam', statut: 'Au relais', tone: 'blue', risk: false },
    { code: 'YB-4763', route: 'Guédiawaye → Pikine', statut: 'Retard 25 min', tone: 'red', risk: true },
    { code: 'YB-4750', route: 'Keur Massar → Guédiawaye', statut: 'En route', tone: 'amber', risk: false },
    { code: 'YB-4741', route: 'Pikine → Ouakam', statut: 'Livré', tone: 'green', risk: false },
    { code: 'YB-4739', route: 'Parcelles → Pikine', statut: 'Litige ouvert', tone: 'red', risk: true },
    { code: 'YB-4728', route: 'Ouakam → Keur Massar', statut: 'Livré', tone: 'green', risk: false },
  ];
  const cur = rows[sel];
  return (
    <AFrame title="Colis" sub="176 colis aujourd’hui · 31 en transit · 2 à risque"
      action={
        <>
          <div className="flex h-9 items-center gap-1.5 rounded-lg bg-[#0A382E] px-3 text-[11px] font-semibold text-[#8FB3A6]"><Filter className="h-3.5 w-3.5" /> Filtres</div>
          <div className="flex h-9 items-center gap-1.5 rounded-lg bg-yb-amber px-3 text-[11px] font-black text-yb-green-deep"><Plus className="h-3.5 w-3.5" /> Envoi manuel</div>
        </>
      }>
      <div className="mb-3 flex gap-2">
        {['Tous (176)', 'En transit (31)', 'Au relais (22)', 'Livrés (141)', 'À risque (2)'].map((f, i) => (
          <span key={f} className={cx('rounded-full px-3 py-1.5 text-[11px] font-bold', i === 0 ? 'bg-yb-green text-white' : 'bg-[#0A382E] text-[#8FB3A6]')}>{f}</span>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-3">
          <ATable
            title="Colis du jour"
            headers={['Code', 'Trajet', 'Poids', 'Tata', 'Statut', 'SLA', '']}
            rows={rows.map((r, i) => ([
              <span key="c" className={cx('font-bold', r.risk && 'text-[#F09A9A]')}>{r.code}</span>,
              r.route,
              '4–12 kg',
              r.code === 'YB-4821' ? 'DK-4821-AB' : r.code === 'YB-4776' ? 'DK-1290-CD' : '—',
              <ABadge key="s" tone={r.tone as 'green' | 'amber' | 'red' | 'blue'}>{r.statut}</ABadge>,
              r.risk ? <span key="l" className="font-bold text-[#F09A9A]">Dépassé</span> : <span key="l" className="text-[#7FD4B0]">OK</span>,
              <button key="a" onClick={() => setSel(i)} className="rounded p-1 hover:bg-[#16493C]"><ChevronRight className="h-4 w-4 text-[#8FB3A6]" /></button>,
            ]))}
          />
        </div>
        <div className="col-span-2 space-y-3">
          <div className="rounded-xl border border-[#1E5446] bg-[#0A382E] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold">Détail — {cur.code}</span>
              <MoreHorizontal className="h-4 w-4 text-[#8FB3A6]" />
            </div>
            <div className="mt-3 space-y-2 text-[12px]">
              {[
                ['Trajet', cur.route],
                ['Expéditeur', 'Fatou Ndiaye · +221 77 123 45 67'],
                ['Destinataire', 'Awa Diop · code 5831'],
                ['Receveur', 'Modou Gueye · DK-4821-AB'],
                ['Paiement', 'Wave · 1 900 FCFA'],
                ['Options', 'Fragile · Assurance 25 000 F'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <span className="text-[#7FA89A]">{k}</span>
                  <span className="text-right font-semibold text-[#D7E5DD]">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button className="rounded-lg bg-yb-green py-2 text-[11px] font-bold">Réassigner</button>
              <button className="rounded-lg bg-[#16493C] py-2 text-[11px] font-bold text-[#D7E5DD]">Rembourser</button>
              <button className="rounded-lg bg-[#16493C] py-2 text-[11px] font-bold text-[#D7E5DD]">Contacter</button>
            </div>
          </div>
          <div className="rounded-xl border border-[#1E5446] bg-[#0A382E] p-4">
            <div className="text-[13px] font-bold">Chronologie — {cur.code}</div>
            <div className="mt-3 space-y-2.5">
              {[
                ['09:05', 'Déposé au point relais Keur Massar'],
                ['09:38', 'Chargé dans le Tata DK-4821-AB'],
                ['10:14', 'En transit sur la N1'],
                ['10:26', 'Arrivée prévue Pikine'],
              ].map(([t, e], i) => (
                <div key={i} className="flex gap-3">
                  <span className="w-10 shrink-0 text-[10px] font-bold text-[#6E9384]">{t}</span>
                  <span className="text-[11.5px] text-[#D7E5DD]">{e}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AFrame>
  );
}

/* ---------- F3 · Tatas & Chauffeurs ---------- */
export function AdminTatasScr() {
  return (
    <AFrame title="Tatas & Chauffeurs" sub="187 partenaires actifs · 9 en attente · 2 suspendus"
      action={<div className="flex h-9 items-center gap-1.5 rounded-lg bg-yb-amber px-3 text-[11px] font-black text-yb-green-deep"><Plus className="h-3.5 w-3.5" /> Ajouter un partenaire</div>}>
      <div className="mb-3 flex gap-2">
        {['Actifs (187)', 'En attente de vérification (9)', 'Suspendus (2)'].map((f, i) => (
          <span key={f} className={cx('rounded-full px-3 py-1.5 text-[11px] font-bold', i === 0 ? 'bg-yb-green text-white' : 'bg-[#0A382E] text-[#8FB3A6]')}>{f}</span>
        ))}
      </div>
      <ATable
        title="Flotte partenaire"
        headers={['Partenaire', 'Rôle', 'Véhicule', 'Colis 7j', 'Livré à l’heure', 'Note', 'Documents', '']}
        rows={[
          ['Moussa Sow', 'Receveur', 'Tata bleu · DK-4821-AB', '82', '98%', <span key="n" className="font-bold text-[#F0B95A]">★ 4,9</span>, <ABadge key="d" tone="green">Complets</ABadge>, <MoreHorizontal key="m" className="h-4 w-4 text-[#8FB3A6]" />],
          ['Ibrahima Fall', 'Receveur', 'Tata blanc · DK-1290-CD', '61', '95%', <span key="n" className="font-bold text-[#F0B95A]">★ 4,7</span>, <ABadge key="d" tone="amber">Expire 12 j</ABadge>, <MoreHorizontal key="m" className="h-4 w-4 text-[#8FB3A6]" />],
          ['Cheikh Diop', 'Receveur', 'Tata vert · DK-3305-EF', '77', '97%', <span key="n" className="font-bold text-[#F0B95A]">★ 4,8</span>, <ABadge key="d" tone="green">Complets</ABadge>, <MoreHorizontal key="m" className="h-4 w-4 text-[#8FB3A6]" />],
          ['Alassane Ndiaye', 'Chauffeur', 'Tata gris · DK-7712-GH', '44', '92%', <span key="n" className="font-bold text-[#F0B95A]">★ 4,6</span>, <ABadge key="d" tone="green">Complets</ABadge>, <MoreHorizontal key="m" className="h-4 w-4 text-[#8FB3A6]" />],
          ['Ousmane Bâ', 'Receveur', 'Tata bleu · DK-5540-IJ', '38', '96%', <span key="n" className="font-bold text-[#F0B95A]">★ 4,8</span>, <ABadge key="d" tone="blue">Vérifié 08:41</ABadge>, <MoreHorizontal key="m" className="h-4 w-4 text-[#8FB3A6]" />],
          ['Sokhna Mbaye', 'Receveure', 'Tata blanc · DK-2218-KL', '29', '99%', <span key="n" className="font-bold text-[#F0B95A]">★ 5,0</span>, <ABadge key="d" tone="green">Complets</ABadge>, <MoreHorizontal key="m" className="h-4 w-4 text-[#8FB3A6]" />],
        ]}
      />
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#1E5446] bg-[#0A382E] p-4">
          <div className="flex items-center gap-2 text-[12px] font-bold"><Users className="h-4 w-4 text-yb-amber" /> Croissance de la flotte</div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-[28px] font-black">187</span>
            <span className="mb-1 flex items-center gap-1 text-[11px] font-bold text-[#7FD4B0]"><TrendingUp className="h-3 w-3" /> +23 ce mois</span>
          </div>
          <div className="mt-3 flex h-14 items-end gap-1.5">
            {[40, 55, 48, 70, 82, 78, 95, 100].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm bg-yb-green" style={{ height: `${h}%`, opacity: 0.4 + i * 0.075 }} />
            ))}
          </div>
        </div>
        <ATable
          title="Vérifications en attente"
          headers={['Candidat', 'Depuis', 'Blocage']}
          rows={[
            ['Ousmane Bâ', '2 h', 'Auto-accepté'],
            ['Fatou Sarr', '5 h', 'Carte grise floue'],
            ['Modou Sène', '8 h', 'Permis manquant'],
          ]}
        />
        <div className="rounded-xl border border-[#1E5446] bg-[#0A382E] p-4">
          <div className="text-[12px] font-bold">Zones aveugles</div>
          <div className="mt-2 space-y-2 text-[11.5px] text-[#8FB3A6]">
            <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-[#F09A9A]" /> Bargny — aucun partenaire</div>
            <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-[#F0B95A]" /> Diamaguène — 1 seul relais</div>
            <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-[#7FD4B0]" /> Yoff — couverture OK</div>
          </div>
          <button className="mt-3 w-full rounded-lg bg-[#16493C] py-2 text-[11px] font-bold text-[#D7E5DD]">Ouvrir un plan de recrutement</button>
        </div>
      </div>
    </AFrame>
  );
}

/* ---------- F4 · Litiges ---------- */
export function AdminDisputesScr() {
  return (
    <AFrame title="Litiges & incidents" sub="4 incidents aujourd’hui · 1 SLA critique"
      action={<div className="flex h-9 items-center gap-1.5 rounded-lg bg-[#0A382E] px-3 text-[11px] font-semibold text-[#8FB3A6]"><Download className="h-3.5 w-3.5" /> Journal</div>}>
      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-2 space-y-2.5">
          {[
            { id: 'L-221', d: 'Colis abîmé signalé — Pikine', sla: 'SLA 3h 40m', tone: 'red', t: '09:58' },
            { id: 'L-219', d: 'Retard 25 min — Guédiawaye', sla: 'SLA dépassé', tone: 'red', t: '08:57' },
            { id: 'L-217', d: 'Destinataire absent ×2 — Parcelles', sla: 'SLA 6h', tone: 'amber', t: '08:15' },
            { id: 'L-214', d: 'Paiement Wave non reçu', sla: 'En traitement', tone: 'green', t: '07:30' },
          ].map((q, i) => (
            <div key={q.id} className={cx('rounded-xl border p-4', i === 0 ? 'border-[#F09A9A]/40 bg-[#2A1518]' : 'border-[#1E5446] bg-[#0A382E]')}>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-black">{q.id}</span>
                <ABadge tone={q.tone as 'red' | 'amber' | 'green'}>{q.sla}</ABadge>
              </div>
              <div className="mt-1.5 text-[12px] text-[#D7E5DD]">{q.d}</div>
              <div className="mt-1 text-[10px] font-semibold text-[#6E9384]">Ouvert à {q.t}</div>
            </div>
          ))}
        </div>
        <div className="col-span-3 space-y-3">
          <div className="rounded-xl border border-[#F09A9A]/40 bg-[#0A382E] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-black">L-221 · Colis abîmé — YB-4739</span>
              <ABadge tone="red">SLA 3h 40m restantes</ABadge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[12px]">
              {[['Colis', 'Carton · 9 kg · électronique'], ['Tata', 'DK-3305-EF · Cheikh Diop'], ['Expéditeur', 'Ibou Ndiaye · Pikine'], ['Destinataire', 'Marie Sène · Ouakam'], ['Assurance', '25 000 FCFA activée'], ['Preuves', '3 photos + 2 messages']].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <span className="text-[#7FA89A]">{k}</span><span className="font-semibold text-[#D7E5DD]">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[#1E5446] bg-[#0A382E] p-4">
            <div className="text-[13px] font-bold">Médiation</div>
            <div className="mt-3 space-y-2.5">
              <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-[#072B24] p-3 text-[11.5px] leading-snug text-[#D7E5DD]">Le carton était ouvert à l’arrivée. L’ampli ne s’allume plus. 📷 2 photos jointes</div>
              <div className="ml-auto max-w-[85%] rounded-xl rounded-tr-sm bg-yb-green p-3 text-[11.5px] leading-snug">Bonjour Marie, le receveur a été suspendu le temps de l’enquête. Nous activons l’assurance 25 000 F.</div>
              <div className="flex gap-2">
                <span className="flex-1 rounded-lg bg-[#072B24] px-3 py-2 text-[11px] text-[#8FB3A6]">Écrire une réponse…</span>
                {['Rembourser', 'Demander photo', 'Contacter Tata'].map(a => (
                  <span key={a} className="rounded-lg border border-[#1E5446] px-3 py-2 text-[10.5px] font-bold text-[#D7E5DD]">{a}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { v: '4', l: 'ouverts aujourd’hui' }, { v: '2,3%', l: 'taux de litige' }, { v: '4 h 12', l: 'résolution moyenne' },
            ].map(k => (
              <div key={k.l} className="rounded-xl border border-[#1E5446] bg-[#0A382E] p-3.5 text-center">
                <div className="text-[20px] font-black">{k.v}</div>
                <div className="text-[10px] font-semibold text-[#8FB3A6]">{k.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AFrame>
  );
}

/* ---------- F5 · Finances ---------- */
export function AdminFinanceScr() {
  const rev = [22, 25, 21, 28, 31, 27, 33, 30, 36, 34, 38, 35, 32, 39, 41, 38, 44, 42, 40, 46, 43, 47, 45, 49, 48, 52, 50, 55, 53, 58];
  return (
    <AFrame title="Finances" sub="Avril 2026 · réconciliation Wave / Orange Money"
      action={<div className="flex h-9 items-center gap-1.5 rounded-lg bg-yb-green px-3 text-[11px] font-bold text-white"><Download className="h-3.5 w-3.5" /> Export comptable</div>}>
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-xl border border-[#1E5446] bg-[#0A382E] p-4">
          <div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-[#8FB3A6]">Commissions (mois)</span><Coins className="h-4 w-4 text-yb-green" /></div>
          <div className="mt-2 text-[24px] font-black">612 400 F</div>
          <div className="mt-1 text-[11px] font-bold text-[#7FD4B0]">+14% vs mars</div>
        </div>
        <div className="rounded-xl border border-[#1E5446] bg-[#0A382E] p-4">
          <div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-[#8FB3A6]">Volume transporté</span><TrendingUp className="h-4 w-4 text-yb-blue" /></div>
          <div className="mt-2 text-[24px] font-black">4,08 M F</div>
          <div className="mt-1 text-[11px] font-bold text-[#7FD4B0]">2 148 colis facturés</div>
        </div>
        <div className="rounded-xl border border-[#1E5446] bg-[#0A382E] p-4">
          <div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-[#8FB3A6]">Payouts en attente</span><Wallet className="h-4 w-4 text-yb-amber" /></div>
          <div className="mt-2 text-[24px] font-black">87 900 F</div>
          <div className="mt-1 text-[11px] font-bold text-[#F0B95A]">11 partenaires samedi</div>
        </div>
        <div className="rounded-xl border border-[#1E5446] bg-[#0A382E] p-4">
          <div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-[#8FB3A6]">Compte de séquestre Wave</span><Star className="h-4 w-4 text-[#7FB8F0]" /></div>
          <div className="mt-2 text-[24px] font-black">1,24 M F</div>
          <div className="mt-1 text-[11px] font-bold text-[#7FB8F0]">Réconcilié à 99,2%</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-3">
        <div className="col-span-3 rounded-xl border border-[#1E5446] bg-[#0A382E] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold">Commissions quotidiennes — 30 jours (kFCFA)</span>
            <span className="text-[10px] font-bold text-[#7FD4B0]">Moy. 20,4 k/j</span>
          </div>
          <div className="mt-4 flex h-40 items-end gap-[3px]">
            {rev.map((v, i) => (
              <div key={i} className={cx('flex-1 rounded-t-sm', i === rev.length - 1 ? 'bg-yb-amber' : 'bg-yb-green')} style={{ height: `${(v / 60) * 140}px`, opacity: i === rev.length - 1 ? 1 : 0.62 }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[9px] font-semibold text-[#6E9384]"><span>12 mars</span><span>27 mars</span><span>12 avril</span></div>
        </div>
        <div className="col-span-2">
          <ATable
            title="Payouts — samedi 16 avril"
            headers={['Partenaire', 'Colis', 'Montant', '']}
            rows={[
              ['Moussa Sow', '82', '38 500 F', <button key="b" className="rounded-lg bg-yb-green px-2.5 py-1 text-[10px] font-bold">Payer</button>],
              ['Cheikh Diop', '77', '36 200 F', <button key="b" className="rounded-lg bg-yb-green px-2.5 py-1 text-[10px] font-bold">Payer</button>],
              ['Ibrahima Fall', '61', '28 900 F', <button key="b" className="rounded-lg bg-[#16493C] px-2.5 py-1 text-[10px] font-bold text-[#D7E5DD]">Plus tard</button>],
              ['Sokhna Mbaye', '29', '14 100 F', <button key="b" className="rounded-lg bg-yb-green px-2.5 py-1 text-[10px] font-bold">Payer</button>],
            ]}
          />
          <div className="mt-3 rounded-xl border border-[#1E5446] bg-[#0A382E] p-4">
            <div className="text-[12px] font-bold">Répartition paiements</div>
            <div className="mt-3 space-y-2">
              {[
                ['Wave', 68, '#7FD4B0'], ['Orange Money', 22, '#F0B95A'], ['Free Money', 6, '#7FB8F0'], ['Espèces relais', 4, '#8FB3A6'],
              ].map(([l, v, c]) => (
                <div key={l as string}>
                  <div className="flex justify-between text-[10.5px] font-semibold"><span className="text-[#8FB3A6]">{l}</span><span className="text-[#D7E5DD]">{v}%</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-[#16493C]"><div className="h-full rounded-full" style={{ width: `${v}%`, background: c as string }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AFrame>
  );
}
