const allowed = {
  headerLayout: new Set(["split", "left", "right", "center"]),
  logoSize: new Set(["sm", "md", "lg"]),
  fontFamily: new Set(["inter", "serif", "mono"]),
  borderStyle: new Set(["none", "thin", "medium"]),
  tableStyle: new Set(["lines", "boxed"]),
  rowSeparator: new Set(["none", "thin", "medium"]),
  cellPadding: new Set(["sm", "md", "lg"]),
  spacing: new Set(["compact", "normal", "spacious"]),
};

const allowedKeys = new Set([
  "headerLayout",
  "showLogo",
  "logoSize",
  "fontFamily",
  "baseFontSize",
  "headingWeight",
  "accentColor",
  "backgroundColor",
  "textColor",
  "mutedColor",
  "borderColor",
  "tableHeaderBg",
  "borderStyle",
  "borderRadius",
  "tableStyle",
  "showColumnBorders",
  "rowSeparator",
  "cellPadding",
  "zebraRows",
  "zebraColor",
  "titleFontSize",
  "labelFontSize",
  "bodyFontSize",
  "uppercaseLabels",
  "spacing",
]);

function isSafeString(s) {
  if (typeof s !== "string") return false;
  const t = s.trim();
  if (!t) return false;
  if (t.length > 64) return false;
  if (t.includes("<") || t.includes(">")) return false;
  return true;
}

function parseBool(v) {
  if (typeof v === "boolean") return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

function parseNumber(v) {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function isHexColor(v) {
  if (!isSafeString(v)) return false;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim());
}

function sanitizeInvoiceStyle(input) {
  const obj = input && typeof input === "object" ? input : {};
  const out = {};

  for (const [k, v] of Object.entries(obj)) {
    if (!allowedKeys.has(k)) continue;

    if (k === "showLogo" || k === "showColumnBorders" || k === "zebraRows" || k === "uppercaseLabels") {
      const b = parseBool(v);
      if (typeof b === "boolean") out[k] = b;
      continue;
    }

    if (k === "headerLayout" || k === "logoSize" || k === "fontFamily" || k === "borderStyle" || k === "tableStyle" || k === "rowSeparator" || k === "cellPadding" || k === "spacing") {
      const set = allowed[k];
      if (set && typeof v === "string" && set.has(v)) out[k] = v;
      continue;
    }

    if (k === "accentColor" || k === "backgroundColor" || k === "textColor" || k === "mutedColor" || k === "borderColor" || k === "tableHeaderBg" || k === "zebraColor") {
      if (typeof v === "string" && isHexColor(v)) out[k] = v.trim();
      continue;
    }

    if (k === "baseFontSize") {
      const n = parseNumber(v);
      if (typeof n === "number" && n >= 8 && n <= 20) out[k] = n;
      continue;
    }

    if (k === "headingWeight") {
      const n = parseNumber(v);
      if (typeof n === "number" && n >= 400 && n <= 900) out[k] = n;
      continue;
    }

    if (k === "borderRadius") {
      const n = parseNumber(v);
      if (typeof n === "number" && n >= 0 && n <= 40) out[k] = n;
      continue;
    }

    if (k === "titleFontSize") {
      const n = parseNumber(v);
      if (typeof n === "number" && n >= 18 && n <= 72) out[k] = n;
      continue;
    }

    if (k === "labelFontSize") {
      const n = parseNumber(v);
      if (typeof n === "number" && n >= 8 && n <= 16) out[k] = n;
      continue;
    }

    if (k === "bodyFontSize") {
      const n = parseNumber(v);
      if (typeof n === "number" && n >= 8 && n <= 20) out[k] = n;
      continue;
    }
  }

  return out;
}

function validateInvoiceStyleStrict(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, error: "Invalid style" };

  const keys = Object.keys(input);
  for (const k of keys) {
    if (!allowedKeys.has(k)) return { ok: false, error: "Unknown style key" };
  }

  const sanitized = sanitizeInvoiceStyle(input);
  if (Object.keys(sanitized).length !== keys.length) return { ok: false, error: "Invalid style values" };
  return { ok: true, value: sanitized };
}

module.exports = { sanitizeInvoiceStyle, validateInvoiceStyleStrict };

