import {sections} from './data.js';

const briefing = document.getElementById('briefing');

function append(parent, tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  parent.append(element);
  return element;
}

for (const section of sections) {
  const card = append(briefing, 'details', '');
  card.id = section.id;
  append(card, 'summary', section.title);
  const content = append(card, 'div', '');
  content.className = 'card-content';
  for (const paragraph of section.paragraphs) append(content, 'p', paragraph);
  for (const group of section.groups ?? []) {
    append(content, 'h2', group.title);
    const list = append(content, 'ul', '');
    for (const item of group.items) append(list, 'li', item);
  }
  if (section.links?.length) {
    append(content, 'h2', 'Further reading');
    const list = append(content, 'ul', '');
    for (const [label, url] of section.links) {
      const link = append(append(list, 'li', ''), 'a', label);
      link.href = url;
    }
  }
}

for (const [id, open] of [['expand', true], ['collapse', false]]) {
  document.getElementById(id).addEventListener('click', () => {
    for (const card of briefing.querySelectorAll('details')) card.open = open;
  });
}
