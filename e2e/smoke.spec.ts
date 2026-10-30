import { expect, test, type Page } from "@playwright/test";

// Fails the test on uncaught errors in the page and on content wider than the screen.
async function openPage(page: Page, path: string) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto(path);
  expect(response?.status(), `${path} status`).toBeLessThan(400);
  await page.waitForLoadState("networkidle");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `${path} is wider than the screen`).toBeLessThanOrEqual(1);
  expect(errors, `${path} page errors`).toEqual([]);
}

// The first link on a page whose address starts with prefix.
async function firstHref(page: Page, prefix: string): Promise<string> {
  const href = await page.locator(`main a[href^="${prefix}"]`).first().getAttribute("href");
  expect(href, `a link starting with ${prefix}`).toBeTruthy();
  return href ?? "";
}

async function expectInViewport(page: Page, locator: ReturnType<Page["locator"]>, what: string) {
  await expect(locator).toBeVisible();
  const viewport = page.viewportSize();
  // Polled: sheets slide in, so they are briefly below the screen edge.
  await expect
    .poll(async () => {
      const box = await locator.boundingBox();
      return Boolean(box && viewport && box.y >= 0 && box.y + box.height <= viewport.height + 1);
    }, { message: `${what} is on screen` })
    .toBe(true);
}

const STATIC_PAGES = ["/", "/course", "/course/1", "/course/level-check", "/news", "/stories", "/placement", "/privacy", "/offline"];

for (const path of STATIC_PAGES) {
  test(`page ${path} loads`, async ({ page }) => {
    await openPage(page, path);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
}

test("a news story loads with its player fixed on screen", async ({ page }) => {
  await openPage(page, "/news");
  const story = await firstHref(page, "/news/");
  await openPage(page, story);
  await page.mouse.wheel(0, 1500);
  // Regression: a transform left by a page animation once pinned this player to the end of the page.
  await expectInViewport(page, page.getByRole("slider", { name: "Position" }), "news player");
});

test("search finds a phrase and opens the lesson", async ({ page }) => {
  await openPage(page, "/search?q=look%20forward%20to");
  const lesson = await firstHref(page, "/watch/");
  await openPage(page, lesson);
  // Search results open the lesson at the sentence that has the phrase.
  await expect(page.getByText(/look forward to/i).first()).toBeVisible();
});

test("a story is remembered as read and suggests the next one", async ({ page }) => {
  await openPage(page, "/stories/story-00049");
  await expect(page.getByRole("heading", { name: "At the pharmacy" })).toBeVisible();
  await expectInViewport(page, page.getByRole("button", { name: "Listen" }), "story player");
  await page.getByRole("heading", { name: "Up next" }).scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("stories-read"))).toContain("story-00049");

  await openPage(page, "/stories");
  await expect(page.getByText(/^1 of \d+ read$/)).toBeVisible();
  await expect(page.locator("main ul a").last()).toHaveAttribute("href", "/stories/story-00049");
});

test("tapping a word opens the lookup sheet on screen", async ({ page }) => {
  await openPage(page, "/stories/story-00049");
  await page.getByRole("button", { name: "fever", exact: true }).first().click();
  await expectInViewport(page, page.getByRole("dialog"), "word lookup sheet");
});
