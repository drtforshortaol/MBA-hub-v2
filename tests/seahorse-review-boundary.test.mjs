import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {ownerTextApprovalSupported} from '../scripts/public-review.mjs';

const root = new URL('../src/apps/big-bellied-seahorse/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('manifest.json', root), 'utf8'));
const html = readFileSync(new URL('index.html', root), 'utf8');

test('Seahorse authored text has explicit owner approval while release and image gates remain', () => {
  assert.equal(manifest.app_id, 'big-bellied-seahorse');
  assert.equal(manifest.status, 'testing');
  assert.equal(manifest.publication_review, 'owner-approved-text');
  assert.equal(ownerTextApprovalSupported(manifest),true);
  assert.match(html, /Authored text approved by owner on October 29, 2026\./);
  assert.match(html, /Image permissions and release acceptance pending\./);
  assert.match(html, /attribution and publication permission pending\./);
  assert.match(html, /Check authoritative listings again before publication\./);
  assert.match(html, /MBA Species Guide • Draft/);
});

test('Seahorse search sections remain identical to their displayed draft text', () => {
  assert.equal(manifest.sections.length, 10);
  const ids = new Set();
  for (const { id, title, text } of manifest.sections) {
    assert.ok(!ids.has(id), `duplicate section: ${id}`);
    ids.add(id);
    const paragraph=html.match(new RegExp('<details id="'+id+'"><summary>[^<]+</summary><p>(.*?)</p>'));
    assert.ok(paragraph, 'missing displayed section: '+id);
    assert.equal(paragraph[1].replace(/<[^>]+>/g,'').replaceAll('&amp;','&'), text, 'manifest/display mismatch: '+id);
  }
});

test('Seahorse photos remain registered for offline review without implying permission', () => {
  const images = [...html.matchAll(/<img\b[^>]*\bsrc="\.\.\/(IMG_\d+\.jpeg)"/g)].map(match => match[1]);
  const paths = [...new Set(images.map(image => `apps/${image}`))].sort();
  assert.deepEqual(paths, manifest.offline_assets.filter(path => path.endsWith('.jpeg')).sort());
  assert.equal(paths.length, 5);
  assert.equal(manifest.media.length, 5);
});
