const { RedisStore } = require('rate-limit-redis');
const { configured, command, prefix } = require('./redis');
module.exports = scope => configured ? { store: new RedisStore({
  prefix: `${prefix}limits:${scope}:`, sendCommand: (...args) => command(args),
}), passOnStoreError: false } : {};
