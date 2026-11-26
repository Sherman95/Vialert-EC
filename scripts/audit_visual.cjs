const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');

const projectRoot = path.resolve(__dirname, '..');
const auditDir = path.join(projectRoot, 'docs', 'design', 'audit');
const baseUrl = process.env.AUDIT_URL || 'http://127.0.0.1:4173/';
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

fs.mkdirSync(auditDir, { recursive: true });

const viewports = [
  [320, 568],
  [360, 800],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1366, 768],
  [1920, 1080],
];

const waitForApp = async (page) => {
  await page.locator('.app-splash').waitFor({ state: 'detached', timeout: 12000 }).catch(() => {});
  await page.getByText('Estado de vías', { exact: false }).first().waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(800);
};

const attachDiagnostics = (page, bucket) => {
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    const failure = request.failure()?.errorText || 'unknown';
    if (!failure.includes('ERR_ABORTED')) bucket.requestFailures.push(`${failure}: ${request.url()}`);
  });
};

const pageMetrics = async (page) => page.evaluate(() => {
  const visible = (element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
  };
  const smallTargets = [...document.querySelectorAll('button, a, select, input')]
    .filter(visible)
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        label: element.getAttribute('aria-label') || element.textContent?.trim().slice(0, 60) || element.tagName,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    })
    .filter(({ width, height }) => width < 44 || height < 44);
  return {
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    smallTargets,
    visibleCards: [...document.querySelectorAll('article')].filter(visible).length,
    visibleButtons: [...document.querySelectorAll('button')].filter(visible).length,
    logo: [...document.images].filter((image) => image.src.includes('/brand/')).map((image) => ({
      src: image.getAttribute('src'),
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      renderedWidth: Math.round(image.getBoundingClientRect().width),
      renderedHeight: Math.round(image.getBoundingClientRect().height),
    })),
  };
});

const makeContext = async (browser, viewport) => browser.newContext({
  viewport,
  locale: 'es-EC',
  colorScheme: 'light',
  serviceWorkers: 'allow',
});

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    chromePath,
    viewportRuns: [],
    scenarios: {},
  };

  try {
    for (const [width, height] of viewports) {
      const context = await makeContext(browser, { width, height });
      const page = await context.newPage();
      const diagnostics = { consoleErrors: [], pageErrors: [], requestFailures: [] };
      attachDiagnostics(page, diagnostics);
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await waitForApp(page);
      await page.screenshot({ path: path.join(auditDir, `viewport-${width}x${height}.png`) });
      report.viewportRuns.push({ width, height, metrics: await pageMetrics(page), ...diagnostics });
      await context.close();
    }

    // Main mobile interactions: tabs, marker popup, card action and orientation change.
    {
      const context = await makeContext(browser, { width: 390, height: 844 });
      const page = await context.newPage();
      const diagnostics = { consoleErrors: [], pageErrors: [], requestFailures: [] };
      attachDiagnostics(page, diagnostics);
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await waitForApp(page);

      const firstCardToggle = page.locator('#road-list-panel article > button').first();
      if (await firstCardToggle.count()) {
        await firstCardToggle.click();
        const viewButton = page.getByRole('button', { name: 'Ver en mapa' }).first();
        if (await viewButton.count()) await viewButton.click();
      } else {
        await page.getByRole('tab', { name: /Mapa/ }).click();
      }
      await page.locator('.leaflet-container').waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForTimeout(1200);
      const mapRect = await page.locator('.leaflet-container').boundingBox();
      await page.screenshot({ path: path.join(auditDir, 'map-mobile-390x844.png') });

      const marker = page.locator('.road-marker').first();
      let popupVisible = false;
      if (await marker.count()) {
        await marker.evaluate((element) => element.parentElement?.click());
        await page.waitForTimeout(300);
        popupVisible = await page.locator('.leaflet-popup').isVisible().catch(() => false);
        await page.screenshot({ path: path.join(auditDir, 'map-popup-390x844.png') });
      }

      await page.setViewportSize({ width: 844, height: 390 });
      await page.waitForTimeout(900);
      const landscapeRect = await page.locator('.leaflet-container').boundingBox();
      await page.screenshot({ path: path.join(auditDir, 'orientation-landscape-844x390.png') });

      report.scenarios.mobileMap = { mapRect, landscapeRect, popupVisible, ...diagnostics };
      await context.close();
    }

    // Province selection and highlight.
    {
      const context = await makeContext(browser, { width: 390, height: 844 });
      const page = await context.newPage();
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await waitForApp(page);
      const province = page.locator('#road-list-panel select:visible').last();
      const options = await province.locator('option').allTextContents();
      const selected = options.includes('PICHINCHA') ? 'PICHINCHA' : options.find((option) => option !== 'Todo Ecuador');
      if (selected) await province.selectOption({ label: selected });
      await page.getByRole('tab', { name: /Mapa/ }).click();
      await page.waitForTimeout(1600);
      const highlightVisible = await page.locator('.leaflet-overlay-pane path').count() > 0;
      await page.screenshot({ path: path.join(auditDir, 'map-province-highlight-390x844.png') });
      report.scenarios.provinceHighlight = { selected, highlightVisible };
      await context.close();
    }

    // Splash under slow API conditions, mobile and desktop.
    for (const [label, viewport] of [
      ['mobile', { width: 390, height: 844 }],
      ['desktop', { width: 1366, height: 768 }],
    ]) {
      const context = await makeContext(browser, viewport);
      const page = await context.newPage();
      const delayRoute = async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await route.continue();
      };
      await page.route('**/Services/WSVias/**', delayRoute);
      await page.route('**://vialert-ec.onrender.com/**', delayRoute);
      await page.route('**://127.0.0.1:8000/**', delayRoute);
      const startedAt = Date.now();
      await page.goto(`${baseUrl}?audit-splash=${label}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.locator('.app-splash').waitFor({ state: 'visible', timeout: 3000 });
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(auditDir, `splash-${label}-slow.png`) });
      await page.locator('.app-splash').waitFor({ state: 'detached', timeout: 10000 });
      report.scenarios[`splash-${label}`] = { visibleAtMs: 300, dismissedAtMs: Date.now() - startedAt };
      await context.close();
    }

    // Recoverable API error.
    {
      const context = await makeContext(browser, { width: 390, height: 844 });
      const page = await context.newPage();
      await page.route('**/Services/WSVias/**', (route) => route.abort('failed'));
      await page.route('**://vialert-ec.onrender.com/**', (route) => route.abort('failed'));
      await page.route('**://127.0.0.1:8000/**', (route) => route.abort('failed'));
      await page.goto(`${baseUrl}?audit-error=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.locator('.app-splash').waitFor({ state: 'detached', timeout: 10000 }).catch(() => {});
      const retry = page.getByRole('button', { name: /Reintentar conexión/ });
      await retry.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
      const retryVisible = await retry.isVisible().catch(() => false);
      await page.screenshot({ path: path.join(auditDir, 'data-error-recoverable-390x844.png') });
      report.scenarios.apiError = { retryVisible };
      await context.close();
    }

    // Tile failure and recovery control.
    {
      const context = await makeContext(browser, { width: 390, height: 844 });
      const page = await context.newPage();
      await page.route(/tile\.openstreetmap\.org/, (route) => route.abort('failed'));
      await page.goto(`${baseUrl}?audit-tiles=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await waitForApp(page);
      await page.getByRole('tab', { name: /Mapa/ }).click();
      const retry = page.getByRole('button', { name: 'Reintentar mapa' });
      await retry.waitFor({ state: 'visible', timeout: 12000 });
      await page.screenshot({ path: path.join(auditDir, 'map-tile-error-390x844.png') });
      report.scenarios.tileError = { retryVisible: await retry.isVisible() };
      await context.close();
    }

    // Offline reload after a successful visit and service-worker activation.
    {
      const context = await makeContext(browser, { width: 390, height: 844 });
      const page = await context.newPage();
      await page.goto(`${baseUrl}?audit-offline-seed=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await waitForApp(page);
      await page.evaluate(() => navigator.serviceWorker?.ready);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
      await waitForApp(page);
      await context.setOffline(true);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(1500);
      const offlineNotice = await page.getByText('Sin conexión', { exact: false }).isVisible().catch(() => false);
      const visibleCards = await page.locator('#road-list-panel article').count();
      await page.screenshot({ path: path.join(auditDir, 'offline-cached-390x844.png') });
      report.scenarios.offline = { offlineNotice, visibleCards };
      await context.setOffline(false);
      await context.close();
    }

    // PWA manifest/installability inspection through Chrome DevTools Protocol.
    {
      const context = await makeContext(browser, { width: 390, height: 844 });
      const page = await context.newPage();
      await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
      const session = await context.newCDPSession(page);
      await session.send('Page.enable');
      const manifest = await session.send('Page.getAppManifest');
      const installability = await session.send('Page.getInstallabilityErrors');
      const swState = await page.evaluate(async () => {
        const registration = await navigator.serviceWorker.ready;
        return {
          controlled: Boolean(navigator.serviceWorker.controller),
          activeState: registration.active?.state || null,
          scope: registration.scope,
          cacheNames: await caches.keys(),
        };
      });
      report.scenarios.pwa = {
        manifestUrl: manifest.url,
        manifestErrors: manifest.errors,
        installability,
        swState,
      };
      await context.close();
    }
  } finally {
    await browser.close();
  }

  fs.writeFileSync(path.join(auditDir, 'browser-results.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
