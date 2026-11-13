import {sections} from './data.js';

const briefing = document.getElementById('briefing');

function append(parent, tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  parent.append(element);
  return element;
}

const diagrams = {
  'life-cycle': {
    title: 'From reef eggs to a breeding group',
    steps: ['Eggs near the host anemone', 'Larvae drift in open water', 'Immature juveniles settle on a reef', 'Breeding male can become female if the breeding female is lost']
  },
  'anemone-partnership': {
    title: 'How mucus may reduce stinging',
    steps: ['Clownfish brushes an anemone tentacle', 'Skin mucus has low levels of some sialic acids', 'Fewer chemical cues may reduce stinging-cell discharge'],
    source: 'https://www.pnas.org/doi/10.1073/pnas.2419716122'
  }
};

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
  const diagram = diagrams[section.id];
  if (diagram) {
    const figure = append(content, 'figure', '');
    figure.className = 'process-diagram';
    append(figure, 'figcaption', diagram.title);
    const steps = append(figure, 'ol', '');
    for (const step of diagram.steps) append(steps, 'li', step);
    if (diagram.source) {
      const source = append(figure, 'a', 'Read the sialic acid study');
      source.href = diagram.source;
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
