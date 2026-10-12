/* APP FILE: apps/five-senses-pwa/app.js */

(function () {
  "use strict";

  const DATA = window.USING_FIVE_SENSES_DATA;

  const elements = {
    senseList: document.getElementById("senseList"),
    guideList: document.getElementById("guideList"),
    referenceList: document.getElementById("referenceList"),
    searchInput: document.getElementById("searchInput"),
    resultNote: document.getElementById("resultNote"),
    expandAllButton: document.getElementById("expandAllButton"),
    collapseAllButton: document.getElementById("collapseAllButton"),
    resetSearchButton: document.getElementById("resetSearchButton"),
    clearCacheButton: document.getElementById("clearCacheButton"),
    dismissNoticeButton: document.getElementById("dismissNoticeButton"),
    notificationArea: document.getElementById("notificationArea"),
    troubleshootingPanel: document.getElementById("troubleshootingPanel"),
    troubleshootingOpenButton: document.getElementById("troubleshootingOpenButton"),
    troubleshootingCloseButton: document.getElementById("troubleshootingCloseButton")
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function buildSearchText(item) {
    return normalize(JSON.stringify(item));
  }

  function renderSectionBlock(section) {
    const label = `<div class="subsection-label">${escapeHtml(section.label)}</div>`;

    if (section.type === "list") {
      return `
        <section>
          ${label}
          <ul>
            ${section.content.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </section>
      `;
    }

    if (section.type === "chips") {
      return `
        <section>
          ${label}
          <div class="chip-row">
            ${section.content.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}
          </div>
        </section>
      `;
    }

    if (section.type === "quote") {
      return `
        <div class="example-block">
          <span class="ex-label">${escapeHtml(section.label)}</span>
          “${escapeHtml(section.content)}”
        </div>
      `;
    }

    if (section.type === "safety") {
      return `
        <div class="safety-callout">
          <span class="safety-icon">⚠️</span>
          <span>${escapeHtml(section.content)}</span>
        </div>
      `;
    }

    return `
      <section>
        ${label}
        <p>${escapeHtml(section.content)}</p>
      </section>
    `;
  }

  function makeTagRow(tags) {
    if (!tags || !tags.length) {
      return "";
    }

    return `
      <div class="tag-row" aria-label="Tags">
        ${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
      </div>
    `;
  }

  function renderSenses() {
    if (!elements.senseList || !DATA || !Array.isArray(DATA.senses)) {
      return;
    }

    elements.senseList.innerHTML = DATA.senses
      .map((sense) => {
        return `
          <details
            class="accordion-item sense-card searchable-item"
            id="${escapeHtml(sense.id)}" data-sense="${escapeHtml(sense.accent)}"
            data-search="${escapeHtml(buildSearchText(sense))}"
          >
            <summary>
              <span class="sense-icon" aria-hidden="true">${escapeHtml(sense.icon)}</span>
              <span class="sense-title-group">
                <span class="sense-name">${escapeHtml(sense.title)}</span>
                <span class="sense-tagline">${escapeHtml(sense.tagline)}</span>
              </span>
              <span class="sense-chevron" aria-hidden="true">⌄</span>
            </summary>

            <div class="accordion-content sense-body">
              ${sense.sections.map(renderSectionBlock).join("")}
              ${makeTagRow(sense.tags)}
            </div>
          </details>
        `;
      })
      .join("");
  }

  function renderGuideSections() {
    if (!elements.guideList || !DATA || !Array.isArray(DATA.guideSections)) {
      return;
    }

    elements.guideList.innerHTML = DATA.guideSections
      .map((section) => {
        return `
          <details
            class="accordion-item searchable-item"
            data-search="${escapeHtml(buildSearchText(section))}"
          >
            <summary>
              <span class="sense-title-group">
                <span class="sense-name">${escapeHtml(section.title)}</span>
              </span>
              <span class="sense-chevron" aria-hidden="true">⌄</span>
            </summary>

            <div class="accordion-content">
              <ul>
                ${section.body.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
              ${makeTagRow(section.tags)}
            </div>
          </details>
        `;
      })
      .join("");
  }

  function renderReferences() {
    if (!elements.referenceList || !DATA || !Array.isArray(DATA.references)) {
      return;
    }

    elements.referenceList.innerHTML = DATA.references
      .map((reference) => `<li>${escapeHtml(reference)}</li>`)
      .join("");
  }

  function getSearchableItems() {
    return Array.from(document.querySelectorAll(".searchable-item"));
  }

  function setAllDropdowns(open) {
    getSearchableItems().forEach((item) => {
      if (!item.hidden) {
        item.open = open;
      }
    });
  }

  function filterContent() {
    const query = normalize(elements.searchInput ? elements.searchInput.value : "");
    const items = getSearchableItems();
    let matches = 0;

    items.forEach((item) => {
      const isMatch = !query || normalize(item.dataset.search).includes(query);
      item.hidden = !isMatch;

      if (query && isMatch) {
        item.open = true;
      }

      if (isMatch) {
        matches += 1;
      }
    });

    if (elements.resultNote) {
      if (!query) {
        elements.resultNote.textContent = "";
      } else {
        elements.resultNote.textContent =
          matches === 1 ? "1 matching section found." : `${matches} matching sections found.`;
      }
    }
  }

  function resetSearch() {
    if (elements.searchInput) {
      elements.searchInput.value = "";
    }

    getSearchableItems().forEach((item) => {
      item.hidden = false;
      item.open = false;
    });

    if (elements.resultNote) {
      elements.resultNote.textContent = "";
    }

    if (elements.searchInput) {
      elements.searchInput.focus();
    }
  }

  function openTroubleshooting() {
    if (!elements.troubleshootingPanel) return;

    elements.troubleshootingPanel.hidden = false;
    document.body.style.overflow = "hidden";

    window.setTimeout(() => {
      if (elements.troubleshootingCloseButton) {
        elements.troubleshootingCloseButton.focus();
      }
    }, 0);
  }

  function closeTroubleshooting() {
    if (!elements.troubleshootingPanel) return;

    elements.troubleshootingPanel.hidden = true;
    document.body.style.overflow = "";

    if (elements.troubleshootingOpenButton) {
      elements.troubleshootingOpenButton.focus();
    }
  }

  function clearAppCache() {}

  function registerServiceWorker() {}

  function bindEvents() {
    if (elements.searchInput) {
      elements.searchInput.addEventListener("input", filterContent);
    }

    if (elements.expandAllButton) {
      elements.expandAllButton.addEventListener("click", () => setAllDropdowns(true));
    }

    if (elements.collapseAllButton) {
      elements.collapseAllButton.addEventListener("click", () => setAllDropdowns(false));
    }

    if (elements.resetSearchButton) {
      elements.resetSearchButton.addEventListener("click", resetSearch);
    }

    if (elements.clearCacheButton) {
      elements.clearCacheButton.addEventListener("click", clearAppCache);
    }

    if (elements.dismissNoticeButton && elements.notificationArea) {
      elements.dismissNoticeButton.addEventListener("click", () => {
        elements.notificationArea.hidden = true;
      });
    }

    if (elements.troubleshootingOpenButton) {
      elements.troubleshootingOpenButton.addEventListener("click", openTroubleshooting);
    }

    if (elements.troubleshootingCloseButton) {
      elements.troubleshootingCloseButton.addEventListener("click", closeTroubleshooting);
    }

    if (elements.troubleshootingPanel) {
      elements.troubleshootingPanel.addEventListener("click", (event) => {
        if (event.target === elements.troubleshootingPanel) {
          closeTroubleshooting();
        }
      });
    }

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        elements.troubleshootingPanel &&
        !elements.troubleshootingPanel.hidden
      ) {
        closeTroubleshooting();
      }
    });
  }

  function init() {
    renderSenses();
    renderGuideSections();
    renderReferences();
    bindEvents();
    registerServiceWorker();
  }

  document.addEventListener("DOMContentLoaded", init);
})();