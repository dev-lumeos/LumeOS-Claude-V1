# C-252 — Claude Code, 2026-08-23

Auftrag: `docs/auftraege/c-252-claude-code.md`

Der Substanz-Pfad liest den neuen Katalog. **290 statt 566**, beide
Richtungen belegt. Der gemeldete Build-Bruch war echt und ist behoben —
mit Negativprobe.

Nicht committet, nicht gestaged, nicht gepusht.

---

## DER GEMELDETE BUILD-BRUCH

`[cmd]` **Die Meldung war richtig, und die Ursache war meine.** Ich
hatte `OHNE_QUELLE` als Wert aus `substanz-read.ts` importiert —
derselben Datei, die `createSessionClient` und damit `next/headers`
zieht. `substanz-detail.tsx` ist `'use client'`.

`[cmd]` **Gegengeprobt am 2026-08-23**, den Wert-Import wieder
eingebaut:

    Failed to compile.
    x You're importing a component that needs next/headers.
    15 | import { cookies } from 'next/headers'

`[cmd]` **Mit dem Import auf die serverfreie Datei: `Compiled
successfully`.** Der Bruch ist also nicht verschwunden, sondern
ursaechlich behoben.

`[read]` **Die Loesung ist das Muster, das im Repo schon steht** —
`rechte-modell.ts` (G-90), `extended-regel.ts` (G-167): die Daten
serverfrei daneben, die I/O bleibt drueben. **Neu:
`substanz-luecken.ts`.** `substanz-anzeige.ts` hielt es immer schon so
und importiert aus `substanz-read` ausschliesslich Typen.

`[cmd]` **Ein Prop-Durchreichen wie bei `plan-lesen` war nicht noetig**
— es geht hier nicht um gelesene Daten, sondern um eine konstante
Liste. Der Lesepfad selbst lief nie im Client: `page.tsx` ist ein
Server-Bauteil und reicht die Liste bereits als Prop durch.

`[cmd]` **`pnpm --filter @lumeos/web build`** ueber `tools/lauf.py`,
kein `next build`, kein Loeschen von `.next`: **31 Seiten erzeugt,
Exit 0.**

`[cmd]` **`tools/serverimport-pruefen.mjs`: 50 Client-Chunks, 0
Treffer.** Gegenprobe des Werkzeugs selbst: `createServerClient` 3x
und `cookies()` 4x auf der Serverseite — es sieht also, wonach es
sucht.

---

## 1 · DIE UMSTELLUNG

`[cmd]` **Gelesen wird `supplements.supplements` plus zehn
Detailtabellen**, nicht mehr `substance_catalog`. Beide stehen
weiterhin nebeneinander; Loeschen ist Schritt 5.

**Die Form von `SubstanzSatz` bleibt unveraendert.** `[read]` Damit
laufen `substanz-anzeige.ts` und sein Waechtertest ohne Aenderung
weiter — die Anzeige muss nicht wissen, dass die Werte jetzt aus zehn
Tabellen statt einer Zeile kommen.

## 2 · DER FILTER

`[cmd]` **`.eq('im_katalog', true)` sitzt im Lesepfad.** Gemessen
2026-08-23:

| | Eintraege |
|---|---|
| mit Filter | **290** |
| ohne Filter | **566** |

## 3 · WAS KEINE QUELLE HAT

`[cmd]` **Jedes Feld einzeln gegen die 290 gezaehlt**, nicht gegen die
566 der Tabelle. **Zwei Arten, und der Unterschied ist der Punkt:**

**`fehlt` — es gibt keine Spalte:**

| Feld | Grund |
|---|---|
| `cyp` | kein Gegenstueck, auch nicht in `supplement_pharmacology` |
| `warning_triggers` | `supplement_warnings` fuehrt andere Felder |
| `subcategory` | der neue Katalog kennt eine Ebene (23 Kategorien) |
| `dose_ceiling_value` | `upper_limit` traegt keinen getrennten Zahlenwert |
| `lab_effects` | Tabelle da, Zuordnung zu den 290 nicht gemessen |

**`leer` — Spalte da, kein Wert:**

| Feld | von 290 |
|---|---|
| `guideline_dose` | **0** |
| `official_label_dose` | **1** |
| `description_de` | **0** |

`[read]` **Beides steht als Grund in der Oberflaeche, nicht als Strich
und nicht als Null** — ein Strich hiesse „leer" und waere eine Aussage
ueber die Substanz statt ueber den Datenstand.

### Der Befund, der ueber den Auftrag hinausgeht

`[cmd]` **JEDE `*_de`-Freitextspalte des Schemas ist leer** — nicht nur
`name_de`, wie der Auftrag nennt:

    name_de              0 / 566
    description_de       0 / 290
    summary_de           0 / 288   (englisch: 288)
    pregnancy_note_de    0 / 237   (englisch: 237)
    storage_de           0 /  54   (englisch:  54)
    metabolism_de        0 / 290   (englisch:  22)

**Ausnahme sind die drei handgepflegten `supplement_groups.label_de`**
(Supplement · Enhanced · **Peptid**).

`[read]` **Deshalb gilt `COALESCE`-Logik fuer jedes Textfeld, nicht nur
fuer den Namen.** Umgesetzt als `text(de, en)`. Das ist laut Spec so
gewollt, bis uebersetzt ist — **kein Datenfehler, und deshalb nicht
als Luecke gemeldet.**

## 4 · DIE BRUECKE — ein Fehler, der stumm geblieben waere

`[cmd]` **Die IDs der beiden Kataloge sind nicht vergleichbar:** alt
ist `text`, neu ist `uuid`. **`supplements.slug` ist die alte
`substance_catalog.id`** — bei allen 566 identisch.

`[cmd]` **Ueber den Namen waeren 26 von 566 mehrdeutig** (`vitamin b6`,
`magnesium`, `zinc` … je zweimal). **Der Slug ist eindeutig.**

`[read]` **Drei Stellen haetten nach der Umstellung stumm nicht mehr
gepasst**, weil sie die alte Text-ID gegen den neuen UUID verglichen
haetten:

1. `imStackIds` — der Anker `substance_catalog:<id>` aus `notes`.
   Jetzt gegen `slug` geprueft.
2. Der Add-Knopf — er schrieb `satz.id` als Anker. Jetzt den Slug,
   sonst entstuenden neue Anker, die nie treffen.
3. Der Kopf des Detailfensters zeigte `satz.id` — ein UUID sagt einem
   Menschen nichts. Jetzt der Slug.

`[cmd]` **Live haengt daran nichts: 0 von 11 `stack_items` tragen
ueberhaupt einen Anker.** `[read]` Aufgefallen waere es erst, wenn
jemand einen setzt — also in Wochen.

`[cmd]` **`stack-read.ts` und `stack-write.ts` habe ich nicht
angefasst** (C-250). Der Slug-Weg macht das auch unnoetig: der
Ankertext bleibt genau, wie er war.

---

## NACHWEIS

### Erwartung, VOR der Messung geschrieben

| | erwartet | gemessen |
|---|---|---|
| Liste mit Filter | 290 | **290** ✔ |
| Liste ohne Filter | 566 | **566** ✔ |

### Gegenprobe, namentlich

| Eintrag | Slug | erwartet | gemessen |
|---|---|---|---|
| Creatine monohydrate | `sub_9f9bb8c160` | erscheint, Grad A | **im_katalog t, Grad A, Beschreibung vorhanden** ✔ |
| 7-Keto DHEA | `f05_7_keto_dhea` | erscheint nicht | **im_katalog f, kein Grad, keine Beschreibung** ✔ |

`[cmd]` **Und keiner der 290 hat eine Luecke in dem, was die Liste
zeigt:** ohne Namen 0 · ohne Beschreibung 0 · ohne Gruppe 0 · ohne
Kategorie 0 · ohne Grad 0.

`[cmd]` **Die Einbettung kommt an:** `sub_9f9bb8c160` liefert Kategorie
`sportnahrung`, Gruppe `supplement`, Grad `A`.

`[cmd]` **Gruppen ueber die 290:** supplement 154 · enhanced 75 ·
peptide 61.

### Negativprobe

`[cmd]` **Zwei, beide rot geworden:**

1. **Filter entfernt** → 566 statt 290.
2. **Wert-Import auf `substanz-read` zurueckgedreht** → `Failed to
   compile`, `next/headers`. Zurueckgebaut → `Compiled successfully`,
   Datei byteweise identisch.

### Stand

`[cmd]` `npx tsc --noEmit` — **sauber, Exit 0.** Auch `recovery/` ist
wieder gruen, wie im Auftrag angekuendigt.

`[cmd]` **Build: 31 Seiten, Exit 0.** Serverimport-Pruefung: **0
Treffer in 50 Client-Chunks.**

`[cmd]` **Tests: 92 pass, 0 fail** (`substanz-anzeige`, `v2-attrappen`).

---

## ABWEICHUNGEN VOM AUFTRAGSTEXT

Drei Zahlen stimmen nicht ganz; **keine aendert die Aufgabe:**

| im Auftrag | gemessen |
|---|---|
| „33 Detailtabellen" | **44 Basistabellen** im Schema |
| „`supplements` 15 Spalten" | **17**, davon `im_katalog` generiert |
| „`name_de` leer" | leer ja, aber **NULL**, nicht `''` |

`[cmd]` **`label_de` stimmt** — der Hinweis war richtig und hat mir
einen Fehlgriff erspart.

## OFFEN

1. `lab_effects` — `supplement_lab_effects` existiert; die Zuordnung
   zu den 290 ist ungemessen. **Nicht gezeigt, statt geraten.**
2. **Die `*_de`-Spalten sind schemaweit leer.** Betrifft die
   Uebersetzung, nicht diesen Auftrag — aber es ist mehr als der
   Auftrag annahm.
3. `substance_catalog` und `supplement_catalog` stehen unveraendert
   (Schritt 5).
