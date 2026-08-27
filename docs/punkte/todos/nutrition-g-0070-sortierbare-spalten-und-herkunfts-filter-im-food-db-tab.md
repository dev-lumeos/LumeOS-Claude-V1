---
nr: G-70
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-70 - Sortierbare Spalten und Herkunfts-Filter im Food-DB-Tab

## Befund

(neu 2026-08-19). **Nach G-65 und C-94.**

  **Tom, 2026-08-19:** *„Ich will mehr Filter haben. Wenn man schon eine
  Tabelle hat, wieso die Spalten nicht gleich sortierbar machen, wie z.
  B. P/C/F/kcal. Favoritenfilter, eigene Foods (fuer spaeter), wie
  gestern, aus Mealplan. Weitere sortierbare Filter, die wir eh schon in
  den Daten haben."*

  ### Warum nach G-65

  **Tom:** *„Preferences fertigbauen, das loest auch schon viel
  Sortiererei."*

  `[read]` **Richtig — wer Magermilchpulver nie isst, sieht es nicht
  mehr.** Dann muss die Sortierung weniger leisten. **Umgekehrt waere
  Doppelarbeit:** Wer die Filterleiste baut, bevor die Vorlieben
  greifen, baut sie zweimal.

  ### Spalten sortierbar

  `[cmd]` **Die Tabelle traegt sie bereits als Ueberschriften:**
  `KCAL/100G`, `P`, `C`, `F`. **Ein Klick muesste reichen**, ein zweiter
  kehrt um.

  `[read]` **Ein Cronometer-Nutzer wuenscht sich genau das:** *„Protein
  > 70 %, Kalorien < 40/100 g, sortiert nach hoechstem Protein,
  untersortiert nach niedrigsten Kalorien."* — **Fuer einen
  Bodybuilder ist das der eigentliche Griff.**

  ### Herkunfts-Filter

  | | Quelle |
  |---|---|
  | **Favoriten** | `food_preference_items` — kommt mit G-65 |
  | **Wie gestern** | `meal_items` des Vortags |
  | **Eigene Foods** | `foods_custom` — spaeter, Tabelle existiert |
  | **Aus Mealplan** | **kein Schema** — melden, nicht bauen |

  `[read]` **„Wie gestern" ist der staerkste davon** — es ist der
  haeufigste Griff beim Erfassen, und `meal_items` protokolliert es
  bereits. `[cmd]` **Cronometer sortiert nach zuletzt und am
  haeufigsten benutzt.**

  ### Was die Daten sonst hergeben

  `[cmd]` **`preparation_kinds`** — 11 Zubereitungsarten mit
  gemessenem Muster (roh 662×, gebraten 562×, tiefgefroren 430×,
  gekocht 284×).

  `[cmd]` **`processing_level`** — seit C-100 **acht Stufen**: `raw`
  3.251, `cooked` 2.346, `ultra_processed` 927, `minimally_processed`
  254, dazu `canned`, `dried`, `fermented`, `smoked`.

  `[cmd]` **`is_prepared_dish`** und **`food_source`** (BLS gegen
  eigene).

  ### Was die Recherche vorgibt

  `[cmd]` **Trefferzahl an jede Option** — *Proteinreich (1.400)*,
  *Vegan (1.377)*. `[read]` **Das verhindert den Fall, dass zwei Filter
  null Treffer ergeben.**

  `[cmd]` **ODER innerhalb einer Gruppe, UND zwischen den Gruppen.**
  **Echtzeit-Aktualisierung auf dem Desktop** — Baymard nennt es das
  bevorzugte Muster.

  `[cmd]` **Bei 375 px ein Vollbild-Fenster** statt der Zeile —
  Seitenleisten funktionieren dort nicht.

  ### Und die Blaetterfunktion fehlt

  `[cmd]` **Der Tab zeigt „die ersten 50" von 279** — kein
  Weiterblaettern, kein Nachladen. **Tom:** *„Wenn man Treffer 279
  zeigt, dann gibt man auch die Moeglichkeit, die alle anzuschauen."*
