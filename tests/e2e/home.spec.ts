import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("home page (US1)", () => {
  test("hero shows who, what, and the main actions above the fold", async ({ page }) => {
    await page.goto("/");
    const viewport = page.viewportSize()!;
    for (const locator of [
      page.getByRole("heading", { level: 1 }),
      page.getByRole("link", { name: /explore work/i }),
      page.getByRole("textbox", { name: /ask about/i }),
    ]) {
      await expect(locator).toBeVisible();
      const box = (await locator.boundingBox())!;
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    }
    await expect(page.getByText("Thanuja Rameshbaabu").first()).toBeVisible();
  });

  test("featured projects link to their case studies", async ({ page }) => {
    await page.goto("/");
    const featured = page.locator("#featured");
    await expect(featured.getByRole("article")).toHaveCount(2);
    await featured.getByRole("link", { name: "PaletteBoard" }).click();
    await expect(page).toHaveURL(/\/projects\/paletteboard$/);
  });

  test("technology filter narrows the grid and is reflected in the URL", async ({ page }) => {
    await page.goto("/");
    const grid = page.locator("#projects");
    await expect(grid.getByRole("article")).toHaveCount(3);
    await grid.getByRole("button", { name: "Python", exact: true }).click();
    await expect(page).toHaveURL(/tech=Python/);
    await expect(grid.getByRole("article")).toHaveCount(1);
    await grid.getByRole("button", { name: "All", exact: true }).click();
    await expect(grid.getByRole("article")).toHaveCount(3);
  });

  test("selecting a skill filters the project grid", async ({ page }) => {
    await page.goto("/");
    await page.locator("#skills").getByRole("link", { name: /^Expo/ }).click();
    await expect(page).toHaveURL(/tech=Expo/);
    await expect(page.locator("#projects").getByRole("article")).toHaveCount(1);
  });

  test("a filtered URL can be shared", async ({ page }) => {
    await page.goto("/?tech=React#projects");
    await expect(page.locator("#projects").getByRole("article")).toHaveCount(2);
  });

  test("has no detectable accessibility violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });

  test("no horizontal scrolling", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test("reduced motion stops the hero grid animation", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce", baseURL: "http://localhost:3000" });
  const page = await context.newPage();
  await page.goto("/");
  const animation = await page.locator(".hero-grid").evaluate((el) => getComputedStyle(el).animationName);
  expect(animation).toBe("none");
  await context.close();
});
