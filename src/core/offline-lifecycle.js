/** Refresh offline verification after an installed app resumes or connectivity changes. */
export function observeOfflineLifecycle({window, document, serviceWorker, refresh, checkForUpdate, onError, interrupt = () => {}}) {
 let running = null, queued = false, stopped = false;
 const verify = () => {
  if (stopped) return Promise.resolve();
  if (running) { queued = true; return running; }
  running = (async () => {
   do {
    queued = false;
    try { await refresh(); } catch (error) { onError(error); }
   } while (queued && !stopped);
  })().finally(() => { running = null; });
  return running;
 };
 const resume = () => { if (document.visibilityState !== 'hidden') void verify(); };
 // A back/forward-cache restore may retain a request whose worker channel was
 // suspended. Release it before verifying the resumed page's actual cache.
 const pageshow = event => { if (event.persisted) interrupt(); resume(); };
 const online = () => { void verify(); Promise.resolve().then(checkForUpdate).catch(() => {}); };
 // A replaced controller cannot finish an outstanding request reliably. Release
 // that request before queuing verification against the new controlling worker.
 const controllerchange = () => { interrupt(); if (!stopped) void verify(); };
 const listeners = [[window, 'pageshow', pageshow], [document, 'visibilitychange', resume],
  [window, 'online', online], [window, 'offline', resume], [serviceWorker, 'controllerchange', controllerchange]];
 for (const [target, event, handler] of listeners) target.addEventListener(event, handler);
 return {verify, stop() { stopped = true; queued = false; for (const [target, event, handler] of listeners) target.removeEventListener(event, handler); }};
}
