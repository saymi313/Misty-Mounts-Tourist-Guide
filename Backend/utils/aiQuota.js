const storage = require('./redis');
const SCRIPT = `
local count = tonumber(redis.call('GET', KEYS[1]) or '0')
if count >= tonumber(ARGV[1]) then return 0 end
count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], 172800) end
return 1`;
async function claimDailyCall(limit) {
  if (!storage.configured) return true;
  try {
    const day = new Date().toISOString().slice(0, 10);
    return Number(await storage.command(['EVAL', SCRIPT, '1', `${storage.prefix}ai:daily:${day}`, String(limit)])) === 1;
  } catch { return false; } // Never bypass the shared spending cap during an outage.
}
module.exports = { claimDailyCall };
