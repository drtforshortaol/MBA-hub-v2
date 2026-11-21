#!/usr/bin/env python3
"""Read-only integrity checks for EVO V2 provisional transition endpoint manifest."""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
REGISTRY = ROOT / "docs/evo-v2-complete-migration-registry-draft-20261014.json"
MANIFEST = ROOT / "docs/evo-v2-transition-endpoint-manifest-draft1-20261014.json"
ALLOWED = {"branching", "merger", "planetary-effect", "continuation", "innovation", "integration", "secondary-endosymbiosis"}
def main():
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    expected = {(x["id"], x["key"]) for x in registry["transitions"]}
    concepts = {x["id"] for x in registry["concepts"]}
    entries = manifest["transitions"]
    observed = [(x["transitionId"], x["sourceKey"]) for x in entries]
    problems = []
    if len(entries) != 37: problems.append("Expected 37 transition entries")
    if len(set(observed)) != len(observed): problems.append("Duplicate transition identifier-key pairs")
    if len({x[0] for x in observed}) != len(observed): problems.append("Duplicate transition ID")
    if len({x[1] for x in observed}) != len(observed): problems.append("Duplicate source key")
    if set(observed) != expected: problems.append("Manifest identifiers do not match source registry")
    unknown = 0
    for entry in entries:
        key = entry["sourceKey"]
        if entry["relationshipType"] not in ALLOWED:
            problems.append(f"{key}: invalid relationship type")
        for field in ("sourceConceptIds", "targetConceptIds"):
            refs = entry[field]
            if refs is None:
                unknown += 1
            elif isinstance(refs, list) and all(isinstance(ref, str) and ref in concepts for ref in refs):
                if len(refs) != len(set(refs)): problems.append(f"{key}: duplicated {field}")
            else:
                problems.append(f"{key}: invalid/missing concept reference in {field}")
        if entry.get("evidenceStatus") != "endpoint-unverified":
            problems.append(f"{key}: unsupported endpoint approval")
    print(f"Transitions: {len(entries)}; unique IDs: {len(set(x[0] for x in observed))}; registry matches: {len(set(observed) & expected)}; unresolved endpoint fields: {unknown}")
    if problems:
        for problem in problems: print("FAIL:", problem)
        return 1
    print("PASS: structural consistency; scientific endpoint approval NOT inferred")
    return 0

if __name__ == "__main__":
    sys.exit(main())
