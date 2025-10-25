# Shared Assets

This directory will store shared dictionaries, schemas, and utilities consumed by the API and parser services. Initial assets will include:

- `test_dictionary.json` – canonical display names mapped to synonyms.
- `loinc_map.json` – canonical names mapped to LOINC codes.
- `insights.json` – educational content for supported analytes.
- Pydantic models / TypedDicts used across services.

See `docs/design.md` for seed content expectations and data governance considerations.
