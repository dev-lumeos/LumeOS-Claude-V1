# Eigene Lebensmittel C-34 — Schema-Entwurf

Stand: 2026-08-15.

`[cmd]` Dieser Auftrag hat nichts gebaut. Es gab keine Migration, keinen
Kettenschritt, kein `UPDATE`, kein `INSERT` und keinen Kettenlauf.

Datei:

- `docs/ssot/66-eigene-lebensmittel-entwurf.md`

---

## Gelesene Grundlagen

`[read]` `docs/specs/Nutrition/04_adrs/ADR_CUSTOM_FOODS_V1.md` legt fest:
Custom Foods sind in V1 user-privat, vollständig getrennt vom BLS-Bestand,
mit Pflichtfeldern `name_de`, `enercc`, `prot625`, `fat`, `cho` je 100 g.
Erlaubte `source`-Werte sind `user`, `manual`, `import`, `admin`.
`openfoodfacts` und `mealcam` sind nicht erlaubt; MealCam soll bei fehlendem
BLS-Match ein Custom Food mit `source = 'user'` erzeugen.

`[read]` `docs/specs/Nutrition/02_patches/SPEC_02_PATCH_ENTITY07_CUSTOMFOOD.md`
beschreibt `foods_custom` als vollständig getrennt von `foods`, ohne Merge,
mit Barcode als eigenem Identifier und flachen Nährwertspalten. Diese Datei
nennt als `source` nur `user | mealcam`.

`[read]` `docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md`
Abschnitt 8 führt `foods_custom` mit flachen Pflichtmakros, optionalen
Makros, Mikro-Subset und `source CHECK ('user','manual','import','admin')`.

`[read]` `docs/specs/Nutrition/02_patches/SPEC_06_RECALCULATE_PATCH.md`
stellt klar: `food_source` ist die primäre Herkunftsspalte an `meal_items`;
`data_source` ist redundant. Vorgesehen sind `bls`, `custom`, `mealcam`,
`manual`, wobei `custom_food_id` auf `nutrition.foods_custom` zeigt.

---

## Heutiger Ist-Zustand

`[cmd]` `nutrition.foods_custom` existiert nicht:
`to_regclass('nutrition.foods_custom')` liefert NULL.

`[cmd]` Im Repo gibt es kein `CREATE TABLE nutrition.foods_custom`. `rg` findet
`foods_custom` nur in Kommentaren der aktuellen Kette, nicht als DDL.

`[cmd]` `nutrition.meal_items` trägt heute:

| Feld | Zustand |
|---|---|
| `food_id` | FK auf `nutrition.foods(id)` |
| `food_source` | `CHECK IN ('bls','manual')` |
| `food_name` | eingefrorener Anzeigename |
| Makrospalten | `enercc`, `prot625`, `fat`, `cho`, plus fünf optionale Schnellwerte |
| `nutrients` | JSONB-Snapshot |
| `frozen_at` | Zeitpunkt des Snapshots |

`[cmd]` `meal_items_source_target_check` erlaubt genau zwei Zustände:
`food_source='bls' AND food_id IS NOT NULL` oder
`food_source='manual' AND food_id IS NULL`. Ein dritter Zustand für
wiederverwendbare eigene Lebensmittel fehlt.

`[cmd]` `nutrition.daily_summary` hat neun `*_missing`-Spalten:
`enercc`, `prot625`, `fat`, `cho`, `fibt`, `sugar`, `fasat`, `nacl`,
`water_g`.

`[cmd]` `nutrition.meal_items` enthält aktuell 0 Zeilen; die Missing-Logik
konnte deshalb nur am View-Text, nicht an echten Custom-Daten gemessen werden.

`[cmd]` `nutrition.food_nutrients` enthält live 698.092 Werte mit genau einem
`data_source`: `bls_4_0_local_import`. Der Live-Schnitt liegt bei 97,8
Nährwerten je Food. Ältere TODO-Zahlen nennen 121,8 und zwei Quellen; das ist
nicht der aktuelle lokale Stand.

`[cmd]` 0 von 7.140 `nutrition.foods` tragen `name_th`.

---

## Entwurf: Tabellenform

`[annahme]` Der nächste Bau sollte `nutrition.foods_custom` als eigene
User-Tabelle anlegen, nicht als Erweiterung von `nutrition.foods`.

Kernfelder:

```sql
id              uuid primary key default gen_random_uuid()
user_id         uuid not null
name_de         text not null
name_en         text
name_th         text
brand           text
barcode         text
serving_size_g  numeric(8,2) default 100
serving_name    text
source          text not null default 'user'
  check (source in ('user','manual','import','admin'))

enercc          numeric(8,2) not null
prot625         numeric(8,3) not null
fat             numeric(8,3) not null
cho             numeric(8,3) not null

fibt            numeric(8,3)
sugar           numeric(8,3)
fasat           numeric(8,3)
nacl            numeric(8,3)
water_g         numeric(8,3)
alc             numeric(8,3)

custom_allergens text[] not null default '{}'

created_at      timestamptz not null default now()
updated_at      timestamptz not null default now()
```

`[read]` Das Mikro-Subset aus der Spec kann zusätzlich flach übernommen
werden: `vita_ug`, `vitd_ug`, `vite_mg`, `vitk_ug`, `vitc_mg`, `thia_mg`,
`ribf_mg`, `nia_mg`, `vitb6_ug`, `fol_ug`, `vitb12_ug`, `na_mg`, `k_mg`,
`ca_mg`, `mg_mg`, `p_mg`, `fe_mg`, `zn_mg`, `id_ug`, `cu_ug`, `mn_ug`.

`[annahme]` RLS-Muster: operationengetrennte Policies wie `052`, nicht die
alte `FOR ALL`-Policy aus SPEC_06. `user_id` ist die Eigentumsachse.

---

## Bezug zu `nutrition.foods`

`[read]` Beide Custom-Food-Specs sagen: `foods_custom` ist vollständig vom
BLS getrennt, kein Merge mit `foods`.

`[annahme]` Deshalb braucht `foods_custom` selbst keinen FK auf
`nutrition.foods`. Der Bezug entsteht erst an Stellen, die beide Quellen
verwenden:

1. `meal_items` braucht zusätzlich `custom_food_id uuid references
   nutrition.foods_custom(id)`.
2. `meal_items.food_source` braucht den dritten Zustand `custom`.
3. `meal_items_source_target_check` muss dann drei Fälle unterscheiden:

```sql
(food_source = 'bls'    and food_id is not null and custom_food_id is null)
or
(food_source = 'custom' and food_id is null     and custom_food_id is not null)
or
(food_source = 'manual' and food_id is null     and custom_food_id is null)
```

`[annahme]` `food_id` bleibt BLS-only. Das hält `meal_items_food_id_fkey`,
BLS-Abgleich und Kettenneuaufbau sauber getrennt.

`[read]` `SPEC_06_RECALCULATE_PATCH.md` nennt zusätzlich `mealcam`. Für den
jetzigen Entwurf ist `mealcam` kein eigener Custom-Food-Source-Wert, weil der
Widerspruch laut TODO bereits zugunsten „ohne `mealcam`" entschieden ist.
Ein MealCam-Custom-Food wäre `foods_custom.source = 'user'`.

---

## Nährwertform und Tagesbilanz

`[cmd]` BLS-Nährwerte liegen EAV in `nutrition.food_nutrients`. Custom Foods
sind laut Spec flache Spalten.

`[annahme]` Die Tagessumme muss nicht beide Formen direkt addieren. Der
saubere Anschluss bleibt das bestehende Snapshot-Prinzip:

1. Beim Loggen eines BLS-Foods liest die App/Funktion `food_nutrients`,
   rechnet auf `amount_g`, schreibt `meal_items.enercc`, `prot625`, `fat`,
   `cho`, weitere Schnellwerte und `nutrients`.
2. Beim Loggen eines Custom-Foods liest sie die flachen Spalten aus
   `foods_custom`, rechnet ebenfalls auf `amount_g`, schreibt dieselben
   `meal_items`-Snapshot-Spalten und `nutrients`.
3. `daily_summary` summiert nur `meal_items`. Sie muss dann nicht wissen, ob
   die Position ursprünglich aus BLS oder Custom kam.

`[cmd]` Die gebaute Sicht `daily_summary` zählt fehlende Werte bereits je
Schnellwert:
`COUNT(mi.id) - COUNT(mi.<wert>)`.

`[annahme]` Für die vier Pflichtmakros ist die bestehende Sicht ausreichend,
sofern der Custom-Logging-Pfad `enercc`, `prot625`, `fat` und `cho` immer in
`meal_items` setzt. Dann erzeugt ein Custom-Food mit nur vier Werten keine
Missing-Lücke bei diesen vier Spalten.

`[annahme]` Für `fibt`, `sugar`, `fasat`, `nacl` und `water_g` erzeugt ein
vierwertiger Custom-Eintrag korrekt Missing-Zähler. Das ist richtig: fehlend
ist nicht null.

`[annahme]` Was die Sicht nicht löst: Mikronährstoffe im JSONB-Snapshot werden
heute nicht über den Tag aggregiert. Wenn Custom Foods optionale Mikros
bekommen, braucht eine spätere Mikro-Tagesbilanz eine JSONB-Aggregation oder
eine eigene Summenform mit Abdeckungsgrad je Nährstoff.

---

## Plausibilitätsprüfung

`[read]` C-34 fordert die Gegenrechnung aus Makros:
4 kcal je Gramm Protein, 4 je Gramm Kohlenhydrate, 9 je Gramm Fett,
7 je Gramm Alkohol.

`[annahme]` Prüffähige Regel je 100 g:

```text
berechnet_kcal =
  4 * prot625
  + 4 * cho
  + 9 * fat
  + 7 * coalesce(alc, 0)

abweichung = abs(enercc - berechnet_kcal) / greatest(enercc, berechnet_kcal, 1)

warnen, wenn abweichung > 0.10
blockieren oder Admin-Freigabe verhindern: Tom-Entscheidung
```

`[annahme]` Diese Prüfung fängt den häufigen Fehler ab, dass ein Nutzer
Packungswerte je Portion statt je 100 g einträgt. Sie ist aber keine
vollständige Qualitätsprüfung: Ballaststoff-Energie, Polyole und Rundungen
können kleine Abweichungen erklären.

---

## Codebereich und `data_source`

`[read]` C-34 sagt: kein erweiterter BLS-Code, eigener `data_source`.

`[cmd]` Live stehen BLS-Nährwerte in `food_nutrients.data_source` aktuell nur
mit `bls_4_0_local_import`. Diese Spalte ist dem amtlichen Datenstrang
zugeordnet.

`[annahme]` Custom Foods bekommen keinen BLS-Code und schreiben nicht nach
`nutrition.foods` oder `nutrition.food_nutrients`. Ihre Identität ist die UUID
in `foods_custom.id`. Wenn die UI einen stabilen Quellschlüssel braucht, kann
sie `source_type='custom'` plus `id` führen, aber keinen Pseudo-BLS-Code.

`[annahme]` `foods_custom.source` beschreibt den Entstehungsweg
(`user`, `manual`, `import`, `admin`). Das ist nicht dasselbe wie
`food_nutrients.data_source`, das die amtliche Arbeitsmappe prüfbar hält.

---

## Suche und `thai_food`

`[cmd]` Der BLS-Bestand hat 0 `name_th`-Werte.

`[annahme]` `foods_custom` ist der erste plausible Ort, an dem `thai_food`
wirklich etwas markieren kann: Nutzer oder Admins können eigene Thai-Gerichte
anlegen, die im BLS nicht vorkommen. Dafür reicht das aktuelle
`custom_allergens`-Feld aber nicht; es deckt nur Allergene ab.

`[annahme]` Wenn `thai_food` für Custom Foods verwendet werden soll, braucht
der Entwurf zusätzlich eine Tag-/Cuisine-Achse für `foods_custom`, zum
Beispiel `custom_tags text[]` oder eine eigene Tabelle
`foods_custom_tags(custom_food_id, tag_code)`. Das ist eine Produktentscheidung,
weil user-private Tags und globale BLS-Tags unterschiedliche Beweislasten
haben.

---

## Admin-Freigabe

`[read]` C-34 hält fest: Admin-Freigabe ist eine Erweiterung über die Spec
hinaus. Die Spec kennt `source='admin'`, aber kein Review-/Promote-Modell.

Technisch gibt es zwei Wege:

### Weg A: Kopie nach `nutrition.foods`

`[annahme]` Der Admin kopiert einen geprüften Custom-Eintrag in den
zentralen BLS-ähnlichen Bestand.

Folgen:

- `meal_items` kann danach `food_source='bls'` und `food_id` verwenden.
- Der zentrale Eintrag braucht einen künstlichen Code oder eine zweite
  Identitätsform, weil C-34 keinen erweiterten BLS-Code will.
- Die Prüfbarkeit gegen die BLS-Arbeitsmappe wird schlechter, wenn
  `nutrition.foods` amtliche und nichtamtliche Einträge mischt.
- Alte Meal-Items, die vorher `custom_food_id` hatten, behalten ihren Snapshot;
  ob sie auf den neuen zentralen Eintrag umgehängt werden, wäre eine Migration
  historischer IDs und fachlich heikel.

### Weg B: Sichtbarkeit wechselt, Tabelle bleibt `foods_custom`

`[annahme]` Der Admin markiert einen Custom-Eintrag als geprüft/zentral
sichtbar, aber er bleibt in `foods_custom`.

Folgen:

- `nutrition.foods` bleibt amtlicher BLS-Bestand.
- `meal_items` behält `food_source='custom'` und `custom_food_id`.
- Die Suche muss BLS-Foods, eigene private Custom Foods und admin-geprüfte
  Custom Foods zusammenführen.
- Es braucht Sichtbarkeitsfelder, die die V1-Spec noch nicht vorsieht, etwa
  `review_status`, `approved_at`, `approved_by`, optional `is_public`.

`[annahme]` Weg B passt besser zur Spec-Trennung. Tom muss aber entscheiden,
ob „freigegeben" global sichtbar bedeutet oder nur als Admin-Vorlage für
spätere eigene Einträge.

---

## Duplikate

`[annahme]` Der Entwurf braucht Duplikatschutz auf drei Ebenen:

1. Beim Anlegen: Suche muss BLS und eigene Custom Foods gleichzeitig zeigen.
   Das senkt Mehrfachanlage durch Nutzer.
2. Technisch: optionaler Unique-Index je Nutzer auf normalisiertem Namen plus
   Marke, und separat auf Barcode, wenn Barcode gesetzt ist.
3. Vor Admin-Freigabe: Review muss nahe Treffer über BLS und bereits
   freigegebene Custom Foods anzeigen, damit nicht tausendmal derselbe
   Proteinshake zentral wächst.

`[annahme]` Ein harter Unique-Index nur auf `name_de` wäre zu grob:
„Proteinshake" kann verschiedene Marken und Nährwerte meinen.

---

## Was die Spec offen lässt

`[read]` `source = mealcam` ist widersprüchlich: ADR sagt ausdrücklich nein,
Patch nennt `user | mealcam`. Laut TODO ist entschieden: ohne `mealcam`.
Der Entwurf folgt der ADR.

`[annahme]` Offen bleibt, ob LumeOS die Makro-Plausibilität nur warnt oder
hart blockiert. Tom muss entscheiden, ob ein Nutzer schlechte Werte trotzdem
speichern darf, solange sie nur privat sind.

`[annahme]` Offen bleibt, ob Admin-Freigabe eine Kopie nach `foods` erzeugt
oder die Sichtbarkeit in `foods_custom` wechselt.

`[annahme]` Offen bleibt, ob `thai_food` und andere Tags für Custom Foods
über `custom_tags`, über eine Join-Tabelle oder gar nicht in V1 gepflegt
werden.

`[annahme]` Offen bleibt, ob Custom-Food-Mikronährstoffe später in eine
Tages-Mikro-Summe einfließen und mit welchem Abdeckungsgrad fehlende Werte
sichtbar gemacht werden.

`[annahme]` Offen bleibt, welche RLS-/Grant-Form Admins für Review und
Freigabe bekommen. User-private CRUD ist klar; Admin-Sichtbarkeit über fremde
Custom Foods ist eine zusätzliche Policy.

---

## Nicht gebaut

- Keine Tabelle `nutrition.foods_custom`.
- Keine Migration und kein Kettenschritt.
- Keine Änderung an `nutrition.meal_items`.
- Keine Änderung an `nutrition.foods`, `nutrition.food_nutrients` oder
  `food_search`.
- Keine Änderung an `daten/schema-sollstand.json`.
- Kein Commit und kein Push.
