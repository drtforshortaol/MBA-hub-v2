#!/usr/bin/env python3
"""Focused adversarial regressions; requires pinned V1 repo via --sources-dir."""
import argparse, importlib.util, json, shutil, tempfile
from pathlib import Path
spec=importlib.util.spec_from_file_location('review',Path(__file__).with_name('review-static-fidelity.py'));review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
p=argparse.ArgumentParser();p.add_argument('--sources-dir',type=Path,required=True);args=p.parse_args()
repo=args.sources_dir/'fidelity-MBA-hub';root=review.ROOT
origins={x['app_id']:x for x in json.loads((root/'config/migration-provenance.json').read_text())['apps']};inventory={x['id']:x for x in json.loads((root/'config/v1-inventory.json').read_text())['apps']}
passed=0
with tempfile.TemporaryDirectory() as tmp:
    review.ROOT=Path(tmp)
    (review.ROOT/'src/shared').mkdir(parents=True)
    (review.ROOT/'src/shared/media').symlink_to(root/'src/shared/media',target_is_directory=True)
    for aid in ['stargazer-species-guide','gooseneck-barnacle']:
        dest=review.ROOT/'src/apps'/aid;shutil.copytree(root/'src/apps'/aid,dest)
        review.review(aid,origins[aid],inventory,repo);passed+=1
    aid='stargazer-species-guide';page=review.ROOT/'src/apps'/aid/'index.html';original=page.read_text()
    mutations=[original.replace('Stargazers are marine fishes','Stargazers are freshwater fishes'),original.replace('font-weight:700','font-weight:100'),original.replace('https://youtu.be/lRF4dKmByRU','https://example.invalid/altered'),original.replace('asset-4b41d3a89ec67f65--IMG_3450.jpeg','asset-2f53072d7bea2b19--IMG_2729.jpeg'),original.replace('loading="eager"','loading="lazy"')]
    for mutated in mutations:
        assert mutated!=original;page.write_text(mutated)
        try:review.review(aid,origins[aid],inventory,repo)
        except AssertionError:passed+=1
        else:raise AssertionError('Unexpected mutation accepted')
    page.write_text(original);manifest=review.ROOT/'src/apps'/aid/'manifest.json';obj=json.loads(manifest.read_text());obj['sections'][0]['text']+=' invented claim';manifest.write_text(json.dumps(obj))
    try:review.review(aid,origins[aid],inventory,repo)
    except AssertionError:passed+=1
    else:raise AssertionError('Search mutation accepted')
    aid='gooseneck-barnacle';js=review.ROOT/'src/apps'/aid/'app.js';js.write_text(js.read_text()+'\nalert("unexpected");')
    try:review.review(aid,origins[aid],inventory,repo)
    except AssertionError:passed+=1
    else:raise AssertionError('Executable mutation accepted')
    aid='whale-associated-organisms'
    shutil.copytree(root/'src/apps'/aid,review.ROOT/'src/apps'/aid)
    dependency=review.ROOT/'src/apps/whale-parasites-associates';dependency.mkdir()
    shutil.copy(root/'src/apps/whale-parasites-associates/data.js',dependency/'data.js')
    (review.ROOT/'scripts').symlink_to(root/'scripts',target_is_directory=True)
    review.review(aid,origins[aid],inventory,repo);passed+=1
    page=review.ROOT/'src/apps'/aid/'index.html';original=page.read_text();page.write_text(original.replace('container.replaceChildren(...entries);','container.replaceChildren();'))
    try:review.review(aid,origins[aid],inventory,repo)
    except AssertionError:passed+=1
    else:raise AssertionError('Dynamic renderer mutation accepted')
    page.write_text(original);data=dependency/'data.js';data.write_text(data.read_text()+'\n// unexpected dataset edit')
    try:review.review(aid,origins[aid],inventory,repo)
    except AssertionError:passed+=1
    else:raise AssertionError('Dynamic dataset mutation accepted')
print(f'{passed}/{passed} static fidelity baseline/mutation checks PASS')
