function getStore() {
  const g = globalThis;
  if (!g.__rateLimitStore) g.__rateLimitStore = new Map();
  return g.__rateLimitStore;
}

function checkRateLimit({ key, limit, windowMs }) {
  const now = Date.now();
  const store = getStore();
  const existing = store.get(key);

  if (!existing || now >= existing.resetAt) {
    const next = { count: 1, resetAt: now + windowMs };
    store.set(key, next);
    return { ok: true, remaining: Math.max(0, limit - 1), resetAt: next.resetAt };
  }

  if (existing.count >= limit) {
    return { ok: false, status: 429, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  store.set(key, existing);
  return { ok: true, remaining: Math.max(0, limit - existing.count), resetAt: existing.resetAt };
}

function getClientIpFromHeaders(headers) {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

module.exports = { checkRateLimit, getClientIpFromHeaders };

