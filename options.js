// Scholar Journal Filter — Options Page Logic

(function () {
  "use strict";

  const tbody = document.getElementById("journal-tbody");
  const emptyState = document.getElementById("empty-state");
  const searchInput = document.getElementById("search-input");
  const statusMsg = document.getElementById("status-msg");
  const importFile = document.getElementById("import-file");

  let journals = [];

  // ── Load & Render ──────────────────────────────────────────────────
  async function load() {
    const stored = await chrome.storage.local.get("journals");
    journals = stored.journals || [];
    render();
  }

  function render(filter = "") {
    tbody.innerHTML = "";
    const norm = filter.toLowerCase().trim();
    const filtered = norm
      ? journals.filter(
          (j) =>
            j.name.toLowerCase().includes(norm) ||
            (j.aliases && j.aliases.some((a) => a.toLowerCase().includes(norm)))
        )
      : journals;

    if (filtered.length === 0) {
      emptyState.style.display = journals.length === 0 ? "block" : "none";
      document.getElementById("journal-table").style.display = journals.length === 0 ? "none" : "";
      if (norm && journals.length > 0) {
        // Show "no match" inline
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="3" style="text-align:center;color:#888;padding:20px;">No journals match "${filter}"</td>`;
        tbody.appendChild(tr);
      }
      return;
    }

    emptyState.style.display = "none";
    document.getElementById("journal-table").style.display = "";

    filtered.forEach((journal, filteredIdx) => {
      const realIdx = journals.indexOf(journal);
      const tr = document.createElement("tr");
      tr.dataset.index = realIdx;

      // Name cell
      const nameTd = document.createElement("td");
      nameTd.textContent = journal.name;

      // Aliases cell
      const aliasTd = document.createElement("td");
      aliasTd.className = "alias-list";
      if (journal.aliases && journal.aliases.length > 0) {
        journal.aliases.forEach((alias) => {
          const span = document.createElement("span");
          span.className = "alias-tag";
          span.textContent = alias;
          aliasTd.appendChild(span);
        });
      } else {
        aliasTd.textContent = "—";
        aliasTd.style.color = "#ccc";
      }

      // Actions cell
      const actionsTd = document.createElement("td");
      actionsTd.className = "actions-cell";

      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-secondary btn-sm";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => startEdit(tr, realIdx));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-danger btn-sm";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => deleteJournal(realIdx));

      actionsTd.appendChild(editBtn);
      actionsTd.appendChild(deleteBtn);

      tr.appendChild(nameTd);
      tr.appendChild(aliasTd);
      tr.appendChild(actionsTd);
      tbody.appendChild(tr);
    });
  }

  // ── CRUD Operations ────────────────────────────────────────────────
  async function save() {
    await chrome.storage.local.set({ journals });
    render(searchInput.value);
  }

  function addJournal() {
    const name = prompt("Journal name:");
    if (!name || !name.trim()) return;

    const aliasStr = prompt("Aliases (comma-separated, or leave blank):");
    const aliases = aliasStr
      ? aliasStr.split(",").map((a) => a.trim()).filter(Boolean)
      : [];

    journals.push({ name: name.trim(), aliases });
    save();
    showStatus("Journal added", "success");
  }

  function deleteJournal(index) {
    const name = journals[index].name;
    if (!confirm(`Remove "${name}" from the list?`)) return;
    journals.splice(index, 1);
    save();
    showStatus("Journal removed", "success");
  }

  function startEdit(tr, index) {
    const journal = journals[index];
    const cells = tr.children;

    // Replace name cell with input
    cells[0].innerHTML = "";
    const nameInput = document.createElement("input");
    nameInput.className = "edit-name-input";
    nameInput.value = journal.name;
    cells[0].appendChild(nameInput);

    // Replace aliases cell with input
    cells[1].innerHTML = "";
    const aliasInput = document.createElement("input");
    aliasInput.className = "edit-aliases-input";
    aliasInput.value = (journal.aliases || []).join(", ");
    aliasInput.placeholder = "Comma-separated aliases";
    cells[1].appendChild(aliasInput);

    // Replace actions with Save/Cancel
    cells[2].innerHTML = "";

    const saveBtn = document.createElement("button");
    saveBtn.className = "btn btn-primary btn-sm";
    saveBtn.textContent = "Save";
    saveBtn.addEventListener("click", () => {
      const newName = nameInput.value.trim();
      if (!newName) {
        nameInput.focus();
        return;
      }
      journals[index] = {
        name: newName,
        aliases: aliasInput.value
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
      };
      save();
      showStatus("Journal updated", "success");
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn btn-secondary btn-sm";
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => render(searchInput.value));

    cells[2].appendChild(saveBtn);
    cells[2].appendChild(cancelBtn);

    nameInput.focus();
    nameInput.select();
  }

  // ── Import/Export ──────────────────────────────────────────────────
  function exportJournals() {
    const data = JSON.stringify(journals, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scholar-filter-journals.json";
    a.click();
    URL.revokeObjectURL(url);
    showStatus("Journal list exported", "success");
  }

  function importJournals(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data)) throw new Error("Expected an array");

        // Validate structure
        const valid = data.every(
          (j) => typeof j.name === "string" && j.name.trim()
        );
        if (!valid) throw new Error("Each entry must have a non-empty 'name' field");

        // Normalize: ensure aliases is always an array
        journals = data.map((j) => ({
          name: j.name.trim(),
          aliases: Array.isArray(j.aliases) ? j.aliases : [],
        }));
        save();
        showStatus(`Imported ${journals.length} journals`, "success");
      } catch (err) {
        showStatus("Import failed: " + err.message, "error");
      }
    };
    reader.readAsText(file);
  }

  function resetToDefaults() {
    if (!confirm("Replace your journal list with the default OB/Management list?")) return;
    journals = JSON.parse(JSON.stringify(DEFAULT_JOURNALS));
    save();
    showStatus("Reset to defaults", "success");
  }

  // ── Status Flash ───────────────────────────────────────────────────
  function showStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.className = "status-msg " + type;
    statusMsg.style.display = "block";
    setTimeout(() => {
      statusMsg.style.display = "none";
    }, 3000);
  }

  // ── Event Listeners ────────────────────────────────────────────────
  document.getElementById("add-journal").addEventListener("click", addJournal);
  document.getElementById("export-btn").addEventListener("click", exportJournals);
  document.getElementById("import-btn").addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", (e) => {
    if (e.target.files[0]) importJournals(e.target.files[0]);
    e.target.value = "";
  });
  document.getElementById("reset-btn").addEventListener("click", resetToDefaults);
  document.getElementById("empty-reset").addEventListener("click", (e) => {
    e.preventDefault();
    resetToDefaults();
  });

  searchInput.addEventListener("input", () => render(searchInput.value));

  // Listen for external changes (e.g., context menu adding a journal)
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.journals) {
      journals = changes.journals.newValue || [];
      render(searchInput.value);
    }
  });

  load();
})();
