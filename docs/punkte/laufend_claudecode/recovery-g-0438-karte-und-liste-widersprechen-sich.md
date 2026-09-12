---
nr: G-438
typ: fehler
modul: recovery
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-436
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-438 — Karte und Liste widersprechen sich

## Toms Befund

Tom, 2026-09-08:

> das ist unlogisches ghetto. beispiel arms triceps ist orange,
> zeigt aber keine werte in der liste

> hauptgruppen sollen besser ersichtlich sein und gegen naechste
> hauptgruppe unterteilt sein

## Der Widerspruch, gemessen

`[cmd]` **Was die KARTE faerbt:**

    triceps-longum      -> Triceps Brachii Long Head
    triceps-lateralis   -> Triceps Brachii Lateral Head
    triceps-mediale     -> Triceps Brachii Medial Head

`[cmd]` **Wo das VOLUMEN liegt:**

    Triceps   305 Uebungszuordnungen
              Eltern: Arms

`[cmd]` **Und `MUSCLE_STATE` in `motor.ts`:**

    triceps: { hours: 38, sets: 12, soreness: 1,
               lastSession: 'Push B - Wed' }

`[read]` **Drei Stellen, drei Kennungen:**

    Karte       triceps-longum, -lateralis, -mediale
    Hierarchie  Triceps  (und drei Koepfe darunter)
    motor.ts    triceps

`[read]` **Die Karte faerbt die KOEPFE, der Wert haengt am
ELTERNTEIL, und die Uebersetzung fehlt.**

`[read]` **Also: orange auf der Karte, `--` in der Liste.**

## Was zu bauen ist

**1** ? **Die Uebersetzung `motor.ts` -> `muscle_groups`.**

`[cmd]` **`MUSCLE_STATE` hat 18 Schluessel** ? `chest`,
`front_deltoids`, `triceps`, `upper_back`, `biceps` ...

`[cmd]` **`muscle_groups` hat 105 Namen.**

`[read]` **Miss, welche der 18 einen Gegenpart haben** ?
`triceps` **-> `Triceps` ist offensichtlich, `upper_back` nicht
(die Gruppe heisst `Upper Back`, aber die Karte hat sie
aufgeteilt).**

`[read]` **Wo eine Zuordnung nicht eindeutig ist: MELDEN.**

**2** ? **Ein Wert am Elternteil vererbt sich NICHT nach unten.**

`[read]` **Wenn `Triceps` 38h hat, haben die drei Koepfe KEINE
38h** ? **sie haben keinen eigenen Wert.**

`[read]` **Aber die Gruppe `Triceps` zeigt ihn.**

`[cmd]` **Dann faerbt die Karte die Koepfe nach dem Wert der
GRUPPE** ? **und die Liste sagt es:**

    Triceps                     38%  1/3 - 38h
      Triceps Brachii Long Head  --   Wert von der Gruppe
      ...

`[read]` **Oder die Karte faerbt sie NICHT** ? **Toms
Entscheidung.**

`[read]` **Was nicht geht: orange faerben und `--` schreiben.**

**3** ? **Die Hauptgruppen abgrenzen.**

Tom: *,,hauptgruppen sollen besser ersichtlich sein und gegen
naechste hauptgruppe unterteilt sein."*

`[cmd]` **Acht Wurzeln:** `Arms`, `Back`, `Chest`, `Core`,
`Legs`, `Neck Muscles`, `Shoulders`, **plus eine.**

`[read]` **Heute stehen sie in derselben Schriftgroesse wie die
Kinder, nur linksbuendig** ? **`Arms` und `Biceps` sehen
gleich wichtig aus.**

`[read]` **Eine Trennlinie zwischen den Wurzeln, und die Wurzel
deutlich groesser oder anders gesetzt.**

## Und die Laenge

`[cmd]` **Die Kachel ist 2.551 px** ? **zwei Bildschirme.**

`[read]` **G-436 hat gefragt, Tom hat nicht geantwortet** ?
**miss, ob die Abgrenzung es besser lesbar macht.**

`[read]` **Wenn nicht: melden, nicht kuerzen.**

## Abnahmebedingungen

    A1  die 18 motor.ts-Schluessel gegen muscle_groups.
        TABELLE: Schluessel, Gegenpart, oder MELDUNG.
    A2  kein Muskel ist auf der Karte gefaerbt und in
        der Liste leer. Gemessen an ALLEN 43 Flaechen.
    A3  wo ein Wert von der Gruppe kommt, sagt die Liste
        es. Foto.
    A4  die acht Wurzeln sind abgegrenzt. Foto
        vorher/nachher.
    A5  Gegenprobe: eine Flaeche gefaerbt ohne
        Listenwert -> faellt sie?
    A6  vier Module unveraendert, je ein Foto.
    A7  apps/web 1676 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**KEINEN Wert nach unten vererben** ? **die Koepfe haben keine
eigene Messung.**

**KEINE Zuordnung erfinden** ? **wo `motor.ts` und
`muscle_groups` nicht zusammenpassen, wird es gemeldet.**

**`motor.ts` nicht umbauen** ? **sie rechnet, das bleibt.**

**Nichts in `supabase/`** ? **Codex arbeitet an C-485 und
C-486.**

Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

**Erledigt.** Der Widerspruch ist weg: `Triceps Brachii Long Head
52% · Wert von Triceps` statt orange und „--".

### Die Ursache lag tiefer als die fehlende Uebersetzung

`[cmd]` **Gemessen** (`tools/_g438-zuordnung.mjs`): **neun Flaechen
trugen `name: null`** mit dem Vermerk *„muscle_groups fuehrt
`Triceps` als Blatt, die drei Koepfe haben dort keinen Namen."*

**Das stimmt seit C-482 nicht mehr** — alle neun stehen in der
Datenbank:

    Triceps Brachii Long / Lateral / Medial Head
    Vastus Lateralis, Vastus Medialis
    Gastrocnemius Lateral / Medial Head
    Serratus Anterior, External Oblique

`[read]` **Eine Flaeche ohne Namen hat keine Listenzeile** — die
Karte faerbte sie, die Liste kannte sie nicht. **Das war Toms
Befund, und die fehlende Uebersetzung war nur die zweite Haelfte.**

**Nach Toms Entscheidung (Weg 1) eingetragen** — Berichtigung, keine
Erfindung. **Die Wege sind gemessen, nicht geraten:**

    Triceps Brachii Long Head   Arms > Triceps > …
    Gastrocnemius Lateral Head  Legs > Lower Legs > Calves > …
    External Oblique            Core > Obliques > …

### A1 — die 18 Schluessel gegen `muscle_groups`

    Schluessel        Gegenpart              Vol.  Kinder
    ────────────────────────────────────────────────────────
    chest             Chest                   211    2
    biceps            Biceps                  293    1
    triceps           Triceps                 305    3
    trapezius         Trapezius                42    0
    obliques          Obliques                220    2
    quadriceps        Quadriceps              353    3
    forearm           Forearms                214    3
    hamstring         Hamstrings              382    3
    calves            Calves                  199    3
    adductor          Adductors                31    5
    upper_back        Upper Back              331    4
    lower_back        Lower Back              193    1
    abs               Abdominals              147    2   *
    gluteal           Glutes                  403    4   *
    neck              Neck Muscles              4    4   *
    front_deltoids    Front Shoulders           9    0   *
    back_deltoids     Rear Deltoids             7    0   *
    ────────────────────────────────────────────────────────
    abductors         MELDUNG

`*` **Der erste Lauf meldete diese fuenf als „kein Name in
muscle_groups".** `[cmd]` **Sie existieren, nur unter anderem
Namen** — erst gesucht, dann gemeldet.

**Die eine Meldung, mit Grund:**

`abductors` — `muscle_groups` fuehrt „Abductors" (2) und „Hip
Abductors" (30), **aber die Karte zeichnet die Aussenseite des
Oberschenkels nicht**, nur `adductors`. `[read]` **Eine Zuordnung
waere folgenlos: es gibt keine Flaeche, die sie faerben koennte.**
**Steht seit G-26 in `OHNE_ENTSPRECHUNG`.**

### A2 — kein gefaerbter Muskel ohne Listenwert

`[cmd]` **Gemessen an ALLEN gefaerbten Flaechen** — als Probe, nicht
als Stichprobe (`g438-zuordnung.test.ts`). `[read]` **Der Abgleich
gehoert dorthin, weil `KARTE_ZU_RECOVERY` zur Laufzeit gerechnet
wird** — ein Regex darueber liest 0 Eintraege (die Lehre aus
G-436).

    43 Flaechen auf der Karte gefaerbt
     0 davon ohne Listenwert

### A3 — die Herkunft steht an der Zeile

`[cmd]` **Am Schirm** (`tools/_g438-schirm.mjs`): **27 Zeilen
tragen „Wert von …".**

    Triceps Brachii Long Head    52%  Wert von Triceps
    Triceps Brachii Lateral H.   52%  Wert von Triceps
    Brachioradialis              32%  Wert von Forearms
    Forearm Extensors            32%  Wert von Forearms

`[read]` **Geliehene Werte stehen gedaempft** (`--fg-muted`, ohne
Fettung) — **eine eigene Messung sieht anders aus als eine
geliehene.**

`docs/bilder/g438/a2-nachher.png`

### Toms drei Auflagen — alle drei in der RECHNUNG, nicht in der Ansicht

    1  „Wert von X" steht AM KIND        -> `vonGruppe` am Knoten
    2  kein Schnitt ueber geliehene      -> `.filter(k => !k.vonGruppe)`
    3  geliehen ist KEIN Engpass         -> im Engpass ausgeschlossen

`[read]` **In der Rechnung, weil die Ansicht sie sonst umgehen
koennte** — und weil die Gegenprobe sie dort greifen kann.

**Von Hand nachgerechnet** (`g438-geliehen.test.ts`): drei
Trizepskoepfe, alle 41 von `Triceps` geliehen.

    Schnitt von `Triceps`   null   (nicht 41 — Scheinrechnung)
    Engpass unter `Triceps` null
    Engpass unter `Arms`    Triceps 41, NICHT ein Kopf

**Und die Gegenrichtung mitgeprueft:** ein gemessener Bizeps mit 12
bleibt Engpass, auch wenn daneben geliehene 90er stehen. `[read]`
**Sonst waere die Regel zu grob und verdeckte echte Engpaesse.**

**Eine Nebenwirkung, die ich benannt habe:** eine Gruppe, deren
Kinder ihren Wert alle von IHR geliehen haben, hat keinen Schnitt —
richtig so. `[cmd]` **Aber dann stuende sie stumm da.** **Die Zeile
sagt jetzt `Kinder ohne eigene Messung`** statt nichts (E-72).

### A4 — die Wurzeln abgegrenzt

`[cmd]` **Am Schirm gemessen, nicht am Quelltext:**

    Wurzel   13.5px  Dicke 700  uppercase  Abstand 10px
    Kind       12px  Dicke 600  none
    Trennlinien in der Kachel: 8

`docs/bilder/g438/a4-nachher.png`

**Ein Befund zur Auftragszahl:** `[cmd]` **Der Auftrag nennt acht
Wurzeln — `muscle_groups` fuehrt SIEBEN.**

    Arms (3)  Back (4)  Chest (2)  Core (3)
    Legs (11)  Neck Muscles (4)  Shoulders (3)

`[read]` **Nicht korrigiert, sondern gemessen und gemeldet** — es
ist keine achte da, die ich haette abgrenzen koennen.

### A5 — Gegenprobe: 8 Sabotagen, alle rot

    ROT  AUFLAGE 2: geliehene Kinder fliessen in den SCHNITT ein
    ROT  AUFLAGE 3: ein geliehener Wert wird ENGPASS
    ROT  AUFLAGE 1: die Herkunft faellt aus dem Ergebnis
    ROT  AUFLAGE 1: die Liste schreibt die Herkunft nicht mehr an
    ROT  A2: die Uebersetzung faellt weg
    ROT  A2: ein Name wird ERFUNDEN statt gemeldet
    ROT  A2: die C-482-Namen fallen wieder auf `name: null`
    ROT  ein Schluessel ist WEDER zugeordnet NOCH gemeldet

**Ein blinder Fleck, den die Gegenprobe fand:** die Sabotage
*„`triceps-longum` faellt auf `name: null` zurueck"* blieb
**GRUEN** — `[read]` **die A2-Probe haelt eine namenlose Flaeche fuer
„nicht gezeichnet", also fuer keinen Widerspruch.** `[cmd]`
**Genau so war Toms Befund entstanden.** **Dafuer gibt es jetzt
einen eigenen Waechter ueber die neun Namen.**

### Vier fremde Waechter, die ich umgedreht habe

`[cmd]` **Drei Zusagen zementierten `name: null`** mit der
Begruendung *„muscle_groups fuehrt ihn nicht"*:

    G-432: die drei Vastus stehen NICHT in EBENEN
    G-433: quadriceps ist in seine Straenge zerlegt
    G-433: der Trizeps ist in seine drei Koepfe zerlegt

`[read]` **Die Begruendung ist seit C-482 falsch** — und solange
sie galt, war Toms Widerspruch unbehebbar. **Das ist die Lehre
`waechter-kann-die-entscheidung-verbieten`:** eine Zusage ueber eine
Abwesenheit blockiert spaeter genau deren Behebung.

`[cmd]` **Umgedreht, nicht gestrichen** — und die Regel ist
schaerfer geworden: **in `EBENEN` steht ein Name genau dann, wenn
`muscle_groups` ihn fuehrt.** `[read]` **`Vastus Intermedius` zeigt,
dass sie noch beisst** — den gibt es dort NICHT, und er bleibt
verboten.

**Der vierte** war eine Zahl: `21 gezeichnete Namen` -> **31**,
weil neun dazukamen. **Spanne eng gelassen** (29–34), damit sie
weiter einen Rechenfehler faengt.

**Und zwei eigene Gegenproben mussten nachgezogen werden** (G-436:
der Schnitt-Code hat sich durch Auflage 2 geaendert). **Danach
beide wieder ALLE ROT.**

### A6 — vier Module unveraendert

    recovery      Kacheln 17  Kartenflaechen 43  neu 9  alt 0  Fehler 0
    supplements   Kacheln 14  Kartenflaechen 43  neu 9  alt 0  Fehler 0
    medical       Kacheln 11  Kartenflaechen  0  neu 0  alt 0  Fehler 0
    coach         Kacheln 13  Kartenflaechen  0  neu 0  alt 0  Fehler 0

### A7 — Proben

    apps/web    1689 von 1693   (verlangt: 1676 oder mehr)
    apps/coach    65 von 65

**Die vier roten sind die bekannten aus G-435, keine neu:**

    2x  C-73 / Flaechenziel   C-482-Folge
    2x  Supplements-Attrappen meine C-484-Konfliktloesung

`[read]` **Der erste dieser beiden Punkte ist durch diesen Auftrag
kleiner geworden** — neun der zehn C-482-Namen haben jetzt eine
Flaeche. **`Posterior Neck Muscles` bleibt offen: keine Flaeche
zeigt ihn.**

### Geaendert

    lib/koerper/schluessel-gruppe.ts     NEU — die Uebersetzung
    lib/koerper/ebenen.ts                9 Namen eingetragen
    lib/koerper/muskelbaum.ts            vonGruppe + Auflagen 2/3
    v2/recovery/tab-messwerte.tsx        Herkunft, Wurzeln, 4. Grund
    lib/koerper/__tests__/
      g438-zuordnung.test.ts             NEU, 7 Waechter
      g438-geliehen.test.ts              NEU, 6 Waechter
      g432-ebenen.test.ts                3 Zusagen umgedreht
      g432-muskelbaum.test.ts            Deckung 21 -> 31
      g436-zustaende.test.ts             gezeichnet 22 -> 31

    tools/_g438-zuordnung.mjs   A1
    tools/_g438-schirm.mjs      A2/A3/A4
    tools/_g438-sabotage.mjs    A5

**`motor.ts` nicht angefasst. Nichts in `supabase/`.
Nicht committet, nicht gestaget.**

### Neustart noetig?

`[read]` **Nein** — nur `apps/web/src`.


## Abnahme

_(vom Orchestrator)_
