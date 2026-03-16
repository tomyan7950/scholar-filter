// Scholar Journal Filter — Service Worker (Manifest V3)
// Handles context menu and badge updates.

// ── Context Menu ─────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  // Allow content scripts to use chrome.storage.session (for persisting selections across pages)
  chrome.storage.session.setAccessLevel({ accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS" });

  chrome.contextMenus.create({
    id: "sjf-add-journal",
    title: "Add journal to filter list",
    contexts: ["all"],
    enabled: false,
    documentUrlPatterns: [
      "*://scholar.google.com/*",
      "*://scholar.google.co.uk/*",
      "*://scholar.google.ca/*",
      "*://scholar.google.com.au/*",
      "*://scholar.google.de/*",
      "*://scholar.google.fr/*",
      "*://scholar.google.es/*",
      "*://scholar.google.it/*",
      "*://scholar.google.nl/*",
      "*://scholar.google.co.in/*",
      "*://scholar.google.co.jp/*",
      "*://scholar.google.com.br/*",
      "*://scholar.google.co.kr/*",
      "*://scholar.google.com.hk/*",
      "*://scholar.google.com.tw/*",
      "*://scholar.google.com.sg/*",
      "*://scholar.google.co.za/*",
      "*://scholar.google.com.mx/*",
      "*://scholar.google.co.nz/*",
      "*://scholar.google.se/*",
      "*://scholar.google.no/*",
      "*://scholar.google.dk/*",
      "*://scholar.google.fi/*",
      "*://scholar.google.at/*",
      "*://scholar.google.ch/*",
      "*://scholar.google.be/*",
      "*://scholar.google.pt/*",
      "*://scholar.google.pl/*",
      "*://scholar.google.ru/*",
      "*://scholar.google.com.ar/*",
      "*://scholar.google.cl/*",
      "*://scholar.google.co.il/*",
      "*://scholar.google.co.th/*",
      "*://scholar.google.com.cn/*"
    ],
  });
});

// Track the journal name from the most recent right-click.
// Uses chrome.storage.session to survive service worker restarts.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "contextJournal") {
    if (msg.journal) {
      chrome.storage.session.set({ lastContextJournal: msg.journal });
      chrome.contextMenus.update("sjf-add-journal", {
        title: `Add "${msg.journal}" to filter list`,
        enabled: true,
      });
    } else {
      chrome.storage.session.remove("lastContextJournal");
      chrome.contextMenus.update("sjf-add-journal", {
        title: "Add journal to filter list",
        enabled: false,
      });
    }
    sendResponse({ ok: true });
    return true;
  }

  if (msg.type === "openAlexLookup") {
    lookupOpenAlex(msg.title, msg.year).then(sendResponse);
    return true; // keep message channel open for async response
  }

  return true;
});

// ── OpenAlex Lookup ──────────────────────────────────────────────────
// Search by title, optionally filter by year. Return full metadata.
async function lookupOpenAlex(title, year) {
  try {
    const params = new URLSearchParams({
      search: title,
      per_page: "3",
      mailto: "scholar-filter-extension@example.com",
    });
    if (year) {
      params.set("filter", `publication_year:${year}`);
    }

    const resp = await fetch(`https://api.openalex.org/works?${params}`);
    if (!resp.ok) return { found: false };

    const data = await resp.json();
    if (!data.results || data.results.length === 0) return { found: false };

    // Find best match — check if title is similar
    const normalizeTitle = (s) => s.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
    const searchNorm = normalizeTitle(title);

    let best = null;
    for (const work of data.results) {
      if (!work.title) continue;
      const workNorm = normalizeTitle(work.title);
      // Accept if one contains the other (handles truncation)
      if (workNorm.includes(searchNorm) || searchNorm.includes(workNorm) ||
          levenshteinSimilarity(searchNorm, workNorm) > 0.85) {
        best = work;
        break;
      }
    }

    if (!best) {
      // Fall back to first result if titles are close enough
      const firstNorm = normalizeTitle(data.results[0].title || "");
      if (levenshteinSimilarity(searchNorm, firstNorm) > 0.7) {
        best = data.results[0];
      }
    }

    if (!best) return { found: false };

    // Extract abstract from inverted index
    let abstract = "";
    if (best.abstract_inverted_index) {
      const entries = [];
      for (const [word, positions] of Object.entries(best.abstract_inverted_index)) {
        for (const pos of positions) {
          entries.push({ pos, word });
        }
      }
      entries.sort((a, b) => a.pos - b.pos);
      abstract = entries.map((e) => e.word).join(" ");
    }

    // Extract authors
    const authors = (best.authorships || [])
      .map((a) => a.author?.display_name || "")
      .filter(Boolean)
      .join(", ");

    // Extract journal
    const journal =
      best.primary_location?.source?.display_name || "";

    // Extract DOI and URL
    const doi = best.doi || "";
    const url = best.primary_location?.landing_page_url || best.doi || "";

    return {
      found: true,
      data: {
        title: best.title || title,
        authors,
        journal,
        year: best.publication_year || year || "",
        abstract: abstract || "(no abstract available)",
        citationCount: best.cited_by_count || 0,
        doi,
        url,
      },
    };
  } catch (err) {
    console.error("OpenAlex lookup failed:", err);
    return { found: false };
  }
}

// Simple Levenshtein similarity (0-1 scale)
function levenshteinSimilarity(a, b) {
  if (a === b) return 1;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;

  const costs = [];
  for (let i = 0; i <= shorter.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= longer.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (shorter[i - 1] !== longer[j - 1]) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[longer.length] = lastValue;
  }
  return (longer.length - costs[longer.length]) / longer.length;
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "sjf-add-journal") return;

  const sessionData = await chrome.storage.session.get("lastContextJournal");
  const journal = sessionData.lastContextJournal;
  if (!journal) return;

  await chrome.storage.session.remove("lastContextJournal");

  // Add to journal list in storage
  const stored = await chrome.storage.local.get("journals");
  const journals = stored.journals || [];

  // Check if already in list (normalized comparison)
  const norm = (s) => s.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
  const normalizedNew = norm(journal);
  const exists = journals.some(
    (j) => norm(j.name) === normalizedNew || (j.aliases && j.aliases.some((a) => norm(a) === normalizedNew))
  );

  if (exists) {
    // Already in list — notify the user via badge flash
    chrome.action.setBadgeText({ text: "✓", tabId: tab.id });
    chrome.action.setBadgeBackgroundColor({ color: "#2e7d32", tabId: tab.id });
    setTimeout(() => chrome.action.setBadgeText({ text: "", tabId: tab.id }), 2000);
    return;
  }

  journals.push({ name: journal, aliases: [] });
  await chrome.storage.local.set({ journals });

  // Badge flash to confirm
  chrome.action.setBadgeText({ text: "+1", tabId: tab.id });
  chrome.action.setBadgeBackgroundColor({ color: "#2e7d32", tabId: tab.id });
  setTimeout(() => chrome.action.setBadgeText({ text: "", tabId: tab.id }), 2000);

  // Reset the menu text
  chrome.contextMenus.update("sjf-add-journal", {
    title: "Add journal to filter list",
  });
});
