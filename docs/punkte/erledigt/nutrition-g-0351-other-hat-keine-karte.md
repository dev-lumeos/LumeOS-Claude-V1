---
nr: G-351
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-348
entscheidung: E-58
agent: claudecode
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: de9f4351
beruehrt:
  dateien:
    - apps/web/src/lib/nutrition/slots-lage.ts
zahlen:
  gemessen: 2026-09-07
---

# G-351 — `other` hat keine Karte

## Befund

Aus G-348, Claude Code, 2026-09-07.

`[cmd]` **Ein Quick-Add-Posten auf `other` ist ueber *Wie gestern*
gar nicht erreichbar** — **`rasterZeilen` kennt nur die vier
Rasterreihen.**

`[read]` **Es gibt keine Karte *Sonstiges*.**

`[cmd]` **Der `meal_type`-CHECK kennt sieben Werte:** `breakfast`,
`lunch`, `dinner`, `snack`, `pre_workout`, `post_workout`, `other`.

`[cmd]` **In Gebrauch sind vier.**

## Was das heisst

`[read]` **Seit E-58 ordnet die Zeit zu, nicht die Kategorie** —
**und die Slots liefern die Reihen.**

`[read]` **Ein Posten auf `other` faellt durch, weil kein Slot ihn
traegt.**

`[read]` **Zwei Wege:**

`[read]` **Eine Sammelreihe fuer alles ohne Slot** — **aber E-63 hat
gerade *Sonstige* abgeschafft, weil alles zuteilbar war.**

`[read]` **Oder: Quick-Add setzt kein `other`** — **der Nutzer waehlt
einen Slot, und wer keinen passenden hat, legt einen an** (E-58:
keine Obergrenze).

`[read]` **Der zweite Weg passt besser zu E-58 und E-63.**

## Auftrag — drei Reste aus dem Diary

**Mitbeauftragt: G-346, G-305.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · G-351 — `other` erreichbar machen oder vermeiden

`[read]` **Miss zuerst, ob ein Nutzer `other` ueberhaupt setzen
kann** — `[cmd]` **Quick-Add hat eine Auswahl, und `modale.tsx`
traegt sie.**

`[read]` **Wenn ja: entscheide dich fuer einen der zwei Wege und
begruende ihn.** `[read]` **Ich halte den zweiten fuer richtig** —
**der Nutzer waehlt einen Slot, und wer keinen passenden hat, legt
einen an.**

`[cmd]` **E-58: keine Obergrenze.** `[cmd]` **E-63: eine Sammelgruppe
ist die Aussage *,,wir wissen nicht, wohin damit"*.**

### 2 · G-346 — Quick-Add und die Mahlzeit

`[cmd]` **E-66 hat es fuer MealCam entschieden:** **die Mahlzeit
steht vor dem Foto, gewaehlt statt abgeleitet.**

`[read]` **Fuer Quick-Add gilt dasselbe** — **aber die Frage aus
deinem Bericht bleibt: legt *Mahlzeit mit anlegen* immer eine neue
an, oder verwendet es eine bestehende wieder?**

`[read]` **Mein Vorschlag: die bestehende im selben Slot.**
`[read]` **Wer um 15:00 Kaffee und um 15:10 einen Keks erfasst, hat
einen Nachmittagssnack** — **nicht zwei.**

`[read]` **Das folgt E-58: die Zeit ordnet zu, der Slot ist die
Ordnung.** `[read]` **Kein erfundenes Zeitfenster.**

### 3 · G-305 — vier Sackgassen, der Rest

`[cmd]` **Fuenf von sechs waren am 02.09. erledigt.** `[cmd]` **Der
sechste war ein `InEntwicklungKnopf`, ersetzt.**

`[read]` **Miss, ob der Punkt jetzt zu ist** — **oder was noch
offen ist.**

### Was nicht zu tun ist

**Keine Sammelgruppe** — E-63.
**Nichts in `supabase/` aendern.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    other           erreichbar oder vermieden, begruendet
    Quick-Add       neue oder bestehende Mahlzeit, belegt
    15:00 / 15:10   ein Snack oder zwei, am Schirm
    G-305           zu / was fehlt
    Bildschirmfoto  vorher / nachher

## Bericht

**Claude Code, 2026-09-05.**

### 1 · G-351 — die Praemisse des Auftrags faellt

**Der Auftrag sagt:** *,,Miss zuerst, ob ein Nutzer `other` ueberhaupt
setzen kann — Quick-Add hat eine Auswahl, und `modale.tsx` traegt
sie."*

`[cmd]` **Quick-Add kann es nicht.** **Seine Auswahl fuehrt die
MAHLZEITEN dieses Tages, nicht die Kategorien** — `modale.tsx:518-545`
setzt als Wert eine `meal_id`, also eine Zeile:

    werte: 8c6cf4e5-…, 01687ff2-…, 9d7ad4fd-…
    label: Fruehstueck, Mittagessen, Snack, Abendessen

`[cmd]` **`MEAL_TYPES` wurde in G-340 aus der Datei entfernt.**

`[read]` **Damit war meine eigene Aussage aus G-348 ungenau** —
*,,Quick-Add legt auf `other`"*. **Das stimmt nicht.**

### Was `other` wirklich erzeugt — fuenf Stellen

`[cmd]` **Gemessen am 2026-09-05, am Schirm und im Quelltext:**

    modale.tsx (Quick-Add)     NEIN   waehlt eine meal_id
    mahlzeiten.tsx  Auswahl    JA     kat:other, am Schirm belegt
    erfassen-modal.tsx         JA     kategorieAuswahl()
    rezepte-echt.tsx           JA     kategorieAuswahl()
    slots-lage.ts rasterQuelle JA     ordnung[i] ?? 'other'
    mahlzeiten.tsx  Vorgabe    JA     useState<MealType>('other')

`[read]` **Die letzten beiden sind die schwersten, weil sie keine
Wahl sind.**

`[cmd]` **`rasterQuelle` rechnet `other` herbei, wenn ein Plan mehr
Slots hat als benutzte Kategorien.** `[cmd]` **`dev@lumeos.app`
trifft genau das: fuenf `meal_slots`, ein Plan mit fuenf
`meal_plan_slots`, und `benutzteReihen` sind vier.**

`[cmd]` **Und die Vorgabe des freien Formulars stand auf `other`** —
**wer die Auswahl nicht anfasste, legte eine Mahlzeit an, die kein
Raster traegt.**

`[read]` **Die letzte habe ich nicht gefunden, sondern der Waechter.**
**Mein Grep hatte sie uebersehen.**

### Die Entscheidung

**Der Auftrag:** *,,Ich halte den zweiten fuer richtig."*

**Der zweite Weg, und zwar aus dem Befund heraus, nicht nur aus der
Vorliebe:**

`[cmd]` **Der Bestand vertraegt es ohne Wanderung: NULL Zeilen auf
`other` in 2.899 Mahlzeiten** (alle Nutzer, 2026-09-05). **Die
Sammelreihe haette eine Karte fuer eine leere Menge gebaut.**

`[read]` **Und die Sammelreihe haette den zweiten Fehler nicht
geheilt:** `rasterQuelle` erzeugt `other` **ohne Zutun des Nutzers**.
**Eine Karte dafuer zu bauen hiesse, einen Rechenfehler zu
moeblieren** — der fuenfte Slot heisst *Abendessen*, er gehoert nicht
unter *Sonstiges*.

`[read]` **E-63 sagt das Gleiche von der anderen Seite:** eine
Sammelgruppe ist die Aussage *,,wir wissen nicht, wohin damit"*.
**Hier wissen wir es** — der Slot steht da, mit Namen und Zeit.

### Was gebaut wurde

`[cmd]` **`kategorieAuswahl` filtert `other`** — **sechs statt sieben
Eintraege.** **Alle drei Formulare erben es**, ohne eine zweite Liste.

`[cmd]` **`rasterQuelle` gibt dem Ueberhang die LETZTE Kategorie der
Reihe**, nicht `other`. **Der fuenfte Slot ist damit ein zweiter
Snack** — der Slot ordnet, sein Name steht ohnehin daneben (E-58).

`[cmd]` **Dieselbe Regel im freien Formular** (`mahlzeiten.tsx:464`),
**und die Vorgabe ist jetzt der erste Eintrag der Auswahl.**

`[read]` **`KATEGORIE_TEXT` behaelt `other`** — die Auswahl bietet es
nicht an, aber eine bestehende Zeile soll ihren Namen zeigen statt
des Rohcodes. **Nichts wird unlesbar.**

### 2 · G-346 — Quick-Add legt keine Mahlzeit an

`[cmd]` **Gemessen: `anlegen()` in `modale.tsx:379` postet gegen eine
BESTEHENDE `meal_id` aus der Auswahl.** **Es gibt keinen Zweig, der
eine Mahlzeit erzeugt.**

`[read]` **Toms Vorschlag ist damit bereits gebaut** — *,,die
bestehende im selben Slot"*. **Es gab nie ein *,,Mahlzeit mit
anlegen"*, das eine zweite angelegt haette.**

`[cmd]` **Der leere Tag ist sauber abgefangen** (`modale.tsx:537`):
*,,Fuer diesen Tag gibt es noch keine Mahlzeit. Leg im Tagebuch eine
an."* **Kein zweiter Schreibweg.**

**Der Nachweis, auf `test-user@lumeos.local`:**

    Vorher-Stand gemessen     0 Mahlzeiten, 0 Posten
    Buehne                    ein Snack, 15:00
    Quick-Add 1               Kaffee   5 kcal -> 35b9c2d6-…
    Quick-Add 2               Keks    90 kcal -> 35b9c2d6-…
    am Schirm                 EINE Snack-Karte, beide Posten
    Sonstiges am Schirm       nein
    in der Datenbank          1 Mahlzeit, 2 Posten
    Rueckbau gezaehlt         DELETE 2 / DELETE 1 -> 0 | 0

`[cmd]` **Dieselbe `meal_id` fuer beide** — **ein Nachmittagssnack,
nicht zwei.** **Bildschirmfoto: `backup/g351-nachher-testuser.png`.**

### 3 · G-305 — zu, und richtig abgelegt

`[cmd]` **Die Datei liegt in `erledigt/`** (Commit `13c12f6f`).
**Nachgemessen statt geglaubt:**

    1  New plan ohne Fuellweg      zu   planMitWochenAnlegen (C-372)
    2  Planner meldet ,,kein Plan"  zu   Zweig steht, nennt jetzt
                                        die Werkbank statt G-97
    3  New recipe, alte Auskunft   zu   entfernt (G-319)
    4  Copy week erklaert sich weg zu   kopiert wirklich (G-319)

`[cmd]` **Kein `InEntwicklungKnopf` mehr in `tab-planner-echt.tsx`**
(G-331). `[cmd]` **Kein G-97 als Begruendung in der Oberflaeche** —
die verbliebenen Treffer sind Herkunftsvermerke in Kommentaren.

`[read]` **Punkt 2 ist der interessante:** der Zweig
`!d.plan || d.wochen.length === 0` steht noch — **aber er ist keine
Sackgasse mehr.** **Er nennt den Weg, der geht.**

**G-305 ist zu.**

### Eine Abweichung, die gemeldet gehoert

`[cmd]` **Die Punktdatei nennt G-305 als dritten Mitauftrag, der
Auftrag im Chat nicht.** `[read]` **Nach CLAUDE.md gilt die Datei** —
**deshalb gemessen und berichtet.**

### Waechter und Sabotage

`[cmd]` **Neu: `other-hat-keine-karte.test.ts`, 12 Proben.**
**Rotlauf vor dem Bau: 7 von 12 rot.**

`[cmd]` **Je Zusage eine Sabotage, alle vier ROT:**

    other wieder in kategorieAuswahl        fail=2
    rasterQuelle rechnet other herbei       fail=4
    freies Formular setzt other (Ueberhang) fail=1
    Vorgabe des Formulars wieder other      fail=1
    Nachlauf, zurueckgesetzt                fail=0

`[read]` **Die dritte und vierte Sabotage betreffen Stellen, die der
Waechter selbst gefunden hat** — mein Grep hatte sie uebersehen.

### Zwei Waechter berichtigt, keiner abgeschwaecht

`[cmd]` **`mahlzeit-name-eine-quelle.test.ts:243`** mass `length ===
7`. **Jetzt 6, plus eine neue Probe, dass `other` nicht dabei ist** —
**die Zusage ist schaerfer, nicht schwaecher.**

`[cmd]` **`raster-liest-planslots.test.ts:124` erwartete `other` als
fuenften Wert** — **er hat den Fehler als Absicht festgeschrieben.**

`[read]` **Sein Kommentar sagte es selbst richtig:** *,,Er
verschwindet nicht."* `[cmd]` **Er verschwand doch** — es gibt keine
Karte fuer `other`. **Die Absicht stimmte, das Mittel nicht.** **Die
Zusage steht jetzt mit `length === 5` daneben.**

### Vollstaendiger Lauf

    tsc --noEmit          sauber
    next lint             keine Warnung, kein Fehler
    Tests                 1424 / 1424 gruen, 0 Fehler
    dev@lumeos.app        730 Mahlzeiten, unveraendert
    meal_type = 'other'   0 Zeilen, alle Nutzer
    gestaged              nichts

**Bildschirmfotos:** `backup/g351-vorher-freie.png` (mit
*Sonstiges*), `backup/g351-nachher-freie.png` (ohne),
`backup/g351-nachher-testuser.png` (der 15:00/15:10-Fall).

### Was nicht gemacht wurde

**Keine Sammelgruppe** (E-63). **Nichts in `supabase/`.** **Nichts
auf `dev@lumeos.app` geschrieben.** **Nicht committet, nicht
gestaged.**

`[read]` **Und keine Wanderung fuer Bestandsdaten** — es gibt keine:
null Zeilen auf `other`. **Waere eine noetig, gehoerte sie Codex.**

## Abnahme

**2026-09-07, Orchestrator.**

### Er hat die Praemisse des Auftrags widerlegt

`[cmd]` **Quick-Add kann `other` gar nicht setzen.**

`[read]` **Damit ist meine Auftragsformulierung falsch** — **und
sein eigener G-348-Bericht auch.** `[read]` **Er hat beide
berichtigt.**

`[read]` **Der Auftrag begann mit *,,miss zuerst, ob ein Nutzer
`other` ueberhaupt setzen kann"*** — **und das war die richtige
erste Frage.**

### Fuenf echte Erzeuger, zwei davon gerechnet

`[cmd]` **Zwei werden nicht gewaehlt, sondern berechnet.**

`[read]` **Das ist der Unterschied, der zaehlt:** **einen gewaehlten
Wert kann man aus der Auswahl nehmen** — **einen gerechneten muss
man an der Rechnung aendern.**

### Die Loesung folgt beiden Entscheidungen

`[cmd]` **`other` aus der Auswahl entfernt.** `[cmd]` **Der
Slot-Ueberlauf geht in die letzte Kategorie.**

`[read]` **E-58: keine Obergrenze, die Zeit ordnet zu.**
`[read]` **E-63: eine Sammelgruppe ist die Aussage *,,wir wissen
nicht, wohin damit"*.**

`[read]` **Keine Karte *Sonstiges* gebaut** — **das war der zweite
Weg im Auftrag, und er hat ihn genommen.**

### G-346 war schon gebaut

`[cmd]` **So, wie Tom es vorgeschlagen hatte.** `[cmd]` **Der
15:00/15:10-Fall am Schirm belegt.**

`[read]` **Ich hatte es als offene Produktentscheidung
weitergegeben** — **es war entschieden und umgesetzt.**

`[read]` **Und der Nachweis ist der richtige:** **nicht *,,der Code
tut es"*, sondern *,,zwei Erfassungen ergeben einen
Nachmittagssnack"*.**

### G-305 ist zu

`[cmd]` **Bestaetigt** — **fuenf von sechs waren am 02.09. erledigt,
der sechste ersetzt.**

### Und ein Vermerk zur Buchfuehrung

`[cmd]` **Die Punktdatei fuehrt G-305 als dritten Mitauftrag, der
Auftragstext nicht.**

`[read]` **Er hat es gemeldet** — **richtig.** `[cmd]` **G-305 lag
bereits in `erledigt`, deshalb kam es nicht in den Text.**

**Abgenommen.**

