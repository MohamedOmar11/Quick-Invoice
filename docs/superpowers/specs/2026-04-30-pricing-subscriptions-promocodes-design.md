# Pricing + Subscriptions + Promo Codes (Design)

## Goal
1) Centralize pricing (Monthly / Yearly / Lifetime) in one place so it applies everywhere (landing + billing + payment submission).
2) Add an admin-only control surface for subscriptions and promo codes, backed by Supabase (Postgres via Prisma), secured by `User.role = "ADMIN"`.
3) Keep plan model as **Option A**: `FREE / PRO / LIFETIME`, where monthly/yearly are both `PRO` with `planExpiresAt`.

## Current State Summary
- Pricing is hardcoded in UI (`150 EGP` in landing + billing) and in the manual payment submission body.
- Manual payments are stored as `Payment(status=PENDING)` but there is no approval flow in-app.
- Promo codes exist in DB and redeem sets `plan="PRO"` with optional `planExpiresAt`, but there is no admin UI to create/manage promo codes.
- `User.role` exists and can be used for admin gating.

## Data Model Changes

### AppSettings: pricing config
Add a JSON field to store pricing config:
- `AppSettings.pricing Json?`

Example value:
```json
{
  "currency": "EGP",
  "proMonthly": 150,
  "proYearly": 1500,
  "lifetime": 3000
}
```

### Payment: store which product was purchased
Add a string field:
- `Payment.product String?` with values:
  - `PRO_MONTHLY`
  - `PRO_YEARLY`
  - `LIFETIME`

This prevents relying on `amount` to infer entitlement.

### PromoCode: support product
Extend promo codes to support:
- `PromoCode.product String?` with values above, OR
- keep `duration` days for time-limited PRO.

Resolution rules:
- If `product === "LIFETIME"` → set `User.plan="LIFETIME"`, `planExpiresAt=null`
- If `product === "PRO_MONTHLY"` → set `User.plan="PRO"`, `planExpiresAt=now+30d`
- If `product === "PRO_YEARLY"` → set `User.plan="PRO"`, `planExpiresAt=now+365d`
- Else if `duration` set → set `User.plan="PRO"`, `planExpiresAt=now+durationDays`
- Else → set `User.plan="PRO"`, `planExpiresAt=null` (non-expiring PRO)

## API

### Public pricing read
- `GET /api/pricing`
  - Returns `{ currency, proMonthly, proYearly, lifetime }`
  - Reads from `AppSettings(id="app")`, falls back to defaults if missing.

### Admin APIs (server-side role enforced)
All admin routes require:
- session exists
- `session.user.role === "ADMIN"`

Admin endpoints:
- `GET/PUT /api/admin/app-settings/pricing` (edit pricing JSON)
- `GET/POST /api/admin/promo-codes` (list/create)
- `PATCH /api/admin/promo-codes/:id` (update/disable)
- `GET /api/admin/payments?status=PENDING` (review queue)
- `POST /api/admin/payments/:id/approve` (set status + upgrade user)
- `POST /api/admin/payments/:id/reject`

## UI

### Landing page pricing
Landing reads `/api/pricing` and renders:
- Monthly / Yearly / Lifetime tabs (or segmented control)
- Feature list uses same source

### Billing page
Billing reads `/api/pricing` and allows selecting:
- Monthly / Yearly / Lifetime
Then manual payment submission sends:
- `product` and `screenshotUrl`
Server resolves the amount from pricing config (do not trust client amount).

### Admin panel (minimal, secure)
Routes:
- `/admin` (dashboard)
- `/admin/pricing`
- `/admin/payments`
- `/admin/promo-codes`

## Security
- Role enforcement happens on the server for both UI and API.
- Never trust client-sent price/plan; server calculates based on pricing config.
- Admin operations should be idempotent and validate current Payment status transitions.

