#!/usr/bin/env python3
"""Read pinned Git objects only; emit evidence, never reconcile approval flags.

Usage: python scripts/audit-migration-fidelity.py --sources-dir PATH > report.json
PATH contains read-only clones named MBA-hub, aquarium-shift-library-,
and evolution-timeline (or fidelity- prefixed names). No checkout is required.
"""
import argparse
import difflib
import hashlib
from html.parser import HTMLParser
import json
import posixpath
import re
from pathlib import Path, PurePosixPath
import subprocess
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


def git(repo, *args):
    return subprocess.check_output(['git', '-C', str(repo), *args])


def digest(value):
    return hashlib.sha256(value).hexdigest()


class Prose(HTMLParser):
    """Static text only. Script-generated prose is explicitly outside this test."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = 0
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.skip += 1

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.skip = max(0, self.skip - 1)

    def handle_data(self, text):
        if not self.skip:
            words = ' '.join(text.split())
            if words:
                self.parts.append(words)


def prose(data):
    parser = Prose()
    parser.feed(data.decode('utf-8'))
    return ' '.join(parser.parts)


def media_normalized_data(source, current, folder, repo, commit, media):
    """Normalize only quoted image URLs whose pinned bytes are independently read.

    Whole-file equality after this substitution preserves every other byte,
    including numbers, prose, dates, field names and non-image URLs.
    """
    before, after = source.decode('utf-8'), current.decode('utf-8')
    replacements = []
    tokens = sorted(set(re.findall(r"[\"']([^\"'\s]+\.(?:jpe?g|png|svg|gif|webp))[\"']", before, re.I)))
    for token in tokens:
        url = urlsplit(token)
        if url.scheme or url.netloc:
            continue
        path = posixpath.normpath(posixpath.join(folder, unquote(url.path)))
        try:
            pinned = subprocess.check_output(['git', '-C', str(repo), 'show', commit + ':' + path], stderr=subprocess.DEVNULL)
        except subprocess.CalledProcessError:
            continue
        sha = digest(pinned)
        marker = 'PINNED-MEDIA-SHA256:' + sha
        before = before.replace(token, marker)
        mapped = []
        for asset in media:
            local_path = ROOT / 'src' / asset['path']
            relative_url = posixpath.relpath(asset['path'], 'apps/' + Path(folder).name)
            if relative_url in after and digest(local_path.read_bytes()) == sha:
                after = after.replace(relative_url, marker)
                mapped.append(asset['path'])
        if mapped:
            replacements.append({'source_url': token, 'source_path': path, 'sha256': sha, 'current_paths': mapped})
    return {'equal_after_only_image_url_normalization': before == after,
            'pinned_normalized_sha256': digest(before.encode()),
            'current_normalized_sha256': digest(after.encode()),
            'image_url_mappings': replacements}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sources-dir', type=Path, required=True)
    args = parser.parse_args()
    provenance = json.loads((ROOT / 'config/migration-provenance.json').read_text())
    inventory = {a['id']: a for a in json.loads((ROOT / 'config/v1-inventory.json').read_text())['apps']}
    repos = {}
    for name, commit in provenance['source_commits'].items():
        repo = args.sources_dir / name
        if not repo.exists():
            repo = args.sources_dir / ('fidelity-' + name)
        # Require the exact commit object; neither current HEAD nor worktree is trusted.
        actual = git(repo, 'rev-parse', commit + '^{commit}').decode().strip()
        if actual != commit:
            raise ValueError('Pinned source mismatch: ' + name)
        repos['drtforshortaol/' + name] = repo
    report = {
        'schema_version': 1,
        'scope': 'Pinned source byte and static-text evidence; no scientific/editorial/device approval',
        'audited_source_commit': git(ROOT, 'rev-parse', 'HEAD').decode().strip(),
        'source_commits': provenance['source_commits'],
        'media': [], 'apps': [],
        'limitations': [
            'Static HTML text equality excludes JavaScript-generated content, layout and behavior.',
            'Changed executable/data files require reviewed diffs; byte differences do not imply changed scientific claims.',
            'Missing source files, altered files and local additions remain explicit; no approval flags are written.',
        ],
    }
    for asset in provenance['media']:
        repo = repos.get(asset.get('source_repository'))
        row = {'asset_id': asset['asset_id'], 'path': asset['path'],
               'source_repository': asset.get('source_repository'),
               'source_commit': asset.get('source_commit'), 'source_path': asset.get('source_path')}
        local = (ROOT / 'src' / asset['path']).read_bytes()
        row['current_sha256'] = digest(local)
        if repo and asset.get('source_path') and asset.get('source_commit'):
            source = git(repo, 'show', asset['source_commit'] + ':' + asset['source_path'])
            row['pinned_sha256'] = digest(source)
            row['status'] = 'exact-pinned-bytes' if local == source else 'different'
            row['recorded_digest_matches'] = asset.get('sha256') == digest(source)
        else:
            row['status'] = 'source-provenance-incomplete'
        report['media'].append(row)
    for app in sorted(provenance['apps'], key=lambda a: a['app_id']):
        aid = app['app_id']
        repo = repos[app['source_repository']]
        commit = app['source_commit']
        url = inventory.get(aid, {}).get('url', 'apps/' + aid + '/index.html')
        folder = '' if urlsplit(url).scheme else str(PurePosixPath(unquote(url)).parent) + '/'
        files = git(repo, 'ls-tree', '-r', '--name-only', commit, '--', folder or '.').decode().splitlines()
        row = {'app_id': aid, 'source_repository': app['source_repository'], 'source_commit': commit,
               'source_folder': folder or '.', 'files': [], 'approval_reconciliation': 'pending-reviewed-differences'}
        local_folder = ROOT / 'src/apps' / aid
        mapped = set()
        for path in files:
            rel = path[len(folder):] if folder else path
            local = local_folder / rel
            if PurePosixPath(path).suffix not in ('.html', '.js', '.css', '.json'):
                continue
            source = git(repo, 'show', commit + ':' + path)
            item = {'source_path': path, 'local_path': str(local.relative_to(ROOT)), 'pinned_sha256': digest(source)}
            if not local.exists():
                item['status'] = 'not-copied-or-replaced'
            else:
                mapped.add(rel)
                current = local.read_bytes()
                item.update(current_sha256=digest(current), status='exact-pinned-bytes' if source == current else 'changed')
                if local.name in ('data.js', 'library-data.js'):
                    item['content_data_comparison'] = media_normalized_data(source, current, folder, repo, commit, provenance['media'])
                if local.suffix == '.html':
                    before, after = prose(source), prose(current)
                    item['static_text_equal'] = before == after
                    if before != after:
                        item['static_text_diff'] = list(difflib.unified_diff(before.split(), after.split(), fromfile='pinned', tofile='current', lineterm=''))
                    item['pinned_static_text_sha256'] = digest(before.encode())
                    item['current_static_text_sha256'] = digest(after.encode())
            row['files'].append(item)
        row['local_additions'] = sorted(str(p.relative_to(local_folder)) for p in local_folder.rglob('*')
                                        if p.is_file() and str(p.relative_to(local_folder)) not in mapped)
        report['apps'].append(row)
    report['summary'] = {
        'apps': len(report['apps']), 'media': len(report['media']),
        'media_exact_pinned_bytes': sum(r['status'] == 'exact-pinned-bytes' for r in report['media']),
        'media_differences': sum(r['status'] == 'different' for r in report['media']),
        'media_incomplete_provenance': sum(r['status'] == 'source-provenance-incomplete' for r in report['media']),
        'html_static_text_equal': sum(f.get('static_text_equal') is True for a in report['apps'] for f in a['files']),
        'html_static_text_changed': sum(f.get('static_text_equal') is False for a in report['apps'] for f in a['files']),
        'approval_flags_changed': False,
    }
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
