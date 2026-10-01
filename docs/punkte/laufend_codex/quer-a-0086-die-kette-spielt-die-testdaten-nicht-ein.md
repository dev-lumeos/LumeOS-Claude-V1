---
nr: A-86
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-01
agent: codex
beauftragt: 2026-10-01

braucht: []
kind_von: A-77

quellen:
  - docs/punkte/laufend_codex/quer-a-0077-werkzeugtests-liefen-nirgends.md

beruehrt:
  dateien:
    - supabase/_pipeline/kette.json
    - supabase/_pipeline/_testdaten/testdaten-einspielen.ts
---

# Die Kette spielt die Testdaten nicht ein

## Auftrag

    AUFTRAG FUER Codex - A-86: die Kette spielt die Testdaten nicht ein
    Bereich: supabase/_pipeline/kette.json
             supabase/_pipeline/_testdaten/
    Fremd:   apps/ und packages/ gehoeren Claude Code - er ist frei, aber
             nicht hier. docs/ gehoert dem Orchestrator, auch diese
             Punktdatei: der Bericht kommt als Antwort, nicht als Anhang
             hier.
    Stand:   2026-10-01

**Zuerst lesen, vollstaendig:** diese Datei und die Abnahme in
`docs/punkte/laufend_codex/quer-a-0077-werkzeugtests-liefen-nirgends.md`
— dort steht die Inventur, aus der dieser Punkt entstanden ist.

## Der Befund

`[cmd]` **Codex hat es bei A-77 gemessen:** `kette.json` ruft
`_testdaten/testdaten-einspielen.ts` **nicht** auf. Nach einem vollen
Kettenlauf steht:

    goals.user_goals             5
    goals.goal_phases            0
    nutrition.meals              0
    training.workout_sessions    0

`[read]` **Damit baut die Kette ein Schema ohne Bestand.** Jede Probe,
die eine Zeile braucht, ist dort nicht ausfuehrbar — und das ist der
Grund, warum die 114 Proben aus A-77 nicht einfach angehaengt werden
koennen. `[cmd]` **Betroffen sind unter anderem C-422, C-430, C-380,
C-392, C-397, C-413, C-501, C-493 und mehrere Goals-Proben.**

`[read]` **Das ist keine Produktregression, sondern eine fehlende
Schicht im Lauf** — und sie erklaert einen Teil der 46 roten Proben,
ohne dass an den Proben etwas falsch waere.

## Warum es vorher nicht auffiel

`[cmd]` **Die sechs Proben, die bisher in der Kette lagen, brauchen
keinen Bestand** — sie pruefen Struktur, Funktionssignaturen und
Katalogzeilen, und die legt die Kette selbst an. **Erst der erste
Stapel aus A-77 hat den Unterschied sichtbar gemacht.**

## Was zu tun ist

**A1 — messen, was die Kette heute anlegt und was nicht.** Je Schema die
Zeilenzahl nach einem vollen Lauf, gegen den Stand nach
`testdaten-einspielen.ts` gehalten. **Die Differenz ist die fehlende
Schicht.**

**A2 — entscheiden, WO die Testdaten im Lauf stehen.** Nach dem Schema,
vor den Proben. `[read]` **Und sagen, was das fuer die Laufzeit
bedeutet** — der Lauf steht bei 1.459,7 s, das Einspielen kommt dazu.

**A3 — pruefen, ob eine Probe den Bestand VERAENDERT.** `[cmd]` **G-420
haelt fest, dass Kettenlaeufe Testdaten zuruecksetzen.** Eine Probe, die
schreibt, macht die naechste unzuverlaessig. **Wer schreibt, raeumt auf,
oder er laeuft zuletzt.**

**Nicht Teil:** die 46 Zeugen (A-87) und die stillen Rueckfaelle auf
`postgres` (A-88).

**Zu belegen:** Zeilenzahlen vorher und nachher je Schema ·
Kettenschrittzahl und Laufzeit vorher und nachher · Wegwerf-Datenbank
verworfen mit Zaehler · kein `db push` · nichts committen.
