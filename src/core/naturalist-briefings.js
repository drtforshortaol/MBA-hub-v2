const briefingId = /^naturalist-briefing-(\d{4})(\d{2})(\d{2})$/;

export function naturalistBriefings(apps) {
  return apps.filter(app => app.category === 'aquarium-updates' && app.type === 'field-notes' &&
    app.listed !== false && briefingId.test(app.app_id) && app.entry_point === `apps/${app.app_id}/index.html`)
    .sort((a, b) => b.app_id.localeCompare(a.app_id));
}

export function addBriefingsToArchive(notes, apps) {
  let added = false;
  for (const app of naturalistBriefings(apps).reverse()) {
    const [, year, month, day] = briefingId.exec(app.app_id);
    const date = `${year}-${month}-${day}`;
    if (notes.some(note => note.id === date || note.id.startsWith(date + '-'))) continue;
    notes.unshift({
      id: date + '-briefing',
      date: app.title.split(' · ').at(-1),
      title: app.title,
      summary: [],
      observations: [{
        title: 'Full briefing',
        text: 'Read the complete briefing, including Bay Watch sightings and the species highlight.',
        links: [{ label: 'Open Naturalist Briefing', url: '../../' + app.entry_point }]
      }],
      qa: [], bay: [], highlights: []
    });
    added = true;
  }
  return added;
}
