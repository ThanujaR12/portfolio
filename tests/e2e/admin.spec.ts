import { copyFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import sharp from "sharp";
import { content } from "./content";

// Runs in its own Playwright project after the others, because it edits content/ on disk
// (CONTENT_SOURCE=fs). Everything it changes is restored afterwards.
// Needs ADMIN_DEV_LOGIN=1 in .env.local for the development-only sign-in.

const CONTENT = ["projects.json", "profile.json", "sync-log.json"].map((f) => path.join("content", f));
const UPLOADS = path.join("public", "uploads");
const RESUME = path.join("public", "resume.pdf");
let uploadsBefore: Set<string>;
let hadResume: boolean;

test.describe.configure({ mode: "serial" });

test.beforeAll(() => {
  for (const f of CONTENT) copyFileSync(f, `${f}.e2e-backup`);
  uploadsBefore = new Set(readdirSync(UPLOADS));
  hadResume = existsSync(RESUME);
  if (hadResume) copyFileSync(RESUME, `${RESUME}.e2e-backup`);
});

test.afterAll(() => {
  for (const f of CONTENT) {
    copyFileSync(`${f}.e2e-backup`, f);
    rmSync(`${f}.e2e-backup`);
  }
  for (const f of readdirSync(UPLOADS)) if (!uploadsBefore.has(f)) rmSync(path.join(UPLOADS, f));
  if (hadResume) {
    copyFileSync(`${RESUME}.e2e-backup`, RESUME);
    rmSync(`${RESUME}.e2e-backup`);
  } else rmSync(RESUME, { force: true });
});

/** A tiny valid one-page PDF containing the given line of text. */
function makePdf(text: string): Buffer {
  const stream = `BT /F1 18 Tf 72 720 Td (${text}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = objects.map((body, i) => {
    const at = pdf.length;
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
    return at;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) pdf += `${String(o).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}

async function signIn(page: Page, who: "owner" | "other user") {
  await page.goto("/admin/signin");
  await page.getByRole("button", { name: `Dev: ${who}` }).click();
  if (who === "owner") await expect(page.getByRole("heading", { name: "Portfolio control room" })).toBeVisible();
}

/** Clicks and waits for the board save to be confirmed by the server. */
async function boardAction(page: Page, click: () => Promise<void>) {
  const saved = page.waitForResponse((r) => r.url().endsWith("/api/admin/projects") && r.request().method() === "PATCH");
  await click();
  expect((await saved).status()).toBe(200);
}

const tile = (page: Page, column: string, title: string) =>
  page.getByRole("region", { name: new RegExp(column) }).getByRole("listitem").filter({ hasText: title });

test("admin routes refuse requests without the owner session", async ({ request }) => {
  const calls = [
    request.get("/api/admin/projects"),
    request.patch("/api/admin/projects", { data: {} }),
    request.patch("/api/admin/projects/1", { data: {} }),
    request.patch("/api/admin/profile", { data: {} }),
    request.post("/api/admin/sync"),
    request.post("/api/admin/uploads", { multipart: { kind: "photo" } }),
    request.post("/api/admin/resume", { multipart: { kind: "x" } }),
    request.get("/api/cron/sync"),
  ];
  for (const res of await Promise.all(calls)) expect(res.status(), res.url()).toBe(401);
});

test("signed-out visitors are sent to sign-in; other accounts are refused", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/signin$/);
  await signIn(page, "other user");
  await expect(page.getByText("That GitHub account isn't allowed to manage this portfolio.")).toBeVisible();
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/signin/);
});

test("owner hides, republishes and features a project from the board", async ({ page }) => {
  await signIn(page, "owner");
  await expect(page.getByRole("heading", { name: "Portfolio control room" })).toBeVisible();

  await boardAction(page, () => tile(page, "Published", "Campus Connect").getByRole("button", { name: "Hide" }).click());
  await expect(tile(page, "Hidden", "Campus Connect")).toBeVisible();
  await page.goto("/work");
  await expect(page.locator("#projects").getByRole("article")).toHaveCount(content.published - 1);

  await page.goto("/admin");
  await boardAction(page, () => tile(page, "Hidden", "Campus Connect").getByRole("button", { name: "Publish" }).click());
  await expect(tile(page, "Published", "Campus Connect")).toBeVisible();
  await boardAction(page, () => page.getByRole("button", { name: "Feature Campus Connect" }).click());
  await expect(page.getByRole("button", { name: "Unfeature Campus Connect" })).toBeVisible();
  const list = await (await page.request.get("/api/admin/projects")).json();
  const campus = list.projects.find((p: { slug: string }) => p.slug === "campus-connect");
  expect(campus.featured).toBe(true);
  await page.goto("/");
  await expect(page.locator("#work").getByRole("link", { name: "Campus Connect", exact: true })).toBeVisible();
});

test("owner edits a case study with a screenshot and sees it live", async ({ page }) => {
  await signIn(page, "owner");
  await tile(page, "Published", "Campus Connect").getByRole("button", { name: "Edit" }).click();
  const editor = page.getByRole("dialog", { name: /Edit Campus Connect/ });
  await editor.getByLabel(/One-line summary/).fill("A campus companion app for students, edited in admin.");
  await editor.getByLabel(/The problem/).fill("Students juggle **too many** campus apps.");

  const png = await sharp({ create: { width: 1200, height: 750, channels: 3, background: "#22d3ee" } }).png().toBuffer();
  await editor.locator('input[type="file"]').setInputFiles({ name: "shot.png", mimeType: "image/png", buffer: png });
  await expect(editor.getByLabel("Alt text for screenshot 1")).toBeVisible();
  await editor.getByLabel("Alt text for screenshot 1").fill("Campus Connect home screen");

  await expect(editor.getByRole("complementary", { name: "Live preview" })).toContainText("edited in admin");
  await editor.getByRole("button", { name: "Save" }).click();
  await expect(editor.getByRole("status")).toContainText("Saved");

  const results = await new AxeBuilder({ page }).include("dialog[open]").withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);

  await page.goto("/projects/campus-connect");
  await expect(page.getByText("A campus companion app for students, edited in admin.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Why it exists" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "A closer look" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Campus Connect home screen" }).first()).toBeVisible();
});

test("published projects can't change their URL; invalid input is rejected", async ({ page }) => {
  await signIn(page, "owner");
  const res = await page.request.patch("/api/admin/projects/1029402005", { data: { slug: "new-url" } });
  expect(res.status()).toBe(409);
  expect((await res.json()).error.code).toBe("slug_locked");
  const bad = await page.request.patch("/api/admin/projects/1029402005", { data: { demoUrl: "http://insecure" } });
  expect(bad.status()).toBe(400);
  const tooMany = await page.request.patch("/api/admin/projects", {
    data: { columns: { pending: [], published: [1, 2, 3, 4], hidden: [] }, featured: [1, 2, 3, 4] },
  });
  expect(tooMany.status()).toBe(400);
});

test("owner edits the profile and the home page updates", async ({ page }) => {
  await signIn(page, "owner");
  await page.getByRole("tab", { name: "Profile & resume" }).click();
  await page.getByLabel("Current focus").fill("Open to Summer 2027 software engineering internships.");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
  await page.goto("/about");
  await expect(page.getByText("Open to Summer 2027 software engineering internships.").first()).toBeVisible();
});

test("owner edits the hero statement without losing other hero fields", async ({ page }) => {
  await signIn(page, "owner");
  await page.getByRole("tab", { name: "Profile & resume" }).click();
  await page.getByLabel(/Hero statement/).fill("I build **careful software** for real people.");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
  await page.goto("/");
  const statement = page.locator("#hero-title");
  await expect(statement).toHaveText("I build careful software for real people.");
  await expect(statement.locator("strong")).toHaveText("careful software");
  await expect(page.getByRole("complementary", { name: "Currently" })).toContainText(content.openTo);
});

test("owner uploads a resume; the resume page shows it and Ask AI can use it", async ({ page }) => {
  await signIn(page, "owner");
  await page.getByRole("tab", { name: "Profile & resume" }).click();
  await page.locator('input[accept="application/pdf"]').setInputFiles({
    name: "resume.pdf",
    mimeType: "application/pdf",
    buffer: makePdf("E2E Test Resume - Skills: Kubernetes"),
  });
  await expect(page.getByText("The AI guide now knows its contents")).toBeVisible();

  await page.goto("/resume");
  await expect(page.getByRole("link", { name: "Download PDF" })).toHaveAttribute("href", "/resume.pdf");
  await page.getByText("Text version").click();
  await expect(page.getByText("E2E Test Resume - Skills: Kubernetes")).toBeVisible();
  const pdf = await page.request.get("/resume.pdf");
  expect(pdf.headers()["content-type"]).toContain("application/pdf");

  const bad = await page.request.post("/api/admin/resume", {
    multipart: { file: { name: "x.pdf", mimeType: "application/pdf", buffer: Buffer.from("not a pdf") } },
  });
  expect(bad.status()).toBe(400);
});

test("Sync now reports the result", async ({ page }) => {
  test.slow();
  await signIn(page, "owner");
  await page.getByRole("button", { name: "Sync now" }).click();
  await expect(page.getByText(/Synced:|Already up to date|Sync failed/)).toBeVisible({ timeout: 30_000 });
});
