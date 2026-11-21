#!/usr/bin/env python3
"""Reproduce the bounded 15-app reviewed migration comparison, never grant approval.
Requires lxml (migration-tooling dependency). --sources-dir holds fidelity-MBA-hub.
Known executable replacements are bound to manually reviewed SHA-256 pairs;
this is source/render-tree evidence, not browser/device or scientific acceptance.
"""
import argparse, hashlib, json, posixpath, re, subprocess
from pathlib import Path
from urllib.parse import unquote, urlsplit
from lxml import html
ROOT = Path(__file__).resolve().parents[2]
IDS = ['bluespotted-ribbontail-ray','california-sheephead','gray-whale','gray-whale-skeleton-exhibit','hopkins-rose-nudibranch','inaturalist-citizen-science','pacific-white-sided-dolphin','pseudo-nitzschia','sea-slugs-nudibranchs','sperm-whale','stargazer-species-guide','whale-associated-organisms','wildfires-ocean-health','wildlife-rescue','gooseneck-barnacle']
SCRIPT_PAIRS = {'gray-whale': ['f0fbe36996fa1248c364a20dff466bd85cb003f905a40d28e6a3b829e8acfed3', '6536a1cf7f1a6dc2f138d20837ac2f891b81b21c9b5a1021f2f674f32286e6f8'], 'wildlife-rescue': ['fcf53aa37f51c1c0308281e5ce2c9f6c33a351109e5d01dd73b3be960f6d0231', '0fcf7e5425b5ecfe625ffc2fdc8a19a1328a5175cbd97e7282c02a3051cbc8c3'], 'whale-associated-organisms': ['3a53c2187fcf0d4ac96dde2724153d2aedfce30a7fad113b1d8b29ce54a09c88', '505d4bfa811e68e03a6e5278ef4d8bb990d3870029d11223085e37c02f94f1ee']}
def sha(b): return hashlib.sha256(b).hexdigest()
def norm(s): return ' '.join(s.split())
def git(repo,*args): return subprocess.check_output(['git','-C',str(repo),*args])
def events(node):
    # HTML parser resolves entities and optional SVG end-tag serialization.
    result=[('start',node.tag,sorted(node.attrib.items()))]
    if node.text and node.text.strip(): result.append(('text',node.text))
    for child in node:
        result.extend(events(child))
        if child.tail and child.tail.strip(): result.append(('text',child.tail))
    result.append(('end',node.tag))
    return result

def review(aid, origin, inventory, repo):
    commit=origin['source_commit'];folder=str(Path(inventory.get(aid,{}).get('url','apps/'+aid+'/index.html')).parent)
    source=git(repo,'show',commit+':'+folder+'/index.html');current=(ROOT/'src/apps'/aid/'index.html').read_bytes()
    before,after=html.fromstring(source),html.fromstring(current)
    manifest=json.loads((ROOT/'src/apps'/aid/'manifest.json').read_text())
    section_rows=[]
    for sec in manifest['sections']:
        nodes=after.xpath('//*[@id=$id]',id=sec['id']); assert len(nodes)==1,(aid,'section target',sec['id'])
        target=nodes[0];heading=target.find('summary') if target.tag=='details' else target
        body=heading.getparent()
        actual=norm(' '.join(body.itertext()))
        assert norm(sec['text'])==actual,(aid,'search text differs',sec['id'])
        section_rows.append({'id':sec['id'],'search_matches_rendered_source':True,'text_sha256':sha(actual.encode())})
    original_ids={n.get('id') for n in before.iter() if n.get('id')}
    for n in after.iter():
        if n.get('id') and n.get('id') not in original_ids:
            assert n.get('id') in {x['id'] for x in manifest['sections']},(aid,'unexpected new id',n.get('id'))
            del n.attrib['id']
    injected=after.xpath('//script[@src="../../core/app-contract.js"]');assert len(injected)==1
    injected[0].getparent().remove(injected[0])
    styles=after.xpath('//style[text()=\'[data-v2-maintenance-hidden="true"]{display:none!important}\']');assert len(styles)==1
    styles[0].getparent().remove(styles[0])
    for n in before.xpath('//link[@rel="manifest"]'):n.getparent().remove(n)
    for n in after.xpath('//*[@data-v2-maintenance-hidden]'):
        assert aid=='gooseneck-barnacle' and n.get('id') in ['clearCache','cacheMsg']
        assert n.get('data-v2-maintenance-hidden')=='true' and n.get('hidden')=='hidden' and n.get('aria-hidden')=='true'
        for attr in ['data-v2-maintenance-hidden','hidden','aria-hidden']:del n.attrib[attr]
        if n.tag=='button':assert 'disabled' in n.attrib;del n.attrib['disabled']
    if aid=='sperm-whale':
        old=before.xpath('//header/a')[0];assert old.get('href')=='../naturalist-field-notes/' and old.text=='← Return to Naturalist Field Notes'
        old.set('href','../../index.html?home=1');old.text='← MBA Hub';old.tail=' · '
        link=html.Element('a',href='../naturalist-field-notes/index.html');link.text='Naturalist Field Notes';old.addnext(link)
    if aid in SCRIPT_PAIRS:
        for doc,expected in zip([before,after],SCRIPT_PAIRS[aid]):
            scripts=doc.xpath('//script[not(@src)]');assert len(scripts)==1 and sha((scripts[0].text or '').encode())==expected,(aid,'unreviewed executable')
            scripts[0].text='REVIEWED-MIGRATION-EXECUTABLE:'+aid
    dependencies=[]
    # Inspect every external code/style dependency declared by the retained page.
    for node in before.xpath('//script[@src]|//link[@rel="stylesheet"]'):
        url=urlsplit(node.get('src') or node.get('href')).path;path=posixpath.normpath(posixpath.join(folder,url))
        pinned=git(repo,'show',commit+':'+path);local=(ROOT/posixpath.normpath(posixpath.join('src/apps/'+aid,url))).read_bytes()
        if aid=='gooseneck-barnacle' and url=='app.js':
            expected=pinned.decode().replace("if('caches'in window)","if(false)").replace('await caches.keys()','await Promise.resolve([])').replace('await caches.delete(k)','await Promise.resolve(false)').replace("if('serviceWorker'in navigator)","if(false)").replace("navigator.serviceWorker.register('./sw.js')","Promise.resolve({update:async()=>{},installing:null,waiting:null,active:null})")
            assert local.decode()==expected,'Unexpected Gooseneck executable change'
        else:assert pinned==local,(aid,'external dependency changed',url)
        dependencies.append({'path':url,'pinned_sha256':sha(pinned),'current_sha256':sha(local)})
    dynamic=None
    if aid=='whale-associated-organisms':
        original_scripts=html.fromstring(source).xpath('//script[not(@src)]');current_scripts=html.fromstring(current).xpath('//script[not(@src)]')
        data=(ROOT/'src/apps/whale-parasites-associates/data.js').read_text()
        rendered=json.loads(subprocess.check_output(['node',str(ROOT/'scripts/migration/render-whale-fidelity.mjs')],input=json.dumps({'source':original_scripts[0].text,'current':current_scripts[0].text,'data':data}).encode()))
        pinned_tree,current_tree=html.fromstring(rendered['pinned']),html.fromstring(rendered['current'])
        assert events(pinned_tree)==events(current_tree),'Whale dynamic rendered DOM differs'
        dynamic={'entries':len(current_tree.xpath('./details')),'complete_rendered_dom_equal':True,'pinned_rendered_sha256':sha(rendered['pinned'].encode()),'current_rendered_sha256':sha(rendered['current'].encode())}
    media=[]
    for doc,is_current in [(before,False),(after,True)]:
        def media_bytes(url):
            path=posixpath.normpath(posixpath.join('src/apps/'+aid if is_current else folder,unquote(url)))
            return (ROOT/path).read_bytes() if is_current else git(repo,'show',commit+':'+path)
        for n in doc.iter():
            for attr in ['src','href']:
                val=n.get(attr)
                if not val:continue
                parts=urlsplit(val)
                if not parts.scheme and not parts.netloc and re.search(r'\.(?:jpeg|jpg|png|svg|gif|webp)$',parts.path,re.I):
                    digest=sha(media_bytes(parts.path));n.set(attr,'PINNED-BYTES:'+digest)
                    if is_current and n.tag=='img':media.append({'url':val,'sha256':digest})
                elif attr=='href' and not parts.scheme and not parts.netloc:
                    if val.endswith('/'):n.set(attr,val+'index.html')
                    if aid=='gray-whale' and n.get(attr)=='../gray-whale-skeleton/index.html':n.set(attr,'../gray-whale-skeleton-exhibit/index.html')
            if aid=='gray-whale' and n.tag=='style' and n.text:
                def cssurl(m):return 'url(PINNED-BYTES:'+sha(media_bytes(m.group(1)))+')'
                n.text=re.sub(r'url\([\"\']?([^\)\"\']+)[\"\']?\)',cssurl,n.text)
    assert events(before)==events(after),(aid,'unexpected full DOM/style/link difference')
    file_rows=[]
    for path in git(repo,'ls-tree','-r','--name-only',commit,'--',folder).decode().splitlines():
        relative=path[len(folder)+1:];local=ROOT/'src/apps'/aid/relative
        if Path(path).suffix not in ['.html','.js','.css','.json','.webmanifest']:continue
        row={'source_path':path,'pinned_sha256':sha(git(repo,'show',commit+':'+path))}
        if local.exists():row['current_sha256']=sha(local.read_bytes())
        else:
            assert relative in ['sw.js','manifest.webmanifest'],(aid,'unreviewed omitted code',relative)
            row['replacement']='Shared Hub worker/manifest; standalone registration removed'
        file_rows.append(row)
    return {'app_id':aid,'source_commit':commit,'source_repository':origin['source_repository'],'source_html_sha256':sha(source),'current_html_sha256':sha(current),'complete_normalized_dom_equal':True,'sections':section_rows,'displayed_media_uses':media,'reviewed_inline_script_hashes':SCRIPT_PAIRS.get(aid),'files':file_rows,'external_dependencies':dependencies,'dynamic_rendering':dynamic}

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--sources-dir',type=Path,required=True);args=parser.parse_args()
    repo=args.sources_dir/'fidelity-MBA-hub'
    if not repo.exists():repo=args.sources_dir/'MBA-hub'
    provenance=json.loads((ROOT/'config/migration-provenance.json').read_text());origins={x['app_id']:x for x in provenance['apps']};inventory={x['id']:x for x in json.loads((ROOT/'config/v1-inventory.json').read_text())['apps']}
    rows=[review(aid,origins[aid],inventory,repo) for aid in IDS]
    print(json.dumps({'schema_version':1,'scope':'Engineering reviewed migration-only differences; no new approvals or physical acceptance','apps':rows,'summary':{'apps':len(rows),'sections':sum(len(x['sections']) for x in rows),'displayed_media_uses':sum(len(x['displayed_media_uses']) for x in rows)}},indent=2))
if __name__=='__main__':main()
