# Pricing + Subscriptions + Promo Codes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize pricing (monthly/yearly/lifetime) in AppSettings, add admin-only controls for pricing, payments approval, and promo codes, and wire Billing/Landing to the shared pricing source. Plan model remains `FREE / PRO / LIFETIME` (monthly/yearly are `PRO` with `planExpiresAt`).

**Architecture:** Store pricing in `AppSettings(id="app").pricing`. Manual payments submit `product` only; server resolves amount from pricing. Admin API approves/rejects payments and applies entitlements. Promo codes include `product` or `duration`.

**Tech Stack:** Next.js App Router routes, Prisma, next-auth, shadcn components.

---

## File Map (Planned)

**Modify**
- `prisma/schema.prisma` (AppSettings.pricing, Payment.product, PromoCode.product)
- `src/lib/auth.ts` (ensure `role` is in session token; confirm)
- `src/app/api/promo/redeem/route.ts` (apply product rules)
- `src/app/api/payments/manual/route.ts` (accept product, compute amount server-side)
- `src/app/dashboard/billing/page.tsx` (pricing selector + send product)
- `src/app/page.tsx` (pricing tabs + render from /api/pricing)

**Create**
- `src/lib/pricing.ts` (typed pricing + server fetch helper)
- `src/app/api/pricing/route.ts`
- `src/app/api/admin/_auth.ts` (shared admin guard)
- `src/app/api/admin/app-settings/pricing/route.ts`
- `src/app/api/admin/payments/route.ts`
- `src/app/api/admin/payments/[id]/approve/route.ts`
- `src/app/api/admin/payments/[id]/reject/route.ts`
- `src/app/api/admin/promo-codes/route.ts`
- `src/app/api/admin/promo-codes/[id]/route.ts`
- `src/app/admin/layout.tsx` (admin gate)
- `src/app/admin/page.tsx`
- `src/app/admin/pricing/page.tsx`
- `src/app/admin/payments/page.tsx`
- `src/app/admin/promo-codes/page.tsx`

**Tests**
- `tests/pricing.test.js`
- `tests/entitlements.test.js`

---

## Task 1: Schema changes (pricing + products)

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add fields**
Add:
- `AppSettings.pricing Json?`
- `Payment.product String?`
- `PromoCode.product String?`

- [ ] **Step 2: Generate Prisma**
Run:
```bash
npm run build
```
Expected: PASS (prisma generate runs on install/build)

- [ ] **Step 3: Commit**
```bash
git add prisma/schema.prisma
git commit -m "feat(billing): add pricing and product fields"
```

---

## Task 2: Pricing module + public API

**Files:**
- Create: `src/lib/pricing.ts`
- Create: `src/app/api/pricing/route.ts`
- Create: `tests/pricing.test.js`

- [ ] **Step 1: Write failing test**

Create `tests/pricing.test.js`:
```js
const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizePricing } = require("../src/lib/pricing");

test("normalizePricing fills defaults", () => {
  const p = normalizePricing(null);
  assert.equal(p.currency, "EGP");
  assert.equal(typeof p.proMonthly, "number");
});
```

- [ ] **Step 2: Verify RED**
Run:
```bash
node --test tests/pricing.test.js
```
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `normalizePricing` + `getPricingFromDb`**
- Defaults: `{ currency: "EGP", proMonthly: 150, proYearly: 1500, lifetime: 3000 }`

- [ ] **Step 4: Add `GET /api/pricing`**
- Reads `AppSettings(id="app")`
- Returns normalized pricing JSON

- [ ] **Step 5: Verify GREEN**
Run:
```bash
node --test tests/pricing.test.js
npm run build
```

- [ ] **Step 6: Commit**
```bash
git add src/lib/pricing.ts src/app/api/pricing/route.ts tests/pricing.test.js
git commit -m "feat(billing): add pricing API"
```

---

## Task 3: Entitlements helper (monthly/yearly/lifetime)

**Files:**
- Create: `src/lib/entitlements.ts`
- Create: `tests/entitlements.test.js`

- [ ] **Step 1: Write failing test**
Create `tests/entitlements.test.js`:
```js
const test = require("node:test");
const assert = require("node:assert/strict");
const { entitlementForProduct } = require("../src/lib/entitlements");

test("monthly maps to PRO 30d", () => {
  const e = entitlementForProduct("PRO_MONTHLY", new Date("2026-01-01"));
  assert.equal(e.plan, "PRO");
  assert.ok(e.planExpiresAt);
});

test("lifetime maps to LIFETIME no expiry", () => {
  const e = entitlementForProduct("LIFETIME", new Date("2026-01-01"));
  assert.equal(e.plan, "LIFETIME");
  assert.equal(e.planExpiresAt, null);
});
```

- [ ] **Step 2: Verify RED**
```bash
node --test tests/entitlements.test.js
```

- [ ] **Step 3: Implement helper**
- `PRO_MONTHLY` → +30 days
- `PRO_YEARLY` → +365 days
- `LIFETIME` → null expiry

- [ ] **Step 4: Verify GREEN**
```bash
node --test tests/entitlements.test.js
```

- [ ] **Step 5: Commit**
```bash
git add src/lib/entitlements.ts tests/entitlements.test.js
git commit -m "feat(billing): add entitlements mapping"
```

---

## Task 4: Update manual payment submission (server-trust pricing)

**Files:**
- Modify: `src/app/api/payments/manual/route.ts`
- Modify: `src/app/dashboard/billing/page.tsx`

- [ ] **Step 1: API accepts `{ product, screenshotUrl, method }`**
- Compute amount from DB pricing by product
- Persist `Payment.product` + computed amount
- Ignore client-sent amount (remove it)

- [ ] **Step 2: Billing UI adds selector**
- Monthly / Yearly / Lifetime selection
- Render amounts from `/api/pricing`
- Submit `product` not `amount`

- [ ] **Step 3: Build**
```bash
npm run build
```

- [ ] **Step 4: Commit**
```bash
git add src/app/api/payments/manual/route.ts src/app/dashboard/billing/page.tsx
git commit -m "feat(billing): product-based manual payments"
```

---

## Task 5: Promo code product support

**Files:**
- Modify: `src/app/api/promo/redeem/route.ts`

- [ ] **Step 1: Apply product precedence**
- If promo has `product`, apply entitlement mapping
- Else keep duration behavior

- [ ] **Step 2: Build + tests**
```bash
npm run build
node --test tests/entitlements.test.js
```

- [ ] **Step 3: Commit**
```bash
git add src/app/api/promo/redeem/route.ts
git commit -m "feat(promo): support product-based promos"
```

---

## Task 6: Admin guard + Admin APIs

**Files:**
- Create: `src/app/api/admin/_auth.ts`
- Create: `src/app/api/admin/app-settings/pricing/route.ts`
- Create: `src/app/api/admin/payments/route.ts`
- Create: `src/app/api/admin/payments/[id]/approve/route.ts`
- Create: `src/app/api/admin/payments/[id]/reject/route.ts`
- Create: `src/app/api/admin/promo-codes/route.ts`
- Create: `src/app/api/admin/promo-codes/[id]/route.ts`

- [ ] **Step 1: Admin guard helper**
- Checks session + `role === "ADMIN"`, otherwise 403.

- [ ] **Step 2: Pricing admin API**
- GET returns pricing JSON
- PUT updates `AppSettings(id="app").pricing`

- [ ] **Step 3: Payments review API**
- GET list payments by status
- Approve: transaction sets payment status and applies entitlement to user
- Reject: sets status rejected

- [ ] **Step 4: Promo code API**
- list/create/update promo codes

- [ ] **Step 5: Build**
```bash
npm run build
```

- [ ] **Step 6: Commit**
```bash
git add src/app/api/admin
git commit -m "feat(admin): pricing, payments, promo APIs"
```

---

## Task 7: Admin UI pages (minimal)

**Files:**
- Create: `src/app/admin/layout.tsx` (server gate)
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/pricing/page.tsx`
- Create: `src/app/admin/payments/page.tsx`
- Create: `src/app/admin/promo-codes/page.tsx`

- [ ] **Step 1: Layout gate**
- Redirect non-admin to `/dashboard`

- [ ] **Step 2: Pricing page**
- simple form to edit monthly/yearly/lifetime numbers

- [ ] **Step 3: Payments page**
- list pending payments + approve/reject buttons

- [ ] **Step 4: Promo codes page**
- list/create basic promo codes

- [ ] **Step 5: Build**
```bash
npm run build
```

- [ ] **Step 6: Commit**
```bash
git add src/app/admin
git commit -m "feat(admin): add admin UI"
```

---

## Task 8: Replace hardcoded pricing in landing

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Fetch `/api/pricing` server-side**
- Use values to render monthly/yearly/lifetime toggle and pricing cards

- [ ] **Step 2: Build**
```bash
npm run build
```

- [ ] **Step 3: Commit**
```bash
git add src/app/page.tsx
git commit -m "feat(marketing): dynamic pricing"
```

---

## Task 9: Final verification + push

- [ ] Run tests + build
```bash
node --test tests/pricing.test.js
node --test tests/entitlements.test.js
npm run build
```

- [ ] Push
```bash
git push origin main
```

