import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  analyticsTable,
  brandsTable,
  contentIdeasTable,
  jobsTable,
  postsTable,
  settingsTable,
  usersTable,
  videosTable,
} from "@workspace/db";
import {
  CreateBrandBody,
  CreateBrandResponse,
  CreatePostBody,
  CreatePostResponse,
  CreateVideoBody,
  CreateVideoResponse,
  GenerateIdeasBody,
  GenerateIdeasResponse,
  GenerateScriptBody,
  GenerateScriptResponse,
  GetAnalyticsResponse,
  GetDashboardResponse,
  GetJobParams,
  GetJobResponse,
  GetRecommendationsResponse,
  GetSettingsResponse,
  GetVideoParams,
  GetVideoResponse,
  ListBrandsResponse,
  ListIdeasQueryParams,
  ListIdeasResponse,
  ListJobsResponse,
  ListPostsResponse,
  ListVideosQueryParams,
  ListVideosResponse,
  UpdateBrandBody,
  UpdateBrandParams,
  UpdateBrandResponse,
  UpdatePostBody,
  UpdatePostParams,
  UpdatePostResponse,
  UpdateSettingsBody,
  UpdateSettingsResponse,
  UpdateVideoBody,
  UpdateVideoParams,
  UpdateVideoResponse,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const USER_ID = "demo-user";
const BRAND_ID = "demo-brand";
const SETTINGS_ID = "demo-settings";
const MEDIA_ROOT = path.resolve(process.cwd(), "artifacts/api-server/media");
let seedPromise: Promise<void> | undefined;

type Scene = {
  sceneNumber: number;
  duration: number;
  visualPrompt: string;
  narration: string;
};

function thumbnail(title: string, accent: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="960" viewBox="0 0 540 960"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#111827"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs><rect width="540" height="960" fill="url(#g)"/><circle cx="420" cy="180" r="180" fill="white" opacity=".08"/><circle cx="90" cy="770" r="230" fill="white" opacity=".06"/><text x="40" y="770" fill="white" font-family="Arial" font-size="34" font-weight="700">${title.slice(0, 24)}</text><text x="40" y="820" fill="white" opacity=".68" font-family="Arial" font-size="18">CLIPFORGE ORIGINAL</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function iso(value: Date | string | null | undefined) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toVideo(video: typeof videosTable.$inferSelect) {
  return {
    id: video.id,
    title: video.title,
    topic: video.topic,
    duration: video.duration,
    status: video.status,
    qualityScore: video.qualityScore,
    hookScore: video.hookScore,
    clarityScore: video.clarityScore,
    originalityScore: video.originalityScore,
    captionScore: video.captionScore,
    thumbnailUrl: video.thumbnailUrl,
    videoUrl: video.videoUrl,
    template: video.template,
    script: video.scriptText,
    hook: video.hook,
    createdAt: iso(video.createdAt),
    progress:
      video.status === "completed" || video.status === "approved" || video.status === "published"
        ? 100
        : 0,
  };
}

function toJob(job: typeof jobsTable.$inferSelect) {
  return {
    id: job.id,
    videoId: job.videoId,
    type: job.type,
    status: job.status,
    progress: job.progress,
    error: job.error,
    createdAt: iso(job.createdAt),
    completedAt: iso(job.completedAt),
  };
}

async function ensureSeedData() {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    await db.insert(usersTable).values({ id: USER_ID, email: "studio@clipforge.local" }).onConflictDoNothing();
    await db.insert(brandsTable).values({
      id: BRAND_ID,
      userId: USER_ID,
      name: "Northstar Studio",
      niche: "Creator education",
      tone: "Clear and conversational",
      visualStyle: "Editorial gradients",
      defaultLength: 30,
    }).onConflictDoNothing();
    await db.insert(settingsTable).values({
      id: SETTINGS_ID,
      userId: USER_ID,
      brandName: "Northstar Studio",
      defaultNiche: "Creator education",
      defaultTone: "Clear and conversational",
      defaultLength: 30,
      defaultVisualStyle: "Editorial gradients",
      minimumQualityScore: 78,
      dailyPublishingLimit: 5,
    }).onConflictDoNothing();

    const existingVideos = await db.select().from(videosTable).limit(1);
    if (existingVideos.length > 0) return;

    const now = new Date();
    const seedVideos = [
      {
        id: "video-seed-1",
        brandId: BRAND_ID,
        title: "The 3-second rule for better hooks",
        topic: "better hooks",
        duration: 30,
        status: "awaiting_approval",
        qualityScore: 91,
        hookScore: 94,
        clarityScore: 90,
        originalityScore: 88,
        captionScore: 92,
        thumbnailUrl: thumbnail("3-second hooks", "#0ea5e9"),
        videoUrl: null,
        template: "kinetic",
        scriptText: "Your first three seconds decide whether someone keeps watching.",
        hook: "Your first three seconds decide everything.",
        createdAt: new Date(now.getTime() - 1000 * 60 * 48),
      },
      {
        id: "video-seed-2",
        brandId: BRAND_ID,
        title: "Why consistency beats the perfect idea",
        topic: "creative consistency",
        duration: 45,
        status: "published",
        qualityScore: 86,
        hookScore: 87,
        clarityScore: 88,
        originalityScore: 82,
        captionScore: 89,
        thumbnailUrl: thumbnail("Consistency wins", "#8b5cf6"),
        videoUrl: null,
        template: "cinematic",
        scriptText: "The best content system is the one you can keep using.",
        hook: "The perfect idea is usually the one you can repeat.",
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 26),
      },
    ];
    await db.insert(videosTable).values(seedVideos);
    await db.insert(jobsTable).values([
      { id: "job-seed-1", videoId: "video-seed-1", type: "QUALITY_CHECK", status: "completed", progress: 100, attempts: 1, completedAt: seedVideos[0].createdAt },
      { id: "job-seed-2", videoId: "video-seed-2", type: "PUBLISH", status: "completed", progress: 100, attempts: 1, completedAt: seedVideos[1].createdAt },
    ]);
    await db.insert(contentIdeasTable).values([
      { id: "idea-seed-1", brandId: BRAND_ID, title: "The 3-second rule for better hooks", concept: "A practical breakdown of why the first beat determines retention.", hook: "Your first three seconds decide everything.", targetAudience: "Creators building an audience", estimatedDuration: 30, status: "ready" },
      { id: "idea-seed-2", brandId: BRAND_ID, title: "A simple way to find repeatable topics", concept: "Turn one audience question into a month of original posts.", hook: "Stop searching for ideas. Start collecting questions.", targetAudience: "Solo marketers and creators", estimatedDuration: 45, status: "new" },
    ]);
    await db.insert(analyticsTable).values([
      { id: "analytics-seed-1", videoId: "video-seed-2", platform: "youtube", views: 14820, likes: 1102, comments: 86, shares: 214, retention: 64 },
    ]);
  })().catch((error) => {
    seedPromise = undefined;
    logger.error({ error }, "ClipForge seed failed");
    throw error;
  });
  return seedPromise;
}

function buildScenes(topic: string, duration: number): Scene[] {
  const sceneCount = duration <= 15 ? 3 : duration <= 30 ? 4 : 5;
  const sceneDuration = Math.max(2.5, duration / sceneCount);
  const prompts = [
    `Bold editorial opener about ${topic}, abstract light and motion`,
    `Close-up visual metaphor for ${topic}, textured paper and electric accent`,
    `Clean diagram showing the core idea behind ${topic}`,
    `Confident creator at work, warm studio light, vertical composition`,
    `Simple memorable takeaway about ${topic}, high contrast typography`,
  ];
  return prompts.slice(0, sceneCount).map((visualPrompt, index) => ({
    sceneNumber: index + 1,
    duration: sceneDuration,
    visualPrompt,
    narration:
      index === 0
        ? `Here is the part about ${topic} most people miss.`
        : `Use this step to make ${topic} more useful, more repeatable, and easier to remember.`,
  }));
}

async function renderVideo(videoId: string, title: string, duration: number, accent: string) {
  await mkdir(MEDIA_ROOT, { recursive: true });
  const svgPath = path.join(MEDIA_ROOT, `${videoId}.svg`);
  const outputPath = path.join(MEDIA_ROOT, `${videoId}.mp4`);
  const svg = decodeURIComponent(thumbnail(title, accent).split(",")[1]);
  await writeFile(svgPath, svg, "utf8");
  await new Promise<void>((resolve, reject) => {
    const process = spawn("ffmpeg", [
      "-y",
      "-loop", "1",
      "-i", svgPath,
      "-f", "lavfi",
      "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
      "-t", String(Math.min(duration, 60)),
      "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2",
      "-r", "30",
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-shortest",
      outputPath,
    ]);
    process.on("error", reject);
    process.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`))));
  });
  return `/api/media/${videoId}.mp4`;
}

router.get("/dashboard", async (_req, res): Promise<void> => {
  await ensureSeedData();
  const videos = await db.select().from(videosTable).orderBy(desc(videosTable.createdAt));
  const jobs = await db.select().from(jobsTable).orderBy(desc(jobsTable.createdAt)).limit(5);
  const published = videos.filter((video) => video.status === "published").length;
  const awaitingApproval = videos.filter((video) => video.status === "awaiting_approval").length;
  const dashboard = {
    metrics: {
      videosCreated: videos.length,
      awaitingApproval,
      published,
      totalViews: 14820,
      averageViews: published ? Math.round(14820 / published) : 0,
    },
    recentVideos: videos.slice(0, 4).map(toVideo),
    recentJobs: jobs.map(toJob),
    weeklyViews: [
      { label: "Mon", views: 1840 },
      { label: "Tue", views: 3260 },
      { label: "Wed", views: 2910 },
      { label: "Thu", views: 4380 },
      { label: "Fri", views: 5120 },
      { label: "Sat", views: 4680 },
      { label: "Sun", views: 6290 },
    ],
  };
  res.json(GetDashboardResponse.parse(dashboard));
});

router.get("/brands", async (_req, res): Promise<void> => {
  await ensureSeedData();
  const brands = await db.select().from(brandsTable).orderBy(desc(brandsTable.createdAt));
  res.json(ListBrandsResponse.parse(brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    niche: brand.niche,
    tone: brand.tone,
    visualStyle: brand.visualStyle,
    defaultLength: brand.defaultLength,
  }))));
});

router.post("/brands", async (req, res): Promise<void> => {
  const parsed = CreateBrandBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const brand = {
    id: randomUUID(),
    userId: USER_ID,
    name: parsed.data.name,
    niche: parsed.data.niche,
    tone: parsed.data.tone ?? "Clear and conversational",
    visualStyle: parsed.data.visualStyle ?? "Editorial gradients",
    defaultLength: parsed.data.defaultLength ?? 30,
  };
  const [created] = await db.insert(brandsTable).values(brand).returning();
  res.status(201).json(CreateBrandResponse.parse(created));
});

router.patch("/brands/:id", async (req, res): Promise<void> => {
  const params = UpdateBrandParams.safeParse(req.params);
  const body = UpdateBrandBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid brand input" }); return; }
  const [brand] = await db.update(brandsTable).set(body.data).where(eq(brandsTable.id, params.data.id)).returning();
  if (!brand) { res.status(404).json({ error: "Brand not found" }); return; }
  res.json(UpdateBrandResponse.parse(brand));
});

router.get("/ideas", async (req, res): Promise<void> => {
  await ensureSeedData();
  const parsed = ListIdeasQueryParams.safeParse(req.query);
  const ideas = await db.select().from(contentIdeasTable).orderBy(desc(contentIdeasTable.createdAt));
  const filtered = parsed.success && parsed.data.status ? ideas.filter((idea) => idea.status === parsed.data.status) : ideas;
  res.json(ListIdeasResponse.parse(filtered));
});

router.post("/ai/ideas", async (req, res): Promise<void> => {
  await ensureSeedData();
  const parsed = GenerateIdeasBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const brand = parsed.data.brandId
    ? (await db.select().from(brandsTable).where(eq(brandsTable.id, parsed.data.brandId)).limit(1))[0]
    : (await db.select().from(brandsTable).limit(1))[0];
  const count = parsed.data.count ?? 5;
  const concepts = Array.from({ length: count }, (_, index) => {
    const angle = ["a myth worth unlearning", "a simple framework", "a behind-the-scenes lesson", "a surprising comparison", "a quick experiment"][index % 5];
    return {
      id: randomUUID(),
      brandId: brand?.id ?? BRAND_ID,
      title: `${parsed.data.topic}: ${angle}`,
      concept: `An original short-form breakdown of ${parsed.data.topic} through ${angle}.`,
      hook: `Most people get ${parsed.data.topic} backwards.`,
      targetAudience: brand?.niche ?? "Creators and curious learners",
      estimatedDuration: [15, 30, 45][index % 3],
      status: "new",
    };
  });
  const ideas = await db.insert(contentIdeasTable).values(concepts).returning();
  res.status(201).json(GenerateIdeasResponse.parse(ideas));
});

router.post("/ai/script", async (req, res): Promise<void> => {
  const parsed = GenerateScriptBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const scenes = buildScenes(parsed.data.idea, parsed.data.duration);
  res.json(GenerateScriptResponse.parse({
    id: randomUUID(),
    hook: `Most people get ${parsed.data.idea} backwards.`,
    script: scenes.map((scene) => scene.narration).join(" "),
    scenes,
  }));
});

router.get("/videos", async (req, res): Promise<void> => {
  await ensureSeedData();
  const parsed = ListVideosQueryParams.safeParse(req.query);
  const conditions = [];
  if (parsed.success && parsed.data.status) conditions.push(eq(videosTable.status, parsed.data.status));
  if (parsed.success && parsed.data.search) {
    conditions.push(or(ilike(videosTable.title, `%${parsed.data.search}%`), ilike(videosTable.topic, `%${parsed.data.search}%`)));
  }
  const videos = await db.select().from(videosTable).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(videosTable.createdAt));
  res.json(ListVideosResponse.parse(videos.map(toVideo)));
});

router.post("/videos", async (req, res): Promise<void> => {
  await ensureSeedData();
  const parsed = CreateVideoBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const id = randomUUID();
  const jobId = randomUUID();
  const brandId = parsed.data.brandId ?? BRAND_ID;
  const title = `${parsed.data.topic.charAt(0).toUpperCase()}${parsed.data.topic.slice(1)} — an original short`;
  const video = {
    id,
    brandId,
    title,
    topic: parsed.data.topic,
    duration: parsed.data.duration,
    status: "processing",
    qualityScore: 0,
    hookScore: 0,
    clarityScore: 0,
    originalityScore: 0,
    captionScore: 0,
    thumbnailUrl: thumbnail(title, parsed.data.template === "cinematic" ? "#8b5cf6" : "#0ea5e9"),
    videoUrl: null,
    template: parsed.data.template ?? "kinetic",
    scriptText: null,
    hook: null,
  };
  const [created] = await db.insert(videosTable).values(video).returning();
  await db.insert(jobsTable).values({ id: jobId, videoId: id, type: "GENERATE_VIDEO", status: "processing", progress: 8, attempts: 1 });

  void (async () => {
    const stages = [18, 32, 48, 64, 80, 92];
    for (const progress of stages) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await db.update(jobsTable).set({ progress }).where(eq(jobsTable.id, jobId));
    }
    const scenes = buildScenes(parsed.data.topic, parsed.data.duration);
    const scriptText = scenes.map((scene) => scene.narration).join(" ");
    const videoUrl = await renderVideo(id, title, parsed.data.duration, parsed.data.template === "cinematic" ? "#8b5cf6" : "#0ea5e9");
    const scores = { qualityScore: 88, hookScore: 91, clarityScore: 87, originalityScore: 90, captionScore: 86 };
    await db.update(videosTable).set({ status: "awaiting_approval", videoUrl, scriptText, hook: scenes[0].narration, ...scores }).where(eq(videosTable.id, id));
    await db.update(jobsTable).set({ status: "completed", progress: 100, completedAt: new Date() }).where(eq(jobsTable.id, jobId));
  })().catch(async (error) => {
    logger.error({ error, videoId: id }, "Video generation failed");
    await db.update(videosTable).set({ status: "failed" }).where(eq(videosTable.id, id));
    await db.update(jobsTable).set({ status: "failed", error: "Video generation failed" }).where(eq(jobsTable.id, jobId));
  });

  res.status(202).json(CreateVideoResponse.parse({ videoId: created.id, jobId }));
});

router.get("/videos/:id", async (req, res): Promise<void> => {
  await ensureSeedData();
  const parsed = GetVideoParams.safeParse(req.params);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const video = (await db.select().from(videosTable).where(eq(videosTable.id, parsed.data.id)).limit(1))[0];
  if (!video) { res.status(404).json({ error: "Video not found" }); return; }
  res.json(GetVideoResponse.parse(toVideo(video)));
});

router.patch("/videos/:id", async (req, res): Promise<void> => {
  const params = UpdateVideoParams.safeParse(req.params);
  const body = UpdateVideoBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid video input" }); return; }
  const [video] = await db.update(videosTable).set({
    status: body.data.action === "approve" ? "approved" : body.data.action === "reject" ? "rejected" : "processing",
  }).where(eq(videosTable.id, params.data.id)).returning();
  if (!video) { res.status(404).json({ error: "Video not found" }); return; }
  if (body.data.action === "regenerate") {
    await db.insert(jobsTable).values({ id: randomUUID(), videoId: video.id, type: "RENDER_VIDEO", status: "completed", progress: 100, attempts: 1, completedAt: new Date() });
  }
  res.json(UpdateVideoResponse.parse(toVideo(video)));
});

router.get("/jobs", async (_req, res): Promise<void> => {
  await ensureSeedData();
  const jobs = await db.select().from(jobsTable).orderBy(desc(jobsTable.createdAt)).limit(20);
  res.json(ListJobsResponse.parse(jobs.map(toJob)));
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const parsed = GetJobParams.safeParse(req.params);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const job = (await db.select().from(jobsTable).where(eq(jobsTable.id, parsed.data.id)).limit(1))[0];
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }
  res.json(GetJobResponse.parse(toJob(job)));
});

router.get("/publishing", async (_req, res): Promise<void> => {
  await ensureSeedData();
  const rows = await db.select({ post: postsTable, video: videosTable }).from(postsTable).innerJoin(videosTable, eq(postsTable.videoId, videosTable.id)).orderBy(desc(postsTable.createdAt));
  res.json(ListPostsResponse.parse(rows.map(({ post, video }) => ({
    id: post.id,
    videoId: post.videoId,
    videoTitle: video.title,
    platform: post.platform,
    status: post.status,
    scheduledAt: iso(post.scheduledAt),
    platformPostId: post.platformPostId,
  }))));
});

router.post("/publishing", async (req, res): Promise<void> => {
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const video = (await db.select().from(videosTable).where(eq(videosTable.id, parsed.data.videoId)).limit(1))[0];
  if (!video) { res.status(404).json({ error: "Video not found" }); return; }
  const shouldPublish = !parsed.data.scheduledAt;
  const [post] = await db.insert(postsTable).values({
    id: randomUUID(),
    videoId: video.id,
    platform: parsed.data.platform,
    status: shouldPublish ? "uploading" : "queued",
    scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
    platformPostId: shouldPublish ? `mock_${randomUUID().slice(0, 8)}` : null,
  }).returning();
  if (shouldPublish) await db.update(videosTable).set({ status: "published" }).where(eq(videosTable.id, video.id));
  res.status(201).json(CreatePostResponse.parse({
    id: post.id,
    videoId: post.videoId,
    videoTitle: video.title,
    platform: post.platform,
    status: shouldPublish ? "published" : post.status,
    scheduledAt: iso(post.scheduledAt),
    platformPostId: shouldPublish ? post.platformPostId : null,
  }));
});

router.patch("/publishing/:id", async (req, res): Promise<void> => {
  const params = UpdatePostParams.safeParse(req.params);
  const body = UpdatePostBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid post input" }); return; }
  const [post] = await db.update(postsTable).set({
    status: body.data.action === "publish" ? "published" : "queued",
    scheduledAt: body.data.scheduledAt ? new Date(body.data.scheduledAt) : undefined,
    platformPostId: body.data.action === "publish" ? `mock_${randomUUID().slice(0, 8)}` : undefined,
  }).where(eq(postsTable.id, params.data.id)).returning();
  if (!post) { res.status(404).json({ error: "Post not found" }); return; }
  const video = (await db.select().from(videosTable).where(eq(videosTable.id, post.videoId)).limit(1))[0];
  res.json(UpdatePostResponse.parse({
    id: post.id,
    videoId: post.videoId,
    videoTitle: video?.title ?? "ClipForge video",
    platform: post.platform,
    status: post.status,
    scheduledAt: iso(post.scheduledAt),
    platformPostId: post.platformPostId,
  }));
});

router.get("/analytics", async (_req, res): Promise<void> => {
  await ensureSeedData();
  res.json(GetAnalyticsResponse.parse({
    summary: { views: 14820, likes: 1102, comments: 86, shares: 214, retention: 64 },
    viewsOverTime: [{ label: "Mon", views: 1840 }, { label: "Tue", views: 3260 }, { label: "Wed", views: 2910 }, { label: "Thu", views: 4380 }, { label: "Fri", views: 5120 }, { label: "Sat", views: 4680 }, { label: "Sun", views: 6290 }],
    byTopic: [{ label: "Hooks", value: 84 }, { label: "Consistency", value: 72 }, { label: "Workflow", value: 61 }, { label: "Strategy", value: 48 }],
    byLength: [{ label: "15s", value: 58 }, { label: "30s", value: 76 }, { label: "45s", value: 69 }, { label: "60s", value: 51 }],
    byHook: [{ label: "Curiosity", value: 88 }, { label: "Contrarian", value: 72 }, { label: "How-to", value: 64 }, { label: "Story", value: 57 }],
  }));
});

router.get("/settings", async (_req, res): Promise<void> => {
  await ensureSeedData();
  const settings = (await db.select().from(settingsTable).where(eq(settingsTable.id, SETTINGS_ID)).limit(1))[0];
  res.json(GetSettingsResponse.parse(settings));
});

router.patch("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [settings] = await db.update(settingsTable).set(parsed.data).where(eq(settingsTable.id, SETTINGS_ID)).returning();
  res.json(UpdateSettingsResponse.parse(settings));
});

router.post("/ai/recommendations", async (_req, res): Promise<void> => {
  res.json(GetRecommendationsResponse.parse({
    recommendedTopics: ["hook writing", "repeatable creative systems", "audience questions"],
    recommendedLength: 30,
    recommendedHookStyles: ["curiosity gap", "specific promise", "counterintuitive truth"],
    recommendedVisualStyles: ["editorial gradients", "kinetic typography", "warm studio"],
  }));
});

export default router;