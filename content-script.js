// Scholar Journal Filter — Content Script
// Parses Google Scholar results, matches journals, applies visual filtering.

(function () {
  "use strict";

  // ── State ──────────────────────────────────────────────────────────
  let settings = {
    enabled: true,
    filterMode: "whitelist",
    displayMode: "highlight",
    nonJournalItems: "show",
    journals: [],
    highlyCitedEnabled: false,
    highlyCitedThreshold: 500,
  };

  let filterStats = { total: 0, matched: 0, nonJournal: 0, highlyCited: 0 };
  let isFiltering = false;

  // ── Journal Extraction ─────────────────────────────────────────────
  // Scholar .gs_a line formats:
  //   Article: "Smith, J., Williams, K. - Organization Science, 2023 - Sage"
  //   Book:    "SM Author - 2019 - books.google.com"
  //   Thesis:  "Author - 2021 - etd.library.university.edu"
  //   Hyphenated: "J-P Bonardi, GD Hillman - Academy of Management Review, 2005 - JSTOR"
  //
  // Strategy: split on " - " (space-dash-space), take second-to-last segment,
  // strip trailing year. This avoids breaking on hyphenated names.

  function extractJournal(gsaElement) {
    if (!gsaElement) return null;

    const text = gsaElement.textContent.trim();
    if (!text) return null;

    // Split on space-dash-space, handling ASCII hyphen, en-dash, and em-dash.
    // Scholar's textContent can use any of these depending on locale/rendering.
    const segments = text.split(/\s+[-\u2010\u2011\u2012\u2013\u2014\u2015]\s+/);
    if (segments.length < 2) return null;

    // Second-to-last segment contains journal + year (or just year for books)
    let journalSegment;
    if (segments.length === 2) {
      // Two-segment entries are rarely journal articles. Standard articles have 3+ segments:
      // "Author - Journal, Year - Publisher". Only treat as journal if the segment
      // contains a comma+year pattern (e.g., "Journal Name, 2020").
      if (/,\s*\d{4}\s*$/.test(segments[1])) {
        journalSegment = segments[1];
      } else {
        return null;
      }
    } else {
      journalSegment = segments[segments.length - 2];
    }

    // Strip trailing year pattern: ", 2023" or just "2023"
    // Scholar may also insert ellipsis before the year: "Journal of applied …, 2012"
    let journal = journalSegment.replace(/,?\s*\d{4}\s*$/, "").trim();

    // If nothing left after stripping year, this is a non-journal item (book/thesis)
    if (!journal) return null;

    // If it looks like a URL or domain, it's not a journal
    if (/^(https?:|www\.|.*\.(com|org|edu|net|gov|io))/.test(journal)) return null;

    // If it's purely numeric, it's not a journal
    if (/^\d+$/.test(journal)) return null;

    return journal;
  }

  // ── Journal Matching ───────────────────────────────────────────────
  // Normalize: lowercase, strip periods, strip ellipsis, collapse whitespace
  function normalize(str) {
    return str.toLowerCase().replace(/\./g, "").replace(/[\u2026…]/g, "").replace(/\s+/g, " ").trim();
  }

  // Check if a truncated name (Scholar uses "…") matches a full name.
  // E.g., "journal of applied" should match "journal of applied psychology"
  // when the extracted text was "Journal of applied …"
  function startsWithMatch(normalizedExtracted, normalizedFull) {
    if (normalizedFull.startsWith(normalizedExtracted)) return true;
    // Also check if extracted starts with full (extracted could be longer with volume info)
    if (normalizedExtracted.startsWith(normalizedFull)) return true;
    return false;
  }

  function matchesJournal(extractedName, journalList) {
    if (!extractedName) return false;
    const normalizedExtracted = normalize(extractedName);
    // Detect if Scholar truncated this name (contained "…" before normalization)
    const wasTruncated = /[\u2026…]/.test(extractedName);

    for (const journal of journalList) {
      const normalizedName = normalize(journal.name);
      // Exact match on full name
      if (normalizedName === normalizedExtracted) return true;
      // If truncated, check prefix match (extracted is a prefix of stored name)
      if (wasTruncated && normalizedExtracted.length >= 10 && startsWithMatch(normalizedExtracted, normalizedName)) return true;

      // Check aliases
      if (journal.aliases) {
        for (const alias of journal.aliases) {
          const normalizedAlias = normalize(alias);
          // Exact match on alias
          if (normalizedAlias === normalizedExtracted) return true;
          // If truncated, check prefix match against alias too
          if (wasTruncated && normalizedExtracted.length >= 10 && startsWithMatch(normalizedExtracted, normalizedAlias)) return true;
          // Substring match only for aliases >= 10 chars (long enough to be unambiguous)
          if (normalizedAlias.length >= 10 && normalizedExtracted.includes(normalizedAlias)) return true;
        }
      }
    }
    return false;
  }

  // Return the canonical journal name from the list, or the original if no match
  function resolveJournalName(extractedName, journalList) {
    if (!extractedName) return extractedName;
    const normalizedExtracted = normalize(extractedName);
    const wasTruncated = /[\u2026…]/.test(extractedName);

    for (const journal of journalList) {
      const normalizedName = normalize(journal.name);
      if (normalizedName === normalizedExtracted) return journal.name;
      if (wasTruncated && normalizedExtracted.length >= 10 && startsWithMatch(normalizedExtracted, normalizedName)) return journal.name;

      if (journal.aliases) {
        for (const alias of journal.aliases) {
          const normalizedAlias = normalize(alias);
          if (normalizedAlias === normalizedExtracted) return journal.name;
          if (wasTruncated && normalizedExtracted.length >= 10 && startsWithMatch(normalizedExtracted, normalizedAlias)) return journal.name;
          if (normalizedAlias.length >= 10 && normalizedExtracted.includes(normalizedAlias)) return journal.name;
        }
      }
    }
    return extractedName;
  }

  // ── Citation Helpers ────────────────────────────────────────────────
  function extractCitationCount(resultEl) {
    const citedByLink = resultEl.querySelector('a[href*="cites="]');
    if (!citedByLink) return 0;
    const match = citedByLink.textContent.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  function removeHighlyCitedBadges() {
    document.querySelectorAll(".sjf-highly-cited-badge").forEach((el) => el.remove());
  }

  function injectHighlyCitedBadge(resultEl) {
    if (resultEl.querySelector(".sjf-highly-cited-badge")) return;
    const gsaEl = resultEl.querySelector(".gs_a");
    if (!gsaEl) return;
    const badge = document.createElement("span");
    badge.className = "sjf-highly-cited-badge";
    badge.textContent = "Highly Cited";
    gsaEl.appendChild(badge);
  }

  // ── DOM Filtering ──────────────────────────────────────────────────
  function clearFiltering() {
    document.querySelectorAll(".gs_r.gs_or.gs_scl, .gs_r.gs_or").forEach((el) => {
      el.classList.remove("sjf-match", "sjf-no-match", "sjf-non-journal", "sjf-dim", "sjf-hide", "sjf-highly-cited");
    });
    removeBanners();
    removeHighlyCitedBadges();
  }

  function removeBanners() {
    document.querySelectorAll(".sjf-banner").forEach((el) => el.remove());
  }

  function showBanner(message, actionText, actionFn) {
    removeBanners();
    const banner = document.createElement("div");
    banner.className = "sjf-banner";
    banner.textContent = message + " ";
    if (actionText && actionFn) {
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = actionText;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        actionFn();
      });
      banner.appendChild(link);
    }
    const container = document.getElementById("gs_res") || document.body;
    container.insertBefore(banner, container.firstChild);
  }

  function applyFiltering() {
    isFiltering = true;
    try {
      _applyFiltering();
    } finally {
      isFiltering = false;
    }
  }

  function _applyFiltering() {
    clearFiltering();

    if (!settings.enabled) return;

    const results = document.querySelectorAll(".gs_r.gs_or.gs_scl, .gs_r.gs_or");
    if (results.length === 0) {
      // Check if we're on a results page but can't find results
      if (document.querySelector("#gs_res")) {
        showBanner("Scholar Journal Filter couldn't parse this page. The extension may need an update.");
      }
      return;
    }

    filterStats = { total: results.length, matched: 0, nonJournal: 0, highlyCited: 0 };
    const activeJournals = settings.journals.filter((j) => j.enabled !== false);
    let trulyUnparseable = 0;

    results.forEach((result) => {
      const gsaEl = result.querySelector(".gs_a");
      const journal = extractJournal(gsaEl);

      // Check highly-cited status
      const citationCount = settings.highlyCitedEnabled ? extractCitationCount(result) : 0;
      const isHighlyCited = settings.highlyCitedEnabled && citationCount >= settings.highlyCitedThreshold;

      if (!journal) {
        filterStats.nonJournal++;
        // Distinguish genuinely unparseable (missing/empty .gs_a) from recognized non-journal items
        if (!gsaEl || !gsaEl.textContent.trim()) {
          trulyUnparseable++;
        }
        result.classList.add("sjf-non-journal");

        if (isHighlyCited) {
          result.classList.add("sjf-highly-cited");
          injectHighlyCitedBadge(result);
          filterStats.highlyCited++;
        } else if (settings.nonJournalItems === "dim") {
          result.classList.add("sjf-dim");
        } else if (settings.nonJournalItems === "hide") {
          result.classList.add("sjf-hide");
        }
        return;
      }

      // Store extracted journal name as data attribute (for context menu)
      result.dataset.sjfJournal = journal;

      const isMatch = matchesJournal(journal, activeJournals);
      const inList = settings.filterMode === "whitelist" ? isMatch : !isMatch;

      if (inList) {
        result.classList.add("sjf-match");
        filterStats.matched++;
        if (isHighlyCited) {
          result.classList.add("sjf-highly-cited");
          injectHighlyCitedBadge(result);
          filterStats.highlyCited++;
        }
      } else {
        result.classList.add("sjf-no-match");
        if (isHighlyCited) {
          // Not in journal list but highly cited — override dim/hide, show with badge
          result.classList.add("sjf-highly-cited");
          injectHighlyCitedBadge(result);
          filterStats.highlyCited++;
        } else if (settings.displayMode === "dim") {
          result.classList.add("sjf-dim");
        } else if (settings.displayMode === "hide") {
          result.classList.add("sjf-hide");
        }
      }
    });

    // Safety rail: if all journal results would be hidden, switch to dim
    const journalResults = filterStats.total - filterStats.nonJournal;
    if (settings.displayMode === "hide" && filterStats.matched === 0 && filterStats.highlyCited === 0 && journalResults > 0) {
      results.forEach((result) => {
        if (result.classList.contains("sjf-no-match")) {
          result.classList.remove("sjf-hide");
          result.classList.add("sjf-dim");
        }
      });
      showBanner("All results filtered — showing dimmed.", "Switch to highlight mode", () => {
        settings.displayMode = "highlight";
        chrome.storage.local.set({ displayMode: "highlight" });
        applyFiltering();
      });
    } else if (trulyUnparseable > 2 && trulyUnparseable > filterStats.total * 0.5) {
      // Only warn about genuinely unparseable results (missing/empty .gs_a),
      // not correctly-identified non-journal items like books and theses
      showBanner("Some results couldn't be parsed. Journal names may not be available for all entries.");
    }

    // Inject selection checkboxes onto results
    injectCheckboxes();
    updateExportBar();

    // Send stats to popup
    chrome.runtime.sendMessage({ type: "filterStats", stats: filterStats }).catch(() => {});
  }

  // ── Results-Per-Page Boost ────────────────────────────────────────
  // Scholar's hidden `num` parameter still works even though the UI setting was removed.
  // Redirect to num=20 on search pages so more results are available for filtering.
  function boostResultsPerPage() {
    const url = new URL(window.location.href);
    // Only boost on search results pages (has a query), not on other Scholar pages
    if (!url.searchParams.has("q")) return;
    const current = parseInt(url.searchParams.get("num"), 10);
    if (!current || current < 20) {
      url.searchParams.set("num", "20");
      window.location.replace(url.toString());
      return true; // signal that we're redirecting
    }
    return false;
  }

  // ── Initialization ─────────────────────────────────────────────────
  async function init() {
    // Boost results per page before doing anything else
    if (boostResultsPerPage()) return; // redirecting, don't filter yet

    const stored = await chrome.storage.local.get(null);

    // First run: populate with defaults
    if (!stored.journals) {
      const defaults = {
        enabled: true,
        filterMode: "whitelist",
        displayMode: "highlight",
        nonJournalItems: "show",
        journals: DEFAULT_JOURNALS.map((j) => ({ ...j, enabled: true })),
        firstRun: true,
      };
      await chrome.storage.local.set(defaults);
      Object.assign(settings, defaults);
    } else {
      settings.enabled = stored.enabled !== false;
      settings.filterMode = stored.filterMode || "whitelist";
      settings.displayMode = stored.displayMode || "highlight";
      settings.nonJournalItems = stored.nonJournalItems || "show";
      settings.journals = stored.journals || [];
      settings.highlyCitedEnabled = stored.highlyCitedEnabled || false;
      settings.highlyCitedThreshold = stored.highlyCitedThreshold || 500;
    }

    await loadSelections();
    applyFiltering();
    if (selectedPapers.size > 0) updateExportBar();
  }

  // ── Storage Change Listener ────────────────────────────────────────
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;

    for (const [key, { newValue }] of Object.entries(changes)) {
      if (key in settings) {
        settings[key] = newValue;
      }
    }
    applyFiltering();
  });

  // ── Message Listener (for popup stats requests) ────────────────────
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "getStats") {
      sendResponse({ stats: filterStats });
      return true;
    }
    if (msg.type === "refilter") {
      applyFiltering();
      sendResponse({ ok: true });
      return true;
    }
  });

  // ── MutationObserver (for dynamic Scholar results) ─────────────────
  const resContainer = document.getElementById("gs_res");
  if (resContainer) {
    const observer = new MutationObserver(() => {
      if (!isFiltering) applyFiltering();
    });
    observer.observe(resContainer, { childList: true, subtree: true });
  }

  // ── Selection & Export ──────────────────────────────────────────────
  // Selections persist across page navigations via chrome.storage.session.
  let selectedPapers = new Map(); // key = title, value = paper info object
  let exportBar = null;

  async function loadSelections() {
    try {
      const data = await chrome.storage.session.get("selectedPapers");
      if (data.selectedPapers) {
        selectedPapers = new Map(Object.entries(data.selectedPapers));
      }
    } catch {
      // Session storage may not be accessible yet — selections start empty
    }
  }

  function saveSelections() {
    try {
      const obj = Object.fromEntries(selectedPapers);
      chrome.storage.session.set({ selectedPapers: obj });
    } catch {
      // Silently fail — selections won't persist but extension still works
    }
  }

  function extractPaperInfo(resultEl) {
    const titleEl = resultEl.querySelector(".gs_rt a") || resultEl.querySelector(".gs_rt");
    const title = titleEl ? titleEl.textContent.replace(/^\[.*?\]\s*/, "").trim() : "";
    const gsaEl = resultEl.querySelector(".gs_a");
    const gsaText = gsaEl ? gsaEl.textContent.trim() : "";
    const snippetEl = resultEl.querySelector(".gs_rs");
    const snippet = snippetEl ? snippetEl.textContent.trim() : "";
    const rawJournal = resultEl.dataset.sjfJournal || "";
    const activeJournals = settings.journals.filter((j) => j.enabled !== false);
    const journal = resolveJournalName(rawJournal, activeJournals);

    // Extract year from .gs_a text
    const yearMatch = gsaText.match(/\b(19|20)\d{2}\b/);
    const year = yearMatch ? yearMatch[0] : "";

    // Extract authors (first segment before the dash)
    const segments = gsaText.split(/\s+[-\u2010-\u2015]\s+/);
    const authors = segments.length > 0 ? segments[0].trim() : "";

    // Extract "Cited by N" count from the result's action links
    const citedByLink = resultEl.querySelector('a[href*="cites="]');
    const citedByMatch = citedByLink ? citedByLink.textContent.match(/\d+/) : null;
    const citedBy = citedByMatch ? citedByMatch[0] : "0";

    // Check for PDF availability — Scholar shows [PDF] links in .gs_or_ggsm or .gs_ggsd
    const pdfLink = resultEl.querySelector('.gs_or_ggsm a[href], .gs_ggs a[href]');
    const pdfAvailable = pdfLink ? "Yes" : "No";
    const pdfUrl = pdfLink ? pdfLink.href : "";

    return { title, authors, year, journal, snippet, citedBy, pdfAvailable, pdfUrl };
  }

  function injectCheckboxes() {
    const results = document.querySelectorAll(".gs_r.gs_or.gs_scl, .gs_r.gs_or");
    results.forEach((result) => {
      if (result.querySelector(".sjf-checkbox-wrap")) return;

      const wrap = document.createElement("div");
      wrap.className = "sjf-checkbox-wrap";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "sjf-checkbox";
      cb.title = "Select for export";

      const info = extractPaperInfo(result);
      if (selectedPapers.has(info.title)) {
        cb.checked = true;
        result.classList.add("sjf-selected");
      }

      cb.addEventListener("change", () => {
        const paperInfo = extractPaperInfo(result);
        if (cb.checked) {
          selectedPapers.set(paperInfo.title, paperInfo);
          result.classList.add("sjf-selected");
        } else {
          selectedPapers.delete(paperInfo.title);
          result.classList.remove("sjf-selected");
        }
        saveSelections();
        updateExportBar();
      });

      wrap.appendChild(cb);
      result.appendChild(wrap);
    });
  }

  function createExportBar() {
    if (exportBar) return;
    exportBar = document.createElement("div");
    exportBar.className = "sjf-export-bar";
    exportBar.innerHTML = `
      <span><span class="sjf-count">0</span> papers selected</span>
      <button class="sjf-select-all-btn">Select all matched</button>
      <button class="sjf-export-btn" data-mode="scholar">Export Excel</button>
      <button class="sjf-export-enrich-btn" data-mode="openalex">Get Abstracts (OpenAlex)</button>
      <button class="sjf-clear-btn">Clear</button>
      <span class="sjf-export-progress"></span>
    `;

    exportBar.querySelector(".sjf-select-all-btn").addEventListener("click", selectAllMatched);
    exportBar.querySelector(".sjf-export-btn").addEventListener("click", () => exportSelected(false));
    exportBar.querySelector(".sjf-export-enrich-btn").addEventListener("click", () => exportSelected(true));
    exportBar.querySelector(".sjf-clear-btn").addEventListener("click", clearSelection);

    document.body.appendChild(exportBar);
  }

  function updateExportBar() {
    if (!exportBar) createExportBar();
    const count = selectedPapers.size;
    exportBar.querySelector(".sjf-count").textContent = count;
    const empty = count === 0;
    exportBar.querySelector(".sjf-export-btn").disabled = empty;
    exportBar.querySelector(".sjf-export-enrich-btn").disabled = empty;
    exportBar.classList.toggle("sjf-visible", count > 0);
  }

  function selectAllMatched() {
    document.querySelectorAll(".gs_r.sjf-match").forEach((result) => {
      const cb = result.querySelector(".sjf-checkbox");
      if (cb && !cb.checked) {
        cb.checked = true;
        const info = extractPaperInfo(result);
        selectedPapers.set(info.title, info);
        result.classList.add("sjf-selected");
      }
    });
    saveSelections();
    updateExportBar();
  }

  function clearSelection() {
    selectedPapers.clear();
    saveSelections();
    document.querySelectorAll(".sjf-checkbox").forEach((cb) => { cb.checked = false; });
    document.querySelectorAll(".sjf-selected").forEach((el) => { el.classList.remove("sjf-selected"); });
    updateExportBar();
  }

  // Column widths tuned per header type (in character units)
  const COL_WIDTHS = {
    Title: 280, Authors: 200, Journal: 160, Year: 50, "Cited By": 55,
    "PDF Available": 65, "PDF URL": 180, Abstract: 350, DOI: 180, "OpenAlex URL": 180,
  };

  function generateExcel(headers, rows) {
    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    const colXml = headers.map((h) => {
      const w = COL_WIDTHS[h] || 100;
      return `<Column ss:AutoFitWidth="0" ss:Width="${w}"/>`;
    }).join("\n      ");

    const headerRow = `<Row ss:StyleID="sHeader">${headers.map((h) => `<Cell><Data ss:Type="String">${esc(h)}</Data></Cell>`).join("")}</Row>`;

    const dataRows = rows.map((row) => {
      const cells = row.map((cell) => {
        const val = String(cell);
        // Use Number type for purely numeric values
        if (/^\d+$/.test(val) && val.length < 15) {
          return `<Cell ss:StyleID="sWrap"><Data ss:Type="Number">${val}</Data></Cell>`;
        }
        return `<Cell ss:StyleID="sWrap"><Data ss:Type="String">${esc(val)}</Data></Cell>`;
      }).join("");
      return `<Row>${cells}</Row>`;
    }).join("\n      ");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Font ss:FontName="Calibri" ss:Size="11"/>
    </Style>
    <Style ss:ID="sHeader">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
      <Interior ss:Color="#D9E1F2" ss:Pattern="Solid"/>
      <Alignment ss:Vertical="Bottom" ss:WrapText="1"/>
    </Style>
    <Style ss:ID="sWrap">
      <Alignment ss:Vertical="Top" ss:WrapText="1"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Scholar Export">
    <Table>
      ${colXml}
      ${headerRow}
      ${dataRows}
    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>1</SplitHorizontal>
      <TopRowBottomPane>1</TopRowBottomPane>
    </WorksheetOptions>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scholar-export-${new Date().toISOString().slice(0, 10)}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportSelected(useOpenAlex) {
    if (selectedPapers.size === 0) return;

    const progressEl = exportBar.querySelector(".sjf-export-progress");
    const exportBtn = exportBar.querySelector(".sjf-export-btn");
    const enrichBtn = exportBar.querySelector(".sjf-export-enrich-btn");
    exportBtn.disabled = true;
    enrichBtn.disabled = true;

    const papers = Array.from(selectedPapers.values());

    if (!useOpenAlex) {
      // Scholar-only export — instant, no network requests
      const headers = ["Title", "Authors", "Journal", "Year", "Cited By", "PDF Available", "PDF URL"];
      const rows = papers.map((p) => [
        p.title, p.authors, p.journal, p.year, p.citedBy, p.pdfAvailable, p.pdfUrl,
      ]);
      generateExcel(headers, rows);
      progressEl.textContent = `Exported ${papers.length} papers.`;
      exportBtn.disabled = false;
      enrichBtn.disabled = false;
      setTimeout(() => { progressEl.textContent = ""; }, 3000);
      return;
    }

    // OpenAlex-enriched export
    const results = [];
    let found = 0;
    let notFound = 0;

    for (let i = 0; i < papers.length; i++) {
      progressEl.textContent = `Fetching ${i + 1}/${papers.length}...`;

      try {
        const response = await chrome.runtime.sendMessage({
          type: "openAlexLookup",
          title: papers[i].title,
          year: papers[i].year,
        });

        if (response && response.found) {
          results.push({
            title: response.data.title,
            authors: response.data.authors,
            journal: response.data.journal,
            year: response.data.year,
            citedBy: papers[i].citedBy,
            pdfAvailable: papers[i].pdfAvailable,
            pdfUrl: papers[i].pdfUrl,
            snippet: papers[i].snippet,
            abstract: response.data.abstract,
            doi: response.data.doi,
            openAlexUrl: response.data.url,
          });
          found++;
        } else {
          results.push({
            title: papers[i].title,
            authors: papers[i].authors,
            journal: papers[i].journal,
            year: papers[i].year,
            citedBy: papers[i].citedBy,
            pdfAvailable: papers[i].pdfAvailable,
            pdfUrl: papers[i].pdfUrl,
            snippet: papers[i].snippet,
            abstract: "NOT FOUND IN OPENALEX",
            doi: "",
            openAlexUrl: "",
          });
          notFound++;
        }
      } catch {
        results.push({
          title: papers[i].title,
          authors: papers[i].authors,
          journal: papers[i].journal,
          year: papers[i].year,
          citedBy: papers[i].citedBy,
          pdfAvailable: papers[i].pdfAvailable,
          pdfUrl: papers[i].pdfUrl,
          snippet: papers[i].snippet,
          abstract: "LOOKUP FAILED",
          doi: "",
          openAlexUrl: "",
        });
        notFound++;
      }
    }

    const headers = ["Title", "Authors", "Journal", "Year", "Cited By", "PDF Available", "PDF URL", "Abstract", "DOI", "OpenAlex URL"];
    const rows = results.map((r) => [
      r.title, r.authors, r.journal, r.year, r.citedBy, r.pdfAvailable, r.pdfUrl, r.abstract, r.doi, r.openAlexUrl,
    ]);
    generateExcel(headers, rows);

    progressEl.textContent = `Done: ${found} found, ${notFound} not found.`;
    exportBtn.disabled = false;
    enrichBtn.disabled = false;
    setTimeout(() => { progressEl.textContent = ""; }, 5000);
  }

  // (checkboxes are injected at the end of _applyFiltering)

  // ── Context Menu Support ───────────────────────────────────────────
  // Always send the journal name (or null) so the background can enable/disable the menu item
  document.addEventListener("contextmenu", (e) => {
    const resultEl = e.target.closest(".gs_r");
    chrome.runtime.sendMessage({
      type: "contextJournal",
      journal: resultEl?.dataset?.sjfJournal || null,
    }).catch(() => {});
  });

  // ── Start ──────────────────────────────────────────────────────────
  init();
})();
