/** Pure registry validation; never rewrites canonical identifiers. */
export function validateRegistry(entries) {
  if (!Array.isArray(entries)) throw new TypeError('Registry must be an array');
  const seen = new Set(); const errors = [];
  entries.forEach((entry, index) => {
    const id = entry && typeof entry.id === 'string' ? entry.id.trim() : '';
    if (!id) errors.push({index, reason:'missing-id'});
    else if (seen.has(id)) errors.push({index, id, reason:'duplicate-id'});
    else seen.add(id);
    if (!entry || typeof entry.path !== 'string' || !entry.path.trim() || /^(?:https?:)?\/\//i.test(entry.path) || entry.path.includes('..')) errors.push({index, id, reason:'invalid-local-path'});
  });
  return {valid:errors.length===0, errors, count:entries.length};
}
