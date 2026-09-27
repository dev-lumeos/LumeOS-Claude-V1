---
nr: G-511
typ: befund
modul: goals
schwere: hoch
angelegt: 2026-09-26

braucht: []
kind_von: G-510
entscheidung: E-91

agent: codex
beauftragt: 2026-09-27
beruehrt:
  tabellen:
    - goals.goal_phases
    - goals.nutrition_targets
    - public.profiles
  dateien:
    - supabase/_pipeline/11_goals/110_goals_zielwerte.sql
    - apps/web/src/lib/nutrition/setup-karten.ts

zahlen:
  gemessen: 2026-09-26
  phasen_live: 5
  zielzeilen_live: 5
  funktionen_die_phase_und_kcal_nennen: 0
  konten_mit_widerspruch: 1
---

# G-511 - die Phase entscheidet nicht ueber die Kalorien

## Der Befund

`[read]` **Toms Rahmen E-91 verlangt den Tag *,,in Abhaengigkeit mit
Goals"*.** `[cmd]` **Gemessen am 2026-09-26: die Phase und das
Kalorienziel sind zwei getrennte Systeme, die sich nicht beruehren.**

`[cmd]` **`goals.berechne_zielwerte(UUID, DATE)` nimmt die Phase
nicht entgegen** — `110_goals_zielwerte.sql:225`. **Der Zuschlag
kommt aus `profiles.nutrition_goal`**, `:290-300`:

    lose_weight     -0,20
    maintain         0,00
    gain_muscle     +0,10
    recomposition    0,00
    performance     +0,10

`[cmd]` **Das Wort *phase* kommt im ganzen Funktionsrumpf
(`:225-365`) nicht vor.**

## Die Gegenprobe in der Datenbank

`[cmd]` **Keine einzige Funktion in `goals` oder `nutrition` nennt
`phase_type` UND (`kcal` ODER `nutrition_goal`):**

    select n.nspname||'.'||p.proname
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname in ('goals','nutrition','public')
      and p.prosrc ilike '%phase_type%'
      and (p.prosrc ilike '%kcal%' or p.prosrc ilike '%nutrition_goal%');

    -> 0 Zeilen

`[cmd]` **Drei Funktionen nennen `phase_type` ueberhaupt** —
`goals.phase_am`, `goals.goal_phase_start`,
`goals.phase_transition_recommendation`. **Keine davon rechnet
Kalorien.**

## Der Widerspruch steht live in den Daten

`[cmd]` **Gemessen 2026-09-26, Profil gegen Phase gegen Zielzeile:**

    Konto   Profil        aktive Phase   Zielzeile     kcal
    ...101  gain_muscle   lean_bulk      gain_muscle   2500,0
    ...102  performance   maintenance    performance   2200,0   <-
    ...103  lose_weight   (keine)        lose_weight   1800,0
    d15f…   gain_muscle   lean_bulk      gain_muscle   2500,0
    61e9…   gain_muscle   (keine)        gain_muscle   2977,8

`[read]` **Konto `...102` sagt an einer Stelle *halten* und an der
anderen *+10 %*.** `[cmd]` **Die Phase `maintenance` ist aktiv
(`actual_end_date IS NULL`), die Rechnung gibt `performance` und
schlaegt 10 % auf.**

`[cmd]` **Die Phasenzeile sagt es selbst:**

    variant     performance_placeholder
    parameters  {"note": "Phase unabhaengig vom konkreten Ziel",
                 "source": "GO-07 testdata"}

## Die Zahl liegt schon da und wird nicht gelesen

`[cmd]` **`goal_phases.parameters` traegt bei beiden `lean_bulk`-
Zeilen:**

    {"source": "GO-07 testdata", "calorie_surplus_kcal": 250}

`[cmd]` **250 liegt genau im Bereich, den das Vorgaengerrepo
vorschreibt** (`referenz/lumeos-2026/research/goals/data/
goal-phase-models.md:55`: `calorieSurplus 200…400`).

`[cmd]` **Gelesen wird der Wert nur zum ANZEIGEN** —
`phase-echt.tsx:209` stellt `parameters` als Textzeilen dar.
`[read]` **In die Rechnung geht er nicht ein.**

## Was die Spec dazu sagt

`[cmd]` **`docs/specs/Goals/DATABASE.md:221` nennt eine Spalte
`phase_calorie_modifier NUMERIC(5,2)` — *,,Deficit/Surplus
kcal/Tag"*.** `[cmd]` **Der Bezeichner kommt im ganzen Repo null Mal
vor.**

`[cmd]` **`PHASE_MODELS.md` nennt je Phase den Zuschlag**
(`:28` FAT_LOSS −400…−600, `:57` LEAN_BULK +200…+400,
`:77` MAINTENANCE „TDEE ± 100", `:149-151` RECOMP
Trainingstag +200 / Ruhetag −300).

`[read]` **Was in keiner der zehn Specdateien steht: WIE aus dem
Bereich eine Zahl wird.** `[cmd]` **`SCORING.md` hat keine Formel
`kcal = TDEE + phase_modifier`** — die Phase erscheint dort nur in
`calcWeeklyAdjustment` als NACHtraegliche Korrektur (`:205-232`).

## Warum das zaehlt

`[cmd]` **`lib/nutrition/setup-karten.ts:96` bietet eine Karte an:**
*,,Die Phase bestimmt das Tempo — Aufbau, Diaet oder Halten. Ohne sie
bleibt die Rate neutral."*

`[read]` **Das ist eine Zusage, die der Code nicht einloest.** Wer
der Karte folgt und eine Phase waehlt, aendert an seinen Kalorien
nichts.

`[read]` **Und es ist genau die Abhaengigkeit, die E-91 nennt:** ein
Tag ist erst dann *,,in Abhaengigkeit mit Goals"* erfasst, wenn die
Phase die Zielwerte bewegt.

## Nicht entschieden

`[read]` **Welches der beiden Felder gewinnt, ist Toms
Entscheidung** — `profiles.nutrition_goal` (5 Werte, multiplikativ)
oder `goal_phases.phase_type` (9 Werte, additiv in kcal).

`[read]` **Sie sind nicht ineinander ueberfuehrbar:** `lean_bulk`
und `performance` sind beide *+10 %*, aber `mini_cut`,
`reverse_diet`, `contest_prep` und `peak_week` haben im Profilfeld
gar keine Entsprechung.

## ENTSCHIEDEN, 2026-09-08, Orchestrator

**Die PHASE entscheidet ueber die Kalorien.
`profiles.nutrition_goal` wird abgeleitet, nicht gelesen.**

### Warum, gemessen

    goal_phases.phase_type   NEUN Werte
      fat_loss, lean_bulk, maintenance, recomp,
      contest_prep, reverse_diet, expert_bb_annual,
      mini_cut, peak_week

    profiles.nutrition_goal  VIER Werte
      gain_muscle 3 | (leer) 2 | lose_weight 1 |
      performance 1

`[cmd]` **`contest_prep`, `peak_week`, `mini_cut` und
`reverse_diet` haben KEIN Gegenstueck** ? **eine Umrechnung
ist also gar nicht moeglich.**

### Und der Unterschied ist nicht nur die Zahl

`[read]` **`nutrition_goal` sagt *ich will Muskeln
aufbauen* ? eine HALTUNG.**

`[read]` **`phase_type` sagt *ich bin in Woche 3 einer Peak
Week* ? ein ZUSTAND mit Anfang und Ende.**

`[cmd]` **Und `parameters` traegt bereits
`calorie_surplus_kcal: 250`** ? **die Zahl ist schon da, sie
wird nur nicht gerechnet.**

`[cmd]` **Dasselbe Muster wie bei den Plaenen (C-526): ein
AKTIVER Plan ist SSOT, nicht eine Vorliebe im Profil.**

### Was das fuer den Auftrag heisst

    N1  berechne_zielwerte nimmt die aktive Phase.
    N2  parameters.calorie_surplus_kcal wird
        GERECHNET, nicht nur angezeigt.
    N3  ohne aktive Phase: was gilt? Der Profilwert
        als Rueckfall -- oder eine Erklaerung?
        GEMESSEN und vorgelegt.
    N4  die Phasenzeile "Phase unabhaengig vom
        konkreten Ziel" faellt weg -- sie stimmt
        dann nicht mehr.
    N5  Gegenprobe: dasselbe Konto, Phase gewechselt,
        Kalorienziel folgt. Belegt.
    N6  die 17 Leser von nutrition_targets
        unveraendert.

## N3 entschieden, 2026-09-27, Orchestrator

### Seine Messung

    Profile                                   7
    aktive Phasen                             3
    ohne aktive Phase                         4
      davon noch nie eine Phase               4
      davon mit gueltiger Zielzeile           2
    historische Phasenluecken                 0
    Zielzeilen insgesamt                      5

### Und der zweischichtige Fall

> *,,`berechne_zielwerte` rechnet ohne Phase weiterhin aus
`profiles.nutrition_goal`. Bei einem phasenlosen Profil
entstehen so aktuell 3.090,3 kcal."*

> *,,`zielwerte_am` nimmt STETS die juengste Zielzeile. Ob am
Stichtag eine Phase existiert, prueft die Funktion nicht."*

`[read]` **Nur die Berechnung umzustellen genuegt also nicht ?
zwei phasenlose Profile saehen weiter alte Zielwerte.**

## Die Entscheidung

**1** ? **Seine Empfehlung wird uebernommen.**

> *,,Ohne aktive Phase KEIN errechnetes Kalorienziel, sondern
ein ausdrueckliches Hindernis `keine_aktive_phase`. Kein
Rueckfall auf `nutrition_goal` und kein stillschweigendes
Maintenance/TDEE-Ziel."*

`[read]` **Dieselbe Haltung wie C-500 (Vitamin E), C-512 (die
Portionen) und C-542 (die Abwesenheit): lieber eine Luecke, die
auffaellt, als eine Zahl, die stimmt, weil sie geraten wurde.**

`[cmd]` **Und sein Beleg ist stark: Spec und Mockup leiten die
Kalorien aus Phasenparametern ab, der Vorgaenger setzt eine
Phase VORAUS, und der einzige gegenteilige Text
(*,,ohne Phase bleibt die Rate neutral"*) wird vom heutigen
Code selbst nicht erfuellt ? er wendet +10 % an.**

**2** ? **Eine Zielzeile gehoert ihrer Phase und endet mit ihr.**

`[read]` **Das ist die Antwort auf seine zweite Frage. Eine
Zielzeile ohne Phase ist dasselbe wie eine Zahl ohne Quelle.**

`[cmd]` **`zielwerte_am` darf keine Zeile liefern, deren Phase
am Stichtag nicht laeuft** ? **sonst bleibt die Umstellung
wirkungslos, wie er gemessen hat.**

`[read]` **Und das deckt auch den Fall, den er nicht genannt
hat: eine Phase endet, eine neue beginnt spaeter ? dazwischen
gilt keine alte Zahl weiter.**

**3** ? **Verpflichtend nach dem Onboarding: JA, aber das baut
dieser Punkt nicht.**

`[cmd]` **Das Nutzer-Onboarding fehlt ganz (steht in
`docs/todo`, C-541 hat es beruehrt).** **Wenn es kommt, setzt
es die erste Phase ? wie es den Erfahrungsgrad setzt.**

`[read]` **Bis dahin ist `keine_aktive_phase` der ehrliche
Zustand, und die Oberflaeche aus G-513 fuehrt aus ihm heraus.**

## Ergaenzte Abnahmebedingungen

    N7  zielwerte_am liefert keine Zeile, deren Phase
        am Stichtag nicht laeuft. Gegenprobe mit einer
        beendeten Phase.
    N8  keine_aktive_phase ist ein ausdrueckliches
        Hindernis, kein NULL und keine 0.
    N9  die beiden phasenlosen Profile mit gueltiger
        Zielzeile: was passiert mit ihnen? GEMELDET,
        nicht stillschweigend geloescht.
    N10 die 17 Leser: welche brechen bei einem
        Hindernis? GEMELDET an Claude Code.

