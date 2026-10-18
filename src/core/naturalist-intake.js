/** Draft-only Naturalist update intake. No publication or scientific approval. */
export function normalizeNaturalistUpdate(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('Update must be an object');
  const title = String(input.title ?? '').trim();
  const body = String(input.body ?? '').trim();
  if (!title || !body) throw new Error('Title and body are required');
  if (title.length > 160 || body.length > 20000) throw new Error('Update exceeds limits');
  const categories = [...new Set((Array.isArray(input.categories) ? input.categories : []).filter(x => typeof x === 'string').map(x => x.trim()).filter(Boolean))];
  return Object.freeze({title, body, categories, status:'draft', scientificApproval:'pending', publishable:false});
}
