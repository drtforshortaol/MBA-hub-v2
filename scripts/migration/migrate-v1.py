#!/usr/bin/env python3
"""Import pinned read-only sources. This command never publishes or alters V1."""
import argparse, hashlib, html as html_module, json, os, re, shutil, subprocess, tempfile
from pathlib import Path
from urllib.parse import unquote, urlsplit
from lxml import html

ROOT=Path(__file__).resolve().parents[2]
parser=argparse.ArgumentParser()
parser.add_argument('--v1',type=Path,required=True)
parser.add_argument('--library',type=Path,required=True)
parser.add_argument('--evo',type=Path,required=True)
args=parser.parse_args()
V1=args.v1.resolve(); LIB=args.library.resolve(); EVO=args.evo.resolve()
SRC=ROOT/'src'; report={'source_commits':{},'changes':[],'missing_links':[],'publication_reviews':[]}
def read(p):return json.loads(p.read_text())
def write(p,data):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(data,ensure_ascii=False,indent=2))
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def slug(s):return re.sub(r'[^a-zA-Z0-9_-]+','-',s).strip('-') or 'section'
def text(s):return html_module.unescape(re.sub(r'<[^>]+>',' ',str(s))).strip()
def gitsha(repo):return subprocess.check_output(['git','-C',str(repo),'rev-parse','HEAD'],text=True).strip()
for name,path in [('MBA-hub',V1),('aquarium-shift-library-',LIB),('evolution-timeline',EVO)]:report['source_commits'][name]=gitsha(path)
inventory=read(ROOT/'config/v1-inventory.json'); descriptors=[];registered=set()
for app in inventory['apps']:
 if app['url'].startswith('http'):
  repo=LIB if app['id']=='aquarium-library-explorer' else EVO;folder=repo
 else:repo=V1;folder=(V1/unquote(app['url'])).parent
 descriptors.append({'id':app['id'],'title':app['name'],'category':app['category'],'folder':folder,'repo':repo,'listed':True,'version':app['version'],'source':app});registered.add(folder)
extra_categories={'tree-of-life-origins':'concepts','kelp-forest':'exhibits','inaturalist-citizen-science':'volunteer-tools','pseudo-nitzschia':'concepts'}
for folder in sorted((V1/'apps').iterdir()):
 if not folder.is_dir() or folder in registered or not (folder/'index.html').exists():continue
 doc=html.fromstring((folder/'index.html').read_text());heading=doc.xpath('//h1')
 title=text(''.join(heading[0].itertext())) if heading else folder.name.replace('-',' ').title()
 descriptors.append({'id':folder.name,'title':title,'category':extra_categories.get(folder.name,'animals'),'folder':folder,'repo':V1,'listed':False,'version':'preserved-v1','source':{}})
folder_map={d['folder']:SRC/'apps'/d['id'] for d in descriptors}
asset_by_hash={};media=[]
# Keep the first proof's existing shared ID stable.
for asset in read(SRC/'shared/media/catalog.json')['assets']:
 if asset['asset_id'].startswith('asset-'):continue
 asset['uses']=[]
 p=SRC/asset['path']
 if p.exists():asset_by_hash[digest(p)]=asset;media.append(asset)
binary_ext={'.jpeg','.jpg','.png','.gif','.webp','.svg','.mp3','.mp4','.pdf','.woff','.woff2'}
file_map={};provenance=[];runtime=[];html_jobs=[];js_jobs=[]
def add_asset(path,descriptor=None):
 if path.stat().st_size==0 and 'icon' in path.name.lower():
  file_map[path.resolve()]=SRC/'icon.svg';report['changes'].append({'empty_legacy_icon_replaced':str(path)});return None
 key=digest(path)
 if key in asset_by_hash:asset=asset_by_hash[key]
 else:
  aid='asset-'+key[:16];name=slug(path.stem)+path.suffix.lower();relative=f'shared/media/{aid}--{name}'
  repo=descriptor['repo'] if descriptor else V1
  asset={'asset_id':aid,'path':relative,'owner':'media-library','alt':path.stem.replace('_',' '),'credit':'Preserved source attribution is retained in the owning application; catalog review pending.','permission':'review-required','offline':True,'sha256':key,'source_repository':'drtforshortaol/'+('MBA-hub' if repo==V1 else 'aquarium-shift-library-' if repo==LIB else 'evolution-timeline'),'source_commit':gitsha(repo),'source_path':str(path.relative_to(repo)),'uses':[]}
  asset_by_hash[key]=asset;media.append(asset);target=SRC/relative;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,target)
 if descriptor:
  asset.setdefault('uses',[]).append({'app_id':descriptor['id'],'source_path':str(path.relative_to(descriptor['repo']))})
 file_map[path.resolve()]=SRC/asset['path'];return asset
for descriptor in descriptors:
 folder=descriptor['folder'];dest=folder_map[folder];dest.mkdir(parents=True,exist_ok=True)
 for path in sorted(folder.rglob('*')):
  if not path.is_file() or '.git' in path.parts:continue
  relative=path.relative_to(folder)
  if path.suffix.lower() in binary_ext:add_asset(path,descriptor);continue
  if path.name in ['sw.js','service-worker.js','manifest.json','manifest.webmanifest']:continue
  if path.name=='tree-of-life-origins-index.html':
   report['changes'].append({'app':descriptor['id'],'unused_older_entry_preserved_upstream':str(path.relative_to(descriptor['repo']))});continue
  if 'snippet' in path.name.lower() or path.name.lower()=='hub-registry-entry.js':
   report['changes'].append({'app':descriptor['id'],'registration_snippet_replaced_by_manifest':str(path.relative_to(descriptor['repo']))});continue
  if path.suffix.lower() not in ['.html','.js','.css','.json']:continue
  if any(word in path.name.lower() for word in ['reset','repair','refresh']):continue
  target=dest/relative;file_map[path.resolve()]=target;runtime.append((path,target,descriptor))
# Root images used across apps also become canonical assets.
for p in V1.iterdir():
 if p.is_file() and p.suffix.lower() in binary_ext:add_asset(p)
def mapped_url(value,source,target):
 value=html_module.unescape(value);u=urlsplit(value)
 if not u.path or value.startswith(('data:','tel:','mailto:','javascript:')):return value
 if u.scheme:
  if u.netloc!='drtforshortaol.github.io':return value
  match=None
  for repo,prefix in [(V1,'/MBA-hub/'),(LIB,'/aquarium-shift-library-/'),(EVO,'/evolution-timeline/')]:
   if u.path.startswith(prefix):match=(repo/unquote(u.path[len(prefix):])).resolve();break
  if match is None:return value
 else:match=(source.parent/unquote(u.path)).resolve()
 if match.is_dir():match=match/'index.html'
 if match==V1/'index.html':dest=SRC/'index.html'
 elif match in file_map:dest=file_map[match]
 else:return value
 relative=os.path.relpath(dest,target.parent).replace(os.sep,'/')
 return relative+('?' + u.query if u.query else '')+('#'+u.fragment if u.fragment else '')
def rewrite_strings(source_text,source,target):
 # Literal URLs in data, render templates, CSS and HTML retain their original per-use placement.
 pattern=r'''(["'])([^"'\n<>]{1,350})\1'''
 def quoted(match):
  value=match.group(2)
  if re.search(r'\.(?:jpeg|jpg|png|svg|webp|gif|html|css|js|json|woff2?)(?:[?#].*)?$',value,re.I) or 'drtforshortaol.github.io/' in value:
   return match.group(1)+mapped_url(value,source,target)+match.group(1)
  return match.group(0)
 rewritten=re.sub(pattern,quoted,source_text)
 # A strict second pass catches literal URLs adjacent to prose apostrophes.
 return re.sub(r'''(["'])([^"'\s<>]+\.(?:jpeg|jpg|png|svg|webp|gif|html|css|js|json)(?:[?#][^"'\s<>]*)?)\1''',quoted,rewritten)
def initial_html(source_text,source,target,descriptor):
 doc=html.fromstring(source_text)
 for node in doc.xpath('//link'):
  rel=node.get('rel','');href=node.get('href','')
  if rel=='manifest' or 'fonts.googleapis.com' in href or 'fonts.gstatic.com' in href:node.getparent().remove(node)
  elif 'icon' in rel and not urlsplit(href).scheme and not (source.parent/unquote(urlsplit(href).path)).resolve().exists():node.set('href',os.path.relpath(SRC/'icon.svg',target.parent).replace(os.sep,'/'))
 for node in doc.xpath('//script[@src]'):
  ref=node.get('src','');u=urlsplit(ref)
  if (source.parent/unquote(u.path)).resolve()==V1/'apps.js' or not u.scheme and not (source.parent/unquote(u.path)).resolve().exists():
   report['changes'].append({'app':descriptor['id'],'removed_missing_script':ref});node.getparent().remove(node)
 maintenance=re.compile(r'cache|offlineStatus|installButton|trouble|updateMessage|cacheStatus',re.I)
 for node in doc.xpath('//*[@id]'):
  if maintenance.search(node.get('id','')):
   node.set('data-v2-maintenance-hidden','true');node.set('hidden','hidden');node.set('aria-hidden','true')
   if node.tag=='button':node.set('disabled','disabled')
 # Preserve styling and content; hide only legacy technical controls.
 style=html.Element('style');style.text='[data-v2-maintenance-hidden="true"]{display:none!important}'
 doc.xpath('//head')[0].append(style)
 script=html.Element('script');script.set('type','module');script.set('src',os.path.relpath(SRC/'core/app-contract.js',target.parent).replace(os.sep,'/'));doc.xpath('//body')[0].append(script)
 for node in doc.xpath('//script[not(@src)]'):
  if node.get('type') in ['application/json','application/ld+json']:continue
  key=str(source)+'#inline-'+str(len(js_jobs));js_jobs.append({'path':key,'source':node.text or ''});node.set('data-migration-script',key)
 return doc
for source,target,descriptor in runtime:
 s=source.read_text();target.parent.mkdir(parents=True,exist_ok=True)
 if source.suffix=='.html':html_jobs.append((source,target,descriptor,initial_html(s,source,target,descriptor)))
 elif source.suffix=='.js':js_jobs.append({'path':str(source),'source':s})
 else:target.write_text(rewrite_strings(s,source,target))
with tempfile.TemporaryDirectory() as temp:
 inp=Path(temp)/'input.json';out=Path(temp)/'output.json';write(inp,js_jobs)
 subprocess.run(['node',str(Path(__file__).parent/'sanitize-legacy.mjs'),str(inp),str(out)],check=True)
 sanitized={item['path']:item for item in read(out)}
for source,target,descriptor in runtime:
 if source.suffix=='.js':
  item=sanitized[str(source)];target.write_text(rewrite_strings(item['source'],source,target));report['changes'].append({'app':descriptor['id'],'file':str(source.relative_to(descriptor['repo'])),'transforms':item['changes']})
  if descriptor['id']=='naturalist-field-notes' and source.name=='app.js':
   updated=target.read_text().replace('content.innerHTML=issueArticle(n);','const noteURL=new URL(location.href);noteURL.searchParams.set("note",id);history.replaceState(null,"",noteURL);content.innerHTML=issueArticle(n);')
   updated=updated.replace('b.onclick=()=>{$("#search").value="";render();window.scrollTo(0,0)}','b.onclick=()=>{const noteURL=new URL(location.href);noteURL.searchParams.delete("note");history.replaceState(null,"",noteURL);$("#search").value="";render();window.scrollTo(0,0)}');target.write_text(updated)
for source,target,descriptor,doc in html_jobs:
 for node in doc.xpath('//script[@data-migration-script]'):
  key=node.attrib.pop('data-migration-script');item=sanitized[key];node.text=rewrite_strings(item['source'],source,target)
  if item['changes']:report['changes'].append({'app':descriptor['id'],'inline_transforms':item['changes']})
 for node in doc.iter():
  for attr in ['src','href','poster']:
   if node.get(attr):node.set(attr,mapped_url(node.get(attr),source,target))
  if node.tag=='style' and node.text:node.text=rewrite_strings(node.text,source,target)
  if node.get('style'):node.set('style',rewrite_strings(node.get('style'),source,target))
 target.write_text('<!doctype html>\n'+html.tostring(doc,encoding='unicode',method='html'))

def flatten_strings(value):
 if isinstance(value,str):return [text(value)]
 if isinstance(value,list):return [s for item in value for s in flatten_strings(item)]
 if isinstance(value,dict):return [s for k,v in value.items() if k not in ['src','url','phone','email','image','icon','hubLinks','relatedApps'] for s in flatten_strings(v)]
 return []
def extract_data(path):
 code="const fs=require('fs'),vm=require('vm'),acorn=require("+json.dumps(str(Path(__file__).parent/'node_modules/acorn'))+");const s=fs.readFileSync(process.argv[1],'utf8'),p=acorn.parse(s,{ecmaVersion:'latest'}),names=p.body.filter(n=>n.type==='VariableDeclaration').flatMap(n=>n.declarations.filter(d=>d.id.type==='Identifier').map(d=>d.id.name));const c={window:{}};const result=vm.runInNewContext(s+';JSON.stringify({window,...Object.fromEntries('+JSON.stringify(names)+'.map(n=>[n,eval(n)]))})',c,{timeout:3000});console.log(result);"
 try:return json.loads(subprocess.check_output(['node','-e',code,str(path)],text=True,stderr=subprocess.DEVNULL))
 except subprocess.CalledProcessError:return {}
data_by_app={}
for d in descriptors:
 collected={}
 for path in (SRC/'apps'/d['id']).glob('*data.js'):collected.update(extract_data(path))
 data_by_app[d['id']]=collected

def data_sections(value,sections,used):
 if isinstance(value,list):
  for item in value:data_sections(item,sections,used)
 elif isinstance(value,dict):
  title=value.get('title') or value.get('name') or value.get('q')
  if title and not value.get('src') and any(k in value for k in ['body','summary','intro','facts','description','answer','sections','tagline','role','biography']):
   sid=slug(str(value.get('id') or title));sid=sid if sid not in used else sid+'-'+str(len(used));used.add(sid)
   sections.append({'id':sid,'title':text(title),'text':' '.join(flatten_strings(value))[:18000],'aliases':value.get('tags',[]) if isinstance(value.get('tags',[]),list) else []})
  for child in value.values():
   if isinstance(child,(list,dict)):data_sections(child,sections,used)

manifests=[]
for d in descriptors:
 folder=SRC/'apps'/d['id'];entry=folder/'index.html';doc=html.fromstring(entry.read_text());sections=[];used=set()
 for node in doc.xpath('//h2|//h3|//details/summary'):
  if node.xpath('ancestor::*[@data-v2-maintenance-hidden]'):continue
  title=text(' '.join(node.itertext()))
  if not title:continue
  target=node.getparent() if node.tag=='summary' else node
  sid=target.get('id') or slug(title);sid=sid if sid not in used else sid+'-'+str(len(used));used.add(sid);target.set('id',sid)
  body=node.getparent();sections.append({'id':sid,'title':title,'text':text(' '.join(body.itertext()))[:20000],'aliases':[]})
 entry.write_text('<!doctype html>\n'+html.tostring(doc,encoding='unicode',method='html'))
 if d['id']=='naturalist-field-notes':
  notes=data_by_app[d['id']].get('FIELD_NOTES',[])
  for note in notes:sections.append({'id':'note-'+note['id'],'title':note['date']+' — '+note['title'],'text':' '.join(flatten_strings(note)),'aliases':['Naturalist','Field Note',note['date']],'query':{'note':note['id']}})
 else:data_sections(data_by_app[d['id']],sections,used)
 appmedia=[]
 for asset in media:
  path=asset['path']
  if any(path in file.read_text() for file in folder.rglob('*') if file.is_file() and file.suffix in ['.html','.js','.css','.json']):appmedia.append(asset['asset_id'])
 family='species' if d['category']=='animals' else 'reference'
 if d['id']=='naturalist-field-notes':family='field-notes'
 if d['id']=='aquarium-library-explorer':family='library'
 if d['id'] in ['evolution-timeline','tree-of-life-origins']:family='interactive'
 source_repo='MBA-hub' if d['repo']==V1 else 'aquarium-shift-library-' if d['repo']==LIB else 'evolution-timeline'
 manifest={'schema_version':1,'app_id':d['id'],'title':d['title'],'category':d['category'],'type':family,'version':'2.0.0-alpha.6','entry_point':f"apps/{d['id']}/index.html",'status':'testing','owner':d['id'],'listed':d['listed'],'dependencies':[{'id':'navigation','version':'1.0.0'}],'offline_assets':[str(p.relative_to(SRC)) for p in sorted(folder.rglob('*')) if p.is_file() and p.name!='manifest.json'],'media':appmedia,'knowledge':[],'cross_links':[],'sections':sections,'source_version':d['version'],'source_repository':'drtforshortaol/'+source_repo,'source_commit':report['source_commits'][source_repo],'publication_review':'pending'}
 if d['repo']!=V1:manifest['integration']={'mode':'read-only-offline-distribution','interface_version':'1.0.0','upstream_owner':manifest['source_repository'],'snapshot_commit':manifest['source_commit'],'development_remains_independent':True}
 write(folder/'manifest.json',manifest);manifests.append(manifest)

# Cross-links are generated from actual HTML destinations; dynamic data links get an additional full audit.
by_entry={(SRC/a['entry_point']).resolve():a for a in manifests}
for manifest in manifests:
 links=set()
 for p in (SRC/'apps'/manifest['app_id']).rglob('*.html'):
  doc=html.fromstring(p.read_text())
  for node in doc.xpath('//*[@href or @src]'):
   for attr in ['href','src']:
    value=node.get(attr)
    if not value:continue
    url=urlsplit(value)
    if url.scheme or not url.path:continue
    dest=(p.parent/unquote(url.path)).resolve()
    if dest.is_dir():dest=dest/'index.html'
    if not dest.exists():report['missing_links'].append({'app':manifest['app_id'],'page':str(p.relative_to(SRC)),'url':value,'element':node.tag})
    if dest in by_entry and dest!=SRC/manifest['entry_point']:links.add(by_entry[dest]['app_id'])
 manifest['cross_links']=[{'app_id':aid} for aid in sorted(links)];write(SRC/'apps'/manifest['app_id']/'manifest.json',manifest)
 report['publication_reviews'].append({'app_id':manifest['app_id'],'private_review_required':True,'reasons':['source content and attribution review','media reuse permission review']+(['book ownership/borrower records'] if manifest['type']=='library' else [])})

write(SRC/'shared/media/catalog.json',{'schema_version':1,'version':'1.1.0','assets':media})
owned_paths={a['path'] for a in media}
for path in (SRC/'shared/media').glob('asset-*'):
 if str(path.relative_to(SRC)) not in owned_paths:path.unlink()
report.update({'registered_v1_apps':len(inventory['apps']),'total_imported_apps':len(manifests),'linked_support_apps':[a['app_id'] for a in manifests if not a['listed']],'canonical_media_assets':len(media),'media_bytes':sum((SRC/a['path']).stat().st_size for a in media),'independent_integrations':[a['app_id'] for a in manifests if 'integration' in a]})
write(ROOT/'docs/MIGRATION_REPORT.json',report)
write(ROOT/'config/migration-provenance.json',{'source_commits':report['source_commits'],'apps':[{k:a[k] for k in ['app_id','source_repository','source_commit','source_version','listed']} for a in manifests],'media':[{'asset_id':a['asset_id'],'path':a['path'],'source_repository':a.get('source_repository'),'source_commit':a.get('source_commit'),'source_path':a.get('source_path'),'sha256':a.get('sha256')} for a in media]})
print(json.dumps({k:v for k,v in report.items() if k not in ['changes','publication_reviews','missing_links']},indent=2))
print('Missing static links:',len(report['missing_links']))
