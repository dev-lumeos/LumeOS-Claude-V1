---
nr: G-557
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-30
beauftragt: 2026-09-30
agent: claudecode

braucht: [G-554]
kind_von: G-554

quellen:
  - apps/web/src/lib/goals/ziel-arten.ts
  - docs/spezifikation/10-plattform/design-system/theme-v1/module-goals.jsx

erledigt: 2026-09-30
commit: db2a7a21
beruehrt:
  tabellen:
    - goals.user_goals
  dateien:
    - apps/web/src/lib/goals/ziel-arten.ts
    - apps/web/src/lib/goals/ziel-regeln.ts
    - apps/web/src/lib/goals/schreiben.ts
    - apps/web/src/lib/goals/phasenziel-write.ts
    - apps/web/src/app/v2/goals/ziel-aktionen.ts
    - apps/web/src/components/shell/__tests__/v2-attrappen.test.ts

zahlen:
  gemessen: 2026-09-30
  treffer_zuordnungsdatei: 13
  treffer_schreibweg: 0
  knoepfe: 6
  unterscheidbar_nach_dem_speichern: 4
---

# Die Zuordnung der sechs Arten erreicht die Datenbank nicht

## Der Befund

`[cmd]` **G-554 hat die Zuordnung gebaut und richtig gebaut — nur
schreibt sie niemand.** Gemessen am 2026-09-30, beide Richtungen mit
demselben Aufruf:

    git grep -cE "subtype|unterart" -- apps/web/src/lib/goals/ziel-arten.ts
    -> 13

    git grep -cE "subtype|unterart" -- apps/web/src/lib/goals/schreiben.ts \
                                       apps/web/src/lib/goals/ziel-regeln.ts
    -> (keine Treffer)

`[cmd]` **`ZielNeu` fuehrt kein `subtype`**, `schreiben.ts` schreibt
keines, `phasenziel-write.ts` und `ziel-aktionen.ts` reichen keines
durch. `modale.tsx` nennt `subtype` nur im Kommentar.

`[read]` **Die Folge:** beim Speichern fallen die sechs Knoepfe wieder
auf die vier `goal_type`-Werte zusammen. `strength` und `performance`
werden ununterscheidbar, `habit` und `custom` ebenso. Genau die
Abweichung, die G-537 gemeldet und G-554 loesen sollte, steht nach dem
Speichern wieder da — nur diesmal unsichtbar, weil die Oberflaeche
sechs Knoepfe zeigt.

`[cmd]` **Der Bestand zeigt, wie es aussehen muss** (`goals.user_goals`,
2026-09-30, 11 Zeilen):

    body_composition | cut               | 2
    body_composition | gain_muscle       | 2
    lifestyle        | cardio_frequency  | 2
    performance      | strength          | 4
    performance      | training_capacity | 1

**Keine einzige Zeile traegt `subtype IS NULL`.** Ein Ziel, das ueber
den neuen Weg entsteht, waere die erste.

## Auftrag

**A1 — die Zuordnung durchreichen.** `unterart` aus `ZIELKNOEPFE` muss
bis in `goals.user_goals.subtype` kommen: `ZielNeu`, `schreiben.ts`,
`phasenziel-write.ts`, `ziel-aktionen.ts`. Zu belegen auf
`test-user@lumeos.local`: je Knopf ein Ziel anlegen, die sechs Zeilen
als Paar `(goal_type, subtype)` zurueckgelesen und gegen `ZIELKNOEPFE`
gestellt. **Gegenprobe:** mit entfernter Durchreichung muss die
Pruefung rot werden. Danach die Testzeilen wieder entfernen.

**A2 — `body_comp` traegt kein `null`.** Alle vier
`body_composition`-Zeilen im Bestand fuehren einen Untertyp (`cut`
oder `gain_muscle`), und `ziel-arten.ts:64` fuehrt genau diese zwei.
Die gewaehlte Strategie sagt die Richtung: `cut`-artige Strategien
ergeben `cut`, aufbauende `gain_muscle`. **Das ist keine Entscheidung,
sondern die Antwort der Daten** — ableiten, nicht erfinden, und die
Ableitung an einer Tabelle im Code festmachen. Wird keine Strategie
gewaehlt, bleibt `subtype` leer und die Karte sagt das.
`weight` und `custom` bleiben unveraendert Vorschlag (`unsicher: true`),
sie sind Toms Entscheidung.

**A3 — die falsche `[cmd]`-Zahl.** `ziel-arten.ts:116` sagt
`strength -> performance / strength  2 Zeilen im Seed`. Gemessen sind
**4**. Der Bericht an Tom sagte 4, der Code sagt 2 — und traegt `[cmd]`.
Alle `[cmd]`-Zahlen in dieser Datei einmal gegen die Datenbank stellen
und den Aufruf danebenschreiben, mit dem sie nachzaehlbar sind.

**A4 — der bedingte Waechter.** In `v2-attrappen.test.ts` haengt die
Forderung nach `berechnePace(` an
`if (/PACE_TEXT|data-ziel-pace/.test(karten))`. Wer die Markierung
umbenennt, schaltet die Pruefung stumm ab — dieselbe Blindheit, die an
den zwei eigenen Waechtern gefunden und dort behoben wurde. Unbedingt
messen, und in beide Richtungen belegen: mit entferntem
`berechnePace(`-Aufruf rot, mit eingebauter Urteilswendung rot.

## Nicht Teil dieses Auftrags

`strategie_code` in die Phase zu schreiben — das ist G-558 bei Codex.
Bis die Funktion den Parameter nimmt, bleibt `strategieOffen` sichtbar.

## Abnahme 2026-09-30 — `db2a7a21`

`[cmd]` **Die Umkehrung meiner eigenen Messung ist der Nachweis.** Beim
Anlegen des Punkts fand `git grep -cE "subtype|unterart"` im Schreibweg
**null** Treffer. Jetzt:

    apps/web/src/app/v2/goals/modale.tsx        4
    apps/web/src/lib/goals/schreiben.ts         1
    apps/web/src/lib/goals/ziel-regeln.ts       3

`[cmd]` **Live 11 Ziele** — die sechs Testzeilen sind wieder weg.
`ziel-arten.ts:139` sagt **4 Zeilen**, mit dem Zaehlbefehl daneben.
Zeile 1107 in `v2-attrappen.test.ts` misst `data-ziel-pace`
**unbedingt**; der `if`, dessen Bedingung aus der geprueften Datei kam,
ist weg.

## Was diese Abnahme mitnimmt

`[read]` **Der Agent hat die richtige Stelle geruegt.** Zwei seiner
Sabotagen bissen zuerst nicht, und er hat den Befund den **Proben**
zugeschrieben, nicht dem Bau: eine Ersetzung, die `TABELLE[null] ?? null`
nicht veraenderte, und eine, die von zwei Vorkommen nur das erste traf.
**Dieselbe Blindheit, die A4 an seinem Waechter ruegte, lag in seinen
Proben** — und er hat sie gemeldet statt sie stehen zu lassen.

`[cmd]` **A3 hat der Agent gegen sich selbst entschieden.** Sein
G-554-Bericht nannte 4, sein Kommentar 2 — und die Ursache benannt: es
stand kein Zaehlbefehl daneben. **Eine `[cmd]`-Zahl ohne ihren Befehl
ist eine Behauptung.**

`[cmd]` **Elf Stellen trugen die falsche Punktnummer** (G-558 statt
G-557) und wurden berichtigt. G-558 ist Codex' Punkt.

`[annahme]` **Eine Grenze wurde ueberschritten:** die Punktdatei in
`docs/punkte/` ist im Bereich des Orchestrators. Ohne Schaden, aber
`docs/` bleibt beim Orchestrator — sonst laufen zwei Schreiber auf eine
Datei.

## Was offen bleibt

`weight` und `custom` tragen weiter `unsicher: true` und warten auf Tom.
`strategie_code` ist mit G-558 in der Kette gebaut, aber **nicht live** —
bis zur Einspielung bleibt `strategieOffen` sichtbar, und das ist richtig.
