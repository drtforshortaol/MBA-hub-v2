import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
// Static security smoke test, independent of build system.
const policy = readFileSync(new URL('../docs/parallel-development/parallel-quality-release-20261018.md', import.meta.url),'utf8');
assert.match(policy,/No merges or deployments/i);
assert.match(policy,/security/i);
console.log('Track D policy smoke checks passed');
