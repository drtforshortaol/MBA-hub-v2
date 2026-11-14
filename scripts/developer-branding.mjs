import fs from 'node:fs';

export const DEVELOPER_URL='https://drtforshortaol.github.io/MBA-hub-v2-dev/';

// Build-time packaging only. Never rewrite source files, registry entries,
// or core JavaScript in deployment workflows.
export function brandDeveloperDistribution(out){
 const cssPath=`${out}/core/hub.css`;
 fs.appendFileSync(cssPath,`
/* AGE-governed orange developer identity. */
header { background:#a64b0b; border-bottom-color:#f0ae43; }
header p, #title small { color:#ffe0a0; }
.search-icon { background:#c46a19; }
.statusline { color:#ffe0a0; }
.open-app, .button { background:#fff0d9; color:#753700; }
#developer { border-top-color:#f0ae43; }
`);
 const iconPath=`${out}/icon.svg`;
 const icon=fs.readFileSync(iconPath,'utf8').replace('#123e50','#a64b0b').replace('#8ed9d2','#ffe0a0');
 fs.writeFileSync(iconPath,icon);
 const indexPath=`${out}/index.html`;
 fs.writeFileSync(indexPath,fs.readFileSync(indexPath,'utf8').replace('<meta name="theme-color" content="#123e50">','<meta name="theme-color" content="#a64b0b">').replace('<title>MBA Hub Version 2</title>','<title>MBA Hub DEV</title>'));
 const installPath=`${out}/install.html`;
 let install=fs.readFileSync(installPath,'utf8');
 install=install.replaceAll('https%3A%2F%2Fdrtforshortaol.github.io%2FMBA-hub-v2-test%2F',encodeURIComponent(DEVELOPER_URL));
 install=install.replaceAll('https://drtforshortaol.github.io/MBA-hub-v2-test/',DEVELOPER_URL);
 install=install.replaceAll('Return to MBA Hub V2','Return to MBA Hub DEV');
 install=install.replaceAll('MBA Hub V2 website','MBA Hub DEV website');
 install=install.replaceAll('MBA Hub Version 2 tester','MBA Hub DEV');
 install=install.replaceAll('Step-by-step instructions for volunteers','Developer installation instructions for the owner');
 install=install.replaceAll('V2 is still a tester.','This is the orange developer build.');
 install=install.replaceAll('Keep Version 1 available until V2 device testing is complete.','Keep the blue Guide installed separately.');
 install=install.replaceAll('<title>MBA Hub V2 | Install &amp; Help</title>','<title>MBA Hub DEV | Install &amp; Help</title>');
 install=install.replaceAll('#123e50','#a64b0b');
 fs.writeFileSync(installPath,install);
}
