# Wortschatz-Lücke: Bestand gegen OpenThesaurus

`[cmd]` Erhoben 2026-08-13, Branch `suche/wortschatz-und-relevanz`.
Daten: `docs/ssot/daten/wortschatz-luecke.json` (171 KB).
Vorgänger: `41-lebensmittelsuche-wortschatz.md`, `42-dekompositum-messung.md`.

## Warum diese Liste

Tom suchte `huehnerbrust` und fand nichts. `[cmd]` Der BLS schreibt
`Hähnchen Brustfilet`. Nach `42-…` stand fest: das Dekompositum-Wörterbuch
löst die Anfrageseite (`hühnerbrust` → `hühner` + `brust`), aber es enthält
**keine Synonyme** — `huhn ≡ hähnchen` steht dort nicht und kann nicht daraus
gewonnen werden.

Die deutsche Synonymquelle ist OpenThesaurus: `[cmd]` 48.427 Synonymgruppen,
201.159 Begriffe, 101.296 einwortig. Lizenz **CC-BY-SA 4.0 oder LGPL**,
wählbar — beides Copyleft. **Vor produktivem Einsatz zu klären**, was das für
ein kommerzielles Produkt bedeutet; die CC-BY-SA verlangt Quellenangabe und
Weitergabe unter gleichen Bedingungen.

## Was der Thesaurus liefert

`[cmd]` Genau die Formen, die in `41-…` ins Leere liefen:

| Begriff | Synonyme im Thesaurus |
|---|---|
| Huhn | Legehenne, Glucke, Hendl, Henne, **Poulet**, Haushuhn |
| Pute | Truthenne, Trute, Truthuhn |
| Blumenkohl | **Karfiol**, Blütenkohl, Käsekohl |
| Aprikose | Barille, **Marille**, Malete |
| Tomate | **Paradeiser**, Liebesapfel, Paradiesapfel |
| Brokkoli | **Broccoli**, Bröckelkohl, Spargelkohl |
| Hackfleisch | Hack, Gehacktes, **Faschiertes** |

Die österreichischen und schweizerdeutschen Formen sind vollständig da.

## Die Falle: ein Thesaurus kennt alle Bedeutungen

`[cmd]` `Kartoffel` → *Mof, Piefke, Fritz, Boche, Deutscher, Teutone*.
`Quark` → *geistiger Dünnschiss, Schmarren, Scheiß, Quatsch*.
`Brust` → *Titte, Busen, Heldenbrust*.

**Ungefiltert eingebaut liefert eine Suche nach „Deutscher" Kartoffeln und
eine nach „Titte" Hähnchenbrust.** Der Thesaurus muss am Bestand gefiltert
werden: nur Gruppen übernehmen, die mindestens ein Wort aus dem
Lebensmittelbestand enthalten — und selbst dann bleibt eine Ausschlussliste
nötig.

## Die Messung

`[cmd]` Alle Wörter aus allen `name_de`, nicht nur die Erstwörter — ein Nutzer
tippt `brustfilet` und `geräuchert` genauso wie `hähnchen`.

| | Wörter | Vorkommen | Anteil |
|---|---|---|---|
| **Gesamt** | 3.656 | 28.564 | 100 % |
| im Thesaurus | 908 | 17.778 | **62,2 %** |
| Zubereitungswörter | 80 | 2.720 | 9,5 % |
| Flexionsformen | 153 | 727 | 2,5 % |
| zusammengesetzt | 934 | 2.910 | 10,2 % |
| **einzeln, echte Lücke** | **1.581** | **4.429** | **15,5 %** |

Vier von fünf Vorkommen sind damit ohne Handarbeit erreichbar.

### Zubereitungswörter — eigene Klasse, nicht Lücke

`[cmd]` Die 80 häufigsten Lückenwörter sind fast alle Zustände:
`gekocht` 492×, `gedünstet` 353×, `geschmort` 228×, `gebacken` 202×,
`abgetropft` 168×, `geräuchert` 68×, `frittiert` 60×, `paniert` 54×.

Das sind keine Lebensmittel. Sie brauchen keine Synonyme — sie sind der
Grund, warum `Hähnchen Brustfilet, roh` hinter den Fertiggerichten landet,
und gehören in die **Rangfolge**, nicht in den Thesaurus.

### Flexion — der Stemmer löst sie

`[cmd]` `tomaten` fehlt im Thesaurus, `Tomate` steht drin. Beide stemmen zu
`tomat`. Ebenso `karotten`, `champignons`, `erbsen`, `nüssen`, `kräutern`.
153 Wörter, kein Eintrag nötig.

### Zusammengesetzt — das Dekompositum löst sie

`[cmd]` `grundsauce` = grund + sauce (171×), `gemüsebrühe` = gemüse + brühe,
`essigmarinade` = essig + marinade, `frischteigwaren` = frisch + teigwaren.
934 Wörter, sobald die Teile bekannt sind.

### Die echte Handarbeitsliste

`[cmd]` 1.581 einwortige Lücken. Die 25 häufigsten:

| | Wort | | | Wort | |
|---|---|---|---|---|---|
| 1 | `milch` | 109× | 14 | `karamell` | 28× |
| 2 | `rührmasse` | 82× | 15 | `zubereitet` | 28× |
| 3 | **`hähnchen`** | **81×** | 16 | `schokoliert` | 26× |
| 4 | `vitaminen` | 54× | 17 | `vegan` | 26× |
| 5 | `schweinefleisch` | 47× | 18 | `gesäuert` | 25× |
| 6 | `eifrei` | 46× | 19 | `vorderhaxe` | 25× |
| 7 | `süßungsmitteln` | 45× | 20 | `blätterteig` | 24× |
| 8 | `alaska` | 44× | 21 | `heilbutt` | 24× |
| 9 | `rohpökelware` | 38× | 22 | `kasseler` | 23× |
| 10 | `schulter` | 36× | 23 | `bechamelsauce` | 22× |
| 11 | `bohnen` | 33× | 24 | `grieß` | 22× |
| 12 | `hammel` | 33× | 25 | `mozzarella` | 21× |
| 13 | `spinat` | 29× | | | |

Vollständig in `daten/wortschatz-luecke.json`, nach Häufigkeit sortiert.
`[read]` So arbeitet Open Food Facts auch: nach Häufigkeit sortieren und von
oben nach unten abarbeiten.

## `hähnchen` — der Fall, an dem sich die Sache erklärt

`[cmd]` Der BLS benutzt `Hähnchen` **105 mal** — häufiger als `Huhn`/`Hühner`
(68) und als `Pute` (81). `Hendl` kommt einmal vor, `Poulet` **null mal**.

`[cmd]` OpenThesaurus kennt `Hähnchen` **nicht**. Es verbindet `Huhn` mit
`Poulet` und `Hendl`, aber die Brücke zum deutschen Standardwort fehlt. Der
Stemmer hilft nicht: `hahnch` ≠ `huhn`.

Tom sagte, das Wort benutze niemand — er ist in der Schweiz, dort heisst es
Poulet, in Österreich Hendl, in Deutschland Hähnchen. **Drei Wörter, drei
Regionen, ein Tier.** Der Nutzer, dessen Sprache von der des Bestands
abweicht, ist hier der Auftraggeber selbst.

Die Gleichung braucht deshalb alle Seiten:
`huhn ≡ hühnchen ≡ hähnchen ≡ poulet ≡ hendl ≡ chicken`

`[annahme]` Diminutive dürften systematisch fehlen — der Thesaurus behandelt
`Hähnchen` und `Hühnchen` als eigene Wortformen, nicht als Synonymgruppe.
Ungemessen, aber prüfbar.

## Was noch offen ist

- **Filterung des Thesaurus am Bestand** — Umfang ungemessen. Wie viele der
  48.427 Gruppen bleiben übrig, und wie viel Unsinn kommt trotzdem durch?
- **Lizenzfrage** CC-BY-SA für ein kommerzielles Produkt.
- **`sort_weight`** — `[cmd]` bei allen 7.140 gefüllt, 0 bis 980, Bedeutung
  weiterhin ungeklärt. Tom vermutet, sie sei für die Kategoriesuche gedacht.
  Zu messen, bevor eine zweite Gewichtung daneben gebaut wird: zwei Systeme,
  die um dieselbe Sortierung konkurrieren, sind schlechter als eines.
- **Zubereitungswörter in der Rangfolge** — die 2.720 Vorkommen sind der
  Hebel gegen „Fertiggericht vor Grundnahrungsmittel", und sie liegen
  bereits fertig klassifiziert vor.
