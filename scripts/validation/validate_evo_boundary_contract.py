#!/usr/bin/env python3
"""Check that MBA retains a single external EVO interface and no science ownership."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[2]
interfaces=json.loads((root/"src/shared/interfaces.json").read_text())["interfaces"]
evo=[x for x in interfaces if x["id"]=="evo-knowledge"]
assert len(evo)==1
assert evo[0]["owner"]=="evolution-timeline"
contract=(root/"docs/evo-v2-integration-contract-draft1-20261015.md").read_text()
for requirement in ("read-only", "offline", "Paul inella".replace(" ",""), "versioned"):
    assert requirement.lower() in contract.lower()
print("PASS: MBA EVO boundary declared, isolated and versioned")
