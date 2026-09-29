const { createHash, randomUUID } = require('node:crypto');
const storage = require('../utils/redis');
const publicPath = path => path === '/admin/cities' || path === '/tours' || /^\/tours\/[^/]+$/.test(path) && path !== '/tours/my-bookings';

// Only anonymous, explicitly public reads. Never cache bookings, profiles or AI conversations.
function catalogCache({ command = storage.command, configured = storage.configured, prefix = storage.prefix } = {}) {
  return async (req, res, next) => {
    if (!configured) return next();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      if (!/^\/(admin|agency|tours|payment|pay)(\/|$)/.test(req.path)) return next();
      const json = res.json.bind(res);
      res.json = body => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Rotate before replying. Old in-flight reads write into an obsolete generation.
          command(['SET', `${prefix}catalog:generation`, randomUUID()]).catch(() => {}).finally(() => json(body));
          return res;
        }
        return json(body);
      };
      return next();
    }
    if (req.method !== 'GET' || req.headers.authorization || req.headers.cookie || !publicPath(req.path)) return next();
    try {
      const generation = await command(['GET', `${prefix}catalog:generation`]) || 'initial';
      const hash = createHash('sha256').update(req.originalUrl).digest('hex');
      const key = `${prefix}catalog:${generation}:${hash}`;
      const hit = await command(['GET', key]);
      if (hit) { res.set('X-Cache', 'HIT'); return res.json(JSON.parse(hit)); }
      const json = res.json.bind(res);
      res.json = body => {
        if (res.statusCode === 200 && !res.getHeader('Set-Cookie')) {
          const encoded = JSON.stringify(body);
          if (Buffer.byteLength(encoded) <= 512000) command(['SET', key, encoded, 'EX', '30']).catch(() => {});
        }
        res.set('X-Cache', 'MISS');
        return json(body);
      };
    } catch { /* Cache failure must not hide database-backed public content. */ }
    next();
  };
}
module.exports = { catalogCache, publicPath };
