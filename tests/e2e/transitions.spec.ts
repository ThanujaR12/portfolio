import { expect, test } from "@playwright/test";

test.describe("cinematic transitions (spec 003)", () => {
  test.skip(({ isMobile }) => isMobile, "uses the desktop icon nav");

  test("internal links close on the beam, show the destination, then open at the top", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(500); // hydration
    const aperture = page.locator(".page-aperture");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "About" }).click();
    await expect(aperture).toHaveAttribute("data-phase", /closing|closed/);
    await expect(page.locator(".aperture-label")).toHaveText("About");
    await expect(page).toHaveURL(/\/about$/);
    await expect(aperture).toHaveAttribute("data-phase", "idle", { timeout: 5000 });
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.getByRole("heading", { level: 1, name: /Thanuja Rameshbaabu/ })).toBeVisible();
  });

  test("in-page section links sweep the beam with the section name", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(500);
    await page.getByRole("link", { name: "View projects" }).click();
    await expect(page.locator(".page-aperture")).toHaveAttribute("data-phase", "jump");
    await expect(page.locator(".aperture-label")).toHaveText("Work");
    await expect(page).toHaveURL(/#work$/);
  });

  test("reduced motion navigates without any transition", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", baseURL: "http://localhost:3000" });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForTimeout(500);
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Work" }).click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(page.locator(".page-aperture")).toHaveAttribute("data-phase", "idle");
    await expect(page.locator(".page-aperture")).toBeHidden();
    await context.close();
  });
});
