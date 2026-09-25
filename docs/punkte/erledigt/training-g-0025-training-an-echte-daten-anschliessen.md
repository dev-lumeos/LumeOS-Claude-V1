---
nr: G-25
typ: befund
modul: training
schwere: mittel
angelegt: 2026-08-17
braucht: []
kind_von: G-16
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 8c27dfd9
beruehrt:
  dateien:
    - apps/web/src/app/v2/training/ansicht.tsx
zahlen: null
---

# G-25 - Training an echte Daten anschliessen

## Befund

(neu 2026-08-17).
  Folgt auf C-66.

  `[cmd]` `/v2/training` steht mit **38 Kacheln, alle Attrappe** — der
  Grund war, dass es keine Sitzungen gab. **Seit `106` gibt es sie.**

  `[cmd]` Live liegen 9 Sitzungen, 18 Uebungen, 60 Saetze; dazu die
  Stammdaten mit 1.416 Uebungen, 58 Geraeten und 6.624
  Muskelzuordnungen.

  **Der Tab „Exercises" ist der naechste Schritt.** `[read]` Aus dem
  G-16-Bericht: *vier von sechs Spalten sind sofort da; `e1RM` und
  `Best set` bleiben `—`, weil sie Saetze brauchen.* **Jetzt sind sie
  da.**

  `[cmd]` `e1RM` braucht eine Formel — `[read]` das Vorgaengerrepo hat
  `OneRepMaxCalculator.tsx` mit **42 Fundstellen zu Epley und Brzycki**.
  **Dort nachsehen, bevor jemand rechnet.**

  **Angebunden heisst: Marke weg.** Alles andere behaelt sie.

## Nachgemessen, 2026-09-08 ? der Punkt ist halb ueberholt

`[cmd]` **Die Daten sind seither gewachsen:**

                      17.08.   08.09.
    Sitzungen              9       76
    Saetze                60      396
    Uebungen           1.416    1.416
    Muskelzuordnungen  6.624    6.726

`[cmd]` **Und der Reiter existiert: `tab-uebungen.tsx`,
9,7 KB.**

`[cmd]` **`e1RM` steht in sechs Dateien**, darunter
`training/ansicht.tsx` und `dashboard-echt.tsx`.

`[read]` **Der Satz *,,38 Kacheln, alle Attrappe"* stimmt so
nicht mehr** ? **aber es sind noch 81 Marken in 9 Dateien.**

    mockup-referenz.tsx     23
    ansicht.tsx             12
    fehlende-kacheln.tsx    12
    modale.tsx               1
    page.tsx                 1

## Der Auftrag, neu gefasst

`[read]` **MESSEN, dann anbinden, was anbindbar ist** ?
**nicht alles auf einmal.**

    A  welche Kacheln tragen heute eine Marke?
       Je Kachel: welche Zahl fehlt, und liegt sie in
       der Datenbank?
    B  welche lassen sich SOFORT anbinden?
       76 Sitzungen, 396 Saetze, 1.416 Uebungen,
       6.726 Muskelzuordnungen sind da.
    C  welche brauchen etwas, das fehlt? GEMELDET,
       je Kachel EIN Punkt -- nicht gesammelt.
    D  e1RM: was deckt es heute? G-68 sagt 6 von 1.416.
       MISS es, bevor du es anfasst.

`[cmd]` **Das Vorgaengerrepo hat `OneRepMaxCalculator.tsx` mit
42 Fundstellen zu Epley und Brzycki** ? **Struktur ja, Code
nie.**

## Was NICHT zu tun ist

`[read]` **Keine Marke ohne echte Zahl entfernen** ? **eine
Attrappe, die aussieht wie ein Wert, ist schlimmer als eine,
die sich als solche zeigt.**

`[read]` **Die Entwurfsreferenz bleibt** ? **E-68 und E-70.**

`[cmd]` **Und E-89 gilt auch hier: Wissen offen, Protokoll
gesperrt.** **MISS, ob im Trainingsmodul etwas hinter eine
Pruefung gehoert.**

## Abnahmebedingungen

    A1  je Kachel: Marke, fehlende Zahl, liegt sie in
        der Datenbank? TABELLE.
    A2  angebunden, was anbindbar ist -- mit Zahl
        vorher/nachher.
    A3  je nicht anbindbare Kachel EIN Punkt,
        nicht gesammelt.
    A4  keine Marke ohne echte Zahl entfernt. Belegt.
    A5  e1RM: was deckt es heute, was danach? Zahl.
    A6  Fotos: vorher und nachher, derselbe Reiter.
    A7  die Entwurfsreferenz unveraendert.
    A8  vier Module unveraendert.
    A9  apps/web 2000 oder mehr, apps/coach 65.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **`set_type`: 372 working, 24 warmup.**

`[cmd]` **Sieben neue Punkte: G-502 bis G-508.**

`[cmd]` **Proben: web 2000, coach 65. Gate 18/18.**

### A1: meine Zahl war falsch

> *,,63 markierte Karten, nicht 81. Die 81 war eine
TEXTZAEHLUNG (90 case-insensitive). Entscheidend ist aber, WO
sie stehen ? am Schirm gemessen: 31 ueber der Linie, 41
darunter."*

`[read]` **Ich hatte Textstellen gezaehlt und Kacheln
geschrieben.** **Und die 41 unter der Linie sind
Entwurfsfassung, die bleibt (E-68/E-70).**

`[cmd]` **Zwei unabhaengige Zaehlweisen, dasselbe Ergebnis** ?
**Wort im Text und Klasse `v2-attrappe`.**

### A5: G-68 ist ueberholt, und das Messen war die Arbeit

> *,,`6 von 1.416` stammt aus G-64 und zaehlte
KATALOGEINTRAEGE. Gemessen: 372 von 396 Saetzen (94 %), 23
verschiedene Uebungen ? und es ist in der DATENBANK gebaut,
als Trigger mit `weight/(1.0278-0.0278*reps)`."*

> *,,Das ist algebraisch exakt das Brzycki aus
`OneRepMaxCalculator.tsx` des Vorgaengerrepos. Struktur
gelesen, Code nicht noetig. NICHTS ZU BAUEN."*

`[read]` **Mein Auftrag sagte *,,e1RM braucht eine Formel"*** ?
**sie stand seit Monaten in der Datenbank.**

### A2: eine Kachel, und der Vermerk war dreifach falsch

> *,,Der Vermerk war in drei Punkten falsch: die Tabelle heisst
`workout_sets`, `set_type` EXISTIERT, und der CHECK fuehrt
genau die vier Arten."*

`[cmd]` **dev: 222 working / 82.035 kg, 11 warmup / 5.925 kg.**
**coach (0 Saetze): Marke bleibt, mit berichtigtem Grund.**

`[read]` **Ein STRICH statt einer Null, wo eine Art nie benutzt
wurde** ? **eine Null waere eine Behauptung.**

### A3: sieben Punkte, und einer buendelt begruendet

`[cmd]` **G-504 fasst vier Kacheln zusammen, weil sie EIN
Hindernis teilen (E-52)** ? **der Sammelfragen-Waechter bleibt
bei 1.**

### Und E-89 geprueft

> *,,Im Trainingsmodul gibt es nichts hinter eine Pruefung zu
legen ? keine Stoffe, keine Dosierungen, keine
Rechtsangaben."*

### Zwei eigene Probenfehler

> *,,Mit 2,2 s Wartezeit meldete `hrzones` 33 Zeichen, und ich
hielt den Reiter fuer KAPUTT ? derselbe Reiter per Klick gab
4.117."*

`[read]` **Beinahe ein erfundener Befund** ? **die Umkehrung
der Falle aus G-468, wo ein Ladezustand wie eine Null aussah.**

**Abgenommen.**



## Bericht

**Claude Code, 2026-09-08.** `[cmd]` **Gemessen an der Datenbank
und am Schirm (3200), beide Konten.**

### A1 - die Marken, je Kachel

`[cmd]` **63 markierte KARTEN, nicht 81.** `[read]` **Die 81
war eine Textzaehlung** — 90 case-insensitive (mit Konstanten
und Kommentaren), 63 sind Karten mit `attrappe={…}`.

`[cmd]` **Am Schirm gemessen, je Reiter — und das ist die Zahl,
die zaehlt:**

    Reiter       oben  unten        Reiter       oben  unten
    today           0      5        standards       1      4
    plan            2      2        calendar        3      4
    history         2      4        hrzones         7      6
    library         0      1        offline         5      4
    progress        4      4
    landmarks       7      7        SUMME          31     41

`[read]` **Die Trennlinie entscheidet:** was UNTER ihr steht,
ist die Entwurfsfassung und bleibt (E-68/E-70). **Nur die 31
darueber sind ein Befund.**

`[cmd]` **Zwei Zaehlweisen, dasselbe Ergebnis:** erst ueber das
Wort *Attrappe* im Text, dann ueber die Klasse `v2-attrappe`
(`primitives.tsx:69`) — **beide 31/41.**

**Und die fuenf `TrainingToday`-Marken sind KEIN Befund:** sie
sind bedingte Rueckfallzweige (`echt ? <Echt/> : <Entwurf/>`),
**die echte Kachel steht direkt daneben.**

### A5 - e1RM, gemessen BEVOR ich es angefasst habe

`[read]` **G-68s *,,6 von 1.416"* ist ueberholt.** `[cmd]`
**Die Zahl stammt aus G-64 und steht als Kommentar in
`auswertung.ts:171`** — sie zaehlte KATALOGeintraege, nicht
Saetze.

`[cmd]` **Der Stand heute:**

    workout_sets.estimated_1rm         372 von 396   94 %
    workout_exercises.best_est_1rm     101 von 153   66 %
    verschiedene Uebungen mit e1RM              23

`[cmd]` **Und es ist GEBAUT — in der Datenbank:**

    Trigger   workout_sets_calc_metrics_trg
    Funktion  training.calc_workout_set_metrics
    Formel    weight_kg / (1.0278 - 0.0278 * reps)

`[cmd]` **Das Vorgaengerrepo fuehrt in
`OneRepMaxCalculator.tsx`** `brzycki = weight * (36/(37-reps))`
— **algebraisch dieselbe Formel.** `[read]` **Struktur
gelesen, Code nicht uebernommen** (er war nicht noetig).

`[cmd]` **Am Schirm bestaetigt:** `training/progress` zeigt
*,,Uebungen mit Verlauf · 23 trainiert"* und *,,Band Deadlift,
bestes e1RM 138,0 kg"*. **Dieselben 23.**

`[read]` **NICHTS zu bauen** — der Auftrag sagte *,,miss es,
bevor du es anfasst"*, und das Messen hat die Arbeit erledigt.

### A2/A4 - angebunden: EINE Kachel

`[cmd]` **`Set types · volume counting`, `training/progress`.**

**Vorher:** vier Arten aus der Spec, keine eigene Zahl.
**Der Vermerk:** *,,eine Satzart je Satz — `training.sets`
kennt kein Feld dafuer."*

`[cmd]` **Der Vermerk war in DREI Punkten falsch:**

    1  die Tabelle heisst workout_sets —
       ein training.sets gibt es nicht
    2  sie HAT set_type, mit CHECK auf genau die
       vier Arten der Spec
    3  gefuellt: 372 working, 24 warmup

`[read]` **Ein Vermerk mit falschem Grund verhindert, dass
jemand nachsieht** — das Feld lag seit C-66 bereit, und
`sitzungen-read.ts:288` las es schon.

**Nachher, gemessen an beiden Konten:**

    dev@lumeos.app     Marke WEG, Pille „echte Daten"
                       Working  222 Saetze   82.035 kg
                       Warm-up   11           5.925 kg
                       Drop set / Failure: Strich, keine Null

    coach@lumeos.app   Marke BLEIBT (0 Saetze),
                       mit berichtigtem Grund

`[read]` **A4 ist damit belegt:** die Marke faellt nur, wo eine
Zahl steht. `[read]` **Und ein Strich statt einer Null** — wer
eine Art nie benutzt hat, hat dort keinen Wert (E-72).

### A3 - sieben Punkte, je Hindernis einer

`[read]` **Nicht gesammelt** — der Sammelfragen-Waechter steht
unveraendert bei 1.

    G-502  die e1RM-Kachel rechnet nicht mit der
           Datenbank (Vermerk falsch: Brzycki IST da)
    G-503  der Plan-Reiter steht auf leeren Tabellen
           (programs/routines 0 Zeilen, kein Leseweg)
    G-504  vier Kacheln, EIN Hindernis: die gemeinsame
           Sicht training/goals/recovery (E-52)
    G-505  HR zones und Offline sync haben gar keine
           Tabellen
    G-506  das Progressionsmodell hat keine Zuordnung
           (nach G-503)
    G-507  „Pending actions" zeigt auf ein fremdes
           Schema (coach, nicht recovery)
    G-508  die Volumengrenzen haben keine belegte
           Quelle

`[read]` **G-504 fasst vier Kacheln zusammen, und das ist
kein Verstoss gegen A3:** sie haben nicht vier Hindernisse,
sondern EINES. **Wer die Sicht baut, loest alle vier.**

### Drei Vermerke nennen den falschen Grund

`[cmd]` **Neben `Set types` (behoben) noch zwei:**

    e1RM-Kachel    „die Brzycki-Ableitung fehlt"
                   -> sie ist ein Trigger, 372/396
    Pending actions „es gibt sie in recovery"
                   -> sie liegt in coach (2 Zeilen)

`[read]` **Beide stehen als G-502 und G-507 bei Tom** — ich
habe sie nicht selbst berichtigt, weil zu jedem eine
Entscheidung gehoert (anbinden oder unter die Linie).

### E-89 im Trainingsmodul

`[cmd]` **Gemessen: nichts gehoert hinter eine Pruefung.**
Das Modul fuehrt Sitzungen, Saetze, Uebungen und
Muskelzuordnungen — **keine verschreibungspflichtigen Stoffe,
keine Dosierungen, keine Rechtsangaben.** `[read]` **Die
Grenze aus E-89 (Wissen offen, Protokoll gesperrt) hat hier
keinen Gegenstand.**

### A6/A7/A8/A9

`[cmd]` **Marken vorher/nachher:** 31 oben -> **30**, unten
**41 unveraendert** (A7: die Entwurfsreferenz ist
unberuehrt). **`progress` 4 -> 3.**

`[cmd]` **Bilder je Reiter:** `tools/_g25-<reiter>.png`,
zehn Stueck, vorher und nachher gelaufen.

`[cmd]` **A8: Nutrition 10 Karten, Recovery 17, Medical 11,
Goals 18 — null Seitenfehler.** **Supplements zusaetzlich
ueber `_g117-reiter.mjs`: zwoelf Reiter gruen.**

`[cmd]` **A9: `pnpm gate` GRUEN, 18 von 18. `apps/web` 2.000,
`apps/coach` 65.**

### Der Waechter hat meinen Schnitt gefangen

`[cmd]` **`v2-attrappen.test.ts` wurde rot** — er zaehlt die
Marken je Datei und erwartete 10 in `fehlende-kacheln.tsx`.

`[read]` **Das war richtig so.** Sein eigener Kommentar sagt
es: *,,Wer eine anbindet, entfernt `attrappe` und zaehlt die
Erwartung herunter — dann faellt hier auf, dass es
passiert ist."* **Auf 9 gesetzt, mit der Messung als
Begruendung.**

### Zwei Fehler in meiner eigenen Probe

`[cmd]` **1 — zu kurz gewartet.** Mit 2,2 s meldete `hrzones`
**33 Zeichen und keine Trennlinie**; ich hielt den Reiter fuer
kaputt. **Derselbe Reiter per Klick geoeffnet: 4.117 Zeichen.**
`[read]` **Die Ansicht war nur noch nicht da** — auf 4,5 s
plus eine Wartebedingung auf die Zeichenzahl umgestellt,
danach 7 Marken oben statt 0.

`[cmd]` **2 — das Wort statt der Klasse gesucht.** Die erste
Fassung suchte *Attrappe* im Text und musste Elternkarten
ausschliessen. `[read]` **`packages/ui` setzt `v2-attrappe`
als Klasse** — die Sache selbst. **Beide Zaehlweisen geben
31/41; die zweite ohne Ausnahmeregel.**

### Neustart

`[read]` **Nicht noetig** — nur `apps/web/src`.

### Werkzeuge

    tools/_g25-marken.mjs   je Reiter oben/unten,
                            zehn Bilder, Austritt 0/1
