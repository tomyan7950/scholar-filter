# Scholar Journal Filter

A Chrome extension that filters Google Scholar search results by journal. Highlight, dim, or hide results based on a customizable journal list — so you only see papers from outlets relevant to your field.

Built for academic researchers who are tired of scrolling past transportation, engineering, and math papers when searching for management or psychology research.

## Features

- **Three display modes**: Highlight matching journals (green border), dim non-matching results, or hide them entirely
- **Whitelist or blacklist**: Show only target journals, or exclude specific ones
- **49 pre-loaded journals**: Ships with a default list covering management, psychology, sociology, reviews, and general science outlets
- **Customizable journal list**: Add, remove, or edit journals and their aliases through the options page
- **Reset to defaults**: One-click button to restore the built-in journal list
- **Right-click to add**: Right-click any Scholar result to instantly add its journal to your list
- **Non-journal item control**: Separately show, dim, or hide books, theses, and working papers
- **Highly Cited badge**: Optional gold "Highly Cited" badge on papers above a configurable citation threshold (default 500). Papers not in your journal list but highly cited stay visible instead of being dimmed or hidden — so you never miss important work outside your filtered journals
- **Paper selection and export**: Select individual papers with checkboxes, then export to Excel (.xml format, opens directly in Excel)
- **Abstract retrieval**: Optionally fetch full abstracts from OpenAlex (free, no API key needed)
- **Works across Scholar domains**: Supports 34 Google Scholar country domains (.com, .co.uk, .de, etc.)

## Installation

Since this extension is not yet on the Chrome Web Store, you need to load it manually. This takes about 60 seconds.

### Step 1: Download

1. On this GitHub page, click the green **Code** button near the top
2. Click **Download ZIP**
3. Unzip the downloaded file to a folder you'll keep (e.g., `Documents/scholar-filter`)

### Step 2: Load in Chrome

1. Open Chrome and go to `chrome://extensions` (type it in the address bar)
2. In the top-right corner, toggle **Developer mode** ON
3. Click **Load unpacked** (top-left)
4. Select the folder you unzipped in Step 1 (the one containing `manifest.json`)
5. The extension icon should appear in your Chrome toolbar

### Step 3: Verify

1. Go to [Google Scholar](https://scholar.google.com) and run any search
2. You should see green borders on results from journals in the default list
3. Click the extension icon to see the popup with filtering controls

## How to Use

### Filtering Modes

Click the extension icon in your toolbar to open the popup:

- **Highlight** (default): Matching journals get a green left border. Everything else stays visible.
- **Dim**: Non-matching results fade to 50% opacity. Hover to read them.
- **Hide**: Non-matching results are removed from view entirely.

### Whitelist vs. Blacklist

- **Whitelist** (default): Only journals on your list are highlighted/kept. Everything else is dimmed or hidden.
- **Blacklist**: Journals on your list are dimmed or hidden. Everything else stays.

### Non-Journal Items

Books, theses, working papers, and patents often don't have a recognizable journal name. You can independently choose to **show**, **dim**, or **hide** these items.

### Adding Journals

**Option A — Right-click**: Right-click any search result on Google Scholar. If the extension detected a journal name, you'll see "Add [Journal Name] to filter list" in the context menu. One click adds it.

**Option B — Options page**: Click the extension icon, then click **Manage journal list** to open the full options page. Here you can:
- Add journals manually (with aliases)
- Edit existing journal names and aliases
- Delete journals
- Search/filter your list
- Import or export your list as JSON (for sharing or backup)
- Reset to the default list

### Aliases

Google Scholar abbreviates journal names inconsistently. For example, "Journal of Applied Psychology" might appear as "J Appl Psychol" or "J. Appl. Psychol." in different results. Aliases let the extension recognize all these variations.

Each journal in your list can have multiple aliases. The default list includes common abbreviations, but you can add more through the options page if you notice a journal not being matched.

### Selecting and Exporting Papers

1. **Select papers**: Check the checkbox that appears to the left of each search result
2. **Navigate pages**: Your selections persist as you move between Scholar pages
3. **Select all matched**: Click "Select all matched" in the bottom toolbar to check every highlighted result on the current page
4. **Export**: Click **Export Excel** to download an Excel-compatible XML file with title, authors, journal, year, citation count, and PDF availability
5. **Get abstracts**: Click **Get Abstracts (OpenAlex)** to enrich the export with full abstracts, DOIs, and URLs via the free OpenAlex API. This makes one API call per paper and takes a few seconds.

### Highly Cited Badge

This optional feature highlights papers with high citation counts, regardless of whether their journal is in your list. Toggle it on in the popup and set your preferred citation threshold (default: 500).

When enabled:
- **Matched journal + highly cited**: Green border and gold "Highly Cited" badge
- **Not in your list + highly cited**: No green border, but the paper stays visible with the badge — overriding dim or hide mode
- **Not highly cited**: Normal filtering behavior applies

This is useful for catching influential papers published in journals outside your usual filter list.

### Default Journal List

The extension ships with 49 journals across six categories:

| Category | Journals |
|----------|----------|
| Management — Strategy & General | AMJ, AMR, ASQ, SMJ, Management Science, Organization Science, JOM, JMS, JIBS |
| Management — OB/HR/Micro | JAP, OBHDP, Personnel Psychology, JOB, HRM, Leadership Quarterly, ROB, OPR, JBV, JBE, Human Relations, Organization Studies |
| Psychology — General & Social | Psychological Bulletin, Psychological Review, JPSP, Psychological Science, JEP: General, American Psychologist, PPS, JESP, PSPB, PSPR |
| Sociology | ASR, AJS, Social Forces, Social Networks, Annual Review of Sociology, European Sociological Review |
| Reviews & Annual Reviews | Annual Review of Psychology, AROPOB, Academy of Management Annals, RPHRM, IRIOP |
| General Science | Nature, Science, Nature Human Behaviour, Nature Communications, PNAS, Science Advances |

You can customize this list at any time through the options page.

## Troubleshooting

**No results are highlighted**: Your journal list might not include the journals on the current page. Click the extension icon to see how many results matched. Try switching to a broader search or adding more journals.

**Extension doesn't activate**: Make sure you're on a Google Scholar search results page (not a profile page or the homepage). The extension only runs on pages with search results.

**"All results filtered" banner**: When using Hide mode with a whitelist, if no results on the page match your journals, the extension automatically switches to Dim mode and shows a banner. This prevents showing an empty page.

**Journal not being recognized**: Scholar may use an abbreviation not in your alias list. Right-click the result to see what name Scholar is using, then add it as an alias in the options page.

## Privacy

- The extension runs entirely in your browser. No data is sent anywhere except when you explicitly click "Get Abstracts (OpenAlex)."
- OpenAlex is a free, open scholarly database. Abstract lookups are anonymous API calls — no account or API key is required.
- The extension does not track usage, collect analytics, or phone home.

## Changelog

### v0.3 — 2026-03-17
- **Highly Cited badge**: Optional gold badge on papers above a configurable citation threshold (default 500). Highly cited papers stay visible even if their journal isn't in your list.
- **Reset to Defaults**: One-click button on the options page to restore the built-in journal list
- **Export format**: Changed from .xls to .xml — opens directly in Excel with no format warning
- **Bug fixes**: Edit mode no longer breaks the active toggle column; editing an inactive journal no longer reactivates it; fixed a self-XSS in the search filter

### v0.2 — 2026-03-16
- Active/inactive toggles per journal
- Bulk delete inactive journals
- Alphabetical sorting
- Bulk add (multiple journals at once)

### v0.1 — 2026-03-16
- Initial release with highlight/dim/hide filtering, whitelist/blacklist modes, 50 pre-loaded journals, right-click to add, paper selection and export, OpenAlex abstract retrieval

## License

MIT
