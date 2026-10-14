import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root='dist/tester';
const registry=JSON.parse(fs.readFileSync(path.join(root,'registry.json'),'utf8'));
function scan(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?scan(path.join(dir,d.name)):[path.join(dir,d.name)]);}
const files=scan(root);
function resolveRef(page,raw){
  if(!raw || /^(?:#|https?:|mailto:|tel:|data:|blob:|javascript:|\/\/)/i.test(raw)) return null;
  const p=raw.split(/[?#]/)[0];if(!p)return null;
  const target=path.posix.normalize(path.posix.join(path.posix.dirname(page),p));
  return target==='.'?'index.html':target.endsWith('/')?target+'index.html':target;
}
test('all registered apps have an actual HTML entry and unique IDs',()=>{
  assert.equal(new Set(registry.apps.map(a=>a.app_id)).size,registry.apps.length);
  for(const app of registry.apps){
    assert(app.entry_point.endsWith('/index.html'),app.app_id+' entry convention');
    assert(fs.existsSync(path.join(root,app.entry_point)),app.app_id+' entry is missing');
    const html=fs.readFileSync(path.join(root,app.entry_point),'utf8');
    assert(/<title\b/i.test(html),app.app_id+' requires page title');
    assert(/MBA Hub|Return to Hub|Return to the Hub/i.test(html),app.app_id+' requires hub navigation affordance');
  }
});
test('HTML local src/href assets resolve inside the built tester bundle',()=>{
  const missing=[];
  for(const abs of files.filter(f=>f.endsWith('.html'))){
    const page=path.relative(root,abs).replaceAll(path.sep,'/');
    const html=fs.readFileSync(abs,'utf8');
    for(const m of html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)){
      const ref=resolveRef(page,m[1]);
      if(ref===null)continue;
      if(ref.startsWith('../')||path.posix.isAbsolute(ref))missing.push(page+' escapes scope: '+m[1]);
      else if(!fs.existsSync(path.join(root,ref))&&!fs.existsSync(path.join(root,ref,'index.html')))
        missing.push(page+' -> '+m[1]);
    }
  }
  assert.deepEqual(missing,[]);
});
test('all search result destinations reference registered applications and scoped URLs',()=>{
  const valid=new Set(registry.apps.map(a=>a.app_id));
  const links=JSON.parse(fs.readFileSync(path.join(root,'search-index.json'),'utf8'));
  for(const link of links){
    assert(valid.has(link.app_id),'unknown search app '+link.app_id);
    const dest=link.url.split(/[?#]/)[0];
    assert(dest.startsWith('apps/')&&!dest.includes('..'),'unsafe search link '+link.url);
    assert(fs.existsSync(path.join(root,dest)),'missing search target '+link.url);
  }
});
