---
nr: G-596
typ: befund
modul: recovery
schwere: mittel
angelegt: 2026-10-03

braucht: [G-593]
kind_von: G-593

quellen:
  - docs/punkte/erledigt/recovery-g-0593-die-attrappe-nennt-eine-tabelle-die-es-unter-anderem-namen-gibt.md

beruehrt:
  tabellen:
    - recovery.recovery_protocols
  dateien:
    - docs/specs/Recovery/SPEC_02_ENTITIES.md
    - docs/specs/Recovery/SPEC_08_IMPORT_PIPELINE.md
    - supabase/migrations/20260907090000_c421_recovery_read_models.sql
---

# Die Spec beschreibt eine Bibliothek, die Tabelle ist ein Verlauf

## Der Befund — zwei Entitaeten unter einem Namen

`[read]` **`docs/specs/Recovery/SPEC_08_IMPORT_PIPELINE.md:19` fuellt
`recovery_protocols` als importierten Katalog:**

    (name, name_de, description, protocol_type, target_condition,
     duration_days, evidence_level, ...)

`[read]` **`20260907090000_c421_recovery_read_models.sql:22` hat unter
demselben Namen eine Instanztabelle gebaut:**

    user_id · protocol_key · name · target_condition · started_on ·
    duration_days · daily_activities · status · completed_days

`[read]` **Die Unterschiede sind nicht kosmetisch:** `user_id`,
`started_on`, `status` und `completed_days` gehoeren einem laufenden
Protokoll **eines** Nutzers. `name_de`, `description`, `evidence_level`
und `protocol_type` gehoeren einem Katalogeintrag. **Die Spec kennt
keinen `protocol_key`, die Tabelle kennt kein `evidence_level`.**

`[cmd]` **Daher die widerspruechlichen Wertelisten**, die G-593
sichtbar gemacht hat:

    SPEC_02_ENTITIES.md:329   general | overreaching | injury |
                              illness | deload
    Bestandszeilen            general_recovery · poor_sleep
    protocol_key CHECK        active_recovery_week · passive_deload ·
                              sleep_optimization · injury_protocol

**Die Spec-Liste beschreibt die Zustaende des Katalogs, nicht die eines
Nutzerlaufs** — darum fehlt dort Schlaf, und darum passt keine der
Bestandszeilen hinein.

## Warum es zaehlt, obwohl heute nichts bricht

`[cmd]` **`target_condition` hat null Leser.** In `apps/` und
`packages/` kommt die Spalte kein einziges Mal vor; der einzige
Zugriff ist `00_querschnitt/422_recovery_card_reads_and_phase_proposals.sql:11`
mit `to_jsonb(p)` — die ganze Zeile, nicht die Spalte. **Es filtert,
gruppiert und zeigt sie niemand.**

`[read]` **Deshalb ist das ein Befund und kein Fehler.** Er wird einer,
sobald jemand die Bibliothek baut: dann stehen zwei Dinge unter einem
Namen, und der Katalog hat keinen Platz mehr.

## Was zu entscheiden ist

`[read]` **Zwei Formen, und sie gehoeren Tom, nicht einem Agenten:**

1. **Die Bibliothek bekommt ihren eigenen Namen** — etwa
   `recovery.protocol_library`, und `recovery_protocols` bleibt der
   Verlauf. `[annahme]` **Die gerade Linie:** der Bestand bleibt, wo er
   ist, und die Spec wird an einer Stelle nachgezogen.
2. **Der Verlauf wird umbenannt** und `recovery_protocols` der Spec
   zurueckgegeben. **Teurer:** zwei echte Zeilen, eine Sicht in `422`,
   die Testdaten und der Schreibweg aus G-593 haengen am heutigen Namen.

**Und eine Frage fuer Tobias:** sind die vier Protokolle aus dem
`protocol_key`-CHECK die vollstaendige Liste, oder ist die Bibliothek
breiter gedacht? **Davon haengt ab, ob 1 oder 2 richtig ist** — eine
Bibliothek mit vier Eintraegen braucht keine eigene Tabelle.

**Nicht Teil:** G-593 (der Knopf, laeuft) · `target_condition`s
Werteliste, in G-593 entschieden als Ableitung aus `protocol_key` · ein
CHECK auf `target_condition`, der nach G-593 kommt.
