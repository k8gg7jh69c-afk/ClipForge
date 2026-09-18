import { useState } from 'react';
import { BarChart3, Clapperboard, Film, Gauge, Lightbulb, Menu, Settings2, UploadCloud, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useHealthCheck } from '@workspace/api-client-react';
import { BrandAvatar, LogoMark, type NavItem } from '@/components/shared';

const navItems: NavItem[] = [
  { href: '/', label: 'Overview', icon: Gauge, exact: true },
  { href: '/ideas', label: 'Idea library', icon: Lightbulb },
  { href: '/create', label: 'Create video', icon: Clapperboard },
  { href: '/videos', label: 'Video library', icon: Film },
  { href: '/publishing', label: 'Publishing', icon: UploadCloud },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const health = useHealthCheck({ query: { staleTime: 60_000, retry: false } });
  const online = health.data?.status === 'ok' || !health.isError;

  return (
    <div className="cf-noise min-h-[100dvh] bg-background text-foreground">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[236px] flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2">
          <LogoMark />
          <button type="button" className="rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent lg:hidden" onClick={() => setMobileOpen(false)} data-testid="button-close-navigation"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-10 px-2">
          <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-sidebar-foreground/40">Workspace</p>
          <nav className="space-y-1">
            {navItems.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? location === href : location.startsWith(href);
              return <Link href={href} key={href} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon className="h-4 w-4" /><span>{label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary-foreground/70" />}</Link>;
            })}
          </nav>
        </div>
        <div className="mt-auto space-y-3">
          <Link href="/settings" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground ${location.startsWith('/settings') ? 'bg-sidebar-accent text-sidebar-foreground' : ''}`} data-testid="link-nav-settings"><Settings2 className="h-4 w-4" />Settings</Link>
          <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-3">
            <div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${online ? 'bg-accent' : 'bg-destructive'}`} /><span className="font-mono text-[10px] uppercase tracking-[0.12em] text-sidebar-foreground/60">{online ? 'Studio online' : 'Studio offline'}</span></div>
            <p className="mt-2 text-[11px] leading-5 text-sidebar-foreground/40">Ready to turn the next brief into a clip.</p>
          </div>
          <div className="flex items-center gap-3 border-t border-sidebar-border px-2 pt-4"><BrandAvatar name="MA" /><div className="min-w-0"><p className="truncate text-xs font-medium">Maya Anderson</p><p className="truncate text-[10px] text-sidebar-foreground/45">Creator workspace</p></div></div>
        </div>
      </aside>
      {mobileOpen && <button type="button" aria-label="Close navigation overlay" className="fixed inset-0 z-30 bg-foreground/20 lg:hidden" onClick={() => setMobileOpen(false)} data-testid="button-navigation-overlay" />}
      <main className="min-h-[100dvh] lg:pl-[236px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/80 bg-background/90 px-5 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3"><button type="button" className="rounded-lg border border-border p-2 lg:hidden" onClick={() => setMobileOpen(true)} data-testid="button-open-navigation"><Menu className="h-4 w-4" /></button><div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> Production room <span className="text-border">/</span> <span className="text-foreground">{navItems.find((item) => item.exact ? location === item.href : location.startsWith(item.href))?.label || 'Settings'}</span></div></div>
          <Link href="/create" className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-xs font-semibold text-background transition-transform hover:-translate-y-0.5" data-testid="button-header-create"><span className="text-primary">+</span> New video</Link>
        </header>
        <div className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 lg:px-10">{children}</div>
      </main>
    </div>
  );
}