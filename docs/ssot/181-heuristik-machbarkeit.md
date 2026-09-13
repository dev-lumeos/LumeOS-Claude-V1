# 181 — laesst sich die Heuristik anwenden? Gemessen

**2026-09-08.** Die Vorlage nennt Regeln, die aus Uebungsmerkmalen
CNS-Last und Dehnungsfaktor ableiten. **Frage: hat LumeOS die
Merkmale?**

## Die Antwort: nur teilweise

`[cmd]` **`training.exercises`, 1.416 Zeilen, 17 Spalten:**

    id, name, category, exercise_type, tracking_type,
    difficulty, equipment_id, instructions, tips,
    media_paths, sort_weight, is_active, source,
    created_at, updated_at, discipline, discipline_rule

### Was DA ist

`[cmd]` **`equipment_id` -> 58 Geraete:**

    None (Koerpergewicht)   527
    Dumbbell                317
    Barbell                 162
    Bands                    88
    Cable Pulley Machine     49
    Kettlebells              26
    EZ Bar                   17
    Smith Machine             8
    Leg Press Machine         6
    ... und 49 weitere

`[cmd]` **`category`, drei Werte:**

    Free Weights   546
    Bodyweight     529
    Resistance     341

`[cmd]` **`difficulty`** ? **und `instructions` als Freitext.**

### Was FEHLT

`[cmd]` **`exercise_type`: EIN Wert fuer alle 1.416** ?
`strength`.

`[read]` **Unbrauchbar.**

`[read]` **Und es fehlen die drei Merkmale, auf denen die
Heuristik steht:**

    mechanics          compound | isolation
    axiale Last        ja | nein
    Widerstandsprofil  Dehnung | konstant | Kontraktion

## Was sich trotzdem ableiten laesst

### CNS-Last: teilweise

`[read]` **Die Heuristik will:**

    axiale Last (Kniebeuge, Kreuzheben, Rudern)  1,5-1,8
    gefuehrt/Oberkoerper (Bank, Klimmzug)        1,2-1,3
    Isolation (Curl, Beinstrecker)               1,0

`[cmd]` **`Barbell` (162) + `Smith Machine` (8) trifft die erste
Gruppe teilweise** ? **aber Bizepscurl mit Langhantel ist keine
axiale Last.**

`[cmd]` **Maschinen (`Leg Press`, `Lat Pull Down`, `Hammer
Strength ...`) sind gefuehrt** ? **das ist ableitbar.**

`[read]` **Aber `compound` gegen `isolation` steht nirgends** ?
**und das ist die Hauptachse.**

### Dehnungsfaktor: NICHT ableitbar

`[read]` **Ob die Last in der Dehnung oder in der Kontraktion
liegt, ist eine Eigenschaft der BEWEGUNG.**

`[cmd]` **Beispiel aus der Vorlage: Romanian Deadlift 1,3-1,4,
Hip Thrust 1,0** ? **beide `Barbell`, beide `Free Weights`.**

`[read]` **Kein vorhandenes Merkmal trennt sie.**

## Was das heisst

`[read]` **Die Heuristik braucht ZUERST drei neue Spalten** ?
**und die muessen gefuellt werden.**

`[cmd]` **Und `exercise_muscles` hat 6.588 Zuordnungen, davon
3.331 auf Gruppen und 1.105 auf Wurzeln** ? **die Zuordnung ist
wichtiger als der Faktor.**

### Woher die drei Merkmale kommen koennten

**1** ? **wger** (Open Source, AGPL).

`[read]` **Fuehrt Uebungen mit Kategorie, Geraet und Muskeln** ?
**miss, ob es `mechanics` traegt.**

**2** ? **Der Uebungsname.**

`[cmd]` **`Romanian Deadlift`, `Incline Dumbbell Curl`,
`Hip Thrust`** ? **die Namen tragen die Information.**

`[read]` **Eine Liste von Schluesselwoertern ist keine Heuristik
aus Merkmalen, aber sie ist messbar und pruefbar.**

**3** ? **Die 1.416 einzeln.**

`[read]` **Nicht machbar.**

## Die Reihenfolge, die daraus folgt

    1  exercise_muscles auf die richtige Ebene
       (1.105 Wurzeln, 3.331 Gruppen)
       -> ohne das nuetzt kein Faktor

    2  der Faktor je Zuordnung
       belegte Zahlen wo es Studien gibt (ACE),
       Rueckfall 1,0/0,5 wo nicht

    3  mechanics: compound | isolation
       -> aus wger oder aus dem Namen

    4  CNS und Dehnung
       -> erst wenn 3 steht

`[read]` **Schritt 4 ist der letzte, nicht der erste.**

## Und die Erholungskurve

`[cmd]` **LumeOS rechnet heute einen Erholungs-GRAD:**

    base(hours) x volume_mod x sleep_mod
                x nutrition_mod x soreness_mod

`[cmd]` **Die Vorlage rechnet eine Erholungs-DAUER:**

    Basiszeit(Muskel) x RPE x Volumen x Dehnung
                      x CNS x Alter x Schlaf
    dann exponentieller Zerfall bis 100 %

`[read]` **Zwei Unterschiede, die zaehlen:**

**1** ? **Je Muskel eine eigene Basiszeit** (Bizeps 36 h,
Quadriceps 48 h, Erector spinae 60 h).

`[cmd]` **LumeOS hat EINE Kurve fuer alle.**

**2** ? **Der Startwert haengt vom Anteil ab:**

    acute_damage = load x (rpe/10) x (sets/4)

`[read]` **Ein Sekundaermuskel faellt nicht auf 0, sondern auf
60 %** ? **das ist das Overlap-Problem, mathematisch.**

`[read]` **Beides nebeneinander geht nicht** ? **eine
Entscheidung.**

