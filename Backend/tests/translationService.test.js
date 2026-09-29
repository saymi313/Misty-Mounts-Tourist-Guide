const test = require('node:test');
const assert = require('node:assert/strict');
const { createTranslationService } = require('../utils/translationService');

test('AI receives complete sentences, maps IDs in order and caches successful results', async () => {
  let calls = 0;
  const translate = createTranslationService({
    generate: async (prompt, contents) => {
      calls++;
      assert.match(prompt, /never a word-by-word/);
      assert.deepEqual(JSON.parse(contents[0].parts[0].text), [{ id: 0, text: 'Explore Pakistan with us.' }, { id: 1, text: 'Meet local guides.' }]);
      return { translations: [{ id: 1, text: 'مقامی گائیڈز سے ملیں۔' }, { id: 0, text: 'ہمارے ساتھ پاکستان کی سیر کریں۔' }] };
    },
    fetch: async () => { throw new Error('Fallback should not run'); },
  });
  const input = ['Explore Pakistan with us.', 'Meet local guides.', 'Explore Pakistan with us.'];
  const result = await translate(input);
  assert.deepEqual(result.translated, [true, true, true]);
  assert.equal(result.translations[0], 'ہمارے ساتھ پاکستان کی سیر کریں۔');
  assert.equal(result.translations[0], result.translations[2]);
  assert.deepEqual(await translate(input), result);
  assert.equal(calls, 1);
});

test('provider failures and unchanged English are not cached and can recover', async () => {
  let available = false;
  const translate = createTranslationService({
    generate: async () => { throw new Error('Provider unavailable'); },
    fetch: async url => ({ ok: true, json: async () => url.includes('googleapis') ? [[[available ? 'پاکستان کی سیر کریں۔' : 'Explore Pakistan.']]] : { responseStatus: 503 } }),
  });
  assert.deepEqual(await translate(['Explore Pakistan.']), { translations: ['Explore Pakistan.'], translated: [false] });
  available = true;
  assert.deepEqual(await translate(['Explore Pakistan.']), { translations: ['پاکستان کی سیر کریں۔'], translated: [true] });
});

test('ambiguous AI IDs fall back using the entire original sentence', async () => {
  const source = 'Book your next trip to Pakistan.';
  const translate = createTranslationService({
    generate: async () => ({ translations: [{ id: 0, text: 'غلط' }, { id: 0, text: 'غلط' }] }),
    fetch: async url => {
      assert.equal(new URL(url).searchParams.get('q'), source);
      return { ok: true, json: async () => [[['پاکستان کے اگلے سفر کی بکنگ کریں۔']]] };
    },
  });
  assert.equal((await translate([source])).translations[0], 'پاکستان کے اگلے سفر کی بکنگ کریں۔');
});
