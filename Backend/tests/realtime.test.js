const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const { io: connect } = require('socket.io-client');
const jwt = require('jsonwebtoken');
const { configureRealtime } = require('../utils/realtime');
const { EventEmitter } = require('node:events');
const secret = 'test-only-realtime-secret';
const user = '111111111111111111111111', guide = '222222222222222222222222';
const event = (socket, name) => new Promise((resolve, reject) => {
  const timeout = setTimeout(() => { socket.off(name, done); reject(new Error(`Missing ${name}`)); }, 4000);
  const done = value => { clearTimeout(timeout); resolve(value); }; socket.once(name, done);
});

test('Redis subscription failures reject realtime startup without unhandled promise rejections', async () => {
  const sub = Object.assign(new EventEmitter(), { isOpen: true, isReady: true,
    connect: async () => {}, pSubscribe: async () => { throw Error('Redis unavailable'); },
    subscribe: async () => { throw Error('Redis unavailable'); },
    pUnsubscribe: async () => {}, unsubscribe: async () => {}, destroy() { this.isOpen = false; },
  });
  const pub = Object.assign(new EventEmitter(), { isReady: true, duplicate: () => sub, pSubscribe() {} });
  const server = createServer(), io = new Server(server);
  try {
    await assert.rejects(configureRealtime(io, { redis: { configured: true, getRedis: async () => pub, prefix: 'test:' }, secret }), /subscription failed/);
    assert.equal(sub.isOpen, false);
  } finally { await new Promise(resolve => io.close(resolve)); }
});
test('authenticated sockets share rooms, keep multi-tab presence and reject invalid identities', { timeout: 15000 }, async () => {
  const server = createServer(), io = new Server(server);
  const realtime = await configureRealtime(io, { redis: { configured: false }, secret, canType: async (from, to) => from.id === user && to === guide });
  const clients = [];
  server.listen(0); await new Promise(resolve => server.once('listening', resolve));
  const client = token => { const socket = connect(`http://localhost:${server.address().port}`, { transports: ['websocket'], reconnection: false, auth: { token }, autoConnect: false }); clients.push(socket); return socket; };
  const open = async (id, type) => { const socket = client(jwt.sign({ id, type }, secret, { expiresIn: '1h' })); const ready = event(socket, 'connect'); socket.connect(); await ready; return socket; };
  try {
    const a = await open(user, 'user'), b = await open(user, 'user'), c = await open(guide, 'local guide');
    const snapshot = event(c, 'presence:list'); await realtime.refresh();
    assert.deepEqual(new Set(await snapshot), new Set([user, guide]));
    const first = event(a, 'message:new'), second = event(b, 'message:new');
    io.to(user).emit('message:new', { text: 'test' });
    assert.equal((await first).text, 'test'); assert.equal((await second).text, 'test');
    const typing = event(c, 'typing'); a.emit('typing', { toUserId: guide, isTyping: true });
    assert.deepEqual(await typing, { fromUserId: user, isTyping: true });
    const closed = new Promise(resolve => io.sockets.sockets.get(a.id).once('disconnect', resolve)); a.disconnect(); await closed;
    const remaining = event(c, 'presence:list'); await realtime.refresh(); assert.ok((await remaining).includes(user));
    for (const token of ['invalid', jwt.sign({ id: 'undefined' }, secret, { expiresIn: '1h' }), jwt.sign({ id: user }, secret)]) {
      const bad = client(token); const rejected = event(bad, 'connect_error'); bad.connect(); assert.match((await rejected).message, /Invalid/);
    }
    const expiring = client(jwt.sign({ id: user, type: 'user' }, secret, { expiresIn: 2 }));
    const connected = event(expiring, 'connect'); expiring.connect(); await connected;
    const disconnected = event(expiring, 'disconnect'); await disconnected;
    assert.equal(expiring.connected, false);
  } finally { clients.forEach(c => c.disconnect()); await realtime.close(); await new Promise(resolve => io.close(resolve)); }
});
