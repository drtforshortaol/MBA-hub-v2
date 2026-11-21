#!/usr/bin/env python3
"""Read-only cross-document guards for the EVO V2 ambiguity register."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOC = ROOT / "docs"

def read(name):
    return json.loads((DOC / name).read_text(encoding="utf-8"))

def validate():
    classes = read("evo-v2-relationship-classes-draft1-20261014.json")
    endpoints = read("evo-v2-transition-endpoint-manifest-draft1-20261014.json")
    audit = read("evo-v2-classification-ambiguity-audit-draft1-20261014.json")
    errors = []
    classification = classes["transitions"]
    source = endpoints["transitions"]
    records = audit["records"]
    for label, entries in (("classification", classification), ("endpoints", source), ("ambiguity", records)):
        ids = [x["transitionId"] for x in entries]
        if len(ids) != 37 or len(set(ids)) != 37:
            errors.append(f"{label}: expected 37 unique identifiers")
    c = {x["transitionId"]: x for x in classification}
    e = {x["transitionId"]: x for x in source}
    a = {x["transitionId"]: x for x in records}
    if set(c) != set(e) or set(c) != set(a):
        errors.append("Cross-document transition identifiers differ")
    if audit.get("status") != "evidence-audit-unapproved" or classes.get("status") != "provisional-unapproved":
        errors.append("Unsafe approval status")
    if not isinstance(audit.get("policy"), str) or not audit["policy"].strip():
        errors.append("Audit policy missing")
    for tid in sorted(set(c) & set(e) & set(a)):
        row, base, review = c[tid], e[tid], a[tid]
        for field in ("sourceKey", "provisionalClass"):
            if row[field] != review.get(field):
                errors.append(f"{tid}: {field} mismatch")
        if row["sourceKey"] != base["sourceKey"]:
            errors.append(f"{tid}: endpoint source key changed")
        default = row["originOfRuntimeType"] == "runtime-default"
        if review.get("runtimeFallback") is not default:
            errors.append(f"{tid}: runtime provenance mismatch")
        if review.get("priority") not in ("high", "elevated", "standard"):
            errors.append(f"{tid}: invalid priority")
        if default and review.get("priority") == "standard":
            errors.append(f"{tid}: default relationship not escalated")
        if review.get("evidenceStatus") != "unverified":
            errors.append(f"{tid}: premature evidence certification")
        if review.get("scientificApproval") is not False or review.get("canonicalEndpointApproval") is not False:
            errors.append(f"{tid}: premature scientific or endpoint approval")
        if not isinstance(review.get("ambiguity"), str) or len(review["ambiguity"].strip()) < 15:
            errors.append(f"{tid}: ambiguity description absent")
        if not isinstance(review.get("sourceReference"), str) or not (DOC / Path(review["sourceReference"]).name).exists():
            errors.append(f"{tid}: source reference missing")
        if base["sourceConceptIds"] is not None or base["targetConceptIds"] is not None:
            errors.append(f"{tid}: canonical endpoints not null")
    if sum(x["runtimeFallback"] for x in records) != 13:
        errors.append("Expected exactly 13 runtime fallback entries")
    if sum(x["priority"] == "high" for x in records) != 13:
        errors.append("Expected exactly 13 high priority evidence entries")
    if errors:
        for item in errors:
            print("FAIL:", item)
        return 1
    print("PASS: 37 ambiguity reviews; 13 high-priority; 13 fallback; unapproved scientific and endpoint states")
    print("Structural cross-check only; no scientific accuracy approval")
    return 0

if __name__ == "__main__":
    raise SystemExit(validate())
