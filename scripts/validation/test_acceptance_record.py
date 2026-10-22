import hashlib
import importlib.util
import pathlib
import tempfile
import unittest
import warnings
import zipfile

spec = importlib.util.spec_from_file_location('acceptance', pathlib.Path(__file__).parents[1] / 'prepare-acceptance-record.py')
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class AcceptanceTests(unittest.TestCase):
    def fixture(self, directory):
        archive = pathlib.Path(directory) / 'artifact.zip'
        with zipfile.ZipFile(archive, 'w') as z:
            z.writestr('SOURCE-COMMIT.txt', 'a' * 40)
        run = {'id': 1, 'head_sha': 'a' * 40, 'status': 'completed', 'conclusion': 'success'}
        artifact = {'id': 2, 'name': 'mba-v2-combined-iphone-review', 'expired': False,
                    'size_in_bytes': archive.stat().st_size,
                    'digest': 'sha256:' + hashlib.sha256(archive.read_bytes()).hexdigest(),
                    'workflow_run': {'id': 1, 'head_sha': 'a' * 40}}
        return archive, artifact, run

    def test_rejects_failed_stale_or_altered_artifact(self):
        with tempfile.TemporaryDirectory() as directory:
            archive, artifact, run = self.fixture(directory)
            self.assertEqual(audit.validate_metadata(artifact, run, 'a' * 40, archive), artifact['digest'][7:])
            for changed in [{'digest': 'sha256:' + 'b' * 64}, {'expired': True}, {'size_in_bytes': 0},
                            {'workflow_run': {'id': 9, 'head_sha': 'a' * 40}}]:
                with self.assertRaises(ValueError):
                    audit.validate_metadata({**artifact, **changed}, run, 'a' * 40, archive)
            with self.assertRaises(ValueError):
                audit.validate_metadata(artifact, {**run, 'conclusion': 'failure'}, 'a' * 40, archive)
            with self.assertRaises(ValueError):
                audit.validate_metadata(artifact, run, 'b' * 40, archive)

    def test_rejects_traversal_aliases_and_duplicate_zip_entries(self):
        with tempfile.TemporaryDirectory() as directory:
            archive = pathlib.Path(directory) / 'unsafe.zip'
            for names in [['../outside'], ['/outside'], ['a/./b'], ['a//b'], ['a\\b'], ['a', 'a']]:
                with warnings.catch_warnings():
                    warnings.simplefilter('ignore', UserWarning)
                    with zipfile.ZipFile(archive, 'w') as z:
                        for name in names:
                            z.writestr(name, 'unsafe')
                with self.assertRaises(ValueError):
                    audit.extract_archive(archive, pathlib.Path(directory) / 'out')

    def test_fresh_record_never_grants_human_device_or_scientific_approval(self):
        record = audit.fresh_record({'id': 2}, {'id': 1, 'head_sha': 'a' * 40}, 'b' * 64,
                                    {'developer': '1' * 16, 'tester': '2' * 16}, ['one', 'two'])
        self.assertFalse(record['release_approved'])
        self.assertEqual(record['sessions'], [])
        self.assertEqual(len(record['reviewers']), 4)
        self.assertEqual(len(record['checklist']), 17)
        self.assertTrue(all(row['status'] == 'NOT TESTED' for row in record['checklist']))
        self.assertTrue(all(row['status'] == 'PENDING' for row in record['operational_gates'].values()))
        self.assertIsNone(record['second_lifecycle_candidate'])
        self.assertEqual(record['candidate']['source_commit'], 'a' * 40)


if __name__ == '__main__':
    unittest.main()
