---
nr: C-510
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-505
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 7f42bc6b
beruehrt:
  tabellen: [supplements.product_contents]
zahlen:
  gemessen: 2026-09-08
  mappings: 40
---

# C-510 - das Mapping ist buchstabengenau

## Toms Befund

Tom, 2026-09-08, am Schirm:

> das ist schwachsinn und garantiert nicht schwer zu matchen

> so eine triviale scheisse, welche ich mit manuellem
> spaltenumbenennen in 10 minuten erledigt haette

`[read]` **Er hat recht.**

## Gemessen

`[cmd]` **Die 39 Mappings aus C-496 sind DA:**

    Vitamin C -> VITC     Calcium -> CA
    Iron -> FE            Zinc -> ZN
    Magnesium -> MG       Vitamin B6 -> VITB6

`[cmd]` **Und trotzdem:**

    Zutat        supplement_id   nutrient_code
    -----------  -------------   -------------
    Biotin       ja              NEIN
    Thiamin      ja              NEIN
    Calcium      NEIN            CA
    Iron         NEIN            FE
    Zinc         NEIN            ZN
    Vitamin C    NEIN            VITC
    Vitamin B6   NEIN            VITB6
    Magnesium    NEIN            MG

## Zwei Fehler

**1** ? **Das Mapping ist buchstabengenau.**

`[cmd]` **Das Mapping heisst `Thiamine` mit `e`, die Zutat
heisst `Thiamin`.**

`[read]` **`Folate` und `Folic Acid` sind beide drin ? aber
`Thiamin` fehlt neben `Thiamine`.**

`[cmd]` **MISS, welche der 39 Namen in `product_contents`
ueberhaupt WOERTLICH vorkommen** ? **und welche Schreibweisen
daneben stehen.**

**2** ? **`supplement_id` und `nutrient_code` sind unabhaengig
gefuellt.**

`[read]` **`Biotin` hat eine `supplement_id`, aber kein
Naehrstoff-Mapping.**

`[cmd]` **LumeOS hat KEINE `biotin`-Spalte in `foods`** ?
**also ist das richtig.**

`[read]` **Aber `Calcium` hat `CA` und trotzdem keine
`supplement_id`** ? **das ist ein Loch.**

## Was zu bauen ist

**1** ? **Die Mappings um die vorkommenden Schreibweisen
erweitern.**

`[read]` **Nicht raten** ? **messen, welche Namen in den
3.000.982 Zeilen stehen.**

`[cmd]` **Fuer die 31 LumeOS-Naehrstoffspalten** ? `enercc`,
`prot625`, `fat`, `cho`, `fibt`, `sugar`, `fasat`, `nacl`,
`water_g`, `alc`, `vita_ug`, `vitd_ug`, `vite_mg`, `vitk_ug`,
`vitc_mg`, `thia_mg`, `ribf_mg`, `nia_mg`, `vitb6_ug`,
`fol_ug`, `vitb12_ug`, `na_mg`, `k_mg`, `ca_mg`, `mg_mg`,
`p_mg`, `fe_mg`, `zn_mg`, `id_ug`, `cu_ug`, `mn_ug`.

`[read]` **Je Spalte: welche DSLD-Namen meinen sie?**

**2** ? **Die `supplement_id` nachziehen, wo ein
`nutrient_code` existiert.**

`[read]` **Ein Naehrstoff IST eine Substanz** ? `Calcium`,
`Iron`, `Zinc` **stehen vermutlich in `supplements.supplements`
(596 Eintraege).**

`[cmd]` **MISS: wie viele der 31 Naehrstoffe haben einen
Substanzeintrag?**

## Was das bringt

`[cmd]` **In Toms Beispiel: 62 Wirkstoffzeilen, davon 24
*auswertbar*.**

`[read]` **Nach der Berichtigung sollten es die meisten
sein** ? **`Calcium`, `Iron`, `Zinc`, `Vitamin C`, `Vitamin
B6`, `Magnesium`, `Phosphorus`, `Potassium`, `Sodium`,
`Iodine`, `Copper` sind alle LumeOS-Spalten.**

## Was NICHT zu tun ist

**KEINE Zuordnung raten** ? **aber eine Schreibvariante ist
kein Raten.**

`[read]` **`Thiamin` und `Thiamine` sind derselbe Stoff** ?
**`Vitamin B1` steht schon als drittes Mapping da.**

**`apps/` nicht anfassen** ? **G-464 baut die Anzeige.**

## Abnahmebedingungen

    A1  je der 31 Naehrstoffspalten: welche DSLD-Namen
        kommen vor? TABELLE nach Haeufigkeit.
    A2  die Mappings erweitert. Zahl vorher/nachher.
    A3  wie viele der 31 haben einen Substanzeintrag?
    A4  supplement_id nachgezogen, wo nutrient_code
        existiert. Zahl.
    A5  Toms Beispielprodukt: wie viele der 62 sind
        nachher auswertbar?
    A6  Gegenprobe: ein erfundener Name -> kein
        Mapping.
    A7  Sicherung, Vollkette, ALLE Waechter.

## Bericht

### Ergebnis

`[cmd]` **Erledigt.** Die Korrektur liegt im Datenpfad
`510_supplier_product_nutrient_exact_mappings.sql`, nicht in einer
Migration: Sie ist Katalogdatenlogik. Die Vollkette `c510_final` ist
vollstaendig durchgelaufen (`KETTE OK`, 913,3 s); danach wurde
derselbe idempotente Datenpfad auf `postgres` ausgefuehrt.

### A1 - 31 Nährstoffspalten, DSLD-Namen und Häufigkeit

Gemessen auf der frischen Vollkette; absteigend nach Labelzeilen.
`Produkt-IDs` ist die Zahl unterschiedlicher Produkte. Die Namen sind
die einzigen explizit gemappten DSLD-Labels; Form- und Salzbezeichnungen
sind keine Schreibvarianten und bleiben deshalb ungemappt.

| LumeOS-Spalte | Code | DSLD-Name(n) | Labelzeilen | Produkt-IDs | mit `supplement_id` |
|---|---|---|---:|---:|---:|
| `enercc` | ENERCC | Calories | 52.285 | 49.708 | 0 |
| `cho` | CHO | Total Carbohydrate; Total Carbohydrates | 42.089 | 38.530 | 0 |
| `vitc_mg` | VITC | Vitamin C | 41.042 | 38.480 | 41.042 |
| `ca_mg` | CA | Calcium | 39.647 | 37.572 | 39.647 |
| `vitd_ug` | VITD | Vitamin D; Vitamin D3 | 31.394 | 29.004 | 31.394 |
| `fol_ug` | FOL | Folate; Folic Acid | 30.939 | 23.485 | 30.939 |
| `vitb6_ug` | VITB6 | Vitamin B6 | 30.767 | 28.742 | 30.767 |
| `mg_mg` | MG | Magnesium | 30.349 | 28.681 | 30.349 |
| `vitb12_ug` | VITB12 | Vitamin B12 | 29.518 | 27.608 | 29.518 |
| `sugar` | SUGAR | Sugar; Total Sugars | 30.259 | 25.256 | 0 |
| `zn_mg` | ZN | Zinc | 28.148 | 26.329 | 28.148 |
| `na_mg` | NA | Sodium | 27.808 | 25.808 | 0 |
| `fat` | FAT | Total Fat | 27.119 | 25.668 | 0 |
| `vite_mg` | VITE | Vitamin E | 26.401 | 24.464 | 26.401 |
| `water_g` | WATER | Water | 25.467 | 25.415 | 0 |
| `nia_mg` | NIA | Niacin; Vitamin B3 | 25.130 | 23.298 | 22.812 |
| `vita_ug` | VITA | Vitamin A | 25.023 | 23.040 | 25.023 |
| `k_mg` | K | Potassium | 23.757 | 22.345 | 23.757 |
| `ribf_mg` | RIBF | Riboflavin; Vitamin B2 | 23.149 | 21.283 | 19.969 |
| `thia_mg` | THIA | Thiamin; Thiamine; Vitamin B1 | 21.603 | 20.364 | 21.603 |
| `prot625` | PROT625 | Protein | 18.921 | 17.615 | 0 |
| `fe_mg` | FE | Iron | 17.402 | 16.137 | 17.402 |
| `mn_ug` | MN | Manganese | 16.666 | 15.903 | 16.666 |
| `id_ug` | ID | Iodine | 15.579 | 14.163 | 15.579 |
| `fibt` | FIBT | Dietary Fiber | 15.467 | 14.602 | 0 |
| `fasat` | FASAT | Saturated Fat | 15.072 | 13.908 | 0 |
| `cu_ug` | CU | Copper | 14.823 | 14.127 | 14.823 |
| `vitk_ug` | VITK | Vitamin K; Vitamin K2 | 10.061 | 8.995 | 3.007 |
| `p_mg` | P | Phosphorus | 8.229 | 7.670 | 0 |
| `alc` | ALC | Alcohol | 3.055 | 3.053 | 0 |
| `nacl` | NACL | Salt | 2.665 | 2.470 | 0 |

Alle zuvor 39 gemappten Namen kommen wortgleich vor. Die fehlende
Schreibvariante war `Thiamin`: 1.147 Zeilen in 1.116 Produkten. Sie
wurde zu `THIA` ergänzt. Daneben existieren beispielsweise
`Thiamine Mononitrate` (730) und `Thiamine Hydrochloride` (244), aber
das sind Stoffformen, keine bloßen Schreibvarianten; sie wurden nicht
geraten oder auf `Thiamin` zusammengezogen.

### A2-A4 - Mapping und Katalogbrücke

| Messung auf `postgres` | Vorher | Nachher |
|---|---:|---:|
| DSLD-Namensmappings | 39 | 40 |
| Gemappte Labelzeilen | 748.687 | 749.834 |
| Davon mit `supplement_id` | 133.658 | 468.846 |

19 von 31 Nährstoffspalten haben mindestens ein eindeutiges
Katalogwurzelziel (`im_katalog = true`, `parent_id IS NULL`). Das sind
23 der 40 konkreten DSLD-Namen.
Für die anderen 12 Spalten existiert kein solches Substanzziel
(`ALC`, `CHO`, `ENERCC`, `FASAT`, `FAT`, `FIBT`, `NA`, `NACL`, `P`,
`PROT625`, `SUGAR`, `WATER`). Bei `NIA`, `RIBF` und `VITK` ist nur
eine der jeweiligen Labelvarianten katalogseitig eindeutig. Das ist
sichtbar in der Tabelle und bleibt absichtlich offen.

Der Datenlauf ergänzte auf der Laufdatenbank **313.585** zuvor leere
`supplement_id`-Werte. Das Ziel muss dabei genau einmal als
`im_katalog = true` und `parent_id IS NULL` gefunden werden. Damit
werden F05-Kandidaten, Formen und mehrdeutige Aliasnamen nicht
verknüpft.

### A5-A6 - Gegenproben

Toms Beispiel `DaVinci Laboratories / Spectra` hat 62 Inhaltszeilen:

| Messung | Vorher | Nachher |
|---|---:|---:|
| Zeilen mit `supplement_id` | 13 | 25 |
| Zeilen mit `nutrient_code` | 18 | 19 |
| Auf mindestens eine Weise auswertbar | 25 | 25 |
| Mit beiden Verknüpfungen | 6 | 19 |

Die Abnahmezahl „24“ war damit eine UI-Zählweise; die Datenbank hatte
schon vorher 25 Zeilen mit mindestens einer der beiden Verknüpfungen.
Der echte Gewinn ist die vollständige Doppelkoppelung der 19
Nährstoffzeilen, nicht eine künstlich veränderte Treffermenge.

Die Gegenprobe `C510 erfundener Nährstoff` hat **0** Mappings.

### A7 - Sicherung, Vollkette und Validierung

- Sicherung vor dem Lauf: `backup/schema/20260916173500_c510_vorher.sql`.
- Vollkette: `c510_final`, einschließlich C-510, **KETTE OK**.
- C-510-Test auf der frischen Kette: **1/1 grün**.
- Idempotenz-Gegenprobe auf `postgres`: zweiter Lauf `INSERT 0 0`,
  `INSERT 0 0`, `UPDATE 0`.
- Alle 26 Gate-Wächter wurden einzeln ausgeführt. 24 sind grün. Rot
  bleiben ausschließlich zwei fremde, unveränderte Altbefunde:
  `sammelfragen-pruefen` (2 Sammelpunkte bei Soll 1) und
  `abwesenheit-pruefen` (die drei bekannten, durch C-461 überholten
  Aussagen zu `training.routines`, `routine_exercises` und
  `routine_schedule_days`). Die fachlichen C-510-Wächter,
  `migration-datenlogik-pruefen` und `serverimport-pruefen` sind grün.
- `turbo run lint typecheck test build`: **21/21 erfolgreich**. Ein
  bestehender `no-img-element`-Lint-Hinweis bleibt unverändert.
- Keine Datei unter `apps/` geändert, Dev-Server nicht angefasst,
  nichts committed.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen, LIVE.**

    Mappings          40 (vorher 39)
    Thiamine -> THIA  und  Thiamin -> THIA
    verknuepft       639.122 von 3.000.982

`[read]` **Vorher 305.080** ? **mehr als verdoppelt.**

### Toms acht Beispiele, alle behoben

`[cmd]` **Selbst gemessen:**

    Biotin       supp_id ja
    Calcium      supp_id ja   (vorher NEIN)
    Iron         supp_id ja   (vorher NEIN)
    Magnesium    supp_id ja   (vorher NEIN)
    Thiamin      supp_id ja
    Vitamin B6   supp_id ja   (vorher NEIN)
    Vitamin C    supp_id ja   (vorher NEIN)
    Zinc         supp_id ja   (vorher NEIN)

`[read]` **Toms Satz war:** *,,das ist schwachsinn und garantiert
nicht schwer zu matchen."* ? **er hatte recht.**

### Ein Beleg an einem echten Produkt

> *,,Spectra (62 Zeilen): `supplement_id` 13 -> 25, beide
Verknuepfungen 6 -> 19."*

`[read]` **Genau das Produkt aus Toms Befund** ? **von 62
Wirkstoffzeilen sind jetzt 25 verknuepft statt 13.**

### Und die Zurueckhaltung bleibt

> *,,313.585 fehlende `supplement_id`-Werte NUR bei
EINDEUTIGEM Katalogwurzelziel ergaenzt."*

> *,,19/31 Naehrstoffspalten haben ein belegtes Substanzziel;
fehlende Ziele bleiben bewusst offen."*

`[read]` **Zwoelf der 31 haben keinen Substanzeintrag** ?
**gemeldet, nicht erfunden.**

`[cmd]` **Und die Idempotenz geprueft: zweiter Lauf UPDATE 0.**

**Abgenommen.**


