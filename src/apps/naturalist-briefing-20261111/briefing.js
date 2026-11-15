import {sections, mediaBySection} from './data.js';

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
  for (const asset of mediaBySection[section.id] ?? []) {
    const figure = append(content, 'figure', '');
    const link = append(figure, 'a', '');
    link.href = new URL('../../' + asset.path, import.meta.url);
    link.target = '_blank';
    link.rel = 'noopener';
    const image = append(link, 'img', '');
    image.src = link.href;
    image.alt = asset.alt;
    image.loading = 'lazy';
    append(figure, 'figcaption', asset.alt + ' ' + asset.credit);
    if (asset.id === 'briefing-20261111-clownfish-sex-change') {
      append(figure, 'p', 'In this illustration, “born male” is shorthand. Juveniles are sexually immature, and the breeding male can become female.');
    }
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
