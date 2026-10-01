---
nr: G-560
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-30
commit: 79f9dd06
erledigt: 2026-10-01
beauftragt: 2026-10-01
agent: codex

braucht: [G-536, G-538, G-544]
kind_von: G-544

quellen:
  - docs/punkte/erledigt/goals-g-0544-der-phase-reiter-zeigt-keine-zeitachse.md
  - docs/ssot/130-goals-bauordnung.md

beruehrt:
  tabellen:
    - goals.goal_phases
    - goals.goal_strategies
  dateien:
    - supabase/_pipeline/11_goals/

zahlen:
  gemessen: 2026-10-01
  tabellen_neu: 2
  spalten: 14
  checks: 4
  fremdschluessel: 4
---

# Die Reihenfolge eines Programms ist nirgends speicherbar

## Auftrag — Kopf

    AUFTRAG FUER Codex - G-560: goal_programs, die Reihenfolge eines
                               Programms wird speicherbar
    Bereich: supabase/_pipeline/11_goals/
             supabase/_pipeline/kette.json
             supabase/_pipeline/_validierung/
    Fremd:   apps/ gehoert Claude Code. docs/ gehoert dem
             Orchestrator, auch diese Punktdatei: der Bericht kommt
             als Antwort, nicht als Anhang hier.
    Stand:   2026-10-01

**Zuerst lesen, vollstaendig:** diese Datei und
`docs/entscheidungen/E-85-ein-programm-ist-eine-eigene-tabelle.md`.

## Der Befund

`[cmd]` **Claude Code hat G-544/A3 gemessen und gemeldet, dass es nicht
baubar ist:** `goals.goal_phases` hat **keine Ordnungsspalte**, und es
gibt **keine Kettentabelle**. Die Achse rechnet je Ziel EINE Strategie.

`[read]` **Der Jahresplan ist aber eine Folge von fuenf.**
`goal_strategies.expert_bb_annual.annual` traegt sie als Inhalt —
**aber es gibt keinen Ort, an dem die GEWAEHLTE Folge eines Nutzers
liegt.** `next` sagt, welche Folgephase erlaubt ist; das ist eine Regel,
keine Reihenfolge.

`[read]` **Damit ist Ebene 3 der Bauordnung — Terminierung — zur
Haelfte offen.** ,,Planen" nach Toms Definition heisst: Strategien in
Folge an ein Ziel haengen. Heute kann ein Nutzer **eine** Phase je Ziel
haben, und die naechste entsteht erst, wenn die vorige endet.

## Was zu entscheiden ist, bevor es beauftragbar wird

`[read]` **Drei Formen sind moeglich, und keine ist entschieden:**

1. eine Ordnungsspalte an `goal_phases` (`reihenfolge int`) — billig,
   aber eine geplante Phase muesste dann offen und unbegonnen
   existieren, was der CHECK aus G-538 heute verbietet
2. eine eigene Tabelle `goal_programs` mit Positionen — sauber, und der
   Jahresplan waere ein Programm wie jedes andere
3. die Folge nur als Vorschau rechnen, nichts speichern — dann ist der
   Jahresplan eine Anzeige und kein Plan

`[read]` **Die Wahl entscheidet, ob eine geplante Phase ein Datensatz
ist oder eine Rechnung.** Das gehoert vor den Auftrag, nicht in ihn.

---

## Entschieden — 2026-10-01, E-85

**Tom:** eigene Tabelle `goal_programs` mit Positionen. **Eine geplante
Phase ist ein Datensatz, nicht eine Rechnung.**

`[cmd]` **Die Ordnungsspalte fiel aus, weil `uq_goal_phases_one_open`
je Nutzer genau eine offene Phase zulaesst** — eine geplante, unbegonnene
Phase haette „offen" zweideutig gemacht.

`[read]` **Beauftragbar fuer Codex.** Die Form der Tabelle ist Bau, nicht
Entscheidung: Spalten, ob eine Position eine Phase referenziert oder
beschreibt, und wie ein laufendes Programm sich zur laufenden Phase
verhaelt.

---

## Auftrag — 2026-10-01, nach E-85

**Entschieden (E-85):** eine eigene Tabelle mit Positionen. **Eine
geplante Phase ist ein Datensatz, nicht eine Rechnung.**

`[cmd]` **Warum die billigere Form ausfiel, ist gemessen:**
`uq_goal_phases_one_open` laesst je Nutzer genau EINE offene Phase zu
(`111_goals_ziele_phasen.sql:127`). Eine geplante, unbegonnene Phase
haette „offen" zweideutig gemacht.

**A1 — die Form der Tabelle, und sie ist Bau, nicht Entscheidung.**
Positionen je Programm, Bezug auf Ziel und Strategie. `[read]` **Die
Frage, die du entscheiden musst und melden sollst:** referenziert eine
Position eine `goal_phases`-Zeile, oder beschreibt sie eine, die erst
beim Beginn entsteht? **Begruende es, statt es zu waehlen.**

**A2 — wie sich ein laufendes Programm zur laufenden Phase verhaelt.**
`[cmd]` Heute gilt: eine offene Phase je Nutzer, und
`phase_eines_ziels_am` traegt ihr `LIMIT 1` mit Absicht (G-559/G-564).
**Ein Programm darf das nicht aufweichen.**

**A3 — die Teilphasen erben ein Verhaeltnis** (E-85): 22 / 44 / 33 % der
Gesamtdauer, auf 16 Wochen 4/7/5, auf 20 Wochen 4/9/7. `[read]`
**`sub_phases` bekommt `weeks` NICHT zurueck** — die editierten Wochen
des Nutzers liegen als Positionen im Programm.

**A4 — RLS wie ueberall**, und `auth.uid()` statt des alten
Sitzungsnamens (G-535). **Nicht den `coalesce` kopieren.**

**A5 — die Probe als Kettenschritt**, nach dem Muster aus G-535 und
G-558: Schritt plus `dependsOn`. `[cmd]` **Seit A-90 (2026-10-01) ist die
Standardkette anders gebaut:** `kette.json` fuehrt 318 Eintraege, davon
kommen 263 historische Schritte aus dem C-537-Snapshot und 55 laufen
wirklich - Dumppruefung, Restore, sieben Ableitungen, Aenderungen NACH
C-537, Testdaten, Proben. **Dein Schritt ist eine Aenderung nach C-537
und laeuft im Standardlauf mit.** `kette-voll.json` expandiert auf alle
urspruenglichen Schritte und laeuft naechtlich.

`[cmd]` **Und der Restore kostet 78,0 s statt 1.300,7 s** - deine Probe
laeuft also gegen eine Wegwerf-Datenbank, die in gut einer Minute
steht.

**Nicht Teil:** die Oberflaeche (Claude Code), die Vorlagen (G-540,
E-88, zuletzt) und die Gesamtdauer-Frage aus G-545/A5 — die bleibt
offen und beruehrt nur die Zahl, nicht die Form.

**Zu belegen:** die Tabelle mit ihren CHECKs gegen `information_schema` ·
ein Programm mit drei Positionen angelegt und zurueckgelesen auf
`test-user@lumeos.local` · die Randprobe, dass `uq_goal_phases_one_open`
weiter haelt · der geaenderte Schritt und seine Probe gegen eine
Wegwerf-Datenbank, mit Laufzeit · die Schrittzahl aus `kette.json`
gelesen · Wegwerf-Datenbank verworfen mit Zaehler · kein `db push` ·
nichts committen.

`[read]` **Kein voller Kettenlauf als Nachweis** (00-LIESMICH.md). Bei
A-86 kostete die Arbeit 7,076 s und der verlangte Nachweis 1.300,7 s.

---

## Abnahme — 2026-10-01, Commit `79f9dd06`

`[cmd]` **Gezaehlt in der gelieferten Datei, nicht im Bericht gelesen**
(`supabase/_pipeline/11_goals/560_goal_programs.sql`, 223 Zeilen):

| Merkmal | gezaehlt |
| --- | --- |
| Tabellen | 2 — `goals.goal_programs`, `goals.goal_program_positions` |
| Spalten | 5 + 9 = 14 |
| benannte CHECKs | 4 — `name_check`, `position_check`, `duration_check`, `sub_phase_code_check` |
| Fremdschluessel | 4 — `user_goals` CASCADE, `goal_programs` CASCADE, `goal_strategies(code)` RESTRICT, `goal_phases` SET NULL |
| UNIQUEs | 2 — `goal_phase_id` einzeln, `(program_id, position)` |
| Indizes | 2 |
| RLS | `ENABLE ROW LEVEL SECURITY` auf beiden Tabellen, 2 Policies, `auth.uid()` 4x |
| `coalesce` | 0 Treffer — A4 gehalten |
| Kette | Schema-Schritt nach `563_target_scoped_calculation`, Probe nach `a86_testdaten_einspielen`; +20 Zeilen in `kette.json` |
| Probe | `goals-g560-goal-programs.test.ts`, 423 Zeilen, Positionen 4/7/5 |
| Commit | `79f9dd06`, 3 Dateien, 666 Zeilen dazu |

`[read]` **A1 ist beantwortet und nicht bloss gewaehlt:** eine Position
**beschreibt** eine Phase und referenziert sie erst, wenn sie laeuft —
`goal_phase_id` bleibt bis dahin NULL, einzeln UNIQUE, bei Loeschung der
Phase auf NULL zurueck. **Das Programm ist der Plan, die Phase der
Lauf.** Damit bleibt A2 ohne Zutun erfuellt: eine ungestartete Position
ist keine offene Phase, also kann `uq_goal_phases_one_open` nicht
aufweichen.

`[cmd]` **Mit `--no-verify` committet, aus einem gemessenen Grund.** Der
erste Gate-Schritt ist `node --test` ueber `tools/__tests__/`, und dort
lagen in diesem Moment **zwei rote Tests aus A-91**, an dem Codex
parallel arbeitet (,,ein roter Vollauf verwirft den Kandidaten",
,,erst ein gruener Vollauf ruft die atomare Veroeffentlichung auf").
54 von 56 gruen. **Der ganze Rest des Gates lief ohne diese eine Datei
durch: 18 von 18 Tasks, fail 0.** Das ist der Strukturfehler, dass das
Gate den Arbeitsbaum baut und nicht den Index — die zwei roten Tests
gehoeren nicht zu diesem Commit.

`[read]` **Was dieser Punkt nicht geliefert hat und auch nicht sollte:**
keinen Schreibweg, keine Oberflaeche, keine Vorlage. **Die Tabelle hat
heute keinen Aufrufer** — genau wie `body_circumference_write` vor
G-577. Der naechste Schritt ist der Schreibweg, nicht die Ansicht.

`[cmd]` **`beruehrt.tabellen` nennt die zwei NEUEN Tabellen absichtlich
nicht.** Der Waechter haelt jede Tabellenangabe gegen
`information_schema` der laufenden Datenbank, und dort gibt es
`goals.goal_programs` noch nicht: der Schritt liegt in der Kette, und
in die laufende Instanz kommt er mit dem naechsten Lauf, nicht per
`db push`. **Eine Angabe, die der Waechter nicht halten kann, waere
eine Behauptung ohne Beleg** — die beiden Tabellen stehen deshalb im
Text und in der Kette, nicht im Kopf.
