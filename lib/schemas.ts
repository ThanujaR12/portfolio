import { z } from "zod";

// Executable form of specs/001-developer-portfolio/contracts/content-schema.md

const httpsUrl = z.url({ protocol: /^https$/ });
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "lowercase words separated by dashes");

export const screenshotSchema = z.object({
  src: z.string().startsWith("/uploads/"),
  alt: z.string().min(5).max(140),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  cover: z.boolean().optional(),
});

export const githubFieldsSchema = z.object({
  description: z.string().nullable(),
  url: httpsUrl,
  homepage: httpsUrl.nullable(),
  languages: z.record(z.string(), z.number().nonnegative()),
  topics: z.array(z.string()),
  stars: z.number().int().nonnegative(),
  isFork: z.boolean(),
  isArchived: z.boolean(),
  pushedAt: z.iso.datetime(),
  readmeExcerpt: z.string().max(4000),
});

export const projectStatusSchema = z.enum(["pending", "published", "hidden"]);
export const projectFlagSchema = z.enum(["needs-content", "removed-from-github"]);

export const curatedFieldsSchema = z.object({
  slug,
  title: z.string().max(60).optional(),
  summary: z.string().max(160).optional(),
  problem: z.string().max(1200).optional(),
  role: z.string().max(80).optional(),
  highlights: z.array(z.string().max(140)).max(6),
  tags: z.array(z.string().max(30)).max(12),
  demoUrl: httpsUrl.nullable().optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  screenshots: z.array(screenshotSchema).max(8),
});

export const projectSchema = curatedFieldsSchema.extend({
  id: z.number().int(),
  repoName: z.string(),
  github: githubFieldsSchema,
  status: projectStatusSchema,
  featured: z.boolean(),
  order: z.number().int().nonnegative(),
  flags: z.array(projectFlagSchema),
  firstSeenAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const projectsFileSchema = z
  .object({ version: z.literal(1), projects: z.array(projectSchema) })
  .superRefine(({ projects }, ctx) => {
    const unique = (values: unknown[]) => new Set(values).size === values.length;
    if (!unique(projects.map((p) => p.id))) ctx.addIssue({ code: "custom", message: "duplicate id" });
    if (!unique(projects.map((p) => p.slug)))
      ctx.addIssue({ code: "custom", message: "duplicate slug" });
    if (projects.filter((p) => p.featured && p.status === "published").length > 3)
      ctx.addIssue({ code: "custom", message: "too_many_featured" });
    for (const p of projects) {
      if (p.screenshots.filter((s) => s.cover).length > 1)
        ctx.addIssue({ code: "custom", message: `multiple covers on ${p.slug}` });
    }
  });

export const profileSchema = z.object({
  version: z.literal(1),
  name: z.string().max(60),
  positioning: z.string().max(90),
  bio: z.string().max(1200),
  photo: z.string().startsWith("/uploads/").nullable(),
  currentFocus: z.string().max(140),
  highlights: z
    .array(z.object({ label: z.string(), detail: z.string(), period: z.string().optional() }))
    .max(8),
  links: z.object({
    email: z.email(),
    github: httpsUrl,
    linkedin: httpsUrl.nullable(),
  }),
  resume: z.object({
    path: z.string(),
    updatedAt: z.iso.datetime().nullable(),
    text: z.string(),
  }),
  suggestedQuestions: z.array(z.string().max(80)).min(3).max(4),
});

export const syncRunSchema = z.object({
  at: z.iso.datetime(),
  trigger: z.enum(["cron", "manual"]),
  ok: z.boolean(),
  added: z.array(z.string()),
  updated: z.array(z.string()),
  removed: z.array(z.string()),
  error: z.string().optional(),
});

export const syncLogFileSchema = z.object({
  version: z.literal(1),
  runs: z.array(syncRunSchema).max(30),
});

export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(1000),
      }),
    )
    .min(1)
    .max(10)
    .refine((m) => m.at(-1)?.role === "user", "last message must be from the user"),
});

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(80, "Keep your name under 80 characters."),
  email: z.email("Please enter a valid email address.").max(200),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least a sentence (10+ characters).")
    .max(2000, "Keep the message under 2,000 characters."),
  // Honeypot: real visitors never see or fill this field.
  website: z.string().max(200).optional().default(""),
  startedAt: z.number().int().nonnegative(),
});

// Admin request bodies (contracts/http-api.md).
export const boardUpdateSchema = z.object({
  columns: z.object({
    pending: z.array(z.number().int()),
    published: z.array(z.number().int()),
    hidden: z.array(z.number().int()),
  }),
  featured: z.array(z.number().int()).max(3, "too_many_featured"),
});

export const curatedPatchSchema = curatedFieldsSchema
  .extend({
    title: z.string().trim().max(60),
    summary: z.string().trim().max(160),
    problem: z.string().trim().max(1200),
    role: z.string().trim().max(80),
    highlights: z.array(z.string().trim().min(1).max(140)).max(6),
    tags: z.array(z.string().trim().min(1).max(30)).max(12),
  })
  .partial();

export const profilePatchSchema = profileSchema.omit({ version: true, resume: true }).partial();

export type Screenshot = z.infer<typeof screenshotSchema>;
export type Project = z.infer<typeof projectSchema>;
export type ProjectsFile = z.infer<typeof projectsFileSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type SyncRun = z.infer<typeof syncRunSchema>;
export type SyncLogFile = z.infer<typeof syncLogFileSchema>;
