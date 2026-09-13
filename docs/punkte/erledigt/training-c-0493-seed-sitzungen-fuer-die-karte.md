---
nr: C-493
typ: feature
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: [G-445]
kind_von: null
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: f612a20f
beruehrt:
  tabellen: [training.workout_sessions]
zahlen:
  gemessen: 2026-09-08
  sitzungen: 66
  uebungen: 6
---

# C-493 — Seed-Sitzungen, die die Karte fuellen

## Toms Vorgabe

Tom, 2026-09-08:

> wir brauchen seeddaten mit mehr uebungen und anderen
> belastungen, dass wir auch was ableiten koennen und sehen,
> dass es funktioniert. wir koennen ja dayswitcher oben nutzen
> und schauen, was sich aendert

`[read]` **Die Pruefung ist eingebaut: der Tageswechsler zeigt,
ob die Erholung ueber die Zeit stimmt.**

## Was heute dasteht

`[cmd]` **66 Sitzungen, 2026-05-21 bis 2026-11-11.**

`[cmd]` **Je Tag GENAU ZWEI Sitzungen, alle sechs Tage** ?
**11-11, 11-05, 10-30, 10-24, 10-18 ...**

`[read]` **Ein Muster, kein Trainingsplan.**

`[cmd]` **Und nur SECHS verschiedene Uebungen:**

    Barbell Bench Press                  26 Saetze
    Barbell bench press incline          20
    Barbell bent over row pronated grip  26
    band kneeling lat pulldown           20
    Barbell squat back POV               20
    Band Deadlift                        20

`[cmd]` **Sie treffen 11 Muskeln, davon haben 3 eine
Kartenflaeche.**

`[cmd]` **Je Nutzer: tom.seed 30, dev@lumeos.app 30,
test-user 6.**

`[cmd]` **Und rpe und rir sind in ALLEN 258 Saetzen gefuellt**
? **die Grundlage fuer den Failure-Faktor aus C-492 liegt
vor.**

## Was zu bauen ist

### Mehr Uebungen

`[read]` **Ein Plan, der den ganzen Koerper abdeckt.**

`[cmd]` **`training.exercises` hat 1.416** ? **waehle die, die
eine Kartenflaeche treffen.**

`[cmd]` **Miss zuerst:**

    select e.name, count(distinct k.code)
    from training.exercises e
    join training.exercise_muscles em on em.exercise_id=e.id
    join public.koerperflaechen k
      on k.muscle_group_id=em.muscle_group_id
    group by 1 order by 2 desc

`[read]` **Die obersten dreissig fuellen die Karte.**

### Verschiedene Belastungen

Tom: *,,mehr uebungen UND ANDEREN BELASTUNGEN"*

`[read]` **Nicht zwei Sitzungen alle sechs Tage** ? **ein Plan
mit:**

    unterschiedliche Abstaende  1, 2, 3, 7 Tage
    unterschiedliche Saetze     3 bis 20 je Muskel
    unterschiedliche rpe/rir    RIR 0 bis 5
    frische und alte Reize      heute, gestern, vor 10 Tagen

`[read]` **Damit die Karte ALLE DREI Farben zeigt** ? Ready,
Caution, Rest.

### Und die Tage muessen NEBENEINANDER liegen

`[cmd]` **Der Tageswechsler geht Tag fuer Tag.**

`[read]` **Wenn zwischen zwei Sitzungen sechs Tage liegen,
zeigt er fuenf leere.**

`[read]` **Die letzten vierzehn Tage brauchen Sitzungen an den
meisten Tagen** ? **sonst ist der Wechsler stumpf.**

## Was zu messen ist, nachher

    A  wie viele der 43 Flaechen tragen einen
       gerechneten Wert? (heute 3)
    B  zeigt die Karte alle drei Farben?
    C  aendert sich das Bild beim Tagwechsel?
       -> ein Muskel von Rest zu Caution zu Ready

## Was nicht zu tun ist

**KEINE Uebung erfinden** ? **1.416 stehen im Katalog.**

**Die bestehenden 66 Sitzungen NICHT loeschen** ? **ergaenzen,
oder messen, ob sie im Weg sind.**

`[cmd]` **G-420 hat gemessen, dass Kettenlaeufe Testdaten
zuruecksetzen** ? **die neuen Sitzungen gehoeren in den
Kettenschritt, nicht von Hand in die Datenbank.**

**Nur test-user@lumeos.local** ? **Laeufe auf dev
ueberschreiben Toms gespeicherte Einstellungen.**

## Abnahmebedingungen

    A1  wie viele Uebungen treffen eine Kartenflaeche?
        TABELLE, absteigend.
    A2  der neue Plan: Uebungen, Tage, Saetze, rpe/rir.
        Als Kettenschritt.
    A3  wie viele der 43 Flaechen tragen danach einen
        Wert? Vorher 3.
    A4  die Karte zeigt alle drei Farben. Foto.
    A5  der Tageswechsler zeigt eine Veraenderung.
        Drei Fotos: Tag 1, Tag 3, Tag 7.
    A6  nur test-user, dev und tom.seed unveraendert.
    A7  Sicherung, Vollkette, Punktelauf.

## Berichtigt 2026-09-08 — meine Behauptung war falsch

Codex: *,,061_rollen_admin.sql legt dev@lumeos.app NICHT an;
dort steht nur ein Kommentar dazu."*

`[cmd]` **Selbst nachgemessen:**

    061_rollen_admin.sql, Zeile 154 und 164:
      --    WHERE email = 'dev@lumeos.app';
    INSERT INTO auth.users:  NEIN

`[read]` **Zwei auskommentierte Zeilen** ? **ich habe
`git grep -l` gelesen und daraus geschlossen, dass der Schritt
den Nutzer anlegt.**

`[read]` **Dieselbe Falle wie bei `vollstaendigkeit.mjs`:
Treffer gezaehlt statt Sachen gemessen.**

## Und der zweite Befund ist schwerer

`[cmd]` **`eigenes-konto-fuellen.sql:115`:**

    DELETE FROM training.workout_sessions
    WHERE user_id = :'ziel'::uuid;

`[read]` **Der Testdatenpfad LOESCHT alle Trainingssitzungen von
`dev`, bevor er sie neu schreibt.**

`[read]` **Wer davor schreibt, verliert seine Daten** ? **das
ist die Reihenfolge, die zaehlt.**

`[cmd]` **Und `eigenes-konto-fuellen.sql` ist KEIN nummerierter
Kettenschritt** ? **es liegt unter `_testdaten/`.**

## Was das heisst

`[read]` **C-493 gehoert NACH `eigenes-konto-fuellen.sql`** ?
**nicht in die nummerierte Kette.**

`[cmd]` **Miss, wie `testdaten-einspielen.ts` seine Schritte
ordnet** ? **`testdaten-register.json` hat 24 Eintraege.**

`[read]` **Dort gehoert C-493 hin, als weiterer Eintrag.**

## Die Abnahmebedingung, berichtigt

`[read]` **NICHT: *,,beim Frischaufbau der Kette entstehen die
Sitzungen"*** ? **das kann nicht gehen, der Nutzer existiert
dort nicht.**

`[read]` **SONDERN: nach `testdaten-einspielen.ts` stehen sie
da, und ein zweiter Lauf loescht sie nicht.**

`[cmd]` **G-420 hat gemessen, dass Kettenlaeufe Testdaten
zuruecksetzen** ? **das gilt hier doppelt.**

## Bericht — 2026-09-13

`testdaten-register.json` ist Szenarioregister, kein Ausfuehrungsplan;
`testdaten-einspielen.ts` ruft `eigenes-konto-fuellen.sql` nicht auf.
C-493 liegt deshalb als idempotenter Folgeschritt unter `_testdaten/`,
nach `testdaten-einspielen.ts` und `eigenes-konto-fuellen.sql`, und nicht
mehr in `kette.json`.

**A1.** Top-Treffer: `Gym Rowing Machine Normal Speed` (6); `Alternate
superman`, `Alternating Superman`, `around the world superman hold`,
`Barbell seated good morning`, `Chair frog feet elevated glute bridge
bodyweight`, `Sumo squat over shoulder Resistance band`, `Superman pulls
Resistance band`, `Walkout` (je 5); die naechsten 21 je 4.

**A2/A6.** 10 Sitzungen, 03.--13.09., 21 Sitzungsuebungen/17
Katalognamen, 132 Arbeitssaetze, 3--20 Saetze, RIR 0--5, RPE 6--10. Nur
`dev@lumeos.app`: 40 Sitzungen (10 C-493); `tom.seed` 30 und `test-user`
6 unveraendert. Gemessen sind 21 statt 23 Uebungszeilen; keine zwei
Uebungen erfunden.

**A3/A4.** 19 Karten-Codes direkt getroffen. Dev-Schirm: 45/105 Muskeln
aus `workout_sets`, 19 Caution, 10 Rest, 6 Ready, 0 Seitenfehler; Foto
`backup/x-c493-dev-tag-13.png`.

**A5 rot, nicht gebaut:** Der Tageswechsler zeigt 12. und 8. September
(`backup/x-c493-dev-tag-12.png`, `backup/x-c493-dev-tag-8.png`), aber die
Bizeps-Farbe bleibt `oklch(0.5 0.16 22)`. Der Tag erreicht den
Karten-Lesepfad nicht; `apps/` blieb unangetastet.

**A7.** Sicherung `backup/data/20260913142000_c493_vor_seed.dump`.
Vollkette ohne Testdaten: 212 Schritte, `KETTE OK: 912.9s` in
`lumeos_c493_final`. Validator live und auf Wegwerfkopie gruen; zweiter
C-493-Lauf erneut 10/132 ohne fremde Konten. Ketten-, Datenlogik- und
Encoding-Waechter gruen.

Der allgemeine Testdatenlauf ist unabhaengig von C-493 rot: zuerst
`shopping_lists_source_target_check`, auf bereinigter Wegwerfkopie danach
ein vorhandenes Duplikat in `recovery.score_contributions`. Beide Laeufe
rollen transaktional zurueck; diese Fremdtabellen blieben unangetastet.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    dev@lumeos.app        40 Sitzungen (30 + 10)
    test-user              6, unveraendert
    tom.seed              30, unveraendert
    Saetze               390, RIR 0-5, RPE 6.0-10.0
    Register             Eintrag 24, nach eigenes-konto-fuellen

`[cmd]` **Selbst gemessen: alle fuenf.**

### Der Schirmnachweis traegt

`[cmd]` **`x-c493-dev-tag-12.png` angesehen:**

    45 von 105 Muskeln aus workout_sets gerechnet
    ARMS  O 39%  schwaechstes: Biceps 14%
                 10% aus 3 Kindern verdichtet

    Biceps          14%   8 h - 20 Saetze     rot
    erector spinae  10%   8 h - 33 Saetze     rot
    Mid Back        70%  56 h -  8 Saetze     gelb
    Brachialis      97%   unbelastet          gruen

`[read]` **Vorher: 17 gerechnete Werte, alle 100 %.**
`[read]` **Jetzt: 45 gerechnete, drei Farben, verschiedene
Zahlen.**

`[cmd]` **Und `Karten-Seed` steht als Herkunft je Zeile.**

### G-448 ist damit beantwortet

`[cmd]` **Schnitt und Engpass zeigen VERSCHIEDENE Werte:**
`ARMS O 39%`, **schwaechstes `Biceps 14%`.**

`[read]` **Der Punkt wartete auf C-493** ? **die Rechnung
stimmt, das Seed war zu alt.**

### Der Ablageort, nach zwei Fehlversuchen

`[read]` **Mein erster Auftrag sagte *,,nur test-user"* UND
*,,in den Kettenschritt"*** ? **beides zusammen geht nicht.**

`[read]` **Mein zweiter sagte, `061_rollen_admin.sql` lege `dev`
an** ? **zwei auskommentierte Zeilen.**

`[cmd]` **Er hat beide Male gemessen und gestoppt, statt einen
Nutzer heimlich anzulegen.**

`[cmd]` **Und der zweite Lauf bleibt bei genau 10 Sitzungen** ?
**idempotent, wie verlangt.**

### Zwei Befunde, bewusst nicht gebaut

**1** ? *,,Der Tageswechsler aendert das Datum, aber nicht die
Kartenberechnung."*

`[read]` **A5 ist damit HALB** ? **die Bilder zeigen
verschiedene Tage, die Karte rechnet sie nicht.**

`[cmd]` **Als G-450.**

**2** ? *,,Der allgemeine Testdatenlauf scheitert schon VOR
C-493 transaktional an bestehenden Fremdbefunden."*

`[cmd]` **`shopping_lists_source_target_check`, danach
`recovery.score_contributions`-Duplikat.**

`[cmd]` **Als G-451.**

**Abgenommen, mit halbem A5.**
