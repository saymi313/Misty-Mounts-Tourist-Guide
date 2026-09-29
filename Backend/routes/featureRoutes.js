const express = require('express');
const router = express.Router();
function featureStatus(env = process.env) {
  return {
    gemini: Boolean(env.GEMINI_API_KEY?.trim()),
    whatsapp: /^\d{8,15}$/.test(env.CONCIERGE_WHATSAPP_NUMBER || ''),
    whatsappAutomation: false,
  };
}
router.get('/', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(featureStatus());
});
module.exports = { router, featureStatus };
