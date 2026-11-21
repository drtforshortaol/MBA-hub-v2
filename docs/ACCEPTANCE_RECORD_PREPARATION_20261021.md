# Exact-artifact acceptance record preparation

`scripts/prepare-acceptance-record.py` creates a fresh record from an exact downloaded review ZIP and downloaded GitHub Actions artifact/run metadata. It prevents reuse of a historical template's candidate identity or completed human/device results. The tool writes JSON to stdout only, never changes approval flags, and does not deploy or authenticate the supplied metadata.

```bash
python3 scripts/prepare-acceptance-record.py \
  --zip /path/to/review.zip \
  --artifact-metadata /path/to/artifact.json \
  --run-metadata /path/to/run.json \
  --expected-commit EXACT_40_CHARACTER_SOURCE_SHA > /path/to/new-acceptance-record.json
```

Use the artifact object from the exact run's artifact API response, and the corresponding complete successful run object. The tool checks run/artifact/source identity, artifact name/expiry, actual ZIP size/digest, safe extraction, every generated runtime byte/registration/environment boundary, exact source marker and retained HTTP/offline evidence. Both app inventories must agree. Failed, stale, mismatched or malformed supplied evidence produces no record.

The resulting 33-app inventory (or the artifact's actual current count), 17 checks, four reviewer roles and five gates start NOT TESTED/PENDING, with no sessions or inherited feedback. Release approval remains false; lifecycle comparison candidate remains unassigned. Genuine reviewer/device outcomes must be recorded later. Retain actual metadata provenance separately; internally consistent user-supplied JSON is not independent proof that GitHub issued it.

A real smoke check against the previously downloaded `0938a50` artifact succeeded, producing its exact source, both release IDs and 33 pending app rows. Three Python regression tests cover metadata/digest/run mismatch, unsafe/duplicate ZIP entries and absence of automatic human/device approval. The existing Node validators provide complete runtime/evidence coverage. A later runtime candidate requires its own ZIP and metadata; a successful smoke check on the old artifact is not acceptance of a new one.
