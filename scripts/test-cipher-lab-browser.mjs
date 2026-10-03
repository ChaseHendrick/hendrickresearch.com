/** Real browser worker and page integration, including the pinned CDN.
 * Run against npm run preview, for example:
 * PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node scripts/test-cipher-lab-browser.mjs --base-url http://127.0.0.1:4173
 * This test downloads runtime assets. It sends no ciphertext to a service.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';

const argument = process.argv.indexOf('--base-url');
const base = argument >= 0 ? process.argv[argument + 1] : 'http://127.0.0.1:4173';
const screenshotArgument = process.argv.indexOf('--screenshots-dir');
const screenshotDirectory = screenshotArgument >= 0 ? process.argv[screenshotArgument + 1] : null;
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch({headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? {executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE} : {})});
const plaintext = 'THELIBRARIANPLACEDTHESEALEDLETTERBESIDETHEMAPANDWAITEDFORTHENIGHTTRAINWHILETHERAINFELLONTHESILENTPLATFORM';
const expectedHash = createHash('sha256').update(plaintext).digest('hex');
const checks = [];

async function finish(page, timeout = 180_000) {
  await page.locator('#cipher-fields:not([disabled])').waitFor({timeout});
  await page.locator('#cipher-raw:not([hidden])').waitFor({timeout: 1000});
  return JSON.parse(await page.locator('#cipher-json').textContent());
}
try {
  const context = await browser.newContext({viewport: {width: 1440, height: 1100}});
  const page = await context.newPage();
  const requests = [], pageErrors = [];
  page.on('request', request => requests.push({url: request.url(), method: request.method(), body: request.postData()}));
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(`${base}/cipher-lab/`, {waitUntil: 'networkidle'});
  assert.equal(await page.locator('#cipher-tool').inputValue(), 'normal-man');
  const initialLetters = (await page.locator('#cipher-input').inputValue()).replace(/[^a-z]/gi, '').length;
  assert.equal(await page.locator('#cipher-count').textContent(), `${initialLetters} letters`);
  const initialHtml = await (await context.request.get(`${base}/cipher-lab/`)).text();
  assert.match(initialHtml, new RegExp(`id="cipher-count">${initialLetters} letters`));
  assert.equal(requests.filter(request => request.url.includes('engine.zip') || request.url.includes('cdn.jsdelivr.net/pyodide')).length, 0, 'Python must load only after a user action');
  checks.push('lazy startup');
  await page.locator('#cipher-mode-search').focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#cipher-bob').getAttribute('aria-selected'), 'true');
  assert.match(await page.locator('#cipher-run').textContent(), /Identify family/);
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('#cipher-mode-search').getAttribute('aria-selected'), 'true');
  assert.match(await page.locator('#cipher-run').textContent(), /Run solver/);
  assert.equal(requests.filter(request => request.url.includes('engine.zip')).length, 0);
  checks.push('correct initial server-rendered letter count and keyboard mode tabs');
  assert.equal(await page.locator('.cipher-research-entry').count(), 8);
  assert.match(await page.locator('.cipher-research-intro').textContent(), /does not decipher unknown glyph scripts/);
  const researchSummary = page.locator('#research-kryptos-k4 > summary');
  await researchSummary.focus();
  await page.keyboard.press('Enter');
  assert.ok(await page.locator('#research-kryptos-k4 .cipher-research-body').isVisible());
  assert.match(await page.locator('#research-kryptos-k4 .cipher-research-body').textContent(), /private K4 plaintext/);
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#research-kryptos-k4').getAttribute('open'), null);
  checks.push('eight source-linked research disclosures, keyboard access and script limits');

  // Cancel while startup is pending. Retry must use a new worker and remain usable.
  await page.locator('#cipher-run').click();
  await page.locator('#cipher-cancel:not([hidden])').waitFor();
  await page.locator('#cipher-cancel').click();
  await page.locator('#cipher-fields:not([disabled])').waitFor();
  assert.match(await page.locator('#cipher-status').textContent(), /Cancelled/);
  await page.locator('#cipher-run').click();
  const control = await finish(page);
  assert.equal(control.tool, 'normal-man');
  assert.equal(control.executed, true);
  assert.equal(control.result.checks, 32);
  assert.ok(control.result.candidates.some(candidate => createHash('sha256').update(candidate.plaintext).digest('hex') === expectedHash));
  assert.equal(control.result.claimed_plaintext, null);
  assert.equal(control.result.correctness_known, false);
  assert.equal(await page.locator('.cipher-candidate:not([hidden])').count(), 3);
  assert.match(await page.locator('.cipher-candidate').first().textContent(), /No fitting cribs supplied/);
  await page.locator('[data-more-candidates]').click();
  assert.equal(await page.locator('.cipher-candidate:not([hidden])').count(), control.result.candidates.length);
  assert.deepEqual(JSON.parse(await page.locator('#cipher-json').textContent()), control);
  await page.locator('[data-more-candidates]').click();
  assert.equal(await page.locator('.cipher-candidate:not([hidden])').count(), 3);
  checks.push('actual Pyodide Caesar/rail control; cancel and fresh-worker retry');
  checks.push('compact candidate expansion with complete raw JSON and accurate no-crib labels');

  const response = await context.request.get(`${base}/cipher-lab/manifest.json`);
  const manifest = await response.json();
  assert.equal(manifest.pyodide_version, '314.0.7');
  const archive = await context.request.get(`${base}/cipher-lab/engine.zip`);
  assert.equal(createHash('sha256').update(await archive.body()).digest('hex'), manifest.archive_sha256);
  assert.match(await page.locator('#cipher-provenance').textContent(), new RegExp(manifest.model_sha256.slice(0, 12)));
  if (manifest.source_dirty) assert.match(await page.locator('#cipher-provenance').textContent(), /local source changes/);
  checks.push('actual served archive integrity and visible model/source provenance');
  if (screenshotDirectory) {
    await mkdir(screenshotDirectory, {recursive: true});
    await page.evaluate(() => { document.activeElement?.blur(); document.getElementById('cipher-results').scrollTop = 0; window.scrollTo({top: 0, behavior: 'instant'}); });
    await page.screenshot({path: join(screenshotDirectory, 'cipher-lab-desktop.png'), fullPage: true});
    const mobile = await context.newPage();
    await mobile.setViewportSize({width: 390, height: 844});
    await mobile.goto(`${base}/cipher-lab/`, {waitUntil: 'networkidle'});
    assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Mobile page must not overflow horizontally');
    await mobile.evaluate(() => { document.activeElement?.blur(); window.scrollTo({top: 0, behavior: 'instant'}); });
    await mobile.screenshot({path: join(screenshotDirectory, 'cipher-lab-mobile.png'), fullPage: true});
    await mobile.close();
    const tablet = await context.newPage();
    await tablet.setViewportSize({width: 820, height: 1000});
    await tablet.goto(`${base}/cipher-lab/`, {waitUntil: 'networkidle'});
    assert.ok(await tablet.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Tablet page must not overflow horizontally');
    const formBox = await tablet.locator('#cipher-form').boundingBox();
    const outputBox = await tablet.locator('.cipher-output').boundingBox();
    assert.ok(outputBox.y >= formBox.y + formBox.height - 1, 'Tablet results should stack below the form');
    await tablet.close();
    checks.push('desktop/mobile screenshots and narrow/tablet layout checks');
  }

  await page.locator('#cipher-bob').click();
  await page.locator('#cipher-run').click();
  const bob = await finish(page);
  assert.equal(bob.kind, 'family_ranking');
  assert.equal(bob.model_name, 'Bob the Neural Net');
  assert.equal(bob.model_sha256, manifest.model_sha256);
  assert.equal(bob.claimed_plaintext, null);
  assert.ok(bob.candidates.length >= 17);
  assert.ok(Math.abs(bob.candidates.reduce((total, row) => total + row.probability, 0) - 1) < 1e-8);
  assert.ok(bob.candidates.every(row => Number.isFinite(row.probability) && row.probability >= 0 && row.probability <= 1));
  checks.push('actual NumPy Bob inference from the verified model');

  const downloadEvent = page.waitForEvent('download');
  await page.locator('#cipher-download').click();
  const download = await downloadEvent;
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  assert.deepEqual(JSON.parse(Buffer.concat(chunks).toString()), bob);
  checks.push('local JSON export parity');

  const nextPolicy = page.locator('#cipher-results [data-policy]');
  assert.equal(await nextPolicy.count(), 1, 'Known-family advice should offer an applicable next policy');
  const suggestedPolicy = await nextPolicy.getAttribute('data-policy');
  await nextPolicy.click();
  assert.equal(await page.locator('#cipher-mode-search').getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('#cipher-tool').inputValue(), suggestedPolicy);
  assert.equal(await page.locator('#cipher-raw').getAttribute('hidden'), '');
  checks.push('Bob advice selects a real search policy and invalidates the old report');

  await page.locator('#cipher-mode-search').click();
  await page.locator('#cipher-tool').selectOption('detective');
  await page.locator('#cipher-run').click();
  assert.match(await page.locator('#cipher-status').textContent(), /unplaced crib/);
  assert.equal(await page.locator('#cipher-fields').isDisabled(), false);
  checks.push('required semantic clue rejection');

  await page.locator('[data-example="2"]').click();
  await page.locator('#cipher-run').click();
  const suppliedClues = await finish(page);
  assert.equal(suppliedClues.tool, 'inheritance');
  assert.ok(suppliedClues.result.candidates.some(candidate => candidate.plaintext === 'ATTACKATDAWN'));
  checks.push('actual keyword and aligned-crib inference');
  await page.locator('#cipher-keywords').fill('LEMON');
  assert.equal(await page.locator('#cipher-raw').getAttribute('hidden'), '');
  assert.equal(await page.locator('.cipher-export').getAttribute('hidden'), '');
  assert.match(await page.locator('#cipher-status').textContent(), /updated input/);
  checks.push('editing clues invalidates stale report and export controls');

  await page.locator('[data-example="0"]').click();
  await page.locator('#cipher-tool').selectOption('persona-council');
  if (await page.locator('.cipher-clues').getAttribute('open') === null) await page.locator('.cipher-clues > summary').click();
  await page.locator('#cipher-cribs').fill('0:THELIBRARIAN');
  if (await page.locator('.cipher-verification').getAttribute('open') === null) await page.locator('.cipher-verification > summary').click();
  await page.locator('#cipher-reserved').fill('27:LETTERBESIDE');
  await page.locator('#cipher-reference').fill(expectedHash);
  await page.locator('#cipher-run').click();
  const council = await finish(page);
  assert.equal(council.tool, 'persona-council');
  assert.equal(council.result.selected_personas.length, 10);
  assert.equal(council.result.checks, Object.values(council.result.persona_reports).reduce((total, report) => total + report.checks, 0));
  assert.ok(council.result.checks <= 5000);
  assert.ok(council.result.candidates.some(candidate => candidate.plaintext === plaintext && candidate.skeptic_review.status === 'exact-reference-match'));
  assert.equal(council.result.correctness_known, false);
  checks.push('actual ten-persona council, global budget and reserved independent postcheck');

  await page.locator('#cipher-reserved').fill('0:THE');
  await page.locator('#cipher-run').click();
  await page.locator('#cipher-fields:not([disabled])').waitFor({timeout: 5000});
  assert.match(await page.locator('#cipher-status').textContent(), /overlap/);
  assert.equal(await page.locator('#cipher-raw').getAttribute('hidden'), '');
  checks.push('actual fitting/reserved overlap error without stale report');

  assert.deepEqual(pageErrors, []);
  assert.ok(requests.every(request => request.method === 'GET' && request.body === null), 'No ciphertext or result upload may occur');
  assert.ok(requests.every(request => !request.url.includes(plaintext)), 'Plaintext must not appear in network requests');
  checks.push('no browser runtime errors or input/result uploads');
  await context.close();

  const blockedContext = await browser.newContext();
  await blockedContext.route('https://cdn.jsdelivr.net/pyodide/**', route => route.abort('blockedbyclient'));
  const blockedPage = await blockedContext.newPage();
  await blockedPage.goto(`${base}/cipher-lab/`, {waitUntil: 'networkidle'});
  await blockedPage.locator('#cipher-run').click();
  await blockedPage.locator('#cipher-fields:not([disabled])').waitFor({timeout: 15000});
  assert.match(await blockedPage.locator('#cipher-status').textContent(), /CDN.*connection.*content blockers/i);
  assert.equal(await blockedPage.locator('#cipher-raw').getAttribute('hidden'), '');
  checks.push('clear CDN-blocked startup error and enabled retry controls');
  await blockedContext.close();
  console.log(JSON.stringify({passed: checks.length, checks, pyodide_version: manifest.pyodide_version,
    archive_sha256: manifest.archive_sha256, model_sha256: manifest.model_sha256,
    source_git_commit: manifest.source_git_commit, source_dirty: manifest.source_dirty}, null, 2));
} finally {
  await browser.close();
}
