/**
 * Selenium E2E Suite — next-iframe-poc
 *
 * Prerequisites:
 *   - App running at BASE_URL (default: http://localhost:3000)
 *   - Chrome installed
 *
 * Run: npm run test:e2e
 */

const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const assert = require("node:assert/strict");

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const TIMEOUT = 10_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildDriver() {
  const options = new chrome.Options();
  if (process.env.CI) options.addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
  return new Builder().forBrowser("chrome").setChromeOptions(options).build();
}

async function waitFor(driver, locator, timeout = TIMEOUT) {
  return driver.wait(until.elementLocated(locator), timeout);
}

async function waitVisible(driver, locator, timeout = TIMEOUT) {
  const el = await waitFor(driver, locator, timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  return el;
}

/** Returns true if the "Entry Details" heading is currently in the DOM. */
async function inDetailView(driver) {
  return driver
    .findElements(By.xpath("//h1[text()='Entry Details']"))
    .then((els) => els.length > 0);
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe("next-iframe-poc E2E", function () {
  this.timeout(30_000);

  let driver;

  before(async () => {
    driver = buildDriver();
    await driver.get(BASE_URL);
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  // -------------------------------------------------------------------------
  // Page shell
  // -------------------------------------------------------------------------

  describe("Page", () => {
    it("loads without error", async () => {
      const title = await driver.getTitle();
      assert.ok(title.length > 0, "Page title should not be empty");
    });

    it("shows the ProductSelector", async () => {
      const el = await waitVisible(driver, By.xpath("//*[contains(text(),'Selected product')]"));
      assert.ok(el, "ProductSelector text should be visible");
    });
  });

  // -------------------------------------------------------------------------
  // ContentfulForm (left panel)
  // -------------------------------------------------------------------------

  describe("ContentfulForm", () => {
    it("renders the Create Content Entry heading", async () => {
      const heading = await waitVisible(driver, By.xpath("//h1[text()='Create Content Entry']"));
      assert.ok(heading);
    });

    it("renders all three language tabs", async () => {
      const tabs = await driver.findElements(
        By.xpath("//button[contains(@class,'border-b-2')]")
      );
      const labels = await Promise.all(tabs.map((t) => t.getText()));
      assert.ok(labels.some((l) => l.includes("English")), "English tab missing");
      assert.ok(labels.some((l) => l.includes("Français")), "Français tab missing");
    });

    it("defaults to the English tab and shows English inputs", async () => {
      const input = await waitVisible(
        driver,
        By.css("input[placeholder='Enter English title']")
      );
      assert.ok(input);
    });

    it("shows the English description textarea", async () => {
      const textarea = await waitVisible(
        driver,
        By.css("textarea[placeholder='Enter English description']")
      );
      assert.ok(textarea);
    });

    it("switches to the Français tab and shows French inputs", async () => {
      const frTab = await waitFor(
        driver,
        By.xpath("//button[contains(.,'Français')]")
      );
      await frTab.click();

      const frInput = await waitVisible(
        driver,
        By.css("input[placeholder='Entrez le titre français']")
      );
      assert.ok(frInput);
    });

    it("shows the French description textarea when on the Français tab", async () => {
      const textarea = await waitVisible(
        driver,
        By.css("textarea[placeholder='Entrez la description française']")
      );
      assert.ok(textarea);
    });

    it("preserves field values when switching between tabs", async () => {
      // Switch to English and type a title
      const enTab = await waitFor(driver, By.xpath("//button[contains(.,'English')]"));
      await enTab.click();

      const enInput = await waitVisible(driver, By.css("input[placeholder='Enter English title']"));
      await enInput.clear();
      await enInput.sendKeys("Test Entry");

      // Switch away and back — value should be preserved
      const frTab = await waitFor(driver, By.xpath("//button[contains(.,'Français')]"));
      await frTab.click();
      await enTab.click();

      // Re-query: React remounts the input with a new key on tab switch
      const enInputAfter = await waitVisible(driver, By.css("input[placeholder='Enter English title']"));
      const preserved = await enInputAfter.getAttribute("value");
      assert.equal(preserved, "Test Entry", "English title should be preserved after tab switch");

      // Clean up
      await enInputAfter.clear();
    });

    it("renders the Save Entry button", async () => {
      const btn = await waitVisible(
        driver,
        By.xpath("//button[contains(text(),'Save Entry')]")
      );
      assert.ok(btn);
    });

    it("resets English fields after a successful form submission", async () => {
      // Ensure we're on the English tab
      const enTab = await waitFor(driver, By.xpath("//button[contains(.,'English')]"));
      await enTab.click();

      const titleInput = await waitVisible(driver, By.css("input[placeholder='Enter English title']"));
      await titleInput.clear();
      await titleInput.sendKeys("E2E Test Title");

      const descInput = await waitVisible(
        driver,
        By.css("textarea[placeholder='Enter English description']")
      );
      await descInput.clear();
      await descInput.sendKeys("E2E test description");

      const saveBtn = await waitFor(driver, By.xpath("//button[contains(text(),'Save Entry')]"));
      await saveBtn.click();

      // Fields should be empty after reset — re-query since React re-renders
      const titleAfter = await waitVisible(driver, By.css("input[placeholder='Enter English title']"));
      const titleValue = await titleAfter.getAttribute("value");
      assert.equal(titleValue, "", "English title should be empty after submit");

      const descAfter = await driver.findElement(
        By.css("textarea[placeholder='Enter English description']")
      );
      const descValue = await descAfter.getAttribute("value");
      assert.equal(descValue, "", "English description should be empty after submit");
    });
  });

  // -------------------------------------------------------------------------
  // ContentfulTable (right panel)
  // -------------------------------------------------------------------------

  describe("ContentfulTable", () => {
    it("renders the Content Entries heading", async () => {
      const heading = await waitVisible(
        driver,
        By.xpath("//h1[text()='Content Entries']")
      );
      assert.ok(heading);
    });

    it("shows the delay hint text", async () => {
      const hint = await waitVisible(
        driver,
        By.xpath("//*[contains(text(),'Changes may take up to 5 mins')]")
      );
      assert.ok(hint);
    });

    it("renders the refresh button with correct aria-label", async () => {
      const btn = await waitFor(driver, By.css("button[aria-label='Refresh data']"));
      assert.ok(btn);
    });

    it("shows the refresh tooltip on hover", async () => {
      const btn = await waitFor(driver, By.css("button[aria-label='Refresh data']"));
      const actions = driver.actions({ async: true });
      await actions.move({ origin: btn }).perform();

      const tooltip = await waitVisible(
        driver,
        By.xpath("//*[@role='tooltip'][contains(text(),'Refresh Content')]")
      );
      assert.ok(tooltip);
    });

    it("renders the table header columns", async () => {
      const headers = await driver.findElements(By.css("thead th"));
      const texts = await Promise.all(headers.map((h) => h.getText()));
      assert.ok(texts.some((t) => /title/i.test(t)), "Title column missing");
      assert.ok(texts.some((t) => /status/i.test(t)), "Status column missing");
      assert.ok(texts.some((t) => /created/i.test(t)), "Created column missing");
      assert.ok(texts.some((t) => /updated/i.test(t)), "Last Updated column missing");
    });

    it("shows a status badge for rows in the table", async () => {
      const rows = await driver.findElements(By.css("tbody tr"));
      if (rows.length === 0) {
        console.log("  ⚠ No rows found — skipping (requires live Contentful data)");
        return;
      }
      const badges = await driver.findElements(
        By.xpath("//tbody//span[text()='Published' or text()='Draft']")
      );
      assert.ok(badges.length > 0, "Expected at least one status badge in the table");
    });

    it("clicking a table row navigates to detail view", async () => {
      const rows = await driver.findElements(By.css("tbody tr"));
      if (rows.length === 0) {
        console.log("  ⚠ No rows found — skipping detail view test (requires live Contentful data)");
        return;
      }

      await rows[0].click();

      const detailHeading = await waitVisible(
        driver,
        By.xpath("//h1[text()='Entry Details']")
      );
      assert.ok(detailHeading);
    });

    it("shows Created and Last Updated dates in the detail view", async () => {
      if (!await inDetailView(driver)) {
        console.log("  ⚠ Not in detail view — skipping (requires live Contentful data)");
        return;
      }

      const created = await waitVisible(driver, By.xpath("//*[contains(text(),'Created')]"));
      const updated = await waitVisible(driver, By.xpath("//*[contains(text(),'Last Updated')]"));
      assert.ok(created, "Created label should be visible");
      assert.ok(updated, "Last Updated label should be visible");
    });

    it("shows a status badge in the detail view header", async () => {
      if (!await inDetailView(driver)) {
        console.log("  ⚠ Not in detail view — skipping (requires live Contentful data)");
        return;
      }

      const badge = await waitVisible(
        driver,
        By.xpath("//*[text()='Published' or text()='Draft']")
      );
      assert.ok(badge, "Status badge should be visible in the detail view header");
    });

    it("shows locale tabs after the entry detail loads", async () => {
      if (!await inDetailView(driver)) {
        console.log("  ⚠ Not in detail view — skipping (requires live Contentful data)");
        return;
      }

      // Wait for loading spinner to disappear
      await driver.wait(async () => {
        const loading = await driver.findElements(
          By.xpath("//*[contains(text(),'Loading localized content')]")
        );
        return loading.length === 0;
      }, TIMEOUT, "Entry detail did not finish loading");

      // Use following:: axis to scope to elements AFTER the "Entry Details" h1.
      // Form locale buttons appear before the h1 in DOM order (left panel renders first),
      // so following:: correctly isolates the table's locale tabs.
      const enTab = await waitVisible(
        driver,
        By.xpath("//h1[text()='Entry Details']/following::button[contains(.,'English') and contains(@class,'border-b-2')][1]")
      );
      const frTab = await waitVisible(
        driver,
        By.xpath("//h1[text()='Entry Details']/following::button[contains(.,'Français') and contains(@class,'border-b-2')][1]")
      );
      assert.ok(enTab, "English locale tab missing in detail view");
      assert.ok(frTab, "Français locale tab missing in detail view");
    });

    it("switches to the Français locale tab in the detail view", async () => {
      if (!await inDetailView(driver)) {
        console.log("  ⚠ Not in detail view — skipping (requires live Contentful data)");
        return;
      }

      const frTab = await waitFor(
        driver,
        By.xpath("//h1[text()='Entry Details']/following::button[contains(.,'Français') and contains(@class,'border-b-2')][1]")
      );
      await frTab.click();

      const isActive = await driver.executeScript(
        "return arguments[0].className.includes('c94f7c');",
        frTab
      );
      assert.ok(isActive, "Français locale tab should be visually active after clicking");
    });

    it("switches back to the English locale tab in the detail view", async () => {
      if (!await inDetailView(driver)) {
        console.log("  ⚠ Not in detail view — skipping (requires live Contentful data)");
        return;
      }

      const enTab = await waitFor(
        driver,
        By.xpath("//h1[text()='Entry Details']/following::button[contains(.,'English') and contains(@class,'border-b-2')][1]")
      );
      await enTab.click();

      const isActive = await driver.executeScript(
        "return arguments[0].className.includes('c94f7c');",
        enTab
      );
      assert.ok(isActive, "English locale tab should be visually active after clicking");
    });

    it("Back to table button returns to table view", async () => {
      const rows = await driver.findElements(By.css("tbody tr")).catch(() => []);
      if (rows.length === 0) {
        const inDetail = await inDetailView(driver);
        if (!inDetail) {
          console.log("  ⚠ Not in detail view — skipping (requires live Contentful data)");
          return;
        }
      }

      const backBtn = await waitVisible(
        driver,
        By.xpath("//button[contains(text(),'Back to table')]")
      );
      await backBtn.click();

      const tableHeading = await waitVisible(
        driver,
        By.xpath("//h1[text()='Content Entries']")
      );
      assert.ok(tableHeading);
    });

    it("disables the refresh button immediately after clicking (cooldown)", async () => {
      // Ensure we're back in table view before testing cooldown
      await waitVisible(driver, By.xpath("//h1[text()='Content Entries']"));

      const btn = await waitFor(driver, By.css("button[aria-label='Refresh data']"));
      await btn.click();

      const cooldownBtn = await waitFor(
        driver,
        By.css("button[aria-label='Refresh on cooldown']"),
        3_000
      );
      const isDisabled = await cooldownBtn.getAttribute("disabled");
      assert.ok(isDisabled !== null, "Refresh button should be disabled during cooldown");
    });

    it("re-enables the refresh button after the 5-second cooldown expires", async () => {
      // Wait out the cooldown with a small buffer
      await driver.sleep(5_500);

      const btn = await waitFor(driver, By.css("button[aria-label='Refresh data']"), 3_000);
      const isDisabled = await btn.getAttribute("disabled");
      assert.equal(isDisabled, null, "Refresh button should be re-enabled after cooldown");
    });
  });
});
