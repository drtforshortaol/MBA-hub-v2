#!/usr/bin/env python3
"""Verify an exact review ZIP and emit a fresh NOT TESTED acceptance record.

Requires downloaded GitHub artifact and successful run metadata. This binds supplied
metadata/bytes; it does not authenticate metadata, approve content or deploy anything.
"""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import stat
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def validate_metadata(artifact, run, expected_commit, archive):
    if not re.fullmatch('[a-f0-9]{40}', expected_commit):
        raise ValueError('Expected commit must be 40 lowercase hexadecimal characters')
    if artifact.get('name') != 'mba-v2-combined-iphone-review' or artifact.get('expired') is not False:
        raise ValueError('Wrong or expired artifact')
    if type(artifact.get('id')) is not int or artifact['id'] <= 0:
        raise ValueError('Invalid artifact ID')
    if run.get('status') != 'completed' or run.get('conclusion') != 'success':
        raise ValueError('Run has not completed successfully')
    workflow = artifact.get('workflow_run', {})
    if (run.get('head_sha') != expected_commit or workflow.get('head_sha') != expected_commit
            or type(run.get('id')) is not int or workflow.get('id') != run['id']):
        raise ValueError('Run/artifact/source mismatch')
    if type(artifact.get('size_in_bytes')) is not int or artifact['size_in_bytes'] != archive.stat().st_size:
        raise ValueError('ZIP size mismatch')
    with archive.open('rb') as source:
        digest = hashlib.file_digest(source, 'sha256').hexdigest()
    if artifact.get('digest') != 'sha256:' + digest:
        raise ValueError('ZIP SHA-256 mismatch')
    return digest


def extract_archive(archive, destination):
    with zipfile.ZipFile(archive) as source:
        seen = set()
        for entry in source.infolist():
            parts = PurePosixPath(entry.filename).parts
            if (not parts or entry.filename.rstrip('/') != '/'.join(parts) or entry.filename.startswith('/') or '\\' in entry.filename
                    or any(not re.fullmatch('[A-Za-z0-9_.-]+', part) or part in ('.', '..') for part in parts)
                    or entry.filename in seen or stat.S_ISLNK(entry.external_attr >> 16)):
                raise ValueError('Unsafe or duplicate ZIP entry')
            seen.add(entry.filename)
        source.extractall(destination)


def fresh_record(artifact, run, digest, releases, app_ids):
    # Never reuse completed template results, identities or reviewer feedback.
    return {
        'schema_version': 1, 'record_type': 'acceptance-record-not-yet-tested',
        'status': 'NOT TESTED',
        'scope': 'Verified supplied artifact bytes and evidence; no human/device/content approval',
        'candidate': {'source_commit': run['head_sha'], 'artifact_id': artifact['id'],
                      'run_id': run['id'], 'zip_sha256': digest,
                      'developer_release': releases['developer'], 'tester_release': releases['tester']},
        'sessions': [],
        'reviewers': [{'role': role, 'reviewer_reference': None, 'session_ids': [],
                       'status': 'NOT TESTED', 'feedback': [], 'blocking_findings': []}
                      for role in ['owner', 'trusted-reviewer-1', 'trusted-reviewer-2', 'trusted-reviewer-3']],
        'checklist': [{'id': 'I' + str(i), 'status': 'NOT TESTED', 'session_ids': [],
                       'evidence_refs': [], 'findings': []} for i in range(1, 18)],
        'apps': [{'app_id': aid, 'online_content_media': 'NOT TESTED', 'offline_reopen_media': 'NOT TESTED',
                  'search_deep_links_back': 'NOT TESTED', 'evidence_refs': [], 'findings': []} for aid in app_ids],
        'additional_coverage': {key: 'NOT TESTED' for key in ['android_install', 'windows_install',
                                'assistive_technology', 'scale_100_to_200_apps', 'taxonomy_owner_decision']},
        'operational_gates': {key: {'status': 'PENDING', 'evidence_refs': []} for key in [
            'owner_release_authorization', 'pilot', 'current_build_device_offline', 'device_rollback', 'final_privacy_review']},
        'second_lifecycle_candidate': None, 'release_approved': False,
    }


def prepare(archive, artifact, run, expected_commit):
    digest = validate_metadata(artifact, run, expected_commit, archive)
    with tempfile.TemporaryDirectory(prefix='mba-acceptance-') as temporary:
        folder = Path(temporary)
        extract_archive(archive, folder)
        # The Node validators check each byte, environment boundary, manifest,
        # retained HTTP/offline evidence and exact source marker from this ZIP.
        javascript = """
import {verifyBuildArtifacts} from './scripts/verify-build-artifacts.mjs';
import {verifyReviewEvidence} from './scripts/verify-review-evidence.mjs';
const [folder,commit]=process.argv.slice(1);
const errors=['developer','tester'].flatMap(e=>verifyBuildArtifacts(folder+'/'+e,e));
errors.push(...verifyReviewEvidence(folder,commit));
if(errors.length){console.error(errors.join('\\n'));process.exitCode=1;}
"""
        subprocess.run(['node', '--input-type=module', '-e', javascript, str(folder), expected_commit],
                       cwd=ROOT, check=True, capture_output=True, text=True)
        releases = {e: json.loads((folder / e / 'release.json').read_text())['release']
                    for e in ['developer', 'tester']}
        registries = [json.loads((folder / e / 'registry.json').read_text()) for e in ['developer', 'tester']]
        app_ids = sorted(app['app_id'] for app in registries[1]['apps'])
        if app_ids != sorted(app['app_id'] for app in registries[0]['apps']):
            raise ValueError('Developer/tester app inventories differ')
        return fresh_record(artifact, run, digest, releases, app_ids)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--zip', type=Path, required=True)
    parser.add_argument('--artifact-metadata', type=Path, required=True)
    parser.add_argument('--run-metadata', type=Path, required=True)
    parser.add_argument('--expected-commit', required=True)
    args = parser.parse_args()
    try:
        result = prepare(args.zip, json.loads(args.artifact_metadata.read_text()),
                         json.loads(args.run_metadata.read_text()), args.expected_commit)
        print(json.dumps(result, indent=2))
    except (ValueError, OSError, KeyError, TypeError, zipfile.BadZipFile, subprocess.CalledProcessError) as error:
        parser.exit(1, f'Acceptance preparation failed: {error}\n')
