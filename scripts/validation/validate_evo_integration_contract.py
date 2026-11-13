#!/usr/bin/env python3
import json
from pathlib import Path
root = Path(__file__).resolve().parents[2]
data = json.loads((root / 'src/shared/interfaces.json').read_text())
assert data['schema_version'] == 1
interfaces = data['interfaces']
ids = [item['id'] for item in interfaces]
assert len(ids) == len(set(ids))
evo = next(item for item in interfaces if item['id'] == 'evo-knowledge')
assert evo['owner'] == 'evolution-timeline'
assert evo['version'] == '1.0.0'
print('PASS: versioned EVO interface ownership')
