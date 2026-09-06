---
nr: G-365
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-364
entscheidung: E-69
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  dateien:
    - apps/web/src/app/v2/training/ansicht.tsx
zahlen:
  gemessen: 2026-09-07
  verdaechtig: 23
---

# G-365 — vier Schritte je Kachel

## Anlass

`[cmd]` **G-364: drei Kacheln trugen einen Attrappen-Vermerk und
lasen echte Daten** — **`<RecMuscleMap />` wurde ohne Prop gerufen,
der Leseweg lag ungenutzt daneben.**

`[cmd]` **Und 23 weitere Kacheln tragen denselben moeglicherweise
falschen Vermerk.**

Tom, 2026-09-07: *,,und jetzt laesst claude jedes modul / jeden
subnavigationspunkt sauber pruefen."*

## Die vier Schritte, je Kachel

    1  Ist die Mockup-Kachel oben ueberhaupt vorhanden?
    2  Wenn angebunden: steht die Mockup-Kachel unten als Soll?
    3  Wenn Attrappe: war sie schon mal angebunden?
    4  Wenn Attrappe: was fehlt zum Anbinden?

`[read]` **Schritt 3 ist der wichtige** — **G-364 hat gezeigt, dass
ein Vermerk luegen kann.**

`[cmd]` **`git log -S` mit dem Kachelnamen oder der Lesefunktion
sagt es in Sekunden.**

## Je Modul, je Reiter — die Liste

`[cmd]` **Gemessen 2026-09-07, `apps/web/src/app/v2/`:**

    Nr  Modul          Dateien  Reiter  Stand
    --  -----------    -------  ------  --------------------------
     1  training            10      10  fertig -- 1 falsche Marke
     2  recovery            13       9  laeuft -- 23 Kandidaten
     3  supplements         18      11
     4  goals               15      10
     5  nutrition           42       9
     6  medical             14       6
     7  dashboard            4       0  keine Reiter
     8  settings             2       0  keine Reiter
     9  coach               18      10  eigene App, Port 3220

`[read]` **In dieser Reihenfolge, eins nach dem anderen.**

`[cmd]` **`training` ist fertig:** **elf markierte Kacheln geprueft,
eine falsche Marke gefunden** — die Today-Sitzungskarte rechnete aus
einem festen Objekt, waehrend `verlauf.sitzungen` daneben lag.

`[read]` **Dasselbe Muster wie `<RecMuscleMap />` ohne Prop**
(G-364).

`[cmd]` **Vier Marken waren richtig bedingt, sechs gehoeren zu den
Entwurfsansichten** — **also nicht jede Marke luegt.**

### Zu 7 und 8

`[cmd]` **`dashboard` und `settings` haben keine Reiter** —
**trotzdem Kacheln pruefen.**

### Zu 9

`[cmd]` **`coach` ist eine eigene App auf Port 3220** — **die Regeln
gelten dort genauso** (E-71). `[read]` **Aber erst nach `apps/web`,
und mit eigener Abnahme** (G-361).

## Was das Ergebnis sein soll

**Eine Tabelle je Modul:**

    Kachel | oben? | unten? | war angebunden? | was fehlt

`[read]` **Damit kann Tom entscheiden, was er anpackt** — **statt
zu messen, ob ein Vermerk stimmt.**

## Nach jedem Modul melden

`[read]` **Nicht am Ende.** `[cmd]` **Tom nimmt einzeln ab.**

`[read]` **Und nicht auf Bestaetigung warten, um weiterzumachen** —
**melden und weiterarbeiten.** `[read]` **Wenn Tom etwas
zurueckweist, kommt es als eigener Auftrag.**

## Was nicht zu tun ist

`[read]` **Wo etwas anbindbar ist und der Leseweg danebenliegt:
anbinden** — **das war G-364.**

`[read]` **Wo ein Leseweg fehlt: melden, nicht bauen.**

**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis je Modul

    Tabelle         alle vier Spalten, je Kachel
    falsche Marken  gezaehlt und entfernt
    angebunden      wie viele, Bildschirmfoto
    fehlt           was genau, je Kachel

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

## Bericht — training

**Claude Code, 2026-09-06.** **Erstes Modul, elf Marken geprueft.**

### Die Tabelle

    Kachel                    oben  unten  war angebunden  was fehlt
    ------------------------------------------------------------------
    Sitzungskachel (Today)    JA    --     NEIN            NICHTS
                                                           -> ANGEBUNDEN
    This week                 JA    --     ja, bedingt     nichts
    Training readiness        JA    --     ja, bedingt     nichts
    Weekly volume             JA    --     ja, bedingt     nichts
    Streak                    JA    --     ja, bedingt     nichts
    Mesocycle · Block 3       JA    --     nie             Blockplanung,
                                                           kein Schema
    Routines                  JA    --     nie             Vorlagen,
                                                           kein Schema
    Recent sessions           JA    --     nie             nichts, aber
                                                           doppelt *
    Volume by muscle · 4 wks  JA    --     nie             nichts, aber
                                                           doppelt *
    Plan-Kachel (ohne Titel)  JA    --     nie             Blockplanung
    History-Kachel (o. Titel) JA    --     nie             siehe *

    * Diese Kacheln stehen in `TrainingHistory`/`TrainingPlan` — den
      ENTWURFSANSICHTEN, die seit G-359 UNTER der echten stehen. Ihre
      Marke ist richtig: sie SIND die Referenz.

### Was gefunden wurde: eine falsche Marke

`[cmd]` **Die Sitzungskachel des Today-Reiters trug
`attrappe={ATTRAPPE}` und rechnete mit einem fest verdrahteten
Objekt** (`Push B`, `6.2 t`, `~74m`).

`[cmd]` **Daneben lag `verlauf.sitzungen` seit G-69 als Prop an** —
**die Kachel nahm es nur nicht.** **Genau die Sache aus G-364.**

`[cmd]` **Gemessen: `dev@lumeos.app` hat 14 Sitzungen mit
`status='planned'`**, die naechste ist *Push 7*, 2026-09-06, 17:30,
75 min geplant.

**Angebunden.** `[cmd]` **Am Schirm: die Kachel zeigt *Push 7 ·
Gym · planned · 2026-09-06 · 0 sets · ~75m* mit der Pille *echte
Daten*.** **Attrappen im Today-Reiter: 1** (die Uebungsliste).

`[cmd]` **Bildschirmfoto: `backup/g359b-training-g365-today.png`.**

### Was dabei fast schiefgegangen waere

`[cmd]` **Erster Versuch filterte `!s.absolviert`** — **und
uebersprang damit die HEUTIGE Sitzung**, weil `absolviert` aus dem
Datum kommt.

`[cmd]` **Die Kachel zeigte *Pull 7* vom 12.09., waehrend die
Wochenzeile darunter *Push 7* als heute markierte** — **zwei
Aussagen auf einem Schirm, die sich widersprachen.**

`[read]` **Am Schirm aufgefallen, nicht im Test.** **Behoben: die
naechste Sitzung ist die erste ab dem Stichtag, einschliesslich
heute.**

### Was Entwurf bleibt, und warum

`[cmd]` **Die Uebungsliste der Sitzung.**
`[cmd]` **`ladeSitzungsUebungen` gibt es** (`sitzungen-read.ts`),
**wird an diese Ansicht aber nicht durchgereicht.**

`[read]` **Gemeldet, nicht gebaut** — der Auftrag sagt: wo ein
Leseweg fehlt, melden. **Hier fehlt er nicht, er ist nur nicht
verdrahtet** — das waere Leseweg-Arbeit und damit ausserhalb.

`[cmd]` **`total_sets` und `total_volume_kg` sind bei geplanten
Sitzungen `0`** — **kein Messwert, sondern ein Training, das noch
nicht stattgefunden hat.** **Die Kachel zeigt einen Strich statt
einer erfundenen Tonnage** (C-378).

### Vier Marken sind bedingt und damit richtig

`[cmd]` **`This week`, `Training readiness`, `Weekly volume`,
`Streak` stehen im SONST-Zweig eines Ternaers** — sie erscheinen
nur ohne Daten.

`[cmd]` **Auf `dev` laufen alle vier echt:** am Schirm belegt
*,,Training readiness · aus recovery.scores · 2026-11-06"* und
*,,Saetze je Muskelgruppe · 19 absolvierte Sitzungen"*.

`[read]` **Das ist der Unterschied, den G-364 gelehrt hat:** **eine
bedingte Marke luegt nicht, eine unbedingte kann es.**

### Sechs Marken sitzen in den Entwurfsansichten

`[cmd]` **`Recent sessions`, `Volume by muscle`, `Mesocycle`,
`Routines` und zwei Kacheln ohne Titel stehen in
`TrainingHistory`** (Z818) **und `TrainingPlan`** (Z713).

`[cmd]` **Schritt 3 nachgemessen:** `git log -S "Recent sessions"`
**nennt nur `1bb38876 add the training module as a marked
mockup`** — **nie angebunden.**

`[read]` **Und sie sollen es nicht sein:** **seit G-359 stehen
diese Ansichten UNTER der echten** (`Sitzungen`, `Kennzahlen` in
`tab-verlauf.tsx`). **Sie sind die Referenz, nicht der Ist-Stand.**

### Zahlen

    Marken in ansicht.tsx        11
      bedingt (richtig)           4
      Entwurfsansicht (richtig)   6
      FALSCH                      1  -> angebunden
    Attrappen Today-Reiter    3 -> 1

### Ein Waechter musste nachziehen

`[cmd]` **`v2-attrappen.test.ts:219`: TRAINING 11 -> 10.**

`[read]` **Nicht abgeschwaecht** — der Kommentar dort sieht genau
das vor: *,,wer eine anbindet, entfernt `attrappe` und zaehlt die
Erwartung herunter."*

### Vollstaendiger Lauf

    tsc --noEmit    sauber
    next lint       keine Warnung, kein Fehler
    Tests           1500 / 1500 gruen, 0 Fehler
    dev@lumeos.app  nicht geschrieben
    gestaged        nichts

**Naechstes Modul: recovery** (die restlichen Kandidaten aus G-364).

## Abnahme

_(vom Orchestrator)_
