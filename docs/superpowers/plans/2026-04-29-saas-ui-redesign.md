# SaaS UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign QuickInvoice UI/UX to feel like a premium SaaS while keeping existing flows (dashboard + split invoice editor + one-click PDF).

**Architecture:** Introduce app-level CSS variables for light/dark themes, polish the dashboard shell (sidebar + topbar), and refine page layouts and editor micro-interactions without changing backend behavior.

**Tech Stack:** Next.js App Router, Tailwind CSS, shadcn-style components, lucide-react icons.

---

## File Map (Planned)

**Modify**
- `src/app/globals.css` (theme tokens + light/dark vars)
- `src/app/dashboard/layout.tsx` (add topbar, improve sidebar + mobile)
- `src/app/dashboard/page.tsx` (polish table + empty state)
- `src/components/invoice/invoice-editor.tsx` (sticky action bar polish)

**Create (optional, if not existing)**
- `src/components/dashboard/topbar.tsx`
- `src/components/dashboard/sidebar-nav.tsx`

---

## Task 1: Add CSS variable theme system (light/dark)

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add base tokens**

Add CSS variables for:
- light: `--bg --surface --surface2 --text --muted --border --primary --primary-foreground --danger --radius`
- dark: same keys under `.dark`

- [ ] **Step 2: Ensure Tailwind uses variables**
- Confirm existing Tailwind config maps to CSS variables (or update globals to match existing class usage like `bg-background` etc.)

- [ ] **Step 3: Build**
```bash
npm run build
```

- [ ] **Step 4: Commit**
```bash
git add src/app/globals.css
git commit -m "feat(ui): add light/dark theme tokens"
```

---

## Task 2: Dashboard shell polish (sidebar + topbar)

**Files:**
- Modify: `src/app/dashboard/layout.tsx`
- Create: `src/components/dashboard/topbar.tsx` (if useful)
- Create: `src/components/dashboard/sidebar-nav.tsx` (if useful)

- [ ] **Step 1: Add Topbar**
- Sticky topbar with:
  - title slot
  - primary CTA “Create invoice”
  - user menu (name/email/logout)

- [ ] **Step 2: Improve Sidebar**
- Active indicator and grouped nav
- Better spacing and hover states
- Mobile: add menu trigger (if implementing drawer)

- [ ] **Step 3: Build**
```bash
npm run build
```

- [ ] **Step 4: Commit**
```bash
git add src/app/dashboard/layout.tsx src/components/dashboard
git commit -m "feat(ui): dashboard shell polish"
```

---

## Task 3: Dashboard page UX polish (table, empty, actions)

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Table refinement**
- Improve spacing, header style, row hover, action menu alignment.

- [ ] **Step 2: Empty state refinement**
- Clean hero card, single primary CTA.

- [ ] **Step 3: Build**
```bash
npm run build
```

- [ ] **Step 4: Commit**
```bash
git add src/app/dashboard/page.tsx
git commit -m "feat(ui): dashboard page polish"
```

---

## Task 4: Invoice editor UX polish (sticky actions, feedback)

**Files:**
- Modify: `src/components/invoice/invoice-editor.tsx`

- [ ] **Step 1: Sticky action bar**
- Keep Save / Print / PDF but make the bar sticky with better spacing and clear state labels.

- [ ] **Step 2: Feedback states**
- Standardize inline banner styling and add “Saved” micro-state.

- [ ] **Step 3: Build**
```bash
npm run build
```

- [ ] **Step 4: Commit**
```bash
git add src/components/invoice/invoice-editor.tsx
git commit -m "feat(ui): invoice editor polish"
```

---

## Task 5: Final verification + push

- [ ] Run build
```bash
npm run build
```

- [ ] Push to GitHub
```bash
git push origin main
```

