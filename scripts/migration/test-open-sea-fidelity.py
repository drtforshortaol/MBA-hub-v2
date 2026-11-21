#!/usr/bin/env python3
"""Isolated Open Sea byte-boundary and independent structural regression probes."""
import argparse, importlib.util, json, shutil, tempfile
from pathlib import Path
spec=importlib.util.spec_from_file_location('open_sea_review',Path(__file__).with_name('review-open-sea-fidelity.py'))
review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--sources-dir',type=Path,required=True);p.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[2]);args=p.parse_args()
source=args.sources_dir.resolve()/'fidelity-MBA-hub';root=args.root.resolve();passed=0
with tempfile.TemporaryDirectory(prefix='mba-open-sea-fidelity-') as temporary:
    clone=Path(temporary);directory=clone/'src/apps/open-sea';shutil.copytree(root/'src/apps/open-sea',directory)
    photo=clone/'src'/review.PHOTO;photo.parent.mkdir(parents=True);shutil.copy2(root/'src'/review.PHOTO,photo)
    def run(expected,label,reason=None):
        global passed
        try:review.review(clone,source)
        except AssertionError as error:
            if expected:raise
            if reason:assert reason in str(error),(label,str(error))
        else:assert expected,label+': unexpected PASS'
        passed+=1;print('PASS '+label)
    run(True,'isolated baseline')
    for name in ['app.js','index.html','manifest.json']:
        target=directory/name;original=target.read_bytes()
        try:target.write_bytes(original+b'\n ');run(False,'changed complete '+name+' rejected','inventory/bytes')
        finally:target.write_bytes(original)
    target=directory/'extra.txt'
    try:target.write_text('unreviewed');run(False,'added app file rejected','inventory/bytes')
    finally:target.unlink()
    target=directory/'extra-link'
    try:target.symlink_to('index.html');run(False,'app-local symlink rejected','App-local symlink')
    finally:target.unlink()
    saved=clone/'photo-original';photo.rename(saved)
    try:photo.symlink_to(saved);run(False,'media symlink rejected','Media path symlink')
    finally:photo.unlink();saved.rename(photo)
    parent=clone/'src/shared/media';saved=clone/'media-directory-original';parent.rename(saved)
    try:parent.symlink_to(saved,target_is_directory=True);run(False,'media-directory symlink rejected','Media path symlink')
    finally:parent.unlink();saved.rename(parent)
    parent=clone/'src/apps';saved=clone/'apps-directory-original';parent.rename(saved)
    try:parent.symlink_to(saved,target_is_directory=True);run(False,'apps-directory symlink rejected','App path symlink')
    finally:parent.unlink();saved.rename(parent)
    parent=clone/'src';saved=clone/'src-directory-original';parent.rename(saved)
    try:parent.symlink_to(saved,target_is_directory=True);run(False,'src-directory symlink rejected','App path symlink')
    finally:parent.unlink();saved.rename(parent)
    saved=clone/'app-original';directory.rename(saved)
    try:directory.symlink_to(saved,target_is_directory=True);run(False,'app-directory symlink rejected','App-directory symlink')
    finally:directory.unlink();saved.rename(directory)
    # Refresh ONLY the test's byte guard for these mutations, proving the full
    # structural oracle itself detects body/metadata loss beyond hash checks.
    target=directory/'index.html';original=target.read_bytes();binding=review.EXPECTED['index.html']
    mutations=[
        ('training-note class loss',b'(name === "training-note" && source.tagName === "DIV")',b'false','full rendered card tree'),
        ('strong node flattening',b'"SPAN", "STRONG", "EM"',b'"SPAN", "EM"','full rendered card tree'),
        ('SVG path mutation',b'M6 9l6 6 6-6',b'M6 9l1 1 1-1','full rendered card tree'),
        ('authored body mutation',b'Cold and Salty Water Is Dense',b'Cold and Salty Water Is Different','Complete inline DATA')]
    try:
        for label,before,after,reason in mutations:
            assert original.count(before)==1,(label,original.count(before))
            mutated=original.replace(before,after);target.write_bytes(mutated);review.EXPECTED['index.html']=review.sha(mutated)
            run(False,label+' rejected beyond byte guard',reason)
    finally:target.write_bytes(original);review.EXPECTED['index.html']=binding
    run(True,'restored isolated baseline')
print(f'{passed}/{passed} Open Sea baseline/adversarial checks PASS')
