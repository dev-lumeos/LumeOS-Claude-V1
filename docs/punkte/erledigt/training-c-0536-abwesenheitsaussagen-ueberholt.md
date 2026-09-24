---
nr: C-536
typ: fehler
modul: training
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-444
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: e1532050
beruehrt:
  dateien:
    - apps/web/src/app/v2/training/modale.tsx
    - docs/ssot/93-trainingssitzungen.md
zahlen:
  gemessen: 2026-09-23
---

# C-536 - drei Abwesenheitsaussagen sind ueberholt

## Befund

Alle drei Tabellen existieren seit C-461. Falsch waren nicht die Daten,
sondern die Aussagen, die ihr Fehlen weiter als Begrundung verwendeten.

| Ort | Alte Aussage | Gemessener Ist-Zustand | Nachfuehrung |
|---|---|---|---|
| `training/modale.tsx` | `training.routines` fehle | Tabelle existiert | Der deaktivierte Knopf nennt jetzt wahr: Der Schreibweg dieses Editors ist noch nicht angebunden. |
| `93-trainingssitzungen.md` | `routine_exercises` fehle | Tabelle existiert | C-461 als Nachtrag von Routinen und Uebungen dokumentiert. |
| `93-trainingssitzungen.md` | `routine_schedule_days` fehle | Tabelle existiert | C-461 als Nachtrag des Wochenbezugs dokumentiert. |

Der App-Eingriff wurde vorher gegen den Arbeitsbaum gemessen: `training/modale.tsx`
war unveraendert; G-488 aendert `nutrition/plans-echt.tsx`, nicht diese Datei.
Der Eingriff beschraenkt sich auf Kommentar und Sperrgrund; kein Funktionscode
wurde veraendert.

## Ergebnis

`node tools/abwesenheit-pruefen.mjs` ist gruen: 19 markierte Aussagen
gelten noch.

Die Gegenprobe ist gefuehrt: Eine temporaer in `docs/ssot/93-trainingssitzungen.md`
gesetzte erfundene Marke `@abwesend training.routines` liess den Waechter mit
genau diesem Ort und einer geendeten Abwesenheit fehlschlagen. Die Marke wurde
anschliessend wieder entfernt.

## Abnahmebedingungen

    A1  je Aussage: was behauptet sie, was gilt? -- Tabelle oben.
    A2  nachgefuehrt, nicht geloescht. -- erfuellt.
    A3  der Abwesenheitswaechter ist gruen. -- erfuellt.
    A4  Gegenprobe: eine erfundene Abwesenheit wird weiter rot. -- erfuellt.
    A5  App-Kollision gemessen: G-488 beruehrt eine andere Datei. -- erfuellt.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **Abwesenheitswaechter: exit 0, 19 markierte Aussagen
geprueft, alle gelten noch.**

`[read]` **Der Waechter war seit Tagen rot und blockierte
`pnpm gate`** ? **jetzt laeuft es darueber hinaus.**

### Nachgefuehrt, nicht geloescht

> *,,Der Routinen-Knopf sagt nun korrekt: Tabelle vorhanden,
aber sein Schreibweg fehlt."*

`[read]` **Die Aussage war ueberholt, nicht falsch** ? **die
Tabelle kam, der Weg nicht.**

`[cmd]` **Und eine Sabotage: eine erfundene Abwesenheit zu
`training.routines` machte den Waechter gezielt rot.**

`[cmd]` **Die Kollision geprueft:** *,,G-488 veraendert
`nutrition/plans-echt.tsx`, nicht `training/modale.tsx`."*

**Abgenommen.**

## ZURUECK - eine Probe faellt, 2026-09-08

`[cmd]` **Selbst gemessen:**

    not ok 1810 - G-278: die tragenden Gruende sind markiert
      "src/app/v2/training/modale.tsx: der Grund fuer
       training.routines traegt keine Marke"

`[read]` **Die Aussage wurde nachgefuehrt, aber die MARKE
fiel weg** ? **G-278 verlangt sie fuer jeden tragenden
Grund.**

`[cmd]` **apps/web: 1968 von 1969.**

### Und der Fehler ist meiner

`[read]` **Ich habe C-536 abgenommen, ohne die Proben zu
laufen** ? **nur den Abwesenheitswaechter.**

`[cmd]` **Claude Code hat es in seinem Bericht gemeldet:**
*,,Der Testfehlschlag (G-278-Marke) gehoert zu Codex
C-536."*

`[read]` **Und ich habe es als *,,seins"* abgetan, statt zu
messen.**

## Nacharbeit

    N1  die Marke steht wieder, die Aussage bleibt
        nachgefuehrt.
    N2  apps/web 1969 von 1969.
    N3  der Abwesenheitswaechter bleibt gruen.

