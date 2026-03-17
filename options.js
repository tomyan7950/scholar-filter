// Scholar Journal Filter — Options Page Logic

(function () {
  "use strict";

  const tbody = document.getElementById("journal-tbody");
  const emptyState = document.getElementById("empty-state");
  const searchInput = document.getElementById("search-input");
  const statusMsg = document.getElementById("status-msg");

  let journals = [];

  // ── Load & Render ──────────────────────────────────────────────────
  async function load() {
    const stored = await chrome.storage.local.get("journals");
    journals = stored.journals || [];
    // Ensure all journals have an enabled field
    journals.forEach((j) => { if (j.enabled === undefined) j.enabled = true; });
    sortJournals();
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
        const td = document.createElement("td");
        td.colSpan = 4;
        td.style.cssText = "text-align:center;color:#888;padding:20px;";
        td.textContent = `No journals match "${filter}"`;
        tr.appendChild(td);
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
      if (journal.enabled === false) tr.classList.add("journal-inactive");

      // Active toggle cell
      const activeTd = document.createElement("td");
      activeTd.className = "active-cell";
      const toggle = document.createElement("input");
      toggle.type = "checkbox";
      toggle.className = "journal-toggle";
      toggle.checked = journal.enabled !== false;
      toggle.title = toggle.checked ? "Active — click to deactivate" : "Inactive — click to activate";
      toggle.addEventListener("change", () => {
        journals[realIdx].enabled = toggle.checked;
        save();
      });
      activeTd.appendChild(toggle);

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

      tr.appendChild(activeTd);
      tr.appendChild(nameTd);
      tr.appendChild(aliasTd);
      tr.appendChild(actionsTd);
      tbody.appendChild(tr);
    });
  }

  // ── CRUD Operations ────────────────────────────────────────────────
  function sortJournals() {
    journals.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
  }

  async function save() {
    sortJournals();
    await chrome.storage.local.set({ journals });
    render(searchInput.value);
  }

  function addJournal() {
    showModal("Add Journals", `
      <p style="margin-bottom:8px;color:#666;font-size:13px;">Enter journal names, one per line. Aliases can be added later via Edit.</p>
      <textarea id="modal-add-input" rows="8" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:13px;resize:vertical;" placeholder="Journal of Applied Psychology&#10;Organization Science&#10;Academy of Management Journal"></textarea>
    `, () => {
      const input = document.getElementById("modal-add-input").value;
      const names = input.split("\n").map((s) => s.trim()).filter(Boolean);
      if (names.length === 0) return;

      const norm = (s) => s.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
      let added = 0;
      for (const name of names) {
        const exists = journals.some((j) => norm(j.name) === norm(name));
        if (!exists) {
          journals.push({ name, aliases: [], enabled: true });
          added++;
        }
      }
      save();
      showStatus(`Added ${added} journal${added !== 1 ? "s" : ""}${names.length - added > 0 ? ` (${names.length - added} already existed)` : ""}`, "success");
    });
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

    // Replace name cell with input (cells[1] — after active toggle at cells[0])
    cells[1].innerHTML = "";
    const nameInput = document.createElement("input");
    nameInput.className = "edit-name-input";
    nameInput.value = journal.name;
    cells[1].appendChild(nameInput);

    // Replace aliases cell with input
    cells[2].innerHTML = "";
    const aliasInput = document.createElement("input");
    aliasInput.className = "edit-aliases-input";
    aliasInput.value = (journal.aliases || []).join(", ");
    aliasInput.placeholder = "Comma-separated aliases";
    cells[2].appendChild(aliasInput);

    // Replace actions with Save/Cancel
    cells[3].innerHTML = "";

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
        ...journals[index],
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

    cells[3].appendChild(saveBtn);
    cells[3].appendChild(cancelBtn);

    nameInput.focus();
    nameInput.select();
  }


  function resetToDefaults() {
    if (!confirm("Replace your journal list with the built-in defaults? This cannot be undone.")) return;
    journals = DEFAULT_JOURNALS.map((j) => ({ ...j, enabled: true }));
    save();
    showStatus(`Reset to ${journals.length} default journals`, "success");
  }

  function deleteInactive() {
    const inactive = journals.filter((j) => j.enabled === false);
    if (inactive.length === 0) {
      showStatus("No inactive journals to delete", "error");
      return;
    }
    if (!confirm(`Delete ${inactive.length} inactive journal${inactive.length !== 1 ? "s" : ""}?`)) return;
    journals = journals.filter((j) => j.enabled !== false);
    save();
    showStatus(`Deleted ${inactive.length} journal${inactive.length !== 1 ? "s" : ""}`, "success");
  }

  // ── Modal Helper ────────────────────────────────────────────────────
  function showModal(title, bodyHtml, onConfirm) {
    // Remove existing modal
    document.getElementById("sjf-modal-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "sjf-modal-overlay";
    overlay.className = "modal-overlay";

    const modal = document.createElement("div");
    modal.className = "modal-box";
    modal.innerHTML = `
      <h2 style="margin-bottom:12px;font-size:16px;">${title}</h2>
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="modal-confirm">Confirm</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
    document.getElementById("modal-cancel").addEventListener("click", () => overlay.remove());
    document.getElementById("modal-confirm").addEventListener("click", () => {
      onConfirm();
      overlay.remove();
    });
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
  document.getElementById("delete-inactive-btn").addEventListener("click", deleteInactive);
  document.getElementById("reset-defaults-btn").addEventListener("click", resetToDefaults);

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
