# HTML/CSS PDF Themes + One-Click Export (Design)

## Goal

Add 10 distinct invoice themes for PDF export using **HTML + CSS print styles rendered to PDF server-side**, while keeping the existing **one-click “PDF” export button** behavior.

## Constraints / Non-goals

- Non-goal: replace the invoice editor UI flow (keep Save / Print / PDF actions).
- Non-goal: implement a drag/drop designer.
- Non-goal: edge runtime for PDF generation (Chromium requires Node runtime).

## Current State (Codebase)

- PDF export button opens `GET /api/invoices/:id/pdf` from the editor.
- The current PDF route uses `@react-pdf/renderer` ([route.ts](file:///workspace/src/app/api/invoices/%5Bid%5D/pdf/route.ts)).
- The DB already contains:
  - `Invoice.template` (string) — previously used for themes; can be reused for theme ID.
  - `Invoice.style` (jsonb) — per-invoice override tokens.
  - `User.defaultInvoiceStyle` (jsonb) — default override tokens.

## High-Level Architecture

### 1) Theme System (10 themes)

Themes are defined as **token sets + layout variants**:
- `id`: stable string (e.g. `minimal-corporate`, `luxury-elegant`, `arabic-diwan`)
- `name`
- `direction`: `ltr | rtl`
- `layoutVariant`: controls layout composition choices (header arrangement, totals placement)
- `tokens`: print-safe CSS variables (colors, radii, spacing, typography scale, table rules)

Themes must be conceptually distinct (layout, hierarchy, table treatment), not only color changes.

### 2) Overrides (Advanced Style Panel)

Keep “Theme + overrides” behavior:

`effectiveTokens = merge(theme.tokens, user.defaultInvoiceStyle, invoice.style)`

Where later sources override earlier values. The editor’s advanced style panel writes into `invoice.style`. Settings write into `user.defaultInvoiceStyle`.

### 3) HTML Renderer

Introduce a single HTML renderer that takes:
- invoice payload
- user payload (payment settings)
- theme tokens + direction

It outputs:
- a full HTML document string
- inline `<style>` containing:
  - base invoice CSS (layout, print rules, table header repetition, page breaks)
  - `:root { --token: ... }` variables from `effectiveTokens`
  - theme-specific layout classes keyed by `layoutVariant`

Optionally expose an authenticated debug endpoint:
- `GET /api/invoices/:id/html` → returns HTML for browser preview.

### 4) PDF Generator (Node runtime)

Replace `/api/invoices/:id/pdf` implementation:
- Fetch invoice + user payment info
- Render HTML string
- Use headless Chromium (via `puppeteer-core` + `@sparticuz/chromium`) to generate PDF buffer
- Return `Content-Type: application/pdf` and `Content-Disposition: inline`

Node runtime is required:
- `export const runtime = "nodejs"`

### 5) One-click PDF Button

No UX changes required. Keep:
- `window.open("/api/invoices/<id>/pdf", "_blank")`

## Theme Requirements Checklist

Minimum set:
- 2 themes optimized for Arabic (RTL)
- 2 minimal ink-saving themes
- 1 luxury theme
- 1 ultra-simple “fast invoice” theme

All themes:
- A4 and Letter support
- multi-page items table with repeating header
- totals remain together near the end (avoid splitting)
- print margins safe for professional printing

## Print & Pagination Rules (HTML/CSS)

Baseline rules applied to all themes:
- `@page { size: A4; margin: 16mm; }` (with optional Letter)
- `thead { display: table-header-group; }`
- `tfoot { display: table-footer-group; }` (optional)
- `tr, .block { break-inside: avoid; page-break-inside: avoid; }`
- keep totals block in `.keep-together`

## RTL Support

For RTL themes:
- `html[dir="rtl"]` on root
- use logical alignment in CSS:
  - `text-align: start/end`
  - `margin-inline`, `padding-inline`
- mirror header composition via `layoutVariant` rather than duplicating markup.

## Vercel Considerations

- Puppeteer must run in Node runtime.
- Use `@sparticuz/chromium` for serverless compatibility.
- Avoid running `prisma db push` in build; DB schema is managed via Supabase SQL.

