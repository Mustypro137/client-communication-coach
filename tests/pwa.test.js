// Tests for the installable app: the offline file list in sw.js and the manifest. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url); // the project folder
const read = (path) => readFileSync(new URL(path, root), 'utf8');

// The FILES list from sw.js, e.g. ['./', 'index.html', ...]
const files = JSON.parse(read('sw.js').match(/const FILES = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"'));

test('every file in the offline list exists', () => {
  for (const f of files) assert.ok(existsSync(new URL(f, root)), `${f} is in sw.js but does not exist`);
});

test('every page, script and icon is in the offline list', () => {
  const needed = [
    'index.html', 'app.html', 'style.css', 'manifest.webmanifest',
    ...readdirSync(new URL('js/', root)).map(f => `js/${f}`),
    ...readdirSync(new URL('icons/', root)).map(f => `icons/${f}`)
  ];
  for (const f of needed) assert.ok(files.includes(f), `add '${f}' to FILES in sw.js`);
});

test('the manifest opens the app and its icons exist', () => {
  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.equal(manifest.start_url, 'app.html');
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.some(i => i.sizes === '512x512' && i.purpose === 'maskable'));
  for (const icon of manifest.icons) assert.ok(existsSync(new URL(icon.src, root)), `${icon.src} is missing`);
});
