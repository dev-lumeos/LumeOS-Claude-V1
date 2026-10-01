---
nr: G-564
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-30
beauftragt: 2026-09-30
agent: claudecode

braucht: [G-538, G-559]
kind_von: G-559

quellen:
  - docs/punkte/erledigt/goals-g-0559-phase-am-deckelt-auf-eine-phase.md

erledigt: 2026-10-01
commit: 6ae14c93
beruehrt:
  funktionen:
    - goals.phase_am
    - goals.phase_eines_ziels_am
  dateien:
    - apps/web/src/lib/goals/lesen.ts
    - apps/web/src/app/v2/goals/ansicht.tsx
---

# `ladePhase` nimmt die erste fuer die einzige

    AUFTRAG FUER Claude Code - G-564: ladePhase auf Mehrzahl, bevor
                                     G-559 live geht
    Bereich: apps/web/src/lib/goals/
             apps/web/src/app/v2/goals/
    Fremd:   supabase/ gehoert Codex. phase_am und
             phase_eines_ziels_am sind SEINE Funktionen - lesen ja,
             aendern nein. Codex arbeitet gerade an G-563
             (berechne_zielwerte waehlt still eine Phase).
             docs/ gehoert dem Orchestrator, auch diese Punktdatei:
             der Bericht kommt als Antwort, nicht als Anhang hier.
    Stand:   2026-09-30

**Zuerst lesen, vollstaendig:** diese Datei und die Abnahme in
`docs/punkte/erledigt/goals-g-0559-phase-am-deckelt-auf-eine-phase.md`.

## Der Befund

`[cmd]` **Codex hat es beim Abgrenzen von G-559/A1 gemeldet, woertlich:**
`phase_am(user, stichtag)` liefert kuenftig **alle** am Tag gueltigen
Zielphasen, sortiert `gueltig_ab DESC, created_at DESC, id DESC`.
**`ladePhase` darf `data[0]` daher nicht mehr als die Nutzerphase
behandeln.**

`[cmd]` **Heute ist es zufaellig richtig:** in der laufenden Datenbank
traegt `phase_am` noch `LIMIT 1` (Position 933, selbst nachgemessen).
`[read]` **Mit dem Einspielen wird es falsch** — ohne Fehlermeldung,
ohne rote Probe. Der Reiter zeigte dann eine Phase, wo zwei gelten, und
welche, entscheidet die Sortierung.

`[read]` **Deshalb geht dieser Punkt VOR dem Einspielen von G-559.** Das
ist die Reihenfolge, nicht eine Empfehlung.

## Auftrag

**A1 — messen, wo `data[0]` steht.** Nicht nur in `ladePhase`: jeder
Aufrufer, der eine Phase erwartet, wo jetzt eine Menge kommt. **Sag, wie
du abgegrenzt hast** — und zaehle, statt zu schaetzen.

**A2 — je Stelle entscheiden, welche Bedeutung gilt.** Zwei Faelle, und
die Wahl folgt aus dem, was die Stelle anzeigt:

    zeigt sie EIN Ziel     ->  phase_eines_ziels_am(goal, stichtag)
    zeigt sie den Nutzer   ->  die Menge, und die Anzeige sagt, wie
                               viele es sind

**Keine Stelle bleibt bei `data[0]`.** Wenn eine Stelle wirklich eine
beliebige Phase zeigen darf, ist das zu begruenden, nicht zu belassen.

**A3 — der Waechter muss den Rueckfall verbieten.** Eine Probe, die rot
wird, wenn `data[0]` wieder als die Phase gelesen wird — **an der
Wirkung gemessen, nicht am Wort.** Zwei deiner Waechter waren heute
zuerst blind, weil sie Woerter suchten; dieselbe Falle liegt hier.

**A4 — gegen den neuen Seed pruefen.** Codex hat `test-user` zwei offene
Phasen an zwei Zielen gegeben (`testdaten-einspielen.ts:1149`). **Das ist
der Fall, der vorher nicht existierte** — und der einzige, der diesen
Punkt beweist. Bild je Zustand: eine Phase, zwei Phasen, keine.

**Nicht Teil:** `berechne_zielwerte` (G-563, bei Codex) und das
Einspielen von G-559 (bei Tom).

**Zu belegen:** Nachweise auf `test-user@lumeos.local` · Bilder je
Zustand · Sabotage je Waechter in beide Richtungen · `pnpm gate` gruen
mit Testzahl UND der Aussage, ob die neun Waechter im Vorcommit-Haken
gruen sind · nichts committen.

## Abnahme 2026-10-01 — `6ae14c93`

`[cmd]` **Die wichtigste Zahl zuerst: live ist unberuehrt.** Er hat den
Zustand ueber den Dialog hergestellt und wieder entfernt, und schreibt
„user_goals 0, goal_phases 0" — das gilt fuer `test-user`.
**Selbst nachgezaehlt:** tom.seed 5, dev 5, max.seed 1 = **11 Ziele**,
**5 Phasen**, eine offen, `test-user` 0. Nichts verloren.

`[cmd]` **`ladePhasen` und `ladeZielphase` haengen in `page.tsx` und
`lesen.ts`** (2 und 4 Treffer).

## Was diese Abnahme mitnimmt

`[read]` **A1 ist die Antwort, die ich sehen wollte: fuenf Stellen
gezaehlt, genau eine betroffen** — und die vier anderen mit Grund
freigesprochen (LIMIT im Rumpf, oder eine Kennung je Zeile).
**Die Zahl steht als Zusicherung, damit eine sechste auffaellt.** Das ist
eine Messung, die sich selbst bewacht.

`[read]` **`ladeZielphase` behaelt `data[0]`, und das ist richtig** —
`phase_eines_ziels_am` traegt ihr `LIMIT 1` mit Absicht. **Nicht jedes
`data[0]` ist ein Fehler; es ist einer, wenn die Quelle eine Menge
liefert.** Der Auftrag hatte das offen gelassen, der Bericht hat es
geschlossen.

`[cmd]` **Zwei Lesewege auf dieselbe Tatsache, zwei Zahlen auf einem
Schirm:** der Kopf sagte „2 Phasen laufen", darunter standen Beenden und
Wechseln fuer eine. **Am Bild gefunden, bei gruener Messung** — das ist
das vierte Mal in zwei Tagen. **Die Lehre gehoert in LAUFEND:** wo zwei
Lesewege auf eine Tatsache zeigen, widersprechen sie sich irgendwann, und
kein Test faellt dabei um.

`[read]` **Und eine falsch gewaehlte Kontrollprobe hat etwas Echtes
gefunden:** `Promise<Phase[] | null>` sollte harmlos sein, ging aber rot —
zu Recht, denn `null` statt `[]` zwaengt jeden Konsumenten zurueck in die
Form ,,eine oder keine". **Eine Probe, die unerwartet rot wird, ist eine
Messung, kein Fehlalarm** — und er hat sie als solche behandelt.

`[cmd]` **Nicht gegen die laufende Instanz geprueft**, mit Verweis auf
CLAUDE.md:355 und darauf, dass `supabase/` Codex gehoert. **Das ist die
Regel, und der Stellvertreterbeweis** — zwei Zeilen als Eingabe an der
Abbildungsstelle plus die gemessene Diskrepanz 1 gegen 2 am Schirm —
**traegt die Aussage.**

## Was offen bleibt

`[cmd]` **Die Zeitachse zeigt bis zum Einspielen von G-559 „1 Phasen"**,
weil `phase_am` live noch deckelt. **Das ist kein Mangel dieses Punkts,
sondern die Reihenfolge:** die Anwendung ist fertig, die Datenbank wartet.
Der Seed aus `testdaten-einspielen.ts:1149` ist im Repo und nicht live.
