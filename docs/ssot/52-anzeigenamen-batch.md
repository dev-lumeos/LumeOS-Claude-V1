# Anzeigenamen-Batch C-39 Phase 2

Stand: 2026-08-15.

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

`[annahme]` Die Anzeigenamen wurden als kuratierte Datensätze geschrieben.
Befehle dienten zum Lesen, Zählen, Prüfen und zum verlustarmen Schreiben der
JSONL-Zeilen.

---

## Auftrag und Methode

`[read]` `SPEC_05_FOOD_TAXONOMY.md` gibt die Zielrichtung vor: kurze,
gebräuchliche Anzeigenamen, Zubereitung in Klammern nur bei Unterscheidung,
keine erfundenen Sorten.

`[read]` `44-bls-codestruktur.md` belegt: der erste Buchstabe des BLS-Codes
ist die Warengruppe; Stellen 5 bis 7 tragen die Zubereitung.

`[read]` Für Gerichte `X`/`Y` müssen die Bestandteile erhalten bleiben. Die
amtliche Satzstruktur muss aber nicht erhalten bleiben, wenn ein Eigenname
oder eine knappere Wortstellung denselben Inhalt trägt.

---

## Grundmenge

`[cmd]`

| Menge | Anzahl |
|---|---:|
| `nutrition.foods` gesamt | 7.140 |
| regelbasierte Gruppen `C`, `F`, `G`, `H`, `K` | 1.365 |
| C-39-Phase-2-Eingabe | 5.775 |
| davon Gerichte `X`/`Y` | 2.050 |

`[cmd]` `anzeigenamen.jsonl` hat 5.775 Zeilen.

---

## Prüfer

`[cmd]` `anzeigenamen-pruefen.ts` prüft:

- genau eine Ausgabezeile je Eingabezeile
- gültiges JSON und alle Pflichtfelder
- keine verbotenen Platzhalter wie `(allgemein)`
- kein `?`, kein `\uFFFD`, kein `\u0000`
- `nebennamen` ist in jeder Ausgabezeile vorhanden und ein Array
- kein `nebennamen`-Eintrag ist leer oder enthält Klammern oder Kommas
- Kollisionen über den Gesamtbestand
- Kennzahlen je Warengruppe
- Abweichungen zur 200er-Probe

`[cmd]` Vollprüfung:

```powershell
pnpm exec tsx supabase/_pipeline/_validierung/anzeigenamen-pruefen.ts supabase/_pipeline/daten/anzeigenamen-eingabe.jsonl supabase/_pipeline/daten/anzeigenamen.jsonl supabase/_pipeline/daten/anzeigenamen-probe.jsonl
```

`[cmd]` Ergebnis:

| Prüfung | Ergebnis |
|---|---:|
| Eingabezeilen | 5.775 |
| Ausgabezeilen | 5.775 |
| fehlende Codes | 0 |
| doppelte Codes | 0 |
| doppelte Anzeigenamen | 0 |
| Korruptionszeichen `?`/`\uFFFD`/`\u0000` | 0 |

---

## Kennzahlen

`[cmd]` Sicher, unverändert und `nebennamen` je Warengruppe:

| Gruppe | Zeilen | `sicher:true` | unverändert | `nebennamen` nicht leer |
|---|---:|---:|---:|---:|
| B | 186 | 186 (100,0 %) | 155 (83,3 %) | 6 (3,2 %) |
| D | 466 | 466 (100,0 %) | 137 (29,4 %) | 70 (15,0 %) |
| E | 104 | 104 (100,0 %) | 2 (1,9 %) | 48 (46,2 %) |
| M | 279 | 279 (100,0 %) | 8 (2,9 %) | 27 (9,7 %) |
| N | 114 | 114 (100,0 %) | 28 (24,6 %) | 9 (7,9 %) |
| P | 119 | 119 (100,0 %) | 55 (46,2 %) | 17 (14,3 %) |
| Q | 65 | 65 (100,0 %) | 33 (50,8 %) | 13 (20,0 %) |
| R | 97 | 97 (100,0 %) | 23 (23,7 %) | 28 (28,9 %) |
| S | 253 | 253 (100,0 %) | 90 (35,6 %) | 38 (15,0 %) |
| T | 520 | 488 (93,8 %) | 3 (0,6 %) | 151 (29,0 %) |
| U | 685 | 685 (100,0 %) | 0 (0,0 %) | 119 (17,4 %) |
| V | 462 | 462 (100,0 %) | 1 (0,2 %) | 0 (0,0 %) |
| W | 375 | 374 (99,7 %) | 164 (43,7 %) | 50 (13,3 %) |
| X | 1.165 | 1.165 (100,0 %) | 697 (59,8 %) | 9 (0,8 %) |
| Y | 885 | 885 (100,0 %) | 527 (59,5 %) | 14 (1,6 %) |

`[cmd]` Längenverteilung gesamt `name_de` -> `name_display_de`:
p50 34 -> 30, p90 59 -> 51, max 123 -> 95.

`[cmd]` Für die nachgezogenen Gruppen: `D` Median 29 -> 22, `X` 38 -> 36,
`Y` 33 -> 32.

---

## Gerichte

`[cmd]` `X` und `Y` wurden nachgezogen: 826 von 2.050 Gerichten wurden
geändert, 1.224 blieben unverändert.

`[cmd]` Aufteilung:

| Gruppe | Zeilen | gekürzt/geändert | zu Recht unverändert | Median-Länge |
|---|---:|---:|---:|---:|
| X | 1.165 | 468 | 697 (59,8 %) | 38 -> 36 |
| Y | 885 | 358 | 527 (59,5 %) | 33 -> 32 |

`[annahme]` Gekürzt wurde vor allem amtliche Satzstruktur:
`Teigwaren geschichtet mit ...`, `zubereitet aus ...`, Grundsaucen-Formeln
und erklärende Eigenname-Klammern. Beispiele:

| amtlich | Anzeige |
|---|---|
| Lasagne al forno, Teigwaren geschichtet mit Bechamel- und Bologneser Sauce, mit Käse überbacken | Lasagne al forno mit Bolognese und Bechamel |
| Pizza quattro stagioni (mit Tomatensauce, Artischocken, Champignons, Paprika, Kochschinken) | Pizza quattro stagioni |
| Toast mit Ananas, Kochschinken und Käse ("Toast Hawaii") gebacken | Toast Hawaii (gebacken) |
| Vanillepudding, Flammeri, zubereitet aus Pulver und Milch 3,5 % Fett, mit Früchten und Süßstoff | Vanillepudding aus Pulver mit Milch 3,5 % Fett mit Früchten und Süßstoff |

`[annahme]` Unverändert blieben Gerichte, bei denen der amtliche Name bereits
eine brauchbare Zutatenliste ist, zum Beispiel belegte Brötchen, viele Salate,
Suppen, Eintöpfe und einfache Kombinationen wie `Clubsandwich mit Thunfisch,
Gurke, Emmentaler und Mayonnaise`.

`[annahme]` Grenzfälle waren Eigenname plus Zutatenliste. Bei starken
Eigennamen wie `Pizza quattro stagioni`, `Toast Hawaii`, `Moussaka` oder
`Bami Goreng` wurde die Erklärung gekürzt. Bei generischen Namen wie Breien,
Salaten oder gefülltem Gemüse blieben die unterscheidenden Zutaten im Namen.

---

## D-Nachprüfung

`[cmd]` Vor dem Nachziehen standen in `D` 293 von 466 Zeilen unverändert; 186
unveränderte Namen trugen eine Klammer.

`[cmd]` Nach der Nachprüfung sind in `D` 137 von 466 Zeilen unverändert.
Damit wurden 156 D-Zeilen geändert.

`[annahme]` Entfernt wurden Klammer-Teigarten nur dort, wo sie keinen
gleichnamigen Geschwistereintrag trennen. Beispiele: `Sachertorte
(Rührmasse)` -> `Sachertorte`, `Quicheboden (Mürbeteig)` -> `Quicheboden`.

`[annahme]` Erhalten blieben Teigarten, wenn sie Varianten trennen, zum
Beispiel bei `Apfelkuchen`, `Apfel-Streuselkuchen`, `Käsekuchen`,
`Nusskuchen` oder `Buttercremetorte`.

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

`[cmd]` `R` wurde mit 97 Zeilen abgeschlossen; 28 Zeilen haben nicht-leere
`nebennamen`.

`[annahme]` In `R` fiel besonders viel Aliaswissen an: `Sojasauce/Sojasoße`,
`Zitronat/Sukkade`, `Ganache/Canache`, `Aprikosenglasur/Aprikotur`.

---

## Kollisionen

`[cmd]` Es gibt keine doppelten Anzeigenamen über den Gesamtbestand von 5.775
Zeilen.

`[cmd]` Es gibt keine doppelten `bls_code`.

`[annahme]` Die Kollisionsliste ist damit leer. Es gibt aktuell keine
Arbeitsliste für manuelle Kollisionskorrekturen.

---

## Nebennamen

`[cmd]` Nach dem X/Y-Durchgang haben 590 von 5.775 Zeilen nicht-leere
`nebennamen`.

`[cmd]` Neu kamen in `X` 9 und in `Y` 14 Zeilen mit `nebennamen` hinzu.
Das betrifft nur echte Nebenbezeichnungen wie `Eierkuchen`,
`Vollkorneierkuchen`, `Lahmacun`, `Vanilleflammeri`, `Sahneflammeri` oder
`Zwetschgenkompott`.

`[annahme]` Nicht aufgenommen wurden Schrägstriche, wenn sie verschiedene
Dinge statt echte Nebenbezeichnungen trennten, etwa gemischte Fleischarten
oder unterschiedliche Saucenarten.

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
Datei ausgeführt und schlug mit 704 Korruptionsmeldungen fehl.

`[cmd]` Nach der Reparatur und nach dem X/Y-Durchgang meldet die Vollprüfung
0 Zeilen mit `?`, `\uFFFD` oder `\u0000`.

`[annahme]` Die wahrscheinlichste Ursache war ein PowerShell-Schreibweg mit
Nicht-ASCII-Zeichen in Here-Strings. Dadurch wurden Umlaute beim Übergang an
Node zu echten `?`, die anschließend als gültiges UTF-8 in die JSONL-Datei
geschrieben wurden.

---

## Was dieser Durchgang nicht kann

`[cmd]` Die Datei ist vollständig: erster Code `B101000`, letzter Code
`Y9A2050`.

`[annahme]` Die Daten sind eine Arbeitsdatei. Das Einspielen in die Datenbank
ist C-41; Editierbarkeit über Admin/Override-Tabelle bleibt C-29/C-31.

`[annahme]` Die `nebennamen` sind kuratiert, aber keine vollständige
Synonymliste. Sie enthalten nur Nebenformen, die beim Schreiben der
Anzeigenamen sichtbar wurden.
