---
nr: C-494
typ: feature
modul: goals
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/goals/daten.ts
zahlen:
  gemessen: 2026-09-08
  klassen: 13
---

# C-494 — die zehn Posen auf alle IFBB-Klassen aufschluesseln

## Toms Vorgabe

Tom, 2026-09-08:

> Goals & Body / pose session / 10 ifbb mandatory aufschluesseln
> in alle ifbb klassen

## Was heute dasteht

`[cmd]` **`apps/web/src/app/v2/goals/daten.ts:405`,
`POSE_SETS`:**

    mandatory  ['Front Double Biceps', 'Front Lat Spread',
                'Side Chest L', 'Side Chest R',
                'Rear Double Biceps', 'Rear Lat Spread',
                'Side Triceps L', 'Side Triceps R',
                'Abdominal & Thigh', 'Most Muscular']

    quarter    ['Front Relaxed', 'Right Side',
                'Back Relaxed', 'Left Side']

    detail     ['Delts', 'Biceps', 'Triceps', 'Chest',
                'Abs', 'Back', 'Quads', 'Hamstrings',
                'Calves']

`[cmd]` **Die Kachel heisst `IFBB Mandatory` und zeigt zehn
Posen.**

`[cmd]` **KEINE Tabelle** ? **alles steht im Code.**

## Der Befund: zehn sind nicht acht

`[cmd]` **`ifbbpro.com/rules`, Stand 2026-08-21,
Men's Open Bodybuilding:**

> *,,up to a maximum of 60 seconds to perform the following
EIGHT mandatory poses in the order shown."*

    Front double biceps
    Front lat spread
    Side chest
    Back double biceps
    Back lat spread
    Side triceps
    Abdominals and thighs
    Most muscular

`[read]` **LumeOS teilt `Side Chest` und `Side Triceps` in L
und R** ? **die Regel tut das nicht.**

`[read]` **Fuer eine Fotosession ist die Teilung sinnvoll** ?
**aber die Kachel behauptet, es seien die IFBB-Pflichtposen.**

## Die dreizehn Klassen, von der Quelle

`[cmd]` **`ifbbpro.com/rules` fuehrt DREIZEHN:**

    Men
      Open Bodybuilding      8 Pflichtposen
      212 Bodybuilding       8 (dieselben)
      Classic Physique       5
      Physique               nur front/back turns
      Wheelchair             8 (Abdominals statt
                               Abdominals and thighs)

    Women
      Bodybuilding           7 (ohne Most Muscular)
      Physique               5 (mit Vorgaben je Pose)
      Fitness                quarter turns + Routine
      Figure                 quarter turns
      Bikini                 front/back + Model Walk
      Wellness               quarter turns + Model Walk
      Fit Model              front/back poses

### Die Posen je Klasse, woertlich

**Men's Open und 212 (8):**

    Front double biceps | Front lat spread | Side chest
    Back double biceps | Back lat spread | Side triceps
    Abdominals and thighs | Most muscular

**Men's Classic Physique (5):**

    Front double biceps | Side chest | Back double biceps
    Abdominals and thighs
    Favorite classic pose (NO most muscular)

**Men's Wheelchair (8):**

    wie Open, aber "Abdominals" statt
    "Abdominals and thighs"

**Women's Bodybuilding (7):**

    wie Open OHNE Most muscular

**Women's Physique (5), mit Vorgaben:**

    Front double biceps, WITH OPEN HANDS
      (kein flat-footed full front, sondern ein
       front twisting pose)
    Side chest, WITH ARMS EXTENDED
    Back double biceps, WITH OPEN HANDS
    Side triceps, WITH LEG EXTENDED
    Abdominal and thighs

**Der Model Walk (Bikini, Wellness, Fit Model):**

    from a front pose, turn 180 degrees towards the rear
    walk to the rear of the stage and pause
    turn 180 degrees towards the front, walk back to the
    centerline

## Was zu bauen ist

**1** ? **Eine Tabelle statt einer Codeliste.**

`[cmd]` **Es gibt keine `pose`-Tabelle im Schema.**

`[read]` **Dreizehn Klassen mit je eigener Posenliste, eigener
Reihenfolge und eigenen Vorgaben** ? **das gehoert in die
Datenbank.**

    posing_divisions   Klasse, Geschlecht, Verband
    posing_poses       Pose, Name, Beschreibung
    division_poses     Klasse -> Pose, Reihenfolge, Vorgabe

`[read]` **Und die Sprachregel gilt** ? `name_de`, `name_en`,
`name_th`, **nur de und en gefuellt (C-488).**

**2** ? **Der Nutzer waehlt seine Klasse.**

`[read]` **Wer Classic Physique macht, braucht keine
`Most Muscular`.**

`[cmd]` **`goals.goal_phases` traegt schon eine Phase** ? **miss,
ob die Klasse dort hingehoert oder ins Profil.**

**3** ? **Die Zeitvorgaben mitnehmen.**

    Men's Open       60 s Pflichtposen, 3 min Kuer
    Classic Physique 60 s, 2 min Kuer
    Women's Physique 60 s, 2 min
    Bikini/Wellness  45 s Routine
    Fit Model        10 s front/back

`[read]` **Fuer eine Fotosession ist die Zeit die halbe
Uebung.**

## Was zu entscheiden ist

**a** ? **Bleiben `Side Chest L` und `R` getrennt?**

`[read]` **Die Regel kennt nur `Side chest`** ? **fuer Fotos
sind beide Seiten sinnvoll.**

`[read]` **Dann traegt die Pose ein Merkmal `beidseitig`** ?
**und die Kachel sagt, dass sie aufteilt.**

**b** ? **Auch NPC und andere Verbaende?**

`[cmd]` **NPC fuehrt zehn Divisionen, teils andere als IFBB
Pro** ? **`Fit Model` gibt es dort auch.**

`[read]` **Eine Spalte `verband` traegt es, wenn es kommt.**

## Die Quelle

    https://www.ifbbpro.com/rules/
    Stand 2026-08-21, dreizehn Reiter,
    je Klasse Posen in der vorgeschriebenen REIHENFOLGE

`[read]` **Die Reihenfolge ist Teil der Regel** ? **sie gehoert
in die Tabelle.**

