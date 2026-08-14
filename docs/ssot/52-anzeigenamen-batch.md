# Anzeigenamen-Batch C-39 Phase 2

Stand: 2026-08-14.

`[cmd]` Gearbeitet wurde nur auf JSONL- und Dokumentationsdateien im Repo.
Es gab kein `UPDATE`, kein `INSERT`, keine Migration, keine Schemaänderung,
keinen Commit und keinen Push.

Dateien:

- `supabase/_pipeline/daten/anzeigenamen-eingabe.jsonl`
- `supabase/_pipeline/daten/anzeigenamen-probe-eingabe.jsonl`
- `supabase/_pipeline/daten/anzeigenamen-probe.jsonl`
- `supabase/_pipeline/daten/anzeigenamen.jsonl`
- `supabase/_pipeline/_validierung/anzeigenamen-pruefen.ts`

`[annahme]` Die Anzeigenamen wurden manuell als Datensätze geschrieben. Es
gibt kein Programm, das aus `name_de` per Regel, Regex, Wortliste oder
Textersetzung Anzeigenamen erzeugt. Die verwendeten Befehle dienten nur zum
Lesen, Zählen und Prüfen.

---

## Auftrag und Methode

`[read]` `SPEC_05_FOOD_TAXONOMY.md`, Abschnitt "Canonical Names -
Generierungsstrategie", setzt Phase 2 als KI-Batch für komplexe Gruppen und
Gerichte an.

`[read]` Verbindliche Muster aus der Spec waren unter anderem:
`Hühnerei roh` -> `Ei (roh)`, `Hähnchen Brustfilet, roh` ->
`Hähnchenbrust (roh)`, `Rind Hackfleisch, roh` -> `Rinderhackfleisch (roh)`,
`Vollmilch frisch, 3,5% Fett, past.` -> `Vollmilch (3,5% Fett)`,
`Hafer Flocken` -> `Haferflocken`, `Reis poliert, roh` ->
`Weißer Reis (roh)` und `Schwein Fettwamme ... roh` -> `Schweinebauch (roh)`.

`[read]` `44-bls-codestruktur.md` belegt: der erste Buchstabe des BLS-Codes
ist die Warengruppe; Stellen 5 bis 7 tragen die Zubereitung. `000` ist keine
Rohform, `100` ist roh.

---

## Grundmenge

`[cmd]`

| Menge | Anzahl |
|---|---:|
| `nutrition.foods` gesamt | 7.140 |
| regelbasierte Gruppen `C`, `F`, `G`, `H`, `K` | 1.365 |
| C-39-Phase-2-Eingabe | 5.775 |
| davon Gerichte `X`/`Y` | 2.050 |

`[cmd]` Die vorhandene `anzeigenamen-eingabe.jsonl` hat 5.775 Zeilen, kein
BOM und LF-Zeilenenden.

---

## Probe

`[cmd]` Die Probe-Eingabe hatte 200 Zeilen, kein BOM und LF-Zeilenenden.

`[cmd]` Aufruf der Probe-Prüfung:

```powershell
pnpm exec tsx supabase/_pipeline/_validierung/anzeigenamen-pruefen.ts supabase/_pipeline/daten/anzeigenamen-probe-eingabe.jsonl supabase/_pipeline/daten/anzeigenamen-probe.jsonl
```

`[cmd]` Ergebnis der Probe:

| Prüfung | Ergebnis |
|---|---:|
| Eingabezeilen | 200 |
| Ausgabezeilen | 200 |
| fehlende Codes | 0 |
| doppelte Codes | 0 |
| verbotene Platzhalter `(allgemein)`, `(Standard)`, `(normal)` | 0 |
| umschriebene Umlaute in deutschen Anzeigenamen | 0 |
| Top-10-Doppelungen | keine |

`[cmd]` Die Probe hatte 188 von 200 Zeilen mit `sicher:true`.

---

## Vollauf: Aktueller Teilstand

`[cmd]` `supabase/_pipeline/daten/anzeigenamen.jsonl` enthält 2.195 Zeilen.
Geschrieben sind:

- `B1` bis `B8` - 186 Zeilen
- `M0` bis `M8` - 279 Zeilen
- `U01` bis `U9` - 685 Zeilen
- `V0` bis `V9` - 462 Zeilen
- `T0` bis `T9` - 520 Zeilen
- `D0` bis `D1` - 63 Zeilen

`[cmd]` Der letzte geschriebene Code ist `D1A4200`. Der nächste offene Block
ist `D2`.

`[cmd]` Dateiprüfung des Teilstands:

| Prüfung | Ergebnis |
|---|---:|
| geschriebene Zeilen | 2.195 |
| BOM | nein |
| CRLF | nein |
| doppelte Anzeigenamen im geschriebenen Teil | 0 |
| `sicher:false` | 32 |

`[cmd]` Vollstands-Prüfung gegen die volle Eingabe:

| Prüfung | Ergebnis |
|---|---:|
| Eingabezeilen | 5.775 |
| Ausgabezeilen | 2.132 |
| fehlende Codes | 3.643 |
| doppelte Codes | 0 |
| doppelte Anzeigenamen | 0 |

`[cmd]` Die Vollstands-Prüfung wurde direkt nach Abschluss von `T` ausgeführt.
Danach wurden `D0` und `D1` ergänzt und per JSONL-Dateiprüfung gezählt. Der
Fehler "fehlende Codes" ist im Teilstand erwartet. Der Vollauftrag ist noch
nicht abgeschlossen.

`[cmd]` `sicher:true` je geprüfter Warengruppe nach Abschluss von `T`:

| Gruppe | sicher | gesamt | Anteil |
|---|---:|---:|---:|
| B | 186 | 186 | 100,0 % |
| M | 279 | 279 | 100,0 % |
| T | 488 | 520 | 93,8 % |
| U | 685 | 685 | 100,0 % |
| V | 462 | 462 | 100,0 % |

`[cmd]` Unverändert übernommene Namen je geprüfter Warengruppe nach Abschluss
von `T`:

| Gruppe | unverändert | gesamt | Anteil |
|---|---:|---:|---:|
| B | 160 | 186 | 86,0 % |
| M | 8 | 279 | 2,9 % |
| T | 3 | 520 | 0,6 % |
| U | 0 | 685 | 0,0 % |
| V | 1 | 462 | 0,2 % |

`[cmd]` Längenverteilung alt gegen neu nach Abschluss von `T`:

| Wert | `name_de` | `name_display_de` |
|---|---:|---:|
| p50 | 34 | 32 |
| p90 | 59 | 50 |
| max | 123 | 82 |

---

## Schwere Blöcke

`[cmd]` `M3` bis `M8` wurden abgeschlossen. Der Anteil unveränderter
Übernahmen in der gesamten Gruppe `M` liegt bei 2,9 %.

`[annahme]` In `M3` bis `M8` waren Käse-Fettstufen der Hauptpunkt. Die
Fettzahl blieb stehen, `i. Tr.` wurde in der Anzeige weggelassen, wenn der
Prozentwert im Namen dadurch lesbarer blieb. Beispiele:
`Körniger Frischkäse (< 10% Fett)`, `Schnittkäse (30% Fett)`,
`Gouda (48% Fett)`.

`[cmd]` `U01` bis `U9` wurden abgeschlossen. Der Anteil unveränderter
Übernahmen in `U` liegt bei 0,0 %.

`[annahme]` In `U` wurden Fachnotationen zu deutschen Komposita und lesbaren
Teil-/Fettangaben. Laborschnitte wie `(S XI)` wurden weggelassen. Beispiele:
`Rinderbrust (im Ofen gebraten)`, `Kalbsnacken`,
`Schweinebauch (roh)`.

`[cmd]` `V0` bis `V9` wurden abgeschlossen. Der Anteil unveränderter
Übernahmen in `V` liegt bei 0,2 %.

`[annahme]` In `V` waren Haut, Teilstück und Zubereitung die trennenden
Angaben. `V416100` wurde als Spec-Muster `Hähnchenbrust (roh)` geschrieben;
`V4A6100` wurde bewusst als `Hähnchenbrust ohne Haut (roh)` getrennt.

`[cmd]` `T0` bis `T9` wurden abgeschlossen. `T` hat 488 von 520 Zeilen mit
`sicher:true`.

`[annahme]` In `T` waren Mehrfachnamen die Hauptschwierigkeit. Bei
`Alaska-Seelachs` wurde der Handelsname beibehalten, aber nicht zu einem
Lachs-Namen verstärkt. Bei regionalen oder mehrdeutigen Mehrfachnamen wurde
`sicher:false` gesetzt.

`[cmd]` `D0` und `D1` wurden ergänzt. Der nächste offene Block ist `D2`.

`[annahme]` In `D0` und `D1` wurden gut lesbare Namen unverändert gelassen.
Bei Kuchenböden und Obstkuchen blieb die Teigart stehen, wenn mehrere
Geschwister sonst denselben Anzeigenamen bekommen hätten.

---

## Kollisionen

`[cmd]` Im aktuellen Teilstand gibt es keine doppelten Anzeigenamen.

`[cmd]` Es gibt keine doppelten `bls_code` im aktuellen Teilstand.

`[annahme]` Diese Aussage gilt für die bisher geschriebenen 2.195 Zeilen.
Nach Abschluss des Vollbestands muss die Kollisionsliste erneut über alle
5.775 Zeilen erzeugt werden.

---

## Wo ich unsicher bin

`[cmd]` Im aktuellen Teilstand gibt es 32 `sicher:false`-Zeilen.

`[annahme]` Ursachen der Unsicherheit:

| Ursache | Codes |
|---|---|
| regionale Mehrfachnamen für Weißfische | `T406100`, `T406152`, `T406182`, `T406200`, `T406252`, `T406282`, `T406600` |
| `Katfisch/Steinbeißer` als mehrdeutige Handelsgruppe | `T604100`, `T604152`, `T604182`, `T604200`, `T604252`, `T604282`, `T604600` |
| `Schafskopf (Meerbrasse)` als ungebräuchlicher Handelsname | `T617100`, `T617152`, `T617182`, `T617200`, `T617252`, `T617282` |
| `Garnele/Granat/Krabbe` als regionale Sammelgruppe | `T753100`, `T753132`, `T753172`, `T753182`, `T753200`, `T753232`, `T753252`, `T753272`, `T753282`, `T753800`, `T936100`, `T936182` |

---

## Was dieser Durchgang nicht kann

`[cmd]` Dieser Bericht belegt den aktuellen Teilstand mit 2.195 von 5.775
Zeilen. Der Vollauf ist nicht fertig.

`[annahme]` Die Datei ist im Arbeitsstand nach Bearbeitungsreihenfolge
geschrieben (`B`, `M`, `U`, `V`, `T`, `D...`) und noch nicht final nach
Eingabereihenfolge sortiert. Das Sortieren gehört erst zum Abschluss des
Vollaufs.

`[annahme]` Offene Gruppen sind `D2` bis `D9`, `W`, `S`, `N`, `P`, `E`, `R`,
`Q`, `X` und `Y`. Bei `X`/`Y` ist unverändertes Durchreichen häufiger
erwartet als bei Zutaten, aber es wurde noch nicht bearbeitet.
