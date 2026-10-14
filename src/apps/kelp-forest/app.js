const data = window.APP_DATA;

const sectionDefinitions = [
  {
    title: "Quick Facts",
    render: () => `<div class="grid two">${data.quickFacts.map(item => `<div class="fact">${escapeHtml(item)}</div>`).join("")}</div>`
  },
  {
    title: "Short Fun Kids Fact",
    render: () => `<p>${escapeHtml(data.kidsFact)}</p>`
  },
  {
    title: "Story",
    render: () => paragraphs(data.story)
  },
  {
    title: "Main Content",
    render: () => `<div class="grid">${data.mainContent.map(item => card(item.heading, item.body)).join("")}</div>`
  },
  {
    title: "Visitor Questions",
    render: () => `<div class="grid">${data.visitorQuestions.map(item => qa(item.question, item.answer)).join("")}</div>`
  },
  {
    title: "Guide Notes",
    render: () => `<ul>${data.guideNotes.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
  },
  {
    title: "Tags",
    render: () => `<div class="tags">${data.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>`
  },
  {
    title: "Related Items",
    render: () => `<div class="grid two">${data.relatedItems.map(item => related(item)).join("")}</div>`
  },
  {
    title: "References and Sources",
    render: () => `<div class="grid">${data.references.map(item => reference(item)).join("")}</div>`
  },
  {
    title: "Version / Last Updated",
    render: () => `<p><strong>Version:</strong> ${escapeHtml(data.version)}</p><p><strong>Last updated:</strong> ${escapeHtml(data.lastUpdated)}</p>`
  }
];

function init() {
  if (!data) return;

  document.title = `${data.title} | MBA Hub`;
  document.getElementById("appTitle").textContent = data.title;
  document.getElementById("appSummary").textContent = data.summary;
  document.getElementById("appMeta").textContent = `${data.category} · ${data.contentType} · ${data.locationType}`;
  document.getElementById("versionLine").textContent = `Version ${data.version} · Last updated ${data.lastUpdated}`;

  renderHero();
  renderNotification();
  renderFaq();
  renderSections();
  setupJump();
  setupSearch();
  setupTroubleshooting();
  setupClearCache();
  registerServiceWorker();
}

function node(tag, cls, parent, value) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (value !== undefined) el.textContent = String(value ?? '');
  if (parent) parent.appendChild(el);
  return el;
}

function safeUrl(value) {
  if (!value || value === '#') return '#';
  try {
    const url = new URL(String(value), location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '#';
  } catch { return '#'; }
}

function addParagraphs(parent, value) {
  String(value ?? '').split(/\\n\\s*\\n/).filter(Boolean)
    .forEach(part => node('p', '', parent, part));
}

function addCard(parent, title, body, cls = 'card') {
  const article = node('article', cls, parent);
  node('h3', '', article, title);
  addParagraphs(article, body);
}

function addTags(parent, tags) {
  const wrap = node('div', 'tags', parent);
  (tags || []).forEach(tag => node('span', 'tag', wrap, tag));
}

function renderHero() {
  const hero = document.getElementById('heroImage');
  const image = data.images && data.images[0];
  hero.replaceChildren();
  if (!image) { hero.classList.add('hidden'); return; }
  hero.classList.remove('hidden');
  const img = node('img', '', hero);
  img.src = safeUrl(image.src);
  img.alt = String(image.alt ?? '');
  img.loading = 'eager';
  node('figcaption', '', hero, image.caption);
}

function renderNotification() {
  const notice = document.getElementById('notificationArea');
  notice.replaceChildren();
  if (!data.notification || !data.notification.message) {
    notice.classList.add('hidden');
    return;
  }
  notice.classList.remove('hidden');
  const p = node('p', '', notice);
  node('strong', '', p, String(data.notification.title ?? '') + ':');
  p.appendChild(document.createTextNode(' ' + data.notification.message));
}

function renderFaq() {
  const faqList = document.getElementById('faqList');
  faqList.replaceChildren();
  (data.troubleshootingFaq || []).forEach(item => addCard(faqList, item.question, item.answer, 'qa'));
}

function renderSectionBody(parent, index) {
  const grid = (cls = 'grid') => node('div', cls, parent);
  switch (index) {
    case 0:
      (data.quickFacts || []).forEach(item => node('div', 'fact', gridHolder(), item));
      break;
    case 1: node('p', '', parent, data.kidsFact); break;
    case 2: addParagraphs(parent, data.story); break;
    case 3: {
      const holder = grid();
      (data.mainContent || []).forEach(item => addCard(holder, item.heading, item.body));
      break;
    }
    case 4: {
      const holder = grid();
      (data.visitorQuestions || []).forEach(item => addCard(holder, item.question, item.answer, 'qa'));
      break;
    }
    case 5: {
      const ul = node('ul', '', parent);
      (data.guideNotes || []).forEach(item => node('li', '', ul, item));
      break;
    }
    case 6: addTags(parent, data.tags); break;
    case 7: {
      const holder = grid('grid two');
      (data.relatedItems || []).forEach(item => {
        const card = node('article', 'related-card', holder);
        const heading = node('h3', '', card);
        const link = node('a', '', heading, item.title);
        link.href = safeUrl(item.url);
        node('p', '', card, item.type);
        addTags(card, item.tags);
      });
      break;
    }
    case 8: {
      const holder = grid();
      (data.references || []).forEach(item => addCard(holder, item.title, item.detail, 'reference-card'));
      break;
    }
    case 9: {
      const p1 = node('p', '', parent);
      node('strong', '', p1, 'Version:');
      p1.appendChild(document.createTextNode(' ' + String(data.version ?? '')));
      const p2 = node('p', '', parent);
      node('strong', '', p2, 'Last updated:');
      p2.appendChild(document.createTextNode(' ' + String(data.lastUpdated ?? '')));
      break;
    }
  }
  function gridHolder() {
    let holder = parent.firstElementChild;
    if (!holder) holder = grid('grid two');
    return holder;
  }
}

function renderSections() {
  const container = document.getElementById('sections');
  container.replaceChildren();
  sectionDefinitions.forEach((section, index) => {
    const details = node('details', '', container);
    details.id = slug(section.title);
    details.dataset.section = '';
    details.open = index < 3;
    node('summary', '', details, section.title);
    renderSectionBody(node('div', 'section-body', details), index);
  });
}

function setupJump() {
  const jump = document.getElementById("sectionJump");
  sectionDefinitions.forEach(section => {
    const option = document.createElement("option");
    option.value = slug(section.title);
    option.textContent = section.title;
    jump.appendChild(option);
  });

  jump.addEventListener("change", () => {
    const id = jump.value;
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    target.open = true;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    jump.value = "";
  });
}

function setupSearch() {
  const search = document.getElementById("searchBox");
  search.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    document.querySelectorAll("[data-section]").forEach(section => {
      const match = !query || section.textContent.toLowerCase().includes(query);
      section.classList.toggle("hidden", !match);
      if (query && match) section.open = true;
    });
  });
}

function setupTroubleshooting() {}

function setupClearCache() {}

async function clearAppCache() {}

function showStatus(message) {
  const status = document.getElementById("cacheStatus");
  status.replaceChildren();
  node('p', '', status, message);
  status.classList.add("active");
}

function registerServiceWorker() {}

function card(title, body) {
  return `<article class="card"><h3>${escapeHtml(title)}</h3>${paragraphs(body)}</article>`;
}

function qa(question, answer) {
  return `<article class="qa"><h3>${escapeHtml(question)}</h3>${paragraphs(answer)}</article>`;
}

function related(item) {
  const tagLine = item.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  const safeUrl = item.url && item.url !== "#" ? escapeAttr(item.url) : "#";
  return `<article class="related-card">
    <h3><a href="${safeUrl}">${escapeHtml(item.title)}</a></h3>
    <p>${escapeHtml(item.type)}</p>
    <div class="tags">${tagLine}</div>
  </article>`;
}

function reference(item) {
  return `<article class="reference-card">
    <h3>${escapeHtml(item.title)}</h3>
    <p>${escapeHtml(item.detail)}</p>
  </article>`;
}

function paragraphs(text) {
  return String(text)
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map(part => `<p>${escapeHtml(part)}</p>`)
    .join("");
}

function slug(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

init();
