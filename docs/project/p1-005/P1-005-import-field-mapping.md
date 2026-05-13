# P1-005 Import Field Mapping Plan

> **Status**: Planning phase only. No implementation, DB work, BLS import, Supabase, migration, or product code is authorized.

## Scope

This document maps **spec-level import concepts** (from the approved P1-005 spec) to **target schema concepts**. It explicitly avoids inventing concrete raw input columns unless they are explicitly present in the approved source set.

## Mapping Principles

- ✅ **Confirmed mappings**: Direct, spec-validated correspondences.
- ⚠️ **Unknown mappings**: Require later raw-source inspection or migration proof.
- ❌ **Excluded**: BLS import, DB schema changes, Supabase operations, migration scripts, production code.

---

## Confirmed Mappings

| Spec Concept | Target Schema Concept | Notes |
|--------------|------------------------|-------|
| `patient_id` | `patient.id` | UUID; must match existing patient registry |
| `encounter_id` | `encounter.id` | UUID; references existing encounter |
| `recorded_date` | `observation.recorded_at` | ISO 8601 datetime |
| `value_quantity` | `observation.value_quantity` | Object: `{ value: number, unit: string }` |
| `value_codeable_concept` | `observation.value_codeable_concept` | Object: `{ coding: Coding[], text?: string }` |
| `status` | `observation.status` | Enum: `final | amended | corrected` |
| `category` | `observation.category` | Enum: `vital-signs | laboratory | survey` |
| `code_system` | `observation.code.coding[].system` | FHIR code system URI |
| `code_code` | `observation.code.coding[].code` | FHIR code string |
| `code_display` | `observation.code.coding[].display` | Human-readable label |

---

## Unknown Mappings (Require Raw-Source Inspection)

| Spec Concept | Target Schema Concept | Action Required |
|--------------|------------------------|-----------------|
| `source_file_name` | `observation.meta.source_file` | Inspect raw file headers to confirm presence |
| `source_line_number` | `observation.meta.line_number` | Inspect raw file headers to confirm presence |
| `import_timestamp` | `observation.meta.imported_at` | Confirm ETL pipeline provides this |
| `validation_status` | `observation.meta.validation_status` | Define allowed enum values |
| `anonymization_level` | `observation.meta.anonymization_level` | Confirm policy-compliant values |

---

## Explicitly Not Authorized

- ❌ No BLS import logic
- ❌ No database schema changes
- ❌ No Supabase operations
- ❌ No migration scripts
- ❌ No production code changes
- ❌ No ENV or credential handling

---

## Next Steps

1. Raw-source inspection to confirm presence of `source_file_name`, `source_line_number`, and other unknown fields.
2. Migration proof for mapping unknown spec concepts to concrete columns.
3. Review and approval of this mapping plan before any implementation workorder.
