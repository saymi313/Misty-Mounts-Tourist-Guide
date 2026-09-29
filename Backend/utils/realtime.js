const jwt = require('jsonwebtoken');
const { createAdapter } = require('@socket.io/redis-adapter');
const storage = require('./redis');

const validId = value => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
async function configureRealtime(io, { redis = storage, secret = process.env.JWT_SECRET,
  refreshMs = 15000, canType = async (from, to) => {
    if (!['user', 'local guide'].includes(from.type)) return false;
    const user = await require('../LocalGuidePannel/models/User').findById(to).select('type').lean();
    return user?.type === (from.type === 'user' ? 'local guide' : 'user');
  } } = {}) {
  let subscriber, publisher, closeAdapter, adapterHealthy = true;
  const adapterCommands = new Set();
  // This adapter fires some publish/subscribe promises without awaiting them.
  // Catch transport failures so Redis disconnects cannot crash the API process.
  const adapterClient = client => new Proxy(client, {
    get(target, key) {
      const value = Reflect.get(target, key, target);
      if (typeof value !== 'function') return value;
      if (!['publish', 'subscribe', 'pSubscribe', 'unsubscribe', 'pUnsubscribe'].includes(key)) return value.bind(target);
      return (...args) => {
        let timer;
        const deadline = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Socket Redis command timed out')), 3000); timer.unref(); });
        const pending = Promise.race([Promise.resolve().then(() => value.apply(target, args)), deadline])
          .catch(() => { if (key !== 'publish') adapterHealthy = false; return 0; }).finally(() => clearTimeout(timer));
        adapterCommands.add(pending); pending.finally(() => adapterCommands.delete(pending));
        return pending;
      };
    },
  });
  if (redis.configured) {
    publisher = await redis.getRedis();
    subscriber = publisher.duplicate();
    subscriber.on('error', () => {});
    try {
      await Promise.race([subscriber.connect(), new Promise((_, reject) => {
        const timeout = setTimeout(() => reject(new Error('Socket Redis connection timed out')), 5000); timeout.unref();
      })]);
      io.adapter(createAdapter(adapterClient(publisher), adapterClient(subscriber), { key: `${redis.prefix}socket.io`, requestsTimeout: 3000, publishOnSpecificResponseChannel: true }));
      const adapter = io.of('/').adapter, originalClose = adapter.close.bind(adapter);
      let closed = false;
      closeAdapter = adapter.close = () => { if (!closed) { closed = true; originalClose(); } };
      await Promise.all([...adapterCommands]);
      if (!adapterHealthy) throw new Error('Socket Redis subscription failed');
      const recovered = () => { adapterHealthy = true; };
      publisher.on('ready', recovered); subscriber.on('ready', recovered);
      const stop = closeAdapter;
      closeAdapter = () => { publisher.off('ready', recovered); subscriber.off('ready', recovered); stop(); };
    } catch (error) { closeAdapter?.(); await Promise.all([...adapterCommands]); if (subscriber.isOpen) subscriber.destroy(); throw error; }
  }
  let stopped = false, pending, debounce, lastRefresh = 0, known = [], presenceReady = true;
  const ready = () => !stopped && (!redis.configured || (adapterHealthy && publisher?.isReady && subscriber?.isReady));
  async function refresh() {
    if (stopped) return;
    if (pending) return pending;
    pending = (async () => {
      try {
        if (!ready()) throw new Error('Realtime unavailable');
        // Adapter-backed enumeration reflects tabs across all API instances.
        // No durable online counters to leak when an instance crashes.
        const sockets = await io.fetchSockets();
        known = [...new Set(sockets.map(s => s.data.user?.id).filter(validId))];
        lastRefresh = Date.now(); presenceReady = true;
        if (!stopped) io.local.emit('presence:list', known);
      } catch {
        presenceReady = false; known = [];
        if (!stopped) io.local.emit('presence:unavailable');
      }
    })().finally(() => { pending = null; });
    return pending;
  }
  const schedule = () => {
    if (stopped || debounce) return;
    debounce = setTimeout(() => { debounce = null; refresh(); }, 150);
    debounce.unref();
  };
  io.use((socket, next) => {
    try {
      if (!ready()) return next(new Error('Realtime temporarily unavailable'));
      const payload = jwt.verify(socket.handshake.auth?.token, secret, { algorithms: ['HS256'] });
      if (!validId(payload.id) || !Number.isFinite(payload.exp)) throw new Error('Invalid identity');
      socket.data.user = { id: payload.id, type: payload.type };
      socket.data.expiresAt = payload.exp * 1000;
      next();
    } catch { next(new Error('Invalid or expired token')); }
  });
  io.on('connection', socket => {
    const me = socket.data.user;
    socket.join(me.id);
    let lastGet = 0, lastTyping = 0;
    const expiry = setInterval(() => {
      if (Date.now() >= socket.data.expiresAt) socket.disconnect(true);
    }, 1000); expiry.unref();
    socket.on('presence:get', () => {
      if (Date.now() - lastGet < 2000) return;
      lastGet = Date.now();
      if (!ready() || !presenceReady) socket.emit('presence:unavailable');
      else if (Date.now() - lastRefresh < 2000) socket.emit('presence:list', known);
      schedule();
    });
    socket.on('typing', async payload => {
      if (!payload || typeof payload !== 'object' || !validId(payload.toUserId) || typeof payload.isTyping !== 'boolean' || !ready() || Date.now() >= socket.data.expiresAt || Date.now() - lastTyping < 500) return;
      lastTyping = Date.now();
      try {
        if (await canType(me, payload.toUserId) && socket.connected) io.to(payload.toUserId).emit('typing', { fromUserId: me.id, isTyping: payload.isTyping });
      } catch { /* Typing is optional and never bypasses recipient authorization. */ }
    });
    socket.on('disconnect', () => { clearInterval(expiry); schedule(); });
    schedule();
  });
  const timer = setInterval(refresh, refreshMs); timer.unref();
  return { ready, refresh, close: async () => {
    stopped = true; clearInterval(timer); clearTimeout(debounce);
    if (pending) await pending;
    closeAdapter?.(); await Promise.all([...adapterCommands]);
    if (subscriber?.isOpen) subscriber.destroy();
  } };
}
module.exports = { configureRealtime, validId };
