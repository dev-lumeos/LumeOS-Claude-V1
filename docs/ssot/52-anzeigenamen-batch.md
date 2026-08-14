# Anzeigenamen-Batch C-39 Phase 2: manuelle Probe

`[cmd]` Erhoben 2026-08-14 gegen die laufende lokale Instanz
(`supabase_db_LumeOS-Claude-V1`, Datenbank `postgres`). Es gab kein
`UPDATE`, kein `INSERT`, keine Migration und keine Änderung an
`nutrition.foods`.

Dateien:
- `supabase/_pipeline/daten/anzeigenamen-eingabe.jsonl`
- `supabase/_pipeline/daten/anzeigenamen-probe-eingabe.jsonl`
- `supabase/_pipeline/daten/anzeigenamen-probe.jsonl`
- `supabase/_pipeline/_validierung/anzeigenamen-pruefen.ts`

`[cmd]` Das verworfene Generierungsskript
`supabase/_pipeline/_ableitung/anzeigenamen-probe-generieren.ts`
existiert nicht mehr. `supabase/_pipeline/daten/anzeigenamen.jsonl`
existiert ebenfalls nicht; der Vollauf wurde nicht gestartet.

---

## Fragestellung

`[read]` `SPEC_05_FOOD_TAXONOMY.md`, Abschnitt "Canonical Names -
Generierungsstrategie", setzt Phase 2 als KI-Batch fuer komplexe Gruppen
und Gerichte an.

`[read]` Die verbindlichen Muster sind die Leitplanken:
`Hühnerei roh` -> `Ei (roh)`, `Hühnerei Eiklar, roh` ->
`Eiweiß (roh)`, `Hähnchen Brustfilet, roh` ->
`Hähnchenbrust (roh)`, `Rind Hackfleisch, roh` ->
`Rinderhackfleisch (roh)`, `Vollmilch frisch, 3,5 % Fett,
pasteurisiert` -> `Vollmilch (3,5% Fett)`, `Reis poliert, roh` ->
`Weißer Reis (roh)`, `Schwein Fettwamme ... roh` ->
`Schweinebauch (roh)`.

`[read]` `44-bls-codestruktur.md` belegt: der erste Buchstabe des
BLS-Codes ist die Warengruppe; Stellen 5 bis 7 tragen die Zubereitung.
`000` ist keine Rohform, `100` ist roh.

---

## Grundmenge

`[cmd]`

| Menge | Anzahl |
|---|---:|
| `nutrition.foods` gesamt | 7.140 |
| regelbasierte Gruppen `C`, `F`, `G`, `H`, `K` | 1.365 |
| C-39-Phase-2-Eingabe | 5.775 |
| davon Gerichte `X`/`Y` | 2.050 |

`[cmd]` Die vorhandene `anzeigenamen-eingabe.jsonl` hat 5.775 Zeilen,
kein BOM und LF-Zeilenenden.

---

## Methode

`[cmd]` Die Probe-Eingabe hat 200 Zeilen, kein BOM und LF-Zeilenenden.
Die Zusammensetzung aus dem ersten Schritt blieb erhalten: MealCam-Codes
aus den Phase-2-Gruppen, 50 Gerichte und der Rest über die übrigen
Warengruppen verteilt.

`[annahme]` Die Anzeigenamen in
`supabase/_pipeline/daten/anzeigenamen-probe.jsonl` wurden einzeln
geschrieben. Es gibt kein Programm, das aus `name_de` per Regel, Regex,
Wortliste oder Textersetzung Anzeigenamen erzeugt.

`[cmd]` Die Ausgabe hat 200 Zeilen, kein BOM und LF-Zeilenenden.

---

## Pruefung

`[cmd]` Aufruf:
`pnpm exec tsx supabase/_pipeline/_validierung/anzeigenamen-pruefen.ts supabase/_pipeline/daten/anzeigenamen-probe-eingabe.jsonl supabase/_pipeline/daten/anzeigenamen-probe.jsonl`

`[cmd]` Ergebnis:

| Pruefung | Ergebnis |
|---|---:|
| Eingabezeilen | 200 |
| Ausgabezeilen | 200 |
| fehlende Codes | 0 |
| doppelte Codes | 0 |
| verbotene Platzhalter `(allgemein)`, `(Standard)`, `(normal)` | 0 |
| umschriebene Umlaute in deutschen Anzeigenamen | 0 |
| Top-10-Doppelungen | keine |

`[cmd]` `sicher:true` je Warengruppe:

| Gruppe | sicher | gesamt | Anteil |
|---|---:|---:|---:|
| B | 12 | 12 | 100,0 % |
| D | 10 | 11 | 90,9 % |
| E | 13 | 13 | 100,0 % |
| M | 16 | 16 | 100,0 % |
| N | 9 | 10 | 90,0 % |
| P | 10 | 10 | 100,0 % |
| Q | 11 | 11 | 100,0 % |
| R | 8 | 10 | 80,0 % |
| S | 10 | 10 | 100,0 % |
| T | 10 | 13 | 76,9 % |
| U | 11 | 12 | 91,7 % |
| V | 12 | 12 | 100,0 % |
| W | 6 | 10 | 60,0 % |
| X | 50 | 50 | 100,0 % |

`[cmd]` Unveraendert uebernommene deutsche Namen je Warengruppe:

| Gruppe | unveraendert | gesamt | Anteil |
|---|---:|---:|---:|
| B | 12 | 12 | 100,0 % |
| D | 3 | 11 | 27,3 % |
| E | 0 | 13 | 0,0 % |
| M | 0 | 16 | 0,0 % |
| N | 2 | 10 | 20,0 % |
| P | 5 | 10 | 50,0 % |
| Q | 8 | 11 | 72,7 % |
| R | 7 | 10 | 70,0 % |
| S | 4 | 10 | 40,0 % |
| T | 0 | 13 | 0,0 % |
| U | 0 | 12 | 0,0 % |
| V | 0 | 12 | 0,0 % |
| W | 5 | 10 | 50,0 % |
| X | 22 | 50 | 44,0 % |

---

## Was dieser Durchgang nicht kann

`[cmd]` Dieser Durchgang umfasst nur 200 Zeilen. Er beweist nicht, dass
der Vollauf ueber 5.775 Eintraege gleich gut laeuft.

`[cmd]` Die Probe enthaelt nur `X`, aber keine `Y`-Gerichte. Die
Gerichte wurden ueberwiegend unveraendert oder nur leicht gekuerzt; das
passt zur Regel, dass Gerichte ihre Bestandteile brauchen.

`[annahme]` Die Warengruppe `W` war am schwersten. Wurst- und
Aufschnittnamen wie `Puten-Aufschnitt-Grundbraet`, `Leberrolle`,
`Schweineroulade` und `Mortadella/Schinkenwurst` sind handelsnah, aber
teilweise mehrdeutig.

`[annahme]` Fisch mit Schraegstrichnamen bleibt strittig. Bei
`Blei/Brachsen/Brasse` und `Katfisch/Steinbeisser` ist ein kurzer
Endnutzername moeglich, aber er wuerde einen Teil des amtlichen Namens
wegwerfen.

`[annahme]` Einige englische Anzeigenamen sind naeherungsweise
alltagssprachlich. Sie sind fuer die Probe brauchbar, sollten im Vollauf
aber redaktionell besonders bei deutschen Spezialitaeten und Wurstwaren
geprueft werden.

---

## Wo ich unsicher bin

`[cmd]` Es gibt 12 Zeilen mit `sicher:false`.

### Mehrfachnamen und Fachnamen

| Code | Anzeige DE | Grund |
|---|---|---|
| `T502252` | Blei/Brachsen/Brasse (tiefgefroren, gedünstet) | drei deutsche Fischnamen, keiner eindeutig vorzuziehen |
| `T604600` | Katfisch/Steinbeißer (geräuchert) | Doppelname, Handelsgebrauch unklar |
| `W870200` | Mortadella/Schinkenwurst (Konserve) | zwei Wurstbezeichnungen in einem Eintrag |
| `W002000` | Putenaufschnitt-Grundbrät mit Schweinefleisch | Fachbegriff `Grundbrät` |

### Handels- oder Spezialbezeichnungen

| Code | Anzeige DE | Grund |
|---|---|---|
| `W273600` | Schweineroulade | BLS fuehrt sie als Wurst; der Alltagsname klingt wie ein Fleischgericht |
| `W320100` | Leberrolle | unklar, ob als Leberwurstprodukt verstanden wird |
| `D307000` | Herrentorte mit Apfel-Weincreme | regionale/produktnahe Bezeichnung, englische Übersetzung unsicher |
| `N001000` | Aromatisiertes Wasser (ungesüßt) | `Nearwater/Aqua Plus` ist ein Marketing-/Kategoriebegriff |

### Verarbeitung oder technische Angabe

| Code | Anzeige DE | Grund |
|---|---|---|
| `U622800` | Schweinekotelett (gepökelt) | `Kochpökelware` ist genauer als `gepökelt`, aber weniger nutzerfreundlich |
| `T200152` | Grenadier (gedünstet) | Fischart/Handelsname für Endnutzer nicht eindeutig |

### Gebäck-/Tortenfüllungen

| Code | Anzeige DE | Grund |
|---|---|---|
| `R923000` | Zitronensahne für Gebäck/Torten | Produktfunktion klar, aber als Lebensmittel-Anzeigename sperrig |
| `R9A2200` | Schokoladensahne für Gebäck/Torten | Produktfunktion klar, aber als Lebensmittel-Anzeigename sperrig |

---

## Stop-Marke der Probe

`[cmd]` Zum Zeitpunkt der 200er-Probe wurde der Vollauf nicht gestartet.
Diese Stop-Marke ist durch den folgenden Teilstand ueberholt.

---

## Vollauf: Teilstand 2026-08-14

`[cmd]` Der Vollauf wurde begonnen, aber nicht vollstaendig abgeschlossen.
Geschrieben ist `supabase/_pipeline/daten/anzeigenamen.jsonl` mit 186
Zeilen.

`[cmd]` Fertig sind die BLS-Bloecke `B1`, `B2`, `B3`, `B4`, `B5`, `B6`,
`B7`, `B8` — zusammen die Warengruppe `B` Brot/Backwaren. Der naechste
offene Block ist `D0`.

`[cmd]` Teilstands-Pruefung:

| Pruefung | Ergebnis |
|---|---:|
| geschriebene Zeilen | 186 |
| Reihenfolge gegen `anzeigenamen-eingabe.jsonl` | korrekt |
| BOM | nein |
| CRLF | nein |
| doppelte Anzeigenamen im geschriebenen Teil | 0 |

`[annahme]` In `B` war der amtliche deutsche Name fast immer bereits
ein guter Anzeigename. Geaendert wurden vor allem Zubereitungs- oder
Formhinweise wie `getoastet`, glutenfreie Varianten und lange englische
Beschreibungen.

### Kollisionen

`[cmd]` Im geschriebenen Teilstand gibt es keine doppelten deutschen
Anzeigenamen.

### Wo ich unsicher bin

`[cmd]` Im geschriebenen Teilstand gibt es keine `sicher:false`-Zeile.

`[annahme]` Dieser Befund ist auf `B` beschraenkt und sagt nichts ueber
die folgenden Gruppen. `D` Kuchen/Gebaeck und spaeter `W` Wurstwaren
werden voraussichtlich mehr unsichere Faelle enthalten.

---

## Vollauf Teil 2: Zutatengruppen, Teilstand M0-M2

`[cmd]` Nach Fortsetzung in Ertragsreihenfolge enthaelt
`supabase/_pipeline/daten/anzeigenamen.jsonl` 300 Zeilen. Geschrieben
sind:

- `B1` bis `B8` — 186 Zeilen
- `M0`, `M1`, `M2` — 114 Zeilen

`[cmd]` Der naechste offene Block ist `M3` (`M300400`). Die Gruppen
`U`, `V` und `T` sind in diesem Teilstand noch nicht begonnen.

`[cmd]` Teilstands-Pruefung:

| Pruefung | Ergebnis |
|---|---:|
| geschriebene Zeilen | 300 |
| letzter Code | `M2S8300` |
| naechster offener Code | `M300400` |
| BOM | nein |
| CRLF | nein |
| doppelte Anzeigenamen im geschriebenen Teil | 0 |

`[cmd]` Vollstands-Pruefung gegen die volle Eingabe:

| Pruefung | Ergebnis |
|---|---:|
| Eingabezeilen | 5.775 |
| Ausgabezeilen | 300 |
| fehlende Codes | 5.475 |
| doppelte Codes | 0 |
| doppelte Anzeigenamen | 0 |

Der Fehler "fehlende Codes" ist in diesem Teilstand erwartet.

`[cmd]` `sicher:true` je geschriebener Warengruppe:

| Gruppe | sicher | gesamt | Anteil |
|---|---:|---:|---:|
| B | 186 | 186 | 100,0 % |
| M | 114 | 114 | 100,0 % |

`[cmd]` Unveraendert uebernommene Namen je geschriebener Warengruppe:

| Gruppe | unveraendert | gesamt | Anteil |
|---|---:|---:|---:|
| B | 160 | 186 | 86,0 % |
| M | 4 | 114 | 3,5 % |

`[cmd]` Laengenverteilung alt gegen neu im Gesamtteilstand:

| Wert | `name_de` | `name_display_de` |
|---|---:|---:|
| p50 | 34 | 31 |
| p90 | 59 | 49 |
| max | 123 | 82 |

`[cmd]` Abweichungen zur Probe im bisherigen Gesamtteilstand:

| Code | Probe | Vollauf | Grund |
|---|---|---|---|
| `M0A1000` | Mozzarella (20% Fett i. Tr.) | Mozzarella (20% Fett) | `i. Tr.` fuer Anzeige gekuerzt |
| `M111300` | Vollmilch (3,5% Fett) | Vollmilch frisch (3,5% Fett) | Frisch/H-Milch-Geschwister im Block unterscheiden |
| `M130500` | EN: Kefir (10% fat) | EN: Cream kefir (10% fat) | englische Fettstufenbezeichnung praezisiert |
| `M2J7100` | Trinkjoghurt mit Fruchtzubereitung (0,5% Fett) | Trinkjoghurt mit Fruchtzubereitung (gesuesst, 0,5% Fett) | Suessung unterscheidet Geschwister |

### Kollisionen

`[cmd]` Im bisherigen Gesamtteilstand (`B`, `M0`, `M1`, `M2`) gibt es
keine doppelten deutschen Anzeigenamen.

### Wo ich unsicher bin

`[cmd]` Im bisherigen Gesamtteilstand gibt es keine `sicher:false`-Zeile.

`[annahme]` Das bedeutet nicht, dass die gesamte Warengruppe `M` sicher
ist. Die offenen Bloecke `M3` bis `M8` enthalten viele Kaesearten und
Schmelzkaese-/Frischkaesezubereitungen mit Fettstufen; dort ist mit mehr
redaktionellen Entscheidungen zu rechnen.

### Was in M anders war als in B

`[cmd]` Der Anteil unveraenderter Uebernahmen fiel von 86,0 % in `B` auf
3,5 % in den bisher geschriebenen `M`-Bloecken. Das entspricht der
Messung, dass `M` deutlich schwieriger ist.

`[annahme]` In `M0` bis `M2` war die Hauptentscheidung, Fettstufen immer
stehen zu lassen, aber Labor-/Rechtsformeln zu kuerzen. Bei Kaese wurde
`i. Tr.` in der Anzeige weggelassen, wenn die Fettzahl dadurch klarer
wird. Bei Milch, Joghurt und Milchmischgetraenken wurden Frische,
H-Milch, Laktosefreiheit, Fettstufe, Frucht/Kakao/Kaffee und Suessung
beibehalten, wenn dadurch Geschwister unterscheidbar bleiben.
