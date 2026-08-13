# BLS-Datendatei: was importiert wurde und was nicht

`[cmd]` Erhoben 2026-08-14 aus `docs/ssot/daten/BLS_4_0_Daten_2025_DE.xlsx`
(13,8 MB, 7.141 Zeilen, 418 Spalten). Ergänzt `45-bls-dokumentation.md`.

## Katalog vollständig, Werte nicht

Zwei Tabellen, zwei Quellen, zwei Ergebnisse:

| | Quelle | Stand |
|---|---|---|
| `nutrient_defs` (Katalog) | `BLS_4_0_Components_DE_EN.xlsx` | `[cmd]` **138 von 138** |
| `food_nutrients` (Werte) | `BLS_4_0_Daten_2025_DE.xlsx` | `[cmd]` **108 von 138** |

Der Katalog trägt alle 138 Codes mit Name, Einheit, Gruppe, Formel und
`is_always_computed`. **Für 30 davon existiert keine einzige Wertzeile.**

`[cmd]` Der Fremdschlüssel `food_nutrients.nutrient_code → nutrient_defs.code`
erklärt, warum das nie auffiel: die Definitionen sind da, die Beziehung ist
gültig, nichts bricht. Es fehlen nur Zeilen, die niemand vermisst hat.

## Die 30 fehlenden sind alle Einzelfettsäuren

`[cmd]` 171.409 Werte, 19,7 % des Bestands. Die häufigsten:

| Code | Werte | |
|---|---|---|
| `F16:0` | 7.110 | Palmitinsäure |
| `F18:0` | 7.088 | Stearinsäure |
| `F18:2CN6` | 6.912 | Linolsäure |
| `F18:1CN9` | 6.831 | Ölsäure |
| `F18:3CN3` | 6.719 | Alpha-Linolensäure |
| `F22:6CN3` | 6.534 | **DHA** |
| `F20:5CN3` | 6.498 | **EPA** |
| `F4:0` | 4.907 | Buttersäure |

Vollständig: alle 36 Fettsäurecodes des BLS minus die sechs
Summenparameter.

**Die Summen sind vorhanden** — `FASAT`, `FAMS`, `FAPU`, `FAPUN3`,
`FAPUN6`. Praktisch heisst das: *Omega-3 gesamt ja, EPA und DHA einzeln
nein.*

### Vermutete Ursache

`[cmd]` Alle 30 fehlenden Codes tragen einen **Doppelpunkt** (`F4:0`,
`F18:1CN9`, `F20:5CN3`). Keiner der 108 importierten tut das.

`[Wahrscheinlich]` Der Importweg hat sie am Doppelpunkt zerlegt oder
verworfen. Es ist die einzige Eigenschaft, die alle dreissig teilen und
keiner der übrigen. **Ungeprüft** — der Importweg selbst wurde nicht
untersucht.

### Wie dringend

`[cmd]` Heute unkritisch: Diary und Tagessumme rechnen mit `ENERCC`,
`PROT625`, `FAT`, `CHO`, `WATER` — alle vorhanden. Es fällt auf, sobald
jemand nach Omega-3, EPA oder gesättigten Einzelfettsäuren filtert oder
anzeigt.

## Datenherkunft: nicht importiert, und was das kostet

`[read]` Der BLS liefert **je Datenpunkt** eine Herkunftsangabe plus eine
Referenzspalte — 13 Kategorien, vom MRI als zentrales Qualitätsmerkmal
bezeichnet. `[cmd]` Beispiel aus der Datei:

```
C131000  Hafer ganzes Korn, roh
  ENERCJ  1443    Formelberechnung   -
  WATER   11.45   Literatur          Biel, W., et al.; Chemical composition
                                     and nutritive value of husked and naked
                                     oats grain.; J Cereal Science; 2009
```

`[cmd]` Verteilung über alle 985.320 Datenpunkte:

| Herkunft | | Anteil |
|---|---|---|
| Rezeptberechnung | 582.569 | **59,1 %** |
| Formelberechnung | 142.395 | 14,5 % |
| fehlender Wert (`-`) | 110.083 | 11,2 % |
| Musterberechnung | 28.073 | 2,8 % |
| Nährstoffdatenbank | 25.486 | 2,6 % |
| **Analyse** | **24.066** | **2,4 %** |
| Reskalierung | 22.957 | 2,3 % |
| Übernommener Wert | 19.451 | 2,0 % |
| **Logische Null** | 18.566 | 1,9 % |
| Literatur | 5.177 | 0,5 % |
| Aggregation | 4.106 | 0,4 % |
| **Spuren** (`TR`) | 1.806 | 0,2 % |
| Labelangabe | 454 | 0,05 % |
| Logische Annahme | 38 | 0,004 % |

Dazu `[cmd]` 2.733 `<LOD` und 1.138 `<LOQ` — unterhalb der Nachweis- bzw.
Bestimmungsgrenze.

`[Sicher]` **Nur 2,4 % sind Laboranalysen.** Fast sechzig Prozent sind aus
Einzelzutaten gerechnet. Das ist keine Kritik am BLS — es steht so in der
Dokumentation und ist international üblich —, aber es ist etwas, das ein
Nutzer wissen sollte, der Makros auf zwei Stellen genau bilanziert.

`[cmd]` `food_nutrients.data_source` trägt bei allen 698.092 Zeilen
denselben Wert `bls_4_0_local_import` — unser Importvermerk, nicht die
BLS-Herkunft.

### Drei Fälle, die wir dadurch nicht unterscheiden können

**Logische Null gegen echte Null.** `[cmd]` 18.566 Datenpunkte stehen als
`0` mit der Herkunft *Logische Null* — der Nährstoff kommt biologisch nicht
vor (Retinol in Pflanzen). `[cmd]` Wir haben 154.775 Nullwerte in der
Datenbank; welche davon logisch sind und welche gemessen, ist nicht mehr
feststellbar.

**Spuren.** `[cmd]` 1.806 Werte stehen als `TR`: nachgewiesen, Menge
unbekannt, **grösser als null**. Wir haben sie verworfen — als hätte es sie
nicht gegeben. `[read]` Die Dokumentation empfiehlt, sie je nach Anwendung
als konservative Schätzung einzubeziehen.

**Unterhalb der Nachweisgrenze.** `[cmd]` 3.871 Werte als `<LOD`/`<LOQ` —
ebenfalls verworfen.

### Was wir richtig gemacht haben

`[read]` Wörtlich aus der Dokumentation:

> **Fehlender Wert ≠ Null:** Ein fehlender Wert bedeutet nicht, dass der
> Nährstoff nicht vorhanden ist.

`[cmd]` Die 110.083 fehlenden Werte (`-`) wurden korrekt **nicht** als 0
importiert, sondern weggelassen. Und `diary-model.ts` behandelt fehlende
Nährwerte seit C-03 als `incompleteFields` statt als 0, die Tagessumme aus
C-04 trägt `<makro>_missing`. **Diese Entscheidung ist damit offiziell
gedeckt, nicht nur plausibel.**

## Offen

1. **Die 30 Fettsäuren nachimportieren.** Die Datei liegt unter
   `docs/ssot/daten/`. Vorher die Ursache belegen, nicht nur die Vermutung
   zum Doppelpunkt übernehmen.
2. **Datenherkunft übernehmen** — mindestens `Logische Null`, `Spuren` und
   `<LOD`/`<LOQ`, weil diese drei die Bedeutung eines Wertes verändern.
   Ob die volle 13-Kategorien-Angabe und die Referenztexte mitkommen, ist
   eine eigene Entscheidung (Speicher gegen Nutzen).
3. **Anzeigefrage:** Soll ein Nutzer sehen, ob ein Wert gemessen oder
   gerechnet ist? `[cmd]` Bei 2,4 % Analysen wäre ein Abzeichen an den
   gemessenen Werten aussagekräftiger als eines an den gerechneten.
