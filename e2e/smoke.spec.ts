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

const STATIC_PAGES = ["/", "/course", "/course/1", "/course/level-check", "/news", "/news/ai-tech", "/stories", "/placement", "/privacy", "/offline"];

for (const path of STATIC_PAGES) {
  test(`page ${path} loads`, async ({ page }) => {
    await openPage(page, path);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
}

test("a news story loads with its player fixed on screen", async ({ page }) => {
  await openPage(page, "/news");
  const story = await firstHref(page, "/news/voa-");
  await openPage(page, story);
  await page.mouse.wheel(0, 1500);
  // Regression: a transform left by a page animation once pinned this player to the end of the page.
  await expectInViewport(page, page.getByRole("slider", { name: "Position" }), "news player");
});

test("the phone's More tab reaches every sidebar page", async ({ page, isMobile }) => {
  test.skip(!isMobile, "the tab bar is only on phones");
  await openPage(page, "/stories");
  const tabs = page.getByRole("navigation", { name: "Main" });
  for (const name of ["Home", "Stories", "News", "Course"]) await expect(tabs.getByRole("link", { name, exact: true })).toBeVisible();
  await tabs.getByRole("button", { name: "More" }).click();
  const sheet = page.getByRole("dialog", { name: "More" });
  for (const name of ["Review", "My words", "Search phrases", "Favorites", "Offline lessons", "Account", "Privacy"]) {
    await expect(sheet.getByRole("link", { name })).toBeVisible();
  }
  await sheet.getByRole("link", { name: "Favorites" }).click();
  await expect(page).toHaveURL(/\/favorites$/);
  await expect(sheet).toBeHidden();
});

test("news, stories and AI & Tech articles have a favorite button", async ({ page }) => {
  await openPage(page, "/news");
  const news = await firstHref(page, "/news/voa-");
  await openPage(page, "/news/ai-tech");
  const article = await firstHref(page, "/news/ai-tech/tc-");
  for (const path of [news, article, "/stories/story-00049"]) {
    await openPage(page, path);
    await expect(page.getByRole("button", { name: "Add to favorites" })).toBeVisible();
  }
});

test("the transcript scrolls freely until Current brings it back", async ({ page }) => {
  await openPage(page, "/news");
  await openPage(page, (await firstHref(page, "/news/voa-")).replace("/news/", "/watch/"));
  await page.getByRole("button", { name: "Next sentence" }).click();
  const transcript = page.getByTestId("transcript");
  const current = transcript.locator('[aria-current="true"]');
  await expect(current).toBeVisible();
  await transcript.hover();
  // Regression: small scrolls with the sentence still on screen used to pull the list straight back.
  const positions: number[] = [];
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 60);
    await page.waitForTimeout(150);
    positions.push(await transcript.evaluate((el) => el.scrollTop));
  }
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
  expect(positions[5]).toBeGreaterThan(positions[0]);
  await page.waitForTimeout(1000);
  expect(await transcript.evaluate((el) => el.scrollTop)).toBeGreaterThanOrEqual(positions[5]);
  await page.mouse.wheel(0, 5000);
  await page.getByRole("button", { name: "Back to current sentence" }).click();
  await expect(page.getByRole("button", { name: "Back to current sentence" })).toBeHidden();
  await expect(current).toBeInViewport();
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

test("the last sentence of a part leads to the next part, in the same mode", async ({ page, isMobile }) => {
  // A two-part Bob the Canadian lesson from day 1 of the course.
  await openPage(page, "/watch/ovl9kM46r10?mode=shadow&from=course-1");
  if (isMobile) await page.locator("select").first().selectOption("dictation");
  const rows = page.getByRole("button", { name: /^Play from sentence/ });
  await rows.last().click();
  await expect(page.getByText(/^Part 1 done/)).toBeVisible();
  await expectInViewport(page, page.getByRole("link", { name: "Next part" }), "next part link");
  await page.getByRole("button", { name: "Next sentence" }).click();
  await expect(page).toHaveURL(new RegExp(`mode=${isMobile ? "dictation" : "shadow"}.*part=2`));
  await expect(page.getByText(/^Sentence 1\/\d+/).first()).toBeVisible();
});

test("the course guide shows a timetable for the day", async ({ page }) => {
  await openPage(page, "/course/2");
  await page.getByRole("button", { name: "How to study" }).click();
  const guide = page.getByRole("dialog", { name: "How to study this course" });
  await expect(guide.getByText("8:00")).toBeVisible();
  await expect(guide.getByText("This is the plan for day 2.", { exact: false })).toBeVisible();
});

test("sidebar modules collapse and stay collapsed", async ({ page, isMobile }) => {
  test.skip(isMobile, "The sidebar is desktop only");
  await openPage(page, "/stories");
  const sidebar = page.locator("aside");
  await sidebar.getByRole("button", { name: "Practice" }).click();
  await expect(sidebar.getByRole("link", { name: "Review" })).toBeHidden();
  await page.reload();
  await expect(sidebar.getByRole("button", { name: "Practice" })).toHaveAttribute("aria-expanded", "false");
  // The current page's module stays open, even when it was collapsed before.
  await sidebar.getByRole("button", { name: "Practice" }).click();
  await sidebar.getByRole("link", { name: "Review" }).click();
  await expect(page).toHaveURL(/\/review/);
  await expect(sidebar.getByRole("link", { name: "My words" })).toBeVisible();
});

test("tapping a word opens the lookup sheet on screen", async ({ page }) => {
  await openPage(page, "/stories/story-00049");
  await page.getByRole("button", { name: "fever", exact: true }).first().click();
  await expectInViewport(page, page.getByRole("dialog"), "word lookup sheet");
});
