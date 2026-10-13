const APP_VERSION = 'information-center-v2.1.0';
const APP_CACHE_PREFIX = 'information-center';
const NOTICE_DISMISSED_KEY = 'information-center-notice-dismissed-v2.1.0';

const sections = window.IC_SECTIONS || [];
const openState = {};
let searchTerm = '';

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function plainTextFromBlock(block) {
  if (!block) return '';
  if (block.text) return block.text;
  if (block.heading || block.items) return [block.heading || '', ...(block.items || [])].join(' ');
  if (block.cards) return block.cards.map(c => [c.label, c.value, c.note].join(' ')).join(' ');
  return '';
}

function sectionText(section) {
  return [section.title, section.icon, ...(section.content || []).map(plainTextFromBlock)].join(' ').toLowerCase();
}

function highlight(text) {
  const safe = esc(text);
  const term = searchTerm.trim();
  if (!term) return safe;
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return safe.replace(new RegExp(`(${escapedTerm})`, 'gi'), '<mark>$1</mark>');
}

// Link complete North American telephone numbers; keep short internal extensions as text.
function phoneLinks(text) {
  return String(text ?? '').split(/(\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4})/g).map(part => {
    const digits=part.replace(/\D/g,'');
    return /^\d{10}$/.test(digits)
      ? '<a class="tap-phone" href="tel:+1'+digits+'" aria-label="Call '+esc(part)+'">'+highlight(part)+'</a>'
      : highlight(part);
  }).join('');
}
function renderBlock(block) {
  if (block.type === 'intro') return '<p class="intro-text">' + highlight(block.text) + '</p>';
  if (block.type === 'subheading') return '<p class="sub-heading">' + highlight(block.text) + '</p>';
  if (block.type === 'list') {
    let html = '';
    if (block.heading) html += '<p class="list-label">' + highlight(block.heading) + '</p>';
    html += '<ul class="bullet-list">' + (block.items || []).map(i => '<li>' + phoneLinks(i) + '</li>').join('') + '</ul>';
    return html;
  }
  if (block.type === 'numbered') {
    let html = '';
    if (block.heading) html += '<p class="list-label">' + highlight(block.heading) + '</p>';
    html += '<ol class="numbered-list">' + (block.items || []).map(i => '<li>' + phoneLinks(i) + '</li>').join('') + '</ol>';
    return html;
  }
  if (block.type === 'quickref') {
    return '<div class="quickref-grid">' + (block.cards || []).map(c =>
      '<div class="qr-card">' +
        '<div class="qr-label">' + highlight(c.label) + '</div>' +
        '<div class="qr-value">' + phoneLinks(c.value) + '</div>' +
        '<div class="qr-note">' + highlight(c.note) + '</div>' +
      '</div>'
    ).join('') + '</div>';
  }
  if (block.type === 'alertlist') {
    return '<ul class="alert-list">' + (block.items || []).map(i => '<li>' + highlight(i) + '</li>').join('') + '</ul>';
  }
  return '';
}

function renderSection(section) {
  const isOpen = !!openState[section.id];
  const isEmergency = !!section.emergency;
  const num = String(section.id).padStart(2, '0');
  const bodyHtml = (section.content || []).map(renderBlock).join('');
  return `
    <article class="section-card${isEmergency ? ' emergency' : ''}" id="card-${section.id}">
      <div class="section-header${isOpen ? ' open' : ''}" id="header-${section.id}" role="button" tabindex="0" aria-expanded="${isOpen}" data-section-id="${section.id}">
        <div class="section-left">
          <span class="section-num">${num}</span>
          <span class="section-icon">${section.icon}</span>
          <span class="section-title">${highlight(section.title)}</span>
        </div>
        <span class="chevron${isOpen ? ' open' : ''}" id="chevron-${section.id}">&#9660;</span>
      </div>
      <div class="section-body" id="body-${section.id}" style="display:${isOpen ? 'block' : 'none'}">
        ${bodyHtml}
      </div>
    </article>`;
}

function filteredSections() {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return sections;
  return sections.filter(section => sectionText(section).includes(term));
}

function renderAll() {
  const visibleSections = filteredSections();
  const container = document.getElementById('sectionsContainer');
  if (!container) return;

  if (!visibleSections.length) {
    container.innerHTML = '<div class="no-results">No matching handbook sections found.</div>';
  } else {
    container.innerHTML = visibleSections.map(renderSection).join('');
  }

  wireSectionHeaders();
  updateToggleBtn();
}

function toggle(id) {
  openState[id] = !openState[id];
  const body = document.getElementById('body-' + id);
  const header = document.getElementById('header-' + id);
  const chevron = document.getElementById('chevron-' + id);
  if (!body || !header || !chevron) return;
  body.style.display = openState[id] ? 'block' : 'none';
  header.setAttribute('aria-expanded', openState[id] ? 'true' : 'false');
  header.classList.toggle('open', openState[id]);
  chevron.classList.toggle('open', openState[id]);
  updateToggleBtn();
}

function handleHeaderKey(event, id) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggle(id);
  }
}

function wireSectionHeaders() {
  document.querySelectorAll('.section-header[data-section-id]').forEach(header => {
    const id = Number(header.dataset.sectionId);
    header.addEventListener('click', () => toggle(id));
    header.addEventListener('keydown', event => handleHeaderKey(event, id));
  });
}

function toggleAll() {
  const visibleSections = filteredSections();
  const allOpen = visibleSections.length && visibleSections.every(s => openState[s.id]);
  visibleSections.forEach(s => { openState[s.id] = !allOpen; });
  renderAll();
}

function updateToggleBtn() {
  const btn = document.getElementById('toggleAllBtn');
  if (!btn) return;
  const visibleSections = filteredSections();
  const allOpen = visibleSections.length && visibleSections.every(s => openState[s.id]);
  btn.textContent = allOpen ? 'Collapse All' : 'Expand All';
}

function jumpToSection(id) {
  openState[id] = true;
  renderAll();
  requestAnimationFrame(() => {
    const card = document.getElementById('card-' + id);
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function setupSearch() {
  const input = document.getElementById('searchInput');
  const clear = document.getElementById('clearSearchBtn');
  if (!input || !clear) return;

  input.addEventListener('input', () => {
    searchTerm = input.value;
    if (searchTerm.trim()) {
      sections.forEach(s => {
        if (sectionText(s).includes(searchTerm.trim().toLowerCase())) openState[s.id] = true;
      });
    }
    renderAll();
  });

  clear.addEventListener('click', () => {
    input.value = '';
    searchTerm = '';
    renderAll();
    input.focus();
  });
}

function setupQuickActions() {
  document.querySelectorAll('[data-jump]').forEach(button => {
    button.addEventListener('click', () => jumpToSection(Number(button.dataset.jump)));
  });

  const toggleAllBtn = document.getElementById('toggleAllBtn');
  if (toggleAllBtn) toggleAllBtn.addEventListener('click', toggleAll);
}

function setStatus(message, persistent = false) {
  const status = document.getElementById('statusMessage');
  if (!status) return;
  status.textContent = message;
  status.hidden = false;
  if (!persistent) {
    window.setTimeout(() => {
      status.hidden = true;
      status.textContent = '';
    }, 4500);
  }
}

function openTroubleshooting() {
  const panel = document.getElementById('troubleshootingPanel');
  const button = document.getElementById('troubleshootingBtn');
  if (!panel || !button) return;
  panel.hidden = false;
  button.setAttribute('aria-expanded', 'true');
  const closeBtn = document.getElementById('closeTroubleshootingBtn');
  if (closeBtn) closeBtn.focus({ preventScroll: true });
}

function closeTroubleshooting() {
  const panel = document.getElementById('troubleshootingPanel');
  const button = document.getElementById('troubleshootingBtn');
  if (!panel || !button) return;
  panel.hidden = true;
  button.setAttribute('aria-expanded', 'false');
}

function toggleTroubleshooting() {
  const panel = document.getElementById('troubleshootingPanel');
  if (!panel) return;
  if (panel.hidden) openTroubleshooting();
  else closeTroubleshooting();
}

async function clearAppCache() {}

function setupTopControls() {
  const clearCacheBtn = document.getElementById('clearAppCacheBtn');
  const troubleshootingBtn = document.getElementById('troubleshootingBtn');
  const closeBtn = document.getElementById('closeTroubleshootingBtn');
  const panel = document.getElementById('troubleshootingPanel');

  if (clearCacheBtn) clearCacheBtn.addEventListener('click', clearAppCache);
  if (troubleshootingBtn) troubleshootingBtn.addEventListener('click', toggleTroubleshooting);
  if (closeBtn) closeBtn.addEventListener('click', closeTroubleshooting);

  if (panel) {
    panel.addEventListener('click', event => {
      if (event.target === panel) closeTroubleshooting();
    });
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeTroubleshooting();
  });
}

function setupNotice() {
  const notice = document.getElementById('appNotice');
  const dismiss = document.getElementById('dismissNoticeBtn');
  if (!notice || !dismiss) return;

  if (localStorage.getItem(('mba-v2:'+location.pathname.split('/apps/')[0]+':'+(NOTICE_DISMISSED_KEY))) === 'true') {
    notice.hidden = true;
  }

  dismiss.addEventListener('click', () => {
    notice.hidden = true;
    localStorage.setItem(('mba-v2:'+location.pathname.split('/apps/')[0]+':'+(NOTICE_DISMISSED_KEY)), 'true');
  });
}

function registerServiceWorker() {}

document.addEventListener('DOMContentLoaded', () => {
  renderAll();
  setupSearch();
  setupQuickActions();
  setupTopControls();
  setupNotice();
  registerServiceWorker();
});
