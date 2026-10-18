#!/usr/bin/env python3
"""Read-only EVO candidate identity and scientific promotion gate.

This validates identifier identity and boundaries, not scientific conclusions.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / "docs"

def read(name):
    return json.loads((DOCS / name).read_text(encoding="utf-8"))

def audit():
    candidate = read("evo-v2-permanent-id-registry-candidate-20261014.json")
    migration = read("evo-v2-complete-migration-registry-draft-20261014.json")
    classes = read("evo-v2-relationship-classes-draft1-20261014.json")
    endpoints = read("evo-v2-transition-endpoint-manifest-draft1-20261014.json")
    errors = []
    for kind, expected_size in (("concepts",49),("transitions",37)):
        source = migration[kind]
        proposed = candidate[kind]
        if len(source) != expected_size or len(proposed) != expected_size:
            errors.append(f"{kind}: unexpected record count")
        expected = {row["id"]: row["key"] for row in source}
        if len(expected) != len(source) or len({r["key"] for r in source}) != len(source):
            errors.append(f"{kind}: duplicate migration ID or key")
        ids = [r["id"] for r in proposed]
        if len(set(ids)) != len(ids):
            errors.append(f"{kind}: duplicate candidate ID")
        for row in proposed:
            if expected.get(row["id"]) != row["key"]:
                errors.append(f"{kind}: candidate identity mismatch at {row['id']}")
            if row.get("canonicalId") != row["id"]:
                errors.append(f"{kind}: candidate canonicalId mismatch at {row['id']}")
        if set(ids) != set(expected):
            errors.append(f"{kind}: missing/extra candidate IDs")
    if candidate.get("status") != "frozen-candidate-pending-scientific-approval":
        errors.append("Candidate registry unexpectedly promoted")
    if candidate.get("policy", {}).get("scientificReview") != "required before canonical promotion":
        errors.append("Scientific-review gate missing")
    if classes.get("status") != "provisional-unapproved":
        errors.append("Provisional classification status changed")
    clsids = {r["transitionId"] for r in classes["transitions"]}
    epids = {r["transitionId"] for r in endpoints["transitions"]}
    if len(clsids) != 37 or len(epids) != 37 or clsids != epids:
        errors.append("Candidate/endpoint transition coverage differs")
    for r in classes["transitions"]:
        if r.get("canonicalEndpointApproval") is not False or r.get("confidence") != "unverified":
            errors.append(f"{r['transitionId']}: premature classification approval")
    for r in endpoints["transitions"]:
        if r.get("sourceConceptIds") is not None or r.get("targetConceptIds") is not None:
            errors.append(f"{r['transitionId']}: canonical endpoints must remain unknown")
        if r.get("evidenceStatus") != "endpoint-unverified":
            errors.append(f"{r['transitionId']}: endpoint evidence prematurely promoted")
    return errors

if __name__ == "__main__":
    problems = audit()
    for problem in problems:
        print("FAIL:", problem)
    if problems:
        raise SystemExit(1)
    print("PASS: 49 concept and 37 transition IDs; candidate and scientific boundaries intact")
