#!/usr/bin/env python3
"""Mutation regressions for the draft EVO Timeline-to-Map crosswalk."""
import copy
import json
import unittest
from pathlib import Path
from validate_evo_timeline_crosswalk import validate

DOCS = Path(__file__).resolve().parents[2] / "docs"
def read(filename):
    return json.loads((DOCS / filename).read_text(encoding="utf-8"))

class CrosswalkIntegrityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.crosswalk = read("evo-v2-timeline-concept-crosswalk-draft1-20261014.json")
        cls.triage = read("evo-v2-scientific-validation-triage-20261014.json")
        cls.registry = read("evo-v2-complete-migration-registry-draft-20261014.json")

    def check_mutation(self, edit):
        copy_data = copy.deepcopy(self.crosswalk)
        edit(copy_data)
        self.assertTrue(validate(copy_data, self.triage, self.registry))

    def test_baseline(self):
        self.assertEqual(validate(self.crosswalk, self.triage, self.registry), [])

    def test_duplicate_event_id(self):
        self.check_mutation(lambda d: d["events"][1].update(eventId=d["events"][0]["eventId"]))

    def test_invalid_event_id(self):
        self.check_mutation(lambda d: d["events"][0].update(eventId="WRONG"))

    def test_duplicate_ordinal(self):
        self.check_mutation(lambda d: d["events"][1].update(legacyOrdinal=1))

    def test_modified_title(self):
        self.check_mutation(lambda d: d["events"][0].update(legacyTitle="CHANGED"))

    def test_dangling_target(self):
        self.check_mutation(lambda d: d["events"][8]["references"][0].update(targetId="EV-MISSING"))

    def test_invalid_role(self):
        self.check_mutation(lambda d: d["events"][8]["references"][0].update(role="ancestor"))

    def test_invalid_provenance(self):
        self.check_mutation(lambda d: d["events"][8]["references"][0].update(source="unknown"))

    def test_premature_approval(self):
        self.check_mutation(lambda d: d["events"][8].update(approvalStatus="approved"))

    def test_endpoint_approval(self):
        self.check_mutation(lambda d: d["events"][8].update(canonicalEndpointApproval=True))

    def test_evidence_certification(self):
        self.check_mutation(lambda d: d["events"][8].update(evidenceStatus="verified"))

    def test_missing_recovered_reference(self):
        self.check_mutation(lambda d: d["events"][13].update(references=[]))

    def test_dropped_original_reference(self):
        self.check_mutation(lambda d: d["events"][8].update(references=[]))

    def test_duplicate_target_reference(self):
        self.check_mutation(lambda d: d["events"][8]["references"].append(copy.deepcopy(d["events"][8]["references"][0])))

if __name__ == "__main__":
    unittest.main()
