---
nr: G-482
typ: fehler
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 56a6977a
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/plan-eintraege.tsx
zahlen:
  gemessen: 2026-09-08
  heute: 4
---

# G-482 - die Planeintraege sind da und werden nicht gezeigt

## Toms Befund

Tom, 2026-09-08:

> ghostentries kannst mir erzaehlen was du willst, ich sehe
> keine und das ist tatsache

## Er hat recht, und der Bericht war falsch

`[cmd]` **Selbst gemessen, heute ist der 2026-09-18:**

    2026-09-15    4 Eintraege
    2026-09-16    4
    2026-09-17    4
    2026-09-18    4     <- HEUTE
    2026-09-19   12     <- der aktive Plan beginnt
    2026-09-20   12
    2026-09-21   12
    2026-09-22   12

`[cmd]` **Insgesamt: 756 Eintraege, 231 Plantage, ein aktiver
Plan (*,,Aufbau-Wochenplan"*, ab 2026-09-19, 28 Tage).**

### Was E-83 behauptet hat

> Claude Code: *,,Gebaut, 558 Zeilen. Gemessen: 0 Eintraege
heute, 4 morgen ? Toms aktiver Plan beginnt am 19.09., heute
ist der 18."*

`[read]` **Beide Zahlen falsch.** **Es sind 4 heute und 12
morgen.**

`[read]` **Und ich habe es uebernommen, ohne zu messen** ?
**genau Toms Vorwurf.**

## Damit ist es ein Anzeigefehler

`[read]` **Die Daten sind da. Tom sieht sie nicht.**

`[cmd]` **`plan-eintraege.tsx` und `plan-werkbank-ui.tsx`
existieren** ? **miss, was sie holen und was sie zeigen.**

## Was zu messen ist

    A  welche Abfrage holt die Eintraege?
    B  welchen Tag fragt sie? Heute oder den
       Planbeginn?
    C  zeigt sie nur den AKTIVEN Plan, oder alle?
       Der aktive beginnt erst morgen.
    D  wo im Schirm sollten sie stehen? Tom sieht
       die Stelle -- miss, was dort steht.

`[cmd]` **Punkt C ist der Verdacht: die vier Eintraege von
heute gehoeren vermutlich zu einem ANDEREN, nicht aktiven
Plan.**

`[read]` **Dann waere die Anzeige richtig und die Frage eine
andere: soll ein abgelaufener Plan noch zeigen?**

## Abnahmebedingungen

    A1  welche Abfrage, welcher Tag, welcher Plan?
        Gemessen.
    A2  zu welchem Plan gehoeren die vier Eintraege
        von heute?
    A3  wenn es ein Anzeigefehler ist: behoben, Foto.
    A4  wenn es richtig ist: BENANNT, warum Tom
        nichts sieht.
    A5  Gegenprobe: ein Tag mit Eintraegen zeigt sie.
    A6  vier Module unveraendert.

## Bericht

**Es ist KEIN Anzeigefehler.** `[cmd]` **Die Abfrage ist richtig, die
Kachel ist gebaut, und sie zeigt am 20.09. vier Plaene mit neun
Zeilen.** `[read]` **Tom sieht heute nichts, weil sein AKTIVER Plan
morgen beginnt** — und die vier Eintraege von heute zu einem Plan
gehoeren, der nicht aktiv ist.

    A1  Abfrage, Tag und Plan benannt                  erfuellt
    A2  die vier Eintraege gehoeren zu „Lean bulk 3100" erfuellt
    A3  kein Anzeigefehler -- entfaellt                 —
    A4  BENANNT, warum Tom nichts sieht                 erfuellt
    A5  Gegenprobe am 20.09.: 4 Tabellen, 9 Zeilen      erfuellt
    A6  vier Module unveraendert                        erfuellt

`[cmd]` **Kein Code geaendert** — G-482 hat nichts hinterlassen.

### Vorweg: mein Bericht war falsch, in beide Richtungen

`[read]` **In E-83 stand: *,,0 Eintraege heute, 4 morgen"*.**

`[cmd]` **Gemessen stimmt keine der beiden Zahlen:**

    2026-09-18   4 Planeintraege in der Datenbank   (nicht 0)
    2026-09-19  12 Planeintraege in der Datenbank   (nicht 4)

`[read]` **Der Fehler war methodisch:** ich habe die ANTWORT DER
ROUTE gemessen und sie als Aussage ueber die DATEN berichtet.
`[cmd]` **Die Route liefert 0 und 4** — das war richtig gemessen, nur
falsch beschriftet. **Zwischen beidem liegt der Filter, um den es
hier geht.**

### A1 — Abfrage, Tag, Plan

`[cmd]` **Die Abfrage:** `ladeGhostEintraege(datum)` in
`apps/web/src/lib/nutrition/plan-lesen.ts:1114`, gerufen von
`api/nutrition/plan/route.ts:109`.

`[cmd]` **Der Tag:** `.eq('meal_plan_days.plan_date', datum)` —
**genau der Tag, der am Schirm steht.**

`[cmd]` **Der Plan:**

    .eq('meal_plan_days.meal_plan_weeks.meal_plans.status', 'active')

`[read]` **Nur der aktive Plan** — mit `!inner` ueber drei Ebenen,
damit keine Zeile ohne Plan durchkommt.

### A2 — zu welchem Plan gehoeren die vier von heute?

`[cmd]` **Gemessen:**

    Datum        Plan                 is_active  status
    2026-09-17   Lean bulk 3100       f          assigned   4 Eintraege
    2026-09-18   Lean bulk 3100       f          assigned   4 Eintraege   <- HEUTE
    2026-09-19   Aufbau-Wochenplan    t          active     4 Eintraege
    2026-09-19   Cut 4-Meal 2200      f          paused     4
    2026-09-19   Lean bulk 3100       f          assigned   4

`[read]` **Die vier Eintraege von heute gehoeren `Lean bulk 3100`** —
**Status `assigned`, nicht aktiv.** `[cmd]` **Der Filter schliesst
sie zu Recht aus.**

`[cmd]` **Und `is_active` und `status` stimmen ueberein** — es gibt
keine zweite Wahrheit:

    Aufbau-Wochenplan   t   active
    Buddy auto-plan     f   paused
    Cut 4-Meal 2200     f   paused
    Lean bulk 3100      f   assigned
    test                f   assigned

### A4 — warum Tom nichts sieht

`[cmd]` **Der aktive Plan deckt 2026-09-19 bis 2026-10-23** — 35
Tage, je vier Eintraege.

`[cmd]` **Heute ist der 2026-09-18.** `[read]` **Ein Tag davor.**

`[read]` **Drei Dinge treffen zusammen, und jedes einzelne waere
harmlos:**

    1  der aktive Plan beginnt morgen
    2  die Eintraege von heute gehoeren einem Plan
       mit Status `assigned`
    3  die Kachel zeigt ausschliesslich den aktiven Plan

`[read]` **Zusammen ergibt das einen Tag, an dem Daten dastehen und
nichts erscheint** — **und von aussen sieht das aus wie ein
entferntes Feature.**

### A5 — die Gegenprobe

`[cmd]` **Ueber die Route gemessen:**

    2026-09-18    0 Eintraege
    2026-09-19    4
    2026-09-20    4

`[cmd]` **Und am SCHIRM, 2026-09-20:**

    ghost-tabelle    4
    ghost-zeile      9
    Summen           493 / 593 / 126 / 293 kcal

`[cmd]` **Mit Inhalt:** *Haferflocken 278 kcal*, *Joghurt (0,5 %
Fett) 120*, *Banane 95*, *Haehnchenbrust (roh) 180*.

`[cmd]` **Und mit der Bedienung, die `ADR_GHOST_ENTRY_RECIPE`
verlangt:** gestrichelter Rand, *,,· aus deinem Plan"*, der
Rezeptname als Ueberschrift (*Banane-Joghurt-Haferflocken*,
*Huhn-Reis-Bowl*), **je Zutat eine Zeile mit eigenem Mengenfeld**,
darunter `[Bestaetigen] [MealCam] [Auslassen]`.

`[read]` **Die Kachel ist vollstaendig und funktioniert.**

### Ein Befund an meiner eigenen Probe

`[cmd]` **Der erste Lauf meldete `ghostKarten: 0` bei 20.09.** —
**und das haette wie ein Anzeigefehler ausgesehen.**

`[cmd]` **Die Marke `ghost-karte` gibt es nicht** — ich hatte sie
erfunden. **Die echten heissen `ghost-tabelle`, `ghost-zeile`,
`ghost-kopf-summe`.**

`[read]` **Eine Probe, die einen ausgedachten Namen sucht, meldet
zuverlaessig null** — und null sieht aus wie ein Befund. `[cmd]`
**Erst mit den gemessenen Marken kamen 4 und 9 heraus.**

### Was das fuer Tom heisst

`[read]` **Heute ist nichts kaputt, aber die Lage ist
unverstaendlich** — und das ist ein echter Mangel, nur kein
technischer.

`[read]` **Zwei Moeglichkeiten, beide sind Entscheidungen fuer Tom,
nicht fuer mich:**

    1  Ein Satz an leeren Tagen: „Dein aktiver Plan
       beginnt am 19.09." -- statt gar nichts.
    2  Auch nicht-aktive Plaene zeigen, sichtbar
       gekennzeichnet.

`[cmd]` **(1) ist klein und aendert keine Regel.** `[cmd]` **(2)
aendert, was ein Ghost Entry BEDEUTET** — dann ist er nicht mehr
*,,was dein Plan heute vorsieht"*, sondern *,,was irgendein Plan
vorsaehe"*.

`[read]` **Ich habe keine der beiden gebaut** — der Auftrag sagt:
wenn es richtig ist, BENENNEN.

## Abnahme

**2026-09-08, Orchestrator. KEIN Anzeigefehler.**

> *,,Die Abfrage ist richtig. Sie liest den angezeigten Tag und
filtert auf `status = active`. Toms vier Eintraege von heute
gehoeren *Lean bulk 3100* (Status `assigned`), sein aktiver
*Aufbau-Wochenplan* beginnt am 19.09."*

`[cmd]` **Gegenprobe am 20.09.: 4 Ghost-Tabellen, 9 Zeilen, mit
Rezeptnamen, editierbaren Mengen und [Bestaetigen] [MealCam]
[Auslassen].**

`[read]` **Die Ghostentries funktionieren.**

### Und er hat seinen E-83-Fehler benannt

> *,,Mein E-83-Bericht war in BEIDE Richtungen falsch ? ich
habe die Antwort der ROUTE gemessen und als Aussage ueber die
DATEN berichtet. Zwischen beidem liegt genau dieser Filter."*

`[read]` **Und ich habe seine Zahlen uebernommen, ohne zu
messen** ? **erst Toms Widerspruch hat es aufgedeckt.**

### Eine Entscheidung liegt bei Tom

> *,,ein Satz *Dein aktiver Plan beginnt am 19.09.* an leeren
Tagen, oder auch nicht-aktive Plaene zeigen"*

`[read]` **Tom sah einen leeren Tag und wusste nicht, warum** ?
**das ist der eigentliche Befund.**

**Abgenommen, die Entscheidung steht aus.**


