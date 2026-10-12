const CACHE_MESSAGE_KEY = "mba-leadership-cache-message";
const APP_CACHE_PREFIX = "mba-leadership";

document.addEventListener("DOMContentLoaded", () => {
  renderCards();
  registerServiceWorker();
});

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildQuickLinks() {
  const container = document.getElementById("quickLinks");
  const links = window.MBA_LEADERSHIP_QUICK_LINKS || [];

  container.innerHTML = links.map((link) => {
    const disabled = !link.targetId;
    return `
      <button class="quick-link ${disabled ? "disabled" : ""}" type="button" data-target="${escapeHTML(link.targetId)}" ${disabled ? "disabled" : ""}>
        ${escapeHTML(link.label)}
      </button>
    `;
  }).join("");

  container.querySelectorAll(".quick-link:not(.disabled)").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.target;
      const target = document.getElementById(targetId);

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        target.classList.add("open");
        const cardButton = target.querySelector(".card-button");
        if (cardButton) cardButton.setAttribute("aria-expanded", "true");
      }
    });
  });
}

function allTags() {
  const tags = new Set();

  window.MBA_LEADERSHIP_DATA.forEach((item) => {
    (item.tags || []).forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).sort();
}

function buildTagFilter() {
  const select = document.getElementById("tagFilter");

  allTags().forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    select.appendChild(option);
  });
}

function getFilteredItems() { return window.MBA_LEADERSHIP_DATA; }

function optionalField(label, value) {
  if (!value) return "";
  return `<p class="field"><strong>${escapeHTML(label)}:</strong> ${escapeHTML(value)}</p>`;
}

function optionalList(title, items) {
  if (!items || !items.length) return "";

  return `
    <div class="extra-section">
      <h3>${escapeHTML(title)}</h3>
      <ul>
        ${items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}
      </ul>
    </div>
  `;
}

function optionalLinks(links) {
  if (!links || !links.length) return "";

  return `
    <div class="extra-section">
      <h3>Links</h3>
      <ul>
        ${links.map((link) => `
          <li><a href="${escapeHTML(link.url)}" target="_blank" rel="noopener">${escapeHTML(link.label)}</a></li>
        `).join("")}
      </ul>
    </div>
  `;
}

function renderCards() {
  const container = document.getElementById("cards");
  const items = getFilteredItems();

  if (!items.length) {
    container.innerHTML = `<div class="empty">No matching leadership entries.</div>`;
    return;
  }

  container.innerHTML = items.map((item) => `
    <article class="card" id="${escapeHTML(item.id)}">
      <button class="card-button" type="button" aria-expanded="false">
        <img class="portrait" src="${escapeHTML(item.image)}" alt="${escapeHTML(item.imageAlt || item.name)}" loading="lazy">
        <span class="card-title">
          <span class="person-name">${escapeHTML(item.name)}</span>
          <span class="person-role">${escapeHTML(item.role)}</span>
        </span>
        <span class="chevron" aria-hidden="true">▼</span>
      </button>

      <div class="card-body">
        <div class="tag-row">
          ${(item.tags || []).map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}
        </div>

        ${optionalField("Office", item.office)}
        ${optionalField("Started", item.started)}
        ${optionalField("Reports to", item.reportsTo)}
        ${optionalField("Email", item.email)}
        ${optionalField("Pronunciation", item.pronunciation)}
        ${optionalField("Previous role", item.previousRole)}
        ${optionalField("Education", item.education)}
        ${optionalField("Interests", item.interests)}
        ${optionalField("Fun fact", item.funFact)}

        <div class="extra-section">
          <h3>Key Details</h3>
          <ul>
            ${(item.details || []).map((detail) => `<li>${escapeHTML(detail)}</li>`).join("")}
          </ul>
        </div>

        ${optionalList("Volunteer Questions", item.questionsVolunteersAsk)}
        ${optionalLinks(item.links)}

        ${item.notes ? `<p class="notes">${escapeHTML(item.notes)}</p>` : ""}
      </div>
    </article>
  `).join("");

  container.querySelectorAll(".card-button").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".card");
      card.classList.toggle("open");
      button.setAttribute("aria-expanded", card.classList.contains("open"));
    });
  });
}

function setupControls() {
  document.getElementById("searchInput").addEventListener("input", renderCards);
  document.getElementById("tagFilter").addEventListener("change", renderCards);
}

function setupPanels() {
  const help = document.getElementById("helpPanel");

  document.getElementById("helpBtn").addEventListener("click", () => {
    help.hidden = !help.hidden;
  });

  document.getElementById("closeHelpBtn").addEventListener("click", () => {
    help.hidden = true;
  });
}

function restoreUpdateMessage() {}

function setupClearCache() {}

function registerServiceWorker() {}