import { Link } from 'wouter';
import { ArrowUpRight, Check, Clock3, Film, Loader2, Play, Sparkles, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" data-testid="link-logo">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[4px_4px_0_hsl(var(--accent))]">
        <span className="absolute h-4 w-4 rounded-[4px] border-2 border-current" />
        <span className="absolute left-[17px] top-[11px] h-2 w-2 rotate-45 bg-current" />
      </span>
      {!compact && <span className="font-['Space_Grotesk'] text-[17px] font-bold tracking-[-0.04em]">clipforge<span className="text-accent">.</span></span>}
    </Link>
  );
}

export function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div className="cf-reveal">
        <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
        <h1 className="font-['Space_Grotesk'] text-3xl font-bold tracking-[-0.045em] text-foreground md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="cf-reveal-delay">{action}</div>}
    </div>
  );
}

export function StatusPill({ status }: { status?: string }) {
  const value = (status || 'unknown').toLowerCase();
  const isPositive = ['approved', 'published', 'completed', 'ready', 'scheduled'].includes(value);
  const isDanger = ['rejected', 'failed', 'error'].includes(value);
  const isWorking = ['processing', 'generating', 'queued', 'pending'].includes(value);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${isPositive ? 'border-accent/30 bg-accent/10 text-accent' : isDanger ? 'border-destructive/30 bg-destructive/10 text-destructive' : isWorking ? 'border-primary/40 bg-primary/15 text-foreground' : 'border-border bg-muted text-muted-foreground'}`}>
      {isPositive ? <Check className="h-3 w-3" /> : isDanger ? <X className="h-3 w-3" /> : isWorking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Clock3 className="h-3 w-3" />}
      {status || 'unknown'}
    </span>
  );
}

export function StatCard({ label, value, detail, icon: Icon, accent = false }: { label: string; value: string | number; detail?: string; icon: LucideIcon; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 transition-transform duration-200 hover:-translate-y-0.5 ${accent ? 'border-primary bg-primary' : 'border-border bg-card'}`}>
      <div className="flex items-start justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${accent ? 'bg-foreground/10 text-primary-foreground' : 'bg-muted text-accent'}`}><Icon className="h-4 w-4" /></span>
        {detail && <span className={`font-mono text-[10px] uppercase tracking-wide ${accent ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{detail}</span>}
      </div>
      <p className={`mt-5 font-['Space_Grotesk'] text-3xl font-bold tracking-[-0.06em] ${accent ? 'text-primary-foreground' : 'text-foreground'}`} data-testid={`stat-value-${label.toLowerCase().replaceAll(' ', '-')}`}>{value}</p>
      <p className={`mt-1 text-xs ${accent ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>{label}</p>
    </div>
  );
}

export function SkeletonRows({ count = 4 }: { count?: number }) {
  return <div className="space-y-3">{Array.from({ length: count }).map((_, index) => <div key={index} className="cf-shimmer h-16 rounded-xl border border-border" />)}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-accent"><Sparkles className="h-5 w-5" /></span>
      <h3 className="font-['Space_Grotesk'] text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

  export function VideoThumb({
    title,
    url,
    videoUrl,
    compact = false,
  }: {
    title: string;
    url?: string;
    videoUrl?: string;
    compact?: boolean;
  }) {
    const [playing, setPlaying] = React.useState(false);

    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl bg-secondary ${
          compact ? 'h-14 w-24' : 'aspect-[16/10] w-full'
        }`}
      >
        {playing && videoUrl ? (
          <video
            src={videoUrl}
            controls
            autoPlay
            className="h-full w-full object-cover"
            onEnded={() => setPlaying(false)}
          />
        ) : (
          <>
            {url ? (
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover opacity-75"
              />
            ) : (
              <div className="cf-grid-bg h-full w-full opacity-40" />
            )}

            <div className="absolute inset-0 bg-gradient-to-br from-accent/25 via-transparent to-secondary/90" />

            <span className="absolute left-2 top-2 font-mono text-[9px] uppercase tracking-[0.16em] text-primary-foreground/70">
              CF / preview
            </span>

            {videoUrl && (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground hover:scale-105 transition-transform"
              >
                <Play className="h-3 w-3 fill-current" />
              </button>
            )}

            {!compact && (
              <span className="absolute bottom-2 left-2 max-w-[80%] truncate text-xs font-semibold text-primary-foreground">
                {title}
              </span>
            )}
          </>
        )}
      </div>
    );
  }
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-xl bg-secondary ${compact ? 'h-14 w-24' : 'aspect-[16/10] w-full'}`}>
      {url ? <img src={url} alt="" className="h-full w-full object-cover opacity-75" /> : <div className="cf-grid-bg h-full w-full opacity-40" />}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/25 via-transparent to-secondary/90" />
      <span className="absolute left-2 top-2 font-mono text-[9px] uppercase tracking-[0.16em] text-primary-foreground/70">CF / preview</span>
      <span className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground"><Play className="h-3 w-3 fill-current" /></span>
      {!compact && <span className="absolute bottom-2 left-2 max-w-[80%] truncate text-xs font-semibold text-primary-foreground">{title}</span>}
    </div>
  );


export function MiniBars({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-40 items-end gap-2">
      {values.map((value, index) => (
        <div key={`${labels[index]}-${index}`} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
          <div className="relative flex h-32 w-full items-end rounded-md bg-muted/60">
            <div className="w-full rounded-md bg-accent transition-all duration-500 group-hover:bg-primary" style={{ height: `${Math.max((value / max) * 100, 4)}%` }} />
          </div>
          <span className="font-mono text-[9px] text-muted-foreground">{labels[index]}</span>
        </div>
      ))}
    </div>
  );
}

export function SectionHeading({ title, detail, href }: { title: string; detail?: string; href?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div><h2 className="font-['Space_Grotesk'] text-lg font-semibold tracking-[-0.03em]">{title}</h2>{detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}</div>
      {href && <Link href={href} className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-accent hover:text-foreground" data-testid={`link-view-${title.toLowerCase().replaceAll(' ', '-')}`}>View all <ArrowUpRight className="h-3 w-3" /></Link>}
    </div>
  );
}

export function IconButton({ label, children, onClick, disabled = false }: { label: string; children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-accent/50 hover:bg-accent/10 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50" data-testid={`button-${label.toLowerCase().replaceAll(' ', '-')}`}>{children}</button>;
}

export function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-border bg-card p-5 ${className}`}>{children}</section>;
}

export function BrandAvatar({ name = 'CF' }: { name?: string }) {
  return <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-['Space_Grotesk'] text-xs font-bold text-primary-foreground">{name.slice(0, 2).toUpperCase()}</span>;
}