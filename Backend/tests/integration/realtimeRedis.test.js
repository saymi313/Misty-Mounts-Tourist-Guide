const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const { io: connect } = require('socket.io-client');
const { createClient } = require('redis');
const jwt = require('jsonwebtoken');
const { configureRealtime } = require('../../utils/realtime');
const next = (socket, name) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => { socket.off(name, done); reject(new Error(`Missing ${name}`)); }, 5000);
  const done = data => { clearTimeout(timer); resolve(data); }; socket.once(name, done);
});
test('two Redis-backed API instances relay rooms and retain presence when one tab disconnects', { skip: !process.env.REDIS_TEST_URL, timeout: 30000 }, async () => {
  const instances = [], clients = [], prefix = `misty-socket-test:${randomUUID()}:`, secret = 'integration-secret';
  const id = '111111111111111111111111';
  try {
    for (let i = 0; i < 2; i++) {
      const pub = createClient({ url: process.env.REDIS_TEST_URL, socket: { connectTimeout: 3000, reconnectStrategy: false } });
      pub.on('error', () => {});
      const server = createServer(), io = new Server(server);
      const instance = { pub, io, server }; instances.push(instance);
      await pub.connect();
      instance.runtime = await configureRealtime(io, { redis: { configured: true, getRedis: async () => pub, prefix }, secret });
      server.listen(0); await new Promise(resolve => server.once('listening', resolve));
      const socket = connect(`http://localhost:${server.address().port}`, { transports: ['websocket'], reconnection: false, autoConnect: false,
        auth: { token: jwt.sign({ id, type: 'user' }, secret, { expiresIn: '1h' }) } });
      clients.push(socket); const ready = next(socket, 'connect'); socket.connect(); await ready;
    }
    const delivery = next(clients[1], 'message:new'); instances[0].io.to(id).emit('message:new', { text: 'Across instances' });
    assert.equal((await delivery).text, 'Across instances');
    const gone = new Promise(resolve => instances[0].io.sockets.sockets.get(clients[0].id).once('disconnect', resolve));
    clients[0].disconnect(); await gone;
    const presence = next(clients[1], 'presence:list'); await instances[1].runtime.refresh();
    assert.ok((await presence).includes(id));
    await instances[0].runtime.close(); await new Promise(resolve => instances[0].io.close(resolve));
    const after = next(clients[1], 'presence:list'); await instances[1].runtime.refresh();
    assert.ok((await after).includes(id));
  } finally {
    clients.forEach(socket => socket.disconnect());
    for (const instance of instances) {
      await instance.runtime?.close(); await new Promise(resolve => instance.io.close(resolve));
      if (instance.pub.isOpen) instance.pub.destroy();
    }
  }
});
