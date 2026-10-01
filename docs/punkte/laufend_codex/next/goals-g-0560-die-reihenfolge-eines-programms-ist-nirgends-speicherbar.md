---
nr: G-560
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-30

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
G-558: Schritt plus `dependsOn`. `[cmd]` **Die Kette steht bei 315
Schritten**, Testdaten an Position 305, Proben 306 bis 315.

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