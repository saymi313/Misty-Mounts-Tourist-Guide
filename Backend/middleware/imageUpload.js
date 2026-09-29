const multer = require('multer');
const { rateLimit } = require('express-rate-limit');
const sharedLimit = require('../utils/rateLimitStore');
const { isUploadConfigured } = require('../config/cloudinary');
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
function imageType(buffer) {
  if (!Buffer.isBuffer(buffer)) return null;
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return 'image/jpeg';
  if (['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'))) return 'image/gif';
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  return null;
}
let active = 0;
const slots = Math.max(1, Math.min(32, Number(process.env.UPLOAD_CONCURRENCY) || 8));
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, ...sharedLimit('uploads'),
  keyGenerator: req => String(req.user.id), standardHeaders: true, legacyHeaders: false,
  message: { error: 'Upload limit reached. Please try again later.' } });
function imageUpload(field, maxBytes) {
  const receive = multer({ storage: multer.memoryStorage(), limits: { fileSize: maxBytes, files: 1, fields: 0, parts: 1 },
    fileFilter: (_req, file, cb) => cb(TYPES.has(file.mimetype) ? null : Object.assign(new Error('Unsupported image type'), { status: 415 }), TYPES.has(file.mimetype)),
  }).single(field);
  return [limiter, (req, res, next) => {
    if (!isUploadConfigured()) return res.status(503).json({ error: 'Image uploads are not configured yet.' });
    if (active >= slots) { res.set('Retry-After', '5'); return res.status(503).json({ error: 'Uploads are busy. Please retry shortly.' }); }
    active++;
    let released = false, handedOff = false;
    const release = () => { if (!released) { released = true; active--; } };
    req.releaseUpload = release;
    res.once('finish', release);
    res.once('close', () => { if (!handedOff) release(); });
    receive(req, res, error => {
      if (error) return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : error.status || 400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'Image exceeds the upload size limit.' : 'Upload one JPEG, PNG, WebP or GIF image.' });
      if (!req.file || imageType(req.file.buffer) !== req.file.mimetype) return res.status(415).json({ error: 'Image content does not match a supported image type.' });
      handedOff = true;
      next();
    });
  }];
}
module.exports = { imageUpload, imageType };
