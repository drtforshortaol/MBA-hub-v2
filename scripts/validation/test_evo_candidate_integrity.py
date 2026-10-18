#!/usr/bin/env python3
"""Mutation regression cases for the read-only EVO candidate identity gate."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from scripts.validation import validate_evo_candidate_integrity as gate

CANDIDATE = "evo-v2-permanent-id-registry-candidate-20261014.json"
MIGRATION = "evo-v2-complete-migration-registry-draft-20261014.json"
CLASSES = "evo-v2-relationship-classes-draft1-20261014.json"
ENDPOINTS = "evo-v2-transition-endpoint-manifest-draft1-20261014.json"
FILES = (CANDIDATE, MIGRATION, CLASSES, ENDPOINTS)


class MigrationBoundaryRegressionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.original = {
            name: json.loads((gate.DOCS / name).read_text(encoding="utf-8"))
            for name in FILES
        }

    def check_mutation(self, mutate, expected_errors):
        docs = copy.deepcopy(self.original)
        mutate(docs)
        with tempfile.TemporaryDirectory() as directory:
            p = Path(directory)
            for name, contents in docs.items():
                (p / name).write_text(json.dumps(contents), encoding="utf-8")
            with patch.object(gate, "DOCS", p):
                errors = gate.audit()
        if expected_errors:
            self.assertTrue(errors, "Mutation should fail")
        else:
            self.assertEqual(errors, [])

    def test_baseline(self):
        self.check_mutation(lambda d: None, False)

    def test_candidate_identifier_changed(self):
        self.check_mutation(lambda d: d[CANDIDATE]["concepts"][0].update(id="EV-9999"), True)

    def test_candidate_alias_cannot_change_canonical_identity(self):
        self.check_mutation(lambda d: d[CANDIDATE]["transitions"][0].update(canonicalId="TR-9999"), True)

    def test_duplicate_candidate_identifier(self):
        self.check_mutation(lambda d: d[CANDIDATE]["concepts"][1].update(
            id=d[CANDIDATE]["concepts"][0]["id"]), True)

    def test_migration_key_change(self):
        self.check_mutation(lambda d: d[MIGRATION]["transitions"][0].update(
            key="different-relationship"), True)

    def test_silent_candidate_approval(self):
        self.check_mutation(lambda d: d[CANDIDATE].update(status="approved"), True)

    def test_scientific_review_gate_removed(self):
        self.check_mutation(lambda d: d[CANDIDATE]["policy"].update(
            scientificReview="not-required"), True)

    def test_classification_prematurely_approved(self):
        self.check_mutation(lambda d: d[CLASSES]["transitions"][0].update(
            canonicalEndpointApproval=True), True)

    def test_endpoint_populated(self):
        self.check_mutation(lambda d: d[ENDPOINTS]["transitions"][0].update(
            targetConceptIds=["EV-0101"]), True)

    def test_endpoint_approval_status_changed(self):
        self.check_mutation(lambda d: d[ENDPOINTS]["transitions"][0].update(
            evidenceStatus="approved"), True)


if __name__ == "__main__":
    unittest.main()
