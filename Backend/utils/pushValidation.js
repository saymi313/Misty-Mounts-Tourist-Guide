// Only browser push services may receive server-side HTTP requests.
function validEndpoint(endpoint) {
  if (typeof endpoint !== 'string' || endpoint.length > 2048) return false;
  try {
    const url = new URL(endpoint);
    const host = url.hostname;
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && !url.hash &&
      (host === 'fcm.googleapis.com' || host === 'updates.push.services.mozilla.com' ||
       host === 'web.push.apple.com' || /^[a-z0-9-]+\.notify\.windows\.com$/.test(host));
  } catch { return false; }
}
function cleanSubscription(sub) {
  if (!sub || !validEndpoint(sub.endpoint)) return null;
  const { auth, p256dh } = sub.keys || {};
  if (typeof auth !== 'string' || typeof p256dh !== 'string' ||
      !/^[A-Za-z0-9_-]{22}={0,2}$/.test(auth) ||
      !/^[A-Za-z0-9_-]{87}=?$/.test(p256dh) || Buffer.from(p256dh, 'base64url')[0] !== 4) return null;
  return { endpoint: sub.endpoint, keys: { auth, p256dh } };
}
module.exports = { validEndpoint, cleanSubscription };
