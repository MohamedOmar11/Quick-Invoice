function normalizeClientFilter(input) {
  const v = String(input ?? "").trim();
  if (!v) return "";
  return v.length > 120 ? v.slice(0, 120) : v;
}

module.exports = { normalizeClientFilter };

