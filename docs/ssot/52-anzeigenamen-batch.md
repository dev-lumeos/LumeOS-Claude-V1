# Anzeigenamen-Batch C-39 Phase 2

Stand: 2026-08-14.

`[cmd]` Ergebnisdatei: `supabase/_pipeline/daten/anzeigenamen.jsonl`.
Der Vollauf enthält 5.775 Ausgabezeilen zu 5.775 Eingabezeilen.

`[cmd]` Geändert wurden Datendatei, Prüfer und dieser Bericht. Es gab kein
`UPDATE`, kein `INSERT`, keine Migration, keinen Commit und keinen Push.

Dateien:

- `supabase/_pipeline/daten/anzeigenamen-eingabe.jsonl`
- `supabase/_pipeline/daten/anzeigenamen-probe.jsonl`
- `supabase/_pipeline/daten/anzeigenamen.jsonl`
- `supabase/_pipeline/_validierung/anzeigenamen-pruefen.ts`
- `docs/ssot/52-anzeigenamen-batch.md`

`[annahme]` Die Anzeigenamen der Zutaten wurden als Datensätze geschrieben,
nicht durch ein Regelprogramm erzeugt. Befehle dienten zum Lesen, Anhängen,
Sortieren, Zählen und Prüfen. Für `X`/`Y` wurde die gelesene Regel
angewendet, dass unverändertes Durchreichen bei Gerichten der Normalfall ist.

---

## Auftrag und Methode

`[read]` `SPEC_05_FOOD_TAXONOMY.md` gibt die Zielrichtung vor: kurze,
gebräuchliche Anzeigenamen, Zubereitung in Klammern nur bei Unterscheidung,
keine erfundenen Sorten.

`[read]` Verbindliche Muster aus der Spec waren unter anderem:
`Hühnerei roh` -> `Ei (roh)`, `Hähnchen Brustfilet, roh` ->
`Hähnchenbrust (roh)`, `Rind Hackfleisch, roh` -> `Rinderhackfleisch (roh)`,
`Vollmilch frisch, 3,5% Fett, past.` -> `Vollmilch (3,5% Fett)`,
`Hafer Flocken` -> `Haferflocken`, `Reis poliert, roh` ->
`Weißer Reis (roh)` und `Schwein Fettwamme ... roh` -> `Schweinebauch (roh)`.

`[read]` `44-bls-codestruktur.md` belegt: der erste Buchstabe des BLS-Codes
ist die Warengruppe; Stellen 5 bis 7 tragen die Zubereitung.

`[read]` Für Gerichte `X`/`Y` dürfen Namen länger bleiben. Dort ist
unverändertes Durchreichen der Normalfall, weil die Bestandteile im Namen
erhalten bleiben sollen.

---

## Grundmenge

`[cmd]`

| Menge | Anzahl |
|---|---:|
| `nutrition.foods` gesamt | 7.140 |
| regelbasierte Gruppen `C`, `F`, `G`, `H`, `K` | 1.365 |
| C-39-Phase-2-Eingabe | 5.775 |
| davon Gerichte `X`/`Y` | 2.050 |

`[cmd]` `anzeigenamen.jsonl` hat 5.775 Zeilen, kein BOM und LF-Zeilenenden.

---

## Prüfer

`[cmd]` `anzeigenamen-pruefen.ts` prüft jetzt zusätzlich:

- `nebennamen` ist in jeder Ausgabezeile vorhanden und ein Array.
- Kein `nebennamen`-Eintrag ist leer oder enthält Klammern oder Kommas.
- Zeilen mit nicht-leeren `nebennamen` werden je Warengruppe gezählt.
- Die 20 längsten `nebennamen`-Listen werden mit amtlichem Namen ausgegeben.
- Kollisionen werden über den Gesamtbestand geprüft.

`[cmd]` Vollprüfung:

```powershell
pnpm exec tsx supabase/_pipeline/_validierung/anzeigenamen-pruefen.ts supabase/_pipeline/daten/anzeigenamen-eingabe.jsonl supabase/_pipeline/daten/anzeigenamen.jsonl
```

`[cmd]` Ergebnis:

| Prüfung | Ergebnis |
|---|---:|
| Eingabezeilen | 5.775 |
| Ausgabezeilen | 5.775 |
| fehlende Codes | 0 |
| doppelte Codes | 0 |
| doppelte Anzeigenamen | 0 |
| `nebennamen` formal fehlerhaft | 0 |

---

## Kennzahlen

`[cmd]` Sicher, unverändert und `nebennamen` je Warengruppe:

| Gruppe | Zeilen | `sicher:true` | unverändert | `nebennamen` nicht leer |
|---|---:|---:|---:|---:|
| B | 186 | 186 (100,0 %) | 155 (83,3 %) | 6 (3,2 %) |
| D | 466 | 466 (100,0 %) | 203 (43,6 %) | 70 (15,0 %) |
| E | 104 | 104 (100,0 %) | 0 (0,0 %) | 48 (46,2 %) |
| M | 279 | 279 (100,0 %) | 8 (2,9 %) | 27 (9,7 %) |
| N | 114 | 114 (100,0 %) | 22 (19,3 %) | 9 (7,9 %) |
| P | 119 | 119 (100,0 %) | 41 (34,5 %) | 17 (14,3 %) |
| Q | 65 | 65 (100,0 %) | 11 (16,9 %) | 13 (20,0 %) |
| R | 97 | 97 (100,0 %) | 17 (17,5 %) | 28 (28,9 %) |
| S | 253 | 253 (100,0 %) | 67 (26,5 %) | 38 (15,0 %) |
| T | 520 | 488 (93,8 %) | 3 (0,6 %) | 151 (29,0 %) |
| U | 685 | 685 (100,0 %) | 0 (0,0 %) | 119 (17,4 %) |
| V | 462 | 462 (100,0 %) | 1 (0,2 %) | 0 (0,0 %) |
| W | 375 | 374 (99,7 %) | 107 (28,5 %) | 50 (13,3 %) |
| X | 1.165 | 1.165 (100,0 %) | 1.165 (100,0 %) | 0 (0,0 %) |
| Y | 885 | 885 (100,0 %) | 885 (100,0 %) | 0 (0,0 %) |

`[cmd]` Längenverteilung `name_de` -> `name_display_de`:

| Gruppe | p50 | p90 | max |
|---|---:|---:|---:|
| B | 28 -> 28 | 41 -> 41 | 66 -> 59 |
| D | 29 -> 27 | 51 -> 42 | 83 -> 70 |
| E | 30 -> 28 | 60 -> 42 | 82 -> 59 |
| M | 43 -> 28 | 73 -> 50 | 123 -> 82 |
| N | 32 -> 24 | 52 -> 43 | 108 -> 77 |
| P | 18 -> 12 | 40 -> 24 | 74 -> 40 |
| Q | 18 -> 13 | 58 -> 42 | 84 -> 50 |
| R | 31 -> 23 | 49 -> 43 | 80 -> 53 |
| S | 33 -> 29 | 55 -> 48 | 81 -> 63 |
| T | 32 -> 28 | 54 -> 46 | 84 -> 77 |
| U | 41 -> 36 | 60 -> 53 | 93 -> 74 |
| V | 38 -> 33 | 57 -> 50 | 74 -> 63 |
| W | 27 -> 22 | 49 -> 38 | 90 -> 66 |
| X | 38 -> 38 | 64 -> 64 | 98 -> 98 |
| Y | 33 -> 33 | 62 -> 62 | 101 -> 101 |

---

## Schwere Blöcke

`[cmd]` `M` wurde mit 279 Zeilen abgeschlossen; unverändert sind 8 von 279
Zeilen.

`[annahme]` In `M3` bis `M8` waren Käse-Fettstufen der Hauptpunkt. Die
Fettzahl blieb stehen, `i. Tr.` wurde in der Anzeige weggelassen, wenn der
Prozentwert eindeutig blieb.

`[cmd]` `U` wurde mit 685 Zeilen abgeschlossen; unverändert sind 0 von 685
Zeilen.

`[annahme]` In `U` wurden Fachnotationen zu deutschen Komposita und lesbaren
Teil-/Fettangaben. Laborschnitte wie `(S XI)` wurden weggelassen.

`[cmd]` `V` wurde mit 462 Zeilen abgeschlossen; unverändert ist 1 von 462
Zeilen.

`[annahme]` In `V` waren Haut, Teilstück und Zubereitung die trennenden
Angaben. `V416100` bleibt `Hähnchenbrust (roh)`, während `V4A6100`
`Hähnchenbrust ohne Haut (roh)` heißt.

`[cmd]` `T` wurde mit 520 Zeilen abgeschlossen; 32 Zeilen sind
`sicher:false`.

`[annahme]` In `T` waren Mehrfachnamen die Hauptschwierigkeit. Bei
`Alaska-Seelachs` wurde der Handelsname beibehalten, aber nicht zu einem
Lachs-Namen verstärkt.

`[cmd]` `D` wurde mit 466 Zeilen abgeschlossen; unverändert sind 203 von 466
Zeilen.

`[annahme]` `D3` bis `D7B` waren schwerer als `D0`/`D1`, weil Teig- und
Masseangaben häufig trennen. Deshalb blieben Angaben wie `(Mürbeteig)`,
`(Rührmasse)`, `(Brandmasse)` oder `(Plunderteig)` oft im Anzeigenamen.

`[cmd]` `R` wurde mit 97 Zeilen abgeschlossen; 28 Zeilen haben nicht-leere
`nebennamen`.

`[annahme]` In `R` fiel besonders viel Aliaswissen an: `Sojasauce/Sojasoße`,
`Zitronat/Sukkade`, `Ganache/Canache`, `Aprikosenglasur/Aprikotur`.

`[cmd]` `X` und `Y` wurden mit 2.050 Zeilen abgeschlossen; 2.050 von 2.050
Namen sind unverändert übernommen.

`[annahme]` Das ist bei Gerichten gewollt: die Bestandteile sind der
Anzeigename. Eine Kürzung hätte dort eher Information entfernt.

---

## Kollisionen

`[cmd]` Es gibt keine doppelten Anzeigenamen über den Gesamtbestand von 5.775
Zeilen.

`[cmd]` Es gibt keine doppelten `bls_code`.

`[annahme]` Die Kollisionsliste ist damit leer. Es gibt aktuell keine
Arbeitsliste für manuelle Kollisionskorrekturen.

---

## Nebennamen

`[cmd]` 576 von 5.775 Zeilen haben nicht-leere `nebennamen`.

`[cmd]` Die 20 längsten `nebennamen`-Listen enthalten maximal drei Einträge.
Beispiele:

| Code | Anzeigename | Nebennamen |
|---|---|---|
| `T406100` | Felchen (roh) | Maräne · Renke · Schnäpel |
| `T406152` | Felchen (gedünstet) | Maräne · Renke · Schnäpel |
| `B821000` | Paniermehl | Semmelbrösel · Semmelmehl |
| `D7A6000` | Berliner ungefüllt (frittiert) | Pfannkuchen · Krapfen |
| `M172900` | Crème fraîche (40% Fett) | Sauerrahm · Creme fraiche |
| `N601000` | Rooibos-Tee | Roibusch-Tee · Rotbusch-Tee |
| `R111000` | Speisesalz | Siedesalz · Tafelsalz |
| `R172000` | Glutamat | Mononatriumglutamat · Natriumglutamat |

`[annahme]` Nicht aufgenommen wurden Schrägstriche, wenn sie verschiedene
Dinge statt echte Nebenbezeichnungen trennten. Beispiele: gemischte
Fleischarten, verschiedene Likörarten, `Knoblauchbutter/Kräuterbutter`.

`[annahme]` In `X`/`Y` wurden keine Nebennamen ergänzt. Dort bleiben die
amtlichen Gerichtnamen unverändert, sodass Schrägstrichbestandteile nicht
verworfen wurden.

---

## Wo ich unsicher bin

`[cmd]` Es gibt 33 `sicher:false`-Zeilen.

`[cmd]` Warengruppenverteilung: `T` 32, `W` 1.

`[annahme]` Ursachen:

| Ursache | Codes |
|---|---|
| regionale Mehrfachnamen für Weißfische | `T406100`, `T406152`, `T406182`, `T406200`, `T406252`, `T406282`, `T406600` |
| `Katfisch/Steinbeißer` als mehrdeutige Handelsgruppe | `T604100`, `T604152`, `T604182`, `T604200`, `T604252`, `T604282`, `T604600` |
| `Schafskopf (Meerbrasse)` als ungebräuchlicher Handelsname | `T617100`, `T617152`, `T617182`, `T617200`, `T617252`, `T617282` |
| `Garnele/Granat/Krabbe` als regionale Sammelgruppe | `T753100`, `T753132`, `T753172`, `T753182`, `T753200`, `T753232`, `T753252`, `T753272`, `T753282`, `T753800`, `T936100`, `T936182` |
| `Kabanossi/Peperoni` wegen möglicher Verwechslung mit Gemüse/Chili | `W193000` |

---

## Wie 704 Umlaute verloren gingen

`[cmd]` Vor der Reparatur enthielt `anzeigenamen.jsonl` 704 Zeilen mit
mindestens einem echten `?` in `name_display_de`, `name_display_en` oder
`nebennamen`. Die Datei war dabei gültiges UTF-8 ohne BOM und ohne CRLF; das
`?` war kein Konsolenartefakt.

`[cmd]` Der erweiterte Prüfer wurde vor der Reparatur gegen die beschädigte
Datei ausgeführt und schlug mit 704 Korruptionsmeldungen fehl. Beispiel:
`Zeile 169, B881100: enthaelt ungueltige Zeichen in name_display_de (?)`.

`[cmd]` Nach der Reparatur meldet der Byte-/JSONL-Check 0 Zeilen mit `?`,
`\uFFFD` oder `\u0000`. Die Vollprüfung läuft wieder mit 5.775 Eingaben,
5.775 Ausgaben, 0 fehlenden Codes, 0 doppelten Codes und 0 doppelten
Anzeigenamen durch.

`[annahme]` Die wahrscheinlichste Ursache ist der Schreibweg des letzten
Durchgangs: Nicht-ASCII-Zeichen standen in PowerShell-Here-Strings, wurden
dort beim Übergang an Node als `?` übergeben und anschließend von Node als
gültiges UTF-8-`?` in die JSONL-Datei geschrieben. Das erklärt, warum die
Datei formal UTF-8 blieb und warum vor allem die zuletzt per Shell-Here-String
geschriebenen Gruppen `D`, `W`, `S`, `N`, `P`, `E`, `R` und `Q` betroffen
waren.

`[annahme]` Die alte Prüfung war auf den Fehler des ersten Anlaufs ausgelegt:
umschriebene Umlaute wie `Eiweiss`, `Koerniger Frischkaese`, `Olivenoel`.
Sie erkannte nicht, dass aus `Eiweiß` ein echtes `Eiwei?` geworden war.

`[cmd]` Der Prüfer kontrolliert jetzt zusätzlich zeilenweise:

- kein `?` in `name_display_de`, `name_display_en` oder `nebennamen`
- kein Ersetzungszeichen `\uFFFD`
- kein NUL-Zeichen `\u0000`
- Fehlerausgabe mit Zeilennummer und `bls_code`

`[annahme]` Die Reparatur wurde auf die vom Prüfer betroffenen Zeilen
beschränkt. Die Korrekturen wurden aus den beschädigten Feldern und dem
amtlichen Namen derselben Zeile nachvollzogen; nicht betroffene Zeilen sollten
inhaltlich unberührt bleiben.

---

## X-Stichprobe

`[cmd]` Die 20 längsten `X`-Einträge wurden geprüft. Alle 20 waren im Vollauf
unverändert übernommen.

`[cmd]` Beispiele aus der Stichprobe:

| Code | Länge | Name |
|---|---:|---|
| `X703012` | 98 | Eier-Frischteigwaren Ravioli, mit Hackfleischfüllung, in Tomatensauce von heller/weißer Grundsauce |
| `X5B1030` | 96 | Gemüse-Kartoffel-Fleisch-Brei, mit Karotte und Schweinefleisch (ohne Salz, geeignet für Beikost) |
| `X730033` | 95 | Lasagne al forno, Teigwaren geschichtet mit Bechamel- und Bologneser Sauce, mit Käse überbacken |
| `X761033` | 95 | Eier-Frischteigwaren Ravioli, vegetarisch gefüllt, mit gekochtem Gemüse in Grundsauce hell/weiß |
| `X914233` | 91 | Pizza quattro stagioni (mit Tomatensauce, Artischocken, Champignons, Paprika, Kochschinken) |
| `X6A1000` | 85 | Kartoffeln gekocht, mit gebratenem Hähnchenfleisch und Kräutersauce von Bechamelsauce |

`[annahme]` Bei diesen 20 war die Regel "Durchreichen ist der Normalfall" zu
weit ausgelegt. Mehrere Einträge könnten ohne Informationsverlust kürzer
werden, zum Beispiel `Lasagne al forno mit Bolognese und Bechamel`,
`Ravioli mit Hackfleischfüllung in Tomatensauce` oder
`Pizza quattro stagioni`. Die Bestandteile müssen erhalten bleiben, aber die
amtliche Satzstruktur muss nicht erhalten bleiben.

`[annahme]` Ein eigener `X`/`Y`-Durchgang ist sinnvoll. Dieser Reparaturlauf
ändert `X`/`Y` bewusst nicht, weil der Auftrag nur die Frage klären sollte.

---

## Was dieser Durchgang nicht kann

`[cmd]` Die Datei ist vollständig und in Eingabereihenfolge sortiert:
erster Code `B101000`, letzter Code `Y9A2050`.

`[annahme]` Die Daten sind eine Arbeitsdatei für Tom. Sie sind nicht in die
Datenbank eingespielt und nicht mit `food_aliases`, `food_search`,
`search_synonyms` oder `preparation_kinds` verbunden.

`[annahme]` `X`/`Y` verbessern die Suche nur begrenzt, weil die Namen
bewusst unverändert blieben. Der Suchgewinn liegt vor allem in den
Zutatengruppen `M`, `U`, `V`, `T`, `D`, `W`, `S`, `N`, `P`, `E`, `R` und
`Q`.

`[annahme]` Die `nebennamen` sind kuratiert, aber keine vollständige
Synonymliste. Sie enthalten nur die Nebenformen, die beim Schreiben der
Anzeigenamen sichtbar wurden.
