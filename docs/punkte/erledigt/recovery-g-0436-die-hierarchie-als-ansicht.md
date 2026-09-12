---
nr: G-436
typ: feature
modul: recovery
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-435
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: e22f4d49
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/tab-messwerte.tsx
zahlen:
  gemessen: 2026-09-08
  namen: 105
  mit_wert: 22
---

# G-436 — die Hierarchie als Ansicht

## Toms Vorgabe

Tom, 2026-09-08:

> wir haben eine schoene auflistung und die soll aufgebohrt werden
> auf die hierarchie darunter im style von parent/childs, immer
> offen, und jedes teil anwaehlbar fuer details ? gruppen und
> einzelmuskel

> ich denke irgendwann kriegen wir die auswertung von
> training/recovery auch soweit, dass wir einzelne muskeln
> ansteuern koennen

`[read]` **Die obere Liste** (`Per-muscle detail`, 18 Zeilen)
**WIRD die Hierarchie** ? **sie wird nicht ergaenzt.**

`[read]` **Die untere Liste** (`HIERARCHIE ? 22 von 105 ? 83
Luecken`) **faellt weg** ? **sie war der Notbehelf aus G-435.**

## Was die Ansicht zeigt

    Arms                 O 62%  ?  schwaechstes: Biceps 31%
      Biceps             31%    1/3 ? 14h
      Brachialis         --     kein Volumen zugeordnet
      Forearms           O 68%  ?  schwaechstes: Brachiorad. 37%
        Brachioradialis  37%    0/3 ? 14h
        Wrist Flexors    --     kein Volumen zugeordnet

Tom: *,,wieso waehlen, wenn man beides haben kann? schnitt von
kindern MIT WERTEN und daneben schwaechstes glied."*

`[read]` **Der Schnitt rechnet NUR ueber Kinder mit Wert** ?
**ein Kind ohne Volumen zieht ihn nicht herunter.**

`[read]` **Und das schwaechste Glied ist der Engpass** ? **wer
trainieren will, sieht sofort, was noch nicht bereit ist.**

## Drei Zustaende, nicht zwei

    Wert        gemessen                 31%  1/3 ? 14h
    --          kein Volumen zugeordnet
    (grau)      nicht gezeichnet

`[read]` **Die Luecke wird BENANNT, nicht verschwiegen** ? **und
sie sagt, WARUM sie da ist.**

`[cmd]` **Gemessen:**

    exercise_muscles   6.588 Zuordnungen
      auf Blatt        2.152
      auf Gruppe       3.331
      auf Wurzel       1.105

`[read]` **Ein Muskel ohne Volumenzuordnung kann keinen Wert
haben** ? **das ist C-487, die Daten kommen nach.**

`[cmd]` **Und der Muskelkater: `checkins.soreness` traegt
`{"back": 1, "chest": 1}`** ? **zwei Regionen, kein
Muskelname.**

`[read]` **Ein Muskel kann also Volumen haben und keinen
Kater** ? **die Ansicht muss beides getrennt zeigen koennen.**

## Immer offen

Tom: *,,immer offen."*

`[read]` **Kein Aufklappen, kein Zustand** ? **die ganze
Hierarchie steht da.**

`[cmd]` **105 Namen in vier Ebenen** ? **das ist lang, aber
vollstaendig.**

`[read]` **Wenn es zu lang wird: melden, nicht kuerzen.**

## Jedes Teil anwaehlbar

Tom: *,,jedes teil anwaehlbar fuer details ? gruppen und
einzelmuskel."*

`[read]` **Ein Klick auf `Biceps` zeigt den Bizeps.**

`[read]` **Ein Klick auf `Arms` zeigt die Gruppe** ? **mit ihren
Kindern, dem Schnitt und dem Engpass.**

`[cmd]` **G-435 hat das Modal geraeumt** ? **es zeigt jetzt den
Muskel, seine Gruppe, seine Geschwister.**

`[read]` **Miss, ob dasselbe Modal fuer eine GRUPPE taugt** ?
**oder ob es eine zweite Form braucht.**

## Was aus der Karte kommt

`[cmd]` **G-434: 43 Kartenflaechen, jeder Muskel einzeln
anwaehlbar.**

`[read]` **Ein Klick auf der Karte und ein Klick in der Liste
sollten dasselbe zeigen.**

`[cmd]` **`public.koerperflaechen`: 51 Zeilen, `art`,
`muscle_group_id`, `parent_id`** ? **die Bruecke steht.**

## Abnahmebedingungen

    A1  Per-muscle detail IST die Hierarchie. Die untere
        Liste ist weg. Foto vorher/nachher.
    A2  je Gruppe: Schnitt der Kinder MIT Wert, plus
        das schwaechste Glied. Gemessen an einem Zweig,
        von Hand nachgerechnet.
    A3  drei Zustaende unterscheidbar: Wert, kein
        Volumen, nicht gezeichnet. Je ein Beispiel.
    A4  immer offen, kein Aufklappen. Foto.
    A5  jede Zeile anwaehlbar -- Gruppe UND Muskel.
        Zwei Fotos.
    A6  Klick auf der Karte und in der Liste zeigen
        dasselbe. Belegt.
    A7  Gegenprobe: der Schnitt mit einem erfundenen
        Kind -> faellt sie?
    A8  vier Module unveraendert, je ein Foto.
    A9  apps/web 1670 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**KEINEN Wert erfinden, wo keiner ist** ? **`--` ist die
Antwort, nicht 0.**

**Den Schnitt NICHT ueber Kinder ohne Wert rechnen** ? **er
waere falsch.**

**Nichts in `supabase/`** ? **Codex arbeitet an C-485 und
C-486.**

**`exercise_muscles` nicht anfassen** ? **das ist C-487.**

Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

**Erledigt.** Die obere Liste IST die Hierarchie, die untere ist
weg, Gruppen und Muskeln sind anwaehlbar.

### Vorher gemessen — die Auftragszahlen stimmen alle

`[cmd]` `tools/_g436-deckung.mjs`:

    exercise_muscles   6.588   (Auftrag nennt 6.588)
      auf Blatt        2.152   (2.152)
      auf Gruppe       3.331   (3.331)
      auf Wurzel       1.105   (1.105)
    muscle_groups        105   Ebenen 7 / 30 / 51 / 17
    koerperflaechen       51   33 mit muscle_group_id

`[cmd]` **Der erste Lauf las 1.000 und meldete 301/525/174** —
**PostgREST deckelt dort.** `[read]` **Blattweise geholt, dann
stimmten alle vier Zahlen.**

### Die drei Zustaende — VORHER gezaehlt, nicht am Schirm entdeckt

`[cmd]` **Gemessen** (`g436-zustaende.test.ts`):

    gezeichnet          22
      davon mit Wert    21
      davon „--"         1   `tibialis`
    nicht gezeichnet    83   -> grau

`[read]` **Ein Befund, der von Toms Beispiel abweicht:** der Auftrag
zeigt mehrere `--`-Zeilen (`Brachialis`, `Wrist Flexors`).
**Tatsaechlich gibt es genau EINE** — `tibialis`. `[read]` **Die
anderen sind nicht „ohne Volumen", sondern ueberhaupt nicht
gezeichnet** — der dritte Zustand, nicht der zweite.

`[read]` **Die Ansicht traegt trotzdem alle drei** — nach C-487
verschiebt sich die Verteilung, nicht die Form.

**Und der Messfehler, der fast durchging:** `KARTE_ZU_RECOVERY`
wird zur LAUFZEIT gerechnet (eine IIFE ueber `flaechenFuer`).
`[cmd]` **Mein Regex darueber las 0 Eintraege**, und die Zaehlung
darunter meldete *„0 mit Wert, 92 grau"*. `[read]` **Importieren
statt lesen** — daraus wurde ein Waechter.

### A1 — eine Liste statt zwei

`[cmd]` **Am Schirm** (`tools/_g436-schirm.mjs`):

    Zeilen gesamt     105
    Einrueckung       0px:7  14px:30  28px:51  42px:17
    Tabellenzeilen      0   (die flache Tabelle ist weg)
    Seitenfehler        0

`[read]` **Die Einrueckung deckt sich mit dem Baum** — 7/30/51/17
ist genau die Ebenenverteilung aus `muscle_groups`.

`docs/bilder/g436/a1-nachher.png`

`[read]` **Ein Vorher-Bild habe ich nicht** — die Kachel war beim
Fotografieren schon umgebaut. **Der Nachweis ist stattdessen der
Zaehler:** `Tabellenzeilen 0` gegen die 18 Zeilen, die dort in
G-435 standen, plus `mitWerten(` als Waechter.

### A2 — Schnitt und Engpass, von Hand nachgerechnet

**An Toms eigenem Zweig** (`g436-schnitt.test.ts`):

    Forearms:  Brachioradialis 37, Wrist Flexors --
               -> Schnitt aus EINEM Kind = 37
    Arms:      Biceps 31, Brachialis --, Forearms (37)
               -> (31 + 37) / 2 = 34

`[cmd]` **Mit den wertlosen Kindern als 0 waere es (31+0+37+0)/4 =
17** — **die Gruppe saehe halb so erholt aus, wie sie ist.**

**Der Engpass sucht ueber ALLE Nachfahren:** eine eigene Probe
setzt Biceps auf 90 und Brachioradialis auf 12 — der Engpass von
`Arms` ist dann der Brachioradialis, zwei Ebenen tiefer.

### A3 — drei Zustaende, am Schirm unterscheidbar

    Gruppe (Ø)       15   Arms: Ø 30% · schwächstes: Biceps 27%
    Wert             21   Biceps 27% · 1/3 · 14 h
    „--" kein Vol.    1   Tibialis
    grau             68   Brachialis, Extensor Carpi Radialis, …

`[cmd]` **Farbe gemessen, nicht nur der Text:**

    „--"    oklch(0.97 0 0)        hell
    grau    oklch(0.42 0.005 270)  gedaempft

`[read]` **Die Summe 15 + 21 + 1 + 68 = 105.** `[read]` **Die 68
statt 83 grauen:** 15 der ungezeichneten Knoten sind Gruppen und
zeigen ihren Schnitt — sie stehen in der ersten Zeile.

### A4 — immer offen

`[cmd]` **Aufklapper auf der Seite: 2** — `[read]` **beide in der
Schale** (Sprachwahl, Einstellungsmenue), **keiner in der
Hierarchie**. Verortet, nicht nur gezaehlt.

**Und die Laenge, gemessen statt geschaetzt:**

    Kachel        2.551 px
    nur die Liste 2.469 px   (105 Zeilen)

`[read]` **Das sind rund zwei Bildschirme bei 1.200 px Hoehe** —
**gemeldet, nicht gekuerzt**, wie der Auftrag sagt.

`[read]` **Wenn das zu lang ist**, waere der naechste Schritt
NICHT das Aufklappen (das verbietet der Auftrag), sondern eine
Entscheidung darueber, ob die 83 ungezeichneten Namen dauerhaft
mitlaufen sollen — **nach C-487 tragen viele davon einen Wert und
sind dann nicht mehr grau.**

### A5 — Gruppe UND Muskel anwaehlbar

`[cmd]` **Erste Messung: ein Klick auf `Arms` oeffnete NICHTS.**
`[read]` **Der Grund:** `ModalZustand` kannte nur
`{ typ: 'muscle'; slug }`, und eine Gruppe hat kein
Recovery-Kuerzel.

**Also gemessen, ob das G-435-Modal dafuer taugt** — wie der
Auftrag verlangt: **nein.** `MuscleDetailModal` haengt durchgehend
an `MUSCLE_STATE[slug]`, `flaechenFuer(slug)`,
`KARTE_ZU_RECOVERY[…]`. **Ohne Kuerzel bleibt es leer.**

`[cmd]` **Deshalb eine zweite Form:** `{ typ: 'muskelgruppe';
name }` und `GruppenDetailModal`.

    GRUPPE  „Arms"    -> Schnitt | Schwächstes Glied | Darunter · 3
    MUSKEL  „Biceps"  -> Parent | Hours | Sets | Soreness | …

`docs/bilder/g436/a5-gruppe.png` · `a5-muskel.png`

`[cmd]` **Das Gruppenfenster rechnet mit DERSELBEN Funktion wie die
Liste** (`calcMuscleRecovery` ueber `mitWerten`) — **sonst stuenden
dort andere Zahlen fuer denselben Muskel.**

### A6 — Karte und Liste zeigen dasselbe

`[cmd]` **Belegt** (`tools/_g436-klick.mjs`): Klick auf die
Kartenflaeche `biceps` und Klick auf die Listenzeile `Biceps`
oeffnen **denselben Titel und denselben Text** — Zeichenkette gegen
Zeichenkette verglichen, nicht nur der Titel.

    Karte  -> Biceps
    Liste  -> Biceps
    DASSELBE? JA

### A7 — Gegenprobe: 10 Sabotagen, alle rot

    ROT  der Schnitt rechnet AUCH ueber Kinder OHNE Wert (als 0)
    ROT  der Schnitt ist eine Summe statt eines Mittels
    ROT  ohne Kind mit Wert kommt 0 statt null
    ROT  der Engpass nimmt das STAERKSTE Glied
    ROT  der Engpass sieht nur direkte Kinder, keine Enkel
    ROT  die alte flache Tabelle steht wieder in der Kachel
    ROT  die Kachel rechnet Schnitt und Engpass nicht mehr
    ROT  die Einrueckung faellt weg (flache Liste)
    ROT  eine GRUPPE ist nicht mehr anwaehlbar
    ROT  die Verteilung kennt den Gruppenfall nicht mehr

**Ein blinder Fleck, den die Gegenprobe fand:** mein Waechter
suchte `case 'muskelgruppe':` als Text — und blieb **GRUEN**, als
die Sabotage daraus `return null && <GruppenDetailModal …` machte.
`[read]` **Er prueft jetzt den Zweig, der die Komponente WIRKLICH
zurueckgibt.**

**Und die G-435-Gegenprobe musste nachgezogen werden:** drei ihrer
Sabotagen zielten auf Code, den dieser Auftrag umgebaut hat, und
meldeten *„kam nicht an"*. `[cmd]` **Nachgezogen, danach wieder
ALLE ROT** — beide Gegenproben laufen vollstaendig.

### Ein fremder Waechter, den ich gelockert habe

`[cmd]` **`g435-nachbarschaft.test.ts` verbot `baueBaum(` in der
ganzen Datei `modale.tsx`** — und fiel, als das Gruppenfenster
denselben Baum brauchte.

`[read]` **Die Zusage aus G-435 gilt weiter, aber sie gilt fuer das
Fenster EINES MUSKELS.** `[cmd]` **Der Waechter prueft jetzt NUR
den Ausschnitt `MuscleDetailModal`** — und prueft zusaetzlich seine
eigenen Grenzen, damit er nicht lautlos im Leeren sucht, wenn
jemand die Komponenten verschiebt.

`[read]` **Ein Namensverbot ueber eine ganze Datei altert zur
Blockade** — dieselbe Lehre wie in G-433.

### A8 — vier Module unveraendert

    recovery      Kacheln 17  Kartenflaechen 43  neu 9  alt 0  Fehler 0
    supplements   Kacheln 14  Kartenflaechen 43  neu 9  alt 0  Fehler 0
    medical       Kacheln 11  Kartenflaechen  0  neu 0  alt 0  Fehler 0
    coach         Kacheln 13  Kartenflaechen  0  neu 0  alt 0  Fehler 0

`docs/bilder/g432/a8-*.png`

### A9 — Proben

    apps/web    1676 von 1680   (verlangt: 1670 oder mehr)
    apps/coach    65 von 65

**Die vier roten sind die bekannten, keine neu:**

    2x  C-73 / Flaechenziel      C-482-Folge: zehn neue Namen
                                 haben in `ebenen.ts` noch
                                 `name: null`
    2x  Supplements-Attrappen    meine C-484-Konfliktloesung,
                                 in G-435 gemeldet — tabs.tsx
                                 entscheidet Tom separat

### Was ich NICHT gebaut habe

`[read]` **`recovery.checkins.soreness` traegt `{"back": 1,
"chest": 1}`** — zwei Regionen, keine Muskelnamen, keine Seite.
`[cmd]` **Die Ansicht zeigt Kater und Bereitschaft getrennt** (`1/3
· 14 h` neben dem Prozentwert), **aber der Kater faellt weiter auf
die Region, nicht auf den Muskel.** **Gemeldet, nicht gebaut.**

`[read]` **`exercise_muscles` nicht angefasst** (C-487).
**Nichts in `supabase/`** — die Eintraege dort im `git status` sind
Codex' C-485.

### Geaendert

    lib/koerper/muskelbaum.ts          mitWerten(), AstMitWert
    v2/recovery/tab-messwerte.tsx      die Kachel IST die Hierarchie
    v2/recovery/modale.tsx             GruppenDetailModal
    v2/recovery/kontext.tsx            ModalZustand: muskelgruppe
    lib/koerper/__tests__/
      g436-schnitt.test.ts             NEU, 6 Waechter (A2/A7)
      g436-zustaende.test.ts           NEU, 4 Waechter (A1/A3/A5)
      g435-nachbarschaft.test.ts       auf den Ausschnitt verengt

    tools/_g436-deckung.mjs    die Zahlen vor dem Bauen
    tools/_g436-schirm.mjs     A1/A3/A4 am Schirm
    tools/_g436-klick.mjs      A5/A6
    tools/_g436-sabotage.mjs   A7

**Nicht committet, nicht gestaget.**

### Neustart noetig?

`[read]` **Nein** — nur `apps/web/src`, das laedt heiss nach.


## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  105 Zeilen, Einrueckung 7/30/51/17
    A2  Handrechnung: Forearms 37, Arms (31+37)/2 = 34
    A3  21 Wert / 1 -- / 68 grau
    A4  2 Aufklapper, beide in der Schale
    A5  Gruppe und Muskel je ein Foto
    A7  10 Sabotagen, alle rot
    A9  web 1676/1680, coach 65/65

`[cmd]` **`a1-nachher.png` angesehen:**

    Arms         O 38%  schwaechstes: Biceps 27%
      Biceps     27%   1/3 - 14h
      Brachialis --    nicht gezeichnet
    Legs         O 57%  schwaechstes: Rectus Femoris 47%

`[cmd]` **`_g436-sabotage.mjs` selbst gelaufen:** *,,ALLE
SABOTAGEN ROT."*

`[cmd]` **Und die untere Liste ist weg** ? **nur ein Kommentar in
`muskelbaum-read.ts` traegt den Wortlaut noch.**

### Der Engpass findet Enkel

`[cmd]` **`Legs` nennt `Rectus Femoris`** ? **das ist ein Enkel,
kein direktes Kind.**

`[read]` **Richtig gebaut** ? **wer trainieren will, will den
schwaechsten Muskel wissen, nicht die schwaechste
Untergruppe.**

### Er hat mein Beispiel widerlegt

> *,,Der Auftrag zeigt mehrere `--`-Zeilen (Brachialis, Wrist
> Flexors). Gemessen gibt es genau EINE: `tibialis`. Die anderen
> sind nicht *ohne Volumen*, sondern GAR NICHT GEZEICHNET ? der
> dritte Zustand, nicht der zweite."*

`[read]` **Ich hatte die beiden Luecken verwechselt.**

`[cmd]` **21 Wert, 1 ohne Volumen, 68 nicht gezeichnet** ?
**nicht das Bild, das ich gezeichnet habe.**

> *,,Die Ansicht traegt trotzdem alle drei; nach C-487 verschiebt
> sich die Verteilung, nicht die Form."*

### Das Modal taugte nicht, wie verlangt gemessen

> *,,Es haengt durchgehend an einem Recovery-Kuerzel
> (`MUSCLE_STATE[slug]`, `flaechenFuer(slug)`), und `Arms` hat
> keins; ein Klick oeffnete nachweislich NICHTS."*

`[cmd]` **`GruppenDetailModal` in `modale.tsx`, mit DERSELBEN
Rechenfunktion wie die Liste** ? **damit dort keine abweichenden
Zahlen stehen.**

`[read]` **Das ist die Antwort auf eine Frage, die ich zu messen
verlangt hatte** ? **er hat nicht geraten.**

### Und ein Waechter gelockert, mit Begruendung

> *,,Er verbot `baueBaum(` in der GANZEN Datei `modale.tsx`; das
> Gruppenfenster braucht denselben Baum. Er prueft jetzt nur den
> Ausschnitt `MuscleDetailModal` ? und zusaetzlich SEINE EIGENEN
> GRENZEN, damit er nicht blind wird, wenn jemand die Komponenten
> verschiebt."*

`[read]` **Ein Waechter, der einen NAMEN verbietet statt einer
Mechanik, blockiert die naechste richtige Arbeit.**

`[cmd]` **Und drei G-435-Sabotagen zielten auf umgebauten Code**
? **nachgezogen, beide Gegenproben wieder vollstaendig rot.**

`[read]` **Eine Gegenprobe veraltet genauso wie der Waechter** ?
**und faellt dabei still in die andere Richtung.**

**Abgenommen.**

