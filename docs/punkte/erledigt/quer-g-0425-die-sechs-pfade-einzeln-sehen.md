---
nr: G-425
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-424
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 879a548e
beruehrt:
  dateien:
    - packages/ui/src/koerperkarte-pfade.ts
zahlen:
  gemessen: 2026-09-08
  pfade: 6
---

# G-425 — die sechs Pfade einzeln sehen

## Toms Frage

Tom, 2026-09-08:

> ich sehe die einzelnen muskeln und ich bin mir sicher, die sind
> einzeln ansteuerbar.

> wieso sollte jemand so ein tool bauen, wo man einzelne muskeln
> sieht, und dann in unlogische gruppen unterteilt mit nicht
> anatomischen namen?

## Was gemessen ist

`[cmd]` **`packages/ui/src/koerperkarte-pfade.ts:129`,
`'upper-back'`, `side: 'back'`, SECHS Pfade.**

`[cmd]` **Je Pfad der absolute Startpunkt:**

    1   x  987  y 381    227 Zeichen
    2   x 1018  y 405    192
    3   x 1017  y 583    472
    4   x 1141  y 398    264
    5   x 1150  y 405    260
    6   x 1161  y 420    505

`[cmd]` **Die Figur ist bei `x ~ 1064` mittig** ? **`trapezius`
`paths_back` beginnt bei 1071 und 1164.**

`[read]` **Also drei Paare, links und rechts:**

    1 / 4    aussen oben
    2 / 5    innen oben
    3 / 6    unten

`[cmd]` **Und Pfad 3 beginnt bei `y=583`** ? **178 Punkte tiefer
als die anderen, mit 472 Zeichen einer der laengsten.**

`[read]` **Der Latissimus zieht vom Ruecken bis zur Taille** ?
**die Lage passt.**

## Was die SSOT bisher sagt

`[cmd]` **`docs/ssot/104-muskelkarte.md:283`:**

> *,,`lat_*` braucht keine Sammelgruppe. Der Latissimus hat keine
> eigene Flaeche ? er steckt in `upper-back`, das mit sechs
> Pfaden den ganzen oberen Ruecken zeichnet."*

`[read]` **Das wurde geschrieben, ohne die sechs Pfade einzeln
anzusehen.**

`[cmd]` **Und `muskel-ebenen.ts:55-60` wirft SECHS Muskeln auf
dieselbe Flaeche:**

    Back, Upper Back, Mid Back,
    Rhomboids, Teres Major, latissimus dorsi

## Der Auftrag

**Faerbe jeden der sechs Pfade EINZELN ein und fotografiere ihn.**

`[read]` **Sechs Bilder, je ein Pfad in Akzentfarbe, die anderen
fuenf grau.**

`[read]` **Dann ist zu sehen, welcher Muskel welcher ist.**

`[cmd]` **Dasselbe fuer `lower-back` (2 Pfade) und `trapezius`
(`paths_back`, 2 Pfade)** ? **damit die Nachbarschaft klar
ist.**

## Und dann die Frage beantworten

`[read]` **Ist die Gruppierung anatomisch, oder ist sie
willkuerlich?**

`[cmd]` **Messen, ob dasselbe Muster anderswo auftritt:**

    trapezius   'both', paths_front UND paths_back
    triceps     'both'
    gluteal     'back'

`[read]` **Wie viele Flaechen haben mehrere Pfade, und ist die
Zusammenfassung dort anatomisch begruendet?**

`[cmd]` **`104-muskelkarte.md:526` fuehrt eine Pfadzahl je
Flaeche** ? **lies sie.**

## Abnahmebedingungen

    A1  sechs Bilder, je ein Pfad von `upper-back` allein
        eingefaerbt. DUNKEL.
    A2  dazu `lower-back` (2) und `trapezius` `paths_back` (2).
    A3  je Pfad: welcher Muskel ist das? Benannt, mit
        Begruendung aus dem Bild.
    A4  wie viele Flaechen haben mehrere Pfade, und wie
        viele davon sind anatomisch zusammengehoerig?
        Tabelle.
    A5  ein Vorschlag: welche der 21 Flaechen sollten
        aufgeteilt werden, welche nicht.
    A6  apps/web 1600 unveraendert.

## Was nicht zu tun ist

**`koerperkarte-pfade.ts` NICHT aendern** ? **das ist der
naechste Auftrag, wenn Tom entschieden hat.**

**Keine Pfade neu zeichnen.**

**Nichts in `supabase/`.**

Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

## Tom hat recht. Die Muskeln sind einzeln ansteuerbar.

`[cmd]` **Jeder Pfad einzeln eingefaerbt und angesehen**
(`tools/_g425-einzeln.mjs`, 18 Bilder in `docs/bilder/g425/`).

`[read]` **Die Zahlen sagen wo, das Bild sagt was** — und das Bild
sagt: **`upper-back` sind DREI verschiedene Muskeln, nicht einer.**

### A3 — je Pfad, welcher Muskel

    Pfad  Start        was im Bild steht
    ---------------------------------------------------------------
    1     x 987  y381  kleines Dreieck oben am Schulterblatt,
                       zwischen Wirbelsaeule und Schulter
                       -> Rhomboideus / Supraspinatus-Gegend
    2     x1018  y405  schmale Sichel am AUSSENRAND des
                       Schulterblatts, unter der hinteren Schulter
                       -> Teres major / minor
    3     x1017  y583  BREITES DREIECK von der Achsel bis zur
                       Taille, nach unten spitz zulaufend
                       -> LATISSIMUS DORSI, linke Seite
    4     x1141  y398  Spiegelbild von 1
    5     x1150  y405  Spiegelbild von 2
    6     x1161  y420  Spiegelbild von 3  -> LATISSIMUS, rechts

`[read]` **Pfad 3 und 6 sind die klassische Lat-Form:** breit unter
der Achsel, zur Taille hin schmal. **Kein anderer Rueckenmuskel hat
diesen Umriss.**

**Bilder:** `upper-back-1.png` bis `upper-back-6.png`

`[cmd]` **Eine meiner Vorannahmen war falsch, und das Bild hat sie
widerlegt:** aus den x-Werten hatte der Auftrag *„1/4 aussen oben,
2/5 innen oben"* abgeleitet. `[cmd]` **Am Bild ist es umgekehrt** —
Pfad 2 liegt WEITER AUSSEN als Pfad 1, obwohl sein x groesser ist.
`[read]` **Bei einer gespiegelten Figur heisst groesseres x auf der
linken Koerperhaelfte „weiter zur Mitte"** — die Zahl allein sagt es
nicht.

### A2 — die Nachbarschaft

**`trapezius`, `paths_back` (2 Pfade):**

    1   x1071 y309   das absteigende Dreieck vom Nacken bis
                     Mitte Wirbelsaeule, linke Haelfte
    2   x1164 y302   Spiegelbild

`[read]` **Eine Flaeche, ein Muskel, zwei Haelften** — richtig
zusammengefasst.

**`lower-back` — VIER Pfade, nicht zwei:**

    1   x 987 y627   kleiner Fleck seitlich ueber der Huefte
                     -> Flanke (Obliquus externus / QL)
    2   x1023 y608   langes Band NEBEN der Wirbelsaeule
                     -> Erector spinae, links
    3   x1091 y582   Spiegelbild von 2 -> Erector spinae, rechts
    4   x1151 y603   Spiegelbild von 1 -> Flanke rechts

`[cmd]` **Der Auftrag nennt zwei Pfade** — **gemessen sind es vier**,
in der Datei nachgezaehlt (`'lower-back'`, vier Zeichenketten).

`[read]` **Und es sind ZWEI verschiedene Muskeln:** die Flanke ist
nicht der Rueckenstrecker. **`muskel-ebenen.ts` fuehrt fuer
`lower-back` genau zwei Namen** — `Lower Back` und `erector spinae`.
**Die Flanke hat keinen.**

### A4 — alle 23 Flaechen, Pfade gegen Muskeln

`[cmd]` **Es sind 23 Flaechen, nicht 21.** `'upper-back'` und
`'lower-back'` stehen in Anfuehrungszeichen (der Bindestrich
verlangt es) — **wer nach nackten Schluesseln sucht, findet 21.**

`[cmd]` **158 Pfade insgesamt. ALLE 23 Flaechen haben mehr als
einen Pfad** — die Frage ist also nicht ob, sondern warum.

    Flaeche      Seite  Pfade  Muskeln   zusammengehoerig?
    ----------------------------------------------------------------
    upper-back   back      6      6      NEIN - 3 Muskelpaare
    lower-back   back      4      2      NEIN - 2 Muskelpaare
    obliques     front    16      2      ja  - Zacken eines Musters
    hands        both     23      0      ja  - Finger einer Hand
    forearm      both     14     17      ja  - Unterarmbuendel
    calves       both     12     10      ja  - Wade, mehrere Koepfe
    abs          front     8      5      ja  - Bauchsegmente
    adductors    both      8      8      ja  - Adduktorengruppe
    hamstring    back      8      4      ja  - drei Koepfe + Seiten
    triceps      both      8      1      ja  - DREI KOEPFE, ein Muskel
    neck         both      7      4      ja  - Halsmuskeln
    ankles       both      6      0      ja  - Gelenk, kein Muskel
    feet         both      6      0      ja  - Fuss
    quadriceps   front     6      9      ja  - vier Koepfe + Seiten
    deltoids     both      4      8      ja  - drei Koepfe + Seiten
    gluteal      back      4      8      ja  - Gesaess, Seiten
    knees        front     4      0      ja  - Gelenk
    trapezius    both      4      2      ja  - ein Muskel, zwei Seiten
    chest        front     2      5      ja  - Brust, zwei Seiten
    biceps       front     2      3      ja  - zwei Seiten
    tibialis     front     2      2      ja  - zwei Seiten
    head/hair    both      2      0      ja  - Kopf

`[cmd]` **ZWEI von 23 fassen verschiedene Muskeln zusammen** —
`upper-back` und `lower-back`. **Beide liegen am Ruecken.**

`[read]` **Der Gegenbeweis ist `triceps`:** 8 Pfade, aber nur EIN
Muskelname. `[cmd]` **Am Bild geprueft** (`triceps-3.png`): ein
schmaler Streifen am Oberarm — **ein Kopf des dreikoepfigen
Muskels.** `[read]` **Drei Pfade je Arm sind hier richtig
zusammengefasst**, weil es EIN Muskel mit drei Koepfen ist.

`[read]` **Also ist die Gruppierung NICHT durchgaengig
willkuerlich** — sie ist an zwei Stellen falsch, und beide betreffen
den Ruecken.

### Was `104-muskelkarte.md:526` wirklich fuehrt

`[cmd]` **Die Tabelle dort zaehlt MUSKELN je Flaeche, nicht Pfade.**
Die Ueberschrift lautet *„Die Verteilung je Fläche"* unter dem Satz
*„Alle 96 haben ein Ziel"* — **es sind die 96 Muskelnamen aus
`muskel-ebenen.ts`.**

`[read]` **Bei `upper-back` sind beide Zahlen zufaellig 6** — sechs
Muskelnamen auf sechs Pfaden. **Bei `triceps` nicht:** 1 Muskel, 8
Pfade. **Bei `obliques` auch nicht:** 2 Muskeln, 16 Pfade.

`[read]` **Wer die Tabelle als Pfadzahl liest, liegt bei 21 von 23
Flaechen falsch.**

### Und der Satz in der SSOT ist widerlegt

`[cmd]` **`104-muskelkarte.md:283` sagt heute:**

> *„`lat_*` braucht keine Sammelgruppe. Der Latissimus hat keine
> eigene Flaeche — er steckt in `upper-back`, das mit sechs Pfaden
> den ganzen oberen Ruecken zeichnet."*

`[cmd]` **Am Bild ist das falsch.** **Der Latissimus HAT eine eigene
Flaeche** — zwei sogar, Pfad 3 und Pfad 6. **Sie sind nur nicht
einzeln ansprechbar**, weil `koerperkarte.tsx:315` je FLAECHE
einfaerbt, nicht je Pfad.

`[read]` **Der Satz wurde geschrieben, ohne die Pfade einzeln
anzusehen** — genau wie der Auftrag vermutete.

### A5 — Vorschlag: ZWEI Flaechen aufteilen, 21 lassen

**AUFTEILEN — `upper-back` -> drei Flaechen:**

    rhomboids      Pfade 1, 4    Rhomboideus-Gegend
    teres          Pfade 2, 5    Teres major / minor
    latissimus     Pfade 3, 6    Latissimus dorsi

`[cmd]` **Und `muskel-ebenen.ts` hat die Namen schon:**
`Rhomboids`, `Teres Major`, `latissimus dorsi` zeigen heute alle auf
`upper-back`. `[read]` **Die Zuordnung ist also nicht zu erfinden,
nur aufzuteilen.**

`[read]` **`Back`, `Upper Back` und `Mid Back` bleiben
Sammelbegriffe** — sie meinen keinen einzelnen Muskel. **Sie
brauchen ein Ziel, das mehrere Flaechen faerbt**, oder bleiben auf
einer davon.

**AUFTEILEN — `lower-back` -> zwei Flaechen:**

    erector-spinae   Pfade 2, 3    Rueckenstrecker
    flanke           Pfade 1, 4    Obliquus externus / QL

`[cmd]` **`erector spinae` ist als Name schon da.** `[read]` **Fuer
die Flanke gibt es keinen** — sie zeigt heute auf nichts. **Das ist
die Luecke, die die Aufteilung sichtbar macht.**

**NICHT AUFTEILEN — die uebrigen 21.**

`[read]` **Ihre Pfade sind Haelften, Koepfe oder Segmente EINES
Muskels** — `triceps` ist das klarste Beispiel: acht Pfade, ein
Muskel. **Eine Aufteilung waere dort keine Praezision, sondern
Zerlegung.**

`[read]` **Die Grenze ist nicht die Pfadzahl, sondern ob ein Nutzer
die Teile GETRENNT trainiert.** Wer Lat und Rhomboiden trennt, hat
zwei Uebungen. Wer die drei Trizepskoepfe trennt, hat immer noch
Trizepsdruecken.

### Ein Randbefund: `latissimus` steht schon im CHECK

`[cmd]` **Aus G-423:** `medical.user_injection_site_selections.
body_area_code` erlaubt 21 Werte, darunter `latissimus` — **die
Karte kennt ihn nicht.**

`[read]` **Mit der Aufteilung faellt diese Luecke von selbst weg.**
`[cmd]` **Umgekehrt gilt:** solange `upper-back` ungeteilt ist, kann
niemand `latissimus` waehlen und sehen.

### A6 — die Proben

    apps/web   1600 / 1600 gruen   (1600 gefordert, unveraendert)
    koerperkarte-pfade.ts   git status: unveraendert

`[read]` **Kein Waechter neu** — dieser Auftrag misst und schlaegt
vor, er baut nicht.

## Was NICHT geaendert wurde

**1 — `packages/ui/src/koerperkarte-pfade.ts`.** `[cmd]` **Nicht
angefasst**, wie beauftragt. `[read]` **Die Bilder entstehen aus
einer zweiten SVG, die dieselben Daten liest** — kein Pfad neu
gezeichnet.

**2 — `koerperkarte.tsx`.** `[read]` **Die Einfaerbung je Flaeche
ist der Grund, warum die Muskeln heute nicht einzeln ansprechbar
sind** — das zu aendern ist Teil der Aufteilung, also des naechsten
Auftrags.

**3 — `supabase/`.** Nichts angefasst.

**4 — Nicht committet, nicht gestaged.**

## Drei Hinweise

**1 — `lower-back` hat vier Pfade, nicht zwei.** Der Auftrag nennt
zwei. `[cmd]` **In der Datei nachgezaehlt.** Deshalb sind es 12
Zielbilder statt 10 (plus Uebersicht und fuenf Gegenproben: 18).

**2 — Es sind 23 Flaechen, nicht 21.** `[cmd]` **`'upper-back'` und
`'lower-back'` tragen Anfuehrungszeichen** — mein erster
Zaehldurchlauf fand 21 und haette die zwei entscheidenden Flaechen
uebersprungen.

**3 — Meine erste Messung war falsch, und zwar in beide
Richtungen.** `[cmd]` **Ein nicht-gieriger Blockausdruck lief ueber
die Flaechengrenze** und meldete fuer `chest` sechs `paths_back` —
die von `upper-back`. **Fuenf Flaechen statt 23.** `[read]`
**Aufgefallen ist es nur, weil `chest` am Ruecken nichts zu suchen
hat** — die Zahl allein sah plausibel aus. **Jetzt zaehlt der
Leser Klammern.**

## Neustart

`[cmd]` **NICHT noetig** — nur `tools/` und `docs/bilder/`.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  sechs Bilder, je ein Pfad allein
    A2  lower-back 4, trapezius 2, plus gluteal und triceps
    A3  je Pfad benannt, mit Begruendung aus dem Bild
    A4  sieben Flaechen mit mehreren Pfaden
    A5  ein Vorschlag: drei aufteilen, vier nicht
    A6  1600 unveraendert

`[cmd]` **18 Bilder, alle mit Inhalt** ? **beim ersten Lauf waren
zehn leer, jetzt keines.**

`[cmd]` **`upper-back-3.png` angesehen:** **grosse Flaeche
seitlich am Ruecken, von der Achsel zur Taille** ? **das ist der
Latissimus.**

`[cmd]` **`upper-back-2.png`:** **eine Sichel unter dem Deltoid,
seitlich** ? **kein Rhomboid, der laege zwischen den
Schulterblaettern.**

`[read]` **Er nennt es *,,Teres minor / oberer Lat-Rand"*** ?
**genau das, was zu sehen ist.**

### Der Kern: die Gruppe ist nicht anatomisch

> *,,`upper-back` fuehrt sechs Pfade, die drei verschiedene
> Muskeln zeigen. Und die Rhomboiden ? die `muskel-ebenen.ts`
> darauf wirft ? sind in keinem der sechs."*

`[cmd]` **`muskel-ebenen.ts:55-60` wirft SECHS Namen auf die
Flaeche:** `Back`, `Upper Back`, `Mid Back`, `Rhomboids`,
`Teres Major`, `latissimus dorsi`.

`[read]` **Zwei davon zeigt die Karte gar nicht.**

### A4 — die Unterscheidung ist die Arbeit

`[cmd]` **Sieben Flaechen mit mehreren Pfaden, drei Faelle:**

    EIN Muskel, mehrere Pfade
      trapezius, triceps, lower-back
      -> zusammenlassen

    Spiegelpaare desselben Muskels
      gluteal (2)
      -> links/rechts trennen

    VERSCHIEDENE Muskeln
      upper-back (3 je Seite)
      -> aufteilen

`[read]` **Ein Pfad ist eine Zeichenebene, kein Muskel** ?
**`triceps` hat drei Koepfe und ist trotzdem EIN Muskel.**

### Was er NICHT getan hat

> *,,`koerperkarte-pfade.ts` unveraendert ? die Datei gehoert
> allen vier Modulen."*

`[cmd]` **Und die Zaehlung in `104-muskelkarte.md:526` stimmt** ?
**er hat sie geprueft, nicht angenommen.**

### Ein Befund, der bleibt

> *,,`lower-back` traegt vier Pfade, die zusammen den Bereich
> zwischen Lat und Gesaess zeichnen ? anatomisch der Erector
> spinae, aber die Karte nennt ihn nach der Region."*

`[read]` **Derselbe Fall wie `upper-back`** ? **ein Regionsname
statt eines Muskelnamens.**

**Abgenommen.**

