#!/usr/bin/env python3
"""Mutation regression tests for provisional EVO classifications; never writes source data."""
import copy
import io
import json
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch

from scripts.validation import validate_evo_relationship_classes as validator

FILES = (
    "evo-v2-complete-migration-registry-draft-20261014.json",
    "evo-v2-transition-endpoint-manifest-draft1-20261014.json",
    "evo-v2-relationship-classes-draft1-20261014.json",
)


class ClassificationValidationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = {
            name: json.loads((validator.ROOT / "docs" / name).read_text(encoding="utf-8"))
            for name in FILES
        }

    def check_case(self, mutate, expected):
        documents = copy.deepcopy(self.source)
        mutate(documents)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "docs").mkdir()
            for name, payload in documents.items():
                (root / "docs" / name).write_text(json.dumps(payload), encoding="utf-8")
            with patch.object(validator, "ROOT", root), redirect_stdout(io.StringIO()) as output:
                result = validator.main()
            self.assertEqual(result, expected, output.getvalue())

    def test_untouched_inputs_pass(self):
        self.check_case(lambda _: None, 0)

    def test_reject_premature_approval(self):
        self.check_case(lambda d: d[FILES[2]]["transitions"][0].update(
            canonicalEndpointApproval=True), 1)

    def test_reject_unknown_class(self):
        self.check_case(lambda d: d[FILES[2]]["transitions"][0].update(
            provisionalClass="certified-direct-ancestor"), 1)

    def test_reject_duplicate_class_label(self):
        self.check_case(lambda d: d[FILES[2]]["allowedClasses"].__setitem__(
            0, d[FILES[2]]["allowedClasses"][1]), 1)

    def test_reject_duplicate_registry_identifier(self):
        self.check_case(lambda d: d[FILES[0]]["transitions"][1].update(
            id=d[FILES[0]]["transitions"][0]["id"]), 1)

    def test_reject_false_runtime_provenance(self):
        self.check_case(lambda d: d[FILES[2]]["transitions"][0].update(
            originOfRuntimeType="runtime-default"), 1)

    def test_reject_selected_view_as_biological_branch(self):
        def mutate(d):
            next(row for row in d[FILES[2]]["transitions"]
                 if row["transitionId"] == "TR-0108")["provisionalClass"] = "evolutionary-branching"
        self.check_case(mutate, 1)

    def test_reject_disputed_transition_silent_reclassification(self):
        def mutate(d):
            next(row for row in d[FILES[2]]["transitions"]
                 if row["transitionId"] == "TR-0114")["provisionalClass"] = "summary-aggregation"
        self.check_case(mutate, 1)

    def test_reject_modified_endpoints(self):
        self.check_case(lambda d: d[FILES[1]]["transitions"][0].update(
            sourceConceptIds=["EV-0100"]), 1)

    def test_reject_manifest_key_divergence(self):
        self.check_case(lambda d: d[FILES[1]]["transitions"][0].update(
            sourceKey="different-key"), 1)

    def test_reject_endpoint_evidence_approval(self):
        self.check_case(lambda d: d[FILES[1]]["transitions"][0].update(
            evidenceStatus="approved"), 1)


if __name__ == "__main__":
    unittest.main()
