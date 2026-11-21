#!/usr/bin/env python3
"""Read-only integrity check for 24 original Master Map narrative extractions."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
def read(name):
    return json.loads((ROOT / "docs" / name).read_text(encoding="utf-8"))
def main():
    src = read("evo-v2-original-narrative-24-source-extract-draft1-20261015.json")
    reg = read("evo-v2-complete-migration-registry-draft-20261014.json")
    ids = {row["id"]: row["key"] for row in reg["transitions"]}
    rows = src["records"]
    problems = []
    if len(rows) != 24 or len({x["transitionId"] for x in rows}) != 24:
        problems.append("Expected 24 unique narrative records")
    if src.get("status") != "original-description-extracted-scientific-review-pending":
        problems.append("Narrative status must remain pending")
    if len(src.get("sourceBlobSha", "")) != 40:
        problems.append("Original source blob hash missing")
    for row in rows:
        tid = row["transitionId"]
        if ids.get(tid) != row["sourceKey"]:
            problems.append(f"{tid}: source key mismatch")
        if not row.get("sourceTitle") or not row.get("sourceBody") or not isinstance(row.get("sourceLine"), int):
            problems.append(f"{tid}: description provenance incomplete")
        if row.get("sourceVerified") is not True:
            problems.append(f"{tid}: original-source match unverified")
        if any(row.get(k) is not False for k in ("independentScientificVerification", "scientificApproval", "canonicalEndpointApproval")):
            problems.append(f"{tid}: premature scientific approval")
    if problems:
        for p in problems: print("FAIL:", p)
        return 1
    print("PASS: 24 unique original descriptions, source provenance and unapproved science guards")
    return 0
if __name__ == "__main__":
    raise SystemExit(main())
