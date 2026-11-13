import test from 'node:test';
import assert from 'node:assert/strict';
import {assessMediaRegistration} from '../scripts/verify-media-registration.mjs';

const evidence = issues => ({schema_version: 1, writePerformed: false, errors: [],
  resources: [{app_id: 'fish', path: 'shared/media/fish.jpg', issues}]});

test('permission-only findings stay incomplete without hiding pending review', () => {
  const input = evidence(['permission-evidence-missing']);
  const before = JSON.stringify(input), result = assessMediaRegistration(input);
  assert.equal(result.registrationValid, true);
  assert.equal(result.permissionReviewComplete, false);
  assert.equal(result.complete, false);
  assert.equal(result.pendingPermissions.length, 1);
  assert.equal(result.audit, input);
  assert.equal(JSON.stringify(input), before);
});

test('every technical media finding and path error fails registration', () => {
  for (const issue of ['missing-local-file', 'not-in-media-catalog', 'not-in-app-media', 'not-in-app-offline-assets', 'future-unknown-issue']) {
    const result = assessMediaRegistration(evidence([issue, 'permission-evidence-missing']));
    assert.equal(result.registrationValid, false, issue);
    assert.equal(result.complete, false);
    assert.equal(result.technicalFindings[0].issue, issue);
  }
  const input = evidence([]); input.errors.push({reason: 'unsafe local path'});
  assert.equal(assessMediaRegistration(input).registrationValid, false);
});

test('malformed and sparse media evidence fails closed', () => {
  for (const input of [null, {}, {...evidence([]), writePerformed: true}, {...evidence([]), resources: [null]}, {...evidence([]), resources: Array(1)}, evidence([null]), evidence(Array(1))]) {
    assert.throws(() => assessMediaRegistration(input), /Invalid media/);
  }
  assert.equal(assessMediaRegistration(evidence([])).complete, true);
});
