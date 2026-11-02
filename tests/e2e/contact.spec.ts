import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Without RESEND_API_KEY, development logs messages instead of emailing them.

test.describe("contact form (US5)", () => {
  test("valid message shows a confirmation", async ({ page }) => {
    await page.goto("/#contact");
    const form = page.getByRole("form", { name: "Send a message" });
    await form.getByLabel("Your name").fill("Riley Recruiter");
    await form.getByLabel("Your email").fill("riley@example.com");
    await form.getByLabel("Message").fill("Hi! We'd love to talk about an internship.");
    await page.waitForTimeout(3100); // real people take longer than the 3 s bot threshold
    await form.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Message sent")).toBeVisible();
  });

  test("invalid input is explained next to each field and nothing is sent", async ({ page }) => {
    await page.goto("/#contact");
    const form = page.getByRole("form", { name: "Send a message" });
    await form.getByLabel("Your email").fill("not-an-email");
    await form.getByLabel("Message").fill("short");
    await form.getByRole("button", { name: "Send message" }).click();
    await expect(form.getByText("Please enter your name.")).toBeVisible();
    await expect(form.getByText("Please enter a valid email address.")).toBeVisible();
    await expect(form.getByText(/at least a sentence/)).toBeVisible();
    await expect(form.getByLabel("Your name")).toBeFocused();
    await expect(form.getByLabel("Your email")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("Message sent")).toHaveCount(0);
  });

  test("delivery failure offers the email address instead", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 502, json: { error: { code: "send_failed", message: "Your message couldn't be sent right now." } } }),
    );
    await page.goto("/#contact");
    const form = page.getByRole("form", { name: "Send a message" });
    await form.getByLabel("Your name").fill("Riley");
    await form.getByLabel("Your email").fill("riley@example.com");
    await form.getByLabel("Message").fill("Hello there, this is a test.");
    await form.getByRole("button", { name: "Send message" }).click();
    await expect(form.getByRole("link", { name: /^Email / })).toHaveAttribute("href", /^mailto:/);
  });

  test("contact section has no detectable accessibility violations", async ({ page }) => {
    await page.goto("/#contact");
    // Measure the settled page, not elements mid fade-in (the channels sit below the form).
    await page.locator("#contact .channels").scrollIntoViewIfNeeded();
    await expect(page.locator("#contact [data-reveal]:not([data-shown])")).toHaveCount(0);
    await page.waitForTimeout(800);
    const results = await new AxeBuilder({ page }).include("#contact").withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
});

test("contact API drops bot submissions silently", async ({ request }) => {
  const honeypot = await request.post("/api/contact", {
    data: { name: "Bot", email: "b@example.com", message: "cheap stuff here", website: "spam.example", startedAt: 0 },
  });
  expect(honeypot.status()).toBe(200);
  const tooFast = await request.post("/api/contact", {
    data: { name: "Bot", email: "b@example.com", message: "cheap stuff here", startedAt: Date.now() },
  });
  expect(tooFast.status()).toBe(200);
  const invalid = await request.post("/api/contact", { data: { name: "", email: "x", message: "", startedAt: 0 } });
  expect(invalid.status()).toBe(400);
  expect(Object.keys((await invalid.json()).error.fields)).toEqual(["name", "email", "message"]);
});

test("resume page explains when no resume is uploaded yet", async ({ page }) => {
  await page.goto("/resume");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("The resume is on its way")).toBeVisible();
  await expect(page.getByRole("link", { name: "Get in touch" })).toBeVisible();
});
