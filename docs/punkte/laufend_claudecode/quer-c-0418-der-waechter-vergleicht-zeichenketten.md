---
nr: C-418
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-359
entscheidung: E-70
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  dateien:
    - tools/mockup-deckung.mjs
zahlen:
  gemessen: 2026-09-07
  recovery_fehlt: 170
  woerter_im_code: 96
---

# C-418 — der Waechter vergleicht Zeichenketten, nicht Inhalte

## Befund

Tom, 2026-09-07: *,,recovery hat er schlecht gearbeitet. denn da
haben wir vorher schon einiges mehr angebunden wie muscle
recovery / muscle readiness."*

`[cmd]` **Nachgemessen: `readiness` steht an sieben Stellen in
`v2/recovery`** — `ansicht.tsx`, `checkin-streifen.tsx`,
`kontext.tsx`, `modale.tsx`, `score-kachel.tsx`, `tab-checkin.tsx`,
`tab-messwerte.tsx`.

`[cmd]` **Und `f4d51b11 feat(web): training readiness reads
recovery`** — **es ist angebunden, kein Mockup.**

## Die Ursache liegt im Waechter

`[cmd]` **Von 170 als fehlend gemeldeten Elementen tragen 96 alle
ihre Woerter im Code.**

    Daily readiness check-in   Mockup
    Readiness + Check-in       Code, getrennt

`[read]` **Derselbe Inhalt, andere Zeichenkette.**

`[cmd]` **`mockup-deckung.mjs` vergleicht ganze Beschriftungen** —
**es findet *,,Daily readiness check-in"* nicht, weil im Code
*,,Readiness"* und *,,Check-in"* getrennt stehen.**

## Was daraus folgt

`[read]` **Die Zahl 1.343 ist zu hoch** — **um wie viel, ist
unbekannt.**

`[read]` **Das ist ein Fehler des Orchestrators, nicht der
Agenten** — **Claude Code hat auf einer falschen Grundlage
eingeordnet.**

`[read]` **Und Toms Beobachtung war richtig:** **`recovery` ist
besser angebunden als die Zahl sagt.**

## Zu bauen

`[read]` **Der Vergleich braucht eine zweite Stufe:**

    genau gleich       -- wie heute
    alle Woerter da    -- Verdacht, kein Befund
    nicht auffindbar   -- wirklich weg

`[cmd]` **Die mittlere Klasse ist die grosse:** **96 von 170 allein
in `recovery`.**

`[read]` **Sie gehoert nicht in die Fehlmenge, aber auch nicht
ignoriert** — **sie ist eine Liste zum Nachsehen.**

`[read]` **Und der Waechter darf erst dann wieder rot melden, wenn
die Zaehlung stimmt** — `[cmd]` **sonst meldet er 1.343 Fehler, von
denen die Haelfte keiner ist.**

## Auftrag — Modul fuer Modul, mit Abnahme je Modul

**Beauftragt am 2026-09-07.**

`[read]` **Mein Fehler, nicht seiner** — **er hat auf einer falschen
Grundlage eingeordnet.**

### Drei Klassen je Element

    genau gleich       vorhanden
    alle Woerter da    Verdacht -- nachsehen, ob es dasselbe ist
    nicht auffindbar   wirklich weg

### Und je nach Klasse

`[read]` **Angebunden, nur anders benannt:** **den richtigen Code
oben einblenden, die Attrappe darunter.**

`[read]` **Wirklich weg:** **als Attrappe einblenden, mit
E-68-Vermerk.**

### Reihenfolge, und Abnahme je Modul

    recovery      zuerst -- dort ist die Zahl am staerksten verzerrt
    medical
    nutrition
    supplements

Tom, 2026-09-07: *,,ich mach dann die abnahme gezielt bei jedem
modul."*

`[read]` **Also nach JEDEM Modul melden, nicht am Ende.**

### Nachweis je Modul

    drei Zahlen     wie stark der Waechter danebenlag
    eingeblendet    richtiger Code oben, Attrappe darunter
    unangetastet    kein bestehendes Verhalten geaendert
    Bildschirmfoto  vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

## Bericht — recovery

**Claude Code, 2026-09-06.** **Nur recovery** — Abnahme je Modul,
wie beauftragt.

### Die drei Zahlen

`[cmd]` **Gemessen Titel gegen Titel, nicht Zeichenkette gegen
Datei:**

    recovery — 39 Mockup-Kacheln
      genau gleich        18
      anders benannt      10   nachgesehen, Fundstelle belegt
      wirklich weg        11

`[cmd]` **Der Waechter meldete 170.** `[read]` **Es sind 11** —
**Faktor 15.**

### Was ,,anders benannt" heisst

`[read]` **Der Waechter suchte englische Zeichenketten in einer
teilweise eingedeutschten Oberflaeche:**

    Last night             -> Letzte Nacht
    14 nights              -> 14 Naechte
    Measurement log        -> Messprotokoll        tab-messwerte:210
    Sleep hygiene inputs   -> Schlafhygiene        tab-messwerte:421
    Live score preview     -> Vorschau             tab-checkin:246
    30-day trend           -> Verlauf              score-kachel:208
    Score breakdown        -> Erholungswert
    HRV score              -> HRV
    Muscle recovery map    -> Muscle recovery      ansicht.tsx
    Readiness check-in     -> Morning check-in + Readiness levels

`[cmd]` **Jede Zeile einzeln nachgesehen, mit Datei und Zeile.**
**Keine davon ist geraten.**

### Toms Beobachtung, nachgemessen

`[cmd]` **`Muscle readiness` steht in `ansicht.tsx:261`** — Titel,
Untertitel *,,18 groups · click for the calculation"* und der Knopf
*,,Full map →"*, **wortgleich aus `module-recovery-v2.jsx:170`.**

`[read]` **Sie war nie weg.** **Der Waechter suchte
*,,Muscle recovery map"* und fand *,,Muscle recovery"* nicht** —
ein Wort Unterschied.

### Die elf, die wirklich fehlen

`[cmd]` **Eingeblendet als Attrappe mit E-68-Vermerk**, neu in
`apps/web/src/app/v2/recovery/fehlende-kacheln.tsx`:

    HRV-Reiter      HRV · last 30 days     Anmerkung fehlt
                    HRV · 90 days          unbekannt, nie untersucht
                    Resting HR · 90 days   unbekannt, nie untersucht
                    Weight · 30 days       Leseweg aus goals

    Sleep-Reiter    Sleep · last 14 nights unbekannt, nie untersucht
                    Sleep debt · 7 day     Sollwert je Nutzer fehlt
                    Bedtime & wake · 30d   unbekannt, nie untersucht

    Today-Reiter    Training load × Rec.   gemeinsame Sicht (E-52)
                    Readiness ↔ perform.   gemeinsame Sicht (E-52)
                    Pattern detection      unbekannt, nie untersucht
                    Today · protocols      unbekannt, nie untersucht

`[read]` **Je Kachel steht, was sie zeigen wuerde und worauf sie
wartet** — **keine erfundenen Zahlen** (C-378). `[read]` **Vier
sagen ausdruecklich *,,unbekannt, nie untersucht"*, wie E-68 es
vorsieht.**

### Am Schirm, vorher/nachher

    Reiter    Attrappen        Kacheln
    today      4 -> 12          8 -> 12
    hrv        2 -> 10          5 ->  9
    sleep      2 ->  8          5 ->  8

`[cmd]` **Vorher-Stand aus `git stash`, nicht geschaetzt.**

### Bestehendes unangetastet

`[read]` **Kein Ternaer angefasst, keine Bedingung geaendert.**
**Die elf Kacheln stehen NEBEN dem Bestehenden**, in einem eigenen
Block je Reiter.

`[cmd]` **`RecHRV`, `RecSleep` und `RecToday` werden unveraendert
mit denselben Werten aufgerufen.**

### Was ich am eigenen Vorgehen berichtigen musste

`[cmd]` **Mein erster Klassierer zaehlte 61 Verdachtsfaelle** —
**und die meisten waren keine Elemente:** *,,Today 07:08"*,
*,,3 days ago"*, *,,Deep"*, sogar JS-Bruchstuecke wie
`=0&&i===0&&ot.count`.

`[read]` **Ein Datenwert im Mockup ist kein fehlendes
Bedienelement** — er ist erfundener Inhalt. **Zweiter Anlauf: nur
`<Card title=` und Knopftexte.**

`[cmd]` **Und die automatische Zuordnung fand nur 1 der 10
Umbenennungen** — **Uebersetzungen teilen keine Zeichenkette.**
`[read]` **Die zehn stehen hier, weil ich sie von Hand
nachgesehen habe, nicht weil ein Werkzeug sie fand.**

### Was das fuer die Gesamtzahl heisst

`[cmd]` **Dieselbe Messung ueber die anderen drei, automatisch
(also OHNE die Handpruefung, die bei recovery 9 weitere fand):**

    Modul         Kacheln  gleich  anders  weg (obere Schranke)
    medical            24      15       2       7
    nutrition          20      17       0       3
    supplements        40      29       1      10

`[read]` **Das sind obere Schranken** — bei recovery sank die Zahl
durch Handpruefung von 20 auf 11. `[read]` **Die echten Werte
duerften niedriger liegen.**

`[read]` **Und die 1.343 aus G-359 sind damit als Grundlage
unbrauchbar** — **sie zaehlen Datenwerte und Uebersetzungen mit.**

### Vollstaendiger Lauf

    tsc --noEmit    sauber
    next lint       keine Warnung, kein Fehler
    Tests           1500 / 1500 gruen, 0 Fehler
    dev@lumeos.app  nicht geschrieben
    gestaged        nichts

**Bildschirmfotos:** `backup/g359b-recovery-vorher-*.png` und
`-nachher-*.png`, je drei Reiter.

**Naechstes Modul erst nach der Abnahme.**

## Abnahme

_(vom Orchestrator)_
