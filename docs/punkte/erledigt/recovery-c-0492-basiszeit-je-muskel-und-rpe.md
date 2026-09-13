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
erledigt: 2026-09-08
commit: 299be535
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

## Bericht

`recovery.muscle_recovery_profiles` fuehrt 105 Profile; 51 stehen auf
36 h, 52 auf 48 h und 2 auf 60 h (erector spinae und Lower Back). Die
vorgegebenen Gruppenzeiten haben keine gefundene belastbare Studie als
allgemeingueltige Muskeluhr: alle Profilwerte sind deshalb explizit
`evidence_class C`, `source_id blog_recovery_guidelines_c492`, mit diesem
Grund im Feld `note`. Es wurde keine Zahl als Studienwert ausgegeben.

`recovery.recovery_effort_factors` trennt den Failure-Faktor davon:
RIR 0 beziehungsweise nur bei fehlendem RIR RPE 10 multipliziert die
Basiszeit mit 1,37. `evidence_class B` macht sichtbar, dass die
Primaerliteratur langsamere Erholung nach Failure stuetzt, die konkrete
37-%-Zahl aber aus der in `docs/ssot/182` dokumentierten Sekundaerquelle
kommt. Die neue Rechnung bleibt eine Komponente; die bestehende Kurve wurde
nicht umgebaut.

Messung in `postgres`: 258/258 Saetze haben RPE, 258/258 RIR,
258/258 mindestens eines der beiden und 0 sind derzeit als Failure markiert.
Die Gegenprobe liefert nach 36 Stunden Biceps = 1,00, erector spinae = 0,60.

Struktur: `20260913002200_c492_muscle_recovery_profiles.sql`; Daten:
`492_muscle_recovery_profiles.sql`. Authenticated hat nur SELECT auf beide
Katalogtabellen, anon keinen Zugriff; der Test
`recovery-c492-muscle-recovery.test.ts` lief gruen auf `postgres`.

Sicherung vor dem Live-Einspielen:
`backup/data/20260913084507_c490_c492_vor_live.dump` (704.4 MB). Vollkette
auf `lumeos_c492_vollkette_final3`: 211 Schritte, `SCHEMA VOLLSTAENDIG`,
Exit 0. Ketten-, Datenlogik- und Sprachwaechter sowie Punktelauf sind gruen.

## Was nicht zu tun ist

**KEINE Basiszeit erfinden** ? **eine Blogzahl ist
`evidence_class C` und wird als solche eingetragen.**

**Die Kurve NICHT auf zwei Komponenten umbauen** ? **erst
messen, ob eine reicht.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    recovery.muscle_recovery_profiles   105 Zeilen
    36 h: 51   48 h: 52   60 h: 2
    Evidenzklasse   C fuer alle 105

`[cmd]` **Die zwei 60-Stunden-Faelle:** `Lower Back`,
`erector spinae`.

`[read]` **Die Basiszeiten sind alle Klasse C** ? **er hat
recherchiert und KEINE Studie gefunden, wie ich verlangt
hatte.**

`[cmd]` **Der Failure-Faktor 1,37 traegt Klasse B** ?
**Beardsley zitiert die Literatur, aber es ist keine
Primaerquelle.**

`[read]` **Drei Klassen im selben Punkt, je nach Beleglage** ?
**genau die Bauform, die C-466 vorgemacht hat.**

`[cmd]` **Gegenprobe: Bizeps nach 36 h = 1,00, Erector spinae
= 0,60.**

**Abgenommen.**
