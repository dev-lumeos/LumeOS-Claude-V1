# Nährwerte: Bezugsgrösse und Rechenregel

**Stand:** 2026-08-06 (erste Fassung, aus C-03/WP-02)
**Rang:** Ist-Zustand, `[cmd]`-belegt. Rangfolge gilt: Code > ssot > Rest.

---

## Die Regel

**Die Werte in `nutrition.food_nutrients` gelten je 100 g essbarem Anteil.**

Daraus folgt für jede Mengenrechnung:

```
wert_für_menge = wert_je_100g × (menge_in_gramm / 100)
```

Menge 150 g ⇒ Faktor 1,5. Menge 50 g ⇒ Faktor 0,5.

---

## Warum das hier steht

Diese Regel stand bis zum 2026-08-06 **nirgends im Repo** — weder in
`supabase/README.md`, noch in den Spezifikationen, noch im Code. Sie war
stillschweigende Annahme jeder Nährwertanzeige und wäre die Grundlage
jeder Diary-Rechnung gewesen, ohne je belegt worden zu sein.

`[cmd]` Gegenprobe 2026-08-06: `git grep` auf „100 g", „per 100g" und
„je 100" über `supabase/_pipeline/` und `docs/ssot/` — **0 Treffer**.

Eine Rechenregel, die nur als Annahme existiert, wird beim ersten Zweifel
neu geraten. Deshalb liegt sie jetzt hier und wird von genau einer Stelle
im Code getragen (siehe unten).

---

## Der Beleg

`[cmd]` 2026-08-06 gegen die laufende Instanz, aus den Daten selbst — nicht
aus einer Dokumentation abgeschrieben:

| Befund | Wert | Was er zeigt |
|---|---|---|
| `max(value)` für `CHO` | **exakt 100.00000** | Eine Obergrenze von genau 100 g je Einheit ist nur bei Bezug auf 100 g sinnvoll |
| `max(value)` für `FAT` | **exakt 100.00000** | dito |
| `max(value)` für `PROT625` | 88.30000 | plausibel unter 100 |
| `max(value)` für `FIBT` | 70.35500 | plausibel unter 100 |

Einzelprobe an einem bekannten Lebensmittel (`bls_code = C515600`,
„Cornflakes gesüsst, mit Zuckerglasur"):

| Nährstoff | Wert | Einheit |
|---|---|---|
| `CHO` | 88,35 | g |
| `FAT` | 0,54 | g |
| `PROT625` | 4,62 | g |

Gezuckerte Cornflakes mit 88 g Kohlenhydraten — das ist die
Zusammensetzung je 100 g, nicht je Portion und nicht je Packung.

Einheiten stehen je Code in `nutrition.nutrient_defs.unit`
(`[cmd]` 138 Definitionen). Die Bezugsgrösse steht dort **nicht** — sie
ist Konvention der Quelle (BLS 4.0), nicht Spaltenwert.

---

## Wo die Regel im Code lebt

Genau an einer Stelle, damit sie nicht driften kann:

| Ort | Rolle |
|---|---|
| `apps/web/src/lib/nutrition/diary-model.ts` | Konstante `NUTRIENT_REFERENCE_GRAMS = 100` und `portionFactor()`; `computeFrozenNutrients()` rechnet damit |
| `supabase/_pipeline/05_user_tabellen/052_diary_foundation.sql` | Dateikopf nennt dieselbe Regel als Voraussetzung des Einfrierens |

`[cmd]` Unit-Test `diary-model.test.ts`: „reference base is 100 g" prüft
Konstante und Faktor; „freezing scales every nutrient by amount / 100"
prüft die Anwendung.

**Die Datenbank rechnet bewusst nicht mit.** Ein Trigger, der Nährwerte
nachrechnet, wäre eine zweite Kopie derselben Regel — und zwei Kopien
driften (dieselbe Begründung wie bei den Ableitungsregeln in `020`,
siehe `supabase/README.md`). Das Einfrieren ist deshalb Pflicht des
Schreibpfads.

---

## Was daraus folgt

- **Ein fehlender Nährwert ist nicht 0.** Codes ohne Zeile in
  `food_nutrients` erscheinen nicht im eingefrorenen Schnappschuss; die
  zugehörige Spalte bleibt `NULL`. Der Unterschied zwischen „enthält
  nichts davon" und „wurde nie gemessen" bleibt sichtbar.
- **Rundung auf 5 Nachkommastellen**, deckungsgleich mit
  `numeric(12,5)` in `food_nutrients`. Ohne Rundung schleppt der
  JSONB-Schnappschuss Gleitkomma-Artefakte mit.
- **Eingefrorene Werte ändern sich nicht rückwirkend** (ADR-0003).
  `[cmd]` 2026-08-06 auf der laufenden Instanz belegt: BLS-Wert `CHO` von
  88,35 auf 999,00 geändert, die eingefrorene Position blieb bei
  132,5250 — in der Spalte **und** im JSONB. Wert danach zurückgesetzt.
- **Ändert sich die Menge einer Position, muss der Schreibpfad neu
  einfrieren** — inklusive `frozen_at`. Ein UPDATE, das nur `amount_g`
  ändert, hinterlässt Werte, die zur Menge nicht passen.

---

## Offen

- `[annahme]` Ob einzelne Nährstoffe der Quelle eine abweichende
  Bezugsgrösse haben (etwa je 100 ml bei Getränken), ist **nicht**
  geprüft. Die Stichprobe deckt Trockenware ab. Vor einer Anzeige, die
  Getränke mengenmässig rechnet, gehört das nachgemessen.
- Der Aggregationsweg für Tagessummen ist offen (C-04). Diese Regel gilt
  je Position; wie Positionen zu Tagessummen werden, entscheidet C-04.
