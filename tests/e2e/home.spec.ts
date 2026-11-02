import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { content } from "./content";

test.describe("home page (spec 002)", () => {
  test("first screen is the name, with roles, actions and a scroll cue", async ({ page }) => {
    await page.goto("/");
    const viewport = page.viewportSize()!;
    const name = page.getByRole("heading", { level: 1, name: "Thanuja Rameshbaabu" });
    const aboveFold = [
      name,
      page.getByRole("link", { name: "Get in touch" }).first(),
      page.getByRole("link", { name: "View projects" }),
      page.getByRole("link", { name: /scroll to the introduction/i }),
    ];
    for (const locator of aboveFold) {
      await expect(locator).toBeVisible();
      const box = (await locator.boundingBox())!;
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    }
    await expect(page.locator("section[aria-labelledby=name-title]").getByText(content.roles)).toBeVisible();
    // The resolve animation settles on the real name.
    await expect(page.locator(".name-resolve")).toHaveText(/THANUJA\s*RAMESHBAABU/i, { timeout: 5000 });
  });

  test("scrolling on reaches the statement, Ask AI and the Currently card", async ({ page, isMobile }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /scroll to the introduction/i }).click();
    await expect(page).toHaveURL(/#intro$/);
    await expect(page.getByRole("heading", { level: 2, name: /AI-powered products/ })).toBeInViewport();
    await expect(page.getByRole("textbox", { name: /ask about/i })).toBeVisible();
    if (!isMobile) await expect(page.getByRole("complementary", { name: "Currently" })).toBeInViewport();
    await expect(page.getByText(/Thanuja Rameshbaabu · Vanderbilt/)).toBeVisible();
  });

  test("Currently card shows what Thanuja is open to and a live local time", async ({ page }) => {
    await page.goto("/");
    const card = page.getByRole("complementary", { name: "Currently" });
    await expect(card).toContainText(content.openTo);
    await expect(card.locator("time")).toHaveText(/\d{1,2}:\d{2}\s?(AM|PM)/);
    await card.getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/#contact$/);
  });

  test("journey, selected work, skills and Let's build follow the hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Where I've been building" })).toBeAttached();
    await expect(page.locator("#work").getByRole("article")).toHaveCount(content.selected);
    await expect(page.getByRole("heading", { name: "Tools I build with" })).toBeAttached();
    await expect(page.getByRole("heading", { name: /Let.s build/ })).toBeAttached();
    await page.locator("#work").getByRole("link", { name: "PaletteBoard", exact: true }).click();
    await expect(page).toHaveURL(/\/projects\/paletteboard$/);
  });

  test("selecting a skill opens the work grid filtered to it", async ({ page }) => {
    await page.goto("/");
    await page.locator("#skills").getByRole("link", { name: /^Expo/ }).click();
    await expect(page).toHaveURL(/\/work\?tech=Expo/);
    await expect(page.locator("#projects").getByRole("article")).toHaveCount(content.usingTech("Expo"));
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

test.describe("work page", () => {
  test("technology filter narrows the grid and is reflected in the URL", async ({ page }) => {
    await page.goto("/work");
    const grid = page.locator("#projects");
    await expect(grid.getByRole("article")).toHaveCount(content.published);
    await grid.getByRole("button", { name: "Python", exact: true }).click();
    await expect(page).toHaveURL(/tech=Python/);
    await expect(grid.getByRole("article")).toHaveCount(content.usingTech("Python"));
    await grid.getByRole("button", { name: "All", exact: true }).click();
    await expect(grid.getByRole("article")).toHaveCount(content.published);
  });

  test("a filtered URL can be shared", async ({ page }) => {
    await page.goto("/work?tech=React");
    await expect(page.locator("#projects").getByRole("article")).toHaveCount(content.usingTech("React"));
  });
});

test("about page shows the bio, background and open-to", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1, name: "Thanuja Rameshbaabu" })).toBeVisible();
  await expect(page.getByText("Vanderbilt University").first()).toBeVisible();
  await expect(page.getByText(content.openTo).first()).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});

test("icon navigation has accessible names and marks the current page", async ({ page, isMobile }) => {
  test.skip(isMobile, "phones use the text menu");
  await page.goto("/about");
  const nav = page.getByRole("navigation", { name: "Main" });
  for (const name of ["Home", "About", "Work", "Resume", "Contact"]) {
    await expect(nav.getByRole("link", { name })).toBeVisible();
  }
  await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
});

test("reduced motion stops the aurora and shows the name without scrambling", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce", baseURL: "http://localhost:3000" });
  const page = await context.newPage();
  await page.goto("/");
  const animation = await page.locator(".aurora span").first().evaluate((el) => getComputedStyle(el).animationName);
  expect(animation).toBe("none");
  await expect(page.locator(".name-resolve")).toHaveText(/THANUJA\s*RAMESHBAABU/i, { timeout: 1000 });
  await context.close();
});

test("without JavaScript the name is visible immediately", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: "http://localhost:3000" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator(".name-resolve")).toBeVisible();
  await context.close();
});
