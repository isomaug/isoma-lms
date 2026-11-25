# Isoma LMS - Portal Design System Specification

Reproduces the reference Organisation Portal dashboard layout (`PDPO Business Dashboard`), adapted to **Isoma Royal Blue (`#004880`)** everywhere. All typography, spacing, borders, shadows, and responsive breakpoints are preserved verbatim so `learn.isomaug.com` and institutional `*.isomaug.com` portals share a crisp, compact, high-trust UI.

---

## 1. Brand Color Tokens (Isoma Royal Blue)

```css
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap");

@theme {
  --font-montserrat: "Montserrat", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "Montserrat", ui-sans-serif, system-ui, sans-serif;

  /* Isoma Royal Blue Primary Scale */
  --color-primary: #004880;
  --color-primary-hover: #00325c;
  --color-primary-foreground: #ffffff;

  /* Exact Reference Neutrals */
  --color-secondary: #323636;
  --color-dark: #333333;
  --color-neutral-light: #f8f8f8;
  --color-neutral-medium: #ededed;

  /* Semantic Status */
  --color-highlight: #00b0c8;
  --color-success: #22c55e;
  --color-warning: #fdc400;
  --color-destructive: #fb2c36;
}
```

### Primary Tint Opacities
| Tint | Isoma `rgba` | Usage |
| :--- | :--- | :--- |
| `2.5%` | `rgba(0, 72, 128, 0.025)` | Decorative circle 3 |
| `3%` | `rgba(0, 72, 128, 0.03)` | Decorative circle 2 |
| `4%` | `rgba(0, 72, 128, 0.04)` | Decorative circle 1 & card corner orb |
| `5%` | `rgba(0, 72, 128, 0.05)` | Sidebar org/contact block background, card hover shadow tint |
| `10%` | `rgba(0, 72, 128, 0.10)` | Active nav background, icon box |
| `20%` | `rgba(0, 72, 128, 0.20)` | Active nav border |
| `30%` | `rgba(0, 72, 128, 0.30)` | Hero divider centre |
| `40%` | `rgba(0, 72, 128, 0.40)` | Card border on hover, focus-visible ring |
| `60%` | `rgba(0, 72, 128, 0.60)` | Active nav chevron, top gradient mid |
| `70%` | `rgba(0, 72, 128, 0.70)` | Avatar gradient end |
| `90%` | `rgba(0, 72, 128, 0.90)` | Button hover (alt to `#00325c`) |

### Radius & Shadows
- **Radius**: `8px` (`rounded-lg`: buttons, nav items) · `12px` (`rounded-xl`: cards, icon boxes) · `16px` (`rounded-2xl`: hero card, logo tile) · `9999px` (`rounded-full`: avatar).
- **Shadows**:
  - `shadow-sm`: `0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a`
  - `shadow-lg`: `0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a` (tinted with `shadow-primary/5` on card hover)

---

## 2. Typography Scale (`Montserrat`)

- Font: **Montserrat** (Google Fonts, 400–700), stack `"Montserrat", sans-serif`.
- Body default: `16px / 1.5`, color `#323636`.

| Element | Tailwind Classes | Size / Weight / Line-Height |
| :--- | :--- | :--- |
| Hero Title (`h1`) | `text-lg md:text-2xl font-bold text-gray-900 tracking-tight` | 18px → 24px / 700 / 28px → 32px |
| Hero Subtitle | `text-sm md:text-base text-gray-500 mt-1.5` | 14px → 16px / 400 |
| Card Title (`h2`) | `text-base font-semibold text-gray-900 mb-1.5` | 16px / 600 / 24px |
| Card Description | `text-sm text-gray-500 leading-relaxed` | 14px / 400 / 1.625 |
| Primary CTA Button | `text-sm font-medium text-white` | 14px / 500 / 20px |
| Sidebar Portal Label | `text-sm font-semibold text-gray-800 leading-tight` | 14px / 600 / 1.25 |
| Sidebar Org / School Name | `text-xs font-semibold text-gray-800 truncate leading-tight` | 12px / 600 |
| Sidebar Avatar Initials | `text-xs font-bold text-white` | 12px / 700 |
| Sidebar Contact Primary | `text-sm font-semibold text-secondary truncate` | 14px / 600 |
| Sidebar Contact Email | `text-[11px] text-secondary truncate` | 11px / 400 |
| Sidebar "MENU" Label | `text-[10px] font-bold text-gray-400 uppercase tracking-widest` | 10px / 700 / tracking `0.1em` |
| Sidebar Nav Item | `text-xs font-medium` (icon `text-[11px] w-3.5`) | 12px / 500 / 16px |
| Footer Meta / Trust Line | `text-sm text-gray-400` (lock icon `text-[10px]`) | 14px / 400 |

---

## 3. Layout, Spacing & Responsive Breakpoints

### App Shell
- **Root**: `font-montserrat text-dark bg-neutral-light`, inner `flex h-dvh overflow-hidden bg-gray-50`.
- **Sidebar (`<aside>`)**:
  - `fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 shadow-sm flex flex-col -translate-x-full lg:translate-x-0 transition-transform duration-300`
  - Top brand bar: `px-4 h-14 border-b border-gray-100 shrink-0` (logo `36×36`, `10px` gap, mobile close `lg:hidden w-9 h-9 rounded-lg`)
  - Org & Contact blocks: `px-3 py-3 bg-primary/5 border-b border-gray-100` (avatar `32px` circle `bg-gradient-to-br from-primary to-primary/70`)
  - Nav: `flex-1 px-3 py-3 space-y-0.5 overflow-y-auto`
    - Active: `bg-primary/10 text-primary border border-primary/20` + right chevron (`ml-auto text-[10px] text-primary/60`)
    - Inactive: `text-gray-600 hover:bg-gray-50 hover:text-primary`
  - Bottom blocks: Support (`hover:bg-primary/10 hover:text-primary`) & Sign Out (`hover:bg-red-50 hover:text-red-500`), each `px-3 py-3 border-t border-gray-100`.
- **Content Column**: `flex flex-col flex-1 lg:ml-64 min-h-0 overflow-y-auto overscroll-y-contain`.
- **Sticky Header**: `bg-white border-b border-gray-200 sticky top-0 z-30 h-14 shrink-0`, inner `px-4 lg:px-6` (mobile hamburger `lg:hidden w-10 h-10 rounded-lg`).
- **Main**: `min-h-screen bg-gray-50 p-3 sm:p-4`, stack `w-full mx-auto space-y-3 sm:space-y-4`, compact inner `p-1`.

### Hero Card & Action Cards Grid
- **Hero card**: `relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100`, top `h-1` gradient strip (`from-primary via-primary/60 to-primary`), 3 ambient corner orbs (`256px`, `288px`, `320px`).
- **Action cards**: `grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5`, each `group relative overflow-hidden flex flex-col rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm p-5 md:p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300`.
  - Icon box: `w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300`.
  - Primary CTA button: `mt-5 w-full inline-flex items-center justify-center gap-2 bg-primary text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-primary-hover active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 transition-all`.

### Split-Screen Login Page
- **Left panel (`lg:flex`)**: solid `#004880` (`bg-primary`) background, white brand illustration/visual, headline, supporting copy, 3 slide indicator dots, and white outline "Back to Open Academy" button.
- **Right panel**: white surface with centered logo tile, `Sign in` H1, subtitle, Email & Password fields (with `Reset password` link and password visibility eye toggle), full-width `#004880` (`hover:#00325c`) Sign in button, and Register link.

### Breakpoints, Motion & Print
| Width | Behaviour |
| :--- | :--- |
| `≥1024px` (`lg`) | Fixed `256px` sidebar, `ml-64` content, `24px` header padding, 2-column card grid |
| `<1024px` | Off-canvas drawer sidebar with backdrop + `X` button, hamburger in header, 1-column cards |
| `≥768px` (`md`) | `24px` H1, `16px` subtitle, expanded hero/card padding, horizontal footer trust row |
| `<768px` | `18px` H1, tighter padding, stacked footer row (separator `·` hidden) |
| `<640px` | `12px` main padding + `env(safe-area-inset-*)` support |
| `≤380px` | `32px` top/bottom page padding |

- Respect `@media (prefers-reduced-motion: reduce)` (disable slide/scale transitions).
- Print styles (`@media print`): hide `<aside>` and `<header>`, remove left margin.
