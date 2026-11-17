# PASS — Minimal release validation policy (owner decision, 2026-11-15)

## Decision
Retain four engineering checks: (1) application functionality, (2) existing-app and content preservation, (3) security/privacy, and (4) offline behavior where offline support is promised. Remove redundant whole-repository privacy reapproval for ordinary content, text, images, and navigation updates. Consolidate duplicate CI checks where their evidence is equivalent.

The owner has also directed that **publication authorization not be a fifth engineering validation checkpoint**. This means no repetitive owner-signoff workflow for ordinary releases. It does **not** grant copyright licenses, authorize publication of Aquarium-owned illustrations, waive confidentiality, or override any third-party distribution restriction. Rights issues must remain explicitly visible and unresolved assets must not be silently treated as licensed.

## Implementation boundaries
- Replace historic `--write-reviewed-binding` CI rebinding with a read-only risk-based comparison. Ordinary content changes should not fail a security check merely because their bytes changed.
- Block on actionable security risks (credentials, sensitive personal information, unexpected outbound requests, new privileged browser APIs, unsafe links, or removed protected files), not on a catalog-wide content hash mismatch.
- Preserve all 35 existing approval bindings and the existing 36-app Blue baseline. Do not rehash approvals as a shortcut.
- Keep source/asset preservation and offline smoke tests.
- No production deployment or rights-sensitive asset distribution is authorized by this policy document.
- Implement changes on a worker branch, add regression tests, then integrate through the quarterback. Remove old CI gates only after replacement tests pass.

## PASS principle
Validation protects usability and users; it must not become a second product. Use the smallest evidence-backed test set that preserves functionality, content, security, and promised offline behavior.
