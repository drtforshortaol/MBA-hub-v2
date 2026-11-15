/** Offline-aware navigation policy for local Hub routes. */
export function navigationDecision(url, {online = true, cached = false, origin} = {}) {
  const parsed = new URL(url, origin || 'https://local.invalid');
  if (!['http:', 'https:'].includes(parsed.protocol)) return {allowed:false, reason:'unsupported-protocol'};
  if (origin && parsed.origin !== new URL(origin).origin) return {allowed:online, reason:online?'external-online':'external-offline'};
  if (online) return {allowed:true, reason:'online'};
  return {allowed:Boolean(cached), reason:cached?'cached-offline':'unavailable-offline'};
}
