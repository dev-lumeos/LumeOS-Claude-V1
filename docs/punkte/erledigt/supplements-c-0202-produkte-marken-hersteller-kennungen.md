---
nr: C-202
typ: blocker
modul: supplements
schwere: hoch
angelegt: 2026-08-22
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: OFFEN
beruehrt:
  tabellen: [supplements.supplements]
zahlen: null
---

# C-202 - Produkte, Marken, Hersteller, Kennungen

## Befund

(neu 2026-08-22). **Blockiert durch Tom-Entscheidungen.**

  `[cmd]` `products` 50 · `brands` 120 · `manufacturers` 63 ·
  `product_identifiers` 72 (crawl_035) · `product_media` 3
  (Schema-Muster). **Im Repo: kein Produkt- oder Markenschema.**

  `[cmd]` Der 035-Handoff markiert `REQUIRES_REPO_SCHEMA` fuer
  `product_identifiers`, `product_media`, `packaging_versions`,
  `batch/COA`, `vision_learning_examples`.

  `[cmd]` **Duenn:** `thai_label` 2 %, GTIN/EAN fuer Medikamente 0
  (Quelle nicht offen), Supplement-Kennungen 30 von 31 unverifiziert.

## Auftrag — messen, was der Katalog traegt

**Mitbeauftragt: C-260.** Bericht in diese Datei.

**Beauftragt am 2026-08-30.**

`[read]` **Beide sind aelter als der Katalogneuaufbau.** **Die
Erwartung: mindestens einer ist ueberholt** — **das war bei
zweiundzwanzig geprueften Altpunkten neunmal so.**

### 1 · C-202 — Produkte, Marken, Hersteller, Kennungen

`[cmd]` **Miss zuerst, was heute existiert.** `[cmd]` **`supplements`
traegt 412 sichtbare Substanzen** — **ob daneben Produkte, Marken oder
Kennungen stehen, ist die Frage.**

`[cmd]` **C-250 hat gemessen, dass `cost_per_serving` und
`serving_size` fehlen** — das deutet auf eine Produktebene, die es
nicht gibt.

`[read]` **Und die Vorfrage ist eine Produktfrage, keine Datenfrage:**
**ist ein Praeparat eine Substanz oder ein Produkt?** `[cmd]` **Der
Nutzer nimmt ein Produkt mit einer Dosierung, der Katalog fuehrt
Substanzen.** **Wenn das der Befund ist: sagen, nicht bauen.**

### 2 · C-260 — die Arbeitsberichte sind nicht in die Daten zurueckgeflossen

`[read]` **Miss, welche Berichte gemeint sind und was daraus fehlt.**
`[cmd]` **Kimis Forschungsdaten liegen in
`docs/kimi_research/supplement_performance_database/data/`** — **im
`.gitignore`.**

`[read]` **Wenn der Rueckfluss stattgefunden hat: schliessen.**
**Wenn nicht: sagen, was fehlt und wie viel.**

### Was nicht zu tun ist

**Kein Katalogausbau.**
**Keine deutschen Namen** — die 20 aus C-352 sind der belegte Satz.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Punkt ein Urteil    erledigt / gebaut / offen / ueberholt
    Produktebene           existiert sie? gemessen
    Substanz gegen Produkt als Befund benannt
    Kimi-Rueckfluss        was fehlt, wie viel

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `server.py neustart`, kein `start`, kein
`aufraeumen`.** `[read]` **Wenn eine Messung ihn braucht: melden,
nicht starten.**

`[cmd]` **Gemessen in G-280: 18 Starts, sechs an einem Tag, vor keinem
ein Fehler** — **`neustart` fuehrt `taskkill /T /F` auf Port 3200
aus, und Tom arbeitet dort mit.**

## Bericht

**Gemessen am 2026-08-31 auf `dev`; keine Produkt-, Katalog- oder App-Aenderung.**

| Punkt | Urteil | Messung |
|---|---|---|
| C-202 | **teilweise ueberholt, offen** | Die frueher nur im Report genannten Produktdaten sind gebaut, aber nicht Teil des Supplements-Nutzermodells. |
| C-260 | **teilweise erledigt, offen** | Der Rueckfluss aus den maschinenlesbaren Daten besteht fuer Aliase und vier Identitaetsarten; CAS und Peptidsequenzen fehlen weiterhin. |

### C-202 - zwei Ebenen existieren, aber sie sind nicht dieselbe Sache

`supplements.supplements` hat 596 Stoffe, davon **412 sichtbare**. Die
Stoffebene traegt **1.226** maschinenlesbare Stoffkennungen: 272 UNII,
242 Summenformeln, 241 PubChem-CIDs, 239 InChIKeys, 155 ChEMBL-IDs und
77 CAS-Kandidaten. Das sind chemische Identitaeten, keine Handels- oder
Packungskennungen.

Die beim Anlegen von C-202 genannten Produktzahlen sind inzwischen als
Kimi-Import in `wissen.product_entities` vorhanden:

| entity_type | Zeilen | weiterer Befund |
|---|---:|---|
| `product` | 50 | 73 Zutaten-Referenzen; alle loesen gegen `supplements.supplements.slug` auf |
| `brand` | 120 | 120 Markenkennungen |
| `manufacturer` | 63 | 63 Herstellerkennungen |
| `brand_index` | 120 | Such-/Indexeintraege |

Das ist keine Annahme aus dem alten Punkt: `273d_wissen_produkte.ts`
liest die vier Kimi-Dateien und sichert genau diese Sollzahlen. Die
Produkt-Zutaten sind damit absichtlich an den Stoffkatalog anschlussfaehig;
eine Datenbank-FK gibt es nicht.

Die Grenze bleibt sichtbar:

- `user_inventory`, `stack_items`, Einnahmen und Dosierungen referenzieren
  `supplement_id`, nie ein Produkt. Der Nutzer nimmt im gebauten Modell
  also einen Stoff, nicht eine konkrete Packung.
- Es gibt keine relationale Supplements-Tabelle fuer Produkte, Marken,
  Hersteller, Varianten oder Produktkennungen. In `wissen` liegen sie als
  generische Produkt-Entitaeten mit JSON-Rohdaten. `external_id` ist die
  Kimi-Kennung (`prd_...`), kein GTIN/EAN.
- Von 32 Produktvarianten haben **0** eine UPC/EAN und **0** eine SKU.
  32 Produkte sind wegen fehlender `serving_size` markiert; nur 4 von 50
  enthalten eine Serviergroesse. Preis und `price_per_serving` liegen zwar
  in den Rohdaten, aber nicht als `supplements.cost_per_serving`.

Damit ist die Vorfrage beantwortet: **Ein Praeparat ist im Bestand ein
Produkt aus Stoffen, nicht ein Stoff.** Beide Ebenen gibt es, doch nur die
Stoffebene ist derzeit Nutzerbestand und Einnahmekette. Ob die vorhandene
Produktebene dorthin angeschlossen werden soll, ist die ausstehende
Produktentscheidung; dieser Auftrag baut sie nicht.

### C-260 - welcher Bericht gemeint ist und was wirklich rueckfloss

C-260 meint nicht alle derzeit 1.944 Kimi-Reportdateien, sondern den
alten Arbeitsbereich `reports/crawl_027_ws/` (11 Dateien). Seine
Identitaetspruefung steht in `A.json` fuer 37 Peptid-/Substanz-Eintraege;
`crawl_027_profiles/` sind die 37 zugehoerigen Profilberichte. Das
Kimi-Output-Contract trennt bewusst Arbeitsberichte unter `reports/` von
maschinenlesbaren Daten unter `data/`; nur letztere sind ein Importinput.

Gegen die aktuellen 446 maschinenlesbaren Stoffdatensaetze loesen sich
**36 von 37** Eintraegen aus `A.json` per kanonischem Namen oder Alias
auf. Der einzige Rest ist bereits dort so markiert:
`5-Amino-1MQ (NOT in dataset - evaluate)`.

Fuer diese 36 Datensaetze ist der Rueckfluss in den Livekatalog:

| Feld in `data/` | dort belegt | gleiches Feld live | fehlt live |
|---|---:|---:|---:|
| UNII | 32 | 32 | 0 |
| PubChem-CID | 30 | 30 | 0 |
| ChEMBL-ID | 13 | 13 | 0 |
| InChIKey | 28 | 28 | 0 |
| Aliase | 57 | 57 | 0 |
| CAS-Nummer | 33 | 0 | **33** |
| Peptidsequenz | 27 | 0 | **27** |

Die vier Identitaetsarten und Aliase sind somit seit dem Neuaufbau
ueberholt; der alte Befund "keine Daten" gilt dafuer nicht mehr. CAS ist
in den aktuellen Kimi-Daten `cas_number`, waehrend live nur
`cas_candidates` vorkommt; keine der 33 Quellnummern ist dort vorhanden.
Fuer Peptidsequenzen findet `information_schema` im Supplements-Schema
ueberhaupt keine Zielspalte. Der Rueckfluss ist deshalb nicht vollstaendig
und C-260 nicht schliessbar.

Der alte Arbeitsbericht und die heutige Datenquelle widersprechen sich
zusaetzlich bei der Sequenzanzahl (35 in `A.json`, 27 in `data/`). Das ist
ein Quellunterschied, keine Zahl zum Wegmitteln; fuer den Import wurde die
aktuelle maschinenlesbare Quelle gezahlt.

## Abnahme

**2026-08-30, Orchestrator.**

### C-202 — teilweise ueberholt, und die Grenze ist scharf

`[cmd]` **`wissen.product_entities` traegt 50 Produkte, 120 Marken, 63
Hersteller.** `[read]` **Der Punkt sagte, es gebe keine
Produktebene** — **es gibt eine.**

`[cmd]` **Aber Nutzerbestand und Einnahmen verweisen weiter nur auf
Stoffe.**

`[read]` **Damit ist die Frage aus meinem Auftrag beantwortet, und
zwar mit einem Zwischenstand:** **die Produktebene existiert als
Wissen, nicht als Bestand.** `[read]` **Ein Nutzer nimmt weiter eine
Substanz, kein Produkt.**

`[read]` **Und das ist keine Luecke, sondern eine Grenze** — `wissen`
ist der Katalog, `supplements` der Bestand. **Die Verbindung dazwischen
ist die eigentliche Frage. Als C-364.**

### C-260 — teilweise erledigt, und der Rest ist benannt

`[cmd]` **Zurueckgeflossen: UNII, PubChem, ChEMBL, InChIKey und 57
Aliase — vollstaendig.**

`[cmd]` **Offen: 33 CAS-Nummern und 27 Peptidsequenzen.**

`[read]` **Und der Grund fuer die Sequenzen ist kein Versaeumnis:**
`[cmd]` **es gibt kein Ziel im Live-Schema** — **keine Spalte, in die
sie gehoerten.**

`[read]` **Das ist die richtige Meldung: nicht *,,noch nicht
gemacht"*, sondern *,,es gibt keinen Ort dafuer"*.** **Als C-365.**

**Abgenommen.**

