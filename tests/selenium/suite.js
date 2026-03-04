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
      assert.ok(labels.some((l) => l.includes("Español")), "Español tab missing");
    });

    it("defaults to the English tab and shows English inputs", async () => {
      const input = await waitVisible(
        driver,
        By.css("input[placeholder='Enter English title']")
      );
      assert.ok(input);
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

    it("switches to the Español tab and shows Spanish inputs", async () => {
      const esTab = await waitFor(
        driver,
        By.xpath("//button[contains(.,'Español')]")
      );
      await esTab.click();

      const esInput = await waitVisible(
        driver,
        By.css("input[placeholder='Ingresa el título en español']")
      );
      assert.ok(esInput);
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

    it("Back to table button returns to table view", async () => {
      const rows = await driver.findElements(By.css("tbody tr")).catch(() => []);
      if (rows.length === 0) {
        // Check if we're already in detail view from previous test
        const inDetail = await driver
          .findElements(By.xpath("//h1[text()='Entry Details']"))
          .then((els) => els.length > 0);
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
  });
});
