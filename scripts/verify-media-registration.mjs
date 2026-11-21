import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditRepositoryMedia} from './audit-local-media-coverage.mjs';

// Registration readiness and permission review are separate decisions. A
// permission-only result never means the media is cleared for publication.
export function assessMediaRegistration(audit) {
  if (!audit || audit.schema_version !== 1 || audit.writePerformed !== false ||
      !Array.isArray(audit.resources) || !Array.isArray(audit.errors)) {
    throw Error('Invalid media audit evidence');
  }
  const technicalFindings = [], pendingPermissions = [];
  for (let index = 0; index < audit.resources.length; index++) {
    const row = audit.resources[index];
    if (!row || typeof row.app_id !== 'string' || !row.app_id ||
        typeof row.path !== 'string' || !row.path || !Array.isArray(row.issues) ||
        row.issues.some(issue => typeof issue !== 'string' || !issue) ||
        Object.keys(row.issues).length !== row.issues.length) {
      throw Error('Invalid media resource evidence');
    }
    for (const issue of row.issues) {
      const finding = {app_id: row.app_id, path: row.path, issue};
      if (issue === 'permission-evidence-missing') pendingPermissions.push(finding);
      else technicalFindings.push(finding);
    }
  }
  return {
    schema_version: 1,
    scope: 'Registration/offline verification only; permission review and release remain separate',
    writePerformed: false,
    registrationValid: audit.errors.length === 0 && technicalFindings.length === 0,
    permissionReviewComplete: pendingPermissions.length === 0,
    complete: audit.errors.length === 0 && technicalFindings.length === 0 && pendingPermissions.length === 0,
    technicalFindings, pendingPermissions, errors: audit.errors,
    audit
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--report')) throw Error('Usage: verify-media-registration.mjs [--report path]');
  const report = assessMediaRegistration(auditRepositoryMedia());
  const serialized = JSON.stringify(report, null, 2) + '\n';
  if (args.length) fs.writeFileSync(path.resolve(args[1]), serialized);
  console.log(JSON.stringify({registrationValid: report.registrationValid,
    permissionReviewComplete: report.permissionReviewComplete, complete: report.complete,
    technicalFindings: report.technicalFindings.length, pendingPermissions: report.pendingPermissions.length,
    errors: report.errors.length, report: args[1] || null}, null, 2));
  if (!report.registrationValid) process.exitCode = 1;
}
