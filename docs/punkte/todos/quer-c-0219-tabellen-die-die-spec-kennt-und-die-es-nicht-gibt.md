---
nr: C-219
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-219 - Tabellen, die die Spec kennt und die es nicht gibt

## Befund

(neu 2026-08-22).

  `[cmd]` **recovery:** `protocols`, `hrv_measurements`, `baselines`,
  `sleep_data`, `overtraining_alerts`, `training_load_logs`,
  `user_protocol_assignments`
  `[cmd]` **training:** `volume_landmarks`, `strength_standards`,
  `exercise_progression_configs`, `post_workout_feedback`, `routines`,
  `blocks` — alle in SPEC_06 spezifiziert, keine gebaut (17 Marken in
  `tabs-spec`)
  `[cmd]` **medical:** `user_symptoms`, `medical_alerts`,
  `biomarker_results` (Schreibweg fuer Werte ohne Laborbericht)
  `[cmd]` **goals:** `goal_adjustments`, `weekly_reports`,
  `goal_contributions`, `tdee_settings`, `progress_photos`
  `[cmd]` **supplements:** `stack_templates`/`items`, Injektionstabellen
  (14 Marken, korrekt markiert)
  `[cmd]` **nutrition:** `mealcam_scans`, `shopping_lists`,
  `meal_plan_logs`, `micro_flags`, `coach_nutrition_suggestions`

  **Reihenfolge nach Marken je fehlender Tabelle** — `tabs-spec`
  (training, 17) und die Injektionen (14) sind die dichtesten.
  `shopping_lists` ist bereits C-175 in C-187.

## Auftrag — was die Spec kennt und was es gibt

**Mitbeauftragt: C-187, C-216.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-219 — Tabellen, die die Spec kennt und die es nicht gibt

`[read]` **Du hast gerade fuenf Regelpfade gefunden, die ins Leere
zeigen** (C-159) — **und dass `medical.symptoms` inzwischen
existiert.**

`[read]` **C-219 fragt dasselbe breiter:** **welche Tabellen nennt
die Spec, die es nicht gibt?**

`[cmd]` **Seit heute sind vier dazugekommen:** `meal_slots`,
`meal_plan_slots`, `injection_sites`, `food_tags_kuriert`.

`[read]` **Miss den Stand neu** — **die Liste im Punkt ist alt.**

`[read]` **Und trenne zwei Faelle:** **was fehlt, weil es noch nicht
gebaut ist** — **und was fehlt, weil die Spec sich geirrt hat.**

### 2 · C-187 — fuenf kleine Datenluecken

`[read]` **Lies den Punkt und miss, welche noch bestehen.**

`[cmd]` **Der Punkt sagt selbst: als ein Auftrag** — **also nicht
fuenf Meldungen, sondern eine.**

### 3 · C-216 — `backup/` waechst ungebremst

`[cmd]` **Miss die Groesse und was drinliegt.**

`[read]` **Und beachte A-39:** `backup/` **wird nicht geraeumt,
solange Agenten laufen** — **jemand koennte gerade
hineinschreiben.**

`[cmd]` **Heute liegen dort Bildschirmfotos von G-329, G-331, G-332
und Proben-Skripte.**

`[read]` **Vorschlagen, nicht loeschen.**

### Was nicht zu tun ist

**Nichts in `backup/` loeschen** — A-39, und der Name allein sagt
nichts.
**Keine Tabelle anlegen** — dieser Auftrag misst.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    C-219   welche fehlen, getrennt nach ungebaut / Spec-Irrtum
    C-187   welche der fuenf bestehen
    C-216   Groesse, Inhalt, Vorschlag

## Bericht

**Codex, 2026-09-02.** Nur gelesen: Live-Datenbank und `backup/`.
Keine Tabelle angelegt, keine Datei unter `apps/` angefasst und nichts aus
`backup/` entfernt.

### C-219 - 28 konkret benannte Spec-Tabellen neu abgeglichen

Die alte Liste nennt 28 Tabellen mit Namen (die pauschal genannten
Injektionstabellen nicht mitgezaehlt). Davon sind **21 weiterhin nicht
gebaut**, **zwei waren falsche bzw. ueberholte Tabellennamen**, **eine
Tabellenbezeichnung ist ueberholt, ihr verlangter Schreibfall aber noch
offen**, und **vier existieren inzwischen unter dem genannten Namen**. Die
seit dem Befund dazugekommenen Tabellen stehen separat darunter.

| Einordnung | Heute gemessen | Befund |
|---|---|---|
| noch nicht gebaut | recovery: `protocols`, `hrv_measurements`, `baselines`, `sleep_data`, `overtraining_alerts`, `training_load_logs`, `user_protocol_assignments`; training: `volume_landmarks`, `strength_standards`, `exercise_progression_configs`, `post_workout_feedback`, `routines`, `blocks`; medical: `medical_alerts`; goals: `goal_adjustments`, `weekly_reports`, `goal_contributions`, `tdee_settings`, `progress_photos`; nutrition: `mealcam_scans`, `coach_nutrition_suggestions` | **21 echte offene Modelle.** Fuer diese Namen gibt es weder eine gleichnamige noch eine fachlich gleichwertige Tabelle im Live-Schema. |
| Spec-Irrtum / abgeloest | `medical.user_symptoms` -> `medical.symptoms` (34 Zeilen); `nutrition.micro_flags` | Diese zwei Namen duerfen nicht nachgebaut werden. `micro_flags` ist bewusst keine Tabelle: C-323 bildet die Flags im Leseweg aus den Referenzbewertungen. |
| Name ueberholt, Schreibfall noch offen | `medical.biomarker_results`; vorhanden sind `medical.lab_reports` (10) und `medical.lab_result_values` (280) | Der alte Tabellenname ist abgeloest, aber nicht sein Zweck: `lab_result_values.report_id` ist `NOT NULL`. Es gibt heute also keinen Wert ohne Laborbericht. Das ist ein ungebauter Schreibfall, keine Aufforderung, den alten Tabellennamen anzulegen. |
| inzwischen vorhanden | `supplements.stack_templates` und `stack_template_items` (je 0 Zeilen); `nutrition.shopping_lists` (4) mit `shopping_list_items` (17); `nutrition.meal_plan_logs` (6) | Diese vier alten Behauptungen treffen nicht mehr zu; leere Vorlagentabellen sind dabei ein Daten-, kein Schema-Befund. |

Die frueher nur pauschal genannten Injektionstabellen sind ebenfalls gebaut,
aber fachlich unter `medical`, nicht `supplements`: `medical.injection_sites`
hat 4 Zeilen, dazu gibt es 8 Nadelempfehlungen,
`injection_site_conditions` und `injection_tissue_condition_guidance`.

Die vier im Auftrag genannten Neuankoemmlinge existieren alle:

| Tabelle | Zeilen | Bedeutung fuer den Befund |
|---|---:|---|
| `nutrition.meal_slots` | 10 | vorhanden |
| `nutrition.meal_plan_slots` | 0 | vorhanden, derzeit ohne Kopien |
| `medical.injection_sites` | 4 | vorhanden |
| `nutrition.food_tags_kuriert` | 0 | vorhanden, aber noch ohne Kuration |

Damit ist die Liste nicht einfach nur geschrumpft: Zwei alte Spec-Namen
wuerden beim Nachbauen eine zweite Wahrheit schaffen. Uebrig bleiben die 21
ungebauten Fachmodelle sowie der noch offene, aber anders zu modellierende
Schreibfall fuer einzelne Biomarkerwerte.

### C-187 - ein zusammenhaengender Restbefund

| Teilpunkt | Stand heute | Beleg |
|---|---|---|
| C-175, Einkaufslisten | erledigt | `shopping_lists` 4 und `shopping_list_items` 17 Zeilen |
| C-179, EAA | **offen** | Der Alias `eaa` zeigt weiterhin allein auf `AAE9`; unter `AAE9` liegen sogar 11 Codes (`CYSTE`, `HIS`, `ILE`, `LEU`, `LYS`, `MET`, `PHE`, `THR`, `TRP`, `TYR`, `VAL`), nicht die behaupteten neun. |
| C-178, Prolaktin/ApoB | erledigt | `2842-3` (Prolaktin) und `1884-6` (ApoB) tragen beide `system_groups`; die alte ApoB-Nummer `1869-7` ist korrekt als Identitaetskonflikt markiert. |
| G-124, Medikationsueberwachung | **offen** | In `medical.user_medications` fehlen weiterhin alle zehn geforderten Spalten: `monitoring`, `monitoring_frequency`, `last_test`, `next_due`, `monitoring_overdue`, `targets`, `side_effects`, `physician`, `rx`, `prescription_ref`. |
| G-126, CHOL/Selen | **teilweise offen** | Die laufende Datenbank hat bei `CHORL` noch `source_key = CHORL` und den Chlorid-Text. C-346 korrigiert dies im Kettenimport auf `CHOL -> CHORL`, wurde aber noch nicht in die laufende Instanz uebernommen. Selen ist dagegen keine Importluecke: BLS 4.0 hat keinen Selen-Code. Die alte Sammelzahl "28 Texte" ist kein reproduzierbarer heutiger Teilbefund; aktuell gibt es 110 Detailzeilen, davon 97 vollstaendig dreisprachig und 13 nicht. |

Der eine Auftrag ist daher kleiner, aber nicht erledigt: **EAA, die zehn
Medication-Spalten und der noch nicht nachgezogene CHOL-Livebestand** bleiben.

### C-216 - `backup/` nur inventarisiert

Messzeitpunkt 2026-09-02: **11.606 Dateien, 6.398.613.988 Byte
(5,959 GiB)**. Davon sind 1.022 Dateien mit 182,98 MiB durch Git erfasst;
rund 5,78 GiB liegen unversioniert im Arbeitsbaum.

Die groessten Bereiche sind `vollsicherung` (57 Dateien, 3,840 GiB), `c262`
(53, 0,643 GiB), `kimi-research` (10.030, 0,485 GiB), `schema` (276,
0,207 GiB) und `c255` (31, 0,149 GiB). Nach Dateityp dominieren SQL
(3,482 GiB) und Datenbank-Dumps (1,784 GiB); danach folgen JSON (0,298 GiB),
GZip (0,154 GiB) und PNG (0,141 GiB).

Die verlangten Nachweise sind vorhanden: `g329-*.png`/`.mjs`,
`g331-*.png`/`.mjs` und `g332-*.png`/`.mjs`, ausserdem zahlreiche
Probe- und Negativprobe-Skripte. Die juengsten Dateien stammen sogar von
15:46 Uhr (`c267` und `c276`), davor neue G-335-Bilder und -Skripte. Das
stuetzt A-39 unmittelbar: Der Ordner wird gerade weiter beschrieben.

**Vorschlag, keine Ausfuehrung:** Erst wenn keine Agenten mehr laufen, einen
Manifest-Lauf (Pfad, Groesse, Hash, Herkunft, Aufbewahrungsklasse) erstellen
und anhand dessen zwischen unverzichtbarem Nachweis, reproduzierbarem Dump und
temporarer Probe entscheiden. Bis zu einer ausdruecklichen Freigabe bleibt
alles liegen; insbesondere die G-329/G-331/G-332-Nachweise und die
Proben-Skripte werden nicht als "aufräumbar" eingestuft.

## Abnahme

**2026-09-02, Orchestrator.**

### C-219 — 21 fehlen, zwei waren Irrtuemer

`[cmd]` **21 Fachmodelle fehlen weiter.** `[cmd]` **`user_symptoms`
und `micro_flags` sind Spec-Irrtuemer.**

`[read]` **Genau die Trennung, die der Auftrag verlangte:** **was
fehlt, weil es ungebaut ist — und was fehlt, weil die Spec sich
geirrt hat.**

`[cmd]` **Und ein dritter Fall:** *,,der Einzelwert-ohne-Laborbericht
bleibt fachlich offen, obwohl der alte Name `biomarker_results`
ueberholt ist."*

`[read]` **Ein ueberholter Name, aber eine bestehende Frage** —
**er hat es nicht als Irrtum abgeraeumt, obwohl es einfacher
gewesen waere.**

### C-187 — drei offen, drei erledigt

    offen      EAA
               alle zehn Medication-Monitoring-Spalten
               CHOL-Livebestand, nicht nachgezogen
    erledigt   Einkaufslisten
               Prolaktin / ApoB
               Selen -- kein BLS-Importfehler

`[read]` **Der Punkt sagte *fuenf kleine Datenluecken*.** `[cmd]`
**Er hat sechs Sachen gemessen und drei davon geschlossen.**

`[read]` **Und *Selen ist kein BLS-Importfehler* ist die beste
Zeile** — **eine Vermutung, die sich nicht bestaetigt hat, statt
einer stillen Korrektur.**

### C-216 — und die Zahl ist der Befund

`[cmd]` **`backup/` misst 11.606 Dateien, 5,959 GiB.**

`[cmd]` **Aktuelle Schreibzugriffe vorhanden** — **G-329, G-331,
G-332 haben ihre Nachweise dort.**

`[read]` **Er schlaegt einen spaeteren Manifest- und
Archivierungslauf vor, keine Loeschung** — **A-39 haelt.**

`[read]` **Sechs Gigabyte in einem Verzeichnis, das nicht geraeumt
werden darf, solange Agenten laufen** — **das ist ein wachsendes
Problem, kein akutes.**

**Abgenommen.** **Alle drei bleiben offen, C-187 deutlich kleiner.**

