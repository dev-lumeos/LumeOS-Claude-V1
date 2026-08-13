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

1. **Die 30 Fettsäuren nachimportieren.** — **erledigt 2026-08-14.**
   Kettenschritt `031_fettsaeuren_nachtrag.sql`, Archiv
   `supabase/_data/bls_4_0_fettsaeuren.zip`, Validierung `v031`.
   `[cmd]` Live 138 Codes, 869.501 Werte, acht von acht Prüfungen grün.
   Ursache belegt: die CSV im Zip trug bereits nur 108 Codes und exakt
   698.092 Zeilen — der Datenbankimport war vollständig, der Verlust
   passierte beim Erzeugen der CSV aus der Arbeitsmappe.
   Stärkster Beleg für die Richtigkeit: `[cmd]` `FASAT` gegen die Summe
   seiner dreizehn Einzelwerte stimmt bei **7.108 von 7.111**
   Lebensmitteln. Die drei Abweichungen sind erwartbar — `[read]` `FASAT`
   gilt als *immer berechnet* und kann aus anderer Quelle stammen.

2. **Bestand vollständig geprüft** — **erledigt 2026-08-14.**
   `[cmd]` Alle 698.092 vorhandenen Werte gegen die amtliche
   Arbeitsmappe verglichen: 353 Abweichungen, **alle Rundungen auf die
   fünfte Nachkommastelle** (0.79074 gegen 0.790735) — die Genauigkeit
   unserer Spalte, kein Datenfehler. **Null inhaltliche Abweichungen.**

3. **Datenherkunft nachimportieren — entschieden 2026-08-14 (Tom):
   wird nicht gemacht.** Die Begründung, weil der Punkt oben grösser
   klang als er ist:
   - **Spuren und unterhalb der Nachweisgrenze**: `[cmd]` zusammen 5.677
     Datenpunkte, **0,58 %**. `[read]` Der BLS beziffert sie selbst
     nicht — ein Wert, den die Quelle nicht kennt, hilft bei einer
     Tagesbilanz nicht.
   - **Logische Null**: `[cmd]` steht als `0` in der Quelle und als `0`
     bei uns. Der Wert ist in beiden Fällen richtig; die Unterscheidung
     wäre nur für eine Herkunftsanzeige interessant, nicht für eine
     Rechnung. Retinol in Pflanzen ist null, wie auch immer gekennzeichnet.
   - **Was wirklich zählte, stimmt bereits**: `[cmd]` Die 110.083
     fehlenden Werte wurden **nicht** als 0 importiert. Das ist die eine
     Unterscheidung, die eine Tagessumme verfälschen würde — im Import
     wie in `diary-model.ts` (`incompleteFields`) und in der Tagessumme
     (`<makro>_missing`).

   Wiedervorlage nur, falls eine Anzeige „gemessen gegen gerechnet"
   gewünscht wird. `[cmd]` Dann wäre die Zahl, die es lohnt: nur **2,4 %**
   der Werte sind Laboranalysen, 59,1 % Rezeptberechnung.
