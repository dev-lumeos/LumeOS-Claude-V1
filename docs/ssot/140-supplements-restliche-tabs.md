# 140 — Supplements: die restlichen Tabs

**Auftrag G-91** · gemessen am 2026-08-20 gegen die laufende Instanz,
Konto `dev@lumeos.app` (`d15fb34f-…ae1a6`).

Herkunftsmarker: `[cmd]` gemessen · `[read]` gelesen · `[annahme]` angenommen.

---

## Welcher Tab welche Spalte bekommt

`[cmd]` **Zuerst die Namen richtigstellen.** Der Auftrag spricht von
`Timing`, `Insights` und `Extended`. **Ein Tab `Timing` und ein Tab
`Insights` existieren nicht.** Die elf Tabs heissen:

Today · Stack · Extended · Catalog · Stacks · Intelligence · Inventory ·
Injections · Compliance · Interactions · Cost

**`Timing` ist längst gebaut** — nicht als Tab, sondern als Gruppierung
in `Today`: `[cmd]` `tabs.tsx:129-131` gruppiert die Positionen nach
`stack_items.timing`, seit G-37. **`stack_items.timing` ist auf allen 8
Zeilen gefüllt** (morning 4 · evening 2 · with_meal 2). Der Auftrag
fragt, „ob die Spalten reichen" — sie reichen, und sie werden bereits
benutzt.

**`Insights` ist der Sache nach `Intelligence`.** Der Auftrag hat recht,
dass es der heikelste ist; siehe unten.

### Die Zuordnung, gemessen

| Tab | Spalte / Quelle | Urteil |
|---|---|---|
| **Catalog** | `supplement_catalog`: `name`, `category`, `evidence_grade`, `serving_size`/`_unit`, `timing_default`, `cost_per_serving`, `benefits` — **alle 44/44 gefüllt** | **gebaut** |
| Stacks | `user_stacks` (`name`, `goal`, `source`, `is_active`) | 1 von 4 Kacheln hätte Daten → Attrappe |
| Intelligence | `nutrition.micronutrient_snapshot` + `supplement_catalog.nutrients_provided` | **an einer Einheit gescheitert** → Attrappe |
| Extended | `enhanced_substances` | **Tabelle existiert nicht** → Attrappe |
| Interactions | `supplement_interactions` | **0 Zeilen, bewusst** (C-108) → Attrappe |
| Injections | Volumina belegt, `rest_days`/Nadelstärke nicht (C-109) | Attrappe, Grafikfrage offen |

---

## Was echt wurde

**Ein Tab: `Catalog`.** `[cmd]` **Attrappenmarken 22 → 20**, im Browser
gezählt (A-24), gegengeprüft am Quelltext.

| Tab | vorher | nachher |
|---|---:|---:|
| **Catalog** | **2** | **0** |
| Stacks | 4 | 4 |
| Intelligence | 7 | 7 |
| Injections | 6 | 6 |
| Interactions | 3 | 3 |
| Today · Stack · Inventory · Compliance · Cost | 0 | 0 |
| Extended (Gate-Seite) | 0 | 0 |

### Was der Tab zeigt — je Kachel die Spalte

| Anzeige | Spalte |
|---|---|
| Name + Nutzen | `name`, `benefits` (44/44) |
| Evidenzstufe | `evidence_grade` — **S 4 · A 13 · B 16 · C 7 · D 4** |
| Kategorie | `category` (10 Kategorien) |
| Serving | `serving_size` + `serving_unit` (44/44) |
| Timing | `timing_default` (44/44) |
| €/serving | `cost_per_serving` (44/44) |
| In stack | Abgleich gegen `stack_items` des aktiven Stacks |
| Stufenfilter mit Zahl | **gezählt** aus dem Katalog, nicht gesetzt |

`[cmd]` **Im Browser geprüft:** Der Filter „S · 4" liefert genau 4
Zeilen. Creatine Monohydrate und Vitamin D3 tragen `active` — dieselben
zwei, die auch in SQL im aktiven Stack stehen.

### Was der Entwurf zeigt und der Tab weglässt

**1. Das Gewicht je Evidenzstufe.** `[cmd]` Die Vorlage führt
S 1.00 · A 0.90 · B 0.75 · C 0.50 · D 0.25 · F 0.00 und schreibt dazu:
*„Weight feeds the evidence-weighted compliance score exported to
Goals."* **Diese Zahlen stehen ausschliesslich in `spec-daten.ts:41-48`
— keine Spalte, keine Quelle, und den beschriebenen Score gibt es
nicht.** Die Legende bleibt in der Entwurfsfassung mit ihrer Marke.

**2. Die Spalte „Mode" (standard/enhanced).** `[cmd]`
`supplement_catalog` führt kein solches Feld, `enhanced_substances`
existiert nicht. Alle 44 pauschal „standard" zu nennen wäre eine
erfundene Einstufung.

**3. Die Spalte „Dose".** `[cmd]` `typical_dose_min`, `typical_dose_max`
und `dose_unit` sind **auf allen 44 Einträgen leer**;
`serving_size`/`serving_unit` auf allen 44 gefüllt. Der Tab zeigt
deshalb die **Portionsgrösse**.

`[read]` **Das ist die schärfste Grenze des Auftrags:** *„Eine Dosis
zeigen ist etwas anderes, als eine zu raten."* Eine Portionsgrösse steht
in der Tabelle; eine Empfehlung stünde nirgends.

**4. Die Begründung der Stufe.** `[cmd]` `evidence_summary` ist **0/44**,
`evidence_sources` auf allen 44 ein **leeres Feld** (`[]`). Der
Buchstabe liegt vor, seine Begründung nicht — und der Tab sagt das an
Ort und Stelle, statt die Lücke zu verschweigen.

---

## Was Attrappe bleibt und warum

### Intelligence — an einer Einheit gescheitert

**Das ist der interessanteste Befund des Auftrags.** F-02 nannte
Intelligence blockiert durch *„Katalogpflege und einen Mikro-Lesepfad
aus Nutrition"*. `[cmd]` **Der Lesepfad existiert inzwischen:**
`nutrition.micronutrient_snapshot(user, datum)` liefert je Nährstoff
`actual_value`, `reference_value`, `reference_kind` und
`reference_status` — für `dev` am 2026-08-20 **acht Zeilen mit echten
Werten**.

`[cmd]` **Und die Zuordnung trägt: 7 der 8 Codes** kommen auch in
`supplement_catalog.nutrients_provided` vor (VITC, VITD, FE, CA, MG, ZN,
VITB12).

**Trotzdem ist die Gap Analysis nicht baubar — wegen der Einheiten:**

| Code | Einheit im Supplement | Einheit im Mikro-Pfad | |
|---|---|---|---|
| VITD | **IU** | **µg** | **Abweichung** |
| VITB12 | `mcg` | `µg` | dieselbe Grösse, andere Schreibweise |
| CA · FE · MG · VITC · ZN | mg | mg | gleich |

`[cmd]` **Was naives Addieren ergäbe:** Vitamin D 14,5 µg aus dem Essen
plus 5.000 „aus dem Supplement" gegen einen Referenzwert von 15 —
**33.430 %.** Richtig umgerechnet sind 5.000 IU = 125 µg, also rund
**930 %**. **Ein Faktor 40 Unterschied**, und die falsche Zahl sähe
genauso aus wie eine gemessene.

`[cmd]` **Ein Umrechnungsfaktor liegt nirgends im Repo** — weder in
`supabase/`, noch in `apps/web/src/lib/`, noch im Vorgängerrepo
(gesucht nach `IU`, `conversion_factor`, `0.025`, `40`). `[read]` Einen
zu setzen wäre genau die Zahl ohne Beleg, die die Regel verbietet — und
das Schema gehört Codex.

**Betroffen ist genau eine Zeile:** von 11 Einträgen mit
`nutrients_provided` benutzt **nur Vitamin D3** `IU`.

**Dazu kommt der zweite Blocker aus F-02, unverändert:** `[cmd]`
`nutrients_provided` ist auf **11 von 44** Einträgen gefüllt. Von den 4
Positionen im aktiven Stack tragen nur 2 Nährstoffe (Magnesium,
Vitamin D3); Creatin und Omega-3 haben `{}`.

`[cmd]` **Die übrigen Kacheln des Tabs** haben ohnehin keine Grundlage:
*„Session today · Push B"* verlangt eine Verknüpfung zum Trainingsplan,
*„Redundancies > 150 % RDA"* eine Einstufung, die das Modul nicht abgibt.

### Stacks — 1 von 4 Kacheln hätte Daten

| Kachel | Lage |
|---|---|
| My stacks | `user_stacks` **hat Daten — aber für `dev` genau 1 Zeile**, also eine Liste mit einem Eintrag |
| System templates (5 kuratierte) | `[cmd]` **`stack_templates`/`stack_template_items` existieren nicht** |
| Frequency options | keine Tabelle; `frequency` ist auf allen 8 Positionen `daily` |
| Item customization | `cycling` ist auf **allen 8 Positionen leer** |

`[cmd]` **Und eine Behauptung der Vorlage stimmt nicht:** die Kachel
schreibt *„only one active at a time · DB EXCLUDE constraint"*.
**`user_stacks` hat keinen solchen Constraint** — geprüft gegen
`pg_constraint`: es gibt CHECKs auf `goal`, `source`, `item_count`,
`name` und den Fremdschlüssel, **keinen EXCLUDE**. In der Tabelle stehen
zwei Zeilen `is_active = true` (verschiedene Nutzer), die Regel ist also
ungeprüft.

`[read]` **Der Lesepfad müsste ausserdem erweitert werden:**
`getStackDaten()` holt mit `.eq('is_active', true)` **nur den aktiven
Stack** und behält davon `stack_name`/`stack_goal`. Eine Liste aller
Stacks gibt es nicht.

### Extended — die Tabelle fehlt ganz

`[cmd]` **`enhanced_substances` existiert nicht** (geprüft gegen
`information_schema.tables`; gefunden werden nur
`medical.medication_active_substances` und die
`substance_aliases`-Familie). Der Tab zeigt Hormon- und
Peptidprotokolle aus `EXTENDED_STACK` in `daten.ts`.

`[cmd]` **`experience_level` steht seit C-140 in `public.profiles` — und
ist auf allen 5 Profilen `NULL`.** Der Auftrag fragt, ob der Tab ohne
ihn etwas zeigen kann: **Er zeigt bereits ohne ihn etwas** — die
Freischaltseite `ExtendedGate` ist reiner Oberflächenzustand
(`React.useState(false)`), an kein Feld gebunden. **Wer klickt, sieht
die Protokolle.**

`[read]` **Das ist kein Fund gegen den Tab, sondern für den nächsten
Auftrag:** ein Gate, das nur ein `useState` ist, schützt nichts. Woran
es hängen soll — `experience_level`, eine ärztliche Bestätigung, etwas
anderes — ist eine Produktentscheidung. F-02 nennt Extended
ausdrücklich *„eigener Auftrag mit eigener Sorgfalt, nie Beifang"*, und
der Auftrag wiederholt es.

### Interactions und Injections — unverändert

`[cmd]` **Interactions:** `supplement_interactions` hat **0 Zeilen**,
bewusst (C-108). Die 29 Kimi-Warnregeln sind nicht übernommen (C-133).
**Nichts getan** — und keine Wechselwirkung eingestuft.

`[cmd]` **Injections:** unangetastet. `InjektionsKarte` bleibt
aufgelöst-frei (G-53 hängt an der Grafikfrage), `rest_days` und
Nadelstärke sind weiter unbelegt (C-109).

---

## Was `Insights` und `Extended` bräuchten

### Intelligence (das „Insights" des Auftrags)

**In dieser Reihenfolge:**

1. **Eine Einheitenbrücke für Vitamin D.** Entweder ein belegter Faktor
   (IU → µg) an einer Stelle, die beide Seiten lesen, oder
   `nutrients_provided` in µg. **Eine Zeile Datenpflege, aber eine
   Entscheidung** — und ein Codex-Auftrag, kein Oberflächen-Auftrag.
2. **`nutrients_provided` von 11 auf 44.** Ohne das deckt die Analyse
   nur ein Viertel des Katalogs.
3. **Dann ist die Gap Analysis rechenbar** — Essen aus
   `micronutrient_snapshot`, Supplement aus `nutrients_provided`,
   Referenz aus derselben Funktion. **Der Lesepfad ist da.**

`[read]` **Was auch dann draussen bleibt:** der Auftrag ist eindeutig —
wenn der Tab **Zusammenhänge behauptet** (*„dein Vitamin D korreliert
mit …"*), bleibt das Attrappe; das ist Buddys Aufgabe und braucht
C-133. **Eine Abdeckung zeigen ist etwas anderes als einen Zusammenhang
behaupten** — dieselbe Trennung wie bei Dosis zeigen gegen Dosis raten.
**„Redundancies" ist bereits eine Einstufung** und gehört zur zweiten
Sorte.

### Extended

1. **`enhanced_substances`** — laut Spec ~85 Einträge, 200 Kandidaten in
   der CSV. Eigener Auftrag.
2. **Ein Gate, das trägt.** Der heutige ist ein `useState`. Woran er
   hängen soll, ist offen — `experience_level` ist da, aber leer.
3. **C-113 gilt:** planen, protokollieren, warnen. **Keine Empfehlung.**

---

## Nachweis

| Prüfung | Ergebnis |
|---|---|
| `pnpm gate` | **8/8 grün** — baut nach `.next-gate`, Dev-Server unberührt (später rot aus fremdem Grund, s. u.) |
| Tests | **418 grün, 0 rot** (vorher 411 — **7 neue**) |
| Marken im Browser gezählt (A-24) | **22 → 20**; Catalog 2 → 0 |
| Gegenprobe am Quelltext | Catalog 2 · Stacks 4 · Intelligence 7 — deckungsgleich |
| Evidenzverteilung | Anzeige **S 4 · A 13 · B 16 · C 7 · D 4** = SQL |
| Filter geprüft | „S · 4" liefert genau 4 Zeilen |
| „In stack" | Creatine + Vitamin D3 = die 2 Katalog-Positionen des aktiven Stacks |
| Zeilenschutz | `test-user@lumeos.local`: **Stacks 0 · Positionen 0 · Einnahmen 0 · Katalog 44** — genau wie verlangt |

`[read]` **Der Katalog ist absichtlich für alle sichtbar** — er ist
kuratierte Referenz, kein Nutzerbestand. Deshalb trägt der neue Tab für
jedes Konto, während der Stack privat bleibt.

### Zwei Einschränkungen, offen gesagt

`[cmd]` **1. Die Bildschirmfotos fehlen.** Der Tab ist im Browser
angemeldet als `dev@lumeos.app` geprüft — Tabelle, Sortierung nach
Stufe, Filter, „In stack", Markenzahl 0 —, **aber die Aufnahmen in hell
und dunkel und über vier Breiten fehlen.** Die Browsersitzung wird von
mehreren Agenten geteilt; sie ist zuletzt dauerhaft auf der Seite eines
anderen Moduls stehengeblieben und hat jede Navigation mit Zeitüberlauf
quittiert. **Statt weiter dagegen zu klicken: gemeldet.** Die
Messwerte oben stammen aus der Zeit davor und sind am Quelltext
gegengeprüft.

`[cmd]` **2. Ich habe die Build-Trennung verletzt — und es hat genau den
Schaden angerichtet, vor dem die Regel warnt.** Zweimal `next build`
ohne `LUMEOS_DIST_DIR` aufgerufen, also **in `.next`**, während mein
eigener Dev-Server daraus auslieferte; danach dreimal `.next` gelöscht.
Ergebnis: 404 für die angemeldete Seite bei gleichzeitig gesundem
Server, und eine lange Fehlersuche an der falschen Stelle.

`[cmd]` **Die Trennung ist nachgeprüft und intakt:**
`apps/web/next.config.js:23` liest `LUMEOS_DIST_DIR` mit Rückfall
`.next`; `pnpm gate` setzt `.next-gate`. **Beide Verzeichnisse liegen
jetzt nebeneinander.** Der Gate-Lauf oben ist mit `pnpm gate` gemacht
und hat den Dev-Server in Ruhe gelassen.

### Und ein Nebenbefund, der niemandem gehört

`[cmd]` **Die Kodierungsprüfung des Gates schlägt inzwischen an — auf
Build-Artefakten.** Fünf Befunde in drei Dateien, alle unter
`apps/web/.next-g90/`:
`vendor-chunks/next@14.2.35…js`, `static/chunks/main-app.js` und
`static/chunks/polyfills.js` (3×) — jeweils ein Ersetzungszeichen
`U+FFFD`.

**Das sind erzeugte Dateien**, aus dem Build-Verzeichnis eines
parallel laufenden Agenten (`LUMEOS_DIST_DIR=.next-g90`). `[cmd]`
**Meine fünf Dateien sind sauber** — kein `U+FFFD`, kein BOM, einzeln
geprüft.

`[read]` **Der eigentliche Fund ist die Lücke:** `tools/encoding-pruefen.mjs`
prüft **3.846 Dateien** und nimmt `.next*` nicht aus. Solange jeder
Agent in ein eigenes `.next-<auftrag>` baut — was seit B-18 genau
richtig ist —, kann jeder Build das Gate für alle rot färben, ohne dass
eine Quelldatei betroffen wäre. **Ein Ausschluss für Build-Verzeichnisse
gehört in die Prüfung.**

## Geändert

| Datei | |
|---|---|
| `apps/web/src/app/v2/supplements/tab-katalog-echt.tsx` | **neu** — der angebundene Catalog-Tab |
| `apps/web/src/app/v2/supplements/__tests__/katalog-echt.test.ts` | **neu** — 7 Prüfungen |
| `apps/web/src/app/v2/supplements/ansicht.tsx` | Tab verdrahtet, mit Rückfall auf den Entwurf |

## Offen — für Tom

1. **Vitamin D in `nutrients_provided` steht in IU, der Mikro-Pfad in
   µg.** Eine Zeile — aber sie blockiert die ganze Gap Analysis, und
   der Faktor liegt nirgends im Repo. **Codex-Auftrag.**
2. **`nutrients_provided` 11 von 44.** Ohne Pflege deckt Intelligence
   ein Viertel ab.
3. **Der Extended-Gate ist ein `useState`** und schützt nichts. Woran
   soll er hängen?
4. **Die Kachel „My stacks" behauptet einen EXCLUDE-Constraint, den es
   nicht gibt** — zwei Zeilen stehen auf `is_active = true`.
5. **Das Gewicht je Evidenzstufe** (S 1.00 … F 0.00) und der davon
   gespeiste „Score für Goals" haben weder Spalte noch Quelle. Streichen
   oder belegen?
6. **`tools/encoding-pruefen.mjs` nimmt `.next*` nicht aus.** Seit jeder
   Agent in ein eigenes Build-Verzeichnis baut, kann ein fremder Build
   das Gate für alle rot färben — heute `.next-g90`, morgen ein anderes.
   Ein Ausschluss ist eine Zeile.
