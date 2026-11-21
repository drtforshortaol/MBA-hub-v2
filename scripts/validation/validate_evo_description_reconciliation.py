#!/usr/bin/env python3
"""Read-only guards for EVO V2 description-to-classification reconciliation."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2] / "docs"
def read(file):
    return json.loads((ROOT / file).read_text(encoding="utf-8"))
def main():
    review = read("evo-v2-description-classification-reconciliation-draft3-20261015.json")
    source = read("evo-v2-original-narrative-24-source-extract-draft1-20261015.json")
    classes = read("evo-v2-relationship-classes-draft1-20261014.json")
    source_ids = {x["transitionId"]: x for x in source["records"]}
    class_ids = {x["transitionId"]: x for x in classes["transitions"]}
    issues = []
    records = review["records"]
    expected_disputes = {"TR-0114", "TR-0115", "TR-0127", "TR-0128", "TR-0129"}
    actual_disputes = {x["transitionId"] for x in records if x.get("assessment") == "manual-review-required"}
    if review.get("status") != "description-reconciliation-unapproved":
        issues.append("Review is not in unapproved state")
    if review.get("sourceBlobSha") != source.get("sourceBlobSha"):
        issues.append("Source provenance mismatch")
    if len(records) != 24 or len(set(x["transitionId"] for x in records)) != 24:
        issues.append("Must contain 24 unique records")
    if set(x["transitionId"] for x in records) != set(source_ids):
        issues.append("Coverage differs from source extraction")
    if actual_disputes != expected_disputes:
        issues.append("Dispute register changed without review")
    for x in records:
        tid=x["transitionId"]
        orig=source_ids.get(tid, {})
        cls=class_ids.get(tid, {})
        if x.get("sourceKey") != orig.get("sourceKey") or x.get("sourceLine") != orig.get("sourceLine"):
            issues.append(f"{tid}: source provenance differs")
        if x.get("provisionalClass") != cls.get("provisionalClass"):
            issues.append(f"{tid}: classification was silently changed")
        if x.get("scientificApproval") is not False or x.get("canonicalEndpointApproval") is not False or x.get("classificationChanged") is not False:
            issues.append(f"{tid}: premature approval or classification change")
        if x.get("assessment") not in ("consistent-at-description-level", "manual-review-required"):
            issues.append(f"{tid}: unknown assessment")
        if x.get("assessment") == "manual-review-required" and not x.get("suggestedAlternative"):
            issues.append(f"{tid}: missing review alternative")
    if issues:
        for issue in issues: print("FAIL:", issue)
        return 1
    print("PASS: 24 narratives reconciled; 5 disputes guarded; original classifications and approval gates unchanged")
    return 0
if __name__ == "__main__":
    raise SystemExit(main())
