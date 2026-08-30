# G-179 — Claude Code, 2026-08-25

Auftrag: `docs/auftraege/g-179-claude-code.md`
Layout: `docs/spezifikation/substanz-katalog-nutzertexte.md` §9

**Das Detail zeigt jetzt die Nutzertexte.** G-176, G-177 und der
Anzeigeteil von C-107 sind darin enthalten.

**Ein Befund, der nicht meine Arbeit ist, aber §9 betrifft: der
C-264-Import hat die fuenf Enhanced-Felder geleert — 0 von 290.**

Nicht committet, nicht gestaged, nicht gepusht.

---

## 1 · DER KERN: die Nutzertexte wurden von niemandem gelesen

`[cmd]` **`supplement_user_texts` und `supplement_faq` kamen im
gesamten Code nicht vor** (gemessen 2026-08-25, `rg` ueber `apps/web`).
Das Detail zeigte `supplements.description` — den **englischen
Recherchesatz** aus dem Kopfsatz.

**Jetzt liest `ladeSubstanz` beide Tabellen**, dazu die Unterformen
ueber den Selbstbezug `parent_id`.

`[cmd]` **Der Selbstbezug brauchte zwei Anlaeufe:**
`supplements!supplements_parent_id_fkey` ergab *„Could not find a
relationship between 'supplements' and 'supplements'"*. Richtig ist
`supplements!parent_id`.

## 2 · DAS LAYOUT NACH §9

| §9 | umgesetzt |
|---|---|
| Kopf: Name · Gruppe · Zahl der Formen | ja — „7 Formen" nur, wo es welche gibt |
| Kopf rechts: Evidenzgrad, WADA | ja, **beide einzeln entfallend** |
| Erster Satz: was ist das | `kurz_was_de` |
| Zwecke als Chips | `wofuer_de` |
| Drei Kacheln | Menge · Obergrenze · Einnahme, **einzeln entfallend** |
| Zu viel / Zu wenig | eigene Abschnitte |
| Wie wirkt / Was bringt / Wer nicht / Mythen | eigene Abschnitte |
| Die Formen | je Form Name, Hinweis, **eigener Grad** |
| Fragen | `supplement_faq`, nach `sort_order` |
| Knopf | unveraendert |

**Bei Enhanced und Peptiden dreht sich die Reihenfolge:** zuerst *„Was
nicht zurueckkommt"*, dann Ueberwachung und Reinheit, **dann** die
Menge — `[read]` weil die Zahl ohne die Reinheit nicht zu lesen ist.

## 3 · KEIN BLOCK OHNE INHALT — die dritte Regel

`[read]` **Die Leerpruefung steht in der Komponente, nicht beim
Aufrufer.** Wer einen Abschnitt einbaut, bekommt das Verhalten mit;
wer es beim Aufrufer prueft, vergisst es beim naechsten.

`[cmd]` **Und der leere Abschnitt ist der Normalfall:**

| Feld | gefuellt von 290 |
|---|---|
| `zu_wenig_de` | **49** — bei **241 entfaellt der Abschnitt** |
| `mythen_de` | 260 |
| Menge / Obergrenze / Einnahme (von 318) | **83 / 38 / 19** |
| `dosing.status = 'unbekannt'` | **143** |

---

## 4 · WAS DIE MESSUNG AM ECHTEN TEXT GEFUNDEN HAT

`[read]` Der Auftrag sagt: *„Wenn eine Kachel bei Schablonentext gut
aussieht und bei echtem Text bricht, ist sie falsch gebaut."*
**Drei Faelle sind genau so aufgefallen — erst im Bild, nicht im
Typecheck.**

### `mythen_de` ist bei 127 von 290 ein JSON-Array

`[cmd]` Im Fenster stand woertlich:

    ["Mythos: '1-Testosteron ist nur ein Prohormon.' Korrektur: …"]

**133 sind normaler Fliesstext, 127 beginnen mit `[`.** Kein anderes
Feld ist betroffen (`kurz_was_de`, `zu_viel_de`, `wie_wirkt_de` … je
0).

`[read]` **Die Texte habe ich nicht geaendert** — das ist nicht mein
Auftrag. Die Anzeige liest beide Gestalten und macht aus zwei
Eintraegen zwei Absaetze. Wird die Spalte spaeter vereinheitlicht,
bleibt sie richtig.

### Die Mengenkachel zeigte die Quelle statt der Menge

`[cmd]` Bei Kreatin stand *„guideline/ISSN position stand: 3-5 g/day
maintenance (20 g/day loading 5-7 d optional)"* — **das Praefix nennt
die Quelle, nicht die Menge**, und drueckt die Zahl aus dem Blick.

**Jetzt: „3-5 g/day maintenance (20 g/day loading 5-7 d optional)".**
`[read]` Die Quelle steht ohnehin im Satz unter *Wann und wie*
(„Positionspapier (ISSN)"). **Nur das Praefix faellt weg, die Zahl
bleibt unveraendert.**

### Aliase, die nur den Namen wiederholen

`[cmd]` Bei `magnesium` stand als einziger Alias-Chip **„magnesium"**
unter dem Titel „Magnesium". Kreatin fuehrt vier Aliase, davon
`creatine` doppelt und `Creatine monohydrate` gleich dem Namen.
**Uebrig bleiben die zwei, die etwas hinzufuegen.**

## 5 · „Ohne Angabe: …" ist raus

`[cmd]` Bei Magnesium stand *„Ohne Angabe: Sicherheit ·
Wechselwirkungen · Rechtslage · Pharmakokinetik · Qualität."*

`[read]` **§9 sieht die Zeile nicht vor, und sie widerspricht der
dritten Regel.** „Kein Block ohne Inhalt" heisst: der Abschnitt
entfaellt — nicht, dass sein Name in einer Aufzaehlung weiterlebt.
**Die Namen waren ausserdem die der Detailtabellen**, nicht die der
Abschnitte aus §9.

`[read]` **Sie stammt aus G-177 und war dort ein Fortschritt** — der
Lueckenbericht war acht Absaetze lang. §9 geht einen Schritt weiter.

## 6 · Zur technischen Kennung (Nebenbefund des Auftrags)

`[cmd]` Der Slug `sub_b30d752d32` stand bis G-177 unter dem Namen.

**Entschieden: er gehoert nicht dorthin, und er ist raus.** `[read]`
Ein Datenbankschluessel hilft niemandem, der wissen will, was eine
Substanz ist. **Die Darreichungsform bleibt** (`creatine monohydrate`
unter dem Titel) — sie sagt etwas ueber die Substanz. **Verloren geht
nichts:** der Slug ist weiterhin der Stack-Anker (C-252).

---

## NACHWEIS

### Die Liste (G-176)

| | erwartet | gemessen |
|---|---|---|
| Zeilen im DOM | **318**, nicht 50 | **318** ✔ |
| Fusszeile | ohne „verfeinern" | „318 von 318 Einträgen" ✔ |
| letzte Zeile ohne Tippen | erreichbar | `Zinc (T cross-ref)` ✔ |

### Gegenprobe, namentlich

| Substanz | `zu_wenig_de` | erwartet | gemessen |
|---|---|---|---|
| **Beta-carotene** (`sub_f14e403589`) | gefuellt | Abschnitt **erscheint** | ✔ |
| **Creatine monohydrate** (`sub_9f9bb8c160`) | leer | Abschnitt **fehlt** | ✔ |

`[read]` **Im Auftrag stand Biotin als Beispiel** — `biotin` ist aber
ein Sammeleintrag **ohne Nutzertextzeile** (siehe unten). Deshalb
Beta-carotene, das die Bedingung wirklich erfuellt.

### Drei Detailfenster

| Substanz | gezeigte Abschnitte |
|---|---|
| **Creatine monohydrate** | Zu viel · Wie es wirkt · Was es bringt · Wann und wie · Wer nicht · Mythen · Fragen · **Übliche Menge · Einnahme** |
| **Magnesium** (Sammeleintrag) | **Die Formen · 7** — sonst nichts |
| **1-Testosterone** (Enhanced) | Zu viel · Wie es wirkt · Was es bringt · Wann und wie · Wer nicht · Mythen · Fragen |

**Bilder:** `backup/g179-voll.png` · `g179-formen.png` ·
`g179-enhanced.png` · `g179-katalog.png`

**Nirgends erschienen:** Lueckenbericht · „Breittabelle/jsonb" · Slug
unter dem Namen · „N Felder" · `null` als Wert.

### Negativprobe

`[cmd]` Die Leerpruefung in `Abschnitt` entfernt: **11 pass / 0 fail
→ 10 pass / 1 fail**, nach Rueckbau wieder 11/0, Datei byteweise
identisch.

`[read]` **Die Datenprobe habe ich NICHT gefahren** — das ist die
laufende Datenbank, und Codex importiert dort. Der Fall ist ohnehin am
echten Bestand belegt: zwei Substanzen, eine mit und eine ohne
`zu_wenig_de`.

### Stand

`[cmd]` `tsc` **sauber** · Build **`Compiled successfully`** · Tests
**185 pass, 0 fail** · `serverimport` **50 Chunks, 0 Treffer** ·
`sprachrueckfall` **0 Funde**.

---

## GEAENDERT

| Datei | |
|---|---|
| `v2/supplements/substanz-abschnitte.tsx` | **neu** — die Abschnitte aus §9 |
| `v2/supplements/substanz-detail.tsx` | Kopf nach §9, Rumpf ersetzt, „Ohne Angabe" raus, Aliase gefiltert |
| `lib/supplements/substanz-read.ts` | Nutzertexte, FAQ, Unterformen |
| `__tests__/abschnitte.test.tsx` | **neu**, 13 Faelle |
| `tools/_g179-satz.mjs`, `_g179-detail.mjs`, `_g179-bilder.mjs` | **neu** |

**Keine Texte geaendert.** `supabase/_pipeline/` nicht angefasst.

## OFFEN — und der erste Punkt betrifft §9 direkt

1. **Der C-264-Import hat die fuenf Enhanced-Felder geleert.**
   `[cmd]` Gemessen 2026-08-25: `irreversibel_de`, `ueberwachung_de`,
   `reinheit_de`, `nicht_im_blut_de`, `rechtslage_klartext_de` sind
   **bei 0 von 290** gefuellt — **vor dem Import waren es 136.**

   `[read]` **Damit ist der wichtigste Teil von §9 heute unsichtbar:**
   *„Ganz oben: was nicht zurueckkommt. Hervorgehoben, nicht als
   Fussnote."* Die Ansicht zeigt ihn, sobald die Felder wieder Inhalt
   haben — belegt durch den Test, nicht durch das Bild. **Das gehoert
   an Codex.**

2. **28 der 318 Katalogeintraege haben keine Nutzertextzeile**,
   darunter **alle 15 Sammeleintraege** (Magnesium, Biotin, Zinc …).
   Sie zeigen den alten Schablonensatz aus `description`. `[read]` Der
   Rueckfall steht bewusst — ohne ihn staende dort gar nichts.

3. **`mythen_de` ist bei 127 von 290 ein JSON-Array in einer
   `text`-Spalte.** Die Anzeige faengt es ab; sauber waere es im
   Import.
