# C-43: Die Kette ausfuehrbar machen

`[cmd]` Erhoben am 2026-08-15 gegen den Container
`supabase_db_LumeOS-Claude-V1`.

---

## Ergebnis

`[cmd]` Es gibt jetzt eine ausfuehrbare Steuerdatei:
`supabase/_pipeline/kette.json`. Der Name ist bewusst knapp gehalten:
`kette.json` ist die fachliche Steuerung, nicht eine zweite README und
nicht nur eine technische Runner-Konfiguration.

`[cmd]` Die Datei enthaelt 37 auszufuehrende Schritte. Das sind die 33
nummerierten Schrittdateien plus Baseline `B` und der doppelte Lauf von
`020` als `020a` und `020b`. `auth_stub` ist als Abhaengigkeit markiert,
aber kein fachlicher Schritt.

`[cmd]` Der Ausfuehrer liegt unter
`supabase/_pipeline/kette-ausfuehren.ts`. Er verweigert die Datenbank
`postgres`, legt vor dem Lauf ein Schema-Backup ab, erzeugt eine
Wegwerf-Datenbank, installiert dort den minimalen `auth`-Stub, kopiert
die Import-CSVs in den Container und bricht mit `ON_ERROR_STOP` beim
ersten Fehler ab.

`[cmd]` Der README-Abgleich liegt unter
`supabase/_pipeline/_validierung/kette-readme-pruefen.ts`.
Nach der README-Ergaenzung meldet er:

```
README/Kette: ok (37 Schritte dokumentiert)
```

---

## Nachweis gegen eine Wegwerf-Datenbank

`[cmd]` Aufruf:

```
pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts --keep-database
```

`[cmd]` Der Lauf erzeugte vorher ein Backup:

```
backup/schema/20260815044118_c43_vor_kettenlauf.sql
```

`[cmd]` Die Kette lief bis einschliesslich `073` durch. Gemessene
Zwischenwerte aus dem Lauf:

| Schritt | Ergebnis |
|---|---|
| `030` | `COPY 7140`, `COPY 698092`, `INSERT 0 7140`, `INSERT 0 698092` |
| `031` | `COPY 171409`, `INSERT 0 171409` |
| `021` | `affected_rows = 49` |
| `022` | `OK: 11100 abgeleitete Aliase, 32520 gesamt` |
| `024` | `OK: 4877 Synonyme, davon 21 von Hand` |

`[cmd]` Der Lauf brach korrekt hart bei `025` ab:

```
supabase/_pipeline/daten/anzeigenamen.jsonl: 7140 Zeilen, erwartet 5775. Abbruch.
```

`[cmd]` Die Abschlusspruefung gegen die abgebrochene
Wegwerf-Datenbank meldete Exit 1 mit 27 Abweichungen. Darunter:
fehlende `052`-Objekte, zu wenige Aliase und Tags sowie fehlende
Training-Tabellen. Das ist der Rueckroll-/Abbruchfall, den der
Ausfuehrer sichtbar machen muss.

`[cmd]` Die Wegwerf-Datenbank `lumeos_kette_20260815044118` wurde nach
der Diagnose verworfen.

---

## Der Blocker

`[cmd]` Die Datendatei `supabase/_pipeline/daten/anzeigenamen.jsonl`
enthaelt 7.140 Zeilen.

`[cmd]` `supabase/_pipeline/_ableitung/anzeigenamen-einspielen.ts` und
`supabase/_pipeline/_ableitung/anzeigenamen-nebennamen-aliase.ts`
enthalten weiterhin:

```
const EXPECTED_LINES = 5775
```

`[read]` Der Auftrag verbietet inhaltliche Aenderungen an
Schrittdateien: Wenn einer beim Lauf scheitert, melden, nicht
reparieren. Deshalb wurde `025`/`026` nicht angepasst.

`[annahme]` Der naechste kleine Fix ist klar abgegrenzt: beide Schritte
muessen den inzwischen vollstaendigen Anzeigenamenbestand von 7.140
Zeilen akzeptieren. Erst danach kann der C-43-Nachweis von leer bis
vollstaendig gruen laufen.

---

## README und Sollliste

`[cmd]` Der README-Abgleich haette vor der Ergaenzung die fehlenden
Schritte `062`, `071`, `080` und `100` bis `105` gemeldet.

`[cmd]` Nachgetragen in `supabase/README.md`:

| Schritt | Datei |
|---|---|
| `062` | `06_zugriff/062_pruef_objektliste.sql` |
| `071` | `07_lesefunktionen/071_suchrelevanz.sql` |
| `080` | `08_bereinigung/080_public_bereinigen.sql` |
| `100` | `10_training/100_training_schema.sql` |
| `101` | `10_training/101_training_seed.sql` |
| `102` | `10_training/102_plural_merge.sql` |
| `103` | `10_training/103_calvicular_merge.sql` |
| `104` | `10_training/104_body_region.sql` |
| `105` | `10_training/105_mideus_merge.sql` |

`[cmd]` `schema-sollstand.json` kennt jetzt zusaetzlich
`nutrition.such_alias_treffer` aus `073` und
`nutrition.pruef_objektliste` aus `062`.

`[cmd]` Die Schemapruefung zaehlt jetzt auch die Training-Daten:
`training.exercises` 1.416, `training.muscle_groups` 107,
`training.equipment` 58, `training.exercise_muscles` 6.624.
Damit kann ein gruener Nutrition-Teil nicht mehr verdecken, dass
`100` bis `105` nie liefen.

`[cmd]` Gegen die aktuelle laufende Datenbank meldet die erweiterte
Schemapruefung derzeit noch `pruef_objektliste FEHLT`, weil `062` dort
noch nicht ausgefuehrt ist. Gegen einen vollstaendigen Kettenlauf muss
diese Abweichung verschwinden.

---

## Warum der Gegenbeweis noch nicht vollstaendig ist

`[read]` Gefordert war: einen Schritt aus der Datei nehmen und zeigen,
dass die Abschlusspruefung anschlaegt.

`[cmd]` Der Hauptlauf erreicht die Abschlusspruefung noch nicht, weil
`025` vorher korrekt abbricht. Ein kuenstlicher Gegenlauf mit entferntem
Schritt wuerde deshalb denselben frueheren Blocker treffen und nicht
den gewollten Beweis liefern.

`[cmd]` Belegt ist der wichtigere Zwischenfall: Nach dem Abbruch meldet
die Abschlusspruefung die fehlenden spaeteren Objekte und beendet sich
mit Exit 1. Der Gegenbeweis mit entferntem Schritt gehoert nach dem
separaten `025`/`026`-Fix erneut gefahren.

---

## Was jetzt noch von Hand passieren muss

`[cmd]` Der Ausfuehrer kopiert die beiden BLS-Archive in den Container
und installiert den `auth`-Stub selbst. Dieser Teil ist nicht mehr von
Hand.

`[annahme]` Noch nicht erledigt ist der Datenvertrags-Fix in `025` und
`026`: beide Schritte erwarten 5.775 statt 7.140 Anzeigenamen. Das ist
kein fachlicher Kettensteuerungsfehler, blockiert aber den ersten
vollstaendigen Lauf.

`[read]` Rollenvergabe bleibt ausserhalb der Kette. `061` legt
`public.is_admin()` und Policies an; wer Admin ist, kommt aus dem
Auth-JWT bzw. den App-Metadaten und wird nicht durch die lokale Kette
gesetzt.

`[annahme]` Die README ist weiterhin Dokumentation. Die Disziplin ist
jetzt reduziert, aber nicht weg: Wer einen neuen Schritt anlegt, muss
ihn in `kette.json` eintragen. Der Unterschied ist, dass
`kette-readme-pruefen.ts` die Dokumentation danach gegen die Steuerdatei
prueft.

`[annahme]` Die Abschlusspruefung ist weiterhin ein Lauf gegen eine
Datenbank. Sie ist nicht Teil von `pnpm gate`, weil sie den lokalen
Supabase-Container braucht.

---

## Nachtrag 2026-08-15: die Zeilenzahl in `025`/`026` wird abgeleitet

`[cmd]` Der oben beschriebene Blocker ist weg. Die Kette laeuft von leer
durch: `KETTE OK: 32.9s`, Abschlusspruefung `SCHEMA VOLLSTAENDIG`,
Exit 0.

### Was geaendert wurde

`[read]` Die harte `5775` war keine Schlamperei, sondern Absicherung
gegen einen stillen Teilimport — genau der Fehler, der bei den
Fettsaeuren passiert ist. Sie einfach auf `7140` zu setzen haette das
Problem beim naechsten Bestandsnachtrag wiederholt.

`[cmd]` Stattdessen leitet `_ableitung/anzeigenamen-erwartung.ts` die
Erwartung aus drei Quellen ab, die uebereinstimmen muessen:
`daten/anzeigenamen.jsonl` (Ausgabe der Kuration),
`daten/anzeigenamen-eingabe.jsonl` (Eingabe derselben Kuration) und
`nutrition.foods` (der Bestand). Weicht eine ab, bricht der Schritt ab
und nennt alle drei Zahlen. `025` und `026` benutzen dieselbe Ableitung;
die SQL-Pruefung in `025` vergleicht zusaetzlich im Transaktionskontext
`tmp_anzeigenamen_jsonl` gegen `nutrition.foods`.

`[read]` In `026` gilt die Pruefung der EINGABE. Die Zahl der erzeugten
Aliase ist naturgemaess kleiner, weil nur Zeilen mit `nebennamen`
beitragen — nicht verwechseln.

### Gegenprobe

`[cmd]` Eine Testzeile an `anzeigenamen.jsonl` angehaengt, `025`
gefahren — Exit 1:

```
Zeilenzahlen stimmen nicht ueberein — Abbruch.
  anzeigenamen.jsonl        : 7141
  anzeigenamen-eingabe.jsonl: 7140
  nutrition.foods           : 7140
```

`[cmd]` `026` meldet dasselbe. Die Testzeile wurde entfernt; die Datei
ist gegenueber HEAD unveraendert.

### Zielwerte des Kettenlaufs

`[cmd]` Gegen die Wegwerf-Datenbank `lumeos_kette_pruef`:

| Groesse | Ist | Erwartet |
|---|---|---|
| `nutrition.foods` | 7.140 | 7.140 |
| `nutrition.food_nutrients` | 869.501 | 869.501 |
| davon Naehrstoffcodes | 138 | 138 |
| davon `data_source` | 2 | 2 |
| `nutrition.food_tags` | 17.967 | 17.967 |
| `training.exercises` | 1.416 | 1.416 |
| `training.muscle_groups` | 107 | 107 |
| `nutrition.food_aliases` | 32.843 | 32.817 |

`[cmd]` Die Aliasabweichung von +26 ist erklaert und kein Fehler des
Laufs. Sie zerfaellt in zwei Teile:

- `curated_nebenname` 311 statt 283 (+28), rein additiv — kein Alias der
  laufenden Datenbank fehlt in der Kette. Es sind kuratierte Nebennamen
  aus dem Phase-1-Nachtrag (`Rote Bete`, `Lauchzwiebel`, `Buletten`,
  `Eierkuchen` u. a.), die nie eingespielt wurden, **weil `025`/`026`
  genau an der harten `5775` abbrachen.** Der Lauf holt sie jetzt nach.
- `derived` 11.100 statt 11.102 (−2), eine Normalisierungsdifferenz:
  `[cmd]` die Kettendatenbank hat 0 Aliase mit `/`, die laufende 369.
  Die geslashten Formen (`weizenpops/weizengepufft`) fallen unslashed
  auf 367 verschiedene zusammen. Das ist Drift **in der laufenden
  Datenbank**, nicht im Lauf; die Kette erzeugt den korrekten Stand.

### Wie viele Schritte tragen noch eine harte Erwartung?

`[cmd]` **Zwei** weitere Stellen sind an den Lebensmittelbestand
gekoppelt und brechen beim naechsten Bestandsnachtrag genauso:

| Datei | Stelle | Inhalt |
|---|---|---|
| `_ableitung/027_lebensmittel-tags.ts` | Z12 | `const EXPECTED_FOODS = 7140` |
| `_validierung/suche-abdeckung-messen.ts` | Z66 | `if (n !== 7140)` |

`[cmd]` `027` ist ein Kettenschritt — derselbe Defekt einen Schritt
spaeter. Die Abdeckungsmessung ist kein Kettenschritt, faellt aber
gleich aus.

`[cmd]` Sieben weitere Vergleiche gegen Zahlenliterale stehen in
`10_training/102` bis `105` (`109`/`108`/`107` Muskelgruppen,
`6625`/`6624` Zuordnungen, `402` Gluteus-Medius-Zuordnungen). Die sind
**nicht** an den Lebensmittelbestand gekoppelt: jeder Merge behauptet
den Zustand, den seine eigene Umformung erzeugt, und dokumentiert ihn
mit der Rechnung (`6625 minus 1 Kollision`, `383+20-1`). Sie brechen nur,
wenn der Trainingsbestand waechst — andere Quelle, andere Entscheidung.
Hier ist die harte Zahl eher richtig als falsch.

`[read]` Methodenhinweis, weil er zum wiederkehrenden Muster gehoert:
Der erste Sucher fand nur 3 Stellen, weil er ausschliesslich gegen eine
Liste bekannter Bestandsgroessen prueft. Erst ein zweiter Lauf, der
**jeden** Vergleich gegen ein grosses Zahlenliteral in den Schritten aus
`kette.json` meldet, brachte 10 Fundstellen. Der enge Sucher war selbst
ein Werkzeug, das Sicherheit behauptet, ohne sie zu erzeugen — er zaehlte
nur, was er erwartet hatte.

### Anmerkungen zum Lauf

`[cmd]` Die Schemapruefung meldet zwei Hinweise, keine Fehler:
`foods_custom` und `custom_food_energy_plausibility` stehen in der
Datenbank, aber nicht in der Sollliste.

`[cmd]` Ein Lauf von `025` ging waehrend der Diagnose versehentlich
gegen `postgres` statt gegen die Wegwerf-Datenbank. Ein Abgleich aller
7.140 Zeilen gegen `daten/anzeigenamen.jsonl` zeigt 7.140 identisch,
0 abweichend — der Schritt hat die bereits kuratierten Werte erneut
geschrieben, nichts veraendert.

`[cmd]` Umgebungsartefakt, kein Repo-Defekt: `kette-ausfuehren.ts` ruft
`tar` ueber `spawnSync` ohne Shell auf. Loest das gegen die GNU-tar aus
Git Bash auf, scheitert das Entpacken mit
`tar: Cannot connect to D: resolve failed` — GNU tar liest `D:\...` als
Rechnernamen. Windows' `bsdtar` aus `System32` kann den Pfad. Der Lauf
oben erfolgte mit einer `tar.exe`-Kopie vorn im PATH.
