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

function renderHero() {
  const hero = document.getElementById("heroImage");
  const image = data.images && data.images[0];
  if (!image) {
    hero.classList.add("hidden");
    return;
  }
  hero.innerHTML = `<img src="${escapeAttr(image.src)}" alt="${escapeAttr(image.alt)}" loading="eager" />
    <figcaption>${escapeHtml(image.caption)}</figcaption>`;
}

function renderNotification() {
  const notice = document.getElementById("notificationArea");
  if (!data.notification || !data.notification.message) {
    notice.classList.add("hidden");
    return;
  }
  notice.innerHTML = `<p><strong>${escapeHtml(data.notification.title)}:</strong> ${escapeHtml(data.notification.message)}</p>`;
}

function renderFaq() {
  const faqList = document.getElementById("faqList");
  faqList.innerHTML = data.troubleshootingFaq.map(item => qa(item.question, item.answer)).join("");
}

function renderSections() {
  const container = document.getElementById("sections");
  container.innerHTML = sectionDefinitions.map((section, index) => {
    const id = slug(section.title);
    return `<details id="${id}" ${index < 3 ? "open" : ""} data-section>
      <summary>${escapeHtml(section.title)}</summary>
      <div class="section-body">${section.render()}</div>
    </details>`;
  }).join("");
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
  status.innerHTML = `<p>${escapeHtml(message)}</p>`;
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
