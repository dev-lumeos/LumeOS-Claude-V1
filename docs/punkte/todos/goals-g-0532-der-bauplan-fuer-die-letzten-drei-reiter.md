---
nr: G-532
typ: befund
modul: goals
schwere: hoch
angelegt: 2026-09-29

braucht: []
kind_von: null

quellen:
  - docs/ssot/116-goals-anbindung.md
  - docs/ssot/129-goals-prioritaeten.md
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen: []
  dateien:
    - docs/ssot/116-goals-anbindung.md
    - docs/ssot/129-goals-prioritaeten.md
    - apps/web/src/app/v2/goals/ansicht.tsx

zahlen:
  gemessen: 2026-09-29
  unternavigationen: 10
  blocker_urspruenglich: 6
  blocker_gefallen: 3
  blocker_offen: 3
---

# G-532 - der Bauplan fuer die letzten drei Goals-Reiter

## Wie dieser Punkt anfing, und warum das falsch war

`[read]` **Tom, 2026-09-29:** *,,du hast im blick dass die ui bisher
unbrauchbar ist fuer phase engine oder allgemeine alle subnavigationen
von goals noch weit weg von brauchbar sind"* — und danach: *,,wir haben
specs/ altes repo/ neues mockup design und unseren brainstorm, das ergibt
garantiert ein bild was wir brauchen."*

`[cmd]` **Die erste Fassung dieses Punktes zaehlte Dateien und schloss:
,,der Phase-engine-Reiter ist vollstaendig Attrappe — 17 Kacheln, 17
Marken in `tab-phase.tsx`."** **Das war falsch.**

`[cmd]` **`ansicht.tsx:296-340` zeigt, was der Reiter wirklich
rendert:** `PhaseEcht`, `PhaseBeginnen` (mit dem G-519-Ratenfeld),
`PhaseBeenden`, `PhaseVorschlag` — alles echt — dann
`FehlendePhaseKacheln` mit Marke, **dann** `ReferenzTrenner`, und erst
darunter `GoalsPhaseView`.

`[read]` **`tab-phase.tsx` IST die Mockup-Referenz** (G-365, E-68, nach
Toms Satz vom 2026-09-07: *,,nun sehe ich dass tonnenweise zeugs einfach
weg ist aus der ui"*). **Eine Referenzdatei, die auf jeder Kachel eine
Marke traegt, ist richtig, nicht kaputt.** Der Orchestrator hat die
Referenz fuer den Reiter gehalten — siebte Fehlmessung des Tages,
dieselbe Klasse wie die sechs davor.

`[read]` **Und die eigentliche Unterlassung:** es gibt seit dem
2026-08-18 eine Datei, die genau diese Frage beantwortet —
`docs/ssot/116-goals-anbindung.md`, Kachel fuer Kachel, mit Quelle. Der
Orchestrator wollte sie neu messen lassen, statt sie zu lesen.

## Der Stand, aus 116 und 129 gelesen und gegen heute gehalten

`[cmd]` **`116-goals-anbindung.md` (GO-16, 2026-08-18)** haelt die
Anbindung je Kachel und dazu die Tabelle ,,Nicht angebunden, mit Grund".
`[cmd]` **`129-goals-prioritaeten.md` (G-79, 2026-08-20)** haelt den
Reiterstand danach.

    Reiter            Blocker laut 116              Stand 2026-09-29
    ----------------  ----------------------------  ---------------------------
    Phase engine      Regeln zum Uebergang fehlen   G-520 baut sie, laeuft
    Cross-module      keine Tabelle fuer Modulwerte G-514 gebaut, NICHT live
    Timeline          achievement_date 0 von 2      echt seit G-79 (129)
    Adaptive TDEE     adaptive_tdee() ohne Historie goals.tdee_history live
      (Rest)                                        (G-524) - Kurve fehlt noch
    Physique ratios   Umfaenge ja, ZIELWERTE nein   OFFEN
    Pose sessions     nicht im Umfang               OFFEN, gewollt

`[read]` **Drei von sechs Blockern sind gefallen oder fallen gerade.**
Das Modul ist deutlich weiter, als die erste Fassung dieses Punktes
behauptet hat.

## Was jetzt wirklich fehlt - drei Sachen, nicht zehn

**1. Cross-module braucht das Einspielen, nicht den Bau.**
`[cmd]` `goals.goal_contributions` ist gebaut, geprueft, Kettenlauf gruen
(290 Schritte) — **und nicht live** (Codex, G-514, 2026-09-29).
`[read]` **Danach ist es ein Lesepfad plus eine Ansicht**, und die
Formeln liegen als geprueftes Bauteil in
`packages/scoring/src/beitrag.ts` (36/36, G-522 A3). **Das ist der
kuerzeste Weg zu einem echten Reiter, den es im Modul gibt.**

**2. Adaptive TDEE braucht die Kurve an die vorhandene Reihe.**
`[cmd]` `goals.tdee_history` ist live und traegt Rohwert, Vorgaengerwert,
geglaetteten Wert, `alpha`, `confidence`, `reliable` (G-524, alpha 0,3).
`[cmd]` **Was 116 als Blocker nennt — ,,liefert einen Stichtagswert,
keine Historie" — gilt nicht mehr.** Die Neun-Wochen-Kurve und der
Herleitungstext haben jetzt eine Quelle.

**3. Physique ratios braucht eine Entscheidung, keinen Bau.**
`[cmd]` 116: *,,Die Umfaenge laegen vor; die ZIELWERTE dazu nicht."*
`[read]` **Goldener Schnitt und Zielverhaeltnisse sind Sollwerte, die
jemand festlegen muss** — aus IFBB-Klassen, aus der Spec, oder als
unsere Festlegung mit `evidence_status`. **Das ist Toms Entscheidung, und
sie gehoert vor den Bau.** Dieselbe Lage wie G-521 A1: solange die Zahlen
keinen Beleg haben, wird kein Band eingetragen.

`[read]` **Pose sessions bleibt draussen** — ausdruecklich nicht im
Umfang, und das ist keine Luecke.

## Nachweiszeilen

**A1** — **`116-goals-anbindung.md` nachziehen, nicht ersetzen.** Stand
2026-08-18 gegen heute: Timeline ist echt (G-79), die Ratenspalte steht
(G-519), `tdee_history` lebt (G-524), `goal_contributions` ist gebaut.
**Die Tabelle ,,Nicht angebunden, mit Grund" ist die wichtigste Zeile im
Modul** — sie ist zu pflegen, nicht neu zu erheben.

**A2** — **Cross-module: einspielen, lesen, anzeigen.** Nach dem
Einspielen von G-514 der Lesepfad und die Ansicht, gegen den Vertrag aus
`packages/scoring/src/beitrag.ts`. **Kein `findBottleneck` gegen
erfundene Zahlen** — das ist G-522 A4 und wartet genau darauf.

**A3** — **Adaptive TDEE: die Kurve an `goals.tdee_history`.** Neun
Wochen, Herleitungstext, Wochenanpassung. `[cmd]` **`test-user` hat
keine Reihe** (0 Koerpermessungen, `insufficient_intake_days`) — der
Nachweis braucht einen Nutzer mit Reihe, und eine fehlende Reihe ist
kein Nullwert.

**A4** — **Physique ratios: die Zielwerte entscheiden.** Quelle nennen
oder als eigene Festlegung kennzeichnen. C-494 (,,die zehn Posen auf
alle IFBB-Klassen aufschluesseln") haengt daran mit dran.

**A5** — **Die Reihenfolge ist A2, A3, A4** — nach fallender Naehe zu
einer vorhandenen Quelle. `[read]` **Und A4 geht nicht vor Toms
Entscheidung.**

## Was dieser Punkt NICHT ist

`[read]` **Keine neue Messung.** Die Quellen liegen: `docs/specs/Goals/`
(10 Dateien, 65 KB), drei Mockups mit 136 KB, 15 Brainstorm-Dateien,
`referenz/lumeos-2026/` und vier SSOT-Berichte (94, 116, 129, 137).
**Was fehlte, war nicht Wissen, sondern dass jemand es zusammenlegt.**

`[read]` **Und kein Umbau der Referenzansicht.** `tab-phase.tsx` unter
dem Trenner bleibt, solange oberhalb etwas fehlt. **E-68 ist Toms
Entscheidung, nicht eine Altlast.**

## Geparkt auf Toms Anweisung - 2026-09-29, 09:33

`[read]` **Tom:** *,,physique oder pose interessiert mich noch nicht wenn
wir nicht mal in der lage sind grundlagen in der ui darzustellen sprich
bedienbar zu machen."*

`[cmd]` **A4 (Physique-Zielwerte) und alles zu Pose sessions sind damit
zurueckgestellt** — nicht verworfen, aber sie stehen hinter der
Bedienbarkeit. **C-494 (IFBB-Klassen und Pflichtposen) haengt mit dran
und ruht ebenfalls.**

`[read]` **Die Reihenfolge lautet jetzt: A2 (Cross-module nach dem
Einspielen), A3 (die TDEE-Kurve) — und vor beidem G-534, weil ein Reiter,
der Daten zeigt und nichts tun laesst, kein Reiter ist.**

`[read]` **Und die Lehre aus Toms Satz gilt ueber Goals hinaus:** eine
Kachel, die eine echte Quelle liest, ist nicht dasselbe wie eine
bedienbare Oberflaeche. **Der Orchestrator hat das eine gezaehlt und das
andere gemeldet.**
