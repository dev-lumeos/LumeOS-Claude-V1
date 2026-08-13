# BLS 4.0: was die offizielle Dokumentation hergibt

`[read]` Max Rubner-Institut, *Bundeslebensmittelschlüssel Version 4.0 —
Dokumentation*, Stand Dezember 2025, 24 Seiten.
`[cmd]` Ausgelesen 2026-08-14 mit `pdftotext -layout`: 1.078 Zeilen, 52 KB.

## Korrektur einer früheren Aussage

`[cmd]` In `023_zubereitung_ableitung.sql` steht, das PDF benutze
*„eingebettete Teilfonts, deren Text sich nicht auslesen lässt"*. **Das
stimmt nicht.** Die Datei trägt ToUnicode-CMaps; der Text ist vollständig
extrahierbar.

Die Schlussfolgerung war trotzdem richtig, nur aus einem anderen Grund:
**Die Schlüsseltabelle steht nicht drin.**

## Was zur Codesystematik dasteht — und was nicht

`[read]` Kapitel 2.4 „BLS Code-Systematik" umfasst drei Sätze:

> Der Code folgt weitestgehend der Struktur [Buchstabe][6 Ziffern], wobei der
> führende Buchstabe die Hauptlebensmittelgruppe kennzeichnet

Dazu **ein** Beispiel: `C131000 — Hafer ganzes Korn, roh — Getreide`.

Kein Verzeichnis der zwanzig Buchstaben. Nichts zu den Stellen 5 bis 7.
Die Ableitung in `44-bls-codestruktur.md` bleibt damit die einzige Quelle
für die Bedeutungen — sie ist nicht die zweite Wahl, sondern die einzige.

**Zwei Dinge bestätigt das Dokument:**

- `[read]` `C` = Getreide. `[cmd]` Deckt sich mit unserer Erhebung:
  231 Einträge, Beispiele `Wildreis roh`, `Roggen Mehl Type 1370`.
- `[read]` **„folgt *weitestgehend* der Struktur"** — der BLS räumt
  Abweichungen selbst ein. `[cmd]` Das erklärt Codes wie `V4A6172` und
  `B8B5000` mit einem Buchstaben an dritter Stelle.

## Die Lücke, die das Dokument aufdeckt: Datenherkunft

`[read]` Der BLS liefert **für jeden einzelnen Datenpunkt** eine
Herkunftsangabe — als eigene Spalte `[Component Code] Datenherkunft`, plus
eine Referenzspalte. 13 Kategorien, vom Institut als *zentrales
Qualitätsmerkmal* bezeichnet:

| Kategorie | Bedeutung |
|---|---|
| Analyse | Laboranalyse am MRI oder akkreditiertem Prüflabor |
| Rezeptberechnung | aus Einzelzutaten, mit Gewichts- und Nährstoffänderung |
| Musterberechnung | aus typischem Verteilungsmuster hochgerechnet |
| Literatur | peer-reviewte Publikation |
| Aggregation | aus mehreren Literaturquellen gemittelt |
| Labelangabe | von der Produktverpackung |
| Nährstoffdatenbank | EuroFIR oder USDA FoodData Central |
| Übernommener Wert | von einem ähnlichen Lebensmittel übertragen |
| Reskalierung | auf anderen Wassergehalt umgerechnet |
| Logische Null | Nährstoff kommt biologisch nicht vor — Wert **ist** 0 |
| Logische Annahme | aus allgemeiner Regel abgeleitet (Öl = 100 g Fett) |
| Spuren | nachgewiesen, Menge unbekannt, **grösser als null** |
| Formelberechnung | Summenparameter aus Einzelkomponenten |

`[cmd]` **Wir haben davon nichts übernommen.** `food_nutrients.data_source`
trägt bei allen 698.092 Zeilen denselben Wert `bls_4_0_local_import` — das
ist unser Importvermerk, nicht die BLS-Herkunft.

Damit können wir heute nicht unterscheiden zwischen:
- einem gemessenen Wert und einem von einem ähnlichen Lebensmittel geliehenen
- einer **logischen Null** (Retinol in Pflanzen — der Wert ist wirklich 0)
- einem **fehlenden Wert** (keine Daten — nicht als 0 zu lesen)
- **Spuren** (vorhanden, Menge unbekannt, aber > 0)

`[cmd]` Und die Lücke ist gross: Von 138 Nährstoffen tragen unsere
Lebensmittel im Schnitt **98**, mindestens 21, höchstens 108. Rund 40
Nährstoffe je Lebensmittel fehlen — ob als fehlender Wert, logische Null
oder Spur, ist nicht mehr feststellbar.

## Die Regel, die wir bereits richtig befolgen

`[read]` Wörtlich aus dem Dokument:

> **Fehlender Wert ≠ Null:** Ein fehlender Wert bedeutet nicht, dass der
> Nährstoff nicht vorhanden ist. Er bedeutet lediglich, dass keine
> zuverlässigen Daten vorliegen.

`[cmd]` Genau das setzt `diary-model.ts` seit C-03 um: Fehlende Nährwerte
werden nicht als 0 gerechnet, sondern als `incompleteFields` markiert. Die
Tagessumme aus C-04 trägt je Makro ein `<makro>_missing` und liefert NULL
statt 0, wenn keine Position einen Wert hat.

**Diese Entscheidung ist damit offiziell gedeckt**, nicht nur plausibel.

## Bezugsgrösse — bestätigt

`[read]` Kapitel 7.2: *Alle Nährstoffangaben beziehen sich auf 100 g
essbaren Anteil. Bei Lebensmitteln mit nicht essbaren Teilen (z. B. Schalen,
Kerne) ist der nicht essbare Anteil bereits herausgerechnet.*

`[cmd]` Das bestätigt `docs/ssot/35-naehrwert-bezugsgroesse.md`, das aus den
Daten erschlossen wurde (`max(CHO) = max(FAT) = exakt 100,00000`). **Belegt
statt erschlossen** — und der Zusatz zum essbaren Anteil war uns bisher
unbekannt.

## Berechnungsformeln — falls wir je nachrechnen wollen

`[read]` Energie nach Atwater:

```
ENERCC = PROT625 × 4 + FAT × 9 + (CHO − POLYL) × 4 + FIBT × 2
         + ALC × 7 + OA × 3 + POLYL × 2,4
```

Weitere im Dokument: Kohlenhydrate, Ballaststoffe, Fettsäuregruppen,
Aminosäuren, Vitamin-Äquivalente, `NACL = NA × 2,5`,
`PROT625 = NT × 6,25`.

`[read]` Wichtig für die Anzeige: Manche Werte sind **immer berechnet** —
Energie, Gesamtzucker, Gesamtfettsäuren —, auch wenn Messwerte vorlägen.
Andere nur **teilweise berechnet**. Die Unterscheidung steht in
`BLS_4_0_Components_DE_EN.xlsx`, Spalte I.

## Lizenz — geklärt

`[read]` Kapitel 9.3: *Der BLS 4.0 wird kostenfrei und ohne Lizenzbarrieren
bereitgestellt.* Ausdrücklich erlaubt: **App- und Softwareentwicklung**.
Empfohlene Zitierweise:

> Max Rubner-Institut (2025): Bundeslebensmittelschlüssel (BLS), Version 4.0.
> Karlsruhe.

Das ist die Quellenangabe, die in die Oberfläche gehört.

## Ein Satz zur Einordnung des Dokuments selbst

`[read]` *„Die Texterstellung für diese Dokumentation erfolgte KI-assistiert
(Schwerpunkt: redaktionelle Aufbereitung und Strukturierung). Alle
generierten Inhalte wurden vollumfänglich durch wissenschaftliches Personal
geprüft."*

`[Vermutung]` Das erklärt möglicherweise, warum Kapitel 2.4 die Struktur
beschreibt, ohne den Schlüssel zu liefern.

## Was daraus folgt

1. **Die falsche Begründung in `023_…` berichtigen** — das PDF ist lesbar,
   die Tabelle fehlt trotzdem.
2. **Datenherkunft nachimportieren** prüfen. `[cmd]` Die Spalten liegen in
   `BLS_4_0_Daten_2025_DE.xlsx` vor, wir haben sie beim Import verworfen.
   Der Nutzen: „gemessen" von „geschätzt" unterscheiden, und **logische
   Null** von **fehlt**. Für eine App, die Makros summiert, ist das der
   Unterschied zwischen einer Null, die stimmt, und einer, die eine Lücke
   verdeckt.
3. **Quellenangabe in die Oberfläche** — die Zitierweise steht fest.
4. `35-naehrwert-bezugsgroesse.md` um den essbaren Anteil ergänzen.
