# Scholar Journal Filter

Chrome extension that filters Google Scholar search results and author profile pages by journal.

## Architecture

- **Manifest V3** Chrome extension — no frameworks, no dependencies
- `content-script.js` — Core filtering logic. Detects page type (`isProfilePage` constant), extracts journal names from DOM, matches against user's journal list, applies visual classes
- `defaults.js` — Ships 82 journals across 6 categories (Management, Psychology, Sociology, Reviews, General Science, FT 50)
- `background.js` — Service worker for context menu and OpenAlex API proxy
- `popup.*` — Quick controls (enable/disable, display mode, filter mode, highly cited toggle)
- `options.*` — Full journal list management (add/edit/delete, aliases, categories, bulk operations)
- `content-style.css` — All visual filtering styles, scoped per page type (`.gs_r` for search, `tr.gsc_a_tr` for profiles)

## Key Design Decisions

- **Page-type branching**: `isProfilePage` is a module-level constant computed once. All DOM-touching functions branch on it. The matching engine (`normalize`, `matchesJournal`, `resolveJournalName`) is shared — only extraction differs.
- **MutationObserver must disconnect during filtering**: Badge injection and class changes mutate the observed container. Observer disconnects before `_applyFiltering()` and reconnects after, preventing infinite loops.
- **Pre-loaded journals on first install**: 5 core categories (excluding FT 50) load automatically. FT 50 available via Reset to Defaults.

## Project Structure

```
/                   Extension files (everything here ships in the zip)
/_dev               Non-shipping files:
  /Screen shot      Chrome Web Store screenshots
  /tasks            Session handoff, lessons
  store-listing.txt Chrome Web Store description
  email-draft.txt   Colleague outreach template
  *.html            Design prototypes
```

## Current State

- **Version**: 1.1.0
- **Chrome Web Store**: Submitted for review (2026-03-18)
- **GitHub**: master branch, last pushed commit 74df47b (pre-1.1.0 changes not yet committed)
- v1.1.0 adds profile page filtering (`/citations?user=...`) — search results filtering unchanged

## Dev Workflow

- Load unpacked from this directory in `chrome://extensions`
- After changes: click reload on the extensions page, then refresh the Scholar tab
- To build for store: select all root files (excluding `_dev`, `.git`, `.claude`), zip, upload to Chrome Web Store developer dashboard
