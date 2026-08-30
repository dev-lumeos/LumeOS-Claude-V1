# C-254 — Claude Code, 2026-08-23

Auftrag: `docs/auftraege/c-254-claude-code.md`

**Zu korrigieren war nichts — 0 Lesestellen ohne Rueckfall.** Der
Ertrag ist die Pruefung, und der Zuschnitt ist enger als der Auftrag
annahm: **die Regel gilt nicht fuer jede `*_de`-Spalte.**

Nicht committet, nicht gestaged, nicht gepusht.

---

## DIE ZAHL VOR DER KORREKTUR

| | erwartet | gemessen |
|---|---|---|
| Lesestellen ohne Rueckfall | offen | **0** |
| davon in `lib/supplements/` (C-250) | offen | **0** |
| davon in `v2/medical/page.tsx` | offen | **0** |

`[cmd]` **Der Verdacht des Auftrags gegen C-250 traegt nicht.** Ich
habe `stack-read.ts` von Hand nachgesehen, nicht nur das Werkzeug
laufen lassen: **beide Spalten stehen ueberall in der Auswahl**
(Z199, 212, 220, 227, 434) und der Rueckfall wird angewandt —
`anzeigename(s.name_de, s.name_en)`, `text(e?.summary_de) ??
text(e?.summary_en)`. `medical/page.tsx` ebenso (Z89, 184, 185).

`[read]` **Codex hat die Regel erfuellt, ohne dass sie geprueft war.**
Das entwertet den Auftrag nicht — die Pruefung fehlte trotzdem, und
sie fehlt jetzt nicht mehr.

## WAS DIE MESSUNG UEBER DIE REGEL SAGT

`[cmd]` **Alle 66 `*_de`-Textspalten aller Schemata, einzeln
gezaehlt:**

| Lage | Spalten |
|---|---|
| **NIE deutsch** — Rueckfall noetig | **25**, alle in `supplements` |
| **teils deutsch** | 6 |
| **IMMER deutsch** — Rueckfall unnoetig | **21** |
| leere Tabelle — nicht entscheidbar | 14 |

`[read]` **Die Regel „jedes Textfeld braucht den Rueckfall" ist zu
weit.** `nutrition.foods.name_de` traegt bei **7.140 von 7.140** Zeilen
Deutsch; `nutrition.food_categories.name_de` bei 518 von 518.
**Eine Pruefung, die dort anschlaegt, ist dauerhaft rot** — und wird
umgangen, nicht repariert. Genau davor warnt Punkt 4.

### Und ein zweites Mal zu weit: „leer" ist nicht der Punkt

`[cmd]` **`nutrition.nutrient_details` traegt de und en IDENTISCH
gefuellt:** detail 97/97 · excess 41/41 · tip 85/85 · interactions
26/26. **Zeilen mit leerem `_de` und gefuelltem `_en`: 0.**

`[read]` **Ein Rueckfall rettet dort nichts.** Wo Deutsch fehlt, fehlt
Englisch auch — er saehe aus wie eine Absicherung und waere keine.

`[cmd]` **In `supplements` rettet er sehr wohl**, und das ist der
Unterschied: **566** Namen, **290** Beschreibungen, **288**
Zusammenfassungen, **237** Schwangerschaftshinweise, **54**
Lagerhinweise kaemen sonst als Leerstelle an.

`[cmd]` **Und zweimal ist er gar nicht moeglich:**
`nutrition.exclusion_presets.caveat_de` und
`supplements.rule_catalog.message_de` haben **kein `_en`**.

**Das Merkmal ist also nicht „leer", sondern „rettbar":** die Spalte
kann leer sein UND ein gefuelltes `_en` existiert.

## DIE PRUEFUNG — `tools/sprachrueckfall-pruefen.mjs`

Im Gate nach `kataloganker-pruefen.mjs`, vor `turbo run`.

`[cmd]` **Drei Merkmale, alle drei noetig** — jedes einzeln
gegengeprobt:

**1. Die Tabelle, nicht der Spaltenname.** `[cmd]` `name_de` allein
ergibt **141 Treffer**, weil es die Spalte in beiden Welten gibt.

**2. Nur die `.select(...)`-Zeichenkette.** `[cmd]` Der Block ab
`.from()` laeuft in die naechste Abfrage hinein und hielt
`food_categories.name_de` faelschlich fuer
`exclusion_presets.caveat_de` — **11 Treffer, davon 3 falsch.**

**3. Nur rettbare Spalten**, siehe oben.

`[cmd]` **Mit allen dreien: 11 Abfragen geprueft, 0 Funde.**

`[read]` **Die Meldung nennt die Zahl der geprueften Abfragen**, nicht
nur „in Ordnung" — eine Pruefung, die nichts findet, weil sie nichts
ansieht, sieht sonst aus wie eine, die nichts zu beanstanden hat.

## NACHWEIS

### Negativprobe — an zwei Stellen, eine davon fremder Code

`[read]` Zwei, nicht eine: eine Pruefung, die genau den Fall trifft,
den ihr Autor eingebaut hat, misst womoeglich nur diesen.

| Eingriff | Exit | gemeldet |
|---|---|---|
| Ausgangslage | 0 | 11 Abfragen, 0 Funde |
| `name_en` raus in **`substanz-read.ts`** (eigener Code) | **1** | `supplements.description_de` |
| `name_en` raus in **`stack-read.ts`** (C-250, fremd) | **1** | `supplements.name_de` |
| nach Rueckbau | 0 | 11 Abfragen, 0 Funde |

**Beide Dateien byteweise identisch zurueck.**

### Gegenprobe, namentlich

| Spalte | Stand | erwartet | gemessen |
|---|---|---|---|
| `supplements.supplements.name_de` | **0 von 566** deutsch | braucht Rueckfall, hat ihn | ✔ |
| `nutrition.food_categories.name_de` | **518 von 518** deutsch | darf NICHT anschlagen | ✔ |

`[cmd]` **Der zweite Fall ist der wichtigere:**
`vorlieben-lesen.ts:187` liest `name_de` **ohne** `name_en` — und wird
richtigerweise nicht gemeldet, weil die Spalte durchgehend deutsch ist.
**Genau daran haette sich eine zu weite Pruefung festgebissen.**

### Kontofreier Nachweis statt Browser

`[read]` Der Auftrag nennt das den besseren Weg, und er ist es: **ein
Browsernachweis haengt an einem Konto.** `[cmd]` Am 2026-08-23 war
`test-user@lumeos.local` einen halben Tag nicht anmeldbar; jeder Beleg
daran war in dieser Zeit nicht zu fuehren.

`[cmd]` **`__tests__/sprachrueckfall.test.ts` — 5 Faelle, kein Browser,
keine Sitzung:** deutsch fehlt · deutsch gewinnt · NULL und Leerstring
· beides leer ergibt `null` · Nicht-Zeichenketten.

`[cmd]` **Negativprobe:** Rueckfall aus `text()` entfernt →
**pass 5/fail 0 wird pass 2/fail 3**; nach Rueckbau wieder 5/0, Datei
identisch.

`[cmd]` **Nachtrag zum Konto:** `test-user@lumeos.local` ist seit
**12:01 wieder anmeldbar** (G-175, `tools/konten.mjs`). Ich habe nur
gelesen, **nicht am Hash gedreht.**

### Stand

`[cmd]` `npx tsc --noEmit` **sauber** · Build **`Compiled
successfully`** · `sprachrueckfall` **0 Funde** · `serverimport`
**62 Chunks, 0 Treffer** · Tests **319 pass, 0 fail**.

---

## GEAENDERT

| Datei | |
|---|---|
| `tools/sprachrueckfall-pruefen.mjs` | **neu** — die Pruefung |
| `package.json` | Pruefung ins Gate |
| `lib/supplements/substanz-luecken.ts` | `text()` hierher, mit der Messung als Begruendung |
| `lib/supplements/substanz-read.ts` | importiert `text()` von dort |
| `lib/supplements/__tests__/sprachrueckfall.test.ts` | **neu** — 5 Faelle |

`[read]` **Warum `text()` umgezogen ist:** es sollte kontofrei pruefbar
sein, aber `substanz-read.ts` zieht `next/headers` und laesst sich in
einem Test nicht laden — `[cmd]` gegengeprobt: `require() ES Module …
in a cycle`. In `substanz-luecken.ts` steht es serverfrei, dasselbe
Muster wie `OHNE_QUELLE` in C-252.

**Keine deutschen Texte erfunden oder uebersetzt.** Die `_de`-Spalten
sind unveraendert leer.

## OFFEN

1. **14 `*_de`-Spalten stehen in leeren Tabellen** — ob sie einen
   Rueckfall brauchen, ist nicht entscheidbar, solange keine Zeile
   drinsteht. **Nicht in die Pruefliste aufgenommen**, statt geraten.
   Wer die Tabellen fuellt, misst sie und traegt sie nach.
2. **`exclusion_presets.caveat_de` und `rule_catalog.message_de` haben
   kein `_en`.** Ein Rueckfall ist dort nicht moeglich; wenn diese
   Texte mehrsprachig werden sollen, fehlt die Spalte.
3. **6 Spalten tragen teils Deutsch** (`nutrient_details`,
   `exclusion_presets.caveat_de`, `rule_catalog.message_de`) — bei
   `nutrient_details` ist der Rueckfall nachweislich wirkungslos, die
   anderen beiden haben kein Gegenstueck. **Deshalb steht keine davon
   in der Pruefliste.**
