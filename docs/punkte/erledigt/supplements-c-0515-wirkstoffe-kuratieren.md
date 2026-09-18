---
nr: C-515
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-509
entscheidung: umgesetzt
agent: codex
beauftragt: 2026-09-18
erledigt: 2026-09-08
commit: 855916ed
beruehrt:
  tabellen: [supplements.supplements, supplements.supplement_aliases, supplements.supplement_field_sources, supplements.product_contents]
zahlen:
  gemessen: 2026-09-18
  neue_katalogwurzeln: 21
  neue_etikettenlinks: 151256
  verknuepfte_inhaltszeilen: 790378
---

# C-515 - die Wirkstoffe kuratieren

## Toms Entscheidung

Tom, 2026-09-08, zu C-509:

> c-509 ja machen wir seinen vorschlag

Wirkstoffe werden fachlich kuratiert. Hilfsstoffe bleiben belegte Textaliase fuer die Allergiepruefung; sie erhalten keinen Substanzkatalogeintrag.

## Umsetzung

`supabase/_pipeline/13_supplements/515_wirkstoffe_kuratieren.sql` ist ein idempotenter Aufbaukettenschritt. Er legt 21 Katalogwurzeln an, ergaenzt 23 exakte DSLD-Labelaliase und verknuepft ausschliesslich Zeilen, deren normalisierter `ingredient_name` einem dieser 23 Labelnamen exakt entspricht. Zwei davon (`Caffeine`, `Caffeine Anhydrous`) zeigen auf die bereits vorhandene Katalogwurzel `caffeine`; sie erzeugen keinen zweiten Stoff.

Die Herkunft steht je Label in `supplements.supplement_field_sources` als `identity.c515_dsld_label` mit `source_id = dsld_product_contents:exact_label:<normalisierter-name>`. `evidence_class = A` bedeutet hier nur: direkte DSLD-Etikettquelle belegt die **Stoffidentitaet**. Es ist keine klinische Wirksamkeitsbehauptung; deshalb bleibt `supplements.evidence_grade` bei allen 21 neuen Wurzeln `NULL`.

## A1 und A2 - Einzelfallentscheidung der 47 DSLD-Wirkstoff-Mehrheiten

Die 47 sind die Wirkstoff-Mehrheiten aus der C-509-Top-100-Messung. `ist_wirkstoff` ist ein DSLD-Importflag, keine fachliche Entscheidung. Die Tabelle trennt daher Labelwerte, Sammelbegriffe und echte, eindeutig benannte Wirkstoffe.

| DSLD-Name | Entscheidung | Begruendung |
|---|---|---|
| Calories | ausgeschlossen | Naehrwertetikett, keine Substanz. |
| Total Carbohydrates | ausgeschlossen | Summenwert des Etiketts, keine einzelne Substanz. |
| Sodium | ausgeschlossen | Naehrwertlabel ohne Salz- bzw. Verbindungsform. |
| Total Fat | ausgeschlossen | Summenwert des Etiketts, keine einzelne Substanz. |
| Pantothenic Acid | aufgenommen | Eindeutig benannte Vitamin-B5-Substanz. |
| Protein | ausgeschlossen | Makro-Summenwert; Quelle und Aminosaeureprofil fehlen. |
| Selenium | aufgenommen | Eindeutig benanntes Element; die konkrete Verbindung wird nicht behauptet. |
| Sugar | ausgeschlossen | Naehrwert-Summenwert, kein einzelner Stoff. |
| Chromium | aufgenommen | Eindeutig benanntes Element; die konkrete Verbindung wird nicht behauptet. |
| Calories from Fat | ausgeschlossen | Abgeleiteter Etikettenwert, keine Zutat. |
| Dietary Fiber | ausgeschlossen | Naehrwert-Summenwert, keine einzelne Substanz. |
| Saturated Fat | ausgeschlossen | Naehrwert-Summenwert, keine einzelne Substanz. |
| Cholesterol | ausgeschlossen | Naehrwertlabel, nicht als zugesetzter Wirkstoff belegt. |
| Proprietary Blend | offen | Sammelbegriff ohne einzelne Stoffidentitaet. |
| Total Sugars | ausgeschlossen | Naehrwert-Summenwert, keine einzelne Substanz. |
| Inositol | aufgenommen | Eindeutig benannte Substanz. |
| Added Sugars | ausgeschlossen | Kennzeichnungssumme, keine einzelne Substanz. |
| Docosahexaenoic Acid | aufgenommen | Eindeutig benannte DHA-Fettsaeure. |
| Phosphorus | ausgeschlossen | Naehrwertlabel ohne Phosphat-/Verbindungsform. |
| Trans Fat | ausgeschlossen | Naehrwert-Summenwert, keine einzelne Substanz. |
| Eicosapentaenoic Acid | aufgenommen | Eindeutig benannte EPA-Fettsaeure. |
| Bromelain | aufgenommen | Eindeutig benannte Enzymzubereitung; keine Wirkungs- oder Dosisbehauptung. |
| Vitamin K | ausgeschlossen | K1/K2-Form fehlt; keine Form raten. |
| Lipase | offen | Generische Enzymfamilie ohne Quelle, EC-Nummer oder Aktivitaet. |
| Lutein | aufgenommen | Eindeutig benanntes Carotinoid. |
| Amylase | offen | Generische Enzymfamilie ohne Quelle, EC-Nummer oder Aktivitaet. |
| Protease | offen | Generische Enzymfamilie ohne Quelle, EC-Nummer oder Aktivitaet. |
| Cellulase | offen | Generische Enzymfamilie ohne Quelle, EC-Nummer oder Aktivitaet. |
| Vanadium | aufgenommen | Eindeutig benanntes Element; die konkrete Verbindung wird nicht behauptet. |
| Papain | aufgenommen | Eindeutig benannte Enzymzubereitung; keine Wirkungs- oder Dosisbehauptung. |
| Ginger | aufgenommen | Eindeutig benannter botanischer Ausgangsstoff, kein geratenes Extrakt. |
| Alpha Lipoic Acid | aufgenommen | Eindeutig benannte Substanz. |
| Polyunsaturated Fat | ausgeschlossen | Naehrwert-Summenwert, keine einzelne Fettsaeure. |
| L-Valine | aufgenommen | Eindeutig benannte Aminosaeure. |
| L-Isoleucine | aufgenommen | Eindeutig benannte Aminosaeure. |
| Lactase | aufgenommen | Eindeutig benanntes Enzym; keine Aktivitaet oder Quelle erfunden. |
| Caffeine Anhydrous | bestehende Wurzel | Exakte DSLD-Form auf die vorhandene Wurzel `caffeine`; keine neue Substanz. |
| Rutin | aufgenommen | Eindeutig benannte Substanz. |
| Lactobacillus acidophilus | aufgenommen | Eindeutig benannte Spezies; Stamm und Wirkung bleiben offen. |
| Vitamin B2 | ausgeschlossen | Naehrwertlabel; keine zusaetzliche Form-/Herkunftsbehauptung. |
| Total Omega-3 Fatty Acids | ausgeschlossen | Fettsaeure-Summenwert, keine einzelne Substanz. |
| Coenzyme Q10 | aufgenommen | Eindeutig benannte Substanz. |
| Caffeine | bestehende Wurzel | Exakter DSLD-Name auf die vorhandene Wurzel `caffeine`. |
| PABA | aufgenommen | Eindeutig benannter Stoffname; keine Wirksamkeitsbewertung. |
| Turmeric | aufgenommen | Eindeutig benannter botanischer Ausgangsstoff, kein geratenes Curcumin-Extrakt. |
| Chloride | ausgeschlossen | Naehrwertlabel ohne Salz-/Verbindungsform. |
| Zeaxanthin | aufgenommen | Eindeutig benanntes Carotinoid. |

Die im selben Top-100-Auszug als Hilfsstoff überwiegenden Namen wurden nicht aufgenommen. Darunter bleiben insbesondere `Silica`, `Magnesium Stearate`, `Silicon Dioxide`, `Cellulose`, `Microcrystalline Cellulose`, `Sucralose` und `Soy Lecithin` Textetiketten. Die Artefakte `None` (kein Stoffwert), `Powder` (Darreichungsform) und `Purified` (abgeschnittener Text) sind ebenfalls ausgeschlossen.

## A3 - Quelle und Evidenz je neuer Substanz

| Neue Katalogwurzel | DSLD-Quelle | Evidenzklasse | Aussagegrenze |
|---|---|---|---|
| Pantothenic Acid | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| Selenium | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| Chromium | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| Inositol | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| Docosahexaenoic Acid | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| Eicosapentaenoic Acid | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| Bromelain | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| Lutein | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| Vanadium | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| Papain | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| Ginger | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| Alpha Lipoic Acid | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| L-Valine | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| L-Isoleucine | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| Lactase | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| Rutin | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| Lactobacillus acidophilus | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| Coenzyme Q10 | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| PABA | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| Turmeric | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |
| Zeaxanthin | exakte Dietary-Supplement-Facts-Zeile | A, Identitaet | keine klinische Evidenz |

## A4 und A5 - Ergebnis

| Messung in der laufenden Datenbank | Vorher | Nachher | Differenz |
|---|---:|---:|---:|
| Inhaltszeilen mit `supplement_id` | 639.122 | 790.378 | 151.256 |
| Produkte mit mindestens einem neuen, auswertbaren Wirkstoff | - | 62.296 | 62.296 |

Von den 151.256 neuen Links entfallen 144.233 auf die 21 neuen Katalogwurzeln und 7.023 auf `Caffeine`/`Caffeine Anhydrous` zur bestehenden Caffeine-Wurzel. Die Zahlen zählen Labelzeilen; die Produktzahl ist dedupliziert über `product_id`.

## A6 - Hilfsstoffe bleiben fuer Allergien lesbar

Es gibt **0** C-515-Katalogwurzeln fuer die geprueften Hilfsstoffe. Die drei Textaliase von `supplements:magnesium_stearate` treffen weiter **56.934** unterschiedliche Produkte; **0** dieser Trefferzeilen haben eine `supplement_id`. Die Allergiepruefung arbeitet damit unverändert über `allergen_aliases.alias_text` gegen den Etikettentext und braucht keinen Hilfsstoffkatalog.

## A7 und A8 - keine geratenen Zuordnungen, zweiter Lauf

Die Verknuepfung verwendet nur `nutrition.search_fold` auf beiden vollständigen Labelnamen. Es gibt weder Trigramm- noch Teilwort- oder Wirkungs-Matches. Die fünf offenen Sammelbegriffe bleiben sichtbar offen; Vitamin K und die Naehrwert-/Aggregatlabels werden nicht in eine Substanzform umgedeutet.

| Zustand | erster Lauf | zweiter Lauf |
|---|---:|---:|
| neue Katalogwurzeln | 21 | 21 |
| C-515-Labelaliase | 23 | 23 |
| C-515-Herkunftszeilen | 23 | 23 |
| Links zu neuen Wurzeln | 144.233 | 144.233 |
| Caffeine-Labelverknuepfungen | 7.023 | 7.023 |
| alle verknuepften Inhaltszeilen | 790.378 | 790.378 |

Der zweite Lauf änderte keine dieser Mengen.

## A9 - Sicherung, Vollkette und Waechter

- Sicherung vor dem Neuaufbau: `backup/schema/20260918011308_c43_vor_kettenlauf.sql`.
- Vollkette: **grün**, 243 Schritte, `c515_final`, 1.063,0 Sekunden; Abschluss: `SCHEMA VOLLSTAENDIG`.
- C-515-Schutztest gegen die frische Kette: **grün**.
- `migration-datenlogik-pruefen`: **grün** (44 begründete historische Datenoperationen, keine neue Migrationsdatenlogik). C-515 schreibt ausschliesslich unter `_pipeline/`.
- Nicht berührt: `apps/`, Dev-Server.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen, LIVE.**

    verknuepft    790.378 von 3.000.982  (vorher 639.122)
    Substanzen    617                    (vorher 596)
    Magnesiumstearat: 60.994 Produkte, 0 mit supplement_id

`[cmd]` **+151.256 Zeilen, 62.296 Produkte mit einem neuen
auswertbaren Wirkstoff.**

### Toms Entscheidung, umgesetzt

`[cmd]` **21 neue kuratierte Wurzeln, 23 exakte
DSLD-Labelverknuepfungen** ? **von 100 Kandidaten.**

`[read]` **Er hat 79 NICHT aufgenommen** ? **die
Naehrwertetiketten und Artefakte, vor denen er selbst gewarnt
hatte.**

### Und die Hilfsstoffe bleiben Text, wie beschlossen

> *,,Hilfsstoffe wurden nicht katalogisiert; Magnesiumstearat
trifft weiter 56.934 Produkte ueber Textaliase."*

`[cmd]` **Selbst nachgemessen: 0 von 60.994 haben eine
`supplement_id`, und die Allergiepruefung trifft sie
trotzdem.**

### Eine Nebenentscheidung

> *,,Drei spezifische Kimi-Formen sind als UNTERFORMEN
modelliert; Kerndubletten-Waechter wieder gruen."*

`[read]` **Statt drei Dubletten anzulegen hat er sie unter die
Wurzel gehaengt** ? **derselbe Gedanke wie `parent_id` bei den
Muskeln (E-81).**

**Abgenommen.**

