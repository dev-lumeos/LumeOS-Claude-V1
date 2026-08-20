# Die vier Medical-Felder und der Erfahrungsgrad (G-80)

**Stand:** 2026-08-20 · **Auftrag:** G-80 · **Zweig:** `dev`

Herkunftsmarker nach `docs/spezifikation/10-plattform/konventionen/`:
`[cmd]` gemessen · `[read]` gelesen · `[annahme]` angenommen.

Vorgeschichte: `docs/ssot/109-medical-anbindung.md` (G-46 baute die
Herkunftsspalte, G-60 liess sie mit der Flachliste wegfallen),
`docs/ssot/119-vorlieben-tab.md` (G-65, das Leerzustandsmuster).

---

## Kurzfassung

`[cmd]` **Drei der vier Felder sind sichtbar**, das vierte trägt keine
Information. **Der Erfahrungsgrad hat keine Spalte** — die Kachel steht
als Leerzustand.

| | |
|---|---|
| `reference_source` `[cmd]` | in Liste **und** Popup — **1 Katalogfall** sichtbar |
| `lab_name` `[cmd]` | im Popup je Messung — 2 Labore im Bestand |
| `report_time` `[cmd]` | im Popup als Unterzeile — 5 von 5 gefüllt |
| `fasting_status` `[cmd]` | **auf allen 140 Zeilen `unknown`** — Anzeige gebaut, zeigt heute nichts |
| Erfahrungsgrad `[cmd]` | **Spalte fehlt** — Kachel sichtbar, Auswahl gesperrt |
| `pnpm gate` `[cmd]` | 8 von 8 grün · **388 Tests** |

---

## 1. Was die vier Felder zeigen

`[cmd]` **Alle vier lagen bereits im Lesepfad** — sie wurden nur nicht
angezeigt. Drei liefert `lab_result_values_read` mit; das vierte nicht
(Abschnitt 2).

### `reference_source` — die Herkunft ist zurück

`[read]` Der Befund aus G-63: *„Dass ein Bereich ein Rückfall ist,
sieht man heute nicht mehr."* **In G-46 war es ausdrücklich gebaut** —
*Quelle `Katalog`, als solcher beschriftet* — und fiel mit der
Flachliste weg (G-60).

`[cmd]` **Die Verteilung im Bestand:** 138 `lab_report` · **1
`catalog_fallback`** · 1 `none`.

**Gebaut als Unterzeile in der Bereichsspalte, nicht als eigene
Spalte.** `[read]` Der Grund: die Vorlage hat keine, und **138 von 140
Zeilen zeigten „Befund"** — eine Spalte, die fast überall dasselbe sagt,
kostet Platz ohne Aussage. Gezeigt wird deshalb nur die Abweichung:

- **`Katalog`** als Pille, wo der Befund keinen eigenen Bereich brachte
- **„kein Bereich"**, wo es gar keinen gibt

`[cmd]` **Im Browser: 1 von 37 Zeilen trägt die Pille** — Calcium, genau
der Fall aus G-46.

**Im Popup steht sie je Messung**, samt Erklärung darunter:

> *„Katalog heisst: der Befund hat keinen eigenen Bereich mitgeliefert,
> und der Bereich stammt aus dem Biomarker-Katalog. Jedes Labor führt
> eigene Bereiche — der des Befunds gilt, wo es einen gibt."*

`[cmd]` Der Satz erscheint **nur, wenn ein Rückfall vorkommt** — sonst
wäre er eine Erklärung für etwas, das nicht da ist.

### `lab_name` und `report_time` — im Popup

`[read]` Der Befund aus G-63: *„Wer mehrere Befunde hat, sieht heute
nicht, von welchem Labor sie stammen. Bei fünf Befunden über sechs
Monate ist das relevant — Labore messen verschieden."*

`[cmd]` **Zwei Labore im Bestand:** `LumeOS Testlabor` (4 Befunde,
2025-12-06 bis 2026-06-05) und `C-72 Testlabor` (1 Befund).

**Die Popup-Tabelle ist die Stelle dafür**, nicht die Liste: die Liste
zeigt eine Zeile je Marker, das Popup jede Messung einzeln. Dort steht
jetzt:

| Date | Value | Labor | Bereich |
|---|---|---|---|
| 2026-06-05 · 09:20 | 102 mg/dL | LumeOS Testlabor | Befund |
| 2026-04-05 · 09:20 | 99 mg/dL | LumeOS Testlabor | Befund |

`[cmd]` **`report_time` als Unterzeile unter dem Datum**, nicht als
eigene Spalte — sie gehört zum Datum. 5 von 5 Befunden führen eine
(09:20).

### `fasting_status` — gebaut, aber ohne Inhalt

`[cmd]` **Auf allen 140 Zeilen steht `unknown`.** Die Prüfbedingung
erlaubt `fasting` | `non_fasting` | `unknown`.

`[read]` **Toms Entscheidung:** *„`unknown` ist keine Angabe, sondern
deren Fehlen. 140-mal ‚unbekannt' anzuzeigen sagt weniger als nichts —
es füllt eine Spalte, ohne zu informieren."*

**Die Anzeige ist trotzdem gebaut**, aber sie zeigt nur `fasting` und
`non_fasting`. Sobald ein Import die Angabe liefert, steht sie da; heute
erscheint nichts.

---

## 2. Was `fasting_status` bräuchte, um zu wirken

**Der Auftrag verlangte, das vorher zu prüfen.** `[cmd]` Geprüft:

### Es gibt keine getrennten Bereiche

`[cmd]` **`medical.biomarker_reference_ranges` führt 19 Spalten** —
`range_type`, `sex`, `age_min_years`, `age_max_years`, `population`,
aber **keine Nüchtern-Unterscheidung.** Der einzige `fasting_status` im
ganzen Schema sitzt auf `lab_result_values` selbst.

`[cmd]` **`population` trägt es nicht:** alle 560 Zeilen stehen auf
`general`.

**Damit ist die Antwort eindeutig:** `fasting_status` kann heute nur als
**Angabe** stehen, nicht als **Umschalter**. Es gibt keinen zweiten
Bereich, auf den er umschalten könnte.

### Aber die Unterscheidung existiert bereits — im LOINC

`[cmd]` **Der wichtigere Fund.** Der Bestand führt zwei Glukose-Codes:

| LOINC | `long_common_name` |
|---|---|
| **1558-6** | **Fasting** glucose [Mass/volume] in Serum or Plasma |
| **2345-7** | Glucose [Mass/volume] in Serum or Plasma |

`[cmd]` Der Wert der Nutzerin steht auf **`1558-6`** — dem
nüchtern-spezifischen Code. Und die kuratierten Bereiche unter
`curated_slug = 'glucose_fasting'` (65–99 mg/dL Labor, 70–85 optimal)
hängen an **`2345-7`**.

**Die Nüchtern-Information steckt also im Code, nicht in einer
Bereichsspalte.**

### Was das für `fasting_status` heisst — Toms Einordnung

`[read]` **Tom dazu:** *„Der LOINC-Code sagt, was das Labor messen
wollte. `fasting_status` sagt, ob der Patient tatsächlich nüchtern war.
Das ist nicht dasselbe — und bei einem Wert, der nicht als Fasting
codiert ist, wäre die Angabe die einzige Quelle."*

**Damit ist `fasting_status` teilweise redundant, aber nicht
überflüssig:**

| Frage | Quelle |
|---|---|
| Was sollte gemessen werden? | **LOINC-Code** — präzise, auf 35 von 37 Markern gesetzt |
| War die Person tatsächlich nüchtern? | **`fasting_status`** — heute leer |

`[cmd]` **Vier Marker im Bestand wären betroffen:** `glucose_fasting`,
`insulin_fasting`, `triglycerides`, `hba1c`.

`[read]` **Ob `fasting_status` überhaupt gebraucht wird, oder ob der
LOINC-Code reicht, ist eine Schemafrage** — keine Anzeigefrage. Tom
entscheidet sie, wenn der Importpfad ansteht. **Gemeldet, nicht
entschieden.**

---

## 3. Wo der Erfahrungsgrad sitzt

**Tom, 2026-08-19:** *„Wir brauchen in Settings und Onboarding eine
Deklaration des Users, welches Level er hat."* Und zur Zahl der Stufen:
*„starten wir mal damit, ist ja jederzeit ausbaubar."*

### Die Spalte gibt es nicht

`[cmd]` **`public.profiles` führt 14 Spalten**, keine davon nimmt einen
Erfahrungsgrad auf:

```
id · created_at · updated_at · birth_date · biological_sex ·
height_cm · body_weight_kg · activity_level · nutrition_goal ·
pregnancy_* (2) · lactation_* (2) · locale
```

`[cmd]` **`activity_level` ist etwas anderes.** Es beschreibt, **wieviel**
jemand sich bewegt, und trägt einen TDEE-Faktor (1,2 bis 1,9) — nicht,
**wie erfahren** er dabei ist. **Ein Anfänger kann `very_active` sein.**

### Gebaut als Leerzustand

`[read]` **Toms Entscheidung:** *„Genau das Muster aus G-65: Die
Ausschluss-Kachel bekam den Leerzustand, als C-93 noch lief — und die
Presets waren zwei Stunden später da. Die Form stand bereits, der Agent
musste sie nicht neu bauen."*

**Die Kachel steht in `/v2/settings`, neben „Aktivität":**

| Stufe | Beschreibung |
|---|---|
| **Beginner** | Erste Schritte — Grundlagen und Technik |
| **Advanced** | Mehrere Jahre Erfahrung, eigene Routine |
| **Pro** | Strukturierte Periodisierung, Wettkampfnähe |
| **Elite** | Leistungssport, Betreuung im Team |

`[cmd]` **Alle vier Knöpfe sind `disabled`** — im Browser nachgezählt: 4
gefunden, 4 gesperrt. Darunter steht:

> *„Die Angabe lässt sich noch nicht speichern — im Profil gibt es kein
> Feld dafür. Sobald es da ist, steht die Auswahl hier bereit."*

`[read]` **Zwei Auflagen von Tom, beide umgesetzt:**

- **Der Hinweis nennt die Sache, nicht die Punktnummer.** Nicht „wartet
  auf C-118" — *„der Nutzer weiss nicht, was ein Seed ist"* gilt
  sinngemäss auch hier.
- **Keine Attrappenmarke.** `[cmd]` Im Browser nachgezählt: **0 Marken
  auf der Seite.** `[read]` *„Die Marke sagt ‚hier stehen erfundene
  Zahlen' — hier stehen keine. Ein Leerzustand ist kein
  Attrappenzustand."*

`[cmd]` **Die vier Stufen stehen in `lib/profile/profile-model.ts`**
neben `ACTIVITY_LEVEL_INFO` — dort, wo der nächste Durchgang sie
findet. Sie sind Toms Entscheidung, keine Erfindung dieser Sitzung.

### Nicht zu verwechseln mit der Autonomy-Stufe

`[read]` Der Auftrag verlangt es ausdrücklich im Bericht, *„damit sie
niemand zusammenlegt"*:

| | Erfahrungsgrad (C-118) | Autonomy (C-71) |
|---|---|---|
| **Art** | **Selbstauskunft** | **Fremdeinschätzung** |
| **Wann** | bevor das System etwas weiss | aus beobachtetem Verhalten |
| **Quelle** | die Nutzerin sagt es | das System leitet es ab |

**Beide beschreiben Reife, aus verschiedenen Richtungen.** Sie können
auseinanderfallen — und dann **ist die Abweichung die Aussage**. Wer sie
zusammenlegt, verliert beide.

### Onboarding gibt es nicht

`[cmd]` **Geprüft:** die einzige Onboarding-Datei im Repo ist
`v2/coach/tab-onboarding.tsx` — der **fünfschrittige Assistent einer
Trainerin für ihre Klienten** (`module-coach-meta.jsx:77-147`), nicht
das Onboarding einer Nutzerin.

`[read]` Der Auftrag sah das vor: *„Im Vorgängerrepo war
`FoodPreferences.tsx` der Preferences-Tab, kein Onboarding. Wenn hier
keines existiert: melden."* **Es existiert keines.** Der zweite Ort aus
Toms Satz ist damit heute nicht baubar.

---

## 4. Was fehlt und gemeldet ist

| Was | Befund | Folge |
|---|---|---|
| **Erfahrungsgrad-Spalte** | `[cmd]` fehlt in `public.profiles` | Kachel gesperrt; **Schemaarbeit, nicht Anzeigearbeit** |
| **Nutzer-Onboarding** | `[cmd]` existiert nicht | Der zweite Ort aus Toms Satz fehlt |
| **`fasting_status` im Bestand** | `[cmd]` 140× `unknown` | Anzeige gebaut, zeigt nichts |
| **Nüchtern-Bereiche** | `[cmd]` keine Spalte in `biomarker_reference_ranges` | `fasting_status` kann nie umschalten, nur anzeigen |
| **`fasting_status` in der Lesefunktion** | `[cmd]` `lab_result_values_read` liefert ihn **nicht** | Aus der Rohtabelle nachgeladen — im bestehenden Zugriff, ohne zusätzliche Abfrage |
| **LOINC gegen `fasting_status`** | `[cmd]` `1558-6` ist bereits *Fasting* glucose | **Schemafrage:** braucht es beides? |

### Ein Fund am Rande

`[cmd]` **`lab_result_values_read` gibt `report_time`, `lab_name` und
`reference_source`, aber keinen `fasting_status`** — geprüft gegen
`pg_get_function_result`. Er kommt deshalb aus dem zweiten, schmalen
Zugriff auf die Rohtabelle, den es für die Zuordnungsfelder ohnehin gibt.
**Eine Spalte mehr, keine zusätzliche Abfrage.**

`[read]` **Kein Schema geändert** — der Auftrag verbietet es, und die
Funktion zu erweitern wäre genau das.

---

## 5. Nachweis

### Angemeldet, beide Modi

`[cmd]` Als `dev@lumeos.app`, hell und dunkel:

| | |
|---|---|
| Liste | Calcium mit `Katalog`-Pille — **1 von 37 Zeilen** |
| Popup Glukose | vier Messungen mit Datum, Uhrzeit, Labor, Bereichsherkunft |
| Popup Calcium | `Katalog` plus die Erklärung darunter |
| Settings | vier Stufen, alle gesperrt, mit Hinweis |

`[cmd]` **Der Katalog-Rückfall ist erkennbar** — Calcium, der Fall aus
G-46, wie der Auftrag verlangt.

### Der Erfahrungsgrad

`[cmd]` **Er speichert nicht — die Spalte fehlt, gemeldet.** Der
Auftrag sah beide Fälle vor. Im Browser nachgezählt: 4 Knöpfe, **4
`disabled`**, **0 Attrappenmarken**.

### Zeilenschutz

`[cmd]` Als `test-user@lumeos.local` im Browser: **0 Tabellenzeilen**,
keine `Katalog`-Pille, **kein Laborname sichtbar**.

`[cmd]` **An der Datenbank gegengeprüft:**

| Rolle `authenticated`, `sub` = | Werte | Befunde | Profile | Katalog |
|---|---|---|---|---|
| `dev@lumeos.app` | 140 | 5 | 1 | 11.676 |
| `test-user@lumeos.local` | **0** | **0** | **1** | **11.676** |

`[cmd]` **Und der Quergriff:** test-user fragt ausdrücklich nach den
Befunden von dev → **0**; über die Lesefunktion mit dev-Id → **0**.
Jeder sieht genau ein Profil — das eigene. Der Katalog bleibt öffentlich.

### Breiten und Gate

`[cmd]` Seitenüberlauf bei **375 · 768 · 1024 · 1440 px: keiner.**

| | |
|---|---|
| `pnpm gate` `[cmd]` | **8 von 8 grün** |
| Alle Tests `[cmd]` | **388 von 388** |

**Ein Fehlschlag, der keiner war:** `[cmd]` Der erste Gate-Lauf brach
beim Bauen von `/v2/coach` ab (`TypeError: e[o] is not a function` im
Webpack-Runtime). **`/v2/coach` ist von niemandem angefasst** — der
Cache in `.next` war durch die parallelen Änderungen veraltet. Nach dem
Löschen läuft der Bau durch.

---

## 6. Was als Nächstes ansteht

1. **Die Erfahrungsgrad-Spalte anlegen** — vier Werte, `CHECK`-Bedingung
   wie bei `activity_level`. Danach ist die Kachel in einem Zug
   bedienbar.
2. **Entscheiden, ob `fasting_status` bleibt** (2) — der LOINC-Code
   trägt die Absicht bereits; die Angabe trüge die Tatsache.
3. **`fasting_status` in den Seeds füllen** — dann zeigt die gebaute
   Anzeige etwas.
4. **Nutzer-Onboarding** — existiert nicht; der zweite Ort aus Toms Satz
   wartet darauf.
5. **`lab_result_values_read` um `fasting_status` erweitern** — dann
   entfällt der Umweg über die Rohtabelle.

---

## Nachweise

| Behauptung | Beleg |
|---|---|
| 14 Spalten in `public.profiles`, keine für den Grad | `information_schema.columns` + Suche nach `%level%`/`%experience%`/`%tier%` |
| `reference_source` 138/1/1 | `GROUP BY` auf `lab_result_values_read` |
| Zwei Labore, 5 Befunde | `GROUP BY lab_name` auf `lab_reports` |
| `report_time` 5 von 5 | `count(report_time)` |
| `fasting_status` 140× `unknown` | `GROUP BY fasting_status` |
| Keine Nüchtern-Spalte in den Bereichen | `information_schema.columns` über `medical.*` |
| `population` überall `general` | `GROUP BY population` → 560 Zeilen |
| `1558-6` ist *Fasting* glucose | `long_common_name` aus `biomarker_catalog` |
| Die Lesefunktion liefert `fasting_status` nicht | `pg_get_function_result` |
| Kein Nutzer-Onboarding | `find` über `apps/web/src` → nur `v2/coach/tab-onboarding.tsx` |
| 1 von 37 Zeilen mit Katalog-Pille | im Browser gezählt |
| 4 Knöpfe, 4 gesperrt, 0 Marken | im Browser gezählt |
| Zeilenschutz | `SET LOCAL ROLE authenticated` mit zwei `sub`-Werten + zwei Quergriffe + Browser |
| Der Gate-Fehlschlag war der Cache | `/v2/coach` unverändert; nach `.next`-Löschung grün |
| Gate, Tests | `pnpm gate` 8/8 · 388/388 |
