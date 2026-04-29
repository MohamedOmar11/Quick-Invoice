# HTML/CSS PDF Themes + One-Click Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate PDFs using HTML/CSS themes rendered server-side (Chromium) while keeping the existing “PDF” button (`/api/invoices/:id/pdf`) working. Support 10 distinct themes + advanced overrides.

**Architecture:** Define 10 themes as token sets. Render invoices via a single HTML renderer that applies tokens as CSS variables. Generate PDF using `puppeteer-core` + `@sparticuz/chromium` in a Node runtime route.

**Tech Stack:** Next.js App Router routes, Prisma, next-auth, puppeteer-core, @sparticuz/chromium, HTML+CSS print styles.

---

## File Map (Planned)

**Modify**
- `package.json` (add puppeteer deps)
- `src/app/api/invoices/[id]/pdf/route.ts` (replace react-pdf with HTML->PDF)
- `src/components/invoice/invoice-editor.tsx` (theme picker + pass theme)
- `src/components/invoice/invoice-preview.tsx` (support theme variants, keep overrides)

**Create**
- `src/components/invoice/themes.ts` (10 theme definitions: tokens + layout variant + direction)
- `src/components/invoice/theme-tokens.ts` (merge + sanitize tokens)
- `src/components/invoice/invoice-html.ts` (HTML string renderer)
- `src/app/api/invoices/[id]/html/route.ts` (optional debug HTML endpoint)
- `tests/theme-tokens.test.js`
- `tests/invoice-html.test.js`

---

## Task 1: Add dependencies for server-side PDF (TDD: smoke test)

**Files:**
- Modify: `package.json`
- Create: `tests/pdf-deps.test.js`

- [ ] **Step 1: Add failing “require” test**

Create `tests/pdf-deps.test.js`:
```js
const test = require("node:test");
const assert = require("node:assert/strict");

test("pdf deps are installed", () => {
  assert.ok(require("puppeteer-core"));
  assert.ok(require("@sparticuz/chromium"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
node --test tests/pdf-deps.test.js
```
Expected: FAIL (modules not found)

- [ ] **Step 3: Add dependencies**

Update `package.json` dependencies:
- `puppeteer-core`
- `@sparticuz/chromium`

- [ ] **Step 4: Install + rerun test**

Run:
```bash
npm install --no-audit --no-fund
node --test tests/pdf-deps.test.js
```
Expected: PASS

---

## Task 2: Implement theme token system (10 themes) + merging

**Files:**
- Create: `src/components/invoice/themes.ts`
- Create: `src/components/invoice/theme-tokens.ts`
- Create: `tests/theme-tokens.test.js`

- [ ] **Step 1: Write failing tests**

Create `tests/theme-tokens.test.js`:
```js
const test = require("node:test");
const assert = require("node:assert/strict");

const { getThemeById } = require("../src/components/invoice/themes");
const { buildEffectiveTokens } = require("../src/components/invoice/theme-tokens");

test("returns known theme", () => {
  const t = getThemeById("minimal-corporate");
  assert.equal(t.id, "minimal-corporate");
});

test("buildEffectiveTokens applies overrides", () => {
  const t = getThemeById("minimal-corporate");
  const tokens = buildEffectiveTokens(t.tokens, { accentColor: "#111111" }, { accentColor: "#222222" });
  assert.equal(tokens.accentColor, "#222222");
});
```

- [ ] **Step 2: Verify RED**

Run:
```bash
node --test tests/theme-tokens.test.js
```
Expected: FAIL (modules not found)

- [ ] **Step 3: Implement minimal theme registry**

Create `src/components/invoice/themes.ts` exporting:
- `themes` array (10 themes)
- `getThemeById(id)` with fallback

Themes must include:
- 2 RTL themes: `arabic-diwan`, `arabic-modern`
- 2 ink-saving: `minimal-corporate`, `bw-ledger`
- 1 luxury: `luxury-elegant`
- 1 ultra-simple: `fast-invoice`
- plus 4 other distinct themes

- [ ] **Step 4: Implement token merge helper**

Create `src/components/invoice/theme-tokens.ts`:
- `buildEffectiveTokens(themeTokens, userDefaults, invoiceOverrides)`
- shallow merge + sanitize (ensure required tokens exist)

- [ ] **Step 5: Verify GREEN**

Run:
```bash
node --test tests/theme-tokens.test.js
```
Expected: PASS

---

## Task 3: HTML invoice renderer (string) with print-safe CSS

**Files:**
- Create: `src/components/invoice/invoice-html.ts`
- Create: `tests/invoice-html.test.js`

- [ ] **Step 1: Write failing test**

Create `tests/invoice-html.test.js`:
```js
const test = require("node:test");
const assert = require("node:assert/strict");

const { renderInvoiceHtml } = require("../src/components/invoice/invoice-html");

test("renders invoice html with tokens", () => {
  const html = renderInvoiceHtml({
    theme: { id: "minimal-corporate", direction: "ltr", layoutVariant: "grid" },
    tokens: { accentColor: "#123456", backgroundColor: "#ffffff", textColor: "#111111", mutedColor: "#666666", borderColor: "#e5e7eb", tableHeaderBg: "#f9fafb" },
    invoice: { invoiceNumber: "INV-1", clientName: "Acme", clientEmail: "", issueDate: "2026-01-01", dueDate: "2026-01-15", currency: "EGP", tax: 0, notes: "", items: [{ title: "Work", quantity: 1, price: 100 }] },
    payment: { instapayUrl: null, vodafoneCashNumber: null },
  });
  assert.ok(html.includes("--accentColor: #123456"));
  assert.ok(html.includes("INV-1"));
});
```

- [ ] **Step 2: Verify RED**

Run:
```bash
node --test tests/invoice-html.test.js
```
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `renderInvoiceHtml`**

Return a full HTML string including:
- `<html dir="...">`
- `<style>` containing:
  - `@page` rules
  - table header repeat rules
  - break rules
  - `:root { --token: value }`
- A single semantic structure:
  - header, bill-to, meta, table, totals, notes, footer
- Apply `layoutVariant` as a class on root (e.g. `invoice invoice--grid`)

- [ ] **Step 4: Verify GREEN**

Run:
```bash
node --test tests/invoice-html.test.js
```
Expected: PASS

---

## Task 4: Debug HTML endpoint (optional but recommended)

**Files:**
- Create: `src/app/api/invoices/[id]/html/route.ts`

- [ ] **Step 1: Add authenticated GET**
- Validate session
- Fetch invoice + user settings
- Render HTML with `renderInvoiceHtml`
- Return `Content-Type: text/html; charset=utf-8`

- [ ] **Step 2: Build**
```bash
npm run build
```
Expected: PASS

---

## Task 5: Replace PDF endpoint with Chromium HTML→PDF

**Files:**
- Modify: `src/app/api/invoices/[id]/pdf/route.ts`

- [ ] **Step 1: Switch runtime to nodejs**

Add:
```ts
export const runtime = "nodejs";
```

- [ ] **Step 2: Implement PDF generation**

Use:
- `chromium.executablePath()`
- `puppeteer.launch({ args: chromium.args, executablePath, headless: chromium.headless })`
- `page.setContent(html, { waitUntil: "networkidle0" })`
- `page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true, margin: { ... } })`

- [ ] **Step 3: Build**
```bash
npm run build
```
Expected: PASS

---

## Task 6: Theme picker + advanced overrides in editor

**Files:**
- Modify: `src/components/invoice/invoice-editor.tsx`
- Modify: `src/app/api/invoices/route.ts`
- Modify: `src/app/api/invoices/[id]/route.ts`

- [ ] **Step 1: Re-introduce theme selection**
- Use `Invoice.template` as `themeId`
- Add a theme dropdown fed by `themes` list

- [ ] **Step 2: Ensure save persists `template` and `style`**

- [ ] **Step 3: Build**
```bash
npm run build
```
Expected: PASS

---

## Task 7: Verification + Push

- [ ] Run all tests
```bash
node --test tests/theme-tokens.test.js
node --test tests/invoice-html.test.js
node --test tests/pdf-deps.test.js
npm run build
```

- [ ] Commit and push

