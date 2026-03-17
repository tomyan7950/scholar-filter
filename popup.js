// Scholar Journal Filter — Popup Logic

(function () {
  "use strict";

  const toggleEnabled = document.getElementById("toggle-enabled");
  const container = document.querySelector(".popup-container");
  const statsText = document.getElementById("stats-text");
  const firstRunBanner = document.getElementById("first-run-banner");
  const journalCount = document.getElementById("journal-count");
  const customizeLink = document.getElementById("customize-link");
  const optionsLink = document.getElementById("options-link");
  const toggleHighlyCited = document.getElementById("toggle-highly-cited");
  const highlyCitedThreshold = document.getElementById("highly-cited-threshold");

  const buttonGroups = {
    displayMode: document.getElementById("display-mode"),
    filterMode: document.getElementById("filter-mode"),
    nonJournalItems: document.getElementById("non-journal"),
  };

  // ── Load Settings ────────────────────────────────────────────────
  async function loadSettings() {
    const stored = await chrome.storage.local.get(null);

    // Enabled toggle
    const enabled = stored.enabled !== false;
    toggleEnabled.checked = enabled;
    container.classList.toggle("disabled", !enabled);

    // Button groups
    setActiveButton(buttonGroups.displayMode, stored.displayMode || "highlight");
    setActiveButton(buttonGroups.filterMode, stored.filterMode || "whitelist");
    setActiveButton(buttonGroups.nonJournalItems, stored.nonJournalItems || "show");

    // Highly Cited controls
    toggleHighlyCited.checked = stored.highlyCitedEnabled || false;
    highlyCitedThreshold.value = stored.highlyCitedThreshold || 500;

    // First-run banner
    if (stored.firstRun) {
      firstRunBanner.style.display = "block";
      journalCount.textContent = (stored.journals || []).length;
    }

    // Request stats from content script
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes("scholar.google")) {
        const response = await chrome.tabs.sendMessage(tab.id, { type: "getStats" });
        if (response && response.stats) {
          updateStats(response.stats);
        }
      } else {
        statsText.textContent = "Open Google Scholar to see results";
      }
    } catch {
      statsText.textContent = "Open Google Scholar to see results";
    }
  }

  function updateStats(stats) {
    if (stats.total === 0) {
      statsText.textContent = "No results on this page";
    } else {
      let text = `${stats.matched} of ${stats.total} results match your journals`;
      if (stats.highlyCited > 0) {
        text += ` · ${stats.highlyCited} highly cited`;
      }
      statsText.textContent = text;
    }
  }

  function setActiveButton(group, value) {
    group.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.value === value);
    });
  }

  // ── Event Handlers ───────────────────────────────────────────────
  toggleEnabled.addEventListener("change", () => {
    const enabled = toggleEnabled.checked;
    chrome.storage.local.set({ enabled });
    container.classList.toggle("disabled", !enabled);
  });

  Object.entries(buttonGroups).forEach(([storageKey, group]) => {
    group.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn || btn.classList.contains("active")) return;

      setActiveButton(group, btn.dataset.value);
      chrome.storage.local.set({ [storageKey]: btn.dataset.value });
    });
  });

  toggleHighlyCited.addEventListener("change", () => {
    chrome.storage.local.set({ highlyCitedEnabled: toggleHighlyCited.checked });
  });

  highlyCitedThreshold.addEventListener("change", () => {
    const val = parseInt(highlyCitedThreshold.value, 10);
    if (val > 0) {
      chrome.storage.local.set({ highlyCitedThreshold: val });
    }
  });

  customizeLink.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.storage.local.set({ firstRun: false });
    chrome.runtime.openOptionsPage();
  });

  optionsLink.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  // ── Listen for stats updates while popup is open ─────────────────
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "filterStats" && msg.stats) {
      updateStats(msg.stats);
    }
  });

  loadSettings();
})();
