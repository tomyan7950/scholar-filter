# Scholar Journal Filter

A Chrome extension that filters Google Scholar search results by journal. Highlight, dim, or hide results based on a customizable journal list — so you only see papers from outlets relevant to your field.

## Features

- **Pre-loaded journal list**: Ships with a curated default list covering management, psychology, sociology, reviews, and general science outlets
- **Customizable journal list**: Add, edit, or remove journals and aliases through the options page or right-click any Scholar result to add its journal instantly
- **Display modes**: Highlight matching journals (green border), dim non-matching results, or hide them entirely. Whitelist or blacklist. Non-journal items (books, theses, working papers) can be independently shown, dimmed, or hidden
- **Highly Cited badge**: Optional gold badge on papers above a configurable citation threshold (default 500). Papers not in your journal list but highly cited stay visible instead of being dimmed or hidden — so you never miss important work outside your filtered journals
- **Batch export for literature review**: Select papers with checkboxes across multiple pages, then export to Excel with title, authors, journal, year, and citation count. Optionally enrich with full abstracts and DOIs via OpenAlex (free, no API key)

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

**Option A — Options page**: Click the extension icon, then click **Manage journal list** to open the full options page. Here you can:
- Add journals manually (with aliases)
- Edit existing journal names and aliases
- Delete journals
- Search/filter your list
- Reset to the default list

**Option B — Right-click**: Right-click any search result on Google Scholar. If the extension detected a journal name, you'll see "Add [Journal Name] to filter list" in the context menu. One click adds it.

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

The extension ships with 82 journals across six categories, selectable at first run:

| Category | Journals |
|----------|----------|
| Management — Micro & Macro | Academy of Management Journal, Academy of Management Review, Administrative Science Quarterly, Strategic Management Journal, Management Science, Organization Science, Journal of Management, Journal of Management Studies, Journal of International Business Studies, Journal of Applied Psychology, Organizational Behavior and Human Decision Processes, Personnel Psychology, Journal of Organizational Behavior, Human Resource Management, The Leadership Quarterly, Research in Organizational Behavior, Organizational Psychology Review, Journal of Business Venturing, Journal of Business Ethics, Human Relations, Organization Studies |
| Psychology | Psychological Bulletin, Psychological Review, Journal of Personality and Social Psychology, Psychological Science, Journal of Experimental Psychology: General, American Psychologist, Perspectives on Psychological Science, Journal of Experimental Social Psychology, Personality and Social Psychology Bulletin, Personality and Social Psychology Review |
| Sociology | American Sociological Review, American Journal of Sociology, Social Forces, Social Networks, Annual Review of Sociology, European Sociological Review |
| Reviews & Annual Reviews | Annual Review of Psychology, Annual Review of Organizational Psychology and Organizational Behavior, Academy of Management Annals, Research in Personnel and Human Resources Management, International Review of Industrial and Organizational Psychology |
| General Science | Nature, Science, Nature Human Behaviour, Nature Communications, Proceedings of the National Academy of Sciences, Science Advances |
| FT 50 (Additional) | Accounting Organizations and Society, American Economic Review, Contemporary Accounting Research, Econometrica, Entrepreneurship Theory and Practice, Harvard Business Review, Information Systems Research, Journal of Accounting and Economics, Journal of Accounting Research, Journal of Consumer Psychology, Journal of Consumer Research, Journal of Finance, Journal of Financial and Quantitative Analysis, Journal of Financial Economics, Journal of Management Information Systems, Journal of Marketing, Journal of Marketing Research, Journal of Operations Management, Journal of Political Economy, Journal of the Academy of Marketing Science, Manufacturing and Service Operations Management, Marketing Science, MIS Quarterly, Operations Research, Production and Operations Management, Quarterly Journal of Economics, Research Policy, Review of Accounting Studies, Review of Economic Studies, Review of Finance, Review of Financial Studies, Sloan Management Review, Strategic Entrepreneurship Journal, The Accounting Review |

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

### v0.4 — 2026-03-17
- **Category picker**: First-run and "Reset to Defaults" now show a category selection modal — choose which journal groups to load instead of getting everything
- **FT 50 journals**: Added 34 Financial Times top 50 journals as a selectable category
- **Deactivate All**: New button to deactivate all journals at once, then selectively delete via "Delete Inactive"
- Management categories merged into "Management — Micro & Macro"

### v0.3 — 2026-03-17
- **Highly Cited badge**: Optional gold badge on papers above a configurable citation threshold (default 500). Highly cited papers stay visible even if their journal isn't in your list.
- **Reset to Defaults**: One-click button on the options page to restore the built-in journal list
- **Export format**: Changed from .xls to .xml — opens directly in Excel with no format warning
- **Bug fixes**: Edit mode no longer breaks the active toggle column; editing an inactive journal no longer reactivates it

### v0.2 — 2026-03-16
- Active/inactive toggles per journal
- Bulk delete inactive journals
- Alphabetical sorting
- Bulk add (multiple journals at once)

### v0.1 — 2026-03-16
- Initial release with highlight/dim/hide filtering, whitelist/blacklist modes, 50 pre-loaded journals, right-click to add, paper selection and export, OpenAlex abstract retrieval

## License

MIT
