# Plan Differences + Brand Settings + Watermark (Design)

## Goal
- Make FREE vs PRO/LIFETIME differences obvious and enforced.
- Add usable “Brand Settings (Pro)”:
  - Company name + logo upload (shown on invoices and PDFs)
  - Default invoice style controls
- Replace site logo with a new asset and increase its displayed size.

## Plan Rules

### FREE
- Invoice creation limit: **3 invoices per calendar month** (server enforced).
- Allowed invoice template IDs: **only** `minimal-corporate` (UI + server enforced).
- Watermark text on invoice preview and PDFs: **“Created with Hesaby”**.

### PRO
- Unlimited invoices.
- All templates unlocked.
- No watermark.
- Brand settings enabled.

### LIFETIME
- Same as PRO, but plan is `LIFETIME` and never expires.

## Data Model
Existing fields:
- `User.brandLogoUrl String?`

Add new field:
- `User.brandName String?`

Rationale:
- Brand settings require a stable company name that renders on invoices (preview + PDFs).

## Uploads
Use UploadThing with a new router key:
- `brandLogo` (image, 4MB, 1 file)

On upload complete:
- return the `file.url`, which is persisted to `User.brandLogoUrl` via `PUT /api/user/settings`.

## API Changes

### User settings API
Extend `GET/PUT /api/user/settings`:
- Read/write:
  - `brandName`
  - `brandLogoUrl`
  - `defaultInvoiceStyle` (already exists)

Authorization:
- Only authenticated user can read/write their own settings.

### Invoice create/update enforcement
Enforce template restriction and plan expiration:
- Determine **effective plan**:
  - If `plan === "PRO"` and `planExpiresAt < now` → treat as FREE and optionally downgrade in DB.
- If effective plan is FREE:
  - `template` must equal `minimal-corporate`
  - monthly created invoice count must be `< 3`

Apply enforcement in:
- `POST /api/invoices`
- `PUT /api/invoices/[id]`

### PDF routes watermark
FREE watermark applies to:
- HTML render used by `/api/invoices/[id]/pdf`
- React-PDF fallback `/components/invoice/invoice-pdf.tsx`

## UI Changes

### Invoice editor template picker
- FREE users: only show `minimal-corporate` as selectable.
- PRO/LIFETIME: show all templates.
- If FREE user opens an existing invoice with non-free template:
  - show locked state and prompt upgrade (save should be blocked by server anyway).

### Settings page “Brand Settings (Pro)”
- If PRO/LIFETIME: show editable controls:
  - Company name input
  - Logo upload dropzone
  - Default invoice style panel
- If FREE: show disabled section with upgrade hint.

### Invoice preview
Replace placeholder “LOGO” + “Your Company”:
- If `brandLogoUrl` present and `showLogo` is true: render image.
- Company name uses `brandName ?? "Your Company"`.
- If FREE: show watermark “Created with Hesaby”.

### Site logo swap + size increase
- Replace the current `/public/hesaby-logo.png` with the new logo from the provided URL.
- Increase displayed sizes in:
  - Landing header/footer
  - Dashboard sidebar
  - Mobile drawer
  - Login/Register header

## Security
- Enforce plan/template restrictions server-side (never UI-only).
- Do not trust client-sent plan/limits/template eligibility.
- Admin is not required for this feature; everything is user-scoped.

