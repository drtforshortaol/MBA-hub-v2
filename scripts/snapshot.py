"""Retain or restore a complete verified local build; never contact V1 or publish."""
import argparse, hashlib, json, pathlib, shutil, zipfile, tempfile
root=pathlib.Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser();parser.add_argument('operation',choices=['save','restore']);parser.add_argument('environment',choices=['developer','tester']);parser.add_argument('--archive',type=pathlib.Path);args=parser.parse_args()
build=root/'dist'/args.environment
if args.operation=='save':
 release=json.loads((build/'release.json').read_text());out=root/'releases'/f"{args.environment}-{release['release']}.zip";out.parent.mkdir(exist_ok=True)
 with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
  for p in build.rglob('*'):
   if p.is_file():z.write(p,p.relative_to(build))
 print(out)
else:
 if not args.archive:parser.error('--archive required')
 with tempfile.TemporaryDirectory() as temp:
  staging=pathlib.Path(temp)
  with zipfile.ZipFile(args.archive) as z:
   for member in z.namelist():
    if not (staging/member).resolve().is_relative_to(staging.resolve()):raise ValueError('Unsafe archive path')
   z.extractall(staging)
  release=json.loads((staging/'release.json').read_text())
  if release['environment']!=args.environment:raise ValueError('Environment mismatch')
  for asset in release['resources']:
   if hashlib.sha256((staging/asset['url']).read_bytes()).hexdigest()!=asset['sha256']:raise ValueError('Invalid snapshot')
  if build.exists():shutil.rmtree(build)
  shutil.copytree(staging,build)
 print('Verified local snapshot restored; deployment and installed-device activation require separate testing.')
