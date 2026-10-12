const CACHE_MESSAGE_KEY = "whale-parasites-associates-cache-message";
const APP_CACHE_PREFIX = "whale-parasites-associates";

let currentFilter = "all";
let currentSearch = "";

document.addEventListener("DOMContentLoaded", () => {
  buildJumpMenu();
  buildFilters();
  buildCards();
  setupSearch();
  setupTroubleshooting();
  restoreUpdateMessage();
  setupClearCache();
  registerServiceWorker();
  applyCardVisibility();

  if (window.renderRelatedHubTopics) {
    window.renderRelatedHubTopics("whale-parasites-associates");
  }
});

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function buildJumpMenu() {
  const select = document.getElementById("jumpSelect");
  if (!select) return;

  PARASITES.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    select.appendChild(option);
  });

  select.addEventListener("change", () => {
    const id = select.value;
    if (!id) return;

    const card = document.getElementById(id);
    if (!card) return;

    card.dataset.hidden = "false";
    card.open = true;

    setTimeout(() => {
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 75);

    select.value = "";
  });
}

function buildFilters() {
  const filterTabs = document.getElementById("filterTabs");
  if (!filterTabs) return;

  filterTabs.innerHTML = FILTERS.map(([id, label], index) => `
    <button
      class="filter-tab ${index === 0 ? "active" : ""}"
      type="button"
      data-filter="${escapeHTML(id)}"
      aria-pressed="${index === 0 ? "true" : "false"}"
    >
      ${escapeHTML(label)}
    </button>
  `).join("");

  document.querySelectorAll(".filter-tab").forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter || "all";

      document.querySelectorAll(".filter-tab").forEach((tab) => {
        tab.classList.remove("active");
        tab.setAttribute("aria-pressed", "false");
      });

      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");
      applyCardVisibility();
    });
  });
}

function buildCards() {
  const cardList = document.getElementById("cardList");
  if (!cardList) return;

  cardList.innerHTML = PARASITES.map((item) => {
    const paragraphs = item.paragraphs
      .map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`)
      .join("");

    const hosts = item.hosts
      .map((host) => `<span class="host-chip">${escapeHTML(host)}</span>`)
      .join("");

    const dots = [1, 2, 3, 4].map((number) => {
      const filled = number <= item.harmDots ? "filled" : "";
      const warn = item.warn ? "warn" : "";
      return `<span class="dot ${filled} ${warn}" aria-hidden="true"></span>`;
    }).join("");

    const facts = item.facts
      .map(([label, value]) => `
        <span class="fact-pill">
          <strong>${escapeHTML(label)}</strong> ${escapeHTML(value)}
        </span>
      `)
      .join("");

    const searchableText = [
      item.name,
      item.sci,
      item.tag,
      item.hostsTitle,
      item.harm,
      item.paragraphs.join(" "),
      item.hosts.join(" "),
      item.facts.flat().join(" ")
    ].join(" ");

    return `
      <details
        class="card"
        id="${escapeHTML(item.id)}"
        data-category="${escapeHTML(item.categories.join(" "))}"
        data-search="${escapeHTML(normalizeText(searchableText))}"
      >
        <summary class="card-trigger">
          <div class="card-icon" style="background:${escapeHTML(item.iconBg)};" aria-hidden="true">${escapeHTML(item.icon)}</div>

          <div class="card-meta">
            <div class="card-name">${escapeHTML(item.name)}</div>
            <div class="card-sci">${escapeHTML(item.sci)}</div>
          </div>

          <span class="card-tag ${escapeHTML(item.tagClass)}">${escapeHTML(item.tag)}</span>
          <span class="card-chevron" aria-hidden="true">›</span>
        </summary>

        <div class="card-body">
          ${paragraphs}

          <div class="hosts-label">${escapeHTML(item.hostsTitle)}</div>
          <div class="host-chips">
            ${hosts}
          </div>

          <div class="harm-bar" aria-label="Harm level: ${escapeHTML(item.harm)}">
            <span class="harm-label">Harm</span>
            <div class="harm-dots">${dots}</div>
            <span>${escapeHTML(item.harm)}</span>
          </div>

          <div class="fact-row">
            ${facts}
          </div>
        </div>
      </details>
    `;
  }).join("");
}

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    currentSearch = normalizeText(searchInput.value);
    applyCardVisibility();
  });
}

function applyCardVisibility() {
  const cards = Array.from(document.querySelectorAll(".card"));
  const resultCount = document.getElementById("resultCount");
  let visibleCount = 0;

  cards.forEach((card) => {
    const categories = card.dataset.category || "";
    const searchableText = card.dataset.search || "";
    const matchesFilter = currentFilter === "all" || categories.split(" ").includes(currentFilter);
    const matchesSearch = !currentSearch || searchableText.includes(currentSearch);
    const shouldShow = matchesFilter && matchesSearch;

    card.dataset.hidden = shouldShow ? "false" : "true";
    if (shouldShow) visibleCount += 1;
  });

  if (resultCount) {
    if (visibleCount === cards.length && !currentSearch && currentFilter === "all") {
      resultCount.textContent = `${visibleCount} entries shown.`;
    } else {
      resultCount.textContent = `${visibleCount} matching entr${visibleCount === 1 ? "y" : "ies"} shown.`;
    }
  }
}

function setupTroubleshooting() {}

function restoreUpdateMessage() {}

function setupClearCache() {}

function registerServiceWorker() {}
