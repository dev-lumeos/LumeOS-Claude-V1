---
nr: C-463
typ: feature
modul: goals
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [goals.user_goals]
zahlen:
  gemessen: 2026-09-08
  fehlend: 3
---

# C-463 — drei Modale ohne Ziel

## Befund

`[cmd]` **`goals` hat sieben Tabellen:**

    user_goals               11
    body_measurements       362
    body_circumferences
    goal_milestones
    goal_phases
    nutrition_targets
    phase_transition_responses  0

`[cmd]` **Es FEHLEN:**

    progress_photos
    phase_transitions
    body_weight_log

`[cmd]` **Und gebaut sind:** `LogPhotoModal`, `LogWeightModal`,
`LogMeasureModal`.

`[read]` **`LogPhotoModal` schreibt in nichts.**

## Und vier Reiter fehlen

`[cmd]` **`tools/vollstaendigkeit.mjs`:** `CompTab`
(+`BodyFatScale`), `GoalsTab` (+`GoalCard`), `MeasureTab`,
`MetricsTab`.

`[read]` **Vier von acht Reitern.** `[read]` **Das ist ein
UI-Auftrag, hier geht es um die Tabellen.**

## Was zu lesen ist

`[cmd]` **`docs/specs/Goals/`** ? **zuerst.**

`[cmd]` **Der Draft:** `module-goals.jsx` **50,7 KB,**
`module-goals-pro.jsx` **52,5,** `module-goals-editor.jsx`
**35,7.**

## Was gebaut wird

**1** ? `progress_photos`.

`[read]` **Ein Foto ist ein sensibles Datum** ? **wie
`medical-originals` (C-429).**

`[cmd]` **Miss, ob ein eigener Bucket noetig ist** ? **oder ob
`goals` in den bestehenden schreibt.**

`[read]` **Und: Vorne, seitlich, hinten?** **Die Vorlage zeigt
`GoalsPosesView`** ? **miss, welche Posen sie nennt.**

**2** ? `phase_transitions`.

`[cmd]` **`goal_phases` und `phase_transition_responses` gibt es
schon** ? **`phase_transition_responses` ist LEER.**

`[read]` **Miss, was fehlt** ? **vielleicht ist es nur der
Uebergang selbst.**

`[cmd]` **`GoalsPhaseView` zeigt vier Kacheln.**

**3** ? `body_weight_log`.

`[cmd]` **`body_measurements` hat 362 Zeilen** ? **miss, ob das
Gewicht dort schon steht.**

`[read]` **Wenn ja: keine neue Tabelle** ? **melden.**

## Abnahmebedingungen

    A1  je der drei: braucht es sie wirklich? Gemessen
        gegen die bestehenden sieben Tabellen.
    A2  die noetigen gebaut. Je Tabelle: Spalten,
        Fremdschluessel, Indizes, Fundstelle.
    A3  progress_photos: Bucket oder bestehender?
        Entschieden und begruendet.
    A4  je Tabelle eine Zeile geschrieben. ROLLBACK.
    A5  RLS je Tabelle, beide Richtungen.
    A6  die 11 Ziele und 362 Messungen bleiben gueltig.
    A7  Sicherung, Vollkette, Punktelauf.

## Was NICHT zu bauen ist

`[read]` **Keine Oberflaeche.**

`[read]` **Und keine Tabelle, die es unter anderem Namen schon
gibt** ? **das ist heute dreimal passiert.**

## Berichtigt 2026-09-08 — nach dem C-462-Stopp

`[cmd]` **C-462 wurde als ueberholt geschlossen:** **drei der vier
Tabellen gab es unter anderem Namen, zwei Messungen liegen in
`checkins`.**

`[read]` **Dasselbe gilt hier moeglicherweise.**

### Zuerst messen, ob es sie schon gibt

`[cmd]` **`goals` hat sieben Tabellen:**

    body_circumferences, body_measurements,
    goal_milestones, goal_phases, nutrition_targets,
    phase_transition_responses, user_goals

`[read]` **Miss JE SPALTE, nicht je Tabellenname:**

    progress_photos    -> gibt es eine Fotospalte in
                          body_measurements?
                          Oder einen Bucket?
    phase_transitions  -> goal_phases hat vermutlich
                          start und ende
                          phase_transition_responses ist LEER
                          -- messen, was sie erwartet
    body_weight_log    -> body_measurements hat 362 Zeilen
                          -- steht das Gewicht dort?

`[read]` **Wenn eine schon da ist: melden, nicht bauen.**

`[read]` **Wenn nur FELDER fehlen: die Felder, nicht die
Tabelle.**
