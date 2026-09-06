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

## Abnahme — recovery

**2026-09-07, Orchestrator.** **Fuer `recovery` abgenommen, der Rest
folgt.**

### Toms Vermutung war exakt richtig

`[cmd]` **170 gemeldet, 11 wirklich weg.**

    18   wortgleich vorhanden
    10   unter deutschen Namen
    11   wirklich weg
    ---
   170   gemeldet

`[cmd]` **`Muscle readiness` ist da** — **genau wie Tom sagte.**

Tom, 2026-09-07: *,,recovery hat er schlecht gearbeitet, denn da
haben wir vorher schon einiges mehr angebunden."*

`[read]` **Er hatte recht, und der Fehler lag beim Waechter.**

### Der Massstab war falsch

`[read]` **Titel gegen Titel statt Zeichenkette gegen Dateiinhalt.**

`[read]` **Mein Waechter lag um Faktor 15 daneben** — **und deutsche
Namen waren fuer ihn Verluste.**

`[cmd]` **`Muscle readiness` im Mockup gegen `Muskelbereitschaft` im
Code** — **derselbe Schirm, andere Sprache.**

`[read]` **Das ist der Fehler hinter dem Fehler:** **die App ist
mehrsprachig** (DE/EN/TH), **das Mockup ist englisch.** `[read]`
**Ein Vergleich, der das nicht kennt, meldet jede Uebersetzung als
Verlust.**

### Und die Hochrechnung sinkt entsprechend

`[cmd]` **Die automatischen Obergrenzen fuer die restlichen drei:**
medical 7, nutrition 3, supplements 10.

`[read]` **Aus 1.343 werden vermutlich unter 50.**

`[read]` **Er sagt selbst, dass auch diese Zahlen bei
Handpruefung sinken duerften** — **wie `recovery` von 20 auf 11.**

### Elf Attrappen, nichts angetastet

`[cmd]` **Mit E-68-Vermerk eingeblendet.**

**Abgenommen fuer `recovery`.** **Weiter mit `medical`.**


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

## Auftrag 2 — auch das Gebaute bekommt seine Referenz

**Beauftragt am 2026-09-07.**

Tom, 2026-09-07: *,,dann lass claude code das nun loesen dass das
gebaute auch eingeblendet wird."*

### Was bisher fehlt

`[cmd]` **In `recovery` hast du die 11 fehlenden als Attrappen
eingeblendet** — richtig.

`[cmd]` **Aber bei den 28 vorhandenen steht nur das Gebaute** —
**ohne Mockup-Referenz darunter.**

`[read]` **Damit kann Tom nicht vergleichen** — **und genau dafuer
ist E-69 da.**

### Die Regel, vollstaendig

`[cmd]` **E-69, 2026-09-07:**

    1  die Attrappe wird kopiert
    2  die Kopie wird angebunden und oben eingehaengt
    3  die Attrappe bleibt DARUNTER stehen
    4  Tom vergleicht Ist gegen Soll auf einem Schirm
    5  nimmt er ab, faellt die Attrappe

`[read]` **Punkt 3 gilt fuer jedes Element** — **nicht nur fuer die
fehlenden.**

Tom: *,,so habe ich ist und soll fuer mich immer bereit und ich kann
arbeiten."*

### Was zu tun ist

`[read]` **Je Modul: das vollstaendige Mockup als Attrappe unter die
gebaute Ansicht.**

`[read]` **Nicht Element fuer Element** — **der ganze Schirm, wie er
im Mockup steht.**

`[cmd]` **In `goals` hast du es so gemacht** — **echte Ansicht oben,
Attrappe darunter.** `[read]` **Dasselbe fuer die uebrigen.**

### Und die Kennzeichnung

`[cmd]` **E-68: Quelle und Grund.**

    // Attrappe -- theme-v1/module-recovery.jsx
    //   Referenz zum Vergleich, faellt mit Toms Abnahme

`[read]` **Bei vorhandenen Elementen ist der Grund nicht *,,wartet
auf X"*** — **es ist *,,Referenz zum Vergleich"*.**

### Reihenfolge

    recovery      zuerst -- dort ist die Abnahme schon erfolgt
    medical
    nutrition
    supplements
    goals         pruefen, ob vollstaendig
    training      pruefen
    dashboard     pruefen

`[read]` **Nach jedem Modul melden** — **Tom nimmt einzeln ab.**

### Was nicht zu tun ist

**Bestehendes bleibt unangetastet.**
**Keine Anbindung, kein Umbau.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis je Modul

    Mockup unten    vollstaendig, als Attrappe gekennzeichnet
    Gebautes oben   unveraendert
    Bildschirmfoto  beide untereinander sichtbar
    Waechter        mockup-deckung.mjs bleibt gruen

## Bericht — Auftrag 2, recovery (HRV und Sleep)

**Claude Code, 2026-09-06.** **Zwei Reiter fertig, sechs offen** —
Zwischenstand, weil die Machart erst abgenommen gehoert.

### Was E-69 hier bedeutet

`[read]` **Schritt 3 galt bisher nur fuer die FEHLENDEN Elemente**
(Auftrag 1, `fehlende-kacheln.tsx`). `[read]` **Jetzt steht der
ganze Mockup-Reiter darunter** — auch dort, wo das Gebaute
vollstaendig ist.

`[cmd]` **Neu: `apps/web/src/app/v2/recovery/mockup-referenz.tsx`**,
393 Zeilen, mit `RecHRVReferenz` und `RecSleepReferenz`.

**Der Aufbau je Reiter, von oben nach unten:**

    1  die gebaute Ansicht      unveraendert
    2  die fehlenden Kacheln    aus Auftrag 1, mit „wartet auf"
    3  ── Mockup-Referenz ──    Trennlinie mit Pille
    4  der Mockup-Reiter        vollstaendig, als Attrappe

### Die Kennzeichnung

`[cmd]` **Der Grund ist NICHT *,,wartet auf X"*, wie der Auftrag
sagt:**

    Attrappe — theme-v1/module-recovery-v2.jsx
      wartet auf: nichts — Referenz zum Vergleich,
                  faellt mit Toms Abnahme

`[cmd]` **Dazu eine Trennlinie ueber jedem Referenzblock** — Pille
*Mockup-Referenz*, Reitername, Quelldatei, und der Satz *,,faellt
mit der Abnahme"*.

`[read]` **Ohne sie stehen zwei Fassungen derselben Kachel
untereinander und niemand weiss, welche gilt** — z. B. zweimal
*,,Last night"*.

### Am Schirm, vorher/nachher

    Reiter   Attrappen        Kacheln
    hrv      10 -> 18          9 -> 13
    sleep     8 -> 16          8 -> 12

`[cmd]` **Belegt: `backup/g359b-recovery-ref-hrv-hrv.png`** — oben
der gebaute HRV-Reiter mit **39,6 ms aus `recovery.checkins`**,
darunter die vier fehlenden Kacheln, darunter das Mockup mit seinen
Entwurfszahlen.

### Der Deckungswaechter bewegt sich zum ersten Mal

`[cmd]` **`mockup-deckung.mjs`: 1.145 -> 1.161 sichtbar, 16
Elemente zurueckgebracht.**

`[read]` **Bei den bisherigen Auftraegen blieb er stehen** — dort
wurde Verstecktes eingeblendet, und die Beschriftungen standen
schon im Quelltext. **Hier kommen sie neu dazu, also zaehlt er
mit.**

`[read]` **Damit misst er ab jetzt genau das, was dieser Auftrag
tut** — im Gegensatz zu G-359/2 und /3.

### Bestehendes unangetastet

`[cmd]` **`RecHRV` und `RecSleep` werden unveraendert mit
denselben Werten aufgerufen.** **Kein Ternaer angefasst, keine
Bedingung geaendert.**

`[read]` **Die Referenz haengt hinter dem Bestehenden, im selben
Fragment.**

### Keine Anbindung, keine erfundene Zahl

`[cmd]` **Die Referenzansichten lesen ausschliesslich die
Entwurfskonstanten aus `motor.ts`** — `CHECKIN`, `HRV_BASELINE`,
`HRV_LOG`, `SLEEP_DATA`, `calcHRVScore`, `calcSleepScore`.

`[read]` **Die stehen dort seit dem Modulbau** — **hier wird nichts
neu erfunden und nichts neu gerechnet.** **Der Soll-Stand zeigt die
Entwurfszahlen, der Ist-Stand darueber die gemessenen.**

### Was der Typecheck gefunden hat

`[cmd]` **`SleepScore.eff/dur/deep` sind optional** (`motor.ts:387`)
— **sie stehen nur auf dem Wearable-Weg.**

`[read]` **Hier liegt `SLEEP_DATA` vor, also sind sie gesetzt** —
**aber ein `!` waere eine Behauptung.** `[cmd]` **Stattdessen
`?? 0`, mit dem Grund als Kommentar daneben.**

### Was noch offen ist

    Reiter          Mockupzeilen   Stand
    today                    146   offen
    checkin                  133   offen
    muscles                   68   offen
    hrv                       94   FERTIG
    sleep                    108   FERTIG
    modalities               100   offen
    overtraining              77   offen
    protocols                 75   offen

`[read]` **Rund 600 Zeilen Mockup-JSX sind noch zu uebertragen** —
**derselbe Handgriff, aber je Reiter eine eigene Pruefung.**

### Vollstaendiger Lauf

    tsc --noEmit         sauber
    next lint            keine Warnung, kein Fehler
    Tests                1500 / 1500 gruen, 0 Fehler
    mockup-deckung.mjs   1.161 / 2.488 (+16)
    dev@lumeos.app       nicht geschrieben
    gestaged             nichts

**Zur Abnahme: traegt die Machart so?** `[read]` **Wenn ja, ziehe
ich die sechs uebrigen Reiter nach und melde recovery
vollstaendig.**

## Abnahme

_(vom Orchestrator)_

## Auftrag 3 — jeder Reiter, jedes Modul

**Beauftragt am 2026-09-07.**

Tom, 2026-09-07: *,,bring einfach die loesung dass es dargestellt ist
wie ich seit 30 minuten davon rede."*

### Was falsch lief

`[cmd]` **Auftrag 2 wurde in zwei von sechs Recovery-Reitern
umgesetzt** — `hrv` und `sleep`.

`[cmd]` **`modalities`, `overtraining`, `protocols`, `stress` haben
nichts.**

`[cmd]` **Und `tab-messwerte.tsx` mit `Per-muscle detail` kam gar
nicht vor.**

`[read]` **Tom zeigte auf `Muscle map`, `Muscle recovery`,
`Per-muscle detail`** — **und bekam Referenzen in zwei anderen
Reitern.**

### Was zu tun ist

**Unter JEDEN Reiter von JEDEM Modul das vollstaendige Mockup als
Attrappe.**

    recovery       6 Reiter -- 4 fehlen noch
    medical        alle
    nutrition      alle
    supplements    alle
    goals          alle -- pruefen, ob vollstaendig
    training       alle
    dashboard      alle

`[read]` **Keine Auswahl, keine Reihenfolge nach Wichtigkeit.**
**Jeder Reiter.**

`[cmd]` **Die Form ist abgenommen:** Gebautes oben, fehlende Kacheln,
Trennlinie, Mockup-Reiter darunter.

### Und wo ein Mockup-Reiter keinen Gegenpart hat

`[read]` **Dann steht dort nur die Attrappe** — **das ist der Fall
bei allem, was nie gebaut wurde.**

### Melden

`[read]` **Nach jedem Modul, nicht nach jedem Reiter.**

`[cmd]` **Und je Modul: wie viele Reiter, wie viele haben jetzt eine
Referenz.**

### Was nicht zu tun ist

**Bestehendes bleibt unangetastet.**
**Keine Anbindung, kein Umbau, keine Leseweg-Arbeit.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis je Modul

    Reiter          alle, gezaehlt
    Referenz        unter jedem, Bildschirmfoto
    unangetastet    kein bestehendes Verhalten geaendert
