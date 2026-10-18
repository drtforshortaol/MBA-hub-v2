/** Refresh offline verification after an installed app resumes or connectivity changes. */
export function observeOfflineLifecycle({window, document, serviceWorker, refresh, checkForUpdate, onError}) {
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
 const online = () => { void verify(); Promise.resolve().then(checkForUpdate).catch(() => {}); };
 const listeners = [[window, 'pageshow', resume], [document, 'visibilitychange', resume],
  [window, 'online', online], [window, 'offline', resume], [serviceWorker, 'controllerchange', resume]];
 for (const [target, event, handler] of listeners) target.addEventListener(event, handler);
 return {verify, stop() { stopped = true; queued = false; for (const [target, event, handler] of listeners) target.removeEventListener(event, handler); }};
}
