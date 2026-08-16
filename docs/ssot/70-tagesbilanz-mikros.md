# C-37: Mikronaehrstoffe in der Tagesbilanz

`[cmd]` Erhoben am 2026-08-15 gegen den Container
`supabase_db_LumeOS-Claude-V1`, Wegwerf-Datenbank `lumeos_c37` aus einem
vollstaendigen Kettenlauf.

Geaendert wurde ausschliesslich
`supabase/_pipeline/05_user_tabellen/053_daily_summary.sql`
(plus Sollstand und Schemapruefung, siehe unten). `hydration_summary`,
`meal_items`, `foods` und `food_nutrients` sind unberuehrt.

---

## Flach oder JSONB, und warum

`nutrition.daily_summary` fuehrte 22 Spalten: neun Makros, neun
Fehlzaehler, dazu `user_id`, `entry_date`, `meal_count`, `item_count`.
Die 24 Mikros aus `SPEC_06` Abschnitt 16 kommen als **48 flache Spalten**
dazu — 24 Summen und 24 Fehlzaehler. Die Sicht hat jetzt **70 Spalten**.

Zur Wahl stand ein JSONB je Naehrstoff mit Wert und Abdeckungsgrad. Die
Entscheidung fiel gegen JSONB, aus drei Gruenden.

### 1. Die Daten sind dicht, nicht duenn

Das war die Zahl, die die Entscheidung getragen hat, und sie zeigte in
die andere Richtung als erwartet. `[cmd]` Belegung der 24 Codes in
`food_nutrients` ueber 7.140 Lebensmittel:

| Code | Foods mit Wert | Anteil |
|---|---:|---:|
| `FOL` | 7.136 | 99,9 % |
| `VITA` | 7.134 | 99,9 % |
| `K`, `CA` | 7.121 | 99,7 % |
| `MG`, `FE` | 7.113 | 99,6 % |
| `P` | 7.111 | 99,6 % |
| `AAE9` | 7.107 | 99,5 % |
| `NA` | 7.097 | 99,4 % |
| `ZN` | 7.081 | 99,2 % |
| … | … | … |
| `VITK` | 6.767 | 94,8 % |
| `VITC` | 6.720 | 94,1 % |
| `ID` | 6.228 | 87,2 % |

`[cmd]` Der schwaechste Wert ist `ID` (Iodid) mit 87,2 %; 23 der 24
Codes liegen ueber 94 %.

JSONB lohnt bei duennen Daten — wenn die meisten Schluessel in den
meisten Zeilen fehlen und eine feste Spalte fast immer leer stuende.
Hier ist es umgekehrt: fast jeder Schluessel waere in fast jeder Zeile
gesetzt, und der Schluesselname wuerde je Zeile mitgeschrieben. Das ist
Aufwand ohne Gegenwert.

### 2. Gleiche Form fuer gleiche Sache

Die neun Makros stehen flach als `<makro>` und `<makro>_missing`. Mikros
daneben in einer anderen Form zwaenge jede Abfrage, zwei Zugriffsarten zu
kennen (Spalte hier, Auspacken dort), und jede Auswertung, zwei
Lueckenbegriffe zu unterscheiden. Der Unterschied traegt keine
fachliche Bedeutung — Eisen ist nicht anders zu behandeln als
Ballaststoff.

### 3. Erweiterbarkeit spricht hier nicht fuer JSONB

Das uebliche Argument fuer JSONB ist der 25. Naehrstoff ohne
Schemaaenderung. Es traegt hier nicht: die Sicht liest ohnehin aus dem
Schnappschuss, und ein neuer Naehrstoff heisst so oder so Schritt
aendern, Sicht neu anlegen, Sollstand nachziehen. JSONB verschoebe die
Aenderung nur von der Spaltenliste in den auspackenden Code — und dorthin,
wo sie niemand prueft.

### Was gegen die gewaehlte Form spricht

70 Spalten sind viel. Wer `SELECT *` macht, bekommt sie alle. Das ist der
Preis, und er ist bewusst bezahlt.

`[annahme]` Laufzeit wurde **nicht** gemessen, und zwar weil es nichts zu
messen gibt: `[cmd]` `nutrition.meals` und `nutrition.meal_items` haben
heute 0 Zeilen. Eine Zahl aus zwei kuenstlichen Testtagen waere keine
Aussage ueber Laufzeit. Sollte sich die Breite spaeter als Last
erweisen, ist der Rueckweg eine zweite, schmale Sicht — kein Umbau
dieser.

### Was nicht aus der Spec uebernommen wurde

`[read]` Die Spec-Fassung (`daily_nutrition_summary`, Abschnitt 16)
benutzt durchgehend `COALESCE(…, 0)`. Damit wuerde ein nicht erfasster
Eisenwert zu „null Milligramm Eisen" — eine Aussage, die die Daten nicht
hergeben. Die gebaute Sicht ist an dieser Stelle besser als die Spec und
bleibt es: fehlend bleibt `NULL`, gezaehlt wird in `<code>_missing`.

Ebenfalls nicht uebernommen: die Spec-Spaltennamen (`total_vita_ug` &c.)
und die dort eingebettete Wasser-Unterabfrage. Wasser laeuft getrennt in
`hydration_summary` (056) und bleibt dort.

`[read]` Die Sicht heisst im Repo `daily_summary`, in der Spec
`daily_nutrition_summary`. Eine Suche nach dem Repo-Namen findet in
`docs/specs/` deshalb nichts — `[cmd]` 0 Treffer.

---

## Die 24 Codes gegen den Katalog

`[cmd]` Alle 24 Codes aus der Spec existieren in `nutrient_defs`
(138 Codes). **Kein Befund** — nichts fehlt, nichts musste weggelassen
werden.

`[cmd]` Alle 24 tragen `display_tier` 1 oder 2. Die Reihenfolge in der
Sicht folgt `display_tier`, dann `sort_index` aus `nutrient_defs`, nicht
der Reihenfolge in der Spec.

`[cmd]` Eine Umbenennung: der Code `ID` (Iodid) heisst in der Sicht
`iodid` bzw. `iodid_missing`. Eine Spalte namens `id` neben `user_id`
und `meal_count` waere eine Einladung zum Missverstaendnis.

`[read]` Die Einheiten stehen als Kommentar je Zeile im Schritt und
stammen aus `nutrient_defs`. Die Sicht rechnet **nicht** um: `VITB6`
liefert µg, `VITE` mg, `LEU` g. Wer Werte anzeigt, muss die Einheit aus
`nutrient_defs` dazuholen.

---

## Zaehlweise der Luecken

Bei den Makros ist ein fehlender Wert eine `NULL`-Spalte. Bei den Mikros
ist er ein **fehlender Schluessel** im Schnappschuss — `[read]` 052:
„Fehlende Werte sind kein Schluessel — ein fehlender Naehrwert ist nicht
0." Der Operator `->>` liefert fuer einen fehlenden Schluessel `NULL`,
`COUNT()` zaehlt `NULL` nicht mit. Damit ist die Rechnung dieselbe wie
bei den Makros: `COUNT(mi.id) - COUNT(wert)`.

### Testfall mit echten Zeilen

`[cmd]` Zwei Tage in `lumeos_c37`, eine Nutzerin:

- **2026-03-01** — eine Position aus dem Bestand, gewaehlt als Food, das
  alle 24 Codes traegt.
- **2026-03-02** — zwei Positionen mit Luecken: A traegt nur `VITC` und
  `FE`, B nur `FE`.

`[cmd]` Ergebnis, Erwartung in derselben Abfrage mitgefuehrt:

| Tag | Positionen | `vita_missing` | soll | `vitc_missing` | soll | `fe_missing` | soll | `fibt_missing` | soll | `vita IS NULL` | soll |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-03-01 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | f | f |
| 2026-03-02 | 2 | 2 | 2 | 1 | 1 | 0 | 0 | 2 | 2 | t | t |

`[cmd]` Die Summen stimmen: Tag 2 hat `vitc` 30 (nur Position A) und
`fe` 4.0 (2,5 + 1,5).

`[cmd]` Die Gegenprobe zur Spec-Variante, an derselben Zeile:

```
 entry_date | so_ist_es | so_waere_es_mit_spec_coalesce
 2026-03-02 |           |                             0
```

`[cmd]` Nebenbefund, der die Unterscheidung belegt: Tag 1 zeigt
`vitc = 0.00000` bei `vitc_missing = 0` — ein **gemessener** Nullwert.
Tag 2 zeigt `vita = NULL` bei `vita_missing = 2` — **nicht gemessen**.
Die Sicht haelt beides auseinander; mit `COALESCE` waeren beide „0".

### Zeilenschutz haelt ueber die neuen Spalten

48 neue Spalten sind 48 neue Wege, Daten zu zeigen. `[cmd]` Geprueft mit
zwei Sessions als Rolle `authenticated`:

| Session | Zeilen |
|---|---:|
| `1111…1111` (Eigentuemerin) | 2 |
| `2222…2222` (fremd) | 0 |

`security_invoker=true` traegt also auch die erweiterte Sicht.

---

## Der blinde Fleck in der Schemapruefung — und was daraus wurde

Der Auftrag fragte, ob die Pruefung eine geaenderte Spaltenzahl
ueberhaupt bemerkt.

`[cmd]` **Nein, sie konnte es nicht.** Der Sollstand-Eintrag fuer
`daily_summary` fuehrte `name`, `schritt`, `security_invoker` und
`grants` — keine Spalten. `[cmd]` Der Pruefcode las Sichten nur aus
`pg_class` (Existenz) und `reloptions` (`security_invoker`). Die 48
Mikro-Spalten haetten ersatzlos verschwinden koennen, und die Pruefung
haette Exit 0 gemeldet.

`[read]` Bekannt war die Luecke: `_bewusst_nicht_geprueft.spalten` sagt
seit 2026-08-16 „Eine Tabelle kann den richtigen Namen tragen und die
falschen Spalten haben." Fuer Tabellen bleibt das so. Fuer **Sichten**
wiegt es schwerer, weil eine Sicht nichts als ihre Spalten ist.

`[cmd]` Nachgeruestet: Der Sollstand fuehrt fuer `daily_summary` jetzt
die 70 erwarteten Spalten in Reihenfolge; die Pruefung vergleicht sie
gegen `information_schema.columns`. Geprueft wird nur, wo der Sollstand
eine `spalten`-Liste fuehrt — die allgemeine Aussage bleibt sonst gueltig.

`[cmd]` Die Sollliste kommt aus der **Schrittdatei 053**, nicht aus der
laufenden Datenbank. Andernfalls bezoege die Pruefung ihren Sollwert vom
Prueflig und bestaetigte jeden Zustand.

### Die Pruefung wurde zum Fehlschlagen gebracht

`[read]` Eine Pruefung, die noch nie fehlgeschlagen ist, ist kein Beleg.

`[cmd]` Auf `lumeos_c37` wurde `daily_summary` verworfen und auf drei
Spalten verkuerzt neu angelegt. Die Pruefung meldet:

```
FEHLT:
  · Sichten: hydration_summary FEHLT — erzeugt von Schritt 056
  · Sicht daily_summary: 67 Spalten FEHLEN (item_count, enercc, prot625,
    fat, cho, fibt …) — Schritt 053

SCHEMA UNVOLLSTAENDIG — 2 Abweichung(en)
```

`[cmd]` Exit 1. Danach beide Sichten aus den Schrittdateien
wiederhergestellt.

`[cmd]` Nebenbefund aus diesem Versuch: PostgreSQL laesst
`CREATE OR REPLACE VIEW` **keine Spalten entfernen**
(`ERROR: cannot drop columns from view`). Anhaengen am Ende ist erlaubt —
genau das tut 053. Der Schritt bleibt damit idempotent, ohne `DROP VIEW`.
Wer spaeter eine Spalte in der **Mitte** einfuegen oder eine entfernen
will, braucht `DROP VIEW … CASCADE` und muss `hydration_summary`
mit wiederherstellen; `[cmd]` sie haengt daran.

`[cmd]` Ein zweiter, stiller Fund im Sollstand: `_bewusst_nicht_geprueft.grants`
behauptete, Grants wuerden nicht geprueft — seit C-42 stimmt das nicht
mehr. Der Eintrag ist jetzt richtiggestellt und als Spur erhalten.

---

## Kettenlauf und Abschlusspruefung

`[cmd]` Ueber den Runner, nicht als Einzelschritte:

```
pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts --database lumeos_c37 --keep-database
```

`[cmd]` Ergebnis: `KETTE OK: 32.0s`, `SCHEMA VOLLSTAENDIG`, Exit 0.
Darin die neue Zeile:

```
Sichten     2/2 mit security_invoker
Sichtspalten 1 Sicht(en) mit Spaltenliste geprueft
```

`[cmd]` Zwei Hinweise (keine Fehler) bleiben offen und gehoeren zu C-34,
nicht hierher: `foods_custom` und `custom_food_energy_plausibility`
stehen in der Datenbank, aber nicht im Sollstand.

`[cmd]` Sicherung vor der Aenderung:
`backup/schema/20260815_c37_vor_mikros.sql` (`--schema-only`).
Die Wegwerf-Datenbank `lumeos_c37` wurde nach der Auswertung verworfen.

---

## Was diese Sicht nicht sagt

**Sie summiert, was erfasst ist, und zaehlt, was fehlt. Ob die Summe
fuer einen Menschen ausreicht, sagt sie nicht.**

Das ist keine Bequemlichkeit, sondern der Datenlage geschuldet:
`[cmd]` 0 von 138 Naehrstoffen in `nutrient_defs` tragen einen RDA-Wert.
Die Spalten `rda_male`, `rda_female` und `rda_unit` existieren und sind
durchgaengig leer. `[read]` C-45 ist genau deshalb angehalten: es liegt
keine belegbare Quelle im Repo. Ohne Referenzwerte ist jede Bewertung
geraten, und eine geratene Bewertung ist schlimmer als keine — sie
sieht aus wie Wissen.

Deshalb fuehrt die Sicht ausdruecklich **nicht**:

- kein „Tagesziel erreicht", keinen Prozentwert, keinen Ampelzustand
- keine Bewertung einzelner Naehrstoffe
- keine Empfehlung

Weiter gilt, was schon fuer die Makros galt:

- **Eine Summe mit `<code>_missing > 0` ist eine Untergrenze, keine
  Wahrheit.** Wer sie ohne den Fehlzaehler anzeigt, zeigt eine zu
  niedrige Zahl als sicher an. Bei `ID` (Iodid, `[cmd]` 87,2 % Belegung)
  ist das der wahrscheinlichste Fall.
- **Die Sicht rechnet nicht gegen die Stammdaten.** Sie liest den
  eingefrorenen Schnappschuss aus `meal_items` (ADR-0003). Ein spaeter
  korrigierter BLS-Wert aendert die Tagessumme der Vergangenheit nicht.
  Ein Naehrstoff, der beim Erfassen fehlte, bleibt fuer diesen Tag
  fehlend, auch wenn er im Bestand inzwischen gepflegt ist.
- **Sie rechnet keine Einheiten um** und fuehrt keine mit. µg, mg und g
  stehen nebeneinander; die Zuordnung steht in `nutrient_defs`.
- **Sie summiert 24 der 138 Naehrstoffe.** Die uebrigen 114 stehen je
  Position im Schnappschuss und sind ueber diese Sicht nicht erreichbar.
- **Wasser ist hier nicht vollstaendig.** `water_g` ist das Wasser aus
  Lebensmitteln. Getrunkenes steht in `hydration_summary` (056).

## C-53: Warum drei und nicht elf

`[cmd]` Ausgangsmessung am 2026-08-16 gegen den laufenden Container:
`nutrition.daily_summary` hatte **70 Spalten**. Die im Auftrag genannte
Entscheidung "drei aufnehmen" traf fachlich zu, aber technisch war einer
der drei schon enthalten: `LEU` und `leu_missing` standen bereits in
`053_daily_summary.sql`, in `daten/schema-sollstand.json` und in
`059_daily_reference_assessment.sql`.

`[cmd]` Deshalb wurden in C-53 nur die zwei fehlenden Spaltenpaare
angehaengt: `f18_2cn6` / `f18_2cn6_missing` und `f18_3cn3` /
`f18_3cn3_missing`. Ergebnis: **74 Spalten**, nicht 76. Die letzten
Spalten der Sicht sind jetzt:

| Position | Spalte |
|---:|---|
| 69 | `aae9_missing` |
| 70 | `leu_missing` |
| 71 | `f18_2cn6` |
| 72 | `f18_2cn6_missing` |
| 73 | `f18_3cn3` |
| 74 | `f18_3cn3_missing` |

`[read]` Die Fettsaeurespalten stehen am Ende statt neben `fapun3` und
`fapun6`, weil PostgreSQL bei `CREATE OR REPLACE VIEW` keine Spalten in
der Mitte einfuegen kann. Anhaengen laesst die 70 alten Spalten in Name
und Reihenfolge unveraendert.

### Aufgenommen

| Code | Entscheidung | Grund |
|---|---|---|
| `F18:2CN6` Linolsaeure | aufgenommen | `[cmd]` Seit C-52 mit GO-04-Zielwert, EFSA AI 4 E%, Abdeckung 6.912 von 7.140 Lebensmitteln. Essenziell. |
| `F18:3CN3` Alpha-Linolensaeure | aufgenommen | `[cmd]` Seit C-52 mit GO-04-Zielwert, EFSA AI 0,5 E%, Abdeckung 6.719 von 7.140. Essenziell. |
| `LEU` Leucin | blieb aufgenommen | `[cmd]` War schon seit C-37 in der Sicht und Bewertung. Kraftsportrelevant, WHO/FAO-Referenzwert vorhanden. |

### Nicht aufgenommen

| Codegruppe | Entscheidung | Grund |
|---|---|---|
| 7 weitere Aminosaeuren | nicht aufgenommen | `[annahme]` Fuer die Kraftsport-Oberflaeche ist Leucin als Trigger-/Leitsignal plausibel; einzelne Ziele fuer Isoleucin, Valin, Lysin usw. waeren mehr Breite als Nutzen. Die Referenzwerte bleiben in `nutrient_reference_values`, aber nicht in der Tagessumme. |
| `NIAEQ` | nicht aufgenommen | `[read]` Rechengroesse fuer Niacinaequivalente; `NIA` steht bereits in der Sicht. Ein zweiter Niacinwert ohne klare Anzeigeentscheidung wuerde doppelt wirken. |

### Bewertung und C-48-Regeln

`[cmd]` `daily_reference_assessment` liest die Nährstoffliste fest
verdrahtet, nicht dynamisch aus der Sicht. C-53 hat die beiden
Fettsaeurecodes dort ergaenzt. Auf den C-82-Testdaten liefert die
Funktion jetzt **35 verschiedene Nährstoffcodes** und **47 Zeilen** fuer
Tom Miller am 2026-08-16; vor C-53 waren es 33 Codes und 45 Zeilen.

`[cmd]` Die Fettsaeuren erscheinen in der Bewertung, aber ohne
Prozentwert:

| Code | Wert | Status |
|---|---:|---|
| `F18:2CN6` | 8,22982 g | `energy_share` |
| `F18:3CN3` | 1,38572 g | `energy_share` |

Das ist kein Fehler. `[read]` GO-00 entschied, dass `E%` nicht als
Deckungsgrad in der Nährstoffbewertung angezeigt wird. Seit C-52 haben
die beiden Codes eigene GO-04-Zielwerte; die Ring-/Zielanzeige gehoert
dorthin, nicht in `daily_reference_assessment`.

`[cmd]` Der Leucin-Gegenbeleg aus einer Transaktion mit echtem
`daily_summary`-Weg: eine Position mit eingefrorenem `LEU = 1,70` und
Profilgewicht 78,4 kg liefert in `daily_summary` `leu = 1,70` und in
`daily_reference_assessment` `reference_value_min = 3,058 g`,
`reference_pct = 55,6`, `reference_status = complete`. Der Wert kommt
damit aus der Sicht, nicht aus einer Direktabfrage gegen `meal_items`.

### Nachweis

`[cmd]` Kettenlauf ueber den Runner auf `lumeos_c53_daily_summary`:
`KETTE OK: 35,7s`, `SCHEMA VOLLSTAENDIG`.

`[cmd]` `schema-vollstaendigkeit-pruefen.ts` gegen dieselbe
Wegwerf-Datenbank: Exit 0, `Sichtspalten 1 Sicht(en) mit Spaltenliste
geprueft`.

`[cmd]` C-82-Testdaten auf derselben Wegwerf-Datenbank: 3 Nutzer, 512
Mahlzeiten, 1.560 Positionen. `testdaten-pruefen.ts` laeuft weiter
durch; die Szenariotage halten. Die Ausgabe meldet jetzt
`daily_reference_assessment: 47 Zeilen, 30 mit Prozentwert` — zwei
Zeilen mehr, aber keine neuen Prozentwerte, weil beide Fettsaeuren
`energy_share` sind.
