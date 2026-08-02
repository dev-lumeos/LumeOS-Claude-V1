# Sitzung 2026-08-02 — Aufräumen + letzter Reproduzierbarkeitsnachweis

**Ankerhash bei Start:** b0441a9 (verifiziert; während der Sitzung committete
eine parallele Session `306756f` — siehe Hinweis unten)
**Auftrag:** A-05-Nachweis aus dem versionierten Archiv, A-03/A-04
archivieren, D-03/D-15/D-16 abschliessen, Löschliste vorbereiten.
Nichts löschen (ausser `supabase/snippets/`), keine Commits.

---

## Aufgabe 1 — Nachweis aus dem versionierten Archiv: **grün**

`[cmd]` Vollständig dokumentiert als dritter Lauf in
`docs/ssot/33-pipeline-verifikation.md` (Datei mit Vollinhalt neu
geschrieben, Bestand erhalten).

1. **Archiv-Integrität:** Zip nach Scratchpad entpackt; beide CSVs
   **byte-identisch** zur Container-Kopie
   (MD5 `be0526…` foods, `12138d…` nutrients; 7.141 / 698.093 Zeilen
   inkl. Kopf; Kopfzeilen identisch).
2. **Kettenlauf aus dem Archiv:** Wegwerf-DB `a05_test`, auth-Stub;
   Container-Kopie beiseitegelegt, entpackte Archiv-Dateien per `docker cp`
   an den 030-Pfad; exakte Repo-Kette (3 Migrationen → 015 → 020 → 030 →
   020 → 021 → 050 → 051 → 060) mit `ON_ERROR_STOP=1` fehlerfrei.
3. **Vergleich gegen Ist-Container:** alle 11 Zeilenzahlen identisch
   (7.140 / 698.092 / 21.420 / 9.265 / 518 / 138 / 16 / 4×0),
   105 Spalten, 4.903 Kategoriezuweisungen; Kette liefert 33 Indizes
   und 15 Policies (Soll mit 060).
4. **Aufgeräumt:** `a05_test` verworfen, Container-Kopie unverändert
   zurückgetauscht (MD5 nach Restore geprüft). Das Scratch-
   Entpackverzeichnis konnte nicht gelöscht werden (`rm` per
   Permission-Schicht geblockt) — liegt im sessionsgebundenen Temp und
   verfällt von selbst.

**Konsequenz:** Reproduzierbarkeit hängt nicht mehr an untracked Dateien —
`tmp/` ist entbehrlich und steht jetzt auf der Löschliste.

## Aufgabe 2 — A-03 Altlast archiviert: **erledigt**

Per `git mv` nach `docs/_archive/`:

- `docs/todos/` (11 Dateien), `docs/governance/` (komplett),
  `docs/ist-zustand/` (5 Dateien)
- Aus `docs/project/` **36 Governance-Positionen** (je Datei geprüft):
  29 Dateien (BATCH_LOADER, CODEX_*, 3 codex-smoke-tests,
  CURRENT_GOVERNANCE_HANDOVER, DOCS_GOVERNANCE, 8× GOVERNANCE_*,
  MINIMAX_LAB_RUNTIME, MODEL_RUNTIME_HARDENING,
  NUTRITION_BOOTSTRAP_DOC_STATUS, OPEN_TODOS, PROJECT_PROFILES,
  REPORT_RETENTION_POLICY, SESSION_ONBOARDING, STACK_REFERENCE,
  USER_MANUAL, 3× WORKORDER_*, CLAUDE_EDIT_RULES,
  GOVERNANCE_TODO_REGISTER.json) und 7 Ordner (`frontdoor/`,
  `generated-evidence/`, `governance-core-extraction/`,
  `governance-learning/`, `prompts/`, `runtime/`, `system-structure/`).

**In `docs/project/` verblieben (Produkt):** `p1-005/`, `local-supabase/`
(beide Teil der DB-Aufbaukette), `GSTACK.md`, `GSTACK_MANUAL.md` (aktives
Tooling), `P1_005_DECOMPOSITION_CANDIDATE.md`, `P1_005_READINESS_CANDIDATE.md`
(Ketten-Herkunft) sowie als **Grenzfälle** `PRODUCT_WORK_GATE.md` und
`FIRST_PRODUCT_GATE_OPENING_PROPOSAL.md` — Governance-Form, aber das
Product-Gate-Konzept wird von `docs/ssot/40-spec-code-matrix.md` weiter
referenziert; Einordnung ist Toms Entscheidung.

`docs/_archive/README.md` angelegt (Inhalt, Datum, Nicht-zitieren-Regel).

**Nicht verschoben (ausserhalb des Auftragswortlauts):** die Root-Dateien
`SESSION_ONBOARDING.md` und `STACK_REFERENCE.md` — CLAUDE.md nennt sie als
Altlast, der Auftrag nannte nur `docs/`-Pfade. Kandidaten für den nächsten
Aufräumgang.

## Aufgabe 3 — A-04: **erledigt**

`docs/BrainstormDocs/_ARCHIVE_NOTICE.md` neu geschrieben: verweist jetzt auf
`docs/ssot/00-INDEX.md`, `docs/spezifikation/00-INDEX.md`,
`docs/todo/TODO.md`. Der tote Onyx-/`system/memory/canonical`-Bezug ist raus.

## Aufgabe 4 — Kleinkram

- **D-15 erledigt:** `supabase/migrations-draft/` per `git mv` nach
  `supabase/_archive/migrations-draft/` (6 Dateien).
- **D-16 geklärt — Annahme widerlegt:** `021_wild_category_apply.sql` ist
  **notwendig**. `[cmd]` `020` legt den `wild`-Kategoriebaum nur an
  (kein `V2%` in `020`); `021` weist die BLS-Präfixe `V2%` zu:
  `affected_rows = 49` im Kettenlauf (nach dem zweiten `020`-Lauf!),
  Container: 49 von 49 `V2%`-Foods in `wild`, 0 ohne Kategorie.
  Die frühere Lesart „ohne sichtbaren Effekt" übersah schlicht die
  Zählausgabe. In `supabase/README.md` vermerkt (Datei komplett
  aktualisiert: Kettentabelle inkl. 060, 021-Befund, Archiv-Nachweis,
  bereinigte offene Punkte).
- **D-03 fast erledigt:** `[cmd]` alle 3 Snippets byte-identisch (`cmp`) in
  `supabase/_snippets/` gesichert. Die Löschung selbst scheiterte an der
  Permission-Schicht (`rm`-Deny; der Ordner ist untracked, `git rm` greift
  nicht). Ich habe die Schicht nicht umgangen — `supabase/snippets/` steht
  stattdessen auf dem Löschskript.

## Aufgabe 5 — Löschliste: **erledigt, nichts gelöscht**

`docs/_archive/loeschliste-2026-08-02.md` + `…ps1` (mit `-WhatIf`-Modus,
Bestätigungsabfrage und Verbotsliste). Kurzfassung:

- **Löschen:** `tmp/` (31 MB — CSVs versioniert + Kettenlauf bewiesen;
  die dortige Seed-Datei ist eine ältere 184-Zeilen-Variante des
  verifizierten `015`), `temp/antigravity-awesome-skills-main/`
  (neu ladbares Fremd-Repo), `_tmp_inventory/`, `backup_system.zip`,
  `services.zip`, `system.zip` (Snapshots tracked vorhandener Ordner),
  `nul` (`[cmd]` Hex: Windows-Fehlermeldungs-Artefakt),
  `.codex-governance-ui.log`, `supabase/snippets/`,
  `.wayland-core/` + `.wayland/` (`[annahme]` Tool ausser Betrieb).
- **Behalten:** **`temp/lumeosold/`** — wichtigster Fund der Sitzung:
  vollständige Arbeitskopie des Vorgängerrepos inkl.
  `backups/lumeos_prod_20260305_…` (Schema 95 Tabellen + 11,5 MB Daten):
  `[cmd]` enthält `public.exercises` mit allen Medien-Spalten,
  `exercise_muscles`, `muscle_groups`, `equipment`,
  `storage.buckets/objects` — ein **Produktions-Schnappschuss der
  LumeOS-V2-Instanz vom 2026-03-05**, von der Aufbaukette nicht
  abgedeckt, direkt relevant für Sektion E (E-05).
  Ausserdem behalten: `.ijfw/` + `ijfw/` (erst nach B-10-Entscheidung).

---

## Angelegte / geänderte / verschobene Dateien

Neu: `docs/_archive/README.md`, `docs/_archive/loeschliste-2026-08-02.md`,
`docs/_archive/loeschliste-2026-08-02.ps1`, dieser Bericht.
Geändert: `docs/ssot/33-pipeline-verifikation.md` (Nachtrag dritter Lauf),
`supabase/README.md` (dritte Fassung), `docs/BrainstormDocs/_ARCHIVE_NOTICE.md`.
Verschoben: siehe Aufgabe 2 + `supabase/migrations-draft/` → `supabase/_archive/`.
Gelöscht: nichts (auch `supabase/snippets/` nicht — rm-Deny, siehe D-03).

**Hinweis Parallelarbeit:** Die parallele Spec-Session hat `306756f`
committet, während meine `git mv`-Umzüge bereits gestaged waren — die
Docs-Verschiebungen und die _ARCHIVE_NOTICE-Änderung sind dadurch in diesem
Commit **mitgefahren** (1.213 Dateien). Verbleibend uncommitted: die 6
migrations-draft-Renames (gestaged), die 3 neuen `_archive`-Dateien, dieser
Bericht sowie `33-pipeline-verifikation.md` und `supabase/README.md`.
Genau die im TODO benannte B-11-Konstellation (mehrere Agenten, ein
Working Tree).

## Entscheidungen für Tom

1. Löschskript ausführen (`-WhatIf` zuerst) — insbesondere: einverstanden,
   dass `.wayland*` mitgeht?
2. `temp/lumeosold/backups/` an einen dauerhaften Ort retten (z. B.
   `backup/legacy-cloud/`), bevor `temp/` je angefasst wird — gehört zu
   Sektion E.
3. Grenzfälle `PRODUCT_WORK_GATE.md` / `FIRST_PRODUCT_GATE_OPENING_PROPOSAL.md`:
   archivieren oder als aktive Referenz behalten?
4. Root-Altlast `SESSION_ONBOARDING.md` / `STACK_REFERENCE.md` nachziehen?

## Auswirkungen auf TODO (nur benannt, TODO.md unverändert)

- **A-05:** Nachweis erbracht; `tmp/` darf auf die Löschliste. Punkt kann
  nach Skriptausführung auf `[x]`. Neu daraus: `temp/lumeosold/` ist
  **kein** Müll (LumeOS-V2-Dump, → Sektion E).
- **A-03:** erledigt (Rest: Root-Dateien, Grenzfälle).
- **A-04:** erledigt.
- **D-03:** Kopien verifiziert; Original-Löschung wandert ins Skript → `[x]`
  nach Ausführung.
- **D-15:** erledigt (archiviert).
- **D-16:** geklärt und **korrigiert** — `021` ist Pflichtschritt (49
  Zuweisungen), keine Redundanz. `[annahme]` aus TODO/33er-Bericht ist
  widerlegt.
- **E-05:** neue Quelle — der lokale Produktions-Dump vom 2026-03-05 in
  `temp/lumeosold/backups/` (Mapping-Material ohne Cloud-Zugriff).
