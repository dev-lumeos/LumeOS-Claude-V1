---
nr: G-445
typ: fehler
modul: recovery
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-440
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 74a2fdfc
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/tab-messwerte.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-445 — ein nie trainierter Muskel ist ERHOLT, nicht unbekannt

## Toms Befund

Tom, 2026-09-08:

> selbst wenn es nur 6 uebungen sind, wo liegt die logik, dass
> dann nur die muskeln der uebungen gruen gezeigt werden? dann
> sollten alle nicht verwendeten muskeln zumindest sicher mal
> gruen sein und die gebrauchten anhand der daten

`[read]` **Er hat recht. Das ist ein Denkfehler in der Rechnung,
kein Datenproblem.**

## Die Logik

`[read]` **Ein Muskel, der nie trainiert wurde, ist
VOLLSTAENDIG ERHOLT.**

`[read]` **Nicht *,,unbekannt"*, nicht grau** ? **100 %,
gruen.**

`[cmd]` **Die Erholungsformel sagt es selbst:**

    base(hours)   Stunden seit der letzten Belastung
                  -> nie belastet = unendlich
                  -> vollstaendig erholt

`[read]` **Die Rechnung behandelt *,,nie trainiert"* wie
*,,keine Daten"*** ? **das sind zwei verschiedene Sachen.**

## Was gemessen ist

`[cmd]` **6 Uebungen im Seed, 132 Saetze.**

`[cmd]` **Sie treffen 11 Muskeln, davon haben 3 eine
Kartenflaeche.**

`[read]` **Die anderen 40 Flaechen sind nicht *,,unbekannt"* ?
sie sind UNBELASTET.**

## Die drei Zustaende, berichtigt

    heute                     richtig
    ----------------------    ----------------------
    Wert (gemessen)           Wert (gemessen)
    "kein Volumen zugeordnet" ERHOLT, 100 %
    "nicht gezeichnet"        (bleibt)

`[read]` **Der mittlere Zustand faellt weg** ? **er war nie ein
Zustand, er war eine fehlende Antwort.**

### Wo die Grenze bleibt

`[read]` **Ein Muskel, den KEINE Uebung anspricht, ist etwas
anderes als einer, den dieser Nutzer nie trainiert hat.**

`[cmd]` **`exercise_muscles` hat 6.744 Zuordnungen auf 90
Muskelgruppen** ? **wer dort nicht vorkommt, kann nie trainiert
werden.**

`[read]` **Das gehoert weiter benannt** ? **aber es ist ein
KATALOGbefund, kein Erholungswert.**

    im Katalog, nie trainiert    -> 100 %, gruen
    nicht im Katalog             -> gemeldet, eigene Marke

## Und die Karte

`[cmd]` **43 Flaechen, heute 3 mit Wert.**

`[read]` **Nachher: 43 Flaechen, 3 mit gerechnetem Wert,
40 gruen.**

`[read]` **Das ist das Bild, das Tom erwartet** ? **und es ist
auch das RICHTIGE: wer sechs Uebungen macht, hat den Rest des
Koerpers frisch.**

## Was NICHT zu tun ist

**KEINEN Wert erfinden** ? **100 % ist kein erfundener Wert, es
ist die Antwort der Formel auf *,,nie belastet"*.**

**Die Unterscheidung NICHT verlieren** ? **wer im Detail
nachsieht, muss erkennen, ob ein Muskel gerechnet oder
unbelastet ist.**

`[read]` **Ein Hinweis wie *,,unbelastet"* neben den 100 %.**

## Abnahmebedingungen

    A1  ein nie trainierter Muskel zeigt 100 %, gruen.
        Foto Karte, Foto Liste.
    A2  der Zustand "kein Volumen zugeordnet" ist weg.
    A3  im Detail steht, ob gerechnet oder unbelastet.
    A4  ein Muskel, den KEINE Uebung anspricht: eigene
        Marke, gemeldet. Zahl.
    A5  die 3 gerechneten Werte sind unveraendert.
        Gemessen vorher/nachher.
    A6  Gegenprobe: ein Muskel mit Saetzen zeigt NICHT
        100 % -> faellt sie?
    A7  vier Module unveraendert.
    A8  apps/web 1707 oder mehr, apps/coach 65.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

**Claude Code, 2026-09-13.**

### Die Stelle

`[cmd]` **Eine Zeile, zweimal:**

    tab-messwerte.tsx:171   if (!st) return { value: null }   (Karte)
    tab-messwerte.tsx:275   if (!st) return null              (Liste)

`[read]` **Kein Eintrag im Zustand hiess: kein Wert.** `[read]`
**Und *kein Eintrag* entsteht aus ZWEI verschiedenen Gruenden** —
nie trainiert, oder von keiner Uebung erreichbar. **Die Rechnung
kannte den Unterschied nicht.**

### Dass 100 % kein erfundener Wert ist — belegt

`[cmd]` **Die Formel in `motor.ts:145` gemessen, nicht
behauptet:**

    baseRecoveryCurve(Infinity)                    = 100
    calc(Inf, 0 Saetze, Schlaf 7, Kater 0).value   = 100

`[read]` **`base(hours)` sind die Stunden seit der letzten
Belastung.** `[read]` **Nie belastet ist unendlich, und die Kurve
gibt ab 96 h glatt 100** — **die Zahl faellt aus derselben Formel
wie jede andere, sie wird nirgends gesetzt.**

`[cmd]` **Und die Formel bleibt unangetastet:** **wer Muskelkater
meldet, bekommt auch unbelastet keine 100** —
`calc(Inf, 0, 7, Kater 2) = 83`. `[read]` **Das ist kein
Sonderfall, sondern `sorenessMod`** — die Pauschale haette ihn
zugedeckt.

### A1 — ein nie trainierter Muskel zeigt 100 %, gruen

`[cmd]` **Foto Karte UND Liste, 1920 breit:**

    vorher   backup/x-g445-vorher-breit.png
    nachher  backup/x-g445-nachher-breit.png

`[read]` **Die Karte war vorne wie hinten ueberwiegend grau** —
**jetzt ist sie durchgehend gruen**, bis auf das, was wirklich
keine Flaeche hat.

`[cmd]` **In der Liste, Zeile fuer Zeile:**

    Brachialis          100%  unbelastet · nie trainiert
    Wrist Extensors     100%  unbelastet · nie trainiert
    Grip Muscles        100%  unbelastet · nie trainiert

### A5 — die gerechneten Werte sind UNVERAENDERT

`[cmd]` **Vorher- und Nachherbild nebeneinander gelesen, drei
Zeilen mit Messung:**

    Zeile      vorher                        nachher
    Biceps     100%  1327 h · 6 Saetze · Pull 4   identisch
    Forearms   100%  1327 h · 3 Saetze · Pull 4   identisch
    Triceps    100%   607 h · 7 Saetze · Push 6   identisch

`[read]` **Stunden, Saetze und Sitzungsname stehen unveraendert
da** — **die Aenderung fasst den gerechneten Zweig nicht an.**

`[cmd]` **Und eine Probe sichert es ab** (`G-445/A6`): **ein
frisch trainierter Muskel, 2 h nach 20 Saetzen, muss unter 50
liegen.** `[read]` **Faellt sie, ist die Rechnung durch eine
Pauschale ersetzt worden.**

### A2 — „kein Volumen zugeordnet" ist weg

`[cmd]` **Er stand an ZWEI Stellen, nicht einer:**

    tab-messwerte.tsx:423   die Liste
    modale.tsx:265          das Gruppenfenster

`[cmd]` **`grep "kein Volumen zugeordnet"` ueber `apps/` und
`packages/`: kein Treffer mehr in gezeigtem Text.**

`[read]` **Er war nie ein Zustand, sondern eine fehlende
Antwort.**

### A3 — im Detail steht, ob gerechnet oder unbelastet

`[cmd]` **Drei sichtbar verschiedene Zeilen, alle im Nachherbild:**

    100%  1327 h · 6 Saetze · Pull 4    gerechnet
    100%  unbelastet · nie trainiert    unbelastet
      --  keine Uebung trifft ihn       nicht im Katalog

`[read]` **Ohne den Zusatz saehen die ersten beiden gleich aus** —
**zweimal 100 %.** `[read]` **Der Zusatz ist die ganze
Unterscheidung**, und er steht AN DER ZEILE, nicht in einer
Fussnote.

`[cmd]` **Die Herkunft ist maschinenlesbar, nicht nur Text:**
`Herkunft = 'gerechnet' | 'unbelastet' | 'nicht-im-katalog'`.

### A4 — die Grenze, gemessen

`[cmd]` **Gemessen 2026-09-13, `training`-Schema, alle Konten:**

    muscle_groups gesamt                    105
    davon in exercise_muscles                90
    davon in KEINER Uebung                   15
    exercise_muscles Zuordnungen          6.744

`[read]` **Die 15 kann keine Uebung treffen** ? **„erholt" waere
dort eine Aussage ueber etwas, das nie stattfinden kann.**

`[cmd]` **Sie tragen eine eigene Marke: `keine Uebung trifft
ihn`** — **im Bild an den drei Trizepskoepfen zu sehen.**

`[cmd]` **Und die 15 mit Namen:**

    Arms · Back · Legs · Lower Back · Neck Muscles
    External Oblique · Serratus Anterior
    Triceps Brachii Long / Lateral / Medial Head
    Vastus Lateralis · Vastus Medialis
    Gastrocnemius Lateral / Medial Head
    Posterior Neck Muscles

`[read]` **Neun davon sind genau die Namen aus C-482** ? **die,
die G-443 gestern eine Kartenflaeche bekamen.** `[read]` **Sie
sind gezeichnet, aber noch in keiner Uebung** — **ein offener
Katalogbefund, kein Anzeigefehler.**

### A6 — Gegenprobe, in beide Richtungen

`[cmd]` **Sabotage 1: den gerechneten Zweig abschalten**
(`if (false && st)`) — **die Unbelastet-Regel verschluckt jeden
gemessenen Wert:**

    not ok 1  ein Muskel MIT Saetzen ist gerechnet
    not ok 4  Saetze schlagen die Katalogfrage
    not ok 7  A6: ein Muskel MIT Saetzen zeigt NICHT unbelastet-100
    not ok 10 die drei Zustaende aus EINER Messreihe
    # pass 6  # fail 4

`[cmd]` **Sabotage 2: `Set` statt Liste** — **die Grenzprobe
faellt:**

    not ok 8  katalogMuskeln zaehlt jede Muskelgruppe genau einmal
    not ok 9  katalogMuskeln liefert eine LISTE, kein Set

`[cmd]` **Beide zurueckgespielt: 10 / 10 gruen.**

### Der Waechter, der fiel — und warum er recht hatte, aber falsch mass

`[cmd]` **Nach der Aenderung fiel `g440-datenquellen.test.ts`:**

    'Die Kachel liest den gerechneten Zustand nicht'

`[cmd]` **Er suchte die Zeichenkette `muskelzustand?.zustaende[`**
— **mit Klammer.** `[cmd]` **G-445 leitet den Zugriff ueber
`muskelLage(id, muskelzustand?.zustaende ?? {}, katalog)`** —
**die Verdrahtung blieb, die Schreibweise nicht.**

`[read]` **Das ist die Lehre `waechter-prueft-zeilenform-statt-
sache`** — **er prueft die Zeilenform, nicht die Wirkung.**

`[cmd]` **Berichtigt auf die FRAGE: kommt der gerechnete Zustand
an, und geht er in die Formel?**

`[cmd]` **Und belegt, dass er dadurch NICHT blind wurde** —
**Sabotage `zustaende -> MUSCLE_STATE` eingesetzt:**

    not ok 1  die Muskelkacheln rechnen NICHT aus einer festen Tabelle

`[read]` **Er faengt den echten Rueckfall weiter.** `[read]`
**Eine gelockerte Zusicherung ohne diesen Beleg waere eine
Blendung gewesen.**

### Ein Befund, den ich NICHT behoben habe

`[cmd]` **`modale.tsx:171` rechnet das Gruppenfenster weiter aus
`MUSCLE_STATE`** — **den 18 festen Mockup-Zeilen aus G-440.**

`[cmd]` **`GruppenDetailModal` bekommt `muskelzustand` gar nicht
als Prop** (`modale.tsx:156`).

`[read]` **Das ist derselbe Befund wie G-440/G-441, an einer
dritten Stelle** — **und er gehoert dorthin, nicht in G-445.**

`[cmd]` **Was ich getan habe: den Satz ehrlich gemacht.** **Statt
`kein Volumen zugeordnet` (eine erfundene Ursache) steht dort
jetzt `in diesem Fenster nicht gerechnet (G-441)`** — **die
Luecke wird benannt, nicht zugedeckt** (E-72).

`[read]` **Das Fenster anzubinden waere eine zweite Aenderung im
selben Durchgang gewesen.**

### A7 — vier Module unveraendert

`[cmd]` **Nicht nur angesehen, sondern belegt:**
**`grep -rln "muskelzustand"` ueber `apps/web/src` ausserhalb von
`recovery/`: kein Treffer.** `[read]` **Der geaenderte Leseweg
wird von nichts anderem benutzt.**

`[cmd]` **Und geladen, je Modul die Attrappenzahl:**

    /v2/nutrition     1 Attrappe
    /v2/training     11
    /v2/supplements  14
    /v2/goals        19
    /v2/medical      14

### A8 — Bestand

`[cmd]` **`apps/web`: 1717 Pruefungen, 1717 gruen, 0 rot**
(vorher 1707 — **die zehn neuen sind meine G-445-Proben**).

`[cmd]` **`apps/coach`: 65 Pruefungen, 65 gruen, 0 rot.**

`[cmd]` **`pnpm --filter @lumeos/web build`: gruen**,
`/v2/recovery` **44,3 kB / 186 kB.** `[cmd]` **`tsc --noEmit`:
gruen.**

### Was ich angefasst habe

    apps/web/src/lib/training/muskelzustand.ts        muskelLage,
                                                     katalogMuskeln
    apps/web/src/lib/training/muskelzustand-read.ts   imKatalog
    apps/web/src/app/v2/recovery/tab-messwerte.tsx    Karte + Liste
    apps/web/src/app/v2/recovery/modale.tsx           nur der Satz
    apps/web/src/lib/koerper/__tests__/
      g440-datenquellen.test.ts                       Zeilenform -> Sache
    apps/web/src/lib/training/__tests__/
      g445-nie-trainiert.test.ts                      NEU, 10 Proben

`[read]` **Nichts in `supabase/`** ? **die Messungen waren
ausschliesslich lesend.**

`[read]` **Nicht committet, nicht gestaged.**

### Eine Falle, die ich vermieden habe

`[cmd]` **`imKatalog` ist eine LISTE, kein `Set`** — **der Stand
geht von `page.tsx` (Server) als Prop nach `ansicht.tsx`
(`'use client'`), und ein `Set` kaeme dort als `{}` an** (die
Lehre `map-ueberlebt-die-client-grenze-nicht`).

`[read]` **Waere es ein `Set` geblieben, waere der Katalog auf der
Client-Seite leer** — **und JEDER Muskel haette als *nicht im
Katalog* gegolten.** `[cmd]` **Die Karte waere wieder grau
gewesen, und `tsc` waere gruen geblieben.**

`[cmd]` **Eine eigene Probe haelt es fest** (`JSON.stringify` auf
`["m1"]`).

### Neustart

`[read]` **Keiner noetig** ? **nur `apps/web/src/`, heisses
Nachladen.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    Proben        1717/1717, apps/coach 65/65
    Marken        unbelastet in drei Dateien
    "kein Volumen" nur noch in Kommentaren,
                  die den alten Zustand beschreiben

### Der Beweis, dass 100 % nicht erfunden ist

> *,,`baseRecoveryCurve(Infinity) = 100`, gemessen.
`base(hours)` ist Stunden seit der letzten Belastung; nie
belastet = unendlich. Der Wert FAELLT AUS DERSELBEN FORMEL wie
jeder andere ? nichts wird irgendwo gesetzt."*

`[read]` **Genau die Auflage** ? **kein Sonderfall, keine
Ausnahme im Code.**

`[cmd]` **Und die Formel bleibt heil: ein gemeldeter Muskelkater
von 2 gibt weiter 83, nicht 100.**

### A5 zeichengenau

> *,,Die drei gerechneten Zeilen sind ZEICHENIDENTISCH: Biceps
1327 h - 6 Saetze - Pull 4, Forearms 1327 h - 3 Saetze - Pull 4,
Triceps 607 h - 7 Saetze - Push 6."*

`[read]` **Er hat die zwei Bilder nebeneinander gelesen** ?
**nicht behauptet, dass sich nichts geaendert hat.**

### A2 war an ZWEI Stellen

`[cmd]` **`tab-messwerte.tsx:423` UND `modale.tsx:265`** ?
**mein Auftrag nannte eine.**

### A3 maschinenlesbar

`[cmd]` **`Herkunft = gerechnet | unbelastet |
nicht-im-katalog`.**

`[read]` **Nicht drei Texte, die gleich aussehen** ? **drei
Werte, die ein Waechter unterscheiden kann.**

### A4: 15 von 105

`[cmd]` **15 Muskelgruppen kommen in KEINER Uebung vor
(90 tun es, 6.744 Zuordnungen).**

> *,,Neun der fuenfzehn sind genau die C-482-Namen, denen G-443
gestern Flaechen gegeben hat ? gezeichnet, aber noch in keiner
Uebung."*

`[cmd]` **Als G-447.**

### Ein Waechter gelockert, mit Gegenprobe

> *,,`g440-datenquellen.test.ts` suchte die Zeichenkette
`muskelzustand?.zustaende[`; meine Aenderung geht ueber
`muskelLage(...)`, also hielt die Verdrahtung, aber der Text
nicht ? die Zeilenform-statt-Sache-Falle."*

`[cmd]` **Umgeschrieben auf die FRAGE, dann belegt, dass er
nicht blind wurde: `zustaende` -> `MUSCLE_STATE` faellt weiter
durch.**

### Und ein Befund, den er NICHT behoben hat

`[cmd]` **`modale.tsx:171`: das Gruppenfenster rechnet weiter
aus `MUSCLE_STATE`** ? **es bekommt `muskelzustand` gar nicht
uebergeben.**

`[read]` **Der G-440/G-441-Befund in einer DRITTEN Stelle.**

> *,,Ich habe nur seinen Text ehrlich gemacht: *in diesem
Fenster nicht gerechnet (G-441)* statt einer erfundenen
Ursache."*

**Abgenommen.**


