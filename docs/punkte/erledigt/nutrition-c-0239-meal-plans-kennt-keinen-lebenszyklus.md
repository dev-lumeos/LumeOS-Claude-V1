---
nr: C-239
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-23
braucht: []
kind_von: G-161
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-29
erledigt: 2026-08-29
commit: 1a2032b0
beruehrt:
  tabellen: [nutrition.meal_plans, nutrition.meal_plan_entries]
zahlen:
  gemessen: 2026-08-29
  reference_window_bytes: 8298086
  flag_response_bytes: 1814
---

# C-239 - `meal_plans` kennt keinen Lebenszyklus

## Befund

Neu 2026-08-23 aus G-161. Die drei Attrappen im Meal-plans-Reiter
benennen eine gemeinsame Datenluecke: Lebenszyklus, Startdatum und
Bestaetigungsmodus waren nicht modelliert.

Vor dem Patch hatte `nutrition.meal_plans` nur `name`, Beschreibung,
Makroziele, `is_active`, Herkunft und Zeitstempel. `meal_plan_entries`
hatte keinen Ausfuehrungsstatus. Ein vorhandener aktiver Plan mit 56
Entries konnte daher weder beginnen, enden, rollen noch eine einzelne
Ausfuehrung bestaetigt bekommen.

## Auftrag

Mitbeauftragt waren C-238 und C-348. Der Bericht steht hier; die beiden
Punkte verweisen auf die jeweiligen Abschnitte.

Keine Oberflaeche wurde geaendert. Der Durchlauf lief ausschliesslich
gegen die Wegwerf-Datenbank `lumeos_c239_probe`; weder die laufende
Datenbank noch `apps/` wurden angefasst.

## Bericht - C-239: Lebenszyklus

### Vormessung

Die drei Bezeichnungen `once`, `rollover`, `sequence` stehen in der
Vorlage und ebenso in `SPEC_02_ENTITIES`. Dort ist ihre beabsichtigte
Wirkung beschrieben: `once` endet nach `days_count`, `rollover`
beginnt wieder bei Tag 1, `sequence` folgt `next_plan_id`.

Das belegt, dass diese drei Arten dokumentiert sind. Es belegt nicht,
dass sie eine vollstaendige, fachlich abschliessende Liste aller
moeglichen Lebenszyklen sind. Eine unabhaengige Normquelle oder eine
begruendete Ausschlussliste fuer weitere Arten liegt im Repo nicht vor.
Dieser Widerspruch wurde nicht aufgeloest: das Schema beschraenkt sich
auf die drei dokumentierten Werte, die Vollstaendigkeit bleibt offen.

### Schema

`058b_recipes_meal_plans.sql` ergaenzt `nutrition.meal_plans` um:

| Feld | Zweck |
| --- | --- |
| `lifecycle_type` | `once`, `rollover` oder `sequence` |
| `start_date` | Kalenderbeginn des Plans |
| `days_count` | positive Dauer fuer die dokumentierte `once`-Semantik |
| `next_plan_id` | Selbst-FK fuer `sequence`; bei anderen Arten verboten |
| `rollover_count` | Zaehler der begonnenen Durchlaeufe |
| `status` | `assigned`, `active`, `completed`, `paused`, `archived` |

`next_plan_id` darf nicht auf den Plan selbst zeigen. Der bestehende
boolesche Lesevertrag `is_active` bleibt erhalten, wird aber durch einen
Trigger aus `status` gespiegelt. Alte Schreiber, die nur `is_active`
setzen, werden nach `active` beziehungsweise `paused` abgebildet.

Die vorhandene Planzeile blieb fachlich unveraendert: ihre neuen
Lebenszyklus-, Start- und Dauerfelder sind `NULL`; nur der bisherige
Bool-Wert wurde verlustfrei zu `active` oder `paused`. Das Testprotokoll
prueft genau diese Aussage.

### Was damit bewusst noch nicht geschieht

Das Schema beschreibt den Zustand, es fuehrt keinen Plan aus. Es gibt
weiterhin keinen Job und keine Transaktion, die bei `days_count`
`completed` setzt, bei `rollover` den Tag-1-Zyklus erzeugt oder bei
`sequence` den Folgeplan aktiviert. Ohne diese spaetere Ausfuehrungs-
regel sind die drei Typen im Schema vollstaendig gespeichert, aber ihre
automatische Wirkung ist nicht gebaut. Eine vorgetaeuschte Compliance-
zahl oder ein automatischer Ablauf wurde deshalb nicht ergaenzt.

## Bericht - C-238: Ghost Entries brauchen Ausfuehrungsstatus

Massgeblich ist Flow 4 aus `SPEC_03_USER_FLOWS`, nicht die Vorlage:

| Fall | erforderlicher Log-Zustand |
| --- | --- |
| Ghost Entry angelegt | `pending`, ohne Ablaufdatum |
| MealCam oder unveraenderte manuelle Bestaetigung | `confirmed` |
| Abweichung von mehr als 20 % kcal | `deviated` |
| bewusst nicht gegessen | `skipped` |
| rueckwirkende Bestaetigung | urspruengliches `execution_date`, aktuelles `confirmed_at` |

Der Status gehoert nicht an `meal_plan_entries`: Das ist die wiederver-
wendbare Vorlage und kann bei `rollover` an vielen Kalendertagen laufen.
Neu ist deshalb `nutrition.meal_plan_logs`, eindeutig je
`plan_entry_id` und `execution_date`. Es speichert Plan, Nutzer,
Ausfuehrungstag, Status, Ist-Mahlzeit, `confirmation_mode`, Abweichungs-
werte sowie Bestaetigungs-/Skip-Zeitpunkt.

Check-Constraints erlauben nur die vier Flow-Zustaende und erzwingen
ihre Belege: `pending` darf keine Aufloesung tragen; `confirmed` und
`deviated` brauchen Mahlzeit, Modus und `confirmed_at`; `deviated`
braucht zusaetzlich beide Abweichungswerte; `skipped` braucht nur
`skipped_at`. Ein Owner-Guard bindet Plan, Entry, Mahlzeit und Nutzer
an dieselbe Person. Damit bleibt `pending` auch rueckwirkend offen und
fehlende Logs werden nicht als `skipped` umgedeutet.

`meal_plan_day_to_diary()` wurde absichtlich nicht umgebaut. Sie kann
keinen rueckwirkenden Bestaetigungslog erfinden. Das Erzeugen eines
`pending`-Logs und die atomare Verknuepfung mit MealCam/manueller
Mahlzeit sind der noch fehlende Schreibflow, nicht eine UI-Aenderung.
Solange er fehlt, ist keine Compliance-Quote belastbar.

## Bericht - C-348: Flag-Antwort verdichten

Die neue Pipeline-Funktion
`nutrition.reference_assessment_window_flags(user_id, end_date, days)`
ruft ausschliesslich die bestehende
`reference_assessment_window()` auf. Sie berechnet weder Referenzwerte
noch Tageswerte ein zweites Mal. Sie liest daraus nur
`reference_status` und `reference_pct`, zaehlt nach der bestehenden
Clientregel (mindestens vier vollstaendige Tage, mindestens die Haelfte
ausgeloest) und gibt sechs skalare Felder pro Kandidat zurueck.

Gegenprobe, 90 Tage bis 2026-08-29 in `lumeos_c239_probe`:

| Antwort | Zeilen | JSON-Textgroesse | Datenbanklaufzeit |
| --- | ---: | ---: | ---: |
| bisheriges Referenzfenster | 154 | 8.298.086 Byte | 2.065 ms |
| Flag-Funktion | 10 | 1.814 Byte | 1.713 ms |

Das sind 99,98 % weniger uebertragene Nutzlast. Der Test expandiert die
bisherige `daily_assessments`-Antwort nach der alten Regel und vergleicht
ihre zehn Kandidaten feldgleich mit der neuen Funktion. Das Ergebnis ist
identisch.

Die Vergleichswerte sind ein isolierter Datenbanklauf, nicht ein Ersatz
fuer G-260s End-to-End-Wert von 6.393 ms. Besonders wichtig: Der
Nutrients-Reiter ruft weiterhin die alte Funktion auf, weil `apps/`
nicht Teil dieses Auftrags ist. Die 8,3-MB-Uebertragung bleibt dort bis
Claude Code den vorhandenen Leseaufruf gezielt auf die neue Funktion
umstellt. Keine Oberflaeche und keine Referenzlogik wurden dabei
dupliziert.

## Geaendert und geprueft

- `058b_recipes_meal_plans.sql`: Lebenszyklus-/Statusschema,
  kompatibler `is_active`-Trigger und `meal_plan_logs` mit RLS, Rechten,
  Owner-Guard und Constraints.
- `059d_reference_assessment_window_flags.sql`: kompakte, lesende
  Flag-Antwort; als Schritt `059d` in der Pipeline registriert.
- `meal-plan-lifecycle-and-flags.test.ts`: erst rot (sechs Spalten,
  Log-Tabelle und Funktion fehlten), nach dem Patch gruen: 2/2 Tests.
- `git diff --check`: gruen.

`kette-readme-pruefen.ts` bleibt rot wegen 41 bereits fehlender,
unabhaengiger README-Schritte; `059d` ist dort selbst dokumentiert und
steht nicht in der Fehlerliste. Keine Dateien wurden gestaged oder
committet.

## Abnahme

Offen fuer Tom: Ob die drei dokumentierten Lebenszyklusarten fachlich
abschliessend sind und wann der Schreibflow die hier modellierten
Uebergaenge ausfuehrt. Beides darf nicht aus einer Kachel abgeleitet
werden.

## Abnahme

**2026-08-29, Orchestrator. Nachgemessen.**

`[cmd]` **Lifecycle-Schema und getrennte `meal_plan_logs` stehen in
der Kette.**

`[read]` **Und die Zurueckhaltung ist der wertvolle Teil:** die drei
Typen sind dokumentiert, **ihre Vollstaendigkeit bleibt unbelegt** —
und **automatische Ablaufaktionen wurden bewusst nicht erfunden.**

`[read]` **Das war die Vorgabe:** der Status entsteht aus dem Flow,
nicht aus der Vorlage. **Die Vorlage zeigt, was jemand sich gedacht
hat.**

### C-348 — der Befund in einer Zahl

`[cmd]` **Dieselben zehn Flags mit 1.814 statt 8.298.086 Byte —
minus 99,98 Prozent.**

`[cmd]` **Der UI-Aufrufer bleibt unangetastet** — die Funktion liegt
bereit, der Reiter nutzt sie noch nicht. **Als G-273 angelegt.**

`[read]` **Damit ist der Handel aus G-260 aufgeloest:** Tom hat sich
fuer die Flags entschieden und 6.393 ms in Kauf genommen. **Rund
895 ms davon fallen weg, sobald der Reiter die Funktion ruft.**

`[cmd]` Test 2/2 gruen, Wegwerf-Datenbank entfernt, `apps/`
unberuehrt.

**Abgenommen.**
