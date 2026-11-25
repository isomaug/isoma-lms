# Isoma LMS Workspace Rules

## Punctuation Rule
- **NEVER use the em-dash character** (Unicode U+2014) in any code, UI copy, comments, documentation, or responses. Always use a standard hyphen `-` instead.

## UI & Branding Rules
- Primary brand color is **Isoma Royal Blue** (`#004880`, hover `#00325c`) with **Montserrat** typography.
- Use `customToast` from `src/components/GlobalPopup` for all user notifications and status alerts.
- Prefer solid white card surfaces (`bg-white`) and clean bold text/icons rather than translucent/tinted pill backgrounds.
- Always use `UniversalSelect` (from `@/components/ui/UniversalSelect`) for all single-select and multi-select dropdowns instead of native `<select>`.
- Use Title Case (capital first letter, never all-caps `uppercase`) on table column headers.
- Keep management/onboarding pages single-column (`space-y-4`) with NO in-page chevron accordions; put sub-actions as expandable sub-buttons under their main sidebar button, each opening its own dedicated clean page.
- Do not place book icons on curriculum names, and keep read-only Assigned Curricula blocks compact (2 lines).
- For ECD/Nursery, Primary, Secondary, and K-12 tiers (`NURSERY`, `PRIMARY`, `SECONDARY`, `COMPREHENSIVE_K12`), always use **Subject / Subjects** instead of Course / Courses.
- Custom Domain & TLS Engine is strictly **Landlord ERP Super Admin only**.
- **Zero Horizontal Scroll Rule**: Never allow horizontal scrollbars on any screen (Desktop, Tablet, Mobile, or Watch). Always use `table-layout: fixed`, truncate cells (`truncate`), scale font size cleanly to fit the line, hide secondary columns on narrower viewports, and put extra info & actions inside a 3-dot (`MoreHorizontal`) `DropdownMenu`.
