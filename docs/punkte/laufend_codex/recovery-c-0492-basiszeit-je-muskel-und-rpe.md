---
nr: C-492
typ: feature
modul: recovery
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [recovery.scores]
zahlen:
  gemessen: 2026-09-08
---

# C-492 — Basiszeit je Muskel und der RPE-Faktor

## Der Befund

`[cmd]` **LumeOS hat EINE Erholungskurve fuer alle Muskeln:**

    base(hours) x volume_mod x sleep_mod
                x nutrition_mod x soreness_mod

`[read]` **Ein Bizeps erholt sich schneller als ein
Quadriceps** ? **die Kurve weiss es nicht.**

## Was belegt ist

`[cmd]` **`docs/ssot/182`, Beardsley zitiert die Literatur:**
**Training bis zum Versagen braucht 37 % mehr Erholungszeit als
RIR 1-2.**

`[cmd]` **`training.workout_sets` hat `rpe` und `rir`** ?
**die Daten liegen vor.**

`[read]` **Und Beardsley trennt ZWEI Ermuedungsarten:**

    Kalziumionen   langanhaltend, TAGE
                   aus Aktivierung UND Dehnung
    Metaboliten    kurz, klingt schnell ab

`[read]` **Das begruendet eine Zwei-Komponenten-Kurve** ?
**aber erst messen, ob eine reicht.**

## Was zu PRUEFEN ist

`[read]` **Die Basiszeiten aus der Vorlage:**

    Bizeps, Trizeps, Waden, Delt    36 h
    Quadriceps, Hamstrings,
      Brust, Ruecken                48 h
    Erector spinae                  60 h

`[cmd]` **Die Vorlage nennt als Quellen Blogs** ?
`gym-mikolo`, `fitness19`, `jefit`.

`[read]` **RECHERCHIEREN, ob es eine Studie gibt** ? **und wenn
nicht: melden und mit `evidence_class C` eintragen.**

`[cmd]` **Suchbegriffe:** *muscle size recovery time strength
training*, *time course of recovery after resistance exercise*,
*DOMS duration muscle group*.

## Was zu bauen ist

`[read]` **Eine Basiszeit je Muskel, in `muscle_groups` oder
einer eigenen Tabelle.**

    base_recovery_hours   numeric
    source_id             woher
    evidence_class        A | B | C

`[read]` **Und der RPE-Faktor in die Rechnung:**

    RIR 0 / RPE 10   x 1,37
    RIR 1-2          x 1,0

`[cmd]` **Miss, wie viele der 258 Saetze ueberhaupt `rpe` oder
`rir` tragen.**

## Abnahmebedingungen

    A1  Basiszeit je Muskel, mit Quelle je Zahl.
        TABELLE.
    A2  wo KEINE Studie gefunden wurde: gemeldet,
        evidence_class C.
    A3  der RPE-Faktor in der Rechnung, mit Quelle.
    A4  wie viele Saetze tragen rpe/rir? Gemessen.
    A5  Gegenprobe: ein Muskel mit 36 h erholt sich
        schneller als einer mit 60 h. Gerechnet.
    A6  Sicherung, Vollkette, Punktelauf.

## Was nicht zu tun ist

**KEINE Basiszeit erfinden** ? **eine Blogzahl ist
`evidence_class C` und wird als solche eingetragen.**

**Die Kurve NICHT auf zwei Komponenten umbauen** ? **erst
messen, ob eine reicht.**

