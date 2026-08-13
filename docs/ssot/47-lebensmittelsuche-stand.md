# Lebensmittelsuche: Stand nach dem Ausbau

`[cmd]` Erhoben 2026-08-14, Branch `suche/wortschatz-und-relevanz`
(zusammengeführt nach `dev`). Fasst zusammen, was `41` bis `46` einzeln
belegen, und hält den erreichten Stand fest.

## Der Ausgangsfall

Tom suchte `huehnerbrust` und fand **nichts**. Über den Kategoriefilter
„Geflügel" stiess er darauf, dass der Bestand `Hähnchen Brust` und
`Hähnchen Brustfilet` führt — je in mehreren Zubereitungsvarianten. Seine
Frage: *Wie soll ein Mensch mit seinem eigenen Wortschatz das finden?*

`[cmd]` Heute liefern **alle vier Formen** 31 Treffer mit
`Hähnchen Brustfilet, roh` auf Platz eins:

```
huehnerbrust    huehnchenbrust    huehner brust    pouletbrust
```

Die Kette: `huehnerbrust` → zerlegt zu `huehner` + `brust` → Synonym
`huehner` → `haehnchen` → trifft den Bestandsnamen.

Dazu `karfiol` → Blumenkohl, `marille` → Aprikose, `paradeiser` → Tomate.

## Was gebaut wurde, in der Reihenfolge der Wirkung

| | |
|---|---|
| **Eine Faltungsregel** (072) | `[cmd]` vorher liefen zwei Regeln bei **4.769 von 7.140 Namen (67 %)** auseinander — verdeckt durch eine Aliastabelle, die beide Formen trug |
| **Abgeleitete Aliase** (022) | `[cmd]` 11.102 zusammengeschriebene Formen; Aliastabelle 21.420 → 32.522 |
| **Relevanz aus Aliasen** (071) | vorher konnte ein Aliastreffer nie über 0,65 kommen, weil nur `name_de` geprüft wurde |
| **Zubereitungs- und Warengruppenfilter** (023, 073) | `[cmd]` 11 Zubereitungsarten aus dem Bestand abgeleitet, „nur Grundnahrungsmittel" entfernt 2.050 Gerichte |
| **Dekompositum** (Anfrageseite) | Wörterbuch mit 14.502 Bestandteilen, in der App |
| **Gerichtete Synonyme** (024) | `[cmd]` 4.869 Einträge aus OpenThesaurus, am Bestand gefiltert |
| **12 Brücken von Hand** | `haehnchen`, das in **keiner** Quelle steht |

## Die drei Entscheidungen, die den Unterschied machten

**Die Rangordnung war schon da.** `[cmd]` `sort_weight` ist bei allen 7.140
gefüllt (0–980) und trifft fachlich das Richtige: Fisch 695, Gemüse 612,
Fleisch 414, **Gerichte der Gruppen X und Y auf 0**. Ein geplanter Umbau
über 80 Zubereitungswörter entfiel — der BLS-Code trägt Warengruppe und
Zubereitung an festen Stellen, und `sort_weight` hat beides bereits
übersetzt. *Bevor eine Rangordnung gebaut wird: nachsehen, ob die Quelle
sie mitliefert.*

**Der Filter muss gerichtet sein.** `[cmd]` Der naheliegende Filter
(„Gruppe berührt den Bestand") liess **17 von 20** Entgleisungen durch:
`kartoffel` → *piefke*, `quark` → *scheisse*, `brust` → *titte*. Die
Richtung *fremdes Wort → Bestandswort* liefert 4.869 Einträge und keine
davon; eine Ausschlussliste war nicht nötig. Eine Beleidigung ist nie das
Ziel einer Lebensmittelsuche.

**Bedeutungen werden nicht erfunden.** `[cmd]` Eine Tabelle
„Zubereitungscode → Bezeichnung" wäre zu **69 %** geraten gewesen: `600`
heisst Saft (Obst), Käse (Milch), geräuchert (Fisch), geröstet (Nüsse).
Stattdessen die 11 Wörter, die tatsächlich in den Namen stehen — und
weil Wort und Code sich nicht decken (`roh`: 509 beides, 338 nur Code,
153 nur Wort), filtert `preparation_kinds` über **beides**.

## Bestand

`[cmd]` Schema `nutrition`, Stand 2026-08-14:

| | |
|---|---|
| Tabellen / Sichten | 17 / 2 |
| Lebensmittel | 7.140 |
| Nährwerte | **869.501** über **138** Codes |
| Aliase | 32.522 |
| Synonyme | 4.869 |
| Zubereitungsarten | 11 |

`[cmd]` Die 138 Codes wurden am 2026-08-14 vervollständigt: 30
Einzelfettsäuren (EPA, DHA, Ölsäure, Linolsäure) fehlten, weil die
CSV-Erzeugung sie verlor — 171.409 Werte. Siehe `46-…`.

`[cmd]` Der gesamte Bestand ist gegen die amtliche Arbeitsmappe geprüft:
698.092 Werte, 353 Abweichungen, **alle Rundungen auf die fünfte
Nachkommastelle**. Null inhaltliche.

## Was ehrlich offen bleibt

`[cmd]` Das Prüfskript
(`supabase/_pipeline/_validierung/suche-wortschatz-pruefen.ts`, 50 Begriffe
über 11 Warengruppen) meldet **30 von 30 soll**, **16 von 16 schutz**,
**0 Rückfälle** — und druckt vier Fälle namentlich aus:

| | |
|---|---|
| `rinderhack` | zerlegt richtig, aber Blätterteigtaschen ranken vor dem Hackfleisch — **Relevanz, nicht Wortschatz** |
| `yoghurt` | Schreibvariante, in keiner der beiden Quellen |
| `erdaepfel` | Thesaurus kennt nur den Singular `erdapfel` |
| `schoggi` | Schweizerdeutsch, in keiner Quelle |

Sie werden benannt statt weggelassen — sonst sähe die Prüfung besser aus
als die Lage.

## Der offene Punkt, der Aufmerksamkeit braucht

`[cmd]` **Laufzeit: 290 ms → 547 ms** bei zweiwortigen Anfragen. Die
Grundkosten lagen schon vorher bei 152–295 ms; die Suche war nie schnell.

Ursache benannt und älter als dieser Ausbau: die Bedingung faltet
`concat_ws(bls_code, name_de, name_en, name_th)`, der Trigramm-Index liegt
auf `search_fold(name_de)` — **zwei verschiedene Ausdrücke, also
sequenzieller Scan**. Ein Umbauversuch auf sechs feste `text[]`-Slots war
isoliert schneller (0,97 ms gegen 48 ms), eingebaut aber langsamer
(704 ms gegen 562 ms), weil jeder der sechs Slots einen eigenen Durchlauf
auslöst. Verworfen, Messwerte im Code hinterlassen.

Das ist eine eigene Aufgabe und steht in der TODO.

## Was als Nächstes lohnt

`[read]` Aus der Recherche zu vergleichbaren Anwendungen: der nächste
grosse Hebel wäre **Fehlsuchen mitschreiben**. `[cmd]` Die 50 geprüften
Begriffe sind geraten — auch die guten. Wer die 30 Wörter kennt, die
Menschen tatsächlich tippen, pflegt diese statt 2.643 auf Verdacht.
Die Kurationstabellen sind dafür gebaut und leer.
