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
