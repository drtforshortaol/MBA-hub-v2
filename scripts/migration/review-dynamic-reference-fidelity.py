#!/usr/bin/env python3
"""Portable pinned/current complete-byte, static DOM, dataset and renderer audit.
Requires Python lxml and Node. Does not certify browser sanitizer/device behavior.
"""
import argparse,hashlib,json,subprocess
from pathlib import Path
from urllib.parse import urlsplit,unquote
from lxml import html
parser=argparse.ArgumentParser();parser.add_argument('--sources-dir',type=Path,required=True);args=parser.parse_args()
root=Path(__file__).resolve().parents[2];repo=args.sources_dir/'fidelity-MBA-hub'
if not repo.exists():repo=args.sources_dir/'MBA-hub'
commit='5c219508d23255080f6b050cefa8092905447d81'
assert subprocess.check_output(['git','-C',str(repo),'rev-parse',commit+'^{commit}'],text=True).strip()==commit
sha=lambda b:hashlib.sha256(b).hexdigest()
folders={'five-senses-pwa':'five-senses-pwa','kelp-forest':'kelp-forest','northern-elephant-seal':'northern-elephant-seal-pwa-v1.2-final-hub (2)'}
# Reviewed complete app-local byte boundary. Updating it requires full scope review.
expected={'five-senses-pwa': {'app.js': 'ff2477d75b25c6ca4a22457b1166702dbbec91359690a241c72dfcf3a24f44dd', 'apps.js': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'data.js': '31e10022be5d88c3273306aebacf6c81375352ddb1911daa6827ea5c609f800b', 'index.html': 'b4789f227aba2b9046c0b23ec9e50031cac2a4944c391be3b869c137cc29ddc0', 'manifest.json': '4618a8baf6dda4f7fe87ac39e176db3ef65966f8bff59e7d7c13ef33a7bfc4d5', 'styles.css': '5584ed35f4d34ff97e45d5a01dae9e8a3141977f1bb607fc6f495fa0d378aac2'}, 'kelp-forest': {'app.js': 'fc02c6117b3002bdd4f407c2d88f965e31929af92de987829214d89d11f70fbe', 'data.js': 'f0b6a0b50027b0fa127d9305ca00ddf2b04ef6027528db926c3d64dee1846d88', 'index.html': 'a5ed0ecc5de1d4bdb9b44b780ce74ac1a54d4ab187b7eb12f6a59b9326ef1d04', 'manifest.json': 'e24f4cf23a100a0197a9e6f33eb876c8eb98ac6acb3b232960dd853f0bf25174', 'styles.css': 'ac3e31559ac34891a5862e084e69d56be705db0aad9a603398ca6bf2c5c98064'}, 'northern-elephant-seal': {'app.js': '2b235c5affce03f1576b6db87ed95386bac31f9f412371ed4ee48cb177085eef', 'data.js': 'c43de528f657c6bce5b9aafa19248a3213379065a527bda126d5b3df4c570f2b', 'index.html': 'dae17d2e7b2bb0d483ea07c162f7e52129d9c53b5d4626cd7ac707b51f71e78a', 'manifest.json': '251f1eee63136e6ebd2be93fa06b6848e3ecba38cc53e2294f166f88087f9634', 'styles.css': 'c954a904142c2ec27259fd673c394dec4d5880e914a1cfd68f99feb0834b824e'}}
def pinned(path):return subprocess.check_output(['git','-C',str(repo),'show',commit+':'+path])
provenance=json.loads((root/'config/migration-provenance.json').read_text());media={}
for app in folders:
 m=json.loads((root/'src/apps'/app/'manifest.json').read_text())
 for assetid in m['media']:
  record=next(x for x in provenance['media'] if x['asset_id']==assetid)
  assert record['source_repository']=='drtforshortaol/MBA-hub' and record['source_commit']==commit
  current=root/'src'/record['path'];assert not current.is_symlink(),assetid+': symlink';source=pinned(record['source_path']);assert source==current.read_bytes(),assetid
  media[current.resolve()]=record['source_path']
def canonical(document,app,current=False,static=False):
 folder='apps/'+folders[app]+'/'
 if static:
  for e in document.xpath('//link[@rel="manifest"]'):e.getparent().remove(e)
  for e in document.xpath('//script[@src="../../core/app-contract.js"]'):e.getparent().remove(e)
  for e in document.xpath('//style'):
   if e.text=='[data-v2-maintenance-hidden="true"]{display:none!important}':e.getparent().remove(e)
  if current:
   for e in document.xpath('//*[@data-v2-maintenance-hidden]'):
    assert app=='kelp-forest' and e.get('id') in ['clearCacheButton','troubleshootingButton','cacheStatus','troubleshootingPanel','closeTroubleshootingButton']
    for k in ['data-v2-maintenance-hidden','hidden','aria-hidden','disabled']:e.attrib.pop(k,None)
   if app=='five-senses-pwa':del document.get_element_by_id('Sources-and-Notes').attrib['id']
   if app=='kelp-forest':del document.get_element_by_id('Kelp-Forest').attrib['id']
   if app=='northern-elephant-seal':
    hero=document.get_element_by_id('Northern-Elephant-Seal');del hero.attrib['id'];assert hero.attrib.pop('aria-labelledby')=='app-title'
 for e in document.iter():
  if not isinstance(e.tag,str):continue
  for key in ['src','href']:
   value=e.get(key)
   if not value:continue
   if current and (value.startswith('../../shared/media/') or value.startswith('https://review.example/shared/media/')):
    path=(root/'src/apps'/app/value).resolve() if value.startswith('../') else (root/'src/shared/media'/Path(urlsplit(value).path).name).resolve()
    source=media[path]
    if app=='five-senses-pwa' and key=='href' and e.tag=='link':
     assert source=='icon.svg';source=folder+'icon.svg' # original app-local icon was absent; pinned root icon is repair
    assert source.startswith(folder),source
    e.set(key,source[len(folder):])
   elif value.startswith('https://review.example/apps/'+app+'/'):
    e.set(key,value.split('/apps/'+app+'/',1)[1])
  if e.text:e.text=' '.join(e.text.split()) or None
  if e.tail:e.tail=' '.join(e.tail.split()) or None
  if 'open' in e.attrib:e.set('open','')
  at=sorted(e.attrib.items());e.attrib.clear();e.attrib.update(at)
 return html.tostring(document)
report={'schema_version':1,'source_commit':commit,'scope':'Engineering fidelity only; no science, image, browser or physical acceptance approval','apps':[]}
for app in folders:
 directory=root/'src/apps'/app;assert not directory.is_symlink(),app+': directory symlink';paths=list(directory.rglob('*'));assert not any(p.is_symlink() for p in paths),app+': symlink'
 actual={p.relative_to(directory).as_posix():sha(p.read_bytes()) for p in sorted(paths) if p.is_file()}
 assert actual==expected[app],app+': unreviewed complete file inventory/bytes'
 sourcefolder='apps/'+folders[app]+'/'
 sourcepaths=subprocess.check_output(['git','-C',str(repo),'ls-tree','-r','--name-only',commit,'--',sourcefolder],text=True).splitlines()
 sourcefiles=[{'path':p,'sha256':sha(pinned(p))} for p in sourcepaths]
 assert pinned(sourcefolder+'styles.css')==(directory/'styles.css').read_bytes(),app+': CSS'
 before=canonical(html.fromstring(pinned(sourcefolder+'index.html')),app,False,True)
 after=canonical(html.fromstring((directory/'index.html').read_bytes()),app,True,True)
 assert before==after,app+': static markup'
 report['apps'].append({'app_id':app,'current_complete_inventory':actual,'pinned_complete_inventory':sourcefiles,'static_normalized_dom_equal':True,'css_exact':True,'dynamic_render_checks':[]})
renders=json.loads(subprocess.check_output(['node',str(root/'scripts/migration/render-dynamic-reference-apps.mjs'),str(root),str(repo)]))
containers={'five-senses-pwa':['senseList','guideList','referenceList'],'kelp-forest':['appTitle','appSummary','appMeta','versionLine','heroImage','notificationArea','faqList','sections','sectionJump'],'northern-elephant-seal':['app-title','scientific-name','summary','footerVersion','snapshot-strip','accordion']}
assert set(renders)=={a+':'+v for a in folders for v in ['pinned','current']},'incomplete rendered app set'
def normalize_data(value,app):
 if isinstance(value,dict):return {k:normalize_data(v,app) for k,v in value.items()}
 if isinstance(value,list):return [normalize_data(v,app) for v in value]
 if isinstance(value,str) and value.startswith('../../shared/media/'):
  source=media[(root/'src/apps'/app/value).resolve()];prefix='apps/'+folders[app]+'/'
  assert source.startswith(prefix);return source[len(prefix):]
 return value
for entry in report['apps']:
 app=entry['app_id']
 for version in ['pinned','current']:
  assert set(renders[app+':'+version]['containers'])==set(containers[app]),app+': incomplete render containers'
 assert renders[app+':pinned']['dataset']==normalize_data(renders[app+':current']['dataset'],app),app+': dataset'
 entry['dataset_equal_except_byte_verified_media_paths']=True
 for container,before in renders[app+':pinned']['containers'].items():
  a=canonical(html.fromstring(before),app)
  b=canonical(html.fromstring(renders[app+':current']['containers'][container]),app,True)
  assert a==b,app+': dynamic '+container
  assert ''.join(html.fromstring(a).itertext()).strip(),app+': empty dynamic '+container
  counts={tag:len(html.fromstring(a).xpath('.//'+tag)) for tag in ['details','img','li','option','article']}
  required={('five-senses-pwa','senseList','details'):4,('five-senses-pwa','guideList','details'):3,('five-senses-pwa','referenceList','li'):7,('kelp-forest','sections','details'):10,('kelp-forest','heroImage','img'):1,('kelp-forest','sectionJump','option'):10,('northern-elephant-seal','accordion','img'):11,('northern-elephant-seal','accordion','article'):17}
  for (ap,co,tag),count in required.items():
   if (ap,co)==(app,container):assert counts[tag]==count,(app,container,tag,counts[tag])
  entry['dynamic_render_checks'].append({'container':container,'normalized_dom_equal':True,'normalized_sha256':sha(a),'structural_counts':counts})
report['media']=[{'current_path':str(p.relative_to(root)),'pinned_path':s,'sha256':sha(p.read_bytes()),'exact':True} for p,s in sorted(media.items())]
report['limitations']=['Literal VM DOM execution compares generated markup, not browser DOMParser/sanitizer behavior, layout, accessibility or physical acceptance.','Source worker/cache and install-manifest replacement are separately reviewed engineering differences; source flags remain unchanged.','Five Senses absent app-local icon repaired with exact pinned root icon.']
print(json.dumps(report,indent=2))
