# Google Ads Boot Logo Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a one-shot Google Ads boot logo expansion animation on browser-level page refreshes across the report editor and Google Ads shell pages.

**Architecture:** Reuse the existing three-part CSS boot logo in `public/style.css` as the shared visual primitive because both EJS templates already load that stylesheet. Keep report editor boot timing in `public/app.js`, add equivalent loader markup and hide timing to the Google Ads shell, and leave in-app refresh overlays unchanged.

**Tech Stack:** Koa, EJS, Vue global runtime, CSS keyframes, Node built-in test runner.

---

## File Map

- `test/google_ads_boot_loading.test.js`: Regression coverage for shared boot markup, one-shot CSS animation, and Google Ads loader hide behavior.
- `views/google_ads.ejs`: Browser-refresh boot timestamp and full-page loader markup for campaigns, ad groups, and ad assets.
- `public/style.css`: Shared boot logo animation, expanded end-state fill behavior, and reduced-motion fallback.
- `public/google_ads.js`: Hide the Google Ads shell boot loader after its initial data load and minimum boot interval.

### Task 1: Lock The Shared Boot Animation Contract

**Files:**
- Create: `test/google_ads_boot_loading.test.js`
- Test: `test/google_ads_boot_loading.test.js`

- [ ] **Step 1: Write the failing markup and CSS test**

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

test('browser boot loaders expand the Google Ads logo once and hold the expanded state', () => {
  const reportTemplate = fs.readFileSync(path.join(__dirname, '..', 'views', 'index.ejs'), 'utf8');
  const googleAdsTemplate = fs.readFileSync(path.join(__dirname, '..', 'views', 'google_ads.ejs'), 'utf8');
  const styles = fs.readFileSync(path.join(__dirname, '..', 'public', 'style.css'), 'utf8');

  assert.match(reportTemplate, /id="report-boot-loader"\s+class="report-boot-loader"/);
  assert.match(googleAdsTemplate, /window\.__googleAdsBootStartedAt = performance\.now\(\)/);
  assert.match(googleAdsTemplate, /id="google-ads-boot-loader"\s+class="report-boot-loader"/);
  assert.match(googleAdsTemplate, /class="report-boot-logo-yellow"/);
  assert.match(styles, /\.report-boot-logo-yellow\s*\{[^}]*animation:\s*report-boot-yellow-expand[^;]*forwards;/s);
  assert.match(styles, /\.report-boot-logo-green\s*\{[^}]*animation:\s*report-boot-green-expand[^;]*forwards;/s);
  assert.match(styles, /\.report-boot-logo-blue\s*\{[^}]*animation:\s*report-boot-blue-expand[^;]*forwards;/s);
  assert.match(styles, /@keyframes report-boot-yellow-expand/);
  assert.match(styles, /@keyframes report-boot-green-expand/);
  assert.match(styles, /@keyframes report-boot-blue-expand/);
  assert.match(styles, /@media \(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*\.report-boot-logo span\s*\{[^}]*animation:\s*none;/s);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/google_ads_boot_loading.test.js`

Expected: FAIL because `views/google_ads.ejs` has no Google Ads shell boot loader or boot timestamp yet.

- [ ] **Step 3: Add the shell loader markup and CSS keyframes**

Add a timestamp before styles in `views/google_ads.ejs`:

```html
<script>
    window.__googleAdsBootStartedAt = performance.now();
</script>
```

Add loader markup before `#google-ads-app`:

```html
<div id="google-ads-boot-loader" class="report-boot-loader" role="status" aria-label="Loading Google Ads">
    <div class="report-boot-progress" aria-hidden="true">
        <span></span>
    </div>
    <div class="report-boot-logo" aria-hidden="true">
        <span class="report-boot-logo-yellow"></span>
        <span class="report-boot-logo-green"></span>
        <span class="report-boot-logo-blue"></span>
    </div>
</div>
```

Update `public/style.css` so each logo part animates once:

```css
.report-boot-logo-yellow {
    animation: report-boot-yellow-expand 620ms cubic-bezier(0.2, 0, 0, 1) forwards;
}

.report-boot-logo-green {
    animation: report-boot-green-expand 620ms cubic-bezier(0.2, 0, 0, 1) forwards;
}

.report-boot-logo-blue {
    animation: report-boot-blue-expand 620ms cubic-bezier(0.2, 0, 0, 1) forwards;
}
```

Define keyframes with compact first-frame transforms, expanded final transforms, and a reduced-motion block that disables the logo movement while leaving final static logo coordinates in place.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test test/google_ads_boot_loading.test.js`

Expected: PASS.

### Task 2: Hide The Google Ads Shell Loader After Initial Load

**Files:**
- Modify: `test/google_ads_boot_loading.test.js`
- Modify: `public/google_ads.js`
- Test: `test/google_ads_boot_loading.test.js`

- [ ] **Step 1: Write the failing hide behavior test**

```js
test('google ads shell hides its boot loader after the minimum visible interval', () => {
  const { config, sandbox } = loadGoogleAdsAppConfig();
  const loader = sandbox.loader;

  config.methods.hideGoogleAdsBootLoader.call({});

  assert.equal(sandbox.timeouts[0].delay, 0);
  sandbox.timeouts[0].callback();
  assert.equal(loader.hidden, true);
  assert.equal(sandbox.timeouts[1].delay, 220);
  sandbox.timeouts[1].callback();
  assert.equal(loader.removed, true);
});
```

Build `loadGoogleAdsAppConfig()` with a document stub that returns the boot loader from `getElementById('google-ads-boot-loader')`, a `performance.now()` value greater than one second after `window.__googleAdsBootStartedAt`, and a `window.setTimeout()` stub that records callbacks and delays.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/google_ads_boot_loading.test.js`

Expected: FAIL because `hideGoogleAdsBootLoader` does not exist.

- [ ] **Step 3: Add the shell hide method and call it from initial mount**

Add this method in `public/google_ads.js`:

```js
hideGoogleAdsBootLoader() {
    const loader = document.getElementById('google-ads-boot-loader');
    if (!loader) return;

    const startedAt = Number(window.__googleAdsBootStartedAt || 0);
    const elapsed = startedAt ? performance.now() - startedAt : 0;
    const remaining = Math.max(0, 1000 - elapsed);

    window.setTimeout(() => {
        loader.classList.add('is-hidden');
        window.setTimeout(() => loader.remove(), 220);
    }, remaining);
}
```

Call `this.hideGoogleAdsBootLoader();` after `await this.loadData();` in `mounted()` so the boot overlay tracks initial browser page entry but not later in-app refreshes.

- [ ] **Step 4: Run the focused tests**

Run: `node --test test/google_ads_boot_loading.test.js test/reporteditor_refresh_loading.test.js`

Expected: PASS.

### Task 3: Verify The Frontend Change

**Files:**
- Verify: `public/style.css`
- Verify: `views/google_ads.ejs`
- Verify: `public/google_ads.js`

- [ ] **Step 1: Run the full Node test suite**

Run: `npm test`

Expected: PASS.

- [ ] **Step 2: Verify rendered browser refresh flows**

Check these refresh flows:

```text
https://localhost:443/aw/reporteditor
https://localhost:443/aw/campaigns
```

Expected: Each browser refresh starts with the compact boot logo, expands once into the complete Google Ads mark, holds the expanded mark while loading, then fades the boot overlay away. In-app Refresh controls retain their scoped refresh states.
