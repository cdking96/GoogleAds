const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

test('ad assets page renders a middle performance chart with chart controls', () => {
  const template = fs.readFileSync(path.join(__dirname, '..', 'views', 'google_ads.ejs'), 'utf8');

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
