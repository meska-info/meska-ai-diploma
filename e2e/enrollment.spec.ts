import { expect, test, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const leadId = "11111111-1111-4111-8111-111111111111";
const artifactDir = path.resolve("artifacts/enrollment-screenshots");

type SessionOverrides = Partial<{
  enrollmentType: "individual" | "team";
  seats: number;
  firstName: string;
  fullName: string;
  companyName: string;
  email: string;
  paymentPreference: "full" | "installments" | "enterprise";
  joiningReadiness: "upcoming" | "later" | "discuss_upcoming";
  copilotLicence: "yes" | "no" | "unsure" | "all" | "some" | "none";
  submitterIsParticipant: boolean;
}>;

function session(overrides: SessionOverrides = {}) {
  return {
    leadId,
    requestId: "lead-e2e-request",
    editToken: "edit-e2e-token",
    enrollmentType: "team",
    seats: 6,
    firstName: "Mona",
    fullName: "Mona Adel",
    companyName: "Orascom",
    email: "mona.adel@orascom.com",
    paymentPreference: "full",
    joiningReadiness: "upcoming",
    copilotLicence: "all",
    submitterIsParticipant: true,
    ...overrides,
  };
}

async function mockEnrollmentApi(page: Page) {
  const posts: Record<string, unknown>[] = [];
  const patches: Record<string, unknown>[] = [];
  await page.route("**/api/copilot-leads", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    const body = route.request().postDataJSON() as Record<string, unknown>;
    posts.push(body);
    const seats = Number(body.seats ?? 1);
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        leadId,
        requestId: body.requestId,
        editToken: "edit-e2e-token",
        seats,
        quotedTotal: seats >= 5 ? seats * 22_500 : seats >= 2 ? seats * 24_000 : 30_000,
      }),
    });
  });
  await page.route("**/api/copilot-leads/*", async (route) => {
    if (route.request().method() !== "PATCH") return route.continue();
    const body = route.request().postDataJSON() as Record<string, unknown>;
    patches.push(body);
    const seats = Number(body.seats ?? 6);
    const status = body.paymentPath === "invoice" ? "invoice_requested"
      : body.paymentPath === "send" ? "payment_link_shared"
        : body.paymentPath === "now" ? "checkout_started" : "lead";
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        seats,
        quotedTotal: seats >= 5 ? seats * 22_500 : seats >= 2 ? seats * 24_000 : 30_000,
        enrollmentType: seats > 1 ? "team" : "individual",
        participantsCount: Array.isArray(body.participants) ? body.participants.length : 0,
        status,
      }),
    });
  });
  return { posts, patches };
}

async function fillTeamForm(page: Page) {
  const form = page.locator("#primary_interest_form");
  await form.getByRole("radio", { name: "My team" }).click();
  const range = page.locator("#apply .enrollment-price-panel .seat-range");
  await range.fill("3");
  await form.locator('input[name="companyName"]').fill("Orascom");
  await form.locator('input[name="jobTitle"]').fill("L&D Manager");
  await form.locator('input[name="fullName"]').fill("Mona Adel");
  await form.locator('input[name="email"]').fill("mona.adel@orascom.com");
  await form.locator('input[name="mobile"]').fill("01012345678");
  await form.locator('input[name="linkedinUrl"]').fill("linkedin.com/in/mona-adel");
  await form.locator('select[name="paymentPreference"]').selectOption("full");
  await form.locator('select[name="joiningReadiness"]').selectOption("upcoming");
  await form.locator('select[name="copilotLicence"]').selectOption("all");
  return form;
}

async function setPersonalSession(page: Page, overrides: SessionOverrides = {}) {
  const value = session(overrides);
  await page.goto(`/thank-you?diploma=online&seats=${value.seats}&lead=${leadId}`);
  await page.evaluate((stored) => {
    window.sessionStorage.setItem("copilot_enrollment", JSON.stringify(stored));
  }, value);
  await page.reload();
  await expect(page.locator("#enrollment-title")).toContainText(value.firstName);
}

async function screenshot(page: Page, selector: string, name: string) {
  await page.locator(selector).screenshot({
    animations: "disabled",
    path: path.join(artifactDir, `${name}.png`),
  });
}

test.beforeAll(async () => {
  await mkdir(artifactDir, { recursive: true });
});

test("the supplied prototype scenarios behave as the interaction reference", async ({ page }) => {
  const prototype = path.resolve("docs/enrollment/copilot-enrollment-prototype.html");
  await page.goto(`file://${prototype}`);
  await page.getByRole("button", { name: "Team of 3 · Sympl" }).click();
  await expect(page.locator("#p2title")).toContainText("team of 3");
  await expect(page.locator("#sum")).toContainText("EGP 72,000");
  await page.getByRole("button", { name: "Team of 6 · enterprise" }).click();
  await expect(page.locator("#p2title")).toContainText("team of 6");
  await expect(page.locator("#sum")).toContainText("EGP 135,000");
  await page.getByRole("button", { name: "Next cohort" }).click();
  await expect(page.locator("#callouts")).toContainText("next cohort");
  await page.getByRole("button", { name: "No Copilot licence" }).click();
  await expect(page.locator("#callouts")).toContainText("licence");
  await page.getByRole("button", { name: "Gmail rejected" }).click();
  await expect(page.locator("#f_email").locator("xpath=.."))
    .toContainText("work email");
});

test("team lead flow validates, submits once, personalizes, and logs PII-free events", async ({ page }) => {
  const eventLog: Array<{ event: string; parameters: Record<string, unknown> }> = [];
  page.on("console", (message) => {
    const prefix = "[Meska tracking] ";
    if (!message.text().startsWith(prefix)) return;
    try {
      eventLog.push(JSON.parse(message.text().slice(prefix.length)));
    } catch {
      // Ignore non-event tracking diagnostics.
    }
  });
  const requests = await mockEnrollmentApi(page);
  await page.goto("/?utm_source=e2e&utm_campaign=copilot-team");
  const form = page.locator("#primary_interest_form");
  await form.getByRole("button", { name: /Submit my interest/ }).click();
  await expect(form.locator(".error-message").first()).toBeVisible();

  await fillTeamForm(page);
  await expect(page.locator("#apply .enrollment-price-panel")).toContainText("EGP 72,000");
  await form.getByRole("button", { name: /Continue with 3 seats/ }).dblclick();
  await expect(page).toHaveURL(new RegExp(`/thank-you\\?.*seats=3.*lead=${leadId}`));
  await expect(page.locator("#enrollment-title")).toContainText("Mona");
  await expect(page.locator(".enrollment-order-summary")).toContainText("EGP 72,000");
  expect(requests.posts).toHaveLength(1);
  expect(requests.posts[0]).toMatchObject({
    enrollmentType: "team",
    seats: 3,
    companyName: "Orascom",
    email: "mona.adel@orascom.com",
  });

  expect(eventLog.some((item) => item.event === "FormSubmit" && item.parameters.value === 72_000)).toBeTruthy();
  expect(JSON.stringify(eventLog)).not.toContain("mona.adel@orascom.com");
  await mkdir(path.resolve("artifacts"), { recursive: true });
  await writeFile(
    path.resolve("artifacts/enrollment-event-log.json"),
    `${JSON.stringify(eventLog, null, 2)}\n`,
  );
});

test("personal team enrollment supports roster, tier changes, invoice, share, cohorts and licences", async ({ page, context }) => {
  const requests = await mockEnrollmentApi(page);
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "http://127.0.0.1:3100" });
  await setPersonalSession(page);
  await expect(page.locator(".enrollment-order-summary")).toContainText("EGP 135,000");
  await expect(page.locator(".enrollment-pay-button")).toHaveAttribute(
    "href",
    new RegExp(`cart/42776902369326:6.*lead_id.*${leadId}`),
  );

  await page.getByRole("button", { name: /participants/ }).click();
  await page.locator("#participant-1-name").fill("Karim Hassan");
  await page.locator("#participant-1-email").fill("karim.hassan@gmail.com");
  await page.getByRole("button", { name: "Save participants" }).click();
  await expect(page.locator(".participant-row").nth(1)).toContainText("work email");
  await page.locator("#participant-1-email").fill("karim.hassan@orascom.com");
  await page.locator("#participant-2-name").fill("Salma Nabil");
  await page.locator("#participant-2-email").fill("karim.hassan@orascom.com");
  await page.getByRole("button", { name: "Save participants" }).click();
  await expect(page.locator(".participant-row").nth(2)).toContainText("already on the list");
  await page.locator("#participant-2-email").fill("salma.nabil@orascom.com");
  await page.getByRole("button", { name: "Save participants" }).click();
  await expect(page.getByText("Participants saved")).toBeVisible();

  await page.getByRole("button", { name: "Remove a seat" }).click();
  await expect(page.locator(".enrollment-order-summary")).toContainText("EGP 112,500");
  await page.waitForTimeout(900);
  await page.getByRole("radio", { name: /Company invoice/ }).click();
  await page.getByRole("button", { name: /Request invoice/ }).click();
  await expect(page.getByText(/Request received/)).toBeVisible();
  expect(requests.patches.some((item) => item.paymentPath === "invoice")).toBeTruthy();

  await page.getByRole("radio", { name: /Send to my manager/ }).click();
  await page.getByLabel("Manager or finance email").fill("finance@gmail.com");
  await page.getByRole("button", { name: "Copy" }).click();
  await expect(page.getByText(/Link copied/)).toBeVisible();

  await setPersonalSession(page, { joiningReadiness: "later" });
  await expect(page.getByText(/You chose the next cohort/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Talk to an advisor/ })).toBeVisible();
  await page.getByRole("button", { name: "Switch to Cohort 01" }).click();
  await expect(page.getByText("How would you like to pay?")).toBeVisible();

  await setPersonalSession(page, { copilotLicence: "none" });
  await expect(page.getByText("Copilot licence needed.")).toBeVisible();
  await expect(page.locator(".enrollment-pay-button")).toHaveAttribute("aria-disabled", "true");
  await page.getByLabel("I understand a Microsoft 365 Copilot licence is required.").check();
  await expect(page.locator(".enrollment-pay-button")).toHaveAttribute("aria-disabled", "false");

  await setPersonalSession(page, { paymentPreference: "enterprise" });
  await expect(page.getByRole("radio", { name: /Company invoice/ }))
    .toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("button", { name: /Request invoice/ })).toBeVisible();
});

test("generic, URL edge, responsive overflow and no-JavaScript modes remain safe", async ({ page, browser }) => {
  await mockEnrollmentApi(page);
  for (const [raw, expected] of [["0", "1"], ["-3", "1"], ["abc", "1"], ["99", "20"]]) {
    await page.goto(`/thank-you?seats=${raw}`);
    await expect(page.locator(".enrollment-seat-editor output")).toHaveText(expected);
  }
  await page.goto("/thank-you?seats=6&lead=untrusted-public-id");
  await expect(page.locator("#enrollment-title")).toHaveText("Your enrollment");
  await expect(page.getByRole("radio", { name: /Company invoice/ })).toHaveCount(0);
  await expect(page.getByRole("radio", { name: /Send to my manager/ })).toHaveCount(0);
  await expect(page.locator(".enrollment-pay-button")).toHaveAttribute("href", /42776902369326:6/);
  await expect(page.getByText("Ready to discuss the course?")).toHaveCount(0);
  await expect(page.getByText("Go to the interest form")).toHaveCount(0);

  for (const width of [320, 375, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?seats=6");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);
  }

  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJs.newPage();
  await noJsPage.goto("http://127.0.0.1:3100/thank-you?seats=8");
  await expect(noJsPage.getByRole("link", { name: /Pay EGP 180,000 securely/ }))
    .toHaveAttribute("href", /cart\/42776902369326:8/);
  await noJs.close();
});

test("captures every required enrollment state at all specified viewports", async ({ page }) => {
  test.setTimeout(300_000);
  await mockEnrollmentApi(page);
  const viewports = [
    [360, 780],
    [390, 844],
    [768, 1024],
    [1280, 800],
    [1440, 900],
  ] as const;

  for (const [width, height] of viewports) {
    const prefix = `${width}x${height}`;
    await page.setViewportSize({ width, height });
    await page.goto("/?seats=1");
    await screenshot(page, "#apply .enrollment-price-panel", `${prefix}-calculator-1-seat`);
    await page.locator("#apply .enrollment-price-panel .seat-range").fill("3");
    await screenshot(page, "#apply .enrollment-price-panel", `${prefix}-calculator-3-seats`);
    await page.locator("#apply .enrollment-price-panel .seat-range").fill("6");
    await screenshot(page, "#apply .enrollment-price-panel", `${prefix}-calculator-6-seats`);

    await page.goto("/?seats=1");
    await screenshot(page, "#primary_interest_form", `${prefix}-just-me-empty`);
    await page.locator("#primary_interest_form").getByRole("button", { name: /Submit my interest/ }).click();
    await screenshot(page, "#primary_interest_form", `${prefix}-just-me-errors`);
    await page.goto("/?seats=3");
    await fillTeamForm(page);
    await screenshot(page, "#primary_interest_form", `${prefix}-team-filled`);

    await setPersonalSession(page);
    await page.getByRole("button", { name: /participants/ }).click();
    await screenshot(page, "#enrollment", `${prefix}-personal-team-6-roster`);
    await setPersonalSession(page, { joiningReadiness: "later" });
    await screenshot(page, "#enrollment", `${prefix}-next-cohort`);
    await setPersonalSession(page, { copilotLicence: "none" });
    await screenshot(page, "#enrollment", `${prefix}-no-licence`);
    await page.evaluate(() => window.sessionStorage.removeItem("copilot_enrollment"));
    await page.goto("/thank-you?seats=6");
    await screenshot(page, "#enrollment", `${prefix}-generic`);
  }

  const files = viewports.length * 10;
  await writeFile(
    path.resolve("artifacts/enrollment-screenshot-manifest.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), screenshots: files, viewports }, null, 2)}\n`,
  );
});
