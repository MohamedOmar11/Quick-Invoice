# SaaS UI Redesign (Design)

## Goal
Upgrade the QuickInvoice web app UI/UX to feel like a premium SaaS (Stripe/Notion/Linear quality) while keeping the existing user flow largely the same:
- Dashboard with sidebar navigation
- Invoice editor split view (form left, preview right)
- One-click PDF export

## Non-goals
- No major information architecture changes.
- No backend behavior changes required to complete the UI polish (except optional loading states wiring).

## Principles
- Calm, high-contrast UI with strong hierarchy.
- Fewer visual containers, more whitespace.
- One primary action per screen.
- Consistent spacing scale and component sizing.
- Fast feedback (saving/exporting/loading states).

## Layout & Structure

### Dashboard Shell
- Sidebar (desktop): fixed width, grouped navigation with active indicator.
- Topbar (desktop): sticky; includes page title, global actions (Create invoice), user menu.
- Mobile: topbar shows nav trigger + title + primary action; sidebar becomes drawer.

### Spacing System
- Page padding: `p-6 md:p-8`
- Section vertical rhythm: `space-y-8`
- Card padding: `p-5 md:p-6`
- Form grid: 2-column on desktop, 1-column on mobile.

## Visual Design System

### Theme System
- Support light + dark modes via CSS variables.
- Default to system preference.

Core tokens:
- `--bg`, `--surface`, `--surface2`
- `--text`, `--muted`
- `--border`
- `--primary`, `--primary-foreground`
- `--danger`
- `--radius`

### Typography
- Page title: 28–32
- Section title: 18–20
- Body: 14–16
- Label: 12–13
- Numeric emphasis: mono optional for totals/invoice number.

### Depth
- Prefer borders and subtle elevation.
- Avoid heavy shadows.

## Components
- Buttons: primary / outline / ghost with consistent height.
- Inputs: consistent focus ring + inline validation.
- Tables: strong header, subtle row hover.
- Cards: consistent header/body spacing.
- Dialogs: consistent confirm patterns (logout/delete).
- Toast/banners: consistent success/error style.

## Invoice Creation UX Improvements
- Keep split view but improve:
  - Sticky action bar: Save / Export PDF / Print
  - Clear saving/exporting state indicators
  - Optional preview zoom control
- Items table:
  - Better spacing and alignment
  - Keyboard-friendly navigation
- Reduced friction:
  - Smart defaults retained
  - Remember last theme/currency locally (optional)

## Dashboard UX Improvements
- Strong empty state with single CTA.
- Search bar styling and placement in topbar (optional).
- Table row actions more discoverable and consistent.

## Loading & Empty States
- Skeletons for invoices table.
- Skeletons for invoice editor (while loading invoice).
- PDF generation loading state on button.

## Accessibility
- Minimum contrast ratios for text/muted/borders.
- Visible focus outlines.
- Labels always present (not placeholder-only).
- Keyboard navigation preserved.

