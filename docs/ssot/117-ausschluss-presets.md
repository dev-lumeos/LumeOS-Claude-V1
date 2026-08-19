# 117 — Ausschluss-Presets für die Lebensmittelsuche (C-93)

Stand: 2026-08-19 · Anker: Zweig `dev` · Auftrag C-93
Herkunft: gebaut und gegen den Bestand gemessen in dieser Sitzung.
Rangfolge: Code > dieses Dokument > Rest.

**Tom, 2026-08-18:** *„Sowas wie keine Innereien wäre für mich
persönlich top, denn esse ich nicht — oder Lamm ausgrenzen."*

`[cmd]` **Elf Presets, 33 Regeln, 3.767 aufgelöste Zuordnungen.** Die
Oberfläche dazu ist G-65 — **hier entsteht nur die Datenseite.**

---

## Welches Preset nach welcher Regel

`[cmd]` Gemessen am 2026-08-19 gegen 7.140 Lebensmittel:

| Preset | Art | Regel | Treffer |
|---|---|---|---|
| **Keine Innereien** | persönlich | Kategorie `innereien` | **131** |
| **Kein Lamm/Schaf** | persönlich | Kategorie `lamm-schaf` | **191** |
| **Kein Wild** | persönlich | Kategorie `wild` | **49** |
| **Keine Meeresfrüchte** | persönlich | Kategorien `schalentiere` + `weichtiere-andere` | **47** |
| **Kein Alkohol** | persönlich | BLS-Präfix `P` | **119** |
| **Kein rohes Fleisch/Fisch** | persönlich | `processing_level='raw'` **und** Präfix U/V/W/T | **389** |
| **Kein Schweinefleisch** | persönlich | Kategorie + Namensmuster − 3 Gegenmuster | **630** |
| **Kein Rindfleisch** | religiös | Kategorien `rindfleisch` + `kalbfleisch` | **298** |
| **Jain** | religiös | Kartoffeln + Wurzelgemüse-Muster | **463** |
| **Halal-konform** | religiös | Schwein + Blut + Alkohol | **761** |
| **Koscher-konform** | religiös | Schwein + Schalen-/Weichtiere + Blut | **689** |

### Wie die Zuordnung funktioniert

`[read]` **Ein Preset ist eine Regel, kein Merkmal je Lebensmittel.**
Deshalb liegen die Regeln in `exclusion_preset_rules` und die Auflösung
ist eine **Sicht** (`exclusion_preset_matches`), keine Tabelle: ein
Nachtrag im Bestand wird automatisch mitgefasst, ohne dass jemand
Zuordnungen nachpflegt.

`[cmd]` Vier Regelarten:

| `rule_kind` | wirkt |
|---|---|
| `category` | Kategorie-Teilbaum über alle Nachfahren |
| `bls_prefix` | erste Stelle des BLS-Codes |
| `name` | regulärer Ausdruck auf `name_de` |
| `name_not` | Gegenausdruck, entfernt **gemessene** Fehltreffer |
| `raw_animal` | `processing_level='raw'` **und** tierischer Präfix |

### Die Kategorie trägt fünf Presets allein

`[cmd]` **Der BLS-Kategoriebaum ist fein genug** — er reicht bis Ebene
4 und führt unter `innereien` neun Unterkategorien (Leber, Herz, Niere,
Lunge, Gehirn, Magen & Kutteln, Zunge, Bries, Blut), darunter
`innereien-leber-rinderleber`, `-schweineleber`, `-kalbsleber` und
`-gefluegelleber`.

**Toms Beispiel geprüft** — alle fünf Lebern sind drin:

| Tier | Einträge |
|---|---|
| Rind | 4 |
| Schwein | 4 |
| Kalb | 4 |
| Hähnchen | 4 |
| Gans | 2 |

`[cmd]` **Die Selbstprüfung im Kettenschritt bricht ab**, wenn eine
davon fehlt — nicht nur die Gesamtzahl 131 wird geprüft, sondern dass
genau fünf Tierarten getroffen sind.

### „Kein Alkohol" trägt der BLS-Präfix

`[cmd]` **Alle 119 Einträge mit Präfix `P` sind alkoholisch.**
Stichprobe je Untergruppe geprüft:

| | |
|---|---|
| P1 Altbier · P2 Eiswein · P3 Apfelwein · P4 Portwein | |
| P5 Bitterlikör · P6 Cognac · P7 Tequila · P8 Alkopops · P9 Cocktails | |

`[read]` **Wasser, Kaffee und Säfte führt der BLS nicht unter `P`** —
die Kategorien dafür sind angelegt, aber leer. Deshalb ist der Präfix
hier die saubere Regel und kein Namensmuster nötig.

### „Kein Schweinefleisch" brauchte Messung

`[cmd]` **Die Kategorie allein reicht nicht:** `schweinefleisch` führt
179 Einträge, aber Schwein steckt auch in Fertiggerichten, Brötchen
und Wurstwaren. Das Namensmuster trifft **657** — davon sind **32
falsch**:

| Fehltreffer | Anzahl | Beispiel |
|---|---|---|
| Wildschwein (ist Wild) | 15 | „Wildschwein Keule, roh" |
| ausdrücklich Rind/Geflügel | 16 | „Rindsbratwurst", „Geflügelsalami" |
| vegetarisch | 1 | „Vegetarische Bratwurst (aus Tofu…)" |

`[cmd]` **Drei Gegenmuster entfernen sie**, das dritte mit einer
Bedingung: es greift nur, wenn *„schwein"* **nicht** im Namen steht.
Gegengeprüft:

| Name | ausgeschlossen? |
|---|---|
| Rindsbratwurst | ✓ ja |
| Geflügelsalami | ✓ ja |
| **Schwein/Rind, Hackfleisch gemischt** | ✗ **nein — bleibt getroffen** |
| Rind/Schwein, Frikadelle | ✗ **nein — bleibt getroffen** |

`[cmd]` **Ergebnis: 630 Treffer, 0 Fehltreffer** in der Nachkontrolle.

---

## Was kein Preset trifft

`[cmd]` **5.153 von 7.140 trifft kein Preset** — das ist der Normalfall
und richtig so: Obst, Gemüse, Brot und Milchprodukte sollen von einer
Ausschlussregel nicht erfasst werden.

`[cmd]` Nach Warengruppe:

| Warengruppe | ohne Preset |
|---|---|
| Fertiggerichte | 944 |
| Menükomponenten | 761 |
| Süßwaren & Gebäck | 458 |
| Gemüse | 421 |
| Fisch & Meerestiere | 377 |
| Milch & Käse | 278 |
| Obst | 275 |

### Die eine echte Lücke: 231 Wurstwaren ohne Tierart

`[cmd]` **Das ist der Befund, der gemeldet gehört.** In der Kategorie
`wurstwaren-aufschnitt` bleiben **231 Einträge** vom Schwein-Preset
unerfasst, weil **der Name die Tierart nicht nennt**:

> Fleischwurst · Cabanossi · Berliner Knacker · Braunschweiger grobe
> Leberwurst · Fleischkäse · Frühstücksfleisch Konserve · Mosaikroulade
> · Brätblock

`[read]` **In der Praxis ist das fast alles Schwein.** Aber **die Daten
sagen es nicht**, und eine Regel, die „Fleischwurst" als Schwein
einstuft, wäre geraten — genau das, was `48-artengruppierung-messung.md`
und `49-zubereitungsschluessel.md` zweimal gemessen haben scheitern
lassen.

**Deshalb steht es als Vorbehalt am Preset** (`caveat_de`: *„Wurstwaren
ohne Tierart im Namen sind nicht erfassbar"*) und nicht als stille
Näherung in der Regel.

`[annahme]` **Was es lösen würde:** eine Tierart-Spalte an `foods`,
kuratiert für die 375 Wurstwaren. Das ist ein eigener Auftrag mit
eigener Messung, kein Nebenprodukt hier.

### Jain: die Kategorien sind leer

`[cmd]` `wurzel-knollengemuese` und `zwiebeln-lauch` sind **angelegt,
aber mit 0 Lebensmitteln belegt** — nur `kartoffeln` trägt 157. Das
Namensmuster übernimmt die übrige Zuordnung und bringt das Preset auf
463.

`[read]` **Das ist eine Schwäche der Kategoriekuration, nicht des
Presets.** Wer die Kategorien füllt, macht das Namensmuster überflüssig.

---

## Warum Laktose nicht dazugehört

`[cmd]` **Die Zahlen sprechen zunächst dafür:** global rund **68 %**
Laktoseintoleranz — Asien 64 %, Nord- und Westeuropa 28 %, von 58 % in
Pakistan bis nahe 100 % in Südkorea. Das ist kein Randfall.

`[read]` **Trotzdem gehört es nicht in die Presets, aus zwei Gründen:**

1. **Ein Preset „keine Milchprodukte" träfe zu breit.** Reifer
   Hartkäse ist nahezu laktosefrei — Parmesan und alter Gouda liegen
   unter der Nachweisgrenze. Wer laktoseintolerant ist, meidet
   Frischmilch, nicht Parmesan. Ein Preset, das die ganze Gruppe
   `milch-kaese` (279 Einträge) ausschliesst, nimmt mehr weg, als die
   Unverträglichkeit verlangt.

2. `[cmd]` **Es sitzt bereits richtig.** `contains_lactose` ist ein
   **Allergen-Tag mit 1.021 Zuordnungen** und
   `is_exclusion_relevant = true`; `food_preferences.intolerances[]`
   nimmt es auf. Die Zuordnung ist je Lebensmittel kuratiert, nicht
   über die Warengruppe geraten — **genau die Feinheit, die ein Preset
   nicht hätte.**

`[read]` **Der Unterschied ist grundsätzlich:** Ein Preset ist eine
*Wahl* („ich esse keine Innereien"), eine Unverträglichkeit ist ein
*Befund* („ich vertrage keine Laktose"). Sie in dieselbe Liste zu
werfen, verwischt das — und `intolerances[]` wurde ausdrücklich nicht
angefasst.

---

## Was der Vorbehalt bei Halal und Koscher bedeutet

`[cmd]` **Beide Tag-Definitionen existierten seit C-98 mit null
Zuordnungen.** Jetzt tragen sie welche:

| Tag | Zuordnungen |
|---|---|
| `halal` | **6.379** |
| `kosher` | **6.451** |

`[cmd]` `food_tags` wächst damit von **17.967 auf 30.797**, `foods`
bleibt bei **7.140**.

### Was das Tag sagt — und was nicht

> **Es sagt: „enthält keine Zutat, die diese Regel ausschliesst."**
> **Es sagt nicht: „ist halal" oder „ist koscher."**

`[read]` **Der Grund ist die Schlachtung.** Halal (*dhabiha*) und
koscher (*shechita*) hängen daran, **wie** ein Tier geschlachtet wurde
— und die BLS-Daten kennen das nicht. Ein Rindersteak kann jede Zutat
bestehen und trotzdem nicht halal sein.

`[read]` **Bei kashrut kommt ein Zweites dazu:** die Trennung von
Fleisch und Milch. „Rindergulasch mit Sahne" enthält keine verbotene
Zutat, ist aber nicht koscher. **Auch das steht nicht in den Daten** —
das Preset erfasst es nicht.

`[read]` **Und die Praxis ist verschieden.** Mancher folgt strenger
Regel und kauft nur zertifiziert; mancher meidet schlicht Schwein und
Alkohol. **Das Preset bedient den zweiten Fall** und ist für den ersten
allenfalls eine Vorauswahl.

### Wie der Vorbehalt technisch mitgeführt wird

`[cmd]` **Er steht an der Preset-Zeile**, nicht nur in diesem Bericht:
`exclusion_presets.caveat_de` trägt ihn, und G-65 zeigt ihn am Preset
an. Wortlaut:

> **Halal:** *„Schliesst Schweinefleisch, Blut und Alkohol als Zutat
> aus. Echtes Halal hängt an der Schlachtung — die BLS-Daten kennen sie
> nicht."*
>
> **Koscher:** *„Schliesst Schweinefleisch, Schalen- und Weichtiere
> sowie Blut aus. Kashrut hängt an Schlachtung und Trennung von Fleisch
> und Milch — beides steht nicht in den Daten."*

`[cmd]` **Und die `confidence` sagt es auch:** die Zuordnungen tragen
**0,60**, nicht 1,0. Es ist eine Ableitung aus Zutaten, keine geprüfte
Eigenschaft.

---

## Nachweise

`[cmd]` Gemessen am 2026-08-19 gegen die laufende lokale Instanz:

| Prüfung | Ergebnis |
|---|---|
| Presets | `[cmd]` **11**, davon 4 religiös und 7 persönlich |
| Regeln | `[cmd]` **33** über fünf Regelarten |
| Aufgelöste Zuordnungen | `[cmd]` **3.767** über alle Presets |
| **Keine Innereien** | `[cmd]` **131**, mit **allen fünf Lebern** (Rind, Schwein, Kalb, Hähnchen, Gans) |
| **Kein Schwein: Fehltreffer** | `[cmd]` **0** nach den drei Gegenmustern (vorher 32) |
| **`halal` / `kosher`** | `[cmd]` **6.379 / 6.451** — vorher je 0 |
| **`foods` unverändert** | `[cmd]` **7.140** — die Selbstprüfung bricht sonst ab |
| `food_tags` | `[cmd]` **17.967 → 30.797** |
| Zeilenschutz | `[cmd]` als `authenticated`: 11 Presets, 3.767 Zuordnungen lesbar |
| Idempotenz | `[cmd]` beide Schritte zweimal gelaufen — **identische Zahlen** |
| Tag-Prüfung C-44 | `[cmd]` `lebensmittel-tags-pruefen.ts` **grün**, unberührt |
| `pnpm gate` | `[cmd]` **grün, 8 von 8** |

### Eine Zwischenmessung, die nicht zählte

`[cmd]` **Zwischendurch war das Gate rot** — mit genau zwei Zeilen:

```
src/app/v2/nutrition/page.tsx(161,7): Property 'vorlieben' does not
exist on type ... TagebuchAnsicht
```

`[cmd]` **Das war G-65**, der Preferences-Tab: `page.tsx` reichte einen
Prop `vorlieben` weiter, den `ansicht.tsx` in dem Moment noch nicht
annahm — ein Zwischenstand zwischen zwei Dateien, an denen ein anderer
Agent gleichzeitig arbeitete. **Wenige Minuten später war es grün.**

`[read]` **Festgehalten, weil es die Messung erklärt und nicht den
Auftrag:** dieser Schritt ändert **keine einzige TypeScript-Datei** —
nur SQL, `kette.json`, `schema-sollstand.json` und diesen Bericht. Ein
rotes Gate aus fremder Arbeit als eigenen Befund zu melden, wäre so
falsch wie es zu verschweigen.

### Die Selbstprüfungen im Kettenschritt

`[read]` **Beide Schritte brechen ab statt still Falsches zu
schreiben:**

- **018** prüft: mindestens 10 Presets · `no_offal` trifft **genau
  131** · **alle fünf Lebern** sind getroffen · `foods` steht bei
  **7.140**.
- **032** prüft: beide Tags haben Zuordnungen · kein Tag trifft den
  **ganzen** Bestand (ein Tag, das alles trifft, sagt nichts) ·
  **Schweineschnitzel trägt kein `halal`**.

### Geänderte Dateien

| Datei | Was |
|---|---|
| `015_kataloge/018_ausschluss_presets.sql` | **neu** — Tabellen, Sicht, 11 Presets, 33 Regeln |
| `_ableitung/032-halal-koscher-tags.sql` | **neu** — die beiden Tags aus den Presets |
| `_pipeline/kette.json` | zwei Schritte eingehängt (`018` nach 020b/027, `032` nach 018) |
| `_pipeline/daten/schema-sollstand.json` | `food_tags` 17.967 → 30.797, mit Begründung |

`[cmd]` **Die Schritt-ID `031` war belegt** (`031_fettsaeuren_nachtrag.sql`)
— der neue Schritt heisst deshalb `032`. Kette geprüft: **66 Schritte,
keine doppelte ID.**

### Was dieser Auftrag NICHT getan hat

- **Keine Oberfläche** — das ist G-65.
- **Kein Preset erfunden**, das nicht in der Auftragsliste steht.
- **`intolerances[]` nicht angefasst.**
- **Kein Schema umgebaut** — `general_exclusions[]` ist ein Textarray
  und nimmt einen Preset-Code auf, wie er ist. Toms Vorgabe: *„und
  sonst wird es ja ausbaubar sein, wenn nötig."*
- **Die 231 Wurstwaren nicht geraten.**

`[cmd]` Messskripte unter `tools/c93-*` (`.sql`) — **nur lesend**,
gehören vor dem Commit entfernt.

**Nichts ist committet oder gestaged.**
