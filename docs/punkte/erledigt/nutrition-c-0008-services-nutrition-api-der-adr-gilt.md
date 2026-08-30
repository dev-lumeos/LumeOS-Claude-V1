---
nr: C-08
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: be998f73
beruehrt:
  dateien:
    - services/nutrition-api
zahlen: null
---

# C-08 - `services/nutrition-api` — der ADR gilt

## Befund

(neu gefasst
  2026-08-19). **Nichts zu entscheiden, nur zu wissen.**

  ### Die Frage war 2026-08-03 schon beantwortet

  `[cmd]` **ADR-0001:** *„Gewaehlt: **A fuer jetzt, B als Zielbild.**
  Von: Tom. Am: 2026-08-03. Apps lesen vorerst direkt. **Module bekommen
  spaeter eigene APIs — dann, wenn das jeweilige Modul steht, nicht
  vorher.**"*

  `[read]` **Und der Grund steht dort:** *„Toms Grund fuer B ist
  Modulunabhaengigkeit: ersetzbar, aktivierbar, eigenstaendig lauffaehig.
  Das ist eine Produktanforderung, keine technische Vorliebe."*

  ### Was die Messung vom 2026-08-19 ergaenzt

  `[cmd]` **`services/nutrition-api` ist unveraendert ein Geruest** —
  vier Dateien je 1 KB (`index.ts`, `diary.ts`, `food.ts`, `meals.ts`),
  **in keiner Quelldatei importiert.** Die 20 Fundstellen sind
  Dokumente, Archiv und `pnpm-lock`.

  `[cmd]` **Aber `apps/web` liest inzwischen dreifach:**

  | | |
  |---|---|
  | Next-Routen `/api/nutrition/*` | **29 Vorkommen**, fuenf Routen |
  | `rpc()` direkt | 16 |
  | `.from()` direkt | 9 |

  `[read]` **Das war am 2026-08-03 noch nicht so** — die Next-Routen
  sind seither dazugekommen. **Sie sind faktisch schon eine halbe API,
  nur an der falschen Stelle.**

  ### Was daraus folgt

  `[cmd]` **`nutrition-api` bleibt leer, bis Nutrition steht.** Offen
  sind noch G-70 (Filter und Blaettern) und die Meal plans.

  `[read]` **Eine API muss nicht mitwachsen, wenn das Schema stabil
  ist** — und das ist es: Kettenschritte, `schema-sollstand.json`,
  Vollstaendigkeitspruefung. **Die API waere eine Fassade ueber etwas
  Fertiges, kein mitwachsendes Gebilde.**

  `[cmd]` **Die fuenf Next-Routen sind der Umzugskandidat:**
  `nutrition/diary`, `foods`, `foods/categories`, `foods/smart-preview`,
  `local-schema`.

## Auftrag

**Mitbeauftragt mit C-160 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-08-30, mit C-160 abgenommen:** bestaetigt: Dienst existiert, Typecheck gruen, keine Aufrufer,
kein Listener auf 4200.
