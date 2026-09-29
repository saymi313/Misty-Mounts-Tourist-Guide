const express = require('express');
const { generate } = require('../utils/aiRuntime');
const { createTranslationService } = require('../utils/translationService');
const router = express.Router();
const translate = createTranslationService({ generate });
router.post('/', async (req, res) => {
  const { source = 'en', target = 'ur' } = req.body || {};
  const q = typeof req.body?.q === 'string' ? [req.body.q] : req.body?.q;
  if (source !== 'en' || target !== 'ur' || !Array.isArray(q) || q.length > 24 || q.some(text => typeof text !== 'string' || text.length > 6000) || q.reduce((n, text) => n + text.length, 0) > 24000) {
    return res.status(400).json({ error: 'Send up to 24 complete English text blocks (6,000 characters each, 24,000 total) for Urdu translation.' });
  }
  try { res.json(await translate(q)); }
  catch { res.status(503).json({ error: 'Translation is temporarily unavailable. Please try again.' }); }
});
module.exports = router;
