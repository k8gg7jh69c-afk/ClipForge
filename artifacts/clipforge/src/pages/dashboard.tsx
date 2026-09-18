import { ArrowUpRight, CheckCircle2, Clock3, Eye, Film, Plus, Sparkles, WandSparkles } from 'lucide-react';
import { Link } from 'wouter';
import { useGetDashboard, useGetJob, useListJobs } from '@workspace/api-client-react';
import { EmptyState, MiniBars, PageIntro, Panel, SectionHeading, SkeletonRows, StatCard, StatusPill, VideoThumb } from '@/components/shared';

export default function Dashboard() {
  const dashboard = useGetDashboard({ query: { staleTime: 20_000 } });
  const jobs = useListJobs({ query: { staleTime: 10_000 } });
  const activeJob = jobs.data?.find((job) => ['processing', 'queued', 'generating'].includes(job.status));
  const activeJobDetail = useGetJob(activeJob?.id || '', { query: { enabled: Boolean(activeJob?.id), queryKey: ['/api/jobs', activeJob?.id || ''] } });
  const data = dashboard.data;

  if (dashboard.isLoading) return <><PageIntro eyebrow="Production room / overview" title="Good morning, Maya." description="Your studio pulse at a glance." /><SkeletonRows count={5} /></>;
  if (dashboard.isError) return <EmptyState title="The studio is taking a breath." description="We couldn't load your workspace right now. Try refreshing the overview." action={<button type="button" onClick={() => dashboard.refetch()} className="rounded-xl bg-foreground px-4 py-2 text-xs font-semibold text-background" data-testid="button-retry-dashboard">Retry overview</button>} />;

  const metrics = data?.metrics;
  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Production room / overview" title="Good morning, Maya." description="A focused view of what is moving, what is ready, and what deserves your next decision." action={<Link href="/create" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[3px_3px_0_hsl(var(--accent))] transition-transform hover:-translate-y-0.5" data-testid="button-create-first-video"><Plus className="h-4 w-4" /> Create a video</Link>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Videos created" value={metrics?.videosCreated ?? 0} detail="all time" icon={Film} />
        <StatCard label="Awaiting approval" value={metrics?.awaitingApproval ?? 0} detail="needs review" icon={Clock3} accent />
        <StatCard label="Published" value={metrics?.published ?? 0} detail="all time" icon={CheckCircle2} />
        <StatCard label="Total views" value={Intl.NumberFormat('en', { notation: 'compact' }).format(metrics?.totalViews ?? 0)} detail="all time" icon={Eye} />
        <StatCard label="Average views" value={Intl.NumberFormat('en', { notation: 'compact' }).format(metrics?.averageViews ?? 0)} detail="per clip" icon={WandSparkles} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_.85fr]">
        <Panel className="cf-reveal-delay">
          <SectionHeading title="Weekly reach" detail="Views across your published clips" href="/analytics" />
          {data?.weeklyViews?.length ? <MiniBars values={data.weeklyViews.map((item) => item.views)} labels={data.weeklyViews.map((item) => item.label)} /> : <EmptyState title="No reach data yet" description="Publish your first clip to start seeing momentum here." />}
        </Panel>
        <Panel className="cf-reveal-delay-2">
          <SectionHeading title="Studio rhythm" detail="Live generation activity" />
          {activeJob ? <div className="rounded-xl border border-primary/30 bg-primary/10 p-4"><div className="flex items-center justify-between"><StatusPill status={activeJob.status} /><span className="font-mono text-xs text-muted-foreground">{activeJob.progress}%</span></div><p className="mt-4 font-['Space_Grotesk'] text-base font-semibold">Your next clip is taking shape.</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Job {activeJob.id.slice(0, 8)} is rendering scenes and sound.</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-primary/20"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${activeJobDetail.data?.progress ?? activeJob.progress}%` }} /></div><Link href="/create" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-accent" data-testid="link-view-active-job">Open creation room <ArrowUpRight className="h-3 w-3" /></Link></div> : <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center"><Sparkles className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-medium">The room is clear.</p><p className="mt-1 text-xs text-muted-foreground">Start a new idea when the spark hits.</p></div>}
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Panel>
          <SectionHeading title="Recent videos" detail="Your latest work" href="/videos" />
          {data?.recentVideos?.length ? <div className="grid gap-3 sm:grid-cols-2">{data.recentVideos.slice(0, 4).map((video) => <Link href="/videos" key={video.id} className="group flex gap-3 rounded-xl border border-border p-3 transition-colors hover:border-accent/40 hover:bg-accent/5" data-testid={`card-recent-video-${video.id}`}><VideoThumb title={video.title} url={video.thumbnailUrl} compact /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{video.title}</p><p className="mt-1 text-xs text-muted-foreground">{video.duration}s · {video.template}</p><div className="mt-2"><StatusPill status={video.status} /></div></div></Link>)}</div> : <EmptyState title="No clips in the room" description="Give your first idea a brief and let ClipForge build the rough cut." action={<Link href="/create" className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground" data-testid="button-empty-create">Start a clip</Link>} />}
        </Panel>
        <Panel>
          <SectionHeading title="Recent jobs" detail="Generation timeline" />
          {jobs.isLoading ? <SkeletonRows count={3} /> : jobs.data?.length ? <div className="space-y-1">{jobs.data.slice(0, 5).map((job) => <div key={job.id} className="flex items-center gap-3 border-b border-border py-3 last:border-0"><span className={`grid h-8 w-8 place-items-center rounded-lg ${job.status === 'completed' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}><WandSparkles className="h-3.5 w-3.5" /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{job.type || 'Video generation'}</p><p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{job.id.slice(0, 10)}</p></div><StatusPill status={job.status} /></div>)}</div> : <p className="py-10 text-center text-sm text-muted-foreground">No jobs logged yet.</p>}
        </Panel>
      </div>
    </div>
  );
}