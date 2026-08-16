# Encoding-Schäden (B-09) — Suchbericht

<!-- encoding-pruefung:absicht - dieser Bericht ZITIERT die Muster,
     nach denen er sucht. Sie sind Gegenstand, nicht Schaden. -->


**Stand:** 2026-08-02 (autonome Sitzung) · **Ankerhash:** 76c8080
**Auftrag:** repo-weit beschädigte UTF-8-Sequenzen finden, nichts reparieren.
**Umfang:** `.ts .tsx .md .sql .ps1 .json`, ohne `node_modules`, `dist`,
`.next`, `temp`, `tmp`, `backup/data`.
**Methode:** `[cmd]` vier ripgrep-Durchgänge: (1) klassisches
UTF-8-als-Latin1-Mojibake (`Ã.`, `â€`, `ï»¿`, U+FFFD `�`), (2) CP850-Muster
(`ÔÇ`, `├x`, `┬`), (3) `Â.`-Muster, (4) `?`-Ersatzzeichen in Wortkontext
(`[A-Za-z]?[a-z]{1,3}`, alle Treffer einzeln gesichtet). Verdachtsstellen per
Hex-Dump (`od -c`) verifiziert.

---

## Ergebnis: 1 Datei mit echtem Schaden, 2 Stellen

### Bestätigter Schaden

| Pfad | Zeile | Beschädigt | Vermutetes Original |
|---|---|---|---|
| `supabase/migrations/20240522_002_nutrition_food_core_tables.sql` | 396 | `k?se` — `[cmd]` Hex-Dump: literales ASCII `?` (0x3F) | `käse` |
| `supabase/migrations/20240522_002_nutrition_food_core_tables.sql` | 399 | `n?sse` — dito | `nüsse` |

Kontext: beide stehen in Regex-Alternationen der Funktion
`nutrition.auto_tag_food()`:

```
'(milch|k?se|kaese|joghurt|quark|sahne)'
'(nuss|n?sse|nuesse|mandel|cashew|walnuss|haselnuss|erdnuss)'
```

**Doppelte Brisanz über den Schönheitsfehler hinaus:**

1. Der Schaden ist **irreversibel im Repo** — `?` trägt keine Information
   mehr; das Original ist nur aus dem Sprachkontext rekonstruierbar.
2. In einer Regex ist `k?se` nicht „k-Fragezeichen-se", sondern
   „optionales k, dann se" — die Alternation matcht damit **jedes Wort mit
   ‚se'** (Gemüse, Bratensauce …). Die `lactose_free`-Heuristik dieser Datei
   wäre grob falsch, **wenn** die Funktion liefe. `[cmd]` Sie läuft nicht:
   der Container enthält weder die Funktion noch den Trigger
   (siehe `31-migrations-rueckbau.md`). Latent, nicht akut.

### Bekannter Fall aus B-09: nicht reproduzierbar

`[cmd]` `packages/shared/src/supabase/client.ts` (12 Zeilen, vollständig
gelesen + `file`-Check: „UTF-8 text") enthält **heute kein Mojibake**.
Auch `server.ts` daneben ist sauber. Der Em-Dash `—` in Zeile 1 ist korrekt
kodiert. `[annahme]` Der ursprüngliche B-09-Befund war ein Anzeigefehler
(PowerShell-Konsole mit CP850/CP1252 stellt UTF-8-Mehrbytezeichen als
Zeichensalat dar), kein Dateischaden — oder die Datei wurde seither ersetzt;
Git-History nicht geprüft.

### Geprüft und sauber (Falsch-Positive der Suchmuster)

- `[cmd]` 5 Dateien enthalten Mojibake-Sequenzen **als Erkennungs-Regexe**
  (`system/workorders/cli/nutrient-defs-seed-extract.ts` + Test,
  `nutrition-human-layer.ts`, 2 p1-005-Validierungs-SQLs) — Werkzeuge der
  damaligen Import-Bereinigung, kein Schaden.
- `[cmd]` `├`/`┬`/`─`-Treffer sind Box-Drawing-Zeichen in ASCII-Diagrammen
  (Spec-Flows, Brainstorm-Docs) — korrekt kodiert.
- `[cmd]` Alle übrigen `x?yz`-Treffer sind URL-Query-Strings
  (`?user_id`, `?date=`, `?query`, `?limit`, `?consent`, `?nutrient` …).

### Nebenbefund Datenbank (read-only, über den Auftrag hinaus)

`[cmd]` Die Live-Daten sind sauber: 0 Treffer für `%?%` in
`foods.name_de/name_display`, `food_aliases.alias`,
`nutrient_defs.name_de/group_de/unit`. Die Import-Bereinigung hat die Daten
erwischt — nur die Migrationsdatei blieb beschädigt.

---

## Grenzen dieser Suche

- Nur die 6 beauftragten Dateitypen; `.js`, `.yaml`, `.txt`, `.csv` ungeprüft.
- Doppelt kodiertes Mojibake (`Ã¤` → `Ã?Â¤` usw.) über die Muster (1)–(3)
  hinaus nicht gezielt gesucht; Muster (1) hätte die häufigsten Formen gefunden.
- `?`-Ersatz am **Wortende oder -anfang** (z. B. `Di?t` fand das Muster,
  `hei?` fände es nur bei ≥1 Folgebuchstaben) — Restlücke `[annahme]` klein,
  da alle bekannten Schadensquellen (BLS-Import) durchgesichtet wurden.

## Konsequenz für TODO (nicht ausgeführt)

- B-09 kann von „repo-weit suchen" auf „2 Stellen in `20240522_002` fixen"
  verengt werden — **aber**: die Datei ist Teil der D-12-Frage O-6
  (Altdateien archivieren vs. behalten). Fix nur sinnvoll, wenn die Datei
  überlebt; in den Drafts (`migrations-draft/`) existiert die Funktion nicht.
- Der Verdachtsfall `client.ts` sollte aus B-09 gestrichen oder als
  Konsolen-Artefakt vermerkt werden.


---

# Fortschreibung 2026-08-16: doppelte Kodierung, und endlich eine Prüfung

`[cmd]` Erhoben am 2026-08-16, Zweig `dev`. Der Teil oben bleibt
unverändert stehen — insbesondere der Abschnitt „Konsequenz für TODO
(nicht ausgeführt)". Er ist der Beleg für das, was hier steht.

## Warum es dreimal wiederkam

Vier Varianten, vier Reparaturen, bis heute null Prüfungen:

| Variante | Beispiel | Reparatur |
|---|---|---|
| umschriebene Umlaute | `Eiweiss` statt `Eiweiß` | erledigt |
| Fragezeichen (704) | `Eiwei?brot` | erledigt |
| UTF-16 durch PowerShell | Schemasicherung | erledigt |
| **doppelte Kodierung** | `verfÃ¼gbar` | **jetzt** |

`[cmd]` Vor diesem Auftrag gab es **kein einziges Encoding-Prüfskript**
im Repo. Der Bericht oben hat am 2026-08-02 die richtige Konsequenz
gezogen und sie unter „nicht ausgeführt" abgelegt. Dort ist sie zwei
Wochen liegen geblieben, während zwei weitere Varianten auftraten.

`[read]` Der Bericht zur Kettenlücke sagt über seine eigene Prüfung:
*„sie verlässt sich auf Disziplin."* Genau daran ist es dreimal
gescheitert. **Eine notierte Konsequenz ist keine.**

`[cmd]` Der Bericht oben nennt die Lücke sogar beim Namen — Zeile 76:
„Doppelt kodiertes Mojibake … nicht gezielt gesucht". Die Variante, die
zwei Wochen später zuschlug, stand dort als bekannte Restlücke.

## Die Prüfung

`tools/encoding-pruefen.mjs`, im Gate: `pnpm gate` ruft sie **vor**
`turbo run typecheck test build` auf. `[cmd]` Damit gilt sie auch für
den Pre-Commit-Hook, der `pnpm gate` fährt — ohne dass jemand daran
denken muss.

`[cmd]` Die Zahl der Turbo-Tasks bleibt bei **8**. Die Prüfung ist keine
Paket-Task, sondern läuft einmal für das ganze Repo. Eine neunte Task
wäre auch fachlich falsch — sie hätte in einem Paket gelegen und nur
dessen Dateien gesehen.

`[cmd]` Laufzeit **357 ms** für 1.140 Dateien. Die Kette braucht 32 s;
die Prüfung fällt daneben nicht auf.

**Vier Prüfungen, alle an den Bytes:**

| Prüfung | Muster | Schwere |
|---|---|---|
| doppelte Kodierung | `c383`/`c382` + Folgebyte | Fehler |
| kein gültiges UTF-8 | `TextDecoder` mit `fatal` | Fehler |
| UTF-16 | `ff fe`, `fe ff` | Fehler |
| Ersetzungszeichen | U+FFFD | Fehler |
| UTF-8-BOM | `ef bb bf` | **Hinweis** |

`[read]` **Warum an den Bytes und nie an der Konsolenausgabe:** Eine
Konsole mit CP850 stellt korrektes UTF-8 als Zeichensalat dar — genau
das hat 2026-08-02 zum Fehlbefund `client.ts` geführt (oben,
„nicht reproduzierbar"). Umgekehrt zeigt eine UTF-8-Konsole doppelte
Kodierung als lesbares Mojibake, was harmlos aussieht. Beide Richtungen
täuschen; die Bytes nicht.

`[cmd]` Während der Arbeit ist mir das noch einmal begegnet: ein
Python-Aufruf, der eine Fundstelle ausgeben wollte, brach mit
`UnicodeEncodeError … charmap` ab — die Windows-Konsole konnte das
Zeichen nicht darstellen. Die Prüfung selbst hat damit kein Problem,
weil sie nichts dekodiert, um zu vergleichen.

### Warum der BOM nur ein Hinweis ist

`[cmd]` 10 Dateien tragen einen UTF-8-BOM, darunter zwei Gruppen, die
dieser Auftrag nicht anfassen darf: `apps/web/src/app/nutrition/foods/page.tsx`
(für G-07 gesperrt) und acht Dateien in `docs/BrainstormDocs/`
(Datenquelle, nie Current Truth).

Wäre der BOM ein Fehler, bliebe das Gate **dauerhaft rot** — und ein
dauerhaft rotes Gate wird umgangen, nicht repariert. Er zerstört nichts;
er wird gemeldet und hält niemanden auf.

### Freistellung mit Marke, nicht mit Pfadliste

`[cmd]` Sechs Dateien tragen beschädigte Sequenzen als **Gegenstand**:
vier Validierungsabfragen suchen mit `LIKE` nach ihnen, zwei Berichte
zitieren sie als Beleg. Sie tragen jetzt die Marke
`encoding-pruefung:absicht` im Text.

`[read]` Die Marke steht **im Text**, nicht in einer Pfadliste im
Skript. Wer sie setzt, sagt sichtbar: hier steht das mit Absicht. Eine
Pfadliste wäre stiller und würde beim Umbenennen mitwandern, ohne dass
es jemand merkt.

`[cmd]` UTF-16 und ungültiges UTF-8 lassen sich **nicht** freistellen —
die kann niemand mit Absicht wollen.

### Die Prüfung wurde zum Fehlschlagen gebracht

`[read]` Eine Prüfung, die noch nie fehlgeschlagen ist, ist kein Beleg.

`[cmd]` Neun Tests in `apps/web/src/__tests__/encoding-pruefung.test.ts`
legen für jede Schadensklasse eine Datei mit den passenden Bytes an.
Fünf verlangen einen Fund, vier verlangen **Ruhe**:

- echte Umlaute (`Grüße, Käse, Nüsse, Öl, Weiß`) → Exit 0
- `São Paulo, Ångström` → Exit 0, obwohl dort ein echtes `Ã` steht
- ein BOM allein → Exit 0, aber gemeldet
- BOM **plus** doppelte Kodierung → Exit 1, der Fehler gewinnt

`[read]` Der zweite Teil ist der wichtigere. Eine Prüfung, die bei jedem
`ü` anspringt, wird nach zwei Tagen abgeschaltet.

## Die Reparatur

`[cmd]` **Vorher: 276 doppelt kodierte Sequenzen in 4 Dateien.** Exakt
die Ausgangsmessung des Auftrags, unabhängig reproduziert.

| Datei | Sequenzen | Behandlung |
|---|---|---|
| `015_nutrient_defs_seed.sql` | 212 | repariert |
| `docs/ssot/61-referenzwerte.md` | 59 | repariert |
| `docs/ssot/75-nutrition-oberflaeche.md` | 3 | **Zitat — Marke gesetzt** |
| `docs/ssot/32-encoding-schaeden.md` | 2 | **Zitat — Marke gesetzt** |

### Die Umkehr lief über CP1252, nicht Latin-1

`[cmd]` Der erste Versuch mit Latin-1 **schlug fehl**: an Position 1035
steht eine Sequenz mit `U+201E`, und dieses Zeichen kennt Latin-1 nicht.
Das ist der Fingerabdruck einer Windows-Codepage — CP1252 belegt
`0x80`–`0x9F`, Latin-1 lässt diesen Bereich leer.

`[cmd]` Mit CP1252 ist die Umkehr **eindeutig**: die Datei lässt sich
vollständig zurückkodieren und ergibt gültiges UTF-8.

`[cmd]` Vier Bedingungen wurden vor dem Schreiben geprüft; bei jeder
Abweichung hätte das Skript angehalten:

1. Umkehr überhaupt möglich (kein Zeichen ausserhalb CP1252)
2. Ergebnis ist gültiges UTF-8
3. **Die Codeliste ist unverändert** — 108 Codes vorher wie nachher
4. Die Zeilenzahl ist unverändert — 209

`[cmd]` Ergebnis: 19.084 → 18.600 Bytes, 125 Zeilen geändert, **kein
Name inhaltlich angefasst**. `MakronÃ¤hrstoffe` → `Makronährstoffe`,
`verfÃ¼gbar` → `verfügbar`.

`[cmd]` Die beiden Markdown-Dateien wurden **nicht** über einen
Ganzdatei-Roundtrip behandelt: sie sind gemischt (überwiegend korrektes
UTF-8, einzelne doppelte Sequenzen), und ein Roundtrip hätte die
korrekten Zeichen zerstört. Stattdessen wurden nur die belegten Paare
ersetzt, Zeichen für Zeichen geprüft.

### Ein Fehler, den ich selbst gemacht habe

`[cmd]` Mein erster Durchlauf über `75-nutrition-oberflaeche.md`
„reparierte" auch die Stellen, an denen der Bericht die Schäden
**zitiert**. Danach stand dort eine Tabellenzeile, die zweimal dasselbe
Zeichen gegenüberstellte — ein Satz ohne Aussage.

`[cmd]` Zurückgenommen, stattdessen die Marke gesetzt. Der Auftrag hatte
genau davor gewarnt, allerdings für die andere Datei; die Falle stand in
beiden. **Das ist der Grund, warum die Freistellung an einer Marke im
Text hängt und nicht am Dateinamen** — sie muss beim Lesen auffallen.

## Nachweis

`[cmd]` Vor der Reparatur: **276** Sequenzen, Exit 1.
`[cmd]` Nach der Reparatur: **0**, Exit 0.
`[cmd]` `pnpm gate`: 8 Tasks, grün. Tests: **155 von 155**.

### Kettenlauf und Stichprobe an den Bytes

`[cmd]` Kettenlauf von leer über `kette-ausfuehren.ts` gegen eine
Wegwerf-Datenbank (`KETTE OK: 33.4s`, `SCHEMA VOLLSTAENDIG`), danach:

```
Namen mit Ã oder Â: 0 von 138
```

`[cmd]` Stichprobe an den **Bytes**, nicht an der Ausgabe:

| Code | Bytes (Ausschnitt) | Zeichen |
|---|---|---|
| `CHO` | `… 76 65 72 66 c3bc 67 62 61 72` | `c3bc` = `ü` |
| `VITA` | `… 6c 2d c384 71 75 69 76 …` | `c384` = `Ä` |
| Gruppe | `4d 61 6b 72 6f 6e c3a4 68 …` | `c3a4` = `ä` |

Je zwei Bytes statt vier — vorher stand dort `c383 c2bc`.

`[cmd]` Danach einmal live eingespielt (`INSERT 0 138`). Die laufende
Datenbank meldet jetzt **0 von 138** beschädigte Namen; Stichprobe:
`Kohlenhydrate, verfügbar`, `Vitamin A, Retinol-Äquivalent (RE)`,
Einheit `µg`.

`[read]` Kein `UPDATE` als Reparatur — der Kettenschritt erzeugt den
richtigen Stand, und genau das wurde nachgewiesen, bevor er live lief.

## Was diese Prüfung nicht sieht

**Umschriebene Umlaute.** `[annahme]` `Eiweiss` statt `Eiweiß` ist nicht
allgemein erkennbar — in der Schweiz ist `Eiweiss` richtig, und
`Muesli` ist im Englischen kein Fehler. Diese Variante bleibt Sache der
fachlichen Prüfungen wie `anzeigenamen-pruefen.ts`.

**Fragezeichen.** `[annahme]` `Eiwei?brot` ist Schaden, `?limit=10` ist
ein URL-Parameter, `Wirklich?` ist eine Frage. `[read]` Die Suche vom
2026-08-02 hat diesen Weg gewählt und **alle Treffer einzeln
gesichtet** — das ist Handarbeit, keine Gate-Prüfung. Der Schaden ist
ausserdem irreversibel: `?` trägt keine Information mehr.

**Ausserhalb des Umfangs:** `.yaml`, `.txt`, `.html`, `.ps1`, `.sh` und
alles ohne die zehn geprüften Endungen. Dazu die ausgeschlossenen
Ordner: `node_modules`, `.next`, `.git`, `referenz/`, `_archive/`,
`media/`, `backup/schema/`, `backup/data/`, `temp/`, `.vscode/`,
`.idea/` und `docs/design-system*/`.

`[cmd]` Die beiden Design-System-Ordner sind ausgeschlossen, weil ihre
Pfade länger sind als Windows erlaubt — eine rekursive Suche bricht dort
ab, statt sie zu überspringen. `[cmd]` `temp/` steht in `.gitignore`
und enthielt fremdes Material; ohne den Ausschluss prüfte das Skript
10.006 statt 1.140 Dateien.

**Die Datenbank.** Die Prüfung liest Dateien, nicht Tabellen. Ein
Schaden, der über einen anderen Weg als die Kette hineinkommt, fällt ihr
nicht auf. `[cmd]` Für den heutigen Fall reicht sie: die Namen entstehen
ausschliesslich aus der Seed-Datei.

**Dreifache Kodierung.** `[annahme]` Das Reparaturskript prüft nach der
Umkehr, ob noch Muster übrig sind, und hält dann an — aber es kehrt nur
einmal um. Ein dreifach kodierter Text würde erkannt, nicht automatisch
repariert.

**Falsch-Positive bleiben möglich.** `[annahme]` Ein Text, der ein
echtes `Ã` unmittelbar vor einem Mehrbyte-Zeichen enthält, würde
gemeldet. In deutschen, englischen und portugiesischen Texten ist das
sehr selten; der Test mit `São Paulo, Ångström` deckt den häufigsten
Fall ab. Wo es doch auftritt, gibt es die Marke.
