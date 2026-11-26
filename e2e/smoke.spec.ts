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

const STATIC_PAGES = ["/", "/course", "/course/1", "/course/level-check", "/news", "/news?topic=voa", "/stories", "/placement", "/privacy", "/about", "/offline"];

for (const path of STATIC_PAGES) {
  test(`page ${path} loads`, async ({ page }) => {
    await openPage(page, path);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
}

test("a news story loads with its player fixed on screen", async ({ page }) => {
  await openPage(page, "/news?topic=voa");
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
  for (const name of ["Grammar", "Vocabulary", "Review", "My words", "Search phrases", "Favorites", "Offline lessons", "Account", "About", "Privacy"]) {
    await expect(sheet.getByRole("link", { name })).toBeVisible();
  }
  await sheet.getByRole("link", { name: "Favorites" }).click();
  await expect(page).toHaveURL(/\/favorites$/);
  await expect(sheet).toBeHidden();
});

test("news stories, stories and articles have a favorite button", async ({ page }) => {
  await openPage(page, "/news?topic=voa");
  const news = await firstHref(page, "/news/voa-");
  await openPage(page, "/news");
  const article = await firstHref(page, "/news/article/tc-");
  for (const path of [news, article, "/stories/story-00049"]) {
    await openPage(page, path);
    await expect(page.getByRole("button", { name: "Add to favorites" })).toBeVisible();
  }
});

test("news opens on the latest articles, and old article links still work", async ({ page }) => {
  await openPage(page, "/news");
  await expect(page.getByRole("link", { name: "Latest" })).toHaveAttribute("aria-current", "page");
  const article = await firstHref(page, "/news/article/tc-");
  await openPage(page, article.replace("/news/article/", "/news/ai-tech/"));
  await expect(page).toHaveURL(new RegExp(`${article}$`));
  // AI & Tech used to have its own page; it is a topic like the others now.
  await openPage(page, "/news/ai-tech");
  await expect(page.getByRole("navigation", { name: "News topics" }).getByRole("link", { name: "AI & Tech" })).toHaveAttribute("aria-current", "page");
});

test("news can hide articles above a level, across topics", async ({ page }) => {
  await openPage(page, "/news");
  const levels = page.getByRole("navigation", { name: "Article level" });
  await levels.getByRole("link", { name: /^Up to B2/ }).click();
  await expect(page).toHaveURL(/level=B2/);
  await expect(levels.getByRole("link", { name: /^Up to B2/ })).toHaveAttribute("aria-current", "page");
  const labels = await page.locator('a[href^="/news/article/"] p:first-child').allTextContents();
  for (const label of labels) expect(label).toMatch(/≈(A1|A2|B1|B2)\b/);
  await page.getByRole("navigation", { name: "News topics" }).getByRole("link", { name: "Health" }).click();
  await expect(page).toHaveURL(/topic=Health&level=B2/);
});

test("the transcript scrolls freely until Current brings it back", async ({ page }) => {
  await openPage(page, "/news?topic=voa");
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

test("listen first keeps the hidden-text note small on phones", async ({ page, isMobile }) => {
  test.skip(!isMobile, "the note is only on phones");
  await openPage(page, "/watch/ovl9kM46r10?listen=1");
  const note = page.getByText("Listen first. The text is hidden.");
  await expect(note).toBeVisible();
  const box = await note.locator("..").boundingBox();
  expect(box?.height ?? 999).toBeLessThan(50);
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

test("shadowing can play straight through and pause when the learner wants", async ({ page }) => {
  await openPage(page, "/watch/ovl9kM46r10?mode=shadow");
  await page.getByText("Play through").click();
  // Sentence 1 is under two seconds; without play through the video would stop at its end.
  await expect(page.getByText(/^Sentence [3-9]\/\d+/).first()).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Pause to shadow" }).click();
  await expect(page.getByRole("button", { name: "Play", exact: true }).last()).toBeVisible();
  // The choice is remembered for the next lesson.
  await page.reload();
  await expect(page.getByRole("switch", { name: /Play through/ })).toBeChecked();
});

test("the course guide shows a timetable for the day", async ({ page }) => {
  await openPage(page, "/course/2");
  await page.getByRole("button", { name: "How to study" }).click();
  const guide = page.getByRole("dialog", { name: "How to study this course" });
  await expect(guide.getByText("8:00")).toBeVisible();
  await expect(guide.getByText("This is the plan for day 2.", { exact: false })).toBeVisible();
});

test("the warm-up brings back sentences from days further back", async ({ page }) => {
  await openPage(page, "/course/4");
  await page.getByRole("region", { name: "Lesson parts" }).getByRole("button", { name: /^Warm up: earlier sentences/ }).click();
  const screen = page.getByRole("dialog", { name: "Earlier sentences" });
  await expect(screen.getByText("Earlier sentences · 1 of 5")).toBeVisible();
  for (let i = 0; i < 4; i++) await screen.getByRole("button", { name: "Next" }).click();
  await expect(screen.getByText(/^Week 1 · Day 1 · /)).toBeVisible();
});

test("a course day is a path of steps, each opened on its own screen", async ({ page }) => {
  await openPage(page, "/course/2");
  const steps = page.getByRole("region", { name: "Lesson parts" });
  // Five steps a day; the rest waits under "More if you have time".
  await expect(steps.getByText("0/5")).toBeVisible();

  // The warm-up is earlier videos, heard before they are read.
  await steps.getByRole("button", { name: /^Warm up: earlier sentences/ }).click();
  let screen = page.getByRole("dialog", { name: "Earlier sentences" });
  await expect(screen.getByText(/^Yesterday · /)).toBeVisible();
  await expect(screen.getByRole("button", { name: "Show the sentence" })).toBeVisible();
  await screen.getByRole("button", { name: "Close" }).click();

  // Words come one at a time, in their sentence from the video.
  await steps.getByRole("button", { name: /^Before you watch: words from the video/ }).click();
  screen = page.getByRole("dialog", { name: "Words from the video" });
  await expect(screen.locator("mark")).toBeVisible();
  // A sentence plays in a sheet above the screen, with a way into the full lesson at that moment.
  await screen.getByRole("button", { name: "Hear it in the video" }).click();
  const sheet = page.getByRole("dialog", { name: "From the video", exact: true });
  await expect(sheet.locator('iframe[src*="youtube"]')).toBeAttached();
  await expect(sheet.getByRole("link", { name: /Open the whole lesson/ })).toHaveAttribute("href", /^\/watch\/[^?]+\?mode=shadow&s=\d+&from=course-2/);
  await sheet.getByRole("button", { name: "Close" }).click();
  await screen.getByRole("button", { name: "Next" }).click();
  await expect(screen.getByText(/· 2 of \d+/)).toBeVisible();
  await screen.getByRole("button", { name: "Close" }).click();

  // The main video, twice: text hidden, then with the text.
  await steps.getByRole("button", { name: /^Watch it twice: / }).click();
  screen = page.getByRole("dialog", { name: /^Watch it twice/ });
  await expect(screen.getByRole("link", { name: /^1 Text hidden/ })).toHaveAttribute("href", /^\/watch\/[^?]+\?mode=watch&listen=1&from=course-2/);
  await expect(screen.getByRole("link", { name: /^2 With the text/ })).toHaveAttribute("href", /^\/watch\/[^?]+\?mode=watch&from=course-2/);
  await expect(screen.getByRole("button", { name: "I've watched it twice" })).toBeVisible();
  await screen.getByRole("button", { name: "Close" }).click();

  // Practice: hear a sentence, write it, see the words missed, then say it.
  await steps.getByRole("button", { name: /^Practise 5 sentences/ }).click();
  screen = page.getByRole("dialog", { name: "Practise the sentences" });
  await expect(screen.getByText("Hear, write, say · 1 of 5")).toBeVisible();
  await screen.getByRole("textbox", { name: "What you heard" }).fill("I think");
  await screen.getByRole("button", { name: "Check" }).click();
  await expect(screen.getByText(/% heard right|Perfect!/)).toBeVisible();
  // What was missed is offered for Review; signed out, it asks to sign in.
  await expect(screen.getByText(/^Sign in to practise “.+” again in Review\.$/)).toBeVisible();
  await expect(screen.getByText("Now say it like the speaker: same rhythm, same stress.")).toBeVisible();
  await screen.getByRole("button", { name: "Next sentence" }).click();
  await expect(screen.getByText("Hear, write, say · 2 of 5")).toBeVisible();
  await screen.getByRole("button", { name: "Close" }).click();

  // The optional parts are in one place. Taking turns: the video says a line, you say the next.
  await steps.getByRole("button", { name: /^More if you have time/ }).click();
  const more = page.getByRole("dialog", { name: "More if you have time" });
  await expect(more.getByRole("link", { name: /^Shadow the whole video/ })).toHaveAttribute("href", /mode=shadow&from=course-2/);
  await more.getByRole("button", { name: /^Take turns with the speaker/ }).click();
  screen = page.getByRole("dialog", { name: "Take turns with the speaker" });
  await screen.getByRole("button", { name: "Start the conversation" }).click();
  const conversation = screen.getByRole("list", { name: "Conversation" });
  await expect(conversation.getByText("Video", { exact: true })).toBeVisible();
  await screen.getByRole("button", { name: "Your turn" }).click();
  await expect(conversation.getByText("You", { exact: true })).toBeVisible();
  const hint = conversation.locator("li").nth(1).locator("p[lang=en]");
  await expect(hint).toContainText("…");
  await screen.getByRole("button", { name: "Show the line" }).click();
  await expect(hint).not.toContainText("…");
  // Closing it goes back to the list of extras.
  await screen.getByRole("button", { name: "Close" }).click();
  await more.getByRole("button", { name: "Back to the day" }).click();

  await steps.getByRole("button", { name: /^Day test/ }).click();
  await expect(page.getByText("Listen. Which sentence did you hear?")).toBeVisible();
});

test("a video with a guide shows its parts and a model to copy", async ({ page, context, baseURL }) => {
  // Bob the Canadian, week 1 day 1: "How to Describe Yourself in English".
  await context.addCookies([{ name: "collection", value: "bob", url: baseURL ?? "http://localhost:3000" }]);
  await openPage(page, "/course/1");
  await page.getByRole("button", { name: /^More if you have time/ }).click();
  await page.getByRole("button", { name: /^The video on one page/ }).click();
  await expect(page.getByText("Model: Introduce yourself")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Hear “I'm afraid of heights\.” in the video$/ })).toBeVisible();
});

test("the course goes on week after week, with review and free days", async ({ page }) => {
  await openPage(page, "/course");
  await expect(page.getByText("Week 2", { exact: true })).toBeAttached();

  // Day 6 of every week hears the week's videos again; day 7 is free listening.
  await openPage(page, "/course/6");
  await expect(page.getByText("Week 1 · Day 6 of 7")).toBeVisible();
  await expect(page.getByText(/^Hear it again, text hidden:/).first()).toBeVisible();

  await openPage(page, "/course/8");
  await expect(page.getByText("Week 2 · Day 1 of 7")).toBeVisible();
  await page.getByRole("button", { name: /^Before you watch: words from the video/ }).click();
  await expect(page.getByRole("dialog", { name: "Words from the video" }).locator("mark")).toBeVisible();
});

test("a grammar unit tells a story, shows the pattern in real videos and checks it", async ({ page }) => {
  await openPage(page, "/grammar");
  await page.getByRole("link", { name: /Telling a story: the past simple/ }).click();
  await expect(page).toHaveURL(/\/grammar\/past-simple$/);
  await expect(page.getByRole("link", { name: "Getting around in pictures" })).toHaveAttribute("href", "/words/getting-around");
  const steps = page.getByRole("region", { name: "Lesson parts" });

  // The story comes one picture at a time, words hidden until asked for.
  await steps.getByRole("button", { name: /A picture story/ }).click();
  let screen = page.getByRole("dialog", { name: "The story" });
  await expect(screen.getByText(/The story · 1 of \d+/)).toBeVisible();
  await expect(screen.locator(".blur-sm")).toBeVisible();
  await screen.getByRole("button", { name: "Show the words" }).click();
  await expect(screen.locator(".blur-sm")).toHaveCount(0);
  await screen.getByRole("button", { name: "Close" }).click();

  await steps.getByRole("button", { name: /^Notice the pattern/ }).click();
  screen = page.getByRole("dialog", { name: "Notice the pattern" });
  await expect(screen.locator("mark", { hasText: "woke up" }).first()).toBeVisible();
  await screen.getByRole("button", { name: "Got it" }).click();
  await expect(steps.getByRole("button", { name: /^Notice the pattern.*Done/ })).toBeVisible();

  await steps.getByRole("button", { name: /^Hear it in real videos/ }).click();
  screen = page.getByRole("dialog", { name: "In real videos" });
  await screen.getByRole("button", { name: "Hear it in the video" }).click();
  const sheet = page.getByRole("dialog", { name: "From the video", exact: true });
  await expect(sheet).toBeVisible();
  await sheet.getByRole("button", { name: "Close" }).click();
  await screen.getByRole("button", { name: "Close" }).click();

  await steps.getByRole("button", { name: /^Check/ }).click();
  await expect(page.getByText("Listen. Which picture is it?")).toBeVisible();
  await page.getByRole("button", { name: "Picture 1" }).click();
  await expect(page.getByText(/Correct!|Not quite/)).toBeVisible();
});

test("a vocabulary topic is a path of parts that open on a focus screen", async ({ page }) => {
  await openPage(page, "/words");
  await page.getByRole("link", { name: /At a café/ }).click();
  await expect(page).toHaveURL(/\/words\/at-a-cafe$/);
  const parts = page.getByRole("region", { name: "Lesson parts" });
  for (const name of ["Learn", "Match the picture", "What would you say?", "Build the conversation", "Your turn"]) {
    await expect(parts.getByRole("button", { name })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: /Asking and rules/ })).toHaveAttribute("href", "/grammar/can-could-have-to");

  await parts.getByRole("button", { name: "Start" }).click();
  const learn = page.getByRole("dialog", { name: "Learn the phrases" });
  await expect(learn.getByText("A table for two", { exact: true })).toBeVisible();
  await learn.getByRole("button", { name: "Next" }).click();
  await expect(learn.getByText(/^You say · 2 of 16$/)).toBeVisible();
  await learn.getByRole("button", { name: "Close" }).click();
  await expect(learn).toBeHidden();

  await parts.getByRole("button", { name: /^Match the picture/ }).click();
  const quiz = page.getByRole("dialog", { name: "Match the picture" });
  await expect(quiz.getByRole("button", { name: "Check" })).toBeDisabled();
  await quiz.locator("ul button").first().click();
  await quiz.getByRole("button", { name: "Check" }).click();
  await expect(quiz.getByText(/Correct!|Not quite/)).toBeVisible();
  await quiz.getByRole("button", { name: "Close" }).click();

  await parts.getByRole("button", { name: /^Build the conversation/ }).click();
  await expect(page.getByRole("dialog", { name: "Mai has a coffee" }).getByText("Choose what Mai says next.")).toBeVisible();
});

test("lessons have a notes section and My notes asks to sign in", async ({ page }) => {
  await openPage(page, "/grammar/past-simple");
  await expect(page.getByRole("region", { name: "My notes" }).getByRole("button", { name: "Sign in" })).toBeVisible();
  await openPage(page, "/notes");
  await expect(page.getByRole("heading", { name: "My notes" })).toBeVisible();
});

test("a course day can be marked done to move on", async ({ page }) => {
  await openPage(page, "/course/1");
  await expect(page.getByRole("button", { name: "Mark day as done" })).toBeVisible();
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
