const { createClient } = require('redis');
const configured = Boolean(process.env.REDIS_URL);
const prefix = process.env.REDIS_PREFIX || 'misty:';
let client, connecting;
async function getRedis() {
  if (!configured) return null;
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL, disableOfflineQueue: true, commandsQueueMaxLength: 1000,
      socket: { connectTimeout: 3000, reconnectStrategy: retries => Math.min(250 * (retries + 1), 3000) } });
    client.on('error', () => {}); // Never log connection URLs, which may contain credentials.
    connecting = client.connect().catch(() => {});
  }
  if (!client.isReady) {
    await Promise.race([connecting, new Promise(resolve => { const t = setTimeout(resolve, 3000); t.unref(); })]);
  }
  if (!client.isReady) throw Object.assign(new Error('Shared storage unavailable'), { status: 503 });
  return client;
}
async function command(args) {
  const redis = await getRedis();
  return redis.sendCommand(args, { timeout: 3000 });
}
async function closeRedis() { if (client?.isOpen) client.destroy(); }
module.exports = { getRedis, command, configured, prefix, closeRedis };
