# Advanced Invoice Style + AppSettings Payments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dashboard navigation back to landing, expand invoice customization controls, and introduce DB-backed global AppSettings for CEO payment settings (InstaPay URL + Vodafone Cash).

**Architecture:** Keep invoice style in JSON (`User.defaultInvoiceStyle`, `Invoice.style`) and expand the style model + UI. Add `AppSettings` as a singleton row in Postgres, editable by ADMIN, read by billing UI. PDF uses react-pdf link annotations for InstaPay URL.

**Tech Stack:** Next.js App Router, next-auth, Prisma Postgres, @react-pdf/renderer, shadcn/base-ui dialog/select/input.

---

## Task 1: Add Prisma AppSettings model + user field rename

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Update Prisma schema**
- Add model:
  - `model AppSettings { id String @id ownerInstapayUrl String? ownerVodafoneCashNumber String? }`
- In `User`, rename `instapayHandle` → `instapayUrl` (keep old field temporarily if you want backward compatibility, otherwise a DB migration is required).

- [ ] **Step 2: Generate + validate**
Run:
```bash
npx prisma validate
npx prisma generate
```

- [ ] **Step 3: Supabase SQL migration**
Run in Supabase SQL editor:
```sql
create table if not exists "AppSettings" (
  "id" text primary key,
  "ownerInstapayUrl" text,
  "ownerVodafoneCashNumber" text
);

insert into "AppSettings" ("id") values ('app')
on conflict ("id") do nothing;

alter table "User" add column if not exists "instapayUrl" text;
```
(Optionally copy old values from `instapayHandle` if present.)

---

## Task 2: AppSettings API (admin only)

**Files:**
- Create: `src/app/api/admin/app-settings/route.ts`

- [ ] **Step 1: Implement GET/PUT**
- GET returns the singleton row (`id='app'`)
- PUT requires ADMIN role and updates values

- [ ] **Step 2: Build**
Run:
```bash
npm run build
```

---

## Task 3: Admin UI for AppSettings

**Files:**
- Create: `src/app/admin/app-settings/page.tsx`
- Modify: `src/app/admin/layout.tsx` (add nav link)
- Create: `src/components/admin/app-settings-form.tsx`

- [ ] **Step 1: Create form**
Fields:
- Owner InstaPay URL
- Owner Vodafone Cash Number
Save button + inline status banner

- [ ] **Step 2: Build**
Run:
```bash
npm run build
```

---

## Task 4: Billing page uses AppSettings owner payment info

**Files:**
- Modify: `src/app/dashboard/billing/page.tsx`

- [ ] **Step 1: Fetch AppSettings in billing page**
- Display the owner payment info box (InstaPay URL + Vodafone number) as instructions for subscription payment.

- [ ] **Step 2: Build**
Run:
```bash
npm run build
```

---

## Task 5: Dashboard link back to landing

**Files:**
- Modify: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: Add “Home” link to `/`**
- Put it in sidebar nav and mobile header.

- [ ] **Step 2: Build**
Run:
```bash
npm run build
```

---

## Task 6: Expand invoice style model + UI controls

**Files:**
- Modify: `src/components/invoice/invoice-style.js`
- Modify: `src/components/invoice/invoice-style.d.ts`
- Modify: `src/components/invoice/invoice-style-panel.tsx`
- Modify: `src/components/invoice/invoice-preview.tsx`
- Modify: `src/components/invoice/invoice-pdf.tsx`
- Modify: `tests/invoice-style.test.js`

- [ ] **Step 1: Update tests first**
Add expectations for new defaults to `tests/invoice-style.test.js`.

- [ ] **Step 2: Implement new defaults + merge behavior**
Extend `defaultInvoiceStyle` with new keys.

- [ ] **Step 3: Add panel controls**
Add the new inputs/selects described in the design.

- [ ] **Step 4: Use new style in preview**
Use background/text/border colors, padding, title size, table cell padding.

- [ ] **Step 5: PDF clickable InstaPay link**
If `invoice.user.instapayUrl` exists:
- render `Link` component from `@react-pdf/renderer` (or `Text` with `src` depending on supported API).

- [ ] **Step 6: Verify**
Run:
```bash
node --test tests/invoice-style.test.js
npm run build
```

---

## Task 7: Push + Deploy

- [ ] Commit changes
- [ ] Push to GitHub
- [ ] Redeploy on Vercel

