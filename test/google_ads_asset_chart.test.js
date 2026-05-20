const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

test('ad assets page renders a middle performance chart with chart controls', () => {
  const template = fs.readFileSync(path.join(__dirname, '..', 'views', 'google_ads.ejs'), 'utf8');

  assert.match(template, /<section\s+v-if="pageMode !== 'reporteditor'"\s+class="ga-context-bar"/);
  assert.doesNotMatch(template, /<section\s+v-if="pageMode !== 'adassets'"\s+class="ga-context-bar"/);
  assert.match(template, /<div\s+v-if="pageMode === 'campaigns' \|\| pageMode === 'adassets'"\s+class="ga-tabs"/);
  assert.match(template, /<div\s+v-if="pageMode !== 'adassets'"\s+class="ga-date-row"/);
  assert.match(
    template,
    /<section\s+v-if="pageMode === 'adassets'"\s+class="ga-asset-chart-area"/
  );
  assert.match(template, /aria-label="Ad asset performance chart"/);
  assert.match(template, />Clicks</);
  assert.match(template, />None</);
  assert.match(template, />Chart type</);
  assert.match(template, />Expand</);
  assert.match(template, />Adjust</);
});

test('ad assets table filter toolbar stays pinned while scrolling', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'public', 'google_ads.css'), 'utf8');

  assert.match(css, /\.ga-table-toolbar\s*\{[^}]*position:\s*sticky;/s);
  assert.match(css, /\.ga-table-panel--adassets\s+\.ga-table-toolbar\s*\{[^}]*top:\s*56px;/s);
  assert.match(css, /\.ga-table-panel--adassets\s+\.ga-table-toolbar\s*\{[^}]*z-index:\s*45;/s);
});

test('campaign and ad group pages render conversions as a dot chart with a left axis', () => {
  const template = fs.readFileSync(path.join(__dirname, '..', 'views', 'google_ads.ejs'), 'utf8');
  const styles = fs.readFileSync(path.join(__dirname, '..', 'public', 'google_ads.css'), 'utf8');

  assert.match(
    template,
    /<section\s+v-if="pageMode === 'campaigns' \|\| pageMode === 'adgroups'"\s+class="ga-chart-area ga-conversions-dot-chart"/
  );
  assert.match(template, /aria-label="Conversions dot chart"/);
  assert.match(template, /\{\{\s*conversionsChartLabels\.max\s*\}\}/);
  assert.match(template, /\{\{\s*conversionsChartLabels\.mid\s*\}\}/);
  assert.match(template, /\{\{\s*conversionsChartLabels\.min\s*\}\}/);
  assert.match(template, /<circle\s+:cx="conversionsChartPoint\.x"\s+:cy="conversionsChartPoint\.y"\s+r="4"\s+class="ga-chart-point"/);
  assert.match(styles, /\.ga-conversions-dot-chart\s+\.ga-chart-label\s*\{[^}]*text-anchor:\s*end;/s);
  assert.match(styles, /\.ga-chart-point\s*\{[^}]*fill:\s*#1a73e8;/s);
  assert.doesNotMatch(template, /<polyline\s+points="20,154 980,154"\s+class="ga-chart-line"><\/polyline>/);
});
