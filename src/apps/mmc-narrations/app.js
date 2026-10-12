/* APP FILE: apps/mmc-narrations/app.js */

(function () {
  "use strict";

  const APP_DATA = window.MMC_NARRATIONS_DATA || {
    appName: "MMC Narrations",
    version: "v1.0",
    sections: [],
    references: []
  };

  const dropdownContainer = document.getElementById("dropdownContainer");
  const searchInput = document.getElementById("searchInput");
  const resultCount = document.getElementById("resultCount");
  const referencesList = document.getElementById("referencesList");
  const versionDisplay = document.getElementById("versionDisplay");

  const troubleshootingButton = document.getElementById("troubleshootingButton");
  const troubleshootingPanel = document.getElementById("troubleshootingPanel");
  const closeTroubleshootingButton = document.getElementById("closeTroubleshootingButton");

  const clearCacheButton = document.getElementById("clearCacheButton");
  const expandAllButton = document.getElementById("expandAllButton");
  const collapseAllButton = document.getElementById("collapseAllButton");
  const resetSearchButton = document.getElementById("resetSearchButton");

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function createTextList(items, className) {
    const list = document.createElement("ul");
    list.className = className;

    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });

    return list;
  }

  function createSectionCard(section) {
    const details = document.createElement("details");
    details.className = "dropdown-card";
    details.dataset.searchText = normalizeText([
      section.title,
      section.category,
      section.summary,
      ...(section.body || []),
      ...(section.prompts || []),
      ...(section.tags || [])
    ].join(" "));

    const summary = document.createElement("summary");
    summary.className = "dropdown-summary";

    const summaryText = document.createElement("div");

    const title = document.createElement("div");
    title.className = "dropdown-summary-title";
    title.textContent = section.title;

    const meta = document.createElement("div");
    meta.className = "dropdown-summary-meta";
    meta.textContent = `${section.category || "Section"} · ${section.summary || ""}`;

    summaryText.appendChild(title);
    summaryText.appendChild(meta);

    const chevron = document.createElement("div");
    chevron.className = "dropdown-chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.textContent = "⌄";

    summary.appendChild(summaryText);
    summary.appendChild(chevron);

    const body = document.createElement("div");
    body.className = "dropdown-body";

    if (Array.isArray(section.body) && section.body.length) {
      const bodyTitle = document.createElement("h3");
      bodyTitle.textContent = "Narration Notes";
      body.appendChild(bodyTitle);

      section.body.forEach((paragraph) => {
        const p = document.createElement("p");
        p.textContent = paragraph;
        body.appendChild(p);
      });
    }

    if (Array.isArray(section.prompts) && section.prompts.length) {
      const promptTitle = document.createElement("h3");
      promptTitle.textContent = "Prompts";
      body.appendChild(promptTitle);
      body.appendChild(createTextList(section.prompts, "prompt-list"));
    }

    if (Array.isArray(section.tags) && section.tags.length) {
      const tagRow = document.createElement("div");
      tagRow.className = "tag-row";
      section.tags.forEach((tag) => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = tag;
        tagRow.appendChild(span);
      });
      body.appendChild(tagRow);
    }

    details.appendChild(summary);
    details.appendChild(body);

    return details;
  }

  function renderSections() {
    dropdownContainer.innerHTML = "";

    if (!APP_DATA.sections || APP_DATA.sections.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No narration sections are loaded yet. Add entries to data.js.";
      dropdownContainer.appendChild(empty);
        return;
    }

    APP_DATA.sections.forEach((section) => {
      dropdownContainer.appendChild(createSectionCard(section));
    });

  }

  function renderReferences() {
    referencesList.innerHTML = "";

    const references = APP_DATA.references || [];

    if (!references.length) {
      const li = document.createElement("li");
      li.textContent = "No references listed yet.";
      referencesList.appendChild(li);
      return;
    }

    references.forEach((reference) => {
      const li = document.createElement("li");
      li.textContent = `${reference.label}: ${reference.note}`;
      referencesList.appendChild(li);
    });
  }

  function registerServiceWorker() {}

  function init() {
    if (versionDisplay) versionDisplay.textContent = APP_DATA.version || "v1.0";
    renderSections();
    renderReferences();
    registerServiceWorker();
  }

  init();
})();