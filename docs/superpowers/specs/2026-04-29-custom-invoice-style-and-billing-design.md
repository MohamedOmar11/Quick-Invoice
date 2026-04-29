# Custom Invoice Style + Landing + Logout Confirm + Billing Fields + Admin Plan Management (Design)

## Goals

1. Replace multiple invoice themes with a single invoice layout that is fully customizable by the user (borders, fonts, table styling, spacing, colors).
2. Keep the landing page (`/`) accessible even when the user is signed in.
3. Add a logout confirmation dialog (Yes/No) instead of immediate logout.
4. Allow users to optionally save their own InstaPay handle and Vodafone Cash number.
5. Improve billing/admin plan management: promo codes + manual plan changes by admin.

Non-goals (for this iteration):
- Automated payment processing (Stripe/Paymob integration).
- Complex WYSIWYG editing (drag/drop). We will use structured controls.

---

## Current Context (Observed)

- Landing page is in [page.tsx](file:///workspace/src/app/page.tsx) and is currently public.
- Dashboard auth gating happens in [dashboard/layout.tsx](file:///workspace/src/app/dashboard/layout.tsx) using `getServerSession` and redirects to `/login`.
- Logout in dashboard is a raw link to `/api/auth/signout`, no confirmation.
- Invoices are stored in Postgres via Prisma with `Invoice.template` string.
- Invoice editor/preview and PDF are implemented in:
  - [invoice-editor.tsx](file:///workspace/src/components/invoice/invoice-editor.tsx)
  - [invoice-preview.tsx](file:///workspace/src/components/invoice/invoice-preview.tsx)
  - [invoice-pdf.tsx](file:///workspace/src/components/invoice/invoice-pdf.tsx)
- Billing UI exists at `/dashboard/billing` and there are admin pages for payments/promo-codes.

---

## Functional Requirements

### A) Landing page always available
- `/` must render even when authenticated.
- Header actions must switch based on auth state:
  - Signed out: “Log in”, “Get Started”
  - Signed in: “Dashboard”, “Create Invoice”, “Log out”

### B) Logout confirmation (Yes/No)
- Clicking “Log out” opens a confirmation dialog.
- Cancel closes dialog.
- Confirm triggers NextAuth sign out and redirects to `/`.

### C) Single invoice layout with customization
- Replace “Theme” selection with a “Style” panel.
- User can set a default invoice style in Settings.
- Each invoice can optionally override the default style.
- The same “effective style” must apply to:
  - The HTML preview
  - Generated PDF

### D) Optional InstaPay / Vodafone Cash fields
- User can add/update:
  - `instapayHandle` (optional)
  - `vodafoneCashNumber` (optional)
- These are shown on invoice output when present (default on; later we can add a per-invoice toggle if needed).

### E) Billing and plan management
- Promo codes remain supported.
- Admin can set user plan by email (FREE/PRO/LIFETIME) and optionally set an expiry date.

---

## Data Model Changes (Prisma)

### User
- Add:
  - `instapayHandle String?`
  - `vodafoneCashNumber String?`
  - `defaultInvoiceStyle Json?` (stores default style controls)

### Invoice
- Add:
  - `style Json?` (per-invoice overrides)
- Keep existing `template` for backward compatibility for now (no UI usage).

---

## Invoice Style Model (JSON)

We store a compact JSON object with typed keys. Example:

```json
{
  "fontFamily": "inter",
  "baseFontSize": 12,
  "headingWeight": 700,
  "accentColor": "#4f46e5",
  "borderStyle": "thin",
  "borderRadius": 8,
  "tableStyle": "lines",
  "zebraRows": false,
  "spacing": "normal"
}
```

Rendering uses:
- `effectiveStyle = invoice.style ?? user.defaultInvoiceStyle ?? appDefaultStyle`

---

## UI/UX Changes

### Invoice editor
- Replace theme dropdown with:
  - “Style” section containing the controls listed above
- Save persists invoice + style override.

### Settings page
- Add “Payment Settings” card (InstaPay, Vodafone Cash).
- Add “Default Invoice Style” card (same controls as invoice editor defaults).

### Admin
- Add “Users / Plans” admin page:
  - Search input by email
  - Plan dropdown (FREE/PRO/LIFETIME)
  - Optional expiry date
  - Submit updates user

---

## API Changes

### User settings
- New endpoints:
  - `GET /api/user/settings` → returns current values
  - `PUT /api/user/settings` → updates instapay/vodafone/defaultInvoiceStyle

### Invoice endpoints
- Extend existing invoice create/update to accept:
  - `style` (Json)

### Admin plan update
- New endpoint:
  - `POST /api/admin/users/plan` with `{ email, plan, planExpiresAt? }`

---

## Security / Permissions

- User settings endpoints require authenticated session.
- Admin plan endpoint requires `session.user.role === "ADMIN"`.

---

## Rollout / Backward Compatibility

- Existing invoices continue working.
- `template` stays in DB; UI stops depending on it.
- If an invoice has no style, it renders with default style.

