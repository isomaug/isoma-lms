# Isoma LMS Workspace Rules

## Punctuation Rule
- **NEVER use the em-dash character** (Unicode U+2014) in any code, UI copy, comments, documentation, or responses. Always use a standard hyphen `-` instead.

## UI & Branding Rules
- Primary brand color is **Isoma Royal Blue** (`#004880`, hover `#00325c`) with **Montserrat** typography.
- Use `customToast` from `src/components/GlobalPopup` for all user notifications and status alerts.
- Prefer solid white card surfaces (`bg-white`) and clean bold text/icons rather than translucent/tinted pill backgrounds.
- Always use `UniversalSelect` (from `@/components/ui/UniversalSelect`) for all single-select and multi-select dropdowns instead of native `<select>`.
- Use Title Case (capital first letter, never all-caps `uppercase`) on table column headers.
