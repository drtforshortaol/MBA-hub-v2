const DATA = window.APP_DATA;
const STORAGE_NOTICE_KEY = "mba-northern-elephant-seal-notice-dismissed-v1-1";
const CACHE_MESSAGE_KEY = "mba-northern-elephant-seal-cache-message";
const APP_CACHE_PREFIX = "mba-northern-elephant-seal";
const imageByKey = Object.fromEntries((DATA.images || []).map(img => [img.key, img]));
let sectionRecords = [];

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugify(value) {
  return String(value || "section").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function para(text) {
  return String(text || "").split("\n").filter(Boolean).map(t => `<p>${escapeHTML(t)}</p>`).join("");
}

function list(items) {
  return `<ul>${(items || []).map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`;
}

function imageHtml(keys, layoutClass = "two") {
  const figures = keys.map(key => {
    const img = imageByKey[key];
    if (!img) return "";
    return `<figure class="fig"><img src="${escapeHTML(img.src)}" alt="${escapeHTML(img.alt)}" loading="lazy"><figcaption class="cap">${escapeHTML(img.caption)}</figcaption></figure>`;
  }).join("");
  return `<div class="fig-grid ${layoutClass}">${figures}</div>`;
}

function gridFromObject(obj) {
  return `<div class="grid2">${Object.entries(obj || {}).map(([k, v]) => `<div class="cell"><div class="key">${escapeHTML(k.replace(/([A-Z])/g, " $1"))}</div><div class="val">${escapeHTML(v)}</div></div>`).join("")}</div>`;
}

function accordionItem(section, open = false) {
  const id = `section-${slugify(section.title)}`;
  return `<article class="item" data-search-text="${escapeHTML(section.searchText)}"><button class="trigger" type="button" aria-expanded="${open}" aria-controls="${id}"><span class="ticon">${section.icon}</span><span class="ttext"><span class="ttitle">${escapeHTML(section.title)}</span><span class="tsub">${escapeHTML(section.sub)}</span></span><span class="chev">▼</span></button><div class="panel ${open ? "open" : ""}" id="${id}"><div class="panel-inner">${section.html}</div></div></article>`;
}

function buildSections() {
  const snap = DATA.snapshot;
  const natural = DATA.naturalHistory;
  const qaHtml = DATA.visitorQuestions.map(q => `<div class="qa"><h3>${escapeHTML(q.question)}</h3><p>${escapeHTML(q.answer)}</p></div>`).join("");
  const tagsHtml = `<div class="chips">${DATA.tags.map(t => `<span class="chip">${escapeHTML(t)}</span>`).join("")}</div>`;
  const relatedHtml = `<div class="related">${DATA.relatedItems.map(item => `<a href="${escapeHTML(item.url)}"><b>${escapeHTML(item.title)}</b><small>${escapeHTML(item.type)} · ${escapeHTML(item.tags.join(", "))}</small></a>`).join("")}</div>`;
  const referencesHtml = `<div class="references">${DATA.references.map(ref => `<div class="ref-card"><b>${escapeHTML(ref.title)}</b><span>${escapeHTML(ref.text)}</span></div>`).join("")}</div>`;
  const naturalHtml = `${gridFromObject({Habitat: natural.habitat, Range: natural.range, Depth: natural.depth, Predators: natural.predators, Behavior: natural.behavior, Lifespan: natural.lifespan, "Conservation Status": natural.conservationStatus})}<div class="callout"><b>Adaptations:</b> ${escapeHTML(natural.adaptations.join(" "))}</div>`;
  const dietHtml = `${imageHtml(["diet_diagram"], "two")}${para(natural.diet)}<p>Nighttime foraging connects northern elephant seals to the deep scattering layer and twilight-zone food web. Use this section when visitors ask what they eat, how they find prey, or why deep-sea animals matter.</p>`;

  return [
    { icon: "📌", title: "Snapshot / Quick Facts", sub: "Size, diet, predators, range, depth, and status", html: `${imageHtml(["size_compare", "size_sketch"], "two")}${gridFromObject(snap)}`, searchText: `snapshot quick facts size weight diet predators habitat depth range lifespan conservation status ${Object.values(snap).join(" ")}` },
    { icon: "📍", title: "Where to See It", sub: "MBA cart use and California coastal viewing", html: `${imageHtml(["migration_map", "cons_basics"], "two")}${para(DATA.whereToSee)}`, searchText: `where see MBA aquarium Año Nuevo Piedras Blancas migration map coastal viewing ${DATA.whereToSee}` },
    { icon: "🔎", title: "Natural History", sub: "Habitat, behavior, adaptations, and ecology", html: naturalHtml, searchText: `natural history habitat range depth predators behavior adaptations lifespan conservation ${Object.values(natural).join(" ")}` },
    { icon: "🗓️", title: "Annual Cycle and Rookery", sub: "Breeding, pups, molting, haul-out, and social structure", html: `${imageHtml(["calendar", "rookery_scene"], "two")}${para(DATA.breedingCycle)}`, searchText: `annual cycle rookery breeding pups molting haul out alpha male peripheral male female super weaner ${DATA.breedingCycle}` },
    { icon: "💤", title: "Sleep Science", sub: "Underwater naps, bilateral sleep, and comparison with dolphins", html: `${imageHtml(["sleep_diagram"], "two")}${para(DATA.sleepScience)}`, searchText: `sleep science underwater naps bilateral sleep unihemispheric dolphins true seals phocids ${DATA.sleepScience}` },
    { icon: "📈", title: "Buoyancy and Drift Dives", sub: "How body condition changes during foraging", html: `${imageHtml(["buoyancy_chart"], "two")}${para(DATA.buoyancy)}`, searchText: `buoyancy drift dives negative buoyancy positive buoyancy body fat foraging ${DATA.buoyancy}` },
    { icon: "🐟", title: "Diet", sub: "Fish, squid, and deep-sea prey", html: dietHtml, searchText: `diet fish squid lanternfish hake ratfish ragfish shark ray chimaera chimeras twilight zone vertical migration ${natural.diet}` },
    { icon: "💙", title: "Conservation Comeback", sub: "Near-extinction, protection, recovery, and modern threats", html: `${imageHtml(["cons_comeback", "cons_success"], "two")}${para(DATA.conservation)}`, searchText: `conservation comeback hunting oil protection recovery least concern threats entanglement climate ${DATA.conservation}` },
    { icon: "🎈", title: "Short Fun Kids Fact", sub: "A quick fact children remember", html: para(DATA.kidsFact), searchText: `kids children fun fact ${DATA.kidsFact}` },
    { icon: "🌊", title: "Story", sub: "A short spoken mini-script", html: para(DATA.story), searchText: `story script ${DATA.story}` },
    { icon: "🏖️", title: "Beach-Safe Visitor Message", sub: "What visitors should do around resting seals", html: para(DATA.beachSafety), searchText: `beach safety visitor message resting seals distance dogs signs barriers touch feed rescue ${DATA.beachSafety}` },
    { icon: "🙋", title: "Visitor Q & A", sub: "Guide-friendly answers to common questions", html: qaHtml, searchText: `visitor questions answers ${DATA.visitorQuestions.map(q => `${q.question} ${q.answer}`).join(" ")}` },
    { icon: "🧭", title: "Guide Notes", sub: "Talking points for volunteers", html: list(DATA.guideNotes), searchText: `guide notes talking points volunteers ${DATA.guideNotes.join(" ")}` },
    { icon: "🏷️", title: "Tags", sub: "Cross-link tags for the MBA Hub", html: tagsHtml, searchText: `tags ${DATA.tags.join(" ")}` },
    { icon: "🔗", title: "Related Items", sub: "Suggested companion apps", html: relatedHtml, searchText: `related items apps ${DATA.relatedItems.map(item => `${item.title} ${item.type} ${item.tags.join(" ")}`).join(" ")}` },
    { icon: "📚", title: "References and Image Notes", sub: "Sources, image notes, and verification reminders", html: referencesHtml, searchText: `references sources image notes ${DATA.references.map(ref => `${ref.title} ${ref.text}`).join(" ")}` },
    { icon: "🗓️", title: "Version / Last Updated", sub: "Publication metadata", html: `<p><b>Version:</b> ${escapeHTML(DATA.version)}</p><p><b>Last updated:</b> ${escapeHTML(DATA.lastUpdated)}</p>`, searchText: `version last updated ${DATA.version} ${DATA.lastUpdated}` }
  ];
}

function buildApp() {
  document.querySelector("#app-title").textContent = DATA.title;
  document.querySelector("#scientific-name").textContent = DATA.scientificName;
  document.querySelector("#summary").textContent = DATA.summary;
  document.querySelector("#footerVersion").textContent = `${DATA.title} · v${DATA.version} · Last updated ${DATA.lastUpdated}`;
  const snap = DATA.snapshot;
  document.querySelector("#snapshot-strip").innerHTML = [["Length", snap.lengthSize], ["Weight", snap.weight], ["Diet", snap.diet], ["Depth", snap.depth], ["Status", snap.conservationStatus]].map(([k, v]) => `<div class="stat"><div class="key">${escapeHTML(k)}</div><div class="val">${escapeHTML(v)}</div></div>`).join("");
  sectionRecords = buildSections();
  document.querySelector("#accordion").innerHTML = sectionRecords.map(section => accordionItem(section, false)).join("");
  setupAccordion();
}

function setupAccordion() {
  document.querySelectorAll(".trigger").forEach(btn => {
    btn.addEventListener("click", () => {
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      panel.classList.toggle("open", !expanded);
    });
  });

}

function setupSearch() {
  const input = document.querySelector("#searchInput");
  const reset = document.querySelector("#clearSearchBtn");
  const status = document.querySelector("#searchStatus");
  function runSearch() {
    const term = input.value.trim().toLowerCase();
    const items = Array.from(document.querySelectorAll(".item"));
    let matches = 0;
    items.forEach(item => {
      const text = item.getAttribute("data-search-text").toLowerCase();
      const isMatch = !term || text.includes(term);
      item.classList.toggle("hidden-by-search", !isMatch);
      if (isMatch) {
        matches += 1;
        if (term) {
          const btn = item.querySelector(".trigger");
          const panel = item.querySelector(".panel");
          btn.setAttribute("aria-expanded", "true");
          panel.classList.add("open");
        }
      }
    });
    status.textContent = term ? `Showing ${matches} matching section${matches === 1 ? "" : "s"} for “${term}”.` : "Showing all sections.";
  }
  input.addEventListener("input", runSearch);
  reset.addEventListener("click", () => { input.value = ""; runSearch(); input.focus(); });
}

function setupTopControls() {
  const clearBtn = document.querySelector("#clearCacheBtn");
  const troubleBtn = document.querySelector("#troubleBtn");
  const panel = document.querySelector("#troubleshootingPanel");
  const closeBtn = document.querySelector("#closeTroubleBtn");
  clearBtn.addEventListener("click", clearAppCache);
  function openTrouble() { panel.hidden = false; troubleBtn.setAttribute("aria-expanded", "true"); closeBtn.focus(); }
  function closeTrouble() { panel.hidden = true; troubleBtn.setAttribute("aria-expanded", "false"); troubleBtn.focus(); }
  troubleBtn.addEventListener("click", () => panel.hidden ? openTrouble() : closeTrouble());
  closeBtn.addEventListener("click", closeTrouble);
  panel.addEventListener("click", event => { if (event.target === panel) closeTrouble(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !panel.hidden) closeTrouble(); });
}

async function clearAppCache() {}

function restoreCacheMessage() {
  const message = localStorage.getItem(('mba-v2:'+location.pathname.split('/apps/')[0]+':'+(CACHE_MESSAGE_KEY)));
  if (!message) return;
  localStorage.removeItem(('mba-v2:'+location.pathname.split('/apps/')[0]+':'+(CACHE_MESSAGE_KEY)));
  const notice = document.querySelector("#notice");
  notice.hidden = false;
  notice.querySelector("div").innerHTML = `<strong>${escapeHTML(message)}</strong>`;
}

function restoreNotice() {
  const notice = document.querySelector("#notice");
  const dismissBtn = document.querySelector("#dismissNoticeBtn");
  if (localStorage.getItem(('mba-v2:'+location.pathname.split('/apps/')[0]+':'+(STORAGE_NOTICE_KEY))) === "yes") notice.hidden = true;
  dismissBtn.addEventListener("click", () => { notice.hidden = true; localStorage.setItem(('mba-v2:'+location.pathname.split('/apps/')[0]+':'+(STORAGE_NOTICE_KEY)), "yes"); });
}

function registerServiceWorker() {}

document.addEventListener("DOMContentLoaded", () => { buildApp(); registerServiceWorker(); });
