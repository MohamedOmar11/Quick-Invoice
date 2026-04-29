## Advanced Invoice Style + AppSettings Payments (Design)

### Goals
- Make the landing page reachable from dashboard (simple navigation).
- Expand invoice customization to an “Advanced Style Panel”.
- Add global (CEO) payment settings stored in DB via `AppSettings`.
- Keep user payment settings optional and support InstaPay URL as a clickable link on PDF.

### Scope
- Not building drag/drop designer.
- Not integrating automated subscription billing gateways (Stripe/Paymob).

---

## Dashboard → Landing navigation
- Add “Home” link in dashboard sidebar and mobile header to `/`.

---

## Advanced invoice style

### Storage
- `User.defaultInvoiceStyle` (jsonb) remains the default.
- `Invoice.style` (jsonb) remains override.

### Extend style schema (json)
Add keys:
- `headerLayout`: `"split" | "left" | "right" | "center"`
- `showLogo`: boolean
- `logoSize`: `"sm" | "md" | "lg"`
- Typography:
  - `titleFontSize`, `labelFontSize`, `bodyFontSize`
  - `uppercaseLabels`: boolean
- Colors:
  - `backgroundColor`, `textColor`, `mutedColor`, `borderColor`
  - `tableHeaderBg`
- Table:
  - `showColumnBorders`: boolean
  - `rowSeparator`: `"none" | "thin" | "medium"`
  - `cellPadding`: `"sm" | "md" | "lg"`
  - `zebraColor`: string

### Rendering
- Preview and PDF derive the same `effectiveStyle`.
- PDF uses clickable link annotations for InstaPay URL.

---

## Payment settings

### User-level (optional)
- Rename/extend to:
  - `instapayUrl` (string optional)
  - `vodafoneCashNumber` (string optional)
  - (optional later) `paypalMeUrl`/`paypalEmail`

### CEO/global (AppSettings)
- New Prisma model `AppSettings` (single row):
  - `id` fixed to `"app"`
  - `ownerInstapayUrl` (string optional)
  - `ownerVodafoneCashNumber` (string optional)
  - `ownerCompanyName`/`ownerAddress` optional (future)

### UI
- Admin page “App Settings” to update these values.
- Billing page reads from AppSettings and displays “Owner Payment” instructions for subscription payments.

