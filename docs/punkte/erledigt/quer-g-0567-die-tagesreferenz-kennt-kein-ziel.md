---
nr: G-567
typ: entscheidung
modul: quer
schwere: hoch
angelegt: 2026-10-01
commit: 8c591000
erledigt: 2026-10-02
beauftragt: 2026-10-02
agent: codex

braucht: [G-538, G-563]
kind_von: G-563

quellen:
  - docs/punkte/erledigt/goals-g-0563-berechne-zielwerte-waehlt-selbst-eine-phase.md

beruehrt:
  funktionen:
    - nutrition.micronutrient_snapshot
    - nutrition.micronutrient_snapshot_with_supplements
    - goals.berechne_zielwerte
  tabellen: []
  dateien:
    - supabase/_pipeline/_ableitung/030_mikro-uebersicht.ts
    - supabase/_pipeline/daten/mikro-uebersicht.json
    - supabase/_pipeline/_validierung/quer-g567-goal-free-daily-reference.test.ts
---

# Die Tagesreferenz kennt kein Ziel

## Der Befund

`[cmd]` **Codex hat es beim Abgrenzen von G-563/A1 gemessen und gemeldet,
statt ein Ziel zu erfinden:** `nutrition.micronutrient_snapshot` ruft
`berechne_zielwerte` auf und **kennt keine `goal_id`.** Es meint eine
allgemeine Tagesreferenz, nicht die Zielwerte einer Phase.

`[read]` **Bei einem Ziel fiel das nicht auf** — die eine Phase war die
Tagesreferenz. **Seit G-538 laufen mehrere Ziele parallel**, und damit ist
die Frage offen, was ein Mikronährstoff-Tagesbezug bedeutet, wenn zwei
Phasen gleichzeitig gelten.

`[cmd]` **Bis zur Entscheidung wirft der Aufruf** bei Mehrdeutigkeit
sichtbar, statt still eine Phase zu nehmen. **Das ist richtig und darf so
bleiben** — aber es ist ein Hindernis, keine Antwort.

## Was zu entscheiden ist

`[read]` **Drei Formen, und sie unterscheiden sich fachlich, nicht
technisch:**

1. **Zielfrei rechnen** — die Referenz nimmt den TDEE ohne
   Phasenfaktor. Mikronährstoffe haengen am Energiebedarf und am
   Koerpergewicht, nicht an der Absicht einer Diaetphase. `[annahme]`
   **Das ist die fachlich naheliegende Form**, weil eine Vitaminempfehlung
   nicht davon abhaengt, ob jemand gerade aufbaut oder abbaut.
2. **Ein fuehrendes Ziel** — der Nutzer bestimmt, welches Ziel die
   Tagesreferenz stellt. Dann braucht es dafuer ein Feld.
3. **Je Ziel eine Referenz** — dann zeigt die Oberflaeche mehrere, und
   der Nutzer sieht, welche zu welchem Ziel gehoert.

`[read]` **Die erste Form ist die einzige, die ohne neue Eingabe
auskommt** — und die einzige, bei der ein Nutzer ohne Ziel ueberhaupt eine
Referenz bekommt. Das ist ein Argument, keine Messung.

## Warum es nicht nebenbei entschieden wird

`[read]` **Es beruehrt Nutrition, nicht Goals.** Ein Mikronährstoff-Ziel
ist eine Gesundheitsaussage; sie aus einer Diaetphase abzuleiten, waere
eine fachliche Entscheidung, die niemand getroffen hat. **Codex hat genau
deshalb nicht gewaehlt.**

## Nachtrag — es sind zwei Aufrufer, und keiner ist eine Tabelle

`[cmd]` **Der Orchestrator hat `micronutrient_snapshot` zuerst unter
`beruehrt.tabellen` eingetragen. Es ist eine FUNKTION.** Der Waechter hat
es gefangen. Gemessen in `pg_proc`:

    nutrition.micronutrient_snapshot
    nutrition.micronutrient_snapshot_with_supplements
    nutrition.micronutrient_below_threshold

`[read]` **Die zweite ist dieselbe Frage mit Ergaenzungsmitteln** — wer
die Entscheidung trifft, trifft sie fuer beide. Die dritte ist eine
Schwellenpruefung und haengt an dem, was die erste liefert.

`[cmd]` **Die einzige Tabelle in der Naehe heisst
`nutrition.micronutrient_overview_items`** — sie ist nicht gemeint.

`[read]` **Die Lehre stand schon in LAUFEND:** *„`beruehrt.tabellen` ist
eine Behauptung ueber die laufende Datenbank, keine Inhaltsangabe."* Ein
Name aus einem Bericht ist keine Messung.

---

## Entschieden — 2026-10-01, E-87

**Tom, 13:19:** *„ja das passt"* — zielfrei rechnen.

`[cmd]` **Recherchiert und belegt:** EFSA setzt Thiamin pro Energie
(PRI 0,1 mg/MJ = 0,4 mg/1000 kcal), Riboflavin absolut (PRI 1,6 mg/Tag).
**Der energieabhaengige Teil haengt am Energie-BEDARF, nicht am
Energie-ZIEL** — wer 2300 statt 3000 kcal isst, hat keinen niedrigeren
Thiaminbedarf.

`[read]` **Der Zielbezug faellt also HERAUS statt hinzuzukommen.**
Betrifft `micronutrient_snapshot`,
`micronutrient_snapshot_with_supplements` und die davon abhaengige
`micronutrient_below_threshold`. Was sich bei Defizit aendert, ist die
Luecke — und die wird sichtbar statt wegdefiniert.

---

## Auftrag — Kopf, 2026-10-02 (entschieden durch E-87)

    AUFTRAG FUER Codex - G-567: die Tagesreferenz rechnet zielfrei
    Bereich: supabase/_pipeline/_ableitung/030_mikro-uebersicht.ts
             supabase/_pipeline/_validierung/
    Fremd:   apps/ gehoert Claude Code (G-582 laeuft dort). docs/
             gehoert dem Orchestrator, auch diese Punktdatei.
    Stand:   2026-10-02

**Zuerst lesen, vollstaendig:** diese Datei und
`docs/entscheidungen/E-87-die-tagesreferenz-ist-zielfrei.md`.

### Die Entscheidung liegt vor — du baust, du waehlst nicht

`[cmd]` **E-87, Tom, 2026-10-01:** die Referenz rechnet **zielfrei** —
Alter, Geschlecht, Gewicht, TDEE, **kein Phasenfaktor, keine `goal_id`,
auch fuer Nutzer ohne Ziel.** Die Deckung geht gegen die tatsaechliche
Zufuhr; bei einem Defizit aendert sich die **Luecke**, nicht die
Referenz.

`[cmd]` **Belegt mit EFSA:** Thiamin PRI **0,1 mg/MJ** (energiebezogen,
weil das Verhaeltnis Bedarf zu Energiebedarf in allen Gruppen gleich
ist), Riboflavin PRI **1,6 mg/Tag** absolut, ohne Energiebezug. **Der
energieabhaengige Teil haengt am Energie-BEDARF, nicht am Energie-ZIEL.**

### Was heute dasteht, gemessen

`[cmd]` **`_ableitung/030_mikro-uebersicht.ts:161-162`:** die Funktion
`nutrition.micronutrient_snapshot(UUID, DATE)` verbindet

    LEFT JOIN LATERAL goals.zielwerte_am(p_user_id, p_entry_date)
    LEFT JOIN LATERAL goals.berechne_zielwerte(p_user_id, p_entry_date)

**beide nutzerweit, beide ohne `goal_id`** — genau die Mehrdeutigkeit,
die seit G-538 entstehen kann.

`[cmd]` **Betroffen ist EIN Naehrstoff von acht:**
`value_source = 'goals_alpha_linolenic_acid'` rechnet ALA gegen den
Goals-Zielwert (`:189`, `:193`, `:201`, `:205`, Luecke `missing_goal`).
Die uebrigen sieben sind Referenzwerte.

## Auftrag

**A1 — ALA auf dieselbe Grundlage stellen** wie die anderen sieben:
zielfrei, aus Bedarf statt Ziel. `[read]` **Melde, welche Groesse den
Referenzwert dann traegt** — und wenn es fuer ALA keine zielfreie Quelle
gibt, ist **das** der Befund, und `missing_goal` wird zu einer Luecke mit
ehrlichem Namen.

**A2 — die beiden `LATERAL`-Verbindungen fallen**, wenn A1 sie nicht
mehr braucht. `[cmd]` **Dann kann die Funktion auch nicht mehr an
mehreren aktiven Phasen scheitern** — das ist der eigentliche Gewinn.

**A3 — eine Probe, die beide Richtungen zaehlt:** ein Nutzer mit zwei
aktiven Zielphasen bekommt denselben Referenzwert wie einer mit keinem
Ziel. `[read]` **Mit wiederhergestelltem Zielbezug muss sie rot
werden.**

**Nicht Teil:** die Zufuhrseite, die Deckungsrechnung und die acht
kuratierten Naehrstoffe selbst. **Und die Oberflaeche nicht** —
`mikro-read.ts`, `mikro-kacheln.tsx` und `mikro-trend.tsx` liegen bei
Claude Code; wenn sich die Rueckgabe aendert, **melde es, aender es
nicht.**

**Zu belegen:** der geaenderte Schritt und seine Probe gegen eine
Wegwerf-Datenbank, mit Laufzeit · die Zahl der Aufrufe von
`berechne_zielwerte` in diesem Schritt vorher und nachher · Sabotage in
beide Richtungen · Wegwerf-Datenbank verworfen mit Zaehler · kein
`db push` · nichts committen.

`[read]` **Kein Vollauf von Hand** — den macht die Nacht (A-91).

---

## Abnahme — 2026-10-02, Commit `8c591000`

`[cmd]` **Selbst nachgesehen:** `goals.tdee_basis_am` steht in
`030_mikro-uebersicht.ts:167`, `berechne_zielwerte` und `zielwerte_am`
kommen in der Datei **nicht mehr vor** — 1 → 0 und 1 → 0. Die Referenz
rechnet `tdee * 0.005 / 9` (`:194`), `reference_kind` ist `'AI'`
(`:206`), die Lücke heisst `missing_profile` (`:214`). 5 Dateien,
+380/−46.

`[read]` **E-87 ist damit gebaut, wie entschieden:** die Referenz hängt
am Energie-**Bedarf**, nicht am Energie-**Ziel** — zwei aktive Zielphasen
und kein Ziel liefern dieselben 1,2 g ALA.

`[cmd]` **Den zweiten Weg hat erst die rote Gegenprobe sichtbar
gemacht:** `micronutrient_snapshot_with_supplements` und
`micronutrient_below_threshold` holten ihre Referenz unabhängig.
**Ohne diese Probe wäre nur die Grundfunktion zielfrei gewesen** — das
ist TDD, das etwas gefunden hat, nicht TDD als Formalie.

`[cmd]` **Gebaut, nicht live eingespielt.** Damit steht G-567 auf der
Einspielliste neben G-559, G-563 und G-514.

`[cmd]` **Mein Fehler in diesem Commit, zum dritten Mal derselbe:** die
Punktdatei zu C-295 ist mitgewandert, weil `git mv` sofort stagt und mein
`git add <pfade>` sie nicht wieder herausnimmt. **Inhaltlich eine
100-%-Umbenennung einer Datei, die mir gehört** — kein fremder
Arbeitsstand. **Die Gegenmassnahme ist keine Mechanik, sondern eine
Reihenfolge:** Punktdateien wandern erst NACH dem Code-Commit der Runde.
