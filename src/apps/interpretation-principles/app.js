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

function makeNode(tag, className, parent, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = String(value ?? '');
  if (parent) parent.appendChild(node);
  return node;
}

function safeLink(url) {
  const value = String(url ?? '').trim();
  if (/^(?:javascript|data|vbscript):/i.test(value)) return null;
  try {
    const parsed = new URL(value, location.href);
    return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : null;
  } catch { return null; }
}

function renderLinks(id, links) {
  const target = document.getElementById(id);
  if (!target) return;
  target.replaceChildren();
  (links || []).forEach(link => {
    const href = safeLink(link.url);
    if (!href) return;
    const anchor = makeNode('a', '', target, link.label);
    anchor.href = href;
  });
}

function renderPrinciples() {
  const results = window.MBA_APP.principles.filter(matchesFilters);
  list.replaceChildren();
  if (!results.length) {
    const empty = makeNode('section', 'quick-card', list);
    makeNode('p', '', empty, 'No matching principle. Try another tag or search term.');
  } else results.forEach(principle => list.appendChild(principleCardNode(principle)));
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

function principleCardNode(principle) {
  const article = makeNode('article', 'principle');
  article.id = String(principle.id);
  article.dataset.number = String(principle.number);
  const button = makeNode('button', 'toggle', article);
  button.type = 'button';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'panel-' + principle.id);
  makeNode('span', 'num', button, principle.number);
  const labels = makeNode('span', 'toggle-text', button);
  makeNode('span', 'principle-name', labels, principle.name);
  makeNode('span', 'principle-tagline', labels, principle.tagline);
  const chevron = makeNode('span', 'chevron', button, '⌄');
  chevron.setAttribute('aria-hidden', 'true');
  const panel = makeNode('div', 'panel', article);
  panel.id = 'panel-' + principle.id;
  panel.hidden = true;
  makeNode('p', '', panel, principle.body);
  const prompt = makeNode('div', 'quick-prompt', panel);
  makeNode('strong', '', prompt, 'Floor prompt:');
  prompt.appendChild(document.createTextNode(' ' + String(principle.quickPrompt ?? '')));
  makeNode('div', 'examples-label', panel, principle.examplesLabel);
  if (principle.dialogue) {
    const dialogue = makeNode('div', 'dialogue', panel);
    principle.dialogue.forEach(item => {
      makeNode('span', 'speaker', dialogue, item.speaker);
      makeNode('span', '', dialogue, item.line);
    });
  } else {
    const examples = makeNode('ul', 'examples', panel);
    (principle.examples || []).forEach(example => makeNode('li', '', examples, example));
  }
  button.addEventListener('click', () => togglePanel(button));
  return article;
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
