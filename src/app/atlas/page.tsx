'use client';

/* ============================================================
   YOOBANTÉ — Vitrine interactive des écrans (responsive)
   Thème clair beige épuré · clavier ←→ · lecture auto · zoom +/−
   Bureau (≥1024px) : sidebar + cadre + panneau UX côte à côte
   Mobile / tablette : drawer « Écrans » + cadre auto-ajusté
   (ResizeObserver) + panneau UX empilé sous le cadre
   Zoom manuel : boutons ZoomIn/ZoomOut, % cliquable = reset,
   touches + − 0 ; scroll interne si dépassement
   Cadres : mobile 390×844 / console 1440×900
   ============================================================ */
import * as React from 'react';
import { SCREENS, GROUPS, screenById } from '@/lib/yb-registry';
import { cx, YbLogo, YbWordmark } from '@/components/yb/ui';
import {
  ChevronLeft, ChevronRight, Play, Pause, Smartphone, Monitor, Target,
  Lightbulb, Boxes, ArrowRight, MousePointerClick, Menu, X, ZoomIn, ZoomOut,
} from 'lucide-react';

export default function Showcase() {
  const [idx, setIdx] = React.useState(0);
  const [auto, setAuto] = React.useState(false);
  const [groupFilter, setGroupFilter] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);
  const [nav, setNav] = React.useState(false);
  const [zoom, setZoom] = React.useState(1); /* multiplicateur sur l'échelle ajustée */
  const timer = React.useRef<ReturnType<typeof setInterval> | null>(null);

  /* Zoom manuel : ×1.2 par cran, borné ; clic sur le % = reset ajusté */
  const zoomBy = (f: number) => setZoom(z => Math.min(3, Math.max(0.5, z * f)));
  const zoomReset = () => setZoom(1);

  const currentIdx = SCREENS[idx] ? idx : 0;
  const screen = SCREENS[currentIdx];

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  };

  const go = (d: number) => {
    setIdx(prev => (prev + d + SCREENS.length) % SCREENS.length);
    flash(d > 0 ? 'Écran suivant →' : '← Écran précédent');
  };
  const jump = (i: number) => {
    setIdx(i);
    setNav(false);
    const s = SCREENS[i];
    if (s) flash(`${s.id} · ${s.title}`);
  };

  /* Navigation clavier ← → */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(+1);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === '+' || e.key === '=') zoomBy(1.2);
      if (e.key === '-') zoomBy(1 / 1.2);
      if (e.key === '0') zoomReset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Auto-play */
  React.useEffect(() => {
    if (auto) {
      timer.current = setInterval(() => setIdx(p => (p + 1) % SCREENS.length), 3400);
      return () => { if (timer.current) clearInterval(timer.current); };
    }
  }, [auto]);

  /* ================= RESPONSIVE ================= */
  /* Mode layout : côte à côte (lg) vs empilé (< lg) */
  const [lg, setLg] = React.useState(true);
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const on = () => setLg(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  /* Mesure de la zone scène → échelle auto du cadre */
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const [box, setBox] = React.useState({ w: 0, h: 0 });
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const group = GROUPS.find(g => g.name === screen.group);
  const isDesktop = screen.kind === 'desktop';

  /* Retour à l'échelle ajustée quand on change de type de cadre */
  React.useEffect(() => { setZoom(1); }, [isDesktop]);

  /* Dimensions extérieures des cadres (bordure 10px incluse) */
  const FW = isDesktop ? 1460 : 410;
  const FH = isDesktop ? 940 : 864; /* 940 : pied du moniteur compris */
  const cap = isDesktop ? 0.52 : 0.78;
  /* échelle ajustée (fit) puis échelle effective (fit × zoom) */
  let fit = cap;
  if (box.w > 60) {
    fit = (box.w - 12) / FW;
    if (lg) fit = Math.min(fit, (box.h - 36) / FH); /* 36px : pastille + marge */
    fit = Math.min(fit, cap);
  }
  const scale = Math.min(1.5, Math.max(0.26, Math.max(fit, 0.26) * zoom));

  /* ===== Contenu sidebar (partagé bureau / drawer mobile) ===== */
  const sideBody = (
    <>
      <div className="flex items-center gap-3 border-b border-yb-line px-5 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yb-cream">
          <YbLogo h={30} />
        </div>
        <div>
          <YbWordmark />
          <div className="mt-0.5 text-[9.5px] font-bold tracking-widest text-yb-slate">UI/UX ATLAS · {SCREENS.length} ÉCRANS</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto yb-scroll px-3 py-3">
        {GROUPS.map(g => (
          <div key={g.name} className="mb-3">
            <button
              onClick={() => setGroupFilter(groupFilter === g.name ? null : g.name)}
              className={cx(
                'mb-1.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors',
                groupFilter === g.name ? 'bg-yb-green-soft' : 'hover:bg-yb-cream'
              )}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black text-white" style={{ background: g.color }}>{g.name}</span>
              <span className="flex-1 text-[11px] font-bold text-yb-ink">{g.label}</span>
              <span className="text-[10px] font-bold text-yb-slate/60">
                {SCREENS.filter(s => s.group === g.name).length}
              </span>
            </button>
            {(!groupFilter || groupFilter === g.name) && (
              <div className="space-y-0.5">
                {SCREENS.map((s, i) => ({ s, i }))
                  .filter(({ s }) => s.group === g.name)
                  .map(({ s, i }) => (
                    <button
                      key={s.id}
                      onClick={() => jump(i)}
                      className={cx(
                        'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 pl-9 text-left transition-all',
                        i === currentIdx ? 'bg-yb-green text-white' : 'text-yb-slate hover:bg-yb-cream hover:text-yb-ink'
                      )}
                    >
                      <span className={cx('w-7 shrink-0 text-[9.5px] font-black', i === currentIdx ? 'text-yb-amber' : 'text-yb-slate/50')}>{s.id}</span>
                      <span className="truncate text-[11px] font-semibold">{s.title}</span>
                      {s.kind === 'desktop' && <Monitor className="ml-auto h-3 w-3 shrink-0 opacity-50" />}
                    </button>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-yb-line px-4 py-3">
        <div className="flex items-center justify-between text-[10px] font-bold text-yb-slate">
          <span>← → écrans · + − zoom</span>
          <span>{currentIdx + 1} / {SCREENS.length}</span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-yb-line">
          <div className="h-full rounded-full bg-yb-amber transition-all duration-300" style={{ width: `${((currentIdx + 1) / SCREENS.length) * 100}%` }} />
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-yb-cream text-yb-ink">
      {/* ================= SIDEBAR (bureau) ================= */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-yb-line bg-white lg:flex">
        {sideBody}
      </aside>

      {/* ============ DRAWER ÉCRANS (mobile / tablette) ============ */}
      {nav && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-yb-green-deep/50 backdrop-blur-sm" onClick={() => setNav(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-yb-line bg-white shadow-2xl">
            <button
              onClick={() => setNav(false)}
              aria-label="Fermer"
              className="absolute right-2.5 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-yb-slate hover:bg-yb-cream"
            >
              <X className="h-4 w-4" />
            </button>
            {sideBody}
          </aside>
        </div>
      )}

      {/* ================= SCÈNE ================= */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Barre supérieure */}
        <div className="flex items-center gap-3 border-b border-yb-line bg-white/60 px-4 py-3 backdrop-blur lg:px-6">
          <button
            onClick={() => setNav(true)}
            aria-label="Ouvrir la liste des écrans"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-yb-line bg-white text-yb-ink hover:border-yb-green hover:text-yb-green lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-black text-white" style={{ background: group?.color }}>{screen.group}</span>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-black leading-tight text-yb-ink lg:text-[14px]">{screen.title}</div>
              <div className="hidden truncate text-[10.5px] text-yb-slate sm:block">{screen.desc}</div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {/* Zoom / dézoom — % cliquable = retour à l'ajusté */}
            <div className="flex items-center gap-0.5 rounded-xl border border-yb-line bg-white p-1" title="Zoom (+, −, 0 au clavier)">
              <button onClick={() => zoomBy(1 / 1.2)} aria-label="Dézoomer" className="flex h-7 w-7 items-center justify-center rounded-lg text-yb-ink hover:bg-yb-cream"><ZoomOut className="h-4 w-4" /></button>
              <button
                onClick={zoomReset}
                title="Réinitialiser (ajusté à l'écran)"
                className={cx('hidden w-11 text-center text-[10px] font-black tabular-nums hover:underline sm:block', zoom !== 1 ? 'text-yb-amber-deep' : 'text-yb-slate')}
              >
                {Math.round(scale * 100)} %
              </button>
              <button onClick={() => zoomBy(1.2)} aria-label="Zoomer" className="flex h-7 w-7 items-center justify-center rounded-lg text-yb-ink hover:bg-yb-cream"><ZoomIn className="h-4 w-4" /></button>
            </div>
            <button
              onClick={() => setAuto(a => !a)}
              className={cx(
                'flex h-9 items-center gap-2 rounded-xl px-3 text-[12px] font-bold transition-colors sm:px-4',
                auto ? 'bg-yb-amber text-yb-green-deep' : 'bg-white text-yb-ink border border-yb-line hover:border-yb-green hover:text-yb-green'
              )}
            >
              {auto ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span className="hidden sm:inline">{auto ? 'Pause' : 'Lecture auto'}</span>
            </button>
            <div className="flex items-center gap-1 rounded-xl border border-yb-line bg-white p-1">
              <button onClick={() => go(-1)} aria-label="Écran précédent" className="flex h-7 w-7 items-center justify-center rounded-lg text-yb-ink hover:bg-yb-cream"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => go(+1)} aria-label="Écran suivant" className="flex h-7 w-7 items-center justify-center rounded-lg text-yb-ink hover:bg-yb-cream"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        {/* Zone centrale : empilée < lg, côte à côte ≥ lg */}
        <div className="flex flex-1 flex-col items-center gap-6 overflow-y-auto yb-scroll px-4 py-4 sm:px-6 lg:flex-row lg:items-stretch lg:justify-center lg:gap-10 lg:overflow-hidden lg:px-8 lg:py-6">
          {/* Cadre appareil — échelle auto + zoom manuel ; scroll interne si dépassement */}
          <div ref={stageRef} className="w-full shrink-0 lg:min-w-0 lg:w-auto lg:flex-1">
            <div className={cx('yb-scroll', lg ? 'h-full w-full overflow-auto p-1' : 'w-full overflow-x-auto py-1')}>
              <div className={cx('flex w-max flex-col items-center gap-3', lg ? 'm-auto' : 'mx-auto')}>
              <div className="relative" style={{ width: FW * scale, height: FH * scale }}>
                <div className="absolute left-0 top-0 origin-top-left" style={{ width: FW, height: FH, transform: `scale(${scale})` }}>
                  {isDesktop ? (
                    <>
                      <div className="overflow-hidden rounded-2xl border-[10px] border-[#1C2320] bg-black shadow-2xl" style={{ width: 1440, height: 900 }}>
                        <div className="flex h-full w-full">{screen.render()}</div>
                      </div>
                      <div className="mx-auto h-3 w-44 rounded-b-xl bg-[#1C2320]" />
                    </>
                  ) : (
                    <div className="relative overflow-hidden rounded-[44px] border-[10px] border-[#1C2320] bg-black shadow-2xl" style={{ width: 390, height: 844 }}>
                      <div className="absolute left-1/2 top-2 z-50 h-6 w-28 -translate-x-1/2 rounded-full bg-[#1C2320]" />
                      <div className="h-full w-full overflow-y-auto yb-scroll">{screen.render()}</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-yb-line bg-white px-4 py-1.5 text-[10.5px] font-bold text-yb-slate shadow-sm">
                {isDesktop ? <><Monitor className="h-3.5 w-3.5" /> 1440 × 900</> : <><Smartphone className="h-3.5 w-3.5" /> 390 × 844</>}
              </div>
              </div>
            </div>
          </div>

          {/* Panneau UX — empilé sous le cadre sur mobile */}
          <div className="flex w-full shrink-0 flex-col gap-3 pr-1 lg:h-full lg:w-[380px] lg:overflow-y-auto lg:pr-1 yb-scroll">
            <div className="rounded-2xl border border-yb-line bg-white p-4 shadow-[0_1px_3px_rgba(20,35,30,0.05)]">
              <div className="flex items-center gap-2 text-[11px] font-black tracking-wide text-yb-amber-deep">
                <Target className="h-4 w-4" /> OBJECTIF UX
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-yb-ink">{screen.goal}</p>
            </div>
            <div className="rounded-2xl border border-yb-line bg-white p-4 shadow-[0_1px_3px_rgba(20,35,30,0.05)]">
              <div className="flex items-center gap-2 text-[11px] font-black tracking-wide text-yb-amber-deep">
                <Lightbulb className="h-4 w-4" /> DÉCISIONS DE DESIGN
              </div>
              <ul className="mt-2 space-y-2">
                {screen.decisions.map((d, i) => (
                  <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-yb-ink/90">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: group?.color }} />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-yb-line bg-white p-4 shadow-[0_1px_3px_rgba(20,35,30,0.05)]">
              <div className="flex items-center gap-2 text-[11px] font-black tracking-wide text-yb-amber-deep">
                <Boxes className="h-4 w-4" /> COMPOSANTS
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {screen.components.map(c => (
                  <span key={c} className="rounded-lg bg-yb-cream px-2.5 py-1 text-[10.5px] font-semibold text-yb-ink/80">{c}</span>
                ))}
              </div>
            </div>
            <button
              onClick={() => { const n = screenById(screen.next); if (n) jump(SCREENS.indexOf(n)); }}
              className="group flex items-center justify-between rounded-2xl border border-yb-green/40 bg-yb-green-soft/60 p-4 transition-colors hover:bg-yb-green-soft"
            >
              <div className="flex items-center gap-2 text-[12px] font-bold text-yb-green">
                <MousePointerClick className="h-4 w-4 text-yb-amber-deep" />
                Flux suivant : {screen.next}
              </div>
              <ArrowRight className="h-4 w-4 text-yb-amber-deep transition-transform group-hover:translate-x-1" />
            </button>
            <div className="rounded-2xl border border-yb-line bg-white p-4 text-[10.5px] leading-relaxed text-yb-slate shadow-[0_1px_3px_rgba(20,35,30,0.05)]">
              Identité logo : vert forêt <b className="text-yb-green">#084C41</b> · ambre soleil <b className="text-yb-amber-deep">#F9A50A</b> · fond blanc / beige épuré <b className="text-yb-ink">#F7F2E7</b>.
              Typographie système géométrique, rayons 14–20px, ombres douces.
            </div>
          </div>
        </div>
      </main>

      {/* Toast interne */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-yb-green-deep px-5 py-2.5 text-[12px] font-black text-white shadow-2xl animate-yb-pop">
          {toast}
        </div>
      )}
    </div>
  );
}
