'use client';

/* KoliBus Client — shell PWA (accueil, envoi, colis, notifs, profil) */
import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, PlusSquare, Package, Bell, User } from 'lucide-react';
import { kb, useKbSync, IS_DEMO } from '@/lib/kb/store';
import { KbWordmark, DemoBanner } from '@/components/kb/ui';

const NAV = [
  { href: '/app', label: 'Accueil', icon: <Home className="h-4.5 w-4.5" /> },
  { href: '/app/envoyer', label: 'Envoyer', icon: <PlusSquare className="h-4.5 w-4.5" /> },
  { href: '/app/colis', label: 'Colis', icon: <Package className="h-4.5 w-4.5" /> },
  { href: '/app/notifications', label: 'Alertes', icon: <Bell className="h-4.5 w-4.5" /> },
  { href: '/app/profil', label: 'Profil', icon: <User className="h-4.5 w-4.5" /> },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const v = useKbSync();
  const pathname = usePathname();
  const router = useRouter();
  const session = React.useMemo(() => kb().session(), [v, pathname]);

  React.useEffect(() => {
    if (!session) router.replace('/app/connexion');
  }, [session, router]);

  const unread = kb().notifications().filter(n => !n.read_at && n.audience !== 'recipient').length;

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col overflow-hidden bg-yb-cream">
      <header className="flex shrink-0 items-center justify-between border-b border-yb-line bg-kb-green px-4 py-3">
        <Link href="/app" className="flex items-center gap-2">
          <KbWordmark size={20} light />
        </Link>
        <span className="text-[9.5px] font-bold tracking-widest text-white/60">CLIENT · SN</span>
      </header>

      <main className="flex-1 overflow-y-auto yb-scroll">
        <div className="px-4 pt-3">
          {IS_DEMO && <DemoBanner />}
        </div>
        {children}
      </main>

      <nav className="flex shrink-0 border-t border-yb-line bg-white/95 backdrop-blur">
        {NAV.map(it => {
          const active = pathname === it.href || (it.href !== '/app' && pathname.startsWith(it.href));
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[9px] font-bold transition-colors ${
                active ? 'text-kb-green' : 'text-yb-slate hover:text-yb-ink'
              }`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-xl ${active ? 'bg-kb-green-soft' : ''}`}>
                {it.icon}
              </span>
              {it.label}
              {it.href === '/app/notifications' && unread > 0 && (
                <span className="absolute right-4 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-yb-red px-1 text-[8.5px] font-black text-white">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
