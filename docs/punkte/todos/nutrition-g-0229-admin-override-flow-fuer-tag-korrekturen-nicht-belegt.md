---
nr: G-229
typ: entscheidung
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien: [docs/specs/Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md]
zahlen: null
---

# G-229 — Admin-Override-Flow für Tag-Korrekturen nicht belegt

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, IMP-7.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`NUTRITION_NEXT_SPEC_DECISIONS.md §5`:
> manuell gepflegte Tag-Liste für schwierige Tags
> Admin darf Tags bei BLS Foods korrigieren
> User darf Tags bei Custom Foods selbst setzen

`SPEC_06_DATABASE_SCHEMA.md` Trigger `auto_tag_food` — automatisch.
Manueller Override-Mechanismus für Admin nicht belegt:
- Kein Admin-API-Endpoint in SPEC_07 oder SPEC_07_PASS2_PATCH (nicht belegt)
- Kein Admin-UI in SPEC_10 (nicht belegt)
- Trigger löscht alle bestehenden Tags vor INSERT (`DELETE FROM food_tags WHERE food_id = p_food_id;`) — dadurch würde ein manueller Admin-Override beim nächsten `UPDATE foods` automatisch überschrieben.

User-Tags für Custom Foods:
- Decisions §5: "User darf Tags bei Custom Foods selbst setzen"
- `foods_custom` hat `custom_allergens TEXT[]` (EU-14 Allergene), aber kein generisches Tag-Feld.
- Kein API-Endpoint für `POST /foods/custom/:id/tags` in SPEC_07.

**Konsequenz:** Wenn V1 Admin-Tag-Korrekturen oder User-Custom-Tags verlangt, sind diese Pfade nicht implementierbar.

---

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

**Verwandter Punkt:** C-31 (Admin-Oberflaeche fuer die Kuration). `[read]` **Nicht zusammengelegt** — ob es
derselbe Befund ist, gehoert geprueft, nicht angenommen.
