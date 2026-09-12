---
nr: G-435
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-432
entscheidung: E-81
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: e22f4d49
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/modale.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-435 — die Hierarchie an den richtigen Ort

## Teil 1: die Liste steht am falschen Ort

Tom, 2026-09-08:

> in den details hat es eine auflistung *,,Alle Muskelgruppen ?
> 22 von 95 gezeichnet ? 73 Luecken"* ? fuer was ist die?

`[cmd]` **`modale.tsx:730-800`** ? **die vollstaendige Hierarchie
mit Einrueckung, *(nicht gezeichnet)* und der Pille *hier*.**

`[read]` **Aus G-432/A6, technisch richtig gebaut** ? **aber sie
steht im MODAL eines EINZELNEN Muskels.**

`[read]` **Wer den Latissimus anklickt, will den Latissimus
sehen** ? **nicht alle 95 Gruppen.**

Tom:

> Per-muscle detail die auflistung: da will ich parent und
> darunter childs sehen.

**Also:**

    Modal (ein Muskel)    nur dieser Muskel, seine Gruppe,
                          seine Geschwister
    Per-muscle detail     die Hierarchie: Gruppe, darunter
      (die Kachel)        eingerueckt die Kinder mit Werten

`[cmd]` **Die Kachel ist heute flach
(`tab-messwerte.tsx:113`) und liest `motor.ts`.**

`[cmd]` **G-433 stellt sie um und laeuft noch** ? **stimme dich
damit ab: G-433 baut die Kachel, dieser Auftrag raeumt das
Modal.**

## Teil 2: die Seite wird eine Spalte

`[cmd]` **E-81, Tom entschieden:**

    Tiefe        parent_id, KEINE Ebenenzahl
    Bedeutung    art: wurzel | gruppe | muskel | umriss
    Seite        eine SPALTE am Messwert

`[read]` **Begruendung:** *,,die trainings muessen bis auf die
kleinsten muskeln runterbrechen koennen."*

`[read]` **Eine feste Ebenenzahl zwingt dazu, die Tiefe vorher zu
kennen** ? **`Chest > Pectoralis Major > Pars clavicularis` sind
drei, `Legs > Lower Legs > Calves > Gastrocnemius > Caput
mediale` sind fuenf.**

`[read]` **Und die Seite gehoert zur MESSUNG, nicht zum
Muskel.**

### Dein Teil

`[read]` **Die Karte faerbt weiter beide Seiten getrennt** ?
**sie liest die Seite aus dem Messwert statt aus der
Flaechenzeile.**

`[cmd]` **Miss, wo heute eine Seitenzeile (`latissimus-l`)
gelesen wird** ? **und wo stattdessen Flaeche plus Seite stehen
muss.**

`[read]` **`supabase/` gehoert Codex** (C-484) ? **melde, was die
Oberflaeche braucht, BEVOR er anfaengt.**

## Abnahmebedingungen

    A1  das Modal zeigt den Muskel, seine Gruppe, seine
        Geschwister -- nicht alle 95. Foto vorher/nachher.
    A2  Per-muscle detail zeigt Gruppe + eingerueckte
        Kinder mit Werten. Foto. (Abstimmung mit G-433.)
    A3  wo heute Seitenzeilen gelesen werden: Liste.
    A4  was die Oberflaeche nach dem Umbau braucht:
        gemeldet, BEVOR Codex baut.
    A5  Gegenprobe: der alte Zustand -> faellt sie?
    A6  vier Module unveraendert, je ein Foto.
    A7  apps/web 1661 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**Nichts in `supabase/`** ? **Codex baut die Tabelle um.**
**Keinen Muskelnamen erfinden.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

**Erledigt.** Recovery laeuft wieder, die Hierarchie steht in der
Kachel, das Modal zeigt den Muskel.

### A1 — Recovery laeuft wieder

`[cmd]` **Vorher gemessen, nicht angenommen:** der Leseweg fiel gegen
die neue Tabelle.

    .select('…,ebene,art,seite,…')   FAELLT
      column koerperflaechen.ebene does not exist
    .select('…,art,…')               geht, 51 Zeilen

**Nach der Aenderung am Schirm** (`tools/_g435-schau.mjs`):
**0 Seitenfehler**, und `Parent · public.koerperflaechen` zeigt
Ruecken / Latissimus / teres-major / teres-minor — der Leseweg
traegt.

`docs/bilder/g435/a1-nachher.png`

`[read]` **Ein Vorher-Bild des kaputten Zustands habe ich nicht** —
die drei Zeilen waren geaendert, bevor ich fotografiert habe. **Der
Nachweis ist stattdessen die Messung oben**, die beide Spaltenlisten
gegen die Datenbank haelt.

### C-484 nachgemessen — alle Auftragszahlen stimmen

`[cmd]` `tools/_g435-stand.mjs`:

    Zeilen              51     (Auftrag nennt 51)
    Wurzeln              8     (Auftrag nennt 8)
    ohne Wurzeln        43     (Auftrag nennt 43)
    Spalte ebene       WEG
    Spalte seite       WEG
    Codes auf -l/-r      0
    muscle_groups      105 Namen
    art benutzt        gruppe, muskel, umriss, wurzel

`[read]` **`kopf` ist im CHECK erlaubt, aber unbenutzt** — keine
Zeile traegt ihn.

### A2 — die drei Zeilen, plus was sonst zugriff

**Geaendert:**

    hierarchie-read.ts:59   ebene und seite aus dem select
    hierarchie.ts:35        ebene: number | null   weg
    hierarchie.ts:38        seite: string | null   weg
    g430-hierarchie.test.ts zwei Attrappen-Bauer nachgezogen
                            (setzten ebene: null, seite: null)

**Was ich gemessen und NICHT geaendert habe** — gleicher Name,
anderes Vokabular:

    pfadnamen.ts       `art: 'seite'` beschreibt ZEICHENPFADE
                       (linke/rechte Haelfte derselben Flaeche),
                       nicht die entfallene Spalte
    muskelbaum.ts:33   `ebene` ist die GERECHNETE Tiefe aus
                       parent_id, kein Spaltenlesen
    koerperkarte.tsx   `seite` am Messwert — genau die Form, die
                       C-484 herstellt
    medical/*          Injektionsseiten, eigene Struktur
    nutrition/*        `seite` = Blaetterseite

`[cmd]` **Verbraucher von `Flaeche.ebene` oder `Flaeche.seite`:
keiner.** `sortierung` gibt es noch — `.order('sortierung')` geht.

### A3 — wo Seitenzeilen gelesen wurden

**Nirgends.** `[cmd]` **Gemessen** (`tools/_g435-seiten.mjs`): die
34 Ebene-3-Zeilen hatten **null Leser**.

**Woher die Seite stattdessen kommt** — schon vor C-484:

    koerperkarte.tsx:343-346
      die Karte rechnet sie aus der x-Lage des PFADES
      (< halbe Breite = links)
    MuskelWert.seite?: 'links' | 'rechts'
      der Messwert traegt sie bereits

`[read]` **Deshalb brauchte die Oberflaeche fuer C-484 keine
Anpassung ausser den drei Zeilen** — sie hat die Seitenzeilen nie
benutzt.

### A4 — `checkins` hat keine Seite (gemeldet, nicht gebaut)

`[cmd]` **Gemessen in `recovery.checkins`** (nicht `public` — das
stand so im Auftrag):

    soreness     {"back":1,"chest":1}
    pain_areas   []
    Spalte seite   GIBT ES NICHT
    Spalte side    GIBT ES NICHT

`[read]` **`soreness` ist Kuerzel auf Zahl, ohne Seite.** **Das ist
der Grund, warum die Karte beide Seiten gleich faerbt** — wie im
Auftrag vermutet. **Nicht gebaut.**

### A5 — das Modal zeigt den Muskel, seine Gruppe, seine Geschwister

    vorher   „Alle Muskelgruppen · 22 von 105 gezeichnet
              · 83 Lücken"          83x „(nicht gezeichnet)"
    nachher  „In der Gruppe · Arms"  0x

`docs/bilder/g435/a5-vorher.png` · `a5-nachher-biceps.png`

**Am Beispiel Biceps:**

    In der Gruppe · Arms
      Biceps  [hier]  1/3 · 14 h
      Forearms
      Triceps
    Darunter · 1
      Brachialis

`[read]` **Traegt ein Modal mehrere Flaechen** (eine Gruppe wie
`upper_back`), **steht der Block nicht** — dort zeigt `Zugehoerigkeit`
bereits jeden Muskel mit seiner Wurzel. `a5-nachher.png` zeigt
diesen Fall.

`[cmd]` **`baueBaum` ist NICHT geloescht** — es rechnet jetzt fuer
die Kachel.

### A6 — Per-muscle detail zeigt Gruppe + eingerueckte Kinder

`[cmd]` **Am Schirm gemessen** (`tools/_g435-kachel.mjs`) — **die
Einrueckung, nicht das Wort**, weil eine flache Liste mit
Ueberschrift im Text gleich aussaehe:

      0px  Arms, Back, Chest …          die Wurzeln
     14px  Biceps, Forearms, Triceps    30 Zeilen
     28px  Brachialis, Brachioradialis  51 Zeilen
     42px  Extensor Carpi Radialis      17 Zeilen

    VERSCHIEDENE Stufen: 4  -> eingerueckt

**Ueberschrift:** `Hierarchie · 22 von 105 gezeichnet · 83 Lücken`.
`[read]` **Die Luecken stehen drin, nicht weggelassen** — je Zeile
`nicht gezeichnet`.

`docs/bilder/g435/a6-kachel.png`

`[cmd]` **Die Tabelle darueber bleibt** — sie sortiert nach
Bereitschaft, das ist ihr Zweck.

**Ein Fehler, den erst der Schirm zeigte:** die erste Fassung setzte
`paddingLeft` und `padding` im selben Style-Objekt. **Die Kurzform
ueberschreibt die lange** — gemessen: **1 Stufe statt 4**, die Liste
war flach. `[read]` **Ein Waechter haelt das jetzt fest.**

### G-433 — nicht durch

`[cmd]` **Die Punktdatei traegt `_(vom Agenten anzuhaengen)_`** —
kein Bericht. **Die Kachel las `MUSCLE_GROUPS_BODYMAP` und
`MUSCLE_STATE`, der Baum wurde ihr nicht gereicht.**

`[read]` **Ich habe ihn durchgereicht**, nicht den Leseweg
umgebaut: `ansicht.tsx` hatte `muskelbaum` bereits. **Eine Zeile
Prop.** `[read]` **G-433s eigentliche Arbeit** — die Tabelle selbst
von `motor.ts` loesen — **ist damit NICHT erledigt.**

### A7 — Gegenprobe: 14 Sabotagen, alle rot

    ROT  das Modal rendert wieder den ganzen Baum
    ROT  „Alle Muskelgruppen" kommt ins Modal zurueck
    ROT  das Modal ruft `nachbarschaft` nicht mehr
    ROT  die Geschwister enthalten den Muskel selbst
    ROT  die Gruppe ist die WURZEL statt des Elternteils
    ROT  ein unbekannter Name liefert den ganzen Baum
    ROT  die eigenen Kinder fallen weg
    ROT  die Hierarchie faellt auch aus der KACHEL weg
    ROT  die Kachel rueckt nicht mehr ein (flache Liste)
    ROT  `padding` nach `paddingLeft` (der Fehler von oben)
    ROT  `ebene` kommt in den Typ zurueck            (gegen tsc)
    ROT  der Leseweg fragt wieder nach `seite`
    ROT  der Leseweg fragt wieder nach `ebene`
    ROT  `parent_id` faellt weg

Gesund GRUEN davor und danach.

**Ein blinder Fleck, den die Gegenprobe gefunden hat:** `seite` in
den `select`-String zurueckzuschreiben blieb **gegen `tsc` GRUEN** —
**die Spaltenliste ist eine Zeichenkette.** `[read]` **Am Schirm
faellt dafuer ganz Recovery aus** — genau der Zustand, den dieser
Auftrag behoben hat. `[cmd]` **Dafuer gibt es jetzt einen Waechter,
der die Liste zerlegt** (`G-435/A2`), und die Sabotage ist rot.

### A8 — vier Module unveraendert

    recovery      Kacheln 17  Kartenflaechen 43  neu 9  alt 0  Fehler 0
    supplements   Kacheln 14  Kartenflaechen 43  neu 9  alt 0  Fehler 0
    medical       Kacheln 11  Kartenflaechen  0  neu 0  alt 0  Fehler 0
    coach         Kacheln 13  Kartenflaechen  0  neu 0  alt 0  Fehler 0

`docs/bilder/g432/a8-*.png`

### A9 — Proben

    apps/web    1666 von 1670   (verlangt: 1661 oder mehr)
    apps/coach    65 von 65

**Vier rote — beide Paare eingeordnet:**

**1. C-73 / Flaechenziel (2 Stueck) — Folge von C-482, nicht von
mir.** `[cmd]` **Belegt:** dieselben zwei fallen, wenn ich meine drei
Dateien auf HEAD zuruecksetze. `muscle_groups` fuehrt jetzt **99
Beziehungen statt 89**, und **zehn neue Namen haben in `ebenen.ts`
noch `name: null`**:

    Serratus Anterior, External Oblique,
    Triceps Brachii Long / Lateral / Medial Head,
    Vastus Lateralis, Vastus Medialis,
    Gastrocnemius Lateral / Medial Head,
    Posterior Neck Muscles

`[read]` **Das sind genau die Luecken, die ich in G-433 gemeldet
hatte** — Codex hat die Namen geliefert. **Das Eintragen waere keine
Erfindung mehr.** `[read]` **Nicht in diesem Auftrag gemacht.**

**2. Supplements-Attrappen (2 Stueck) — MEIN Fehler, und er ist
committet.**

`[cmd]` **Gemessen an `934d2ae1` (C-484, „Konflikt geloest"):**

    vor dem Commit    1 ATTRAPPE, 19 RUECKFALL
    nach dem Commit  17 ATTRAPPE,  0 RUECKFALL
    Diff             17 Zeilen rein, 58 raus
                     19x RUECKFALL, 14x <Card> entfernt

`[read]` **Ich habe bei der Konfliktloesung die falsche Haelfte
behalten** — den Stand vor G-91, den der alte Stash trug. **Nicht
„RUECKFALL zu ATTRAPPE berichtigt", sondern 14 Kacheln verloren.**

`[cmd]` **Die zwei Waechter melden das korrekt** — `tabs.tsx: 17
echte Attrappen, erwartet 0`. `[read]` **Ich habe die Zahl NICHT
angepasst.** **Der Waechter hat recht, der Stand ist falsch.**

**Zu entscheiden:** ob `tabs.tsx` aus `934d2ae1^` zurueckgeholt und
die C-484-Aenderung darauf neu aufgesetzt wird. `[read]` **Das ist
ein Eingriff in einen abgenommenen Commit — nicht ohne Tom.**

### Geaendert

    apps/web/src/lib/koerper/hierarchie-read.ts     Teil 1
    apps/web/src/lib/koerper/hierarchie.ts          Teil 1
    apps/web/src/lib/koerper/muskelbaum.ts          nachbarschaft()
    apps/web/src/app/v2/recovery/modale.tsx         Teil 3
    apps/web/src/app/v2/recovery/tab-messwerte.tsx  A6
    apps/web/src/app/v2/recovery/ansicht.tsx        Prop
    .../__tests__/g430-hierarchie.test.ts           nachgezogen
    .../__tests__/g435-nachbarschaft.test.ts        NEU, 9 Waechter

    tools/_g435-stand.mjs      C-484 nachmessen
    tools/_g435-kachel.mjs     A6 am Schirm
    tools/_g435-sabotage.mjs   A7
    tools/_g435-schau.mjs      A5 am Schirm

**Nichts in `supabase/`. Nicht committet, nicht gestaget.**

### Neustart noetig?

`[read]` **Nein** — nur `apps/web/src`, das laedt heiss nach.


## Abnahme

**2026-09-08, Orchestrator.**

    A1  Recovery laeuft, 0 Seitenfehler
    A2  drei Zeilen plus g430-Testattrappen
    A3  null Leser der Seitenzeilen
    A5  Modal geraeumt, 83 -> 0
    A6  4 Einrueckungsstufen
    A7  14 Sabotagen, alle rot
    A9  web 1666/1670, coach 65/65

### Der wichtigste Teil des Berichts

> *,,Ich habe bei der C-484-Konfliktloesung Schaden angerichtet.
> Nicht *RUECKFALL zu ATTRAPPE berichtigt* ? gemessen an
> `934d2ae1`: vorher 1 Attrappe + 19 RUECKFALL, nachher 17
> Attrappen + 0 RUECKFALL, 58 Zeilen raus, 14 `<Card>`-Bloecke
> weg. Ich habe die FALSCHE Stash-Haelfte behalten."*

`[read]` **Er hat seine eigene abgenommene Arbeit gemessen und
widerlegt** ? **und die Waechterzahlen NICHT angepasst, damit der
Schaden sichtbar bleibt.**

`[cmd]` **Ich hatte es abgenommen mit *,,er hat die alte Haelfte
verworfen, nicht die neue"*** ? **falsch, ich habe seinen Bericht
geglaubt statt gemessen.**

`[read]` **`tabs.tsx` ist ein eigener Punkt.**

### Der blinde Fleck

> *,,`seite` in den `select`-String zurueckzuschreiben blieb gegen
> `tsc` GRUEN ? die Spaltenliste ist eine Zeichenkette. Am Schirm
> faellt dafuer ganz Recovery aus."*

`[cmd]` **Dafuer gibt es jetzt einen Waechter, der die Liste
zerlegt.**

**Abgenommen.**


## Berichtigt 2026-09-08 -- Codex baut zuerst

`[read]` **Der Auftrag verlangte, BEVOR Codex baut zu melden** ?
**und C-484 verlangte, auf die Meldung zu warten.**

`[read]` **Beide warteten. Mein Fehler.**

## Die neue Reihenfolge

    1  Codex baut C-484 vollstaendig
    2  DU ziehst drei Zeilen nach
    3  und raeumst das Modal

`[cmd]` **Die drei Zeilen, von Codex gemessen:**

    hierarchie-read.ts:59   ebene und seite aus dem .select()
    hierarchie.ts:35        ebene: number | null   -> weg
    hierarchie.ts:38        seite: string | null   -> weg

`[read]` **Zwischen 1 und 2 ist Recovery kaputt** ? **erwartet,
kein Befund.**

## Teil 1 kannst du SOFORT

`[read]` **Das Modal raeumen haengt an nichts.**

`[cmd]` **G-433 laeuft dafuer** ? **stimme dich ab.**
