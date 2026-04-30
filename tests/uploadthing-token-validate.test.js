const test = require("node:test");
const assert = require("node:assert/strict");

const { validateUploadthingToken } = require("../src/lib/uploadthing-token");

test("validateUploadthingToken rejects empty token", () => {
  const res = validateUploadthingToken("");
  assert.equal(res.ok, false);
});

test("validateUploadthingToken rejects non-base64 token", () => {
  const res = validateUploadthingToken("not-base64");
  assert.equal(res.ok, false);
});

test("validateUploadthingToken accepts base64 json with apiKey/appId/regions", () => {
  const token = Buffer.from(JSON.stringify({ apiKey: "sk_live_x", appId: "app", regions: ["sea1"] }), "utf8").toString("base64");
  const res = validateUploadthingToken(token);
  assert.equal(res.ok, true);
});

