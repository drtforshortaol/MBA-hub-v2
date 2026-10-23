#!/usr/bin/env python3
"""Exercise the portable audit in an isolated copy; never mutate live app bytes."""
import argparse,json,shutil,subprocess,tempfile
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--sources-dir',type=Path,required=True);args=p.parse_args()
root=Path(__file__).resolve().parents[2];source=args.sources_dir.resolve()
with tempfile.TemporaryDirectory(prefix='mba-dynamic-fidelity-') as temporary:
 clone=Path(temporary);(clone/'scripts/migration').mkdir(parents=True);(clone/'config').mkdir()
 for name in ['review-dynamic-reference-fidelity.py','render-dynamic-reference-apps.mjs']:shutil.copy2(root/'scripts/migration'/name,clone/'scripts/migration'/name)
 shutil.copy2(root/'config/migration-provenance.json',clone/'config/migration-provenance.json')
 for app in ['five-senses-pwa','kelp-forest','northern-elephant-seal']:shutil.copytree(root/'src/apps'/app,clone/'src/apps'/app)
 provenance=json.loads((root/'config/migration-provenance.json').read_text())
 ids=set()
 for app in ['five-senses-pwa','kelp-forest','northern-elephant-seal']:ids.update(json.loads((clone/'src/apps'/app/'manifest.json').read_text())['media'])
 for record in provenance['media']:
  if record['asset_id'] in ids:
   target=clone/'src'/record['path'];target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(root/'src'/record['path'],target)
 command=['python3',str(clone/'scripts/migration/review-dynamic-reference-fidelity.py'),'--sources-dir',str(source)]
 def run(expected,label):
  result=subprocess.run(command,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,text=True)
  assert (result.returncode==0)==expected,(label,result.stderr)
  print('PASS '+label)
 run(True,'isolated baseline')
 for name in ['app.js','data.js','manifest.json']:
  target=clone/'src/apps/five-senses-pwa'/name;original=target.read_bytes()
  try:target.write_bytes(original+b'\n ');run(False,'changed complete '+name+' rejected')
  finally:target.write_bytes(original)
 target=clone/'src/apps/kelp-forest/unreviewed.txt'
 try:target.write_text('extra');run(False,'added app-local file rejected')
 finally:target.unlink()
 target=clone/'src/apps/kelp-forest/unreviewed-link'
 try:target.symlink_to('app.js');run(False,'app-local symlink rejected')
 finally:target.unlink()
 target=next((clone/'src/shared/media').iterdir());original=target.read_bytes();saved=clone/'media-original';saved.write_bytes(original)
 try:target.unlink();target.symlink_to(saved);run(False,'shared media symlink rejected')
 finally:target.unlink();target.write_bytes(original);saved.unlink()
 target=clone/'src/apps/kelp-forest';saved=clone/'kelp-original'
 try:target.rename(saved);target.symlink_to(saved,target_is_directory=True);run(False,'app-directory symlink rejected')
 finally:target.unlink();saved.rename(target)
 run(True,'restored isolated baseline')
