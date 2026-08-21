# 164 - Naehrstoffbaum

Stand: 2026-08-21  
Anlass: C-161 plus Nachtrag zur gespeicherten Ansicht

## Wie der Baum aussieht

`[cmd]` `nutrition.nutrient_defs` hat jetzt `parent_code` als
Fremdschluessel auf `nutrition.nutrient_defs(code)`. Die 138 Codes sind
vollstaendig erfasst: **40 Wurzeln** und **98 Kinder**.

`[read]` `display_tier` bleibt Anzeigeprioritaet, nicht Hierarchie. Die
Anzeige darf nicht mehr aus Stufe und Sortierung ableiten, welcher Wert
unter welchem steht.

Die grossen Aeste:

| Ast | Kinder |
|---|---:|
| `FASAT` | 13 |
| `AAE9` | 11 |
| `PROT625` | 9 |
| `FAMS` | 6 |
| `OA`, `VITE`, `FAPUN3`, `FAPUN6` | je 5 |
| `FAT`, `CHO`, `FIBT`, `VITA` | je 4 |
| `POLYL`, `MNSAC`, `DISAC`, `FAPU` | je 3 |

`[cmd]` Die Beispiele aus dem Befund sind korrigiert:

| Code | Lage |
|---|---|
| `CLD` Chlorid | Wurzel, nicht Kind von Natrium |
| `S` Schwefel | Wurzel, nicht Kind von Phosphor |
| `CU` Kupfer | Wurzel, nicht Kind von Iodid |
| `MN` Mangan | Wurzel, nicht Kind von Iodid |
| `RETOL`, `CARTB`, `CAROTPAXB` | unter `VITA` |

`[cmd]` Die Prueffunktion `nutrition.nutrient_tree_value_anomalies()`
liefert fuer `dev@lumeos.app` am heutigen Tag **0** Treffer. Bei
Formelbeziehungen wird der Beitrag verglichen, nicht die rohe Menge:
`CARTB` steht unter `VITA`, zaehlt dort aber als `1/6*CARTB`.

## Wo Stufe und Beziehung sich widersprechen

`[cmd]` Ein Widerspruch bleibt sichtbar: `NIA` hat `display_tier = 1`,
sein Elternknoten `NIAEQ` hat `display_tier = 2`.

`[read]` Das ist ein Datenbefund, kein Grund, den Baum zu verbiegen.
`NIAEQ` ist die bewertbare Bezugsform; `NIA` hat laut
`nutrient_reference_values` `NO_STANDALONE_REFERENCE` plus eine
separate UL-Zeile.

Verteilung nach Stufe:

| Stufe | Wurzeln | Kinder | gesamt |
|---|---:|---:|---:|
| 1 | 28 | 3 | 31 |
| 2 | 8 | 39 | 47 |
| 3 | 4 | 56 | 60 |

`[annahme]` Die Stufen werden erst kuratiert, wenn die Anzeige konkret
zeigt, welche Werte dadurch falsch priorisiert werden. Fuer C-161 war
die echte Elternbeziehung der Blocker.

## Was die Erklaerungen tragen

`[cmd]` Quelle:
`referenz/lumeos-2026/apps/app/modules/nutrition/data/nutrientDetails.ts`
mit **114** Schluesseln.

Importiert wurden **110** Zeilen in `nutrition.nutrient_details`:

| Art | Zahl |
|---|---:|
| exakte Schluessel gegen `nutrient_defs.code` | 107 |
| Legacy-Mapping ohne exakten Zielcode | 3 |
| Legacy-Mapping durch exakten Zielcode ersetzt | 3 |
| ohne Zielcode | 1 (`SE`) |
| `nutrient_defs` ohne Detailtext | 28 |

Die drei importierten Legacy-Mappings:

| Alt | Neu |
|---|---|
| `F18D2N6` | `F18:2CN6` |
| `F20D5N3` | `F20:5CN3` |
| `F22D6N3` | `F22:6CN3` |

`[read]` `rda_standard` und `rda_athlete` bleiben Text. Sie werden
nicht als Zielwerte interpretiert, weil die Einheiten und Quellen nicht
streng genug sind. Beispiele, die gegen die EFSA-/WHO-/US-Referenzen
auffallen: Vitamin A (`900/700 µg` im alten Text gegen EFSA
`750/650 µg`), Eisen (`8/18 mg` gegen EFSA `11/16 mg`), Natrium
(`<2300 mg` gegen EFSA `2000 mg`) und Ballaststoffe (`25-38 g` gegen
EFSA `25 g AI`).

`[read]` Die Texte beschreiben Funktionen, Mangel-/Ueberschusslagen,
Quellen, Tipps und Interaktionen. Sie sind Anzeigeinhalt, keine Diagnose
und keine neue Referenzwertquelle.

## Warum nur 31 ein Ziel haben

`[cmd]` Vor C-161 war die Bewertung technisch auf die breite
`daily_summary`-Liste begrenzt. Live vor der Umstellung kamen 35 Codes
in `daily_reference_assessment` an; Tom hatte den Zielwert-Befund mit
31 beschrieben. Nach der Umstellung liest die Funktion
`daily_nutrient_summary_long` und liefert **138 Codes**.

Am heutigen Tag fuer `dev@lumeos.app`:

| Lage je Code | Zahl |
|---|---:|
| `complete` mit Prozentwert | 45 |
| `incomplete_day_values` | 79 |
| `not_applicable` | 9 |
| `energy_share` | 3 |
| `nutrient_density` | 2 |

`[cmd]` `FAT` und `CHO` haben in `nutrient_reference_values` weiterhin
nur Energieprozent (`RI`), `FASAT` `ALAP` als Energieanteil. In
`goals.zielwerte_am()` sind Grammwerte ableitbar und vorhanden
(`2500 kcal`, `313 g` Kohlenhydrate, `75 g` Fett). Die
Naehrstoffbewertung zeigt sie trotzdem nicht als `reference_pct`, weil
GO-00 Energieanteile bewusst aus dieser Funktion herausgenommen hat.
Das ist eine Tom-Entscheidung, kein fehlender Nenner.

`[cmd]` `THIA` und `NIAEQ` bleiben `nutrient_density`, weil ihre
Referenzen je Megajoule stehen. Ohne Entscheidung, dass
Naehrstoffdichte als Zielanzeige gelten soll, wird daraus kein
Tages-Prozentwert.

## Wo die Ansicht gespeichert wird

`[cmd]` Neue Tabelle: `public.user_display_preferences`.

Form:

| Spalte | Zweck |
|---|---|
| `user_id` | Profilbezug, RLS-Schluessel |
| `preference_key` | z. B. `nutrition.nutrient_tree` |
| `value jsonb` | offene Knoten, Zeitfenster, Filter |

`[read]` Die Tabelle ist allgemein, nicht auf Naehrstoffe verengt. Der
Naehrstoffbaum startet ohne Zeile mit “alles zu”; sobald der Nutzer eine
Ansicht aendert, speichert die Oberflaeche den Zustand unter einem Key.

`[cmd]` Zeilenschutz: RLS aktiv, vier Policies. Im SQL-Test konnte
`dev@lumeos.app` `nutrition.nutrient_tree` schreiben und lesen;
`test-user@lumeos.local` sah **0** Zeilen. Die Testzeile wurde danach
wieder entfernt.

## Nachweis

`[cmd]` Kettenlauf gegen Wegwerf-Datenbank `lumeos_c161_check`: Exit 0,
inklusive Abschlusspruefung.

`[cmd]` Live:

- `schema-vollstaendigkeit-pruefen.ts`: Exit 0.
- `testdaten-pruefen.ts`: Exit 0.
- `daily_reference_assessment`: 154 Zeilen, 45 mit Prozentwert.
- `nutrient_tree_value_anomalies(dev, current_date)`: 0 Zeilen.

`[cmd]` Der Kettenlauf erzeugte wie ueblich ein Schema-Backup unter
`backup/schema/`; es wurde nicht gestaged.
