import fs from 'node:fs';

export const GUIDE_URL='https://drtforshortaol.github.io/MBA-hub-v2/';

// Derived distribution branding only; never rewrite canonical source files.
// The existing tester namespace and blue icon are intentionally preserved.
export function brandGuideDistribution(out){
 const installPath=`${out}/install.html`;
 let html=fs.readFileSync(installPath,'utf8');
 html=html.replaceAll('https%3A%2F%2Fdrtforshortaol.github.io%2FMBA-hub-v2-test%2F',encodeURIComponent(GUIDE_URL));
 html=html.replaceAll('https://drtforshortaol.github.io/MBA-hub-v2-test/',GUIDE_URL);
 html=html.replaceAll('MBA Hub Version 2 tester','MBA Hub V2 Guide');
 html=html.replaceAll('three QR codes point to the same MBA Hub V2 website','three QR codes point to the blue MBA Hub V2 Guide');
 html=html.replaceAll('Step-by-step instructions for volunteers','Blue Guide installation instructions for volunteers');
 html=html.replaceAll('V2 is still a tester.','This is the blue Guide.');
 fs.writeFileSync(installPath,html);
}
