#!/usr/bin/env python3
"""Regression checks: python scripts/migration/test-fidelity-audit.py."""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('audit', Path(__file__).parents[1] / 'audit-migration-fidelity.py')
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class FidelityTests(unittest.TestCase):
    def test_static_text_retains_hidden_words_and_ignores_scripts(self):
        self.assertEqual(audit.prose(b'<p hidden>A &amp;  B</p><script>new claim</script><style>x</style>'), 'A & B')
        self.assertNotEqual(audit.prose(b'<p>32 days</p>'), audit.prose(b'<p>33 days</p>'))

    def test_reads_pinned_commit_even_when_head_and_worktree_change(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp) / 'v2'
            repo = Path(temp) / 'sources/MBA-hub'
            repo.mkdir(parents=True)
            def git(*args):
                return subprocess.check_output(['git', '-C', str(repo), *args], stderr=subprocess.DEVNULL)
            git('init')
            git('config', 'user.name', 'Fixture')
            git('config', 'user.email', 'fixture@example.invalid')
            (repo / 'apps/a').mkdir(parents=True)
            (repo / 'apps/a/index.html').write_text('<p>Approved 32 days</p>')
            (repo / 'image.png').write_bytes(b'old image')
            git('add', '.')
            git('commit', '-m', 'pinned')
            pinned = git('rev-parse', 'HEAD').decode().strip()
            (repo / 'apps/a/index.html').write_text('<p>New 33 days</p>')
            (repo / 'image.png').write_bytes(b'new image')
            git('commit', '-am', 'later')
            (repo / 'apps/a/index.html').write_text('Uncommitted change')
            (root / 'config').mkdir(parents=True)
            (root / 'src/apps/a').mkdir(parents=True)
            (root / 'src/shared/media').mkdir(parents=True)
            (root / 'src/apps/a/index.html').write_text('<p>Approved 32 days</p>')
            (root / 'src/shared/media/image.png').write_bytes(b'old image')
            provenance = {'source_commits': {'MBA-hub': pinned}, 'apps': [{'app_id': 'a', 'source_repository': 'drtforshortaol/MBA-hub', 'source_commit': pinned}], 'media': [{'asset_id': 'image', 'path': 'shared/media/image.png', 'source_repository': 'drtforshortaol/MBA-hub', 'source_commit': pinned, 'source_path': 'image.png', 'sha256': audit.digest(b'old image')}]}
            (root / 'config/migration-provenance.json').write_text(json.dumps(provenance))
            (root / 'config/v1-inventory.json').write_text(json.dumps({'apps': [{'id': 'a', 'url': 'apps/a/index.html'}]}))
            # V2 HEAD binding can be a separate Git repository; source objects remain pinned.
            subprocess.run(['git', 'init', str(root)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            subprocess.run(['git', '-C', str(root), '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--allow-empty', '-m', 'v2'], check=True, stdout=subprocess.DEVNULL)
            output = io.StringIO()
            with patch.object(audit, 'ROOT', root), patch('sys.argv', ['audit', '--sources-dir', str(repo.parent)]), contextlib.redirect_stdout(output):
                audit.main()
            report = json.loads(output.getvalue())
            self.assertEqual(report['summary']['media_exact_pinned_bytes'], 1)
            self.assertEqual(report['summary']['html_static_text_equal'], 1)
            self.assertFalse(report['summary']['approval_flags_changed'])


if __name__ == '__main__':
    unittest.main()
