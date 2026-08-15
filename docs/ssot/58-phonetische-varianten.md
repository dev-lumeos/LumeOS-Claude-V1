# Phonetische Varianten C-22

Stand: 2026-08-15.

`[cmd]` Dieser Durchgang hat nur gemessen und vorbereitet. Es gab kein
`INSERT`, kein `UPDATE`, keinen Kettenschritt, keinen Kettenneuaufbau, keinen
Commit und keinen Push.

Dateien:

- `supabase/_pipeline/daten/phonetische-varianten.json`
- `supabase/_pipeline/_validierung/phonetische-varianten-messen.ts`
- `docs/ssot/58-phonetische-varianten.md`

`[read]` C-22 verlangt eine Messung vor dem Bauen: Wie viele Bestandswörter
tragen überhaupt die Lautpaare `c/k`, `f/ph`, `i/y`, `t/th`, `k/ck`,
`s/ss/z`.

`[read]` Die Regel gehört auf die Anfrageseite und darf nur greifen, wenn die
normale Suche nichts findet. Sie ist kein Synonym: `Korn` und `Corn` sind
verschiedene Wörter.

---

## Lohnt sich die Regel?

`[cmd]` Aktuelle Messbasis:

```powershell
with tokens as (
  select regexp_split_to_table(nutrition.search_fold(name_de), '[^a-z0-9]+') w
  from nutrition.foods
), words as (
  select distinct w from tokens where length(w) >= 4
)
select count(*) from words;
```

`[cmd]` Ergebnis: 3.616 Bestandswörter. Die ältere C-22-Notiz nennt 3.656;
der aktuelle Live-Bestand misst 3.616.

`[cmd]` Lautpaar-Messung auf diesen 3.616 Tokens:

| Lautpaar | trägt Lautpaar | tatsächlich verwechselbar |
|---|---:|---:|
| `c`/`k` | 2.088 | 196 |
| `f`/`ph` | 800 | 2 |
| `i`/`y` | 1.839 | 53 |
| `t`/`th` | 1.722 | 21 |
| `k`/`ck` | 1.271 | 229 |
| `s`/`ss`/`z` | 2.317 | 684 |

`[annahme]` Die Spalte "tatsächlich verwechselbar" ist eng gezählt: nicht
jedes `k` oder `s`, sondern Schreibbilder, bei denen eine echte Nutzeranfrage
plausibel ist, zum Beispiel `cornflakes` -> `kornflakes`, `physalis` ->
`fysalis`, `thunfisch` -> `tunfisch`, `cracker` -> `kracker`, `sosse` ->
`sose`.

`[cmd]` Vorher-Prüfung:

```powershell
pnpm exec tsx supabase/_pipeline/_validierung/phonetische-varianten-messen.ts
```

`[cmd]` Ergebnis, erwartungsgemäß Exit 1:

| Kennzahl | Wert |
|---|---:|
| Abnahmebegriffe | 7 |
| Referenzbegriff auf Platz 1 | 7 |
| Variante auf Platz 1 | 2 |
| Variante in Top 10 | 2 |
| Variante ohne Treffer | 5 |

`[cmd]` Einzelfälle:

| Variante | Referenz | Sollcode | Ist |
|---|---|---|---|
| `kornflakes` | `cornflakes` | `C515000` | leer |
| `yoghurt` | `joghurt` | `M141100` | leer |
| `brokkoli` | `broccoli` | `G312100` | Platz 1 |
| `fysalis` | `physalis` | `F552100` | leer |
| `tunfisch` | `thunfisch` | `T121100` | Platz 1 |
| `kracker` | `cracker` | `D050000` | leer |
| `sose` | `sosse` | `R911000` | leer |

`[annahme]` Die Regel lohnt sich, aber nur als Nulltreffer-Fallback. Fünf von
sieben vorbereiteten Varianten bleiben heute leer, während alle sieben
Referenzbegriffe den erwarteten Code auf Platz 1 liefern. Eine breite
Sucherweiterung bei jeder Anfrage wäre zu riskant.

---

## Wo die Regel schaden würde

`[read]` C-22 nennt den Kernschaden: `Korn` darf nicht zu `Corn` werden,
weil `Korn` im Deutschen ein eigenes Lebensmittelwort ist.

`[cmd]` `kola` liefert heute bereits Treffer, aber nicht Cola auf Platz 1:
oben steht `C532100` Vollmilchschokolade mit Puffreis und Crispies. Eine
pauschale `k` -> `c`-Regel würde hier die Bedeutung verschieben.

`[cmd]` `citrone` liefert heute bereits einen Treffer: `R552000`
Zitronensäure. Ein Fallback auf `zitrone` darf deshalb nicht greifen, solange
die normale Suche nicht leer ist.

`[annahme]` Gegenbeispiele je Regel:

| Regel | Schaden |
|---|---|
| `k` -> `c` | `Korn`, `Kohl`, `Kohlrabi`, `Karotte`, `Kalb` sind deutsche Wörter; `Cohl`, `Calb` oder `Corn` wären falsch. |
| `f` -> `ph` | `Fisch`, `Fett`, `Filet`, `Fenchel` dürfen nicht zu `Phisch`, `Phett`, `Philet`, `Phenchel` werden. |
| `y` -> `i` / `i` -> `y` | `Reis`, `Milch`, `Rind`, `Sirup` sind keine Kandidaten für freie y-Schreibung. |
| `t` -> `th` | `Tomate`, `Toast`, `Torte`, `Teig`, `Tee` dürfen nicht mit `th` variiert werden. |
| `k` -> `ck` | `Kartoffel`, `Kalb`, `Karotte`, `Kohl`, `Kabeljau` sind keine ck-Kandidaten. |
| `s`/`ss`/`z` | `Salat`, `Sahne`, `Schinken`, `Wurst` dürfen nicht frei zu `Zalat`, `Ssahne` oder ähnlichem werden. |

`[annahme]` Die spätere Implementierung sollte deshalb nicht "alle Zeichen
ersetzen", sondern die vorbereiteten Regeln als eng begrenzte
Nulltreffer-Varianten nutzen. Die Gegenbeispiele gehören in Tests, nicht nur
in Dokumentation.

---

## Vorbereitete Datendatei

`[cmd]` `supabase/_pipeline/daten/phonetische-varianten.json` enthält:

- die Messbasis und Lautpaarzahlen
- sechs vorbereitete Regeln
- Beispiele mit Ziel-`bls_code`
- Gegenbeispiele je Regel
- sieben Abnahmefälle

`[annahme]` `brokkoli` und `tunfisch` sind bereits gelöst, bleiben aber als
Schutzfälle in der Datendatei: eine spätere Fallback-Implementierung darf sie
nicht verschlechtern.

---

## Nicht Teil dieses Schritts

`[cmd]` `basmatireis` liefert weiterhin 0 Treffer.

`[read]` Für `basmatireis` liegt die Zuordnung bereits in
`supabase/_pipeline/daten/reis-alias-kuration.json`. C-22 fasst diese Datei
nicht an.

`[cmd]` `griechischer joghurt` liefert weiterhin 0 Treffer.

`[read]` `griechischer joghurt` bleibt offen. Der vorgeschlagene Ersatz
`M141100` hat 0,1 g Fett und ist damit fachlich nicht automatisch passend für
griechischen Joghurt mit 5 bis 10 g Fett.

`[annahme]` Dieser Schritt bereitet nur die Anfrageseite vor. Die spätere
Umsetzung läge nahe bei `apps/web/src/lib/nutrition/food-search.ts`, wurde in
diesem Auftrag aber ausdrücklich nicht gebaut.
