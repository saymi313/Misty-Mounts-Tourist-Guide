import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createTranslationCollector, translationBatches } from '../src/utils/translationDom.js';

const page = html => new JSDOM(`<html lang="ur"><body>${html}</body></html>`).window.document;

test('translates a split heading as one sentence and retains React nodes', () => {
  const doc = page('<h1>Promoting <span>Pakistan,</span><br> one journey at a time.</h1>');
  const span = doc.querySelector('span');
  const collect = createTranslationCollector();
  const jobs = collect(doc.body);
  assert.deepEqual(jobs.map(job => job.key), ['Promoting Pakistan, one journey at a time.']);
  jobs[0].apply('ہر سفر کے ساتھ پاکستان کی سیاحت کو فروغ دینا');
  assert.equal(doc.querySelector('h1').textContent, 'ہر سفر کے ساتھ پاکستان کی سیاحت کو فروغ دینا');
  assert.equal(doc.querySelector('span'), span);
  assert.equal(collect(doc.body)[0].key, jobs[0].key);
});

test('ignores stale responses after content changes and detached nodes', () => {
  const doc = page('<p>Book your trip</p>');
  const collect = createTranslationCollector();
  const [job] = collect(doc.body);
  doc.querySelector('p').firstChild.nodeValue = 'Cancel your trip';
  job.apply('اپنا سفر بک کریں');
  assert.equal(doc.querySelector('p').textContent, 'Cancel your trip');
  const [updated] = collect(doc.body);
  doc.querySelector('p').remove();
  updated.apply('اپنا سفر منسوخ کریں');
  assert.equal(doc.body.textContent, '');
});

test('preserves interactive elements, authored Urdu, excluded content and input values', () => {
  const doc = page('<p>Explore <a href="/trips">our trips</a> today</p><code>English code</code><div data-no-translate>Brand</div><p lang="ur">پاکستان Pakistan</p><input value="User content" placeholder="Your name">');
  const link = doc.querySelector('a');
  let clicks = 0;
  link.addEventListener('click', event => { event.preventDefault(); clicks++; });
  const jobs = createTranslationCollector()(doc.body);
  assert.deepEqual(jobs.map(job => job.key), ['Explore', 'our trips', 'today', 'Your name']);
  jobs.forEach(job => job.apply('ترجمہ'));
  link.click();
  assert.equal(clicks, 1);
  assert.equal(link.getAttribute('href'), '/trips');
  assert.equal(doc.querySelector('input').value, 'User content');
  assert.equal(doc.querySelector('input').placeholder, 'ترجمہ');
  assert.equal(doc.querySelector('code').textContent, 'English code');
});

test('batches respect both text count and request size limits', () => {
  const texts = Array.from({ length: 25 }, () => 'x'.repeat(6000));
  const batches = translationBatches(texts);
  assert.deepEqual(batches.flat(), texts);
  assert.ok(batches.every(batch => batch.length <= 12 && batch.join('').length <= 24000));
  assert.equal(translationBatches(Array(25).fill('short')).length, 3);
});
