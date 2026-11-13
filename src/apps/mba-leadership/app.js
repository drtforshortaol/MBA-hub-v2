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
  container.replaceChildren();

  links.forEach((link) => {
    const disabled = !link.targetId;
    const button = document.createElement("button");
    button.className = disabled ? "quick-link disabled" : "quick-link";
    button.type = "button";
    button.disabled = disabled;
    button.dataset.target = link.targetId || "";
    button.textContent = link.label || "";
    container.appendChild(button);
  });

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

function appendOptionalField(parent, label, value) {
  if (!value) return;
  const p = document.createElement("p");
  p.className = "field";
  const strong = document.createElement("strong");
  strong.textContent = label + ":";
  p.append(strong, " " + value);
  parent.appendChild(p);
}

function appendSection(parent, title, values) {
  const section = document.createElement("div");
  section.className = "extra-section";
  const heading = document.createElement("h3");
  heading.textContent = title;
  const list = document.createElement("ul");
  values.forEach((value) => {
    const li = document.createElement("li");
    if (typeof value === "string") {
      li.textContent = value;
    } else {
      const url = safeLeadershipUrl(value.url);
      if (!url) return;
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noopener";
      anchor.textContent = value.label || "";
      li.appendChild(anchor);
    }
    list.appendChild(li);
  });
  section.append(heading, list);
  parent.appendChild(section);
}

function safeLeadershipUrl(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value, document.baseURI);
    return ["https:", "http:", "mailto:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function renderCards() {
  const container = document.getElementById("cards");
  const items = getFilteredItems();
  container.replaceChildren();

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No matching leadership entries.";
    container.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.id = item.id;
    const button = document.createElement("button");
    button.className = "card-button";
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    const portrait = document.createElement("img");
    portrait.className = "portrait";
    portrait.alt = item.imageAlt || item.name;
    portrait.loading = "lazy";
    const imageUrl = safeLeadershipUrl(item.image);
    if (imageUrl) portrait.src = imageUrl;
    const title = document.createElement("span");
    title.className = "card-title";
    for (const [className, value] of [["person-name", item.name], ["person-role", item.role]]) {
      const span = document.createElement("span");
      span.className = className;
      span.textContent = value || "";
      title.appendChild(span);
    }
    const chevron = document.createElement("span");
    chevron.className = "chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.textContent = "▼";
    button.append(portrait, title, chevron);

    const body = document.createElement("div");
    body.className = "card-body";
    const tags = document.createElement("div");
    tags.className = "tag-row";
    (item.tags || []).forEach((tag) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = tag;
      tags.appendChild(span);
    });
    body.appendChild(tags);
    for (const [label, value] of [
      ["Office", item.office], ["Started", item.started],
      ["Reports to", item.reportsTo], ["Email", item.email],
      ["Pronunciation", item.pronunciation], ["Previous role", item.previousRole],
      ["Education", item.education], ["Interests", item.interests],
      ["Fun fact", item.funFact]
    ]) appendOptionalField(body, label, value);

    appendSection(body, "Key Details", item.details || []);
    if (item.questionsVolunteersAsk?.length) {
      appendSection(body, "Volunteer Questions", item.questionsVolunteersAsk);
    }
    if (item.links?.length) appendSection(body, "Links", item.links);
    if (item.notes) {
      const notes = document.createElement("p");
      notes.className = "notes";
      notes.textContent = item.notes;
      body.appendChild(notes);
    }
    card.append(button, body);
    container.appendChild(card);
    button.addEventListener("click", () => {
      card.classList.toggle("open");
      button.setAttribute("aria-expanded", String(card.classList.contains("open")));
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