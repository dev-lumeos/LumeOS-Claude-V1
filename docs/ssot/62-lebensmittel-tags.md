# Lebensmittel-Tags C-44

Stand: 2026-08-15.

`[cmd]` Dieser Schritt hat keine Datenbank verändert. Es wurden nur eine
Datendatei, ein Prüfskript und dieser Bericht angelegt bzw. korrigiert.

Dateien:

- `supabase/_pipeline/daten/lebensmittel-tags.jsonl`
- `supabase/_pipeline/_validierung/lebensmittel-tags-pruefen.ts`
- `docs/ssot/62-lebensmittel-tags.md`

---

## Ausgangslage

`[cmd]` Der Bestand enthält 7.140 Lebensmittel.

`[cmd]` Von 16 definierten Tags sind in der Datenbank heute nur vier
vergeben: `low_carb` 4.659, `low_fat` 2.648, `high_protein` 1.400,
`high_fiber` 558. Die übrigen zwölf stehen bei 0.

`[read]` Tom hat am 2026-08-15 entschieden, dass Allergie- und
Ausschlussfilter in Nutrition Suchvereinfachungen sind. Markiert wird deshalb
die positive Belastung, nicht die behauptete Freiheit davon.

`[cmd]` Die Datendatei verwendet diese vorbereiteten Codes:

| bisheriger Tag | vorbereiteter Tag |
|---|---|
| `nut_free` | `contains_nuts` |
| `gluten_free` | `contains_gluten` |
| `lactose_free` | `contains_lactose` |

`[cmd]` `nutrition.foods.processing_level` steht bei allen 7.140 Einträgen
auf `raw`, auch bei verarbeiteten Produkten. Die Spalte wurde nicht als Quelle
verwendet.

`[cmd]` `name_th` ist bei 0 von 7.140 Lebensmitteln gefüllt; Thai-Aliase gibt
es ebenfalls 0. `thai_food` bleibt leer.

---

## Korrektur: Verarbeitungsgrad nach NOVA

`[cmd]` Der erste C-44-Stand vergab `processed_food` an 5.973 von 7.140
Einträgen, also 84 %. `[annahme]` Das trennte nicht ausreichend, weil
„verarbeitet" ohne NOVA-Definition auch Kochen und einfache Zubereitung
einschließt.

`[read]` Entscheidung Tom, 2026-08-15: Anlehnung an NOVA und Markierung der
Ränder statt der Mitte.

`[cmd]` Korrektur in der Datei:

| Änderung | Ergebnis |
|---|---:|
| `processed_food` entfernt | 0 |
| `spicy` entfernt | 0 |
| `mediterranean` entfernt | 0 |
| `whole_food` neu | 2.884 |
| `ultra_processed` nachgeprüft | 927 |
| Zeilen mit mindestens einem Tag | 5.150 |
| bewusst unmarkiert | 1.990 |

`[cmd]` `whole_food` und `ultra_processed` kommen in 0 Zeilen gemeinsam vor.

---

## Datendatei

Format je Zeile:

```json
{"bls_code":"H120100","tags":[{"tag":"contains_nuts","grund":"Nuss/Erdnuss im Namen"},{"tag":"vegan","grund":"pflanzliche Warengruppe"},{"tag":"vegetarian","grund":"pflanzliche Warengruppe"},{"tag":"whole_food","grund":"NOVA 1/2: Grundnahrungsmittel oder kulinarische Zutat"}]}
```

`[cmd]` Vergebene Tags:

| Tag | Lebensmittel |
|---|---:|
| `whole_food` | 2.884 |
| `vegetarian` | 1.751 |
| `vegan` | 1.377 |
| `contains_lactose` | 1.021 |
| `ultra_processed` | 927 |
| `contains_gluten` | 622 |
| `contains_nuts` | 120 |

`[cmd]` Nicht vergeben: `thai_food`, `halal`, `kosher`,
`processed_food`, `spicy`, `mediterranean`.

---

## Messung je Warengruppe

`[cmd]` Zeilen mit mindestens einem Tag und wichtigste Tag-Zahlen:

| WG | Zeilen mit Tags | wichtigste Tags |
|---|---:|---|
| B | 163 | Gluten 161 |
| C | 229 | whole 174, vegan 227, Gluten 108 |
| D | 304 | Gluten 209, Laktose 100, ultra 53 |
| E | 104 | vegetarisch 96, whole 74, Gluten 64 |
| F | 275 | vegan 275, whole 198 |
| G | 560 | vegan 558, whole 516 |
| H | 141 | vegan 141, whole 109, Nüsse 41 |
| K | 157 | vegan 153, whole 143 |
| M | 279 | Laktose 279, vegetarisch 278, whole 58 |
| N | 72 | whole 25, ultra 25, Laktose 22 |
| P | 18 | ultra 10, Gluten 8 |
| Q | 55 | whole 47, vegan 23 |
| R | 61 | Laktose 24, ultra 21, whole 20 |
| S | 253 | ultra 253 |
| T | 442 | whole 432 |
| U | 633 | whole 633 |
| V | 456 | whole 455 |
| W | 375 | ultra 375 |
| X | 347 | Laktose 293, ultra 66 |
| Y | 226 | Laktose 168, ultra 50 |

---

## Warum die Mitte unmarkiert bleibt

`[read]` NOVA 1 und 2 sind unverarbeitete/minimal verarbeitete Lebensmittel
und kulinarische Zutaten. NOVA 4 sind hochverarbeitete Produkte. NOVA 3 ist
die Mitte: verarbeitet, aber nicht zwingend hochverarbeitet.

`[annahme]` Der BLS enthält keine Zutatenlisten und keine Zusatzstofflisten.
Damit lässt sich NOVA am Bestand nur grob bestimmen. Warengruppe,
Zubereitungscode und Name reichen für die Ränder: `Apfel roh` ist NOVA 1,
`Olivenöl` ist NOVA 2, `Pizza Margherita` als Fertiggericht ist NOVA 4.
Sie reichen nicht zuverlässig, um jede Konserve, jedes gezuckerte Produkt
oder jedes Brot zwischen NOVA 3 und NOVA 4 zu trennen.

`[cmd]` 1.990 Lebensmittel stehen bewusst ohne Zeile in der Datendatei oder
ohne Verarbeitungs-Randtag. Diese Einträge sind NOVA 3 oder ungeklärt.

`[cmd]` Pflichtfälle nach der Korrektur:

| Code | Fall | Ergebnis |
|---|---|---|
| `F110100` | Apfel roh | trägt `whole_food` |
| `C352000` | Reis poliert, roh | trägt `whole_food` |
| `Q120000` | Olivenöl | trägt `whole_food` |
| `B101000` | Vollkornbrot | trägt weder `whole_food` noch `ultra_processed` |
| `F090100` | Fruchtmischung gezuckert, roh | trägt kein `whole_food` |
| `X912033` | Pizza Margherita | trägt `ultra_processed` |

`[annahme]` Strittige Mitte: Brot, Käse, Konserven, gezuckerte Früchte,
Fruchtsäfte, geräucherte oder gepökelte Einzelprodukte. Sie wurden nicht mit
`whole_food` markiert. Wo kein klarer NOVA-4-Beleg im Namen stand, bekamen sie
auch kein `ultra_processed`.

---

## Prüfskript

`[cmd]` Angelegt und korrigiert:
`supabase/_pipeline/_validierung/lebensmittel-tags-pruefen.ts`.

`[cmd]` Aufruf:

```powershell
pnpm exec tsx supabase/_pipeline/_validierung/lebensmittel-tags-pruefen.ts
```

`[cmd]` Ergebnis: Exit 0.

Das Skript prüft:

- gültiges JSONL, eindeutige `bls_code`
- `tags` als nicht-leeres Array mit `tag` und `grund`
- keine alten Free-Tags `nut_free`, `gluten_free`, `lactose_free`
- keine zurückgezogenen Tags `processed_food`, `spicy`, `mediterranean`
- kein `thai_food`
- `whole_food` und `ultra_processed` nie gemeinsam
- Pflichtfälle für Allergene, Vegan/Vegetarisch und NOVA-Ränder

---

## Wo ich raten musste

`[annahme]` Bei Allergenen ist die größte Unsicherheit nicht der positive
Treffer, sondern die Nichtvergabe. Ein Lebensmittel ohne `contains_nuts`,
`contains_gluten` oder `contains_lactose` ist nicht als frei davon kuratiert;
es ist nur nicht positiv belegt.

`[annahme]` `contains_lactose`: Käse, Butter und Milchfett wurden als
Laktose-Risikofälle markiert, obwohl gereifte Käse und Butterschmalz praktisch
laktosearm sein können. Für einen Ausschlussfilter ist die konservative
Richtung vertretbar, aber nicht fein genug für medizinische Sicherheit.

`[annahme]` `contains_gluten`: Hafer wurde nicht pauschal als glutenhaltig
markiert. Markiert wurden belegte glutenhaltige Getreide und Produkte wie
Weizen, Roggen, Gerste, Dinkel, Couscous, Backteig und Mürbeteig.

`[annahme]` `contains_nuts`: Erdnuss wurde mitgeführt, obwohl sie botanisch
eine Hülsenfrucht ist. Für Nutzer, die einen Nuss-/Erdnuss-Ausschlussfilter
setzen, ist die gemeinsame Ausschlussrichtung plausibler als eine botanische
Trennung.

`[annahme]` `vegan` und `vegetarian`: Sicher positiv sind pflanzliche
Warengruppen und pflanzliche Öle, solange kein tierischer Bestandteil im Namen
steht. Fertiggerichte, Backwaren und Süßwaren wurden nicht automatisch vegan
markiert, auch wenn einzelne davon vegan sein können.

---

## Welche Tags im BLS-Bestand nicht funktionieren

`[cmd]` `thai_food` funktioniert im BLS-Bestand nicht: 0 Thai-Namen und 0
Thai-Aliase. Der Tag gehört zu eigenen Einträgen oder einer späteren
Kuration, nicht zur BLS-Grunddatei.

`[annahme]` `halal` und `kosher` funktionieren aus dem BLS-Namen nicht. Dafür
bräuchte es Zertifizierung, Herkunft oder Schlacht-/Produktionsinformation.
Diese Information steht im Bestand nicht.

`[cmd]` `spicy` hatte 11 Treffer und `mediterranean` 15 Treffer. Beide Tags
wurden nach Toms Entscheidung entfernt: Der BLS trägt Gewürz- und
Küchenstil-Informationen nicht ausreichend; das wäre eine Zufallsliste, kein
Filter.

---

## Was dieser Schritt nicht tut

- Kein `INSERT` in `nutrition.food_tags`.
- Kein Kettenschritt und kein Kettenneuaufbau.
- Keine Änderung an `tag_definitions`.
- Keine Änderung an `processing_level`.
- Keine medizinische Allergensicherheit.
- Keine vollständige NOVA-Klassifikation. Die Datei markiert nur die belegten
  Ränder.
