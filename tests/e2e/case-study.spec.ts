import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { content } from "./content";

test.describe("case study (US2)", () => {
  test("renders the story sections, links and share metadata", async ({ page }) => {
    await page.goto("/projects/paletteboard");
    await expect(page.getByRole("heading", { level: 1, name: "PaletteBoard" })).toBeVisible();
    await expect(page.getByRole("link", { name: /live demo/i })).toHaveAttribute("href", "https://paletteboard.vercel.app");
    await expect(page.getByRole("link", { name: /^code/i })).toHaveAttribute("href", /github\.com\/ThanujaR12\/PaletteBoard/);
    for (const label of ["Role", "Stack", "Year", "Status"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(page.getByRole("heading", { name: "Why it exists" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What it does well" })).toBeVisible();
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "PaletteBoard");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image/);
  });

  test("falls back to the README when no story is written", async ({ page }) => {
    test.skip(!content.noStorySlug, "every published project has its story written");
    await page.goto(`/projects/${content.noStorySlug}`);
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  });

  test("previous/next navigation moves between projects", async ({ page }) => {
    await page.goto("/projects/paletteboard");
    await page.getByRole("link", { name: /next project/i }).click();
    await expect(page).toHaveURL(/\/projects\/ai-business-assistant$/);
  });

  test("unknown projects show a styled 404", async ({ page }) => {
    const response = await page.goto("/projects/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Lost in space" })).toBeVisible();
    await expect(page.getByRole("link", { name: /browse all projects/i })).toBeVisible();
  });

  test("has no detectable accessibility violations", async ({ page }) => {
    await page.goto("/projects/paletteboard");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
});
