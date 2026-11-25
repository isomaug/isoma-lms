# Isoma LMS — Portal Design System Specification

Extracted from the reference portal layout (`PDPO Business Dashboard`), adapted to **Isoma Royal Blue** (`#004880`). All typography, spacing, borders, shadows, and responsive breakpoints are preserved verbatim so `learn.isomaug.com` and institutional `*.isomaug.com` portals share a crisp, compact, high-trust UI.

---

## 1. Brand Color Tokens (Isoma Royal Blue)

```css
@theme {
  --font-sans: "Montserrat", ui-sans-serif, system-ui, sans-serif;

  /* Isoma Royal Blue Primary Scale */
  --color-primary: #004880;
  --color-primary-hover: #00325c;
  --color-primary-foreground: #ffffff;
  --color-secondary: #1e293b;

  /* Surfaces & Neutrals */
  --color-neutral-light: #f9fafb; /* bg-gray-50 */
  --color-dark: #111827;          /* text-gray-900 */
  --color-surface: #ffffff;
  --color-border-subtle: #f3f4f6; /* border-gray-100 */
  --color-border-card: #e5e7eb;   /* border-gray-200 */

  /* Semantic Status */
  --color-highlight: #00b0c8;
  --color-success: #59a219;
  --color-warning: #fdc400;
  --color-destructive: #ef4444;   /* red-500 / red-50 hover */
}
```

### Primary Tint Opacities Used
- `bg-primary/5` — Sidebar organisation/tenant header & contact info strip
- `bg-primary/10` — Active sidebar nav item & card icon badges
- `border-primary/20` — Active sidebar nav border
- `border-primary/40` — Card hover border accent
- `shadow-primary/5` — Card hover elevation tint
- `bg-primary/[0.04]`, `bg-primary/[0.03]`, `bg-primary/[0.025]` — Subtle decorative background orbs inside hero/card surfaces
- `from-primary via-primary/60 to-primary` — Top 4px (`h-1`) surface accent bar

---

## 2. Typography Scale (`Montserrat`)

| Element | Tailwind Classes | Size / Weight |
| :--- | :--- | :--- |
| Root Font | `font-montserrat text-dark bg-neutral-light` | Montserrat |
| Hero Title (`h1`) | `text-lg md:text-2xl font-bold text-gray-900 tracking-tight` | 18px → 24px / 700 |
| Hero Subtitle | `text-sm md:text-base text-gray-500 mt-1.5` | 14px → 16px / 400 |
| Card Title (`h2`) | `text-base font-semibold text-gray-900 mb-1.5` | 16px / 600 |
| Card Description | `text-sm text-gray-500 leading-relaxed` | 14px / 400 |
| Primary CTA Button | `text-sm font-medium text-white` | 14px / 500 |
| Sidebar Portal Name | `text-sm font-semibold text-gray-800 leading-tight` | 14px / 600 |
| Sidebar Org / School Name | `text-xs font-semibold text-gray-800 truncate leading-tight` | 12px / 600 |
| Sidebar Avatar Initials | `text-xs font-bold text-white` | 12px / 700 |
| Sidebar Contact Primary | `text-sm font-semibold text-secondary truncate` | 14px / 600 |
| Sidebar Contact Email | `text-[11px] text-secondary truncate` | 11px / 400 |
| Sidebar Section Label | `text-[10px] font-bold text-gray-400 uppercase tracking-widest` | 10px / 700 |
| Sidebar Nav Item | `text-xs font-medium` (icon `text-[11px] w-3.5`) | 12px / 500 |
| Footer Meta / Trust Line | `text-sm text-gray-400` (lock icon `text-[10px]`) | 14px / 400 |

---

## 3. Layout, Margins, Padding & Responsive Breakpoints

Breakpoints follow Tailwind defaults:
- **Mobile**: `< 640px`
- **`sm:`**: `≥ 640px`
- **`md:`**: `≥ 768px`
- **`lg:`**: `≥ 1024px` (sidebar transitions from slide-over drawer to fixed `w-64` left rail)

### App Shell
- **Viewport Frame**: `flex h-dvh overflow-hidden bg-gray-50`
- **Sidebar (`<aside>`)**:
  - Dimensions: `fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 shadow-sm z-50 flex flex-col`
  - Responsive drawer: `transition-transform duration-300 -translate-x-full lg:translate-x-0`
  - Brand header bar: `px-4 h-14 border-b border-gray-100 shrink-0` (logo `h-9 w-9`, mobile close button `lg:hidden w-9 h-9 rounded-lg`)
  - Tenant / User profile blocks: `px-3 py-3 bg-primary/5 border-b border-gray-100` (avatar `w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70`)
  - Nav container: `flex-1 px-3 py-3 space-y-0.5 overflow-y-auto`
  - Nav item: `flex items-center w-full gap-2.5 px-3 py-2 text-xs rounded-lg font-medium transition-all`
    - Active: `bg-primary/10 text-primary border border-primary/20` + right chevron (`ml-auto text-[10px] text-primary/60`)
    - Inactive: `text-gray-600 hover:bg-gray-50 hover:text-primary`
  - Footer sections (Support & Sign Out): `px-3 py-3 border-t border-gray-100`
- **Main Column**:
  - Wrapper: `flex flex-col flex-1 lg:ml-64 min-h-0 overflow-y-auto overscroll-y-contain`
  - Sticky Top Bar (`<header>`): `bg-white border-b border-gray-200 sticky top-0 z-30 h-14 shrink-0 lg:h-auto` with inner `px-4 lg:px-6` (mobile hamburger `lg:hidden w-10 h-10 rounded-lg`, desktop height `h-14`)
  - Page Canvas (`<main>`): `flex-1 min-h-0` → `min-h-screen bg-gray-50 p-3 sm:p-4` → `w-full mx-auto space-y-3 sm:space-y-4` → `p-1 admin-compact-root`

### Hero / Main Surface Card
- Container: `relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`
- Top accent stripe: `absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-primary`
- Ambient orbs: `w-64 h-64` (`-top-24 -right-24`), `w-72 h-72` (`top-32 -left-28`), `w-80 h-80` (`-bottom-36 right-1/4`)
- Header padding: `px-6 pt-10 pb-8 md:pt-12 md:pb-10 text-center`
- Logo container: `inline-flex items-center justify-center h-16 md:h-20 mb-4 bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-2.5`
- Divider: `mx-auto mt-6 h-px w-40 bg-gradient-to-r from-transparent via-primary/30 to-transparent`

### Feature / Action Cards Grid
- Section padding: `px-5 pb-8 md:px-10 md:pb-10`
- Grid: `grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5`
- Card: `group relative rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm p-5 md:p-6 flex flex-col overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5`
  - Hover top hairline: `absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`
  - Icon box: `w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center transition-colors duration-300 group-hover:bg-primary` (icon transitions `text-primary` → `group-hover:text-white`)
  - Button: `mt-5 w-full bg-primary text-white font-medium py-2.5 px-6 rounded-lg hover:bg-primary/90 transition-all text-sm active:scale-[0.98] touch-manipulation inline-flex items-center justify-center gap-2`
- Footer trust bar:
  - Divider: `mx-auto mt-8 h-px w-full max-w-md bg-gradient-to-r from-transparent via-gray-200 to-transparent`
  - Row: `mt-5 flex flex-col md:flex-row items-center justify-center gap-1.5 text-sm text-gray-400`
