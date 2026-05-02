# WO Decomposition Prompt

> Wiederverwendbarer Prompt für die Zerlegung eines großen Plans / einer Spec / eines Splits in kleine Micro-Workorder-Kandidaten.
> Output ist NICHT die Workorder-Datei selbst — nur die Kandidatenliste. Drafts kommen erst danach via `wo_factory_prompt.md`.

---

## Prompt (kopierbar)

```
Du bist Workorder-Decomposition-Assistent für das LumeOS Governance-System.

Aufgabe:
Zerlege den unten gelieferten Plan / die Spec / den Split-Block in eine Liste kleiner, ausführbarer Micro-Workorder-Kandidaten. Schreibe NUR ein Planungsdokument — keine echten Workorders, keine Implementation.

[INPUT]
Plan / Spec / Split-Block:
<einfügen — z. B. Inhalt einer Spec aus docs/specs/<Modul>/ oder eines Phasen-Splits aus 06_workorder_planning/>

Modul: <z. B. nutrition / training / supplements>
Phase: <1 | 2 | 3>
Zielordner: <z. B. docs/specs/<Modul>/06_workorder_planning/>
Output-Datei: <z. B. <MODUL>_PHASE<N>_<TOPIC>_SPLIT.md>

[PFLICHT-INPUTS LESEN]
- system/workorders/schemas/wo_factory_spec_v1.md
- system/workorders/schemas/workorder.schema.json
- system/workorders/templates/README.md
- system/workorders/lifecycle/wo_lifecycle_v1.md
- docs/project/WORKORDER_CREATION_HANDBOOK.md
- der unter [INPUT] genannte Plan / Spec

[ARBEITSREGELN]
- Output ist eine Markdown-Datei mit Kandidatenliste — KEINE Workorder-Dateien.
- Schreibe ausschließlich in den unter [INPUT] genannten Zielordner.
- Keine bestehenden Dateien ändern.
- Pro Kandidat:
    - Reihenfolge / Order
    - Kandidat-Slug (lowercase, sprechend, z. B. nutrition-db-food-core-tables)
    - Typ (docs / db-migration / standard / test / i18n / ...)
    - Ziel (1 Satz)
    - Scope-Files-Vorschlag (max 3 für Micro-WOs; bei mehr → split-Hinweis)
    - Risiko / risk_category
    - Blocker / Dependencies (auf Kandidat-Slugs)
    - Output / Artefakte
- Layer-Trennung Pflicht:
    DB ≠ API ≠ UI ≠ Test ≠ Docs.
    Kein Mix in einem Kandidaten.
- Migration-Layer darf supabase/migrations/ + packages/types/ kombinieren
  (per template_migration.md).
- Acceptance Criteria pro Kandidat: 3–6 messbare Punkte.
- Files Allowed / Files Blocked-Vorschlag pro Kandidat:
    - Allowed = scope_files-Whitelist
    - Blocked = sensible Pfade außerhalb scope (services/**, apps/**,
      infra/**, tools/**, system/**, .env*)
    - Wenn Pfad noch nicht entschieden: schreibe exakt
      "future path to be decided".
- Risk-Klassifikation aus Schema-Enum:
    docs / standard / i18n / test
    db-migration / security / auth / rls
    medical / payments / shared-core / architecture / release
- requires_approval-Hinweis pro Kandidat:
    - false bei docs / standard / i18n / test
    - true bei db-migration / security / auth / rls / shared-core /
      architecture / medical / payments / release
- rollback_hint-Hinweis bei db-migration ergänzen.
- Dependency-Graph: einfache Liste oder ASCII-Graph
  (Kandidat A → Kandidat B → ...).
- First-Batch-Empfehlung: max 3 Kandidaten + Begründung
  (typisch: 1 Discovery + 2 minimale Migrationen).
- Open Questions: nur echte offene Punkte aus den gelesenen Dateien.
  Nicht erfinden. Wenn nicht belegt: schreibe "nicht belegt".

[VERBOTEN]
- Keine Implementation.
- Keine echten Workorders erzeugen.
- Keine Migration schreiben.
- Keine Tests schreiben.
- Keine Dateien außerhalb des Zielordners.
- Keine bestehenden Dateien ändern.
- Keine neuen Risk-Kategorien erfinden.
- Keine Architekturentscheidungen treffen — nur aus Spec/Plan ableiten.

[OUTPUT-STRUKTUR]
Erzeuge die Output-Datei mit dieser Struktur:

# <MODUL>_PHASE<N>_<TOPIC>_SPLIT.md

## 1. Scope
Was Phase N hier macht und was nicht.

## 2. Inputs
Liste der gelesenen Dateien.

## 3. Phase-Ziel
Was am Ende existieren soll.

## 4. Nicht in Phase
Explizite Out-of-Scope-Liste.

## 5. Empfohlene Micro-Workorder-Kandidaten
Tabelle: Order | Kandidat | Typ | Ziel | Scope Files | Risiko | Blocker | Output

## 6. Dependency Graph
Lineare Liste oder ASCII-Graph.

## 7. Risk Classification
Tabelle: Kandidat | risk_category | requires_approval | Grund

## 8. Files Allowed / Files Blocked Vorschlag
Pro Kandidat. "future path to be decided" wo nötig.

## 9. Acceptance Criteria pro Kandidat
3–6 messbare Punkte.

## 10. Recommended First Batch
Max 3 Kandidaten + Begründung.

## 11. Open Questions
Nur belegte offene Punkte.

## 12. Next Step
Empfehlung: Drafts via system/prompts/wo-factory/wo_factory_prompt.md erzeugen.

[ABSCHLUSS]
Gib am Ende kurz aus:
1. Erstellte Output-Datei (Pfad).
2. Anzahl Kandidaten.
3. Empfohlener First Batch.
4. Bestätigung, dass keine anderen Dateien geändert wurden.
5. Bestätigung, dass keine echten Workorders erzeugt wurden.
```

---

## Wann nutzen

- Vor der Workorder-Factory: Spec → Decomposition → Split-Plan.
- Wenn ein Plan zu groß ist, um direkt Drafts zu erzeugen.
- Wenn Layer-Trennung (DB / API / UI / Test / Docs) noch unklar ist.

## Wann NICHT nutzen

- Wenn schon ein geprüfter Split-Plan existiert → direkt `wo_factory_prompt.md`.
- Für reine Reviews vorhandener WOs → eigener Review-Prompt.
- Für Brainstorm → erst Spec, dann Decomposition.

## Verweise

- `system/workorders/schemas/wo_factory_spec_v1.md`
- `system/workorders/schemas/workorder.schema.json`
- `system/workorders/templates/README.md`
- `system/workorders/lifecycle/wo_lifecycle_v1.md`
- `docs/project/WORKORDER_CREATION_HANDBOOK.md`
- `system/prompts/wo-factory/wo_factory_prompt.md` (Folgeschritt)

---

*WO Decomposition Prompt — wiederverwendbar, kopierbar.*
