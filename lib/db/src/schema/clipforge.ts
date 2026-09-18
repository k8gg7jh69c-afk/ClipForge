import { createInsertSchema } from "drizzle-zod";
import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const brandsTable = pgTable("brands", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  niche: text("niche").notNull(),
  tone: text("tone").notNull().default("Clear and conversational"),
  visualStyle: text("visual_style").notNull().default("Editorial gradients"),
  defaultLength: integer("default_length").notNull().default(30),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contentIdeasTable = pgTable("content_ideas", {
  id: text("id").primaryKey(),
  brandId: text("brand_id").notNull(),
  title: text("title").notNull(),
  concept: text("concept").notNull(),
  hook: text("hook").notNull(),
  targetAudience: text("target_audience").notNull(),
  estimatedDuration: integer("estimated_duration").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scriptsTable = pgTable("scripts", {
  id: text("id").primaryKey(),
  ideaId: text("idea_id"),
  hook: text("hook").notNull(),
  script: text("script").notNull(),
  scenes: jsonb("scenes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const assetsTable = pgTable("assets", {
  id: text("id").primaryKey(),
  scriptId: text("script_id").notNull(),
  kind: text("kind").notNull(),
  url: text("url").notNull(),
  prompt: text("prompt"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const videosTable = pgTable("videos", {
  id: text("id").primaryKey(),
  brandId: text("brand_id"),
  scriptId: text("script_id"),
  title: text("title").notNull(),
  topic: text("topic").notNull(),
  duration: integer("duration").notNull(),
  status: text("status").notNull().default("processing"),
  qualityScore: integer("quality_score").notNull().default(0),
  hookScore: integer("hook_score").notNull().default(0),
  clarityScore: integer("clarity_score").notNull().default(0),
  originalityScore: integer("originality_score").notNull().default(0),
  captionScore: integer("caption_score").notNull().default(0),
  thumbnailUrl: text("thumbnail_url").notNull(),
  videoUrl: text("video_url"),
  template: text("template").notNull().default("kinetic"),
  scriptText: text("script_text"),
  hook: text("hook"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const captionsTable = pgTable("captions", {
  id: text("id").primaryKey(),
  videoId: text("video_id").notNull(),
  text: text("text").notNull(),
  startMs: integer("start_ms").notNull(),
  endMs: integer("end_ms").notNull(),
});

export const postsTable = pgTable("posts", {
  id: text("id").primaryKey(),
  videoId: text("video_id").notNull(),
  platform: text("platform").notNull(),
  status: text("status").notNull().default("queued"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  platformPostId: text("platform_post_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const analyticsTable = pgTable("analytics", {
  id: text("id").primaryKey(),
  videoId: text("video_id"),
  platform: text("platform").notNull(),
  views: integer("views").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  retention: integer("retention").notNull().default(0),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jobsTable = pgTable("jobs", {
  id: text("id").primaryKey(),
  videoId: text("video_id"),
  type: text("type").notNull(),
  status: text("status").notNull().default("queued"),
  progress: integer("progress").notNull().default(0),
  attempts: integer("attempts").notNull().default(0),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const socialAccountsTable = pgTable("social_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  platform: text("platform").notNull(),
  status: text("status").notNull().default("disconnected"),
});

export const settingsTable = pgTable("settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  brandName: text("brand_name").notNull(),
  defaultNiche: text("default_niche").notNull(),
  defaultTone: text("default_tone").notNull(),
  defaultLength: integer("default_length").notNull(),
  defaultVisualStyle: text("default_visual_style").notNull(),
  minimumQualityScore: integer("minimum_quality_score").notNull(),
  dailyPublishingLimit: integer("daily_publishing_limit").notNull(),
});

export const insertBrandSchema = createInsertSchema(brandsTable).omit({
  createdAt: true,
});
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Brand = typeof brandsTable.$inferSelect;