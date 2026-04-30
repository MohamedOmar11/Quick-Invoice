function validateUploadthingToken(token) {
  const t = String(token ?? "").trim();
  if (!t) return { ok: false, error: "Missing UPLOADTHING_TOKEN" };

  let decoded;
  try {
    decoded = Buffer.from(t, "base64").toString("utf8");
  } catch {
    return { ok: false, error: "UPLOADTHING_TOKEN is not valid base64" };
  }

  let obj;
  try {
    obj = JSON.parse(decoded);
  } catch {
    return { ok: false, error: "UPLOADTHING_TOKEN is not valid JSON" };
  }

  if (!obj || typeof obj !== "object") return { ok: false, error: "UPLOADTHING_TOKEN JSON is invalid" };
  if (typeof obj.apiKey !== "string" || !obj.apiKey) return { ok: false, error: "UPLOADTHING_TOKEN JSON missing apiKey" };
  if (typeof obj.appId !== "string" || !obj.appId) return { ok: false, error: "UPLOADTHING_TOKEN JSON missing appId" };
  if (!Array.isArray(obj.regions) || obj.regions.length === 0) return { ok: false, error: "UPLOADTHING_TOKEN JSON missing regions" };

  return { ok: true };
}

module.exports = { validateUploadthingToken };

