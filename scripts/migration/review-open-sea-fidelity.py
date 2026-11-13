#!/usr/bin/env python3
"""Fail-closed complete Open Sea pinned/current byte and structural renderer audit.
Python lxml and Node required. No browser/device, scientific or rights approval.
"""
import argparse, hashlib, json, re, subprocess
from pathlib import Path
from lxml import html
COMMIT='5c219508d23255080f6b050cefa8092905447d81'
EMPTY=hashlib.sha256(b'').hexdigest()
EXPECTED={name:EMPTY for name in ['app.js','apps.js','data.js','styles.css']}
EXPECTED.update({'index.html':'217e9b3187dba518f58bfbe45adad87ee58fc119c1c3ae5cb4214500a8979872','manifest.json':'c2d6b95f4693370192c4df480c25effe7386967271a6ccc72baed6b157cf3667'})
PHOTO='shared/media/asset-214710e10f5121d5--ScreenHunter-10670.jpg'
SOURCE_PHOTO='apps/open-sea/images/ScreenHunter 10670.jpg'
sha=lambda b:hashlib.sha256(b).hexdigest()
normalize=lambda s:' '.join(s.split())
def canonical(element):
    if not isinstance(element.tag,str):return None
    children=[]
    for child in element:
        value=canonical(child)
        if value is not None:children.append({'node':value,'tail':normalize(child.tail or '')})
    return {'tag':element.tag.lower(),'attributes':dict(sorted((k.lower(),v) for k,v in element.attrib.items())),'text':normalize(element.text or ''),'children':children}
def reject_symlink_path(root,relative,label):
    current=root
    assert current.is_dir() and not current.is_symlink(),label+': root symlink/non-directory'
    for component in Path(relative).parts:
        current=current/component
        assert not current.is_symlink(),label+' symlink'
    return current

def review(root,repo):
    def pinned(name):return subprocess.check_output(['git','-C',str(repo),'show',COMMIT+':'+name])
    assert subprocess.check_output(['git','-C',str(repo),'rev-parse',COMMIT+'^{commit}'],text=True).strip()==COMMIT
    directory=root/'src/apps/open-sea'
    assert not directory.is_symlink(),'App-directory symlink'
    reject_symlink_path(root,'src/apps/open-sea','App path')
    paths=list(directory.rglob('*'));assert not any(p.is_symlink() for p in paths),'App-local symlink'
    assert all(p.is_file() for p in paths),'Unexpected non-file app resource'
    actual={p.relative_to(directory).as_posix():sha(p.read_bytes()) for p in sorted(paths) if p.is_file()}
    assert actual==EXPECTED,'Unreviewed complete app file inventory/bytes'
    photograph=root/'src'/PHOTO
    reject_symlink_path(root,'src','Source path')
    reject_symlink_path(root,'src/'+PHOTO,'Media path')
    assert photograph.read_bytes()==pinned(SOURCE_PHOTO),'Changed pinned photograph'
    source=pinned('apps/open-sea/index.html');current=(directory/'index.html').read_bytes()
    old=html.fromstring(source);new=html.fromstring(current)
    old_styles=old.xpath('//style/text()');new_styles=new.xpath('//style/text()')
    assert len(new_styles)==len(old_styles)+1 and new_styles[:-1]==old_styles and new_styles[-1]=='[data-v2-maintenance-hidden="true"]{display:none!important}','Inline stylesheet bytes'
    for element in new.xpath('//script[@src="../../core/app-contract.js"]|//style[last()]'):
        # The injected maintenance style is identified by exact bytes, not position.
        if element.tag=='script' or element.text=='[data-v2-maintenance-hidden="true"]{display:none!important}':element.getparent().remove(element)
    for ident in ['Open-Sea-Overview-Key-Influences','Welcome-to-the-Open-Sea','Primary-Open-Sea-Influences','References-and-source-notes']:
        element=new.get_element_by_id(ident);del element.attrib['id']
    images=new.xpath('//img');assert len(images)==1 and images[0].get('src')=='../../'+PHOTO
    images[0].set('src','images/ScreenHunter%2010670.jpg')
    # Complete executable script is separately run and compared below. Static
    # comparison removes only its contents; the element/order/attributes remain.
    for document in [old,new]:
        scripts=[e for e in document.xpath('//script') if e.text and 'const DATA' in e.text]
        assert len(scripts)==1;scripts[0].text=''
    assert canonical(old)==canonical(new),'Complete normalized static document'
    rendered=json.loads(subprocess.check_output(['node',str(Path(__file__).with_name('render-open-sea-fidelity.mjs')),str(root),str(repo)]))
    assert set(rendered)=={'pinned','current'}
    assert rendered['pinned']['data']==rendered['current']['data'],'Complete inline DATA'
    data=rendered['pinned']['data'];assert len(data)==12 and len({row['id'] for row in data})==12
    manifest=json.loads((directory/'manifest.json').read_text());sections={r['id']:r for r in manifest['sections']}
    assert len(sections)==len(manifest['sections'])==16
    assert manifest['media']==['asset-214710e10f5121d5']
    static_targets={
        'Open-Sea-Overview-Key-Influences':old.xpath('//details[@class="open-sea-overview"]')[0],
        'Welcome-to-the-Open-Sea':old.xpath('//div[@class="overview-content"]')[0],
        'Primary-Open-Sea-Influences':old.xpath('//div[@class="overview-content"]')[0],
        'References-and-source-notes':old.xpath('//details[@class="references"]')[0]}
    for ident,element in static_targets.items():
        assert ident in sections and normalize(sections[ident]['text'])==normalize(' '.join(element.itertext())),ident+': complete static search text'

    cards=[];body_counts={};body_classes={}
    for version in ['pinned','current']:
        output=rendered[version];assert set(output)=={'data','cards','states'} and len(output['cards'])==len(output['states'])==12
        for row,state in zip(data,output['states']):
            assert state=={'id':'card-'+row['id'],'before':{'open':False,'expanded':'false','hidden':'true'},'opened':{'open':True,'expanded':'true','hidden':'false'},'closed':{'open':False,'expanded':'false','hidden':'true'}},'Click/ARIA state'
    for row,before,after in zip(data,rendered['pinned']['cards'],rendered['current']['cards']):
        left=html.fromstring(before);right=html.fromstring(after)
        assert canonical(left)==canonical(right),row['id']+': full rendered card tree'
        ident='card-'+row['id'];assert right.get('id')==ident and right.get('class')=='card'
        assert len(right.xpath('.//svg'))==1 and len(right.xpath('.//svg/path'))==1
        body=right.xpath('.//div[@class="card-body-inner"]');assert len(body)==1
        original=html.fragment_fromstring(row['body'],create_parent='div');original.set('class','card-body-inner')
        assert canonical(original)==canonical(body[0]),row['id']+': authored full body tree'
        for element in original.iterdescendants():
            body_counts[element.tag]=body_counts.get(element.tag,0)+1
            if element.get('class'):body_classes[element.get('class')]=body_classes.get(element.get('class'),0)+1
        assert ident in sections
        source_text=normalize(' '.join(html.fragment_fromstring(' '.join([row['title'],row['subtitle'],' '.join(row['tags']),row['body']]),create_parent='div').itertext()))
        assert normalize(sections[ident]['text'])==source_text,row['id']+': complete manifest search text'
        cards.append({'id':ident,'full_tree_equal':True,'authored_body_tree_equal':True,'normalized_tree_sha256':sha(json.dumps(canonical(right),sort_keys=True).encode()),'search_text_equal':True,'click_and_aria_equal':True})
    assert body_counts=={'h4':28,'p':34,'ul':16,'li':66,'div':12,'span':10,'strong':9},'Complete authored body cardinalities'
    assert body_classes=={'fact-strip':5,'fact-pill':10,'adapt-box':6,'training-note':1}
    sourcepaths=subprocess.check_output(['git','-C',str(repo),'ls-tree','-r','--name-only',COMMIT,'--','apps/open-sea/'],text=True).splitlines()
    return {'schema_version':1,'source_commit':COMMIT,'scope':'Complete pinned/current engineering fidelity; no scientific, rights, browser or physical acceptance approval','current_complete_inventory':actual,'pinned_complete_inventory':[{'path':p,'sha256':sha(pinned(p))} for p in sourcepaths],'inline_stylesheet_exact_blocks':len(old_styles),'static_normalized_document_equal':True,'complete_inline_dataset_equal':True,'static_search_targets':{ident:True for ident in static_targets},'cards':cards,'authored_body_tag_counts':body_counts,'authored_body_class_counts':body_classes,'media':{'current_path':PHOTO,'pinned_path':SOURCE_PHOTO,'exact':True,'sha256':sha(photograph.read_bytes())},'limitations':['The DOM model executes actual renderers and safeNode structural copying with independently lxml-parsed full nodes; it is not a browser HTML parser or native event/service-worker lifecycle.','Real browser layout, assistive technology, physical offline/update/rollback, scientific accuracy, rights and operational approval remain separate.']}
if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--sources-dir',type=Path,required=True);parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[2]);args=parser.parse_args()
    repo=args.sources_dir/'fidelity-MBA-hub'
    print(json.dumps(review(args.root.resolve(),repo.resolve()),indent=2))
