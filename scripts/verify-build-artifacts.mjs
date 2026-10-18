import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const safePath = value => typeof value === 'string' && value.split('/').every(part => /^[A-Za-z0-9_.-]+$/.test(part) && part !== '.' && part !== '..');

// Registry declarations must match what the offline release actually carries.
export function verifyRegistryCoverage(registry, media, listed) {
 const errors = [];
 if (!Array.isArray(registry.apps) || !registry.apps.length) return ['missing registry applications'];
 if (!media || media.schema_version !== 1 || !Array.isArray(media.assets)) return ['invalid media catalog'];
 const assets = new Map();
 for (const asset of media.assets) {
  if (!asset || typeof asset.asset_id !== 'string' || !asset.asset_id || !safePath(asset.path) || typeof asset.offline !== 'boolean') { errors.push('invalid media declaration'); continue; }
  if (assets.has(asset.asset_id)) errors.push(`duplicate media identifier: ${asset.asset_id}`);
  assets.set(asset.asset_id,asset);
 }
 const ids = new Set();
 for (const app of registry.apps) {
  if (!app || typeof app.app_id !== 'string' || !app.app_id || !safePath(app.entry_point) || !Array.isArray(app.offline_assets) || !Array.isArray(app.media)) { errors.push('invalid registry application'); continue; }
  if (ids.has(app.app_id)) errors.push(`duplicate application identifier: ${app.app_id}`);
  ids.add(app.app_id);
  const offline = new Set(app.offline_assets);
  if (!offline.has(app.entry_point)) errors.push(`entry missing from app offline assets: ${app.app_id}`);
  if (!listed.has(app.entry_point)) errors.push(`entry missing from release: ${app.app_id}`);
  for (const resource of app.offline_assets) {
   if (!safePath(resource) || !listed.has(resource)) errors.push(`app offline asset missing or unsafe: ${app.app_id}: ${String(resource)}`);
  }
  if (offline.size !== app.offline_assets.length) errors.push(`duplicate app offline asset: ${app.app_id}`);
  for (const id of app.media) {
   const asset = assets.get(id);
   if (!asset) { errors.push(`unknown app media: ${app.app_id}: ${String(id)}`); continue; }
   if (asset.offline) {
    if (!listed.has(asset.path)) errors.push(`offline media missing from release: ${app.app_id}: ${id}`);
   }
  }
 }
 return errors;
}

// Verify the exact bytes that will be served; this does not grant release approval.
export function verifyBuildArtifacts(directory, expectedEnvironment) {
 const errors = [];
 const read = name => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
 let release, environment, registry;
 try { release = read('release.json'); environment = read('environment.json'); registry = read('registry.json'); }
 catch { return ['missing or invalid artifact metadata']; }
 if ([release,environment,registry].some(value => !value || typeof value !== 'object' || Array.isArray(value))) return ['invalid artifact metadata shape'];
 if (!['developer', 'tester'].includes(expectedEnvironment)) return ['unsupported preview environment'];
 for (const [name, data] of [['release',release], ['environment',environment], ['registry',registry]]) {
  if (data?.environment !== expectedEnvironment) errors.push(`${name}: environment mismatch`);
 }
 if (environment.namespace !== `mba-v2-${expectedEnvironment}` || environment.developer !== (expectedEnvironment === 'developer')) errors.push('environment: privilege mismatch');
 if (release.schema_version !== 1 || registry.schema_version !== 1) errors.push('invalid artifact schema');
 if ([release,environment,registry].some(value => typeof value.version !== 'string' || !value.version.trim())) errors.push('missing artifact version');
 if (typeof release.release !== 'string' || !/^[a-f0-9]{16}$/.test(release.release)) errors.push('invalid release identifier');
 if (release.version !== environment.version || release.version !== registry.version) errors.push('artifact version mismatch');
 if (!Array.isArray(release.resources) || !release.resources.length) return [...errors, 'missing release resources'];
 const listed = new Set();
 for (const item of release.resources) {
  if (!item || !safePath(item.url) || ['sw.js','release.json'].includes(item.url)) { errors.push('unsafe release resource'); continue; }
  if (listed.has(item.url)) errors.push(`duplicate resource: ${item.url}`);
  listed.add(item.url);
  if (!/^[a-f0-9]{64}$/.test(item.sha256) || !Number.isSafeInteger(item.bytes) || item.bytes < 0) { errors.push(`invalid integrity metadata: ${item.url}`); continue; }
  try {
   const file = path.join(directory, item.url);
   let current = directory;
   for (const part of item.url.split('/')) {
    current = path.join(current, part);
    if (fs.lstatSync(current).isSymbolicLink()) throw Error('symbolic link');
   }
   const bytes = fs.readFileSync(file);
   if (bytes.length !== item.bytes || digest(bytes) !== item.sha256) errors.push(`integrity mismatch: ${item.url}`);
  } catch { errors.push(`missing resource: ${item.url}`); }
 }
 for (const required of ['index.html','environment.json','registry.json','manifest.webmanifest','shared/media/catalog.json']) if (!listed.has(required)) errors.push(`missing critical resource: ${required}`);
 let media;
 try { media = read('shared/media/catalog.json'); } catch { errors.push('missing or invalid media catalog'); }
 errors.push(...verifyRegistryCoverage(registry,media,listed));
 const walk = (dir, prefix = '') => {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
   const relative = prefix + entry.name;
   if (entry.isSymbolicLink()) { errors.push(`symbolic link: ${relative}`); continue; }
   if (entry.isDirectory()) { walk(path.join(dir,entry.name), relative + '/'); continue; }
   if (!['sw.js','release.json'].includes(relative) && !listed.has(relative)) errors.push(`untracked artifact: ${relative}`);
   if (/(?:^|\/)(?:\.env(?:\..*)?|\.git|\.github|\.npmrc|id_rsa|id_ed25519|credentials\.json|secrets\.json)(?:\/|$)/i.test(relative)) errors.push(`private artifact: ${relative}`);
   if (expectedEnvironment === 'tester' && /^core\/(?:developer\.js$|naturalist-engine\/)/.test(relative)) errors.push(`developer artifact in tester: ${relative}`);
  }
 };
 walk(directory);
 if (release.release !== digest(JSON.stringify(release.resources)).slice(0,16)) errors.push('release identifier mismatch');
 try {
  const worker = fs.readFileSync(path.join(directory,'sw.js'),'utf8');
  if (!worker.includes(`NAMESPACE='mba-v2-${expectedEnvironment}'`) || !worker.includes(`RELEASE='${release.release}'`) || /__(?:NAMESPACE|RELEASE)__/.test(worker)) errors.push('service worker release binding mismatch');
 } catch { errors.push('missing service worker'); }
 return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
 const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
 const errors = ['developer','tester'].flatMap(environment => verifyBuildArtifacts(path.join(root,'dist',environment),environment).map(error => `${environment}: ${error}`));
 if (errors.length) { for (const error of errors) console.error(error); process.exitCode = 1; }
 else console.log('Preview artifact verification passed: complete manifest coverage, byte integrity, environment isolation and worker binding.');
}
