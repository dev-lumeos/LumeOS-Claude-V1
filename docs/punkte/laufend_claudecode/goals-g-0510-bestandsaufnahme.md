---
nr: G-510
typ: befund
modul: goals
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: E-91
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/goals/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-510 - Bestandsaufnahme Goals, gegen alle vier Quellen

## Toms Auftrag

Tom, 2026-09-08: *,,goals bestandesaufnahme und abgleich nach
allen quellen"*

## Was ich gemessen habe

### 1 Der Code

    17 Dateien
    phase-editor.tsx        44,3 KB
    mockup-referenz.tsx     40,3 KB
    tab-phase.tsx           36,7 KB
    modale.tsx              28,6 KB
    fehlende-kacheln.tsx    26,2 KB   <- groesstes der
                                         fuenf Module
    ansicht.tsx             21,0 KB
    physique-echt.tsx       17,1 KB
    tab-composition.tsx     13,2 KB
    tab-koerper.tsx         11,5 KB
    phase-echt.tsx          11,1 KB

`[cmd]` **106 Nennungen von *Attrappe* in 16 Dateien.**

### 2 Die Daten

    body_measurements            362
    body_circumferences           54
    goal_milestones               13
    user_goals                    11
    goal_phases                    5
    nutrition_targets              5
    phase_transition_responses     0
    progress_photos                0

`[read]` **362 Koerpermessungen liegen da** ? **das ist kein
leeres Modul.**

### 3 Spec und Mockup

`[cmd]` **`docs/spezifikation/00-QUELLEN.md:147`:**

    module-goals-pro.jsx      51 KB
    module-goals.jsx          50 KB
    module-goals-editor.jsx   35 KB
    docs/specs/Goals/         10 Dateien, 65 KB

`[read]` **DREI Mockups und zehn Specdateien** ? **kein Modul
hat nur eine Quelle, und hier sind es dreizehn.**

### 4 Das Vorgaengerrepo

`[cmd]` **45 Dateien mit *goal* im Namen**, darunter
`016_create_goals_tables.sql`, `017_nutrition_goals.sql`,
`GoalForm.tsx`, `GoalsList.tsx`, `Step4Goal.tsx`.

`[read]` **Struktur ja, Code nie** ? **und nachsehen, warum es
ersetzt wurde.**

## Der Auftrag

`[read]` **Dasselbe Vorgehen wie G-25 im Training: MESSEN,
dann anbinden, was anbindbar ist, und je Hindernis EINEN
Punkt.**

    A  je Kachel: welche Zahl fehlt, und liegt sie in
       der Datenbank?
    B  ueber oder unter der Trennlinie? Was darunter
       liegt, ist Entwurfsfassung und bleibt (E-68/E-70).
    C  was sagen die DREI Mockups -- widersprechen sie
       sich?
    D  was sagen die zehn Specdateien?
    E  was hat das Vorgaengerrepo geloest, das wir
       nicht haben?

`[read]` **Punkt C ist der, den G-475 und G-478 gekostet
haben** ? **das Mockup hatte damals die Antwort, und niemand
hat hineingesehen.**

## Und die Abhaengigkeit, die Tom nennt

Tom: *,,ein tag komplett erfassbar ? essen, training,
supplemente, check-in. IN ABHAENGIGKEIT MIT GOALS"*

`[cmd]` **`goals.nutrition_targets` hat 5 Zeilen** ? **MISS,
ob Nutrition sie heute liest.**

`[cmd]` **Und `goal_phases` (5)** ? **eine Phase entscheidet,
ob jemand aufbaut oder abnimmt. MISS, wer das weiss.**

## Abnahmebedingungen

    A1  je Kachel: Marke, fehlende Zahl, liegt sie
        in der Datenbank? TABELLE.
    A2  ueber/unter der Trennlinie getrennt gezaehlt.
    A3  die drei Mockups gelesen -- Widersprueche
        benannt.
    A4  die zehn Specdateien gelesen.
    A5  das Vorgaengerrepo: was fehlt uns? Struktur,
        kein Code.
    A6  angebunden, was anbindbar ist. Zahl
        vorher/nachher.
    A7  je Hindernis EIN Punkt, nicht gesammelt.
    A8  liest Nutrition die nutrition_targets? Gemessen.
    A9  wer kennt die goal_phase? Gemessen.
    A10 keine Marke ohne echte Zahl entfernt.
    A11 vier Module unveraendert.
    A12 apps/web 2006 oder mehr, apps/coach 65.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

