/** Standalone maintenance panels belong to the integrated Hub, not guide content. */
const legacyHelp=Object.freeze({
 'flamboyant-cuttlefish':Object.freeze(['Install-Offline-Help']),
 'gooseneck-barnacle':Object.freeze(['Install-Offline-Help']),
 'gray-whale':Object.freeze(['Install-and-troubleshooting']),
 'naturalist-field-notes':Object.freeze(['Troubleshooting-install'])
});
export function isIntegratedLegacyHelp(appId,sectionId){return legacyHelp[appId]?.includes(sectionId)===true;}
export function hideIntegratedLegacyHelp(document,appId){
 for(const id of legacyHelp[appId]||[]){const panel=document.getElementById(id);if(!panel)continue;
  // Preserve legacy DOM IDs used by inherited scripts; conceal the complete panel.
  panel.hidden=true;panel.setAttribute('aria-hidden','true');panel.setAttribute('data-v2-maintenance-hidden','true');
 }
}
export function integratedHelpDestination(root,appId,hash){
 let id;try{id=decodeURIComponent(String(hash||'').replace(/^#/,''));}catch{return null;}
 return isIntegratedLegacyHelp(appId,id)?new URL('index.html#help',root):null;
}
