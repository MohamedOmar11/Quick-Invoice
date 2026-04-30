function shouldRefreshAuthToken(lastSyncMs, refreshWindowMs, nowMs = Date.now()) {
  if (!Number.isFinite(Number(refreshWindowMs)) || refreshWindowMs <= 0) return true;
  const last = Number.isFinite(Number(lastSyncMs)) ? Number(lastSyncMs) : 0;
  if (!last) return true;
  return nowMs - last > refreshWindowMs;
}

module.exports = { shouldRefreshAuthToken };

