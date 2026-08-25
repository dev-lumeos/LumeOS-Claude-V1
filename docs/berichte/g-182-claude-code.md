# G-182 — Claude Code, 2026-08-25

Auftrag: `docs/auftraege/g-182-claude-code.md` (sieben Punkte)

**Alle sieben erledigt.** Bei Punkt 6 traegt eine der drei Teilregeln
ihre eigene Schwelle nicht — gemessen und gemeldet, nicht passend
gemacht.

Nicht committet, nicht gestaged, nicht gepusht.

---

## 1 · DER FILTER HAENGT — behoben und bewacht

**Tom:** *„waehle ich zb enhanced/fatburner und danach supplements
kommt nichts mehr."*

`[cmd]` **`fatburner` gibt es nur unter `enhanced`** — 10 Substanzen.
Unter `supplement` (182) trifft die Kategorie keine einzige Zeile.

`[read]` **Der Fehler war die Zustandsfuehrung, nicht der fehlende
Knopf** — genau wie der Auftrag sagt. `nachGruppenwechsel()` setzt die
Kategorie zurueck, wenn die Gruppe wechselt, und **laesst sie stehen,
wenn dieselbe Gruppe nochmal geklickt wird.**

`[cmd]` **Der Weg, den Tom gegangen ist, am laufenden Bild:**

    Start                     318 Zeilen
    nach „Enhanced"            75
    nach „fatburner"           10
    nach „Supplements"        182   <- erwartet 182
    aktive Filter danach      Supplements · 182  +  Alle

**Als Test bewacht**, wie verlangt — drei Faelle: Wechsel setzt
zurueck, gleiche Gruppe aendert nichts, und der Knopf darf `setGruppe`
nicht am Regelweg vorbei aufrufen.

**Bei 0 Treffern steht jetzt der Grund**, nicht eine leere Liste:
*„Keine Substanz enthält „zzz" in Name oder Beschreibung."* — mit
Knopf *„Filter zurücksetzen"*. `[read]` Der Satz nennt die Ursache in
der Reihenfolge, in der ein Filter greift: erst Suche, dann Kategorie,
dann Gruppe.

`[cmd]` **Die Kategorieleiste zeigte schon vorher nur, was es in der
Gruppe gibt** — `kategorieZaehler` leitet aus der gefilterten Liste ab.
Das war nicht der Fehler.

## 2 · DERSELBE KASTEN AUF DREI REITERN — 3 → 1

`[cmd]` **Vorher gemessen, an 24 Substanzen:** der Kasten stand bei
jeder Enhanced-Substanz auf **3 von 4 Reitern**.

`[cmd]` **Nachher: 1 von 4** — bei allen geprueften.

`[read]` Er steht im Ueberblick, wo er hingehoert; *Dosierung* und
*Sicherheit* zeigen ihren eigenen Inhalt.

## 3 · DIE OBERE KACHEL — jetzt drei Kacheln, linksbuendig

`[cmd]` Vorher trugen `Ueberwachung` und `Reinheit` die
`v2-supp-kasten-zeile` mit **rechtsbuendigem Wert**. `[read]` **Das ist
die Zeile aus dem Zahlenkasten** — „350 mg" rechts ist ablesbar, ein
Satz ueber vier Zeilen rechtsbuendig ist es nicht.

**Jetzt drei Textkacheln nebeneinander**, je mit Ueberschrift und
linksbuendigem Text — dieselbe Bauform wie im Ueberblick, kein Umbau
der Kachelstruktur.

## 4 · DER QUELLEN-KNOPF — eigener Reiter

**Tom:** *„quellen haben keine funktion."*

`[cmd]` **`sources` ist bei 290 von 290 gefuellt**, Gestalt
`[{ref, fields, verified}]`.

**Entschieden: ein eigener Reiter, kein Ausklappen unter dem Chip.**
`[read]` Der Chip stand in der Fusszeile und tat nichts; ein Reiter ist
der Ort, an dem die Tafel ohnehin Inhalte fuehrt, und er traegt seine
Zahl wie die anderen.

`[cmd]` Kreatin: **„Quellen · 2"**, beide mit Verweis und den Feldern,
die sie belegen.

`[read]` **`verified` wird mitgezeigt** — der Bestand fuehrt fast alles
als ungeprueft. Das zu verschweigen waere dieselbe Sorte Fehler wie
eine Zahl ohne Herkunft.

## 5 · `[object Object]` — 6 → 0

`[cmd]` **Vorher an 24 Substanzen gemessen: 6 zeigten `[object
Object]`** (1-Andro, Andarine, Clomiphene, Fladrafinil, Hexarelin,
Selank).

`[cmd]` **Nachher: 0 — an 24 UND an 55 Substanzen.**

`[cmd]` **Die Ursache:** 50 der 260 gefuellten `mythen_de` sind Arrays
**aus Objekten** (`{mythos_de, korrektur_de}`). G-180 las Zeichenkette
und Array, **nicht das Objekt darin** — und `String({…})` ergibt
`[object Object]`.

**Mythos und Korrektur stehen jetzt getrennt**, der Mythos gedaempft in
Anfuehrungszeichen. `[read]` Die Korrektur ist die Aussage, der Mythos
nur ihr Anlass.

## 6 · FLIESSTEXT STATT AUFZAEHLUNG — eine Teilregel traegt nicht

**Gemessen VOR dem Bau, wie verlangt:**

| Feld | trifft | von | Anteil | Urteil |
|---|---|---|---|---|
| `wer_nicht_de` mehrteilig | **281** | 290 | **97 %** | schon richtig |
| `mythen_de` mit `Mythos:` **und** `Korrektur:` | **16** | 260 | **6 %** | **unter 30 %** |
| `mythen_de` mit `Mythos:` | 30 | 260 | 12 % | als Formatierung geloest |
| `rechtslage_klartext_de` mit `:` | **54** | 136 | **40 %** | im Band |

`[cmd]` **`wer_nicht_de` war schon richtig:** es kommt als
`text[]` an und wird als `<ul>` gerendert — **1 Liste, 5 Punkte** bei
1-Testosterone (gemessen). **Nichts zu tun.**

`[read]` **Die Doppelpunkt-Regel fuer `mythen_de` traegt ihre eigene
Schwelle nicht** — 16 von 260 sind 6 %, der Auftrag nennt 30 % als
Untergrenze. **Ich habe sie nicht gebaut.**

`[cmd]` **Stattdessen der belegte Fall:** 30 Eintraege beginnen mit
`Mythos:` und trennen mit einem Gedankenstrich — **ohne
Ueberschneidung mit den 50 Objekt-Arrays.** Das ist keine
Zerlegungsregel, sondern die Formatierung eines Eintrags, den das Array
ohnehin liefert. So gebaut.

`[read]` **`rechtslage_klartext_de` liegt mit 40 % im Band** — die
Regel bliebe aber eine Doppelpunkt-Heuristik auf Fliesstext, und 82 von
136 Zeilen wuerden dabei unveraendert stehenbleiben. **Ich habe sie
nicht gebaut und melde es**, statt eine Regel einzuziehen, die bei
sechs von zehn Substanzen nichts tut.

## 7 · DIE WADA-KACHEL SAGT JETZT, WOFUER SIE GILT

`[cmd]` **`note_de` ist bei 0 von 290 gefuellt** (`note_en` ebenso) —
der Bestand traegt keinen erklaerenden Satz.

**Die Kachel beschriftet sich genauer:**

    vorher   WADA  erlaubt    nicht auf der Liste
    jetzt    WADA  erlaubt    im getesteten Wettkampf erlaubt · S1.1

`[cmd]` **`wada_category` liegt bei 129 von 290 vor** und wird
angehaengt, wo sie etwas sagt — `unknown` faellt weg.

`[read]` **Was NICHT dasteht: welche Verbaende testen.** IFBB Pro und
NPC sind keine WADA-Unterzeichner, aber **der Bestand traegt dazu
nichts** — eine Liste von Verbaenden waere eine Aussage ohne Beleg.
**Als eigener Punkt gemeldet, siehe unten.**

---

## NACHWEIS

### Vorher/nachher, an der gerenderten Seite

| | vorher | nachher |
|---|---|---|
| `[object Object]` (24 Substanzen) | **6** | **0** |
| `[object Object]` (55 Substanzen) | — | **0** |
| Warnkasten je Enhanced | **3 von 4 Reitern** | **1 von 4** |
| Filterweg → `Supplements` | leer | **182 Zeilen** |

### Negativprobe — vier Eingriffe, alle rot

| Eingriff | vorher | mit Fehler | zurueck |
|---|---|---|---|
| Ruecksetzung entfernt | 14/0 | **13/1** | 14/0 |
| Knopf ruft `setGruppe` direkt | 14/0 | **13/1** | 14/0 |
| Warnkasten wieder auf Dosierung | 13/0 | **12/1** | 13/0 |
| Objekte wieder mit `String()` | 17/0 | **15/2** | 17/0 |

**Alle Dateien byteweise identisch zurueck.**

`[cmd]` **Und ein eigener Test hat mich erwischt:** *„Objekte ganz ohne
Text erzeugen keinen leeren Absatz"* schlug zuerst fehl — bei einem
gueltigen JSON-Array ohne lesbaren Inhalt fiel die Anzeige auf den
**rohen Text** zurueck und haette `[{"zahl":5}]` gezeigt. Behoben: das
Ergebnis eines gueltigen Arrays gilt, auch wenn es leer ist.

### Stand

`[cmd]` `tsc` **sauber** · Build **`Compiled successfully`** · Tests
**218 pass, 0 fail** · `serverimport` **50 Chunks, 0 Treffer** ·
`sprachrueckfall` **0 Funde**.

**Bilder:** `g182-1-filter.png` · `g182-2-leer.png` ·
`g182-3-bpc-1..4.png` · `g182-4-quellen.png`

---

## GEAENDERT

| Datei | |
|---|---|
| `lib/supplements/substanz-kategorien.ts` | `nachGruppenwechsel()` **neu** |
| `lib/supplements/substanz-reiter.ts` | Quellen-Reiter |
| `lib/supplements/substanz-kacheln.ts` | WADA-Hinweis + Klasse |
| `lib/supplements/substanz-read.ts` | `sources`, `wada_category` |
| `v2/supplements/substanz-abschnitte.tsx` | Objekt-Arrays, `Mythos:`-Muster |
| `v2/supplements/substanz-tafel.tsx` | Warnkasten als Kacheln, Quellenliste |
| `v2/supplements/substanz-detail.tsx` | `waehleGruppe`, Leer-Hinweis |
| `v2/supplements/supplements.css` | Quellenliste, Warn-Textkachel |
| drei Testdateien | 8 Faelle dazu |
| `tools/_g182-messen.mjs`, `_g182-bilder.mjs` | **neu** |

**Keine Texte geaendert.** Kein Umbau der Kachelstruktur.

## OFFEN

1. **Welche Verbaende nach WADA-Code testen, steht nirgends im
   Bestand.** `supplement_wada.note_de` und `note_en` sind bei **0 von
   290** gefuellt. Fuer Toms Frage — gilt das fuer Bodybuilding? —
   braeuchte es einen kuratierten Satz je Status. **Das ist ein
   Datenpunkt, kein Anzeigepunkt.**
2. **`rechtslage_klartext_de`:** 54 von 136 tragen einen Doppelpunkt;
   eine Aufzaehlungsregel darauf liesse 82 unveraendert. **Nicht
   gebaut, siehe Punkt 6.**
3. **BPC-157 hat keine eigenen Quellen** — der Reiter erscheint dort
   richtigerweise nicht. Wie viele der 290 leere `sources` tragen, ist
   nicht gezaehlt.
