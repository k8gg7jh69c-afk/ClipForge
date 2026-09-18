import { useState } from 'react';
import { ArrowRight, Lightbulb, RefreshCw, Search, Sparkles, Target } from 'lucide-react';
import { Link } from 'wouter';
import { useGenerateIdeas, useGetRecommendations, useListIdeas } from '@workspace/api-client-react';
import { EmptyState, PageIntro, Panel, SkeletonRows } from '@/components/shared';

export default function Ideas() {
  const [topic, setTopic] = useState('');
  const [query, setQuery] = useState('');
  const ideas = useListIdeas(undefined, { query: { staleTime: 30_000 } });
  const recommendations = useGetRecommendations();
  const generate = useGenerateIdeas();
  const list = ideas.data || [];
  const filtered = list.filter((idea) => [idea.title, idea.concept, idea.targetAudience].join(' ').toLowerCase().includes(query.toLowerCase()));

  const handleGenerate = () => {
    if (topic.trim().length < 3) return;
    generate.mutate({ data: { topic: topic.trim(), count: 6 } }, { onSuccess: () => { setTopic(''); ideas.refetch(); } });
  };

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Creative desk / idea library" title="Start with a sharper spark." description="Keep a living bank of original angles, hooks, and audiences so the next brief never starts cold." action={<button type="button" onClick={() => recommendations.mutate()} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:border-accent/50" data-testid="button-refresh-recommendations"><RefreshCw className={`h-3.5 w-3.5 ${recommendations.isPending ? 'animate-spin' : ''}`} /> Fresh recommendations</button>} />
      <div className="grid gap-5 xl:grid-cols-[.72fr_1.28fr]">
        <Panel className="bg-secondary text-secondary-foreground">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Idea generator</p>
          <h2 className="mt-3 font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.05em]">What are we making room for?</h2>
          <p className="mt-2 text-sm leading-6 text-secondary-foreground/65">Name a theme, question, or cultural moment. ClipForge will return angles with a point of view.</p>
          <div className="mt-6 flex gap-2 rounded-xl border border-secondary-foreground/15 bg-secondary-foreground/5 p-1.5 focus-within:border-primary/70"><input value={topic} onChange={(event) => setTopic(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && handleGenerate()} placeholder="e.g. sustainable travel myths" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-secondary-foreground/35" data-testid="input-idea-topic" /><button type="button" onClick={handleGenerate} disabled={generate.isPending || topic.trim().length < 3} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50" data-testid="button-generate-ideas"><Sparkles className={`h-4 w-4 ${generate.isPending ? 'animate-pulse' : ''}`} /></button></div>
          {generate.isError && <p className="mt-3 text-xs text-red-300">Generation missed the mark. Try a more specific topic.</p>}
          <div className="mt-8 border-t border-secondary-foreground/10 pt-5"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-secondary-foreground/40">Recommended lanes</p><div className="mt-3 flex flex-wrap gap-2">{(recommendations.data?.recommendedTopics || ['Behind the process', 'Unexpected comparisons', 'One-minute field notes']).slice(0, 4).map((item) => <button type="button" key={item} onClick={() => setTopic(item)} className="rounded-full border border-secondary-foreground/15 px-3 py-1.5 text-xs text-secondary-foreground/70 hover:border-primary hover:text-primary" data-testid={`button-topic-${item.toLowerCase().replaceAll(' ', '-')}`}>{item}</button>)}</div></div>
        </Panel>
        <Panel>
          <div className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-center md:justify-between"><div><p className="font-['Space_Grotesk'] text-lg font-semibold">Idea bank</p><p className="mt-1 text-xs text-muted-foreground">{filtered.length} angles ready for a brief</p></div><div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"><Search className="h-3.5 w-3.5 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ideas" className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground" data-testid="input-search-ideas" /></div></div>
          <div className="mt-5">{ideas.isLoading ? <SkeletonRows count={4} /> : ideas.isError ? <EmptyState title="Ideas are out of reach" description="We couldn't load the library. Try once more." action={<button type="button" onClick={() => ideas.refetch()} className="rounded-lg bg-foreground px-3 py-2 text-xs text-background" data-testid="button-retry-ideas">Retry</button>} /> : filtered.length ? <div className="grid gap-3">{filtered.map((idea) => <article key={idea.id} className="group rounded-xl border border-border p-4 transition-colors hover:border-accent/50 hover:bg-accent/5" data-testid={`card-idea-${idea.id}`}><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-accent"><Lightbulb className="h-4 w-4" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-['Space_Grotesk'] text-base font-semibold">{idea.title}</h3><span className="font-mono text-[10px] text-muted-foreground">{idea.estimatedDuration}s</span></div><p className="mt-1 text-xs leading-5 text-muted-foreground">{idea.concept}</p><div className="mt-3 grid gap-2 text-xs md:grid-cols-2"><div className="rounded-lg bg-muted/60 p-2.5"><span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wide text-accent"><Target className="h-3 w-3" /> Audience</span><p className="mt-1 text-foreground/80">{idea.targetAudience}</p></div><div className="rounded-lg bg-muted/60 p-2.5"><span className="font-mono text-[9px] uppercase tracking-wide text-accent">Hook</span><p className="mt-1 text-foreground/80">{idea.hook}</p></div></div></div><Link href="/create" className="mt-1 rounded-lg p-2 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground" data-testid={`link-use-idea-${idea.id}`}><ArrowRight className="h-4 w-4" /></Link></div></article>)}</div> : <EmptyState title="Your idea bank is waiting" description="Generate a few angles above and keep the good ones close." action={<button type="button" onClick={() => setTopic('content ideas for my audience')} className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground" data-testid="button-seed-ideas">Seed the bank</button>} />}</div>
        </Panel>
      </div>
    </div>
  );
}