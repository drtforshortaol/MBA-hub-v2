const CACHE_MESSAGE_KEY = "interpretation-principles-cache-message";

const state = { query: "", tag: "" };

const list = document.getElementById("principlesList");
const searchInput = document.getElementById("searchInput");
const tagSelect = document.getElementById("tagSelect");
const tagCloud = document.getElementById("tagCloud");
const resetBtn = document.getElementById("resetBtn");
const statusMessage = document.getElementById("statusMessage");
const installDialog = document.getElementById("installDialog");
const troubleshootingDialog = document.getElementById("troubleshootingDialog");

document.addEventListener("DOMContentLoaded", () => {
  renderPrinciples();
  setupEvents();
  restoreUpdateMessage();
  registerServiceWorker();
});

function allTags() {
  const tags = new Set(window.MBA_APP.tags || []);
  window.MBA_APP.principles.forEach((principle) => {
    (principle.tags || []).forEach((tag) => tags.add(tag));
  });
  return [...tags].sort((a, b) => a.localeCompare(b));
}

function buildTags() {
  allTags().forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    tagSelect.appendChild(option);

    const chip = document.createElement("button");
    chip.className = "tag-chip";
    chip.type = "button";
    chip.textContent = tag;
    chip.addEventListener("click", () => setTag(tag));
    tagCloud.appendChild(chip);
  });
}

function buildLinks() {
  renderLinks("hubLinks", window.MBA_APP.hubLinks);
  renderLinks("relatedLinks", window.MBA_APP.relatedApps);
}

function renderLinks(id, links) {
  const target = document.getElementById(id);
  target.innerHTML = links
    .map((link) => `<a href="${escapeHTML(link.url)}">${escapeHTML(link.label)}</a>`)
    .join("");
}

function renderPrinciples() {
  const results = window.MBA_APP.principles.filter(matchesFilters);
  list.innerHTML = results.map(principleCard).join("") ||
    `<section class="quick-card"><p>No matching principle. Try another tag or search term.</p></section>`;

  list.querySelectorAll(".toggle").forEach((btn) => {
    btn.addEventListener("click", () => togglePanel(btn));
  });
}

function matchesFilters(principle) {
  const haystack = [
    principle.name,
    principle.tagline,
    principle.summary,
    principle.body,
    principle.quickPrompt,
    ...(principle.examples || []),
    ...(principle.tags || [])
  ].join(" ").toLowerCase();

  const queryOK = !state.query || haystack.includes(state.query.toLowerCase());
  const tagOK = !state.tag || (principle.tags || []).includes(state.tag) || (window.MBA_APP.tags || []).includes(state.tag);
  return queryOK && tagOK;
}

function principleCard(principle) {
  const examples = principle.dialogue
    ? dialogueMarkup(principle.dialogue)
    : `<ul class="examples">${principle.examples.map((example) => `<li>${escapeHTML(example)}</li>`).join("")}</ul>`;

  return `
    <article class="principle" id="${escapeHTML(principle.id)}" data-number="${principle.number}">
      <button class="toggle" aria-expanded="false" aria-controls="panel-${escapeHTML(principle.id)}" type="button">
        <span class="num">${principle.number}</span>
        <span class="toggle-text">
          <span class="principle-name">${escapeHTML(principle.name)}</span>
          <span class="principle-tagline">${escapeHTML(principle.tagline)}</span>
        </span>
        <span class="chevron" aria-hidden="true">⌄</span>
      </button>

      <div class="panel" id="panel-${escapeHTML(principle.id)}" hidden>
        <p>${escapeHTML(principle.body)}</p>
        <div class="quick-prompt"><strong>Floor prompt:</strong> ${escapeHTML(principle.quickPrompt)}</div>
        <div class="examples-label">${escapeHTML(principle.examplesLabel)}</div>
        ${examples}
      </div>
    </article>`;
}

function dialogueMarkup(lines) {
  return `<div class="dialogue">${lines
    .map((item) => `<span class="speaker">${escapeHTML(item.speaker)}</span><span>${escapeHTML(item.line)}</span>`)
    .join("")}</div>`;
}

function togglePanel(btn) {
  const expanded = btn.getAttribute("aria-expanded") === "true";
  const panel = document.getElementById(btn.getAttribute("aria-controls"));
  const card = btn.closest(".principle");

  btn.setAttribute("aria-expanded", String(!expanded));
  panel.hidden = expanded;
  card.classList.toggle("open", !expanded);
}

function setTag(tag) {
  state.tag = tag;
  tagSelect.value = tag;
  renderPrinciples();
}

function setupEvents() {
  // Principle dropdowns are bound in renderPrinciples().
}

function showStatus(message) {
  statusMessage.textContent = message;
  statusMessage.hidden = false;
  localStorage.setItem(('mba-v2:'+location.pathname.split('/apps/')[0]+':'+(CACHE_MESSAGE_KEY)), message);
}

function restoreUpdateMessage() {}

async function clearAppCache() {}

function registerServiceWorker() {}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
