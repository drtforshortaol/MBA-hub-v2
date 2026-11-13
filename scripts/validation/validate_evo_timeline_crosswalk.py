#!/usr/bin/env python3
"""Read-only integrity check for the provisional Timeline-to-Map crosswalk."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / "docs"
def load(name):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))
def validate(crosswalk, triage, registry):
    errors = []
    events = crosswalk.get("events", [])
    legacy = triage.get("events", [])
    concepts = {x["id"] for x in registry.get("concepts", [])}
    transitions = {x["id"] for x in registry.get("transitions", [])}
    valid_targets = concepts | transitions
    valid_roles = set(crosswalk.get("relationRoles", []))
    if crosswalk.get("status") != "provisional-unapproved": errors.append("status must remain provisional-unapproved")
    if len(events) != 35 or len(legacy) != 35: errors.append("35 events required")
    if len({x.get("eventId") for x in events}) != len(events): errors.append("duplicate event IDs")
    if len({x.get("legacyOrdinal") for x in events}) != len(events): errors.append("duplicate ordinals")
    by_number = {x["event"]: x for x in legacy}
    for row in events:
        n = row.get("legacyOrdinal")
        expected = by_number.get(n)
        if not isinstance(n, int) or row.get("eventId") != f"TL-{n:04d}":
            errors.append(f"event {n}: wrong provisional ID")
        if not expected or row.get("legacyTitle") != expected.get("title"):
            errors.append(f"event {n}: source title mismatch")
        refs = row.get("references", [])
        ids = [x.get("targetId") for x in refs]
        if len(ids) != len(set(ids)): errors.append(f"event {n}: duplicate target")
        if (row.get("linkStatus") == "unmatched") != (len(refs) == 0):
            errors.append(f"event {n}: status/reference mismatch")
        if row.get("linkStatus") not in ("unmatched", "candidate-unverified"):
            errors.append(f"event {n}: invalid link status")
        if row.get("approvalStatus") != "unapproved" or row.get("canonicalEndpointApproval") is not False:
            errors.append(f"event {n}: premature approval")
        if row.get("evidenceStatus") != "scientific-evidence-pending":
            errors.append(f"event {n}: unsupported scientific certification")
        for ref in refs:
            t = ref.get("targetId")
            if t not in valid_targets: errors.append(f"event {n}: dangling target {t}")
            if ref.get("role") not in valid_roles: errors.append(f"event {n}: invalid role")
            if ref.get("source") not in ("original-triage", "registry-reconciliation"):
                errors.append(f"event {n}: invalid provenance")
            if ref.get("source") == "original-triage" and t != (expected or {}).get("candidateId"):
                errors.append(f"event {n}: triage candidate drift")
        if expected and expected.get("candidateId") and expected["candidateId"] not in ids:
            errors.append(f"event {n}: dropped source candidate")
    by_number = {r["legacyOrdinal"]: r for r in events}
    for n, required in {14:"EV-0103",27:"EV-0117",29:"EV-0136",30:"EV-0137",32:"EV-0138",35:"EV-0147"}.items():
        if required not in [x["targetId"] for x in by_number.get(n,{}).get("references",[])]:
            errors.append(f"event {n}: missing recovered candidate")
    if any(x["targetId"] != "EV-0114" for n in (18,19) for x in by_number.get(n,{}).get("references",[])):
        errors.append("animal milestone crosswalk drift")
    return errors

def main():
    errs = validate(load("evo-v2-timeline-concept-crosswalk-draft1-20261014.json"),load("evo-v2-scientific-validation-triage-20261014.json"),load("evo-v2-complete-migration-registry-draft-20261014.json"))
    for err in errs: print("FAIL:",err)
    if errs: return 1
    print("PASS: 35 distinct timeline records, targets, provenance, and unapproved scientific boundaries")
    return 0
if __name__ == "__main__":
    raise SystemExit(main())
