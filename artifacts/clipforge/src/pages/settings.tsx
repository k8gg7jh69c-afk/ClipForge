import { useEffect, useState } from 'react';
import { Check, Palette, Plus, Save, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { useCreateBrand, useGetSettings, useListBrands, useUpdateBrand, useUpdateSettings } from '@workspace/api-client-react';
import { EmptyState, PageIntro, Panel, SkeletonRows, StatusPill } from '@/components/shared';

const lengths = [15, 30, 45, 60] as const;

export default function Settings() {
  const settings = useGetSettings({ query: { staleTime: 60_000 } });
  const brands = useListBrands(undefined, { query: { staleTime: 60_000 } });
  const updateSettings = useUpdateSettings();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const [brandName, setBrandName] = useState('');
  const [niche, setNiche] = useState('');
  const [tone, setTone] = useState('');
  const [length, setLength] = useState<(typeof lengths)[number]>(30);
  const [visualStyle, setVisualStyle] = useState('');
  const [minimumQualityScore, setMinimumQualityScore] = useState(78);
  const [dailyLimit, setDailyLimit] = useState(3);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!settings.data) return;
    setBrandName(settings.data.brandName);
    setNiche(settings.data.defaultNiche);
    setTone(settings.data.defaultTone);
    setLength(settings.data.defaultLength as (typeof lengths)[number]);
    setVisualStyle(settings.data.defaultVisualStyle);
    setMinimumQualityScore(settings.data.minimumQualityScore);
    setDailyLimit(settings.data.dailyPublishingLimit);
  }, [settings.data]);

  const save = () => {
    updateSettings.mutate(
      { data: { brandName, defaultNiche: niche, defaultTone: tone, defaultLength: length, defaultVisualStyle: visualStyle, minimumQualityScore, dailyPublishingLimit: dailyLimit } },
      { onSuccess: () => { setSaved(true); window.setTimeout(() => setSaved(false), 2400); settings.refetch(); } },
    );
  };

  const addBrand = () => {
    if (!brandName.trim() || !niche.trim()) return;
    createBrand.mutate({ data: { name: brandName.trim(), niche: niche.trim(), tone, visualStyle, defaultLength: length } }, { onSuccess: () => brands.refetch() });
  };

  if (settings.isLoading) return <><PageIntro eyebrow="Studio control / settings" title="Set the room up your way." description="Loading your studio controls." /><SkeletonRows count={5} /></>;

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Studio control / settings"
        title="Set the room up your way."
        description="Defaults keep every brief moving quickly without flattening your creative point of view."
        action={saved ? <span className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-xs font-semibold text-accent"><Check className="h-3.5 w-3.5" /> Settings saved</span> : <button type="button" onClick={save} disabled={updateSettings.isPending} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-[3px_3px_0_hsl(var(--accent))] disabled:opacity-50" data-testid="button-save-settings"><Save className="h-3.5 w-3.5" /> {updateSettings.isPending ? 'Saving…' : 'Save changes'}</button>}
      />

      {settings.isError ? (
        <EmptyState title="Settings aren't available" description="We couldn't load your studio controls. Try again." action={<button type="button" onClick={() => settings.refetch()} className="rounded-xl bg-foreground px-4 py-2 text-xs text-background" data-testid="button-retry-settings">Retry settings</button>} />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
          <Panel>
            <div className="flex items-center gap-3 border-b border-border pb-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-accent"><Palette className="h-5 w-5" /></span>
              <div><h2 className="font-['Space_Grotesk'] text-lg font-semibold">Brand defaults</h2><p className="text-xs text-muted-foreground">The creative baseline for every new generation.</p></div>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {[
                ['Brand name', brandName, setBrandName, 'Your studio or brand', 'input-settings-brand-name'],
                ['Default niche', niche, setNiche, 'e.g. home, food, finance', 'input-settings-niche'],
                ['Default tone', tone, setTone, 'Warm and conversational', 'input-settings-tone'],
                ['Visual style', visualStyle, setVisualStyle, 'Clean studio', 'input-settings-visual-style'],
              ].map(([label, value, setter, placeholder, testId]) => (
                <label key={label as string} className="block"><span className="mb-2 block text-xs font-semibold">{label as string}</span><input value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} placeholder={placeholder as string} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-accent" data-testid={testId as string} /></label>
              ))}
              <div><span className="mb-2 block text-xs font-semibold">Default length</span><div className="grid grid-cols-4 gap-1 rounded-xl border border-input p-1">{lengths.map((item) => <button type="button" key={item} onClick={() => setLength(item)} className={`rounded-lg py-2 text-xs font-semibold ${length === item ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'}`} data-testid={`button-settings-length-${item}`}>{item}s</button>)}</div></div>
            </div>
            <div className="mt-7 rounded-xl border border-dashed border-border p-4">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /><span className="text-xs font-semibold">Brand profiles</span><span className="ml-auto font-mono text-[10px] text-muted-foreground">{brands.data?.length || 0} saved</span></div>
              <div className="mt-3 space-y-2">
                {brands.isLoading ? <SkeletonRows count={2} /> : brands.data?.length ? brands.data.map((brand) => <div key={brand.id} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2.5"><div><p className="text-xs font-medium">{brand.name}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{brand.niche} · {brand.defaultLength}s</p></div><button type="button" onClick={() => updateBrand.mutate({ id: brand.id, data: { name: brand.name, niche: brand.niche, tone, visualStyle, defaultLength: length } }, { onSuccess: () => brands.refetch() })} className="rounded-lg p-2 text-muted-foreground hover:bg-card hover:text-accent" data-testid={`button-update-brand-${brand.id}`}><Save className="h-3.5 w-3.5" /></button></div>) : <p className="text-xs text-muted-foreground">Your first saved profile will appear here.</p>}
              </div>
            </div>
            <button type="button" onClick={addBrand} disabled={createBrand.isPending || !brandName.trim() || !niche.trim()} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:border-accent/40 disabled:opacity-50" data-testid="button-save-brand-profile"><Plus className="h-3.5 w-3.5" /> Save as brand profile</button>
          </Panel>

          <div className="space-y-5">
            <Panel>
              <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-accent"><SlidersHorizontal className="h-4 w-4" /></span><div><h2 className="font-['Space_Grotesk'] text-lg font-semibold">Guardrails</h2><p className="text-xs text-muted-foreground">Protect quality without slowing momentum.</p></div></div>
              <div className="mt-7 space-y-7">
                <label className="block"><div className="flex justify-between text-xs font-semibold"><span>Minimum quality score</span><span className="font-mono text-accent">{minimumQualityScore}</span></div><input type="range" min="0" max="100" value={minimumQualityScore} onChange={(event) => setMinimumQualityScore(Number(event.target.value))} className="mt-4 w-full accent-[hsl(var(--primary))]" data-testid="input-quality-threshold" /><div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground"><span>Loose</span><span>Studio ready</span></div></label>
                <label className="block"><div className="flex justify-between text-xs font-semibold"><span>Daily publishing limit</span><span className="font-mono text-accent">{dailyLimit} posts</span></div><input type="range" min="1" max="20" value={dailyLimit} onChange={(event) => setDailyLimit(Number(event.target.value))} className="mt-4 w-full accent-[hsl(var(--primary))]" data-testid="input-publishing-limit" /><div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground"><span>1 / day</span><span>20 / day</span></div></label>
              </div>
            </Panel>
            <Panel className="bg-secondary text-secondary-foreground"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Current policy</p><p className="mt-3 font-['Space_Grotesk'] text-2xl font-bold leading-tight tracking-[-0.04em]">Only release work you would stop scrolling for.</p><div className="mt-5 flex items-center justify-between border-t border-secondary-foreground/10 pt-4 text-xs"><span className="text-secondary-foreground/60">Approval threshold</span><StatusPill status={`${minimumQualityScore}+ quality`} /></div></Panel>
          </div>
        </div>
      )}
    </div>
  );
}