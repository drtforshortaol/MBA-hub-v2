import argparse
from lxml import html
from pathlib import Path
import subprocess,json,hashlib
parser=argparse.ArgumentParser(description='Reproduce reviewed pinned-source fidelity for three reference applications; requires Python lxml and Node.')
parser.add_argument('--sources-dir',type=Path,required=True)
args=parser.parse_args()
root=Path(__file__).resolve().parents[2];repo=args.sources_dir/'MBA-hub'
if not repo.exists():repo=args.sources_dir/'fidelity-MBA-hub'
commit='5c219508d23255080f6b050cefa8092905447d81';out=[]
# Explicit reviewed app-local inventories reject added files as well as changed bytes.
# Manifest metadata is part of the review boundary, independently of executable pairs.
reviewed_inventories={
 'applied-water-science-life-support': (['app.js','index.html','manifest.json','styles.css'],'d593e80164e8e2affd0b6d7b428d56620fef44b78b6637a1be460e64a17d6c8a'),
 'interpretation-principles': (['app.js','data.js','index.html','manifest.json','styles.css'],'660fa9a1ca1619bcac964214e4d49a44e8f2108998edb0c143ab728603ea181a'),
 'mba-leadership': (['app.js','apps.js','data.js','index.html','manifest.json','styles.css'],'e48a0ea8422bc45c7efb81c72af4ea914c2843010c4cd32d45ff7a9a2be835de')
}
current_file_inventories=[]
for app,(names,manifest_digest) in reviewed_inventories.items():
 directory=root/'src/apps'/app
 paths=list(directory.rglob('*'))
 assert not any(p.is_symlink() for p in paths),app+': unreviewed symlink'
 actual=sorted(p.relative_to(directory).as_posix() for p in paths if p.is_file())
 assert actual==names,app+': app-local file inventory differs from reviewed scope'
 assert hashlib.sha256((directory/'manifest.json').read_bytes()).hexdigest()==manifest_digest,app+': unreviewed manifest'
 current_file_inventories.append({'app_id':app,'files':[{'path':'src/apps/'+app+'/'+name,'sha256':hashlib.sha256((directory/name).read_bytes()).hexdigest()} for name in names]})
for app in ['applied-water-science-life-support','interpretation-principles','mba-leadership']:
 path='apps/'+app+'/index.html';s=subprocess.check_output(['git','-C',repo,'show',commit+':'+path]);c=(root/'src'/path).read_bytes();sd=html.fromstring(s);cd=html.fromstring(c);sourceids={x.get('id') for x in sd.xpath('//*[@id]')}
 for e in sd.xpath('//link[@rel="manifest"]'):e.getparent().remove(e)
 for e in cd.xpath('//script[@src="../../core/app-contract.js"]|//style[text()=\'[data-v2-maintenance-hidden="true"]{display:none!important}\']'):e.getparent().remove(e)
 for e in cd.xpath('//*[@id]'):
  if e.get('id') not in sourceids:del e.attrib['id']
 for e in cd.xpath('//*[@data-v2-maintenance-hidden]'):
  assert app=='applied-water-science-life-support' and e.get('id') in ['troublePanel','closeTroubleBtn']
  for k in ['data-v2-maintenance-hidden','hidden','aria-hidden','disabled']:e.attrib.pop(k,None)
 # All local media URLs must have exact original bytes, except Leadership's originally empty icon replaced by Hub icon.
 for old,new in zip(sd.xpath('//link[@rel="apple-touch-icon"]|//img'),cd.xpath('//link[@rel="apple-touch-icon"]|//img')):
  key='src' if old.tag=='img' else 'href';before=old.get(key);after=new.get(key);b=subprocess.check_output(['git','-C',repo,'show',commit+':apps/'+app+'/'+before]);v=(root/'src/apps'/app/after).resolve().read_bytes()
  if app=='mba-leadership':assert before=='icon.svg' and b==b'' and after=='../../icon.svg'
  else:assert b==v
  new.set(key,before)
 def canonical(d):
  for e in d.iter():
   if e.text:e.text=' '.join(e.text.split()) or None
   if e.tail:e.tail=' '.join(e.tail.split()) or None
   at=sorted(e.attrib.items());e.attrib.clear();e.attrib.update(at)
  return html.tostring(d)
 equal=canonical(sd)==canonical(cd);assert equal,app
 out.append({'app_id':app,'complete_normalized_html_equal':equal,'pinned_html_sha256':hashlib.sha256(s).hexdigest(),'current_html_sha256':hashlib.sha256(c).hexdigest(),'leadership_empty_install_icon_replaced_by_hub_icon':app=='mba-leadership'})


# Reject any source or executable/style byte changes outside the reviewed exact pairs.
expected=[{'source_path': 'apps/applied-water-science-life-support/app.js', 'local_path': 'src/apps/applied-water-science-life-support/app.js', 'pinned_sha256': '62951c89e02aa13d2fa4314db35c1d618c98591b8d17cd0feb4eca550487bd12', 'current_sha256': 'bc3dd55ca9596858c880256af684e27597e5f2fc2eae6439c5c19daf9e53911c'}, {'source_path': 'apps/applied-water-science-life-support/index.html', 'local_path': 'src/apps/applied-water-science-life-support/index.html', 'pinned_sha256': '773ad3fd3aceca50884b50d054652d7b79a22855fa004cab9a388c0384f724e5', 'current_sha256': '5785c3a28affdfe6df9d28e546e07fe7b8789238276048102bb26bb54cdfa659'}, {'source_path': 'apps/applied-water-science-life-support/styles.css', 'local_path': 'src/apps/applied-water-science-life-support/styles.css', 'pinned_sha256': '6a593b220d0e41c793d4cb8c4903aad9f37e1d1c8d8038bdbff5adbdf17549cd', 'current_sha256': '6a593b220d0e41c793d4cb8c4903aad9f37e1d1c8d8038bdbff5adbdf17549cd'}, {'source_path': 'apps/applied-water-science-life-support/sw.js', 'local_path': 'src/apps/applied-water-science-life-support/sw.js', 'pinned_sha256': '82684222761fa9ceb04839539fe89476bbec773f0c5a635d1018a871fae043fc', 'current_sha256': None}, {'source_path': 'apps/interpretation-principles/app.js', 'local_path': 'src/apps/interpretation-principles/app.js', 'pinned_sha256': 'd75a342b85adf88cea5a2c94d09268ab18b32a97e275cb09e969f9a09fac04d6', 'current_sha256': '2afe5b7ddf958146954db722b687a521cfdeba1e35ed764ba2c20a18a55d0328'}, {'source_path': 'apps/interpretation-principles/data.js', 'local_path': 'src/apps/interpretation-principles/data.js', 'pinned_sha256': '0d598a17421ab55921db5e93afb4afb520c900e1eeeb77fe14454c411a0386c8', 'current_sha256': '0d598a17421ab55921db5e93afb4afb520c900e1eeeb77fe14454c411a0386c8'}, {'source_path': 'apps/interpretation-principles/index.html', 'local_path': 'src/apps/interpretation-principles/index.html', 'pinned_sha256': 'e4649d2736635305288328ce67410de3aa5afac509d806954ea103b5dc7885f3', 'current_sha256': 'f716bae0a5816082011e6f1dab7445bfa49ffed08fbc938976116f7cd6d2c084'}, {'source_path': 'apps/interpretation-principles/styles.css', 'local_path': 'src/apps/interpretation-principles/styles.css', 'pinned_sha256': 'c054bd6973fc4d1afc57d86b4c613ab9c7c351be040597326b24e6ba2008a8d9', 'current_sha256': 'c054bd6973fc4d1afc57d86b4c613ab9c7c351be040597326b24e6ba2008a8d9'}, {'source_path': 'apps/interpretation-principles/sw.js', 'local_path': 'src/apps/interpretation-principles/sw.js', 'pinned_sha256': '10d5be4176e8d8f0d5aee78985d9063acad69fabae2b9787e469983b6f479234', 'current_sha256': None}, {'source_path': 'apps/mba-leadership/app.js', 'local_path': 'src/apps/mba-leadership/app.js', 'pinned_sha256': 'cc52a658fc9bd39e650b34a4c60d8a55423c1795ef294449527c2b0cd73b2210', 'current_sha256': 'e6485a4de16fc3c2bc69c3b143d00f7cfdd7aaa532dc33959ac51413586c7ef8'}, {'source_path': 'apps/mba-leadership/apps.js', 'local_path': 'src/apps/mba-leadership/apps.js', 'pinned_sha256': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'current_sha256': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}, {'source_path': 'apps/mba-leadership/data.js', 'local_path': 'src/apps/mba-leadership/data.js', 'pinned_sha256': '2dc3b825d69d50b27ce2e9231487dcf0635c2f53ed84d588265ecd77f653cfa2', 'current_sha256': '2643b20c17eea744696c402710c9cba3ade60bbaa8117e47d944ba472a707a4b'}, {'source_path': 'apps/mba-leadership/index.html', 'local_path': 'src/apps/mba-leadership/index.html', 'pinned_sha256': '9ad94e18456c91e227e84ae48d67aecf0b75d6a245210b661e6a3641f84780c2', 'current_sha256': '67b04bc75554b6563d6eaaf8d4b8e404f20e356a50822278a06881cd2650e6c8'}, {'source_path': 'apps/mba-leadership/styles.css', 'local_path': 'src/apps/mba-leadership/styles.css', 'pinned_sha256': 'bfa259a27ab92ecded650ac0820e675870584e1c4941bf8ab40f999b0164c031', 'current_sha256': 'bfa259a27ab92ecded650ac0820e675870584e1c4941bf8ab40f999b0164c031'}, {'source_path': 'apps/mba-leadership/sw.js', 'local_path': 'src/apps/mba-leadership/sw.js', 'pinned_sha256': 'e35d068b6b2581fb19baec524cde5ce4f3c603d0e750fdc9e4cbd8463f142fc4', 'current_sha256': None}]
for f in expected:
 pinned=subprocess.check_output(['git','-C',str(repo),'show',commit+':'+f['source_path']])
 assert hashlib.sha256(pinned).hexdigest()==f['pinned_sha256'],f['source_path']
 local=root/f['local_path']
 actual=hashlib.sha256(local.read_bytes()).hexdigest() if local.exists() else None
 assert actual==f['current_sha256'],f['local_path']
# Verify the two migrated Leadership portraits independently of code URL rewriting.
for name,digest in [('jenny-gray','439853e26e3085c78a222468095de38a15a93cafa616890a13be049e175f5206'),('lauren-cole','c153bd064cb666241dd4fef60915a3926a703754d90558c719cac873e63922f8')]:
 pinned=subprocess.check_output(['git','-C',str(repo),'show',commit+':apps/mba-leadership/images/'+name+'.jpg'])
 current=(root/'src/shared/media'/('asset-'+digest[:16]+'--'+name+'.jpg')).read_bytes()
 assert pinned==current and hashlib.sha256(current).hexdigest()==digest,name
renders=json.loads(subprocess.check_output(['node',str(root/'scripts/migration/render-reviewed-reference-apps.mjs'),str(root),str(repo)]))
render_checks=[]
for app in ['interpretation-principles','mba-leadership']:
 values=[]
 for ver in ['pinned','current']:
  d=html.fromstring(renders[app+':'+ver])
  for e in d.iter():
   if e.text:e.text=' '.join(e.text.split()) or None
   if e.tail:e.tail=' '.join(e.tail.split()) or None
   if e.get('src') and ver=='current':
    if 'jenny-gray.jpg' in e.get('src'):e.set('src','images/jenny-gray.jpg')
    if 'lauren-cole.jpg' in e.get('src'):e.set('src','images/lauren-cole.jpg')
   if 'hidden' in e.attrib:e.set('hidden','')
   at=sorted(e.attrib.items());e.attrib.clear();e.attrib.update(at)
  values.append(html.tostring(d))
 assert values[0]==values[1],app+': dynamic renderer differs'
 render_checks.append({'app_id':app,'all_authored_records_render_equal':True,'normalized_sha256':hashlib.sha256(values[0]).hexdigest()})
# Independent exact authored-text/card-target checks for new Water Science indexing.
water=root/'src/apps/applied-water-science-life-support'
manifest=json.loads((water/'manifest.json').read_text())
d=html.fromstring((water/'index.html').read_text())
card_checks=[]
for card in d.xpath('//article[contains(concat(" ",normalize-space(@class)," ")," card ")]'):
 section=next(s for s in manifest['sections'] if s['id']==card.get('id'))
 title=' '.join(' '.join(card.xpath('.//button[contains(@class,"card-header")]//strong')[0].itertext()).split())
 text=' '.join(' '.join(card.itertext()).split())
 assert section['title']==title and section['text']==text,section['id']
 card_checks.append(section['id'])
assert len(card_checks)==13
print(json.dumps({'schema_version':1,'scope':'Engineering reviewed unchanged V1 authored content; no physical browser or new science/image approval','source_commit':commit,'complete_html_checks':out,'reviewed_file_hash_pairs':expected,'current_file_inventories':current_file_inventories,'dynamic_render_checks':render_checks,'water_source_derived_card_ids':card_checks,'limitations':['Lightweight VM DOM harness is not a browser; physical layout, accessibility and device offline acceptance remain pending.','Original standalone workers/manifests are replaced by Hub infrastructure; source manifest approval flags remain separately preserved.']},indent=2))
