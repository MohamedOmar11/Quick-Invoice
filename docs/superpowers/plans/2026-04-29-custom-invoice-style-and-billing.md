# Custom Invoice Style + Landing + Logout Confirm + Billing Fields + Admin Plan Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep `/` public with auth-aware header, add logout confirmation, add optional user payment fields, replace themes with a single customizable invoice style (default + per-invoice), and add admin plan management.

**Architecture:** Store invoice style as JSON in Postgres via Prisma (`User.defaultInvoiceStyle` + `Invoice.style`). Render HTML preview + PDF from the same “effective style”. Use small client components for interactive UI (style panel, logout confirm, settings forms).

**Tech Stack:** Next.js App Router, next-auth, Prisma (Postgres), shadcn/ui primitives (Dialog, Button, Input, Select), @react-pdf/renderer.

---

## File Map (Planned)

**Modify**
- `prisma/schema.prisma`
- `src/app/page.tsx`
- `src/app/dashboard/layout.tsx`
- `src/components/invoice/invoice-editor.tsx`
- `src/components/invoice/invoice-preview.tsx`
- `src/components/invoice/invoice-pdf.tsx`
- `src/app/api/invoices/route.ts`
- `src/app/api/invoices/[id]/route.ts`
- `src/app/dashboard/settings/page.tsx`

**Create**
- `src/components/auth/logout-button.tsx`
- `src/components/invoice/invoice-style.ts`
- `src/components/invoice/invoice-style-panel.tsx`
- `src/app/api/user/settings/route.ts`
- `src/app/admin/users/page.tsx`
- `src/app/api/admin/users/plan/route.ts`
- `tests/invoice-style.test.js`

---

## Task 1: Database Schema (Prisma) for Style + Payment Fields

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Write failing validation test for new Prisma schema**

Run:
```bash
npx prisma validate
```
Expected: FAIL after we add the test reference changes (schema not yet updated).

- [ ] **Step 2: Update Prisma schema**

Edit `prisma/schema.prisma`:
- Add to `User`:
  - `instapayHandle String?`
  - `vodafoneCashNumber String?`
  - `defaultInvoiceStyle Json?`
- Add to `Invoice`:
  - `style Json?`

- [ ] **Step 3: Run Prisma validation**

Run:
```bash
npx prisma validate
```
Expected: PASS

- [ ] **Step 4: Document Supabase SQL migration**

Because Supabase is remote and this repo relies on `prisma db push` at build time, add a markdown note into the plan execution notes (do not commit secrets) describing:
- Open Supabase SQL Editor
- Add columns with `ALTER TABLE` for `User` and `Invoice`
- Ensure types: `text` for strings, `jsonb` for Json

---

## Task 2: Invoice Style Model + Merge Logic (TDD)

**Files:**
- Create: `src/components/invoice/invoice-style.ts`
- Create: `tests/invoice-style.test.js`

- [ ] **Step 1: Write failing unit test**

Create `tests/invoice-style.test.js`:
```js
const test = require("node:test");
const assert = require("node:assert/strict");

const { mergeInvoiceStyle, defaultInvoiceStyle } = require("../src/components/invoice/invoice-style");

test("mergeInvoiceStyle uses invoice override over user default", () => {
  const user = { accentColor: "#111111" };
  const invoice = { accentColor: "#222222" };
  const merged = mergeInvoiceStyle(user, invoice);
  assert.equal(merged.accentColor, "#222222");
});

test("mergeInvoiceStyle falls back to defaultInvoiceStyle", () => {
  const merged = mergeInvoiceStyle(null, null);
  assert.equal(merged.borderStyle, defaultInvoiceStyle.borderStyle);
});
```

- [ ] **Step 2: Run test to verify failure**

Run:
```bash
node --test tests/invoice-style.test.js
```
Expected: FAIL (`Cannot find module .../invoice-style`)

- [ ] **Step 3: Implement minimal style module**

Create `src/components/invoice/invoice-style.ts`:
```ts
export type BorderStyle = "none" | "thin" | "medium";
export type TableStyle = "lines" | "boxed";
export type SpacingScale = "compact" | "normal" | "spacious";
export type FontFamily = "inter" | "serif" | "mono";

export type InvoiceStyle = {
  fontFamily: FontFamily;
  baseFontSize: number;
  headingWeight: number;
  accentColor: string;
  borderStyle: BorderStyle;
  borderRadius: number;
  tableStyle: TableStyle;
  zebraRows: boolean;
  spacing: SpacingScale;
};

export const defaultInvoiceStyle: InvoiceStyle = {
  fontFamily: "inter",
  baseFontSize: 12,
  headingWeight: 700,
  accentColor: "#111111",
  borderStyle: "thin",
  borderRadius: 10,
  tableStyle: "lines",
  zebraRows: false,
  spacing: "normal",
};

export function coerceInvoiceStyle(value: unknown): Partial<InvoiceStyle> | null {
  if (!value || typeof value !== "object") return null;
  return value;
}

export function mergeInvoiceStyle(
  userDefault: unknown,
  invoiceOverride: unknown
): InvoiceStyle {
  const u = coerceInvoiceStyle(userDefault) ?? {};
  const i = coerceInvoiceStyle(invoiceOverride) ?? {};
  return { ...defaultInvoiceStyle, ...u, ...i };
}
```

- [ ] **Step 4: Run test to verify pass**

Run:
```bash
node --test tests/invoice-style.test.js
```
Expected: PASS

---

## Task 3: Replace Themes with Style Panel in Invoice Editor

**Files:**
- Create: `src/components/invoice/invoice-style-panel.tsx`
- Modify: `src/components/invoice/invoice-editor.tsx`

- [ ] **Step 1: Add style panel component**

Implement `InvoiceStylePanel` that edits a `style` object via props:
- Inputs:
  - fontFamily select
  - baseFontSize number
  - headingWeight number
  - accentColor input (hex)
  - borderStyle select
  - borderRadius number
  - tableStyle select
  - zebraRows checkbox (if no checkbox component exists, use a native input)
  - spacing select

- [ ] **Step 2: Wire panel into `InvoiceEditor`**

Update form schema to include:
- `style` (optional object)
Remove theme selector from UI.

Persist `style` through save/update payloads.

- [ ] **Step 3: Update “new invoice uses default style” behavior**

When creating a new invoice:
- Start with no invoice override (null).
- The preview uses `mergeInvoiceStyle(user.defaultInvoiceStyle, watchAll.style)`.
Implementation detail: the editor needs the user default style; fetch it from `/api/user/settings` on mount and store in state.

- [ ] **Step 4: Manual verification**
- Create invoice → adjust style sliders → preview changes immediately.
- Save → reload invoice edit → style persists.

---

## Task 4: Make HTML Preview Use Effective Style

**Files:**
- Modify: `src/components/invoice/invoice-preview.tsx`
- Modify: `src/components/invoice/invoice-editor.tsx`
- Modify: `src/components/invoice/invoice-themes.ts` (stop using in UI; optionally delete later)

- [ ] **Step 1: Refactor preview to accept `style`**

Change `InvoicePreview` props from `themeId` to:
- `style` (effective style)

Use style tokens to drive className changes:
- font: `font-sans`/`font-serif`/`font-mono`
- borders: toggle border classes
- table style: header border, row borders, zebra
- spacing: adjust padding/margins
- accent: use inline style for accent color where needed

- [ ] **Step 2: Verify build**

Run:
```bash
npm run build
```
Expected: PASS

---

## Task 5: Make PDF Use Effective Style

**Files:**
- Modify: `src/components/invoice/invoice-pdf.tsx`

- [ ] **Step 1: Replace theme-based tokens with style-based tokens**

Compute effective style in the PDF component from invoice:
- `mergeInvoiceStyle(invoice.user?.defaultInvoiceStyle, invoice.style)`
If invoice.user is not selected in PDF route, update the PDF route to query the user style or fetch `User.defaultInvoiceStyle` separately.

- [ ] **Step 2: Manual verification**
- Save invoice with custom style
- Download PDF
- Confirm PDF matches preview for fonts/borders/table.

---

## Task 6: User Settings API + Settings UI (InstaPay/Vodafone + Default Style)

**Files:**
- Create: `src/app/api/user/settings/route.ts`
- Modify: `src/app/dashboard/settings/page.tsx`

- [ ] **Step 1: Add settings API route**

`GET`: returns current user settings:
- `instapayHandle`, `vodafoneCashNumber`, `defaultInvoiceStyle`

`PUT`: updates the above fields for the logged-in user.

- [ ] **Step 2: Update settings page**

Add a client component inside settings page to allow editing:
- Payment settings form (2 inputs + save)
- Default invoice style form (reuse `InvoiceStylePanel`)
- Use the same inline success/error banner pattern used elsewhere.

---

## Task 7: Landing Page Header Auth Awareness

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Make header session-aware**

Use `getServerSession(authOptions)` in `page.tsx` and conditionally render actions:
- Signed out: login/register buttons
- Signed in: dashboard/create/logout

Landing content stays the same.

---

## Task 8: Logout Confirmation Dialog in Dashboard Layout

**Files:**
- Create: `src/components/auth/logout-button.tsx`
- Modify: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: Add `LogoutButton` client component**

Use `Dialog` from `src/components/ui/dialog.tsx`.
Buttons:
- Cancel: closes dialog
- Log out: calls `signOut({ callbackUrl: "/" })`

- [ ] **Step 2: Replace sidebar link**

Replace the `/api/auth/signout` link with `<LogoutButton />`.

---

## Task 9: Admin “Change User Plan” UI + API

**Files:**
- Create: `src/app/admin/users/page.tsx`
- Create: `src/app/api/admin/users/plan/route.ts`
- Modify (optional): `src/app/admin/layout.tsx` to add nav link

- [ ] **Step 1: Add admin API endpoint**

`POST /api/admin/users/plan`:
- Requires ADMIN role
- Input: `{ email, plan, planExpiresAt? }`
- Updates `User.plan` and `User.planExpiresAt`

- [ ] **Step 2: Add admin page**

Simple form:
- email input
- plan select
- optional expiry date
- submit → inline status banner

---

## Task 10: Final Verification

- [ ] **Step 1: Build**
```bash
npm run build
```
Expected: PASS

- [ ] **Step 2: Unit tests**
```bash
node --test tests/invoice-style.test.js
```
Expected: PASS

- [ ] **Step 3: Manual checks on Vercel**
- Landing `/` visible while signed in and shows Dashboard/Create/Logout
- Logout shows confirmation dialog
- Settings can save InstaPay/Vodafone and default style
- New invoice uses default style; invoice override works
- PDF matches preview
- Admin can change plan by email

