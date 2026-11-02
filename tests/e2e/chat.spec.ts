import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { content } from "./content";

// Runs against the offline provider (no GEMINI_API_KEY locally), which answers from the same
// portfolio content, so results are deterministic.

test.describe("Ask AI (US3)", () => {
  test("hero question opens the panel, streams an answer and cites projects", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("textbox", { name: /ask about/i }).fill("Has Thanuja used React?");
    await page.getByRole("button", { name: "Ask", exact: true }).click();

    const panel = page.getByRole("dialog", { name: "Ask AI" });
    await expect(panel).toBeVisible();
    await expect(panel.getByText("An AI guide")).toBeVisible();
    await expect(panel.getByText(/used in PaletteBoard, AI Business Assistant/)).toBeVisible();
    await panel.getByRole("link", { name: /PaletteBoard/ }).click();
    await expect(page).toHaveURL(/\/projects\/paletteboard$/);
  });

  test("declines out-of-scope questions and suggests Contact", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Ask AI" }).first().click();
    const panel = page.getByRole("dialog", { name: "Ask AI" });
    await panel.getByRole("textbox", { name: "Your question" }).fill("What's the capital of France?");
    await panel.getByRole("textbox", { name: "Your question" }).press("Enter");
    await expect(panel.getByText(/don't have information about that/)).toBeVisible();
    await expect(panel.getByText("Sources")).toHaveCount(0);
  });

  test("suggested questions work from the panel", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Ask AI" }).first().click();
    const panel = page.getByRole("dialog", { name: "Ask AI" });
    await panel.getByRole("button", { name: /strongest project/ }).click();
    await expect(panel.getByRole("link", { name: /AI Business Assistant/ })).toBeVisible();
  });

  test("rate limit shows a friendly message and the site keeps working", async ({ page }) => {
    await page.route("**/api/chat", (route) =>
      route.fulfill({
        status: 429,
        json: { error: { code: "rate_limited", message: "limit", retryAfterSeconds: 60 } },
      }),
    );
    await page.goto("/");
    await page.getByRole("textbox", { name: /ask about/i }).fill("Has Thanuja used React?");
    await page.getByRole("button", { name: "Ask", exact: true }).click();
    const panel = page.getByRole("dialog", { name: "Ask AI" });
    await expect(panel.getByText(/taking a break/)).toBeVisible();
    await expect(panel.getByRole("link", { name: "Go to Contact" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(page.locator("#projects").getByRole("article")).toHaveCount(content.published);
  });

  test("Escape closes the panel and returns focus", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Ask AI" });
    await trigger.click();
    await expect(page.getByRole("dialog", { name: "Ask AI" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Ask AI" })).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("open panel has no detectable accessibility violations", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("textbox", { name: /ask about/i }).fill("Tell me about PaletteBoard");
    await page.getByRole("button", { name: "Ask", exact: true }).click();
    await expect(page.getByRole("dialog").getByRole("link", { name: /PaletteBoard/ })).toBeVisible();
    const results = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
});

test("API rejects invalid input and never cites unknown projects", async ({ request }) => {
  const bad = await request.post("/api/chat", { data: { messages: [] } });
  expect(bad.status()).toBe(400);

  const res = await request.post("/api/chat", {
    data: { messages: [{ role: "user", content: "Has Thanuja used Expo?" }] },
  });
  expect(res.headers()["content-type"]).toContain("text/event-stream");
  const body = await res.text();
  const citations = JSON.parse(body.match(/event: citations\ndata: (.*)/)![1]);
  expect(citations.projects).toEqual([{ slug: "campus-connect", title: "Campus Connect" }]);
  expect(body).not.toContain("CITATIONS:");
});
