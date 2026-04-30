# Plan Differences + Brand Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce FREE vs PRO/LIFETIME differences (FREE=3 invoices/month, only minimal-corporate template, watermark) and add Pro-only Brand Settings (company name + logo upload) that renders on preview and PDFs; also swap site logo and make it larger.

**Architecture:** Centralize plan checks in server routes (invoice create/update + PDF render). Store brand data on `User` (`brandName`, `brandLogoUrl`) updated via `/api/user/settings`. Use UploadThing router `brandLogo` for upload.

**Tech Stack:** Next.js App Router, next-auth, Prisma, UploadThing, @react-pdf/renderer.

---

## File Map (Planned)

**DB**
- Modify: `prisma/schema.prisma` (add `User.brandName`)
- Create: `docs/migrations/2026-04-30-brand-settings.sql`

**Upload**
- Modify: `src/app/api/uploadthing/core.ts` (add `brandLogo`)

**User Settings**
- Modify: `src/app/api/user/settings/route.ts` (read/write brandName/brandLogoUrl)
- Modify: `src/components/settings/user-settings-form.tsx` (new Brand Settings UI)
- Modify: `src/app/dashboard/settings/page.tsx` (render Pro section conditionally)

**Invoice enforcement**
- Modify: `src/app/api/invoices/route.ts` (limit 3 + template restriction)
- Modify: `src/app/api/invoices/[id]/route.ts` (template restriction on update)

**Invoice UI**
- Modify: `src/components/invoice/invoice-editor.tsx` (template gating)

**Watermark + brand rendering**
- Modify: `src/components/invoice/invoice-preview.tsx` (logo/company + watermark)
- Modify: `src/components/invoice/invoice-html.js` (logo/company + watermark)
- Modify: `src/components/invoice/invoice-pdf.tsx` (logo/company + watermark)
- Modify: `src/app/api/invoices/[id]/pdf/route.ts` (pass plan info to html renderer if needed)

**Site logo**
- Replace: `public/hesaby-logo.png`
- Modify sizes in:
  - `src/app/page.tsx`
  - `src/app/login/page.tsx`
  - `src/app/register/page.tsx`
  - `src/app/dashboard/layout.tsx`
  - `src/components/dashboard/topbar.tsx`

**Tests**
- Modify/Add: `tests/*` for plan gating + watermark markers

---

## Task 1: Add failing tests for plan gating (FREE=3 + template restriction)

**Files:**
- Create: `tests/plan-gating.test.js`

- [ ] **Step 1: Write failing test**
```js
const test = require("node:test");
const assert = require("node:assert/strict");

const { isTemplateAllowedForPlan, freeMonthlyInvoiceLimit } = require("../src/lib/plan-gating");

test("free plan invoice limit is 3", () => {
  assert.equal(freeMonthlyInvoiceLimit(), 3);
});

test("free plan only allows minimal-corporate", () => {
  assert.equal(isTemplateAllowedForPlan("FREE", "minimal-corporate"), true);
  assert.equal(isTemplateAllowedForPlan("FREE", "bold-stripe"), false);
});
```

- [ ] **Step 2: Verify RED**
```bash
node --test tests/plan-gating.test.js
```
Expected: FAIL (module missing)

- [ ] **Step 3: Minimal implementation**
Create `src/lib/plan-gating.js` implementing:
- `freeMonthlyInvoiceLimit() => 3`
- `isTemplateAllowedForPlan(plan, templateId)`:
  - FREE → only `minimal-corporate`
  - PRO/LIFETIME → true

- [ ] **Step 4: Verify GREEN**
```bash
node --test tests/plan-gating.test.js
```

- [ ] **Step 5: Commit**
```bash
git add tests/plan-gating.test.js src/lib/plan-gating.js
git commit -m "feat(plan): add plan gating helpers"
```

---

## Task 2: DB + migration for `brandName`

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `docs/migrations/2026-04-30-brand-settings.sql`

- [ ] **Step 1: Add field**
- Add `brandName String?` to `User`.

- [ ] **Step 2: Add Supabase SQL**
```sql
alter table if exists "User"
  add column if not exists "brandName" text;
```

- [ ] **Step 3: Commit**
```bash
git add prisma/schema.prisma docs/migrations/2026-04-30-brand-settings.sql
git commit -m "feat(brand): add brandName field"
```

---

## Task 3: UploadThing router for brand logo

**Files:**
- Modify: `src/app/api/uploadthing/core.ts`

- [ ] **Step 1: Add `brandLogo` route**
- Same auth middleware as `paymentScreenshot`.
- Return `url`.

- [ ] **Step 2: Build**
```bash
npm run build
```

- [ ] **Step 3: Commit**
```bash
git add src/app/api/uploadthing/core.ts
git commit -m "feat(brand): add brand logo upload router"
```

---

## Task 4: User settings API supports brand fields

**Files:**
- Modify: `src/app/api/user/settings/route.ts`

- [ ] **Step 1: Update GET select**
- Add `brandName`, `brandLogoUrl`.

- [ ] **Step 2: Update PUT**
- Validate strings; persist fields.

- [ ] **Step 3: Build**
```bash
npm run build
```

- [ ] **Step 4: Commit**
```bash
git add src/app/api/user/settings/route.ts
git commit -m "feat(settings): support brand name and logo url"
```

---

## Task 5: Settings UI (Pro-only) becomes usable

**Files:**
- Modify: `src/app/dashboard/settings/page.tsx`
- Modify: `src/components/settings/user-settings-form.tsx`

- [ ] **Step 1: Render Brand Settings based on plan**
- If plan is PRO/LIFETIME, show editable fields.
- If FREE, keep locked message.

- [ ] **Step 2: Add company name input**
- Binds to `brandName` in `/api/user/settings`.

- [ ] **Step 3: Add logo upload dropzone**
- Uses UploadThing `brandLogo`.
- On upload completion, set `brandLogoUrl` and save.

- [ ] **Step 4: Build**
```bash
npm run build
```

- [ ] **Step 5: Commit**
```bash
git add src/app/dashboard/settings/page.tsx src/components/settings/user-settings-form.tsx
git commit -m "feat(settings): pro brand settings UI"
```

---

## Task 6: Enforce plan rules in invoice routes

**Files:**
- Modify: `src/app/api/invoices/route.ts`
- Modify: `src/app/api/invoices/[id]/route.ts`

- [ ] **Step 1: Use plan-gating helpers**
- Limit FREE to 3/month.
- Template restriction on create + update.

- [ ] **Step 2: Add tests for watermark/template blocks (minimal)**
- Add server-side unit tests if possible, otherwise rely on build.

- [ ] **Step 3: Build**
```bash
npm run build
```

- [ ] **Step 4: Commit**
```bash
git add src/app/api/invoices/route.ts src/app/api/invoices/[id]/route.ts
git commit -m "feat(plan): enforce invoice limits and templates"
```

---

## Task 7: Template gating in invoice editor

**Files:**
- Modify: `src/components/invoice/invoice-editor.tsx`

- [ ] **Step 1: Fetch session plan**
- If plan is FREE:
  - only allow `minimal-corporate` in template selector (disable/hide others)

- [ ] **Step 2: Build**
```bash
npm run build
```

- [ ] **Step 3: Commit**
```bash
git add src/components/invoice/invoice-editor.tsx
git commit -m "feat(plan): gate templates in editor"
```

---

## Task 8: Brand rendering + watermark in preview and PDFs

**Files:**
- Modify: `src/components/invoice/invoice-preview.tsx`
- Modify: `src/components/invoice/invoice-html.js`
- Modify: `src/components/invoice/invoice-pdf.tsx`

- [ ] **Step 1: InvoicePreview**
- Render logo image from `brandLogoUrl` and name from `brandName`.
- Add watermark for FREE.

- [ ] **Step 2: HTML render**
- Use `invoice.user.brandLogoUrl` and `invoice.user.brandName`.
- Add watermark for FREE.

- [ ] **Step 3: React-PDF render**
- Render brand name and optional logo (Image component from react-pdf).
- Add watermark for FREE.

- [ ] **Step 4: Build**
```bash
npm run build
```

- [ ] **Step 5: Commit**
```bash
git add src/components/invoice/invoice-preview.tsx src/components/invoice/invoice-html.js src/components/invoice/invoice-pdf.tsx
git commit -m "feat(plan): brand rendering and free watermark"
```

---

## Task 9: Replace site logo + make it bigger

**Files:**
- Replace: `public/hesaby-logo.png`
- Modify: `src/app/page.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/register/page.tsx`
- Modify: `src/app/dashboard/layout.tsx`
- Modify: `src/components/dashboard/topbar.tsx`

- [ ] **Step 1: Download new logo**
- Replace the file in `public/hesaby-logo.png`.

- [ ] **Step 2: Increase size classes**
- Increase the `h-*` sizes consistently.

- [ ] **Step 3: Build**
```bash
npm run build
```

- [ ] **Step 4: Commit**
```bash
git add public/hesaby-logo.png src/app/page.tsx src/app/login/page.tsx src/app/register/page.tsx src/app/dashboard/layout.tsx src/components/dashboard/topbar.tsx
git commit -m "feat(brand): update logo and sizing"
```

---

## Task 10: Final verification + deploy checklist

- [ ] Run tests + build
```bash
node --test tests/plan-gating.test.js
npm run build
```

- [ ] Supabase migration
- Run `docs/migrations/2026-04-30-brand-settings.sql` in Supabase SQL editor.

- [ ] Push
```bash
git push origin main
```

