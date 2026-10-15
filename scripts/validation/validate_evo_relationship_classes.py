#!/usr/bin/env python3
"""Read-only structural validation of the provisional EVO relationship classifications."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
def load(name):
    return json.loads((ROOT / "docs" / name).read_text(encoding="utf-8"))

def main():
    registry = load("evo-v2-complete-migration-registry-draft-20261014.json")
    manifest = load("evo-v2-transition-endpoint-manifest-draft1-20261014.json")
    classified = load("evo-v2-relationship-classes-draft1-20261014.json")
    expected = {r["id"]: r["key"] for r in registry["transitions"]}
    base = {r["transitionId"]: r for r in manifest["transitions"]}
    classes = set(classified["allowedClasses"])
    rows = classified["transitions"]
    errors = []
    if len(expected) != 37 or len(base) != 37 or len(rows) != 37:
        errors.append("Expected exactly 37 transitions in all files")
    if len(registry["transitions"]) != len(expected) or len(manifest["transitions"]) != len(base):
        errors.append("Duplicate transition IDs in registry or endpoint manifest")
    if len(classified["allowedClasses"]) != 12 or len(classes) != 12:
        errors.append("Expected 12 unique provisional relationship classes")
    if classified.get("status") != "provisional-unapproved":
        errors.append("Classification status must remain provisional-unapproved")
    if len({r["transitionId"] for r in rows}) != len(rows):
        errors.append("Duplicate classification transition IDs")
    for r in rows:
        tid = r["transitionId"]
        if expected.get(tid) != r["sourceKey"]:
            errors.append(f"{tid}: registry key mismatch")
        if tid not in base or base[tid]["relationshipType"] != r["legacyRuntimeType"] or base[tid]["sourceKey"] != r["sourceKey"]:
            errors.append(f"{tid}: legacy type mismatch")
        origin = r.get("originOfRuntimeType")
        if origin not in ("runtime-default", "explicit-runtime-annotation"):
            errors.append(f"{tid}: invalid runtime origin")
        if tid in base:
            is_default = "Runtime falls back" in base[tid]["reviewNotes"]
            if (origin == "runtime-default") != is_default:
                errors.append(f"{tid}: runtime origin disagrees with manifest provenance")
            if is_default and r["legacyRuntimeType"] != "continuation":
                errors.append(f"{tid}: fallback type must be continuation")
        if r["provisionalClass"] not in classes:
            errors.append(f"{tid}: unrecognized provisional class")
        if r["confidence"] != "unverified" or r["canonicalEndpointApproval"] is not False:
            errors.append(f"{tid}: unsafe premature approval")
    if set(base) != {r["transitionId"] for r in rows}:
        errors.append("Classification does not cover exactly the base manifest IDs")
    if any(r["sourceConceptIds"] is not None or r["targetConceptIds"] is not None for r in base.values()):
        errors.append("Base manifest contains non-null endpoints")
    if len([r for r in rows if r["originOfRuntimeType"] == "runtime-default"]) != 13:
        errors.append("Expected 13 runtime-default cases")
    if set(expected) != set(base):
        errors.append("Registry and endpoint manifest transition IDs differ")
    if any(r.get("evidenceStatus") != "endpoint-unverified" for r in base.values()):
        errors.append("Endpoint evidence status was prematurely changed")
    if errors:
        for err in errors: print("FAIL:", err)
        return 1
    print("PASS: 37/37 references, 13 default cases, approval safety, and base-endpoint invariants")
    print("Scientific accuracy and CI execution are NOT certified by this structural check")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
