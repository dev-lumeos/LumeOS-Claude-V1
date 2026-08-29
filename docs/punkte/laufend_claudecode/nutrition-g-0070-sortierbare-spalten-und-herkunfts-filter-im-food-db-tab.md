---
nr: G-70
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: null
kinder: []
entscheidung: E-23
agent: claudecode
beauftragt: 2026-08-28
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

## Auftrag — zusammen mit G-112

### Vorweg

`[read]` **Die Zahlen misst du, mit Nutzer und Zeitraum** (`CLAUDE.md`).
`[read]` **Und ein Waechter prueft die Wirkung, nicht das Wort** —
fuenf von zehn hielten in G-249 beim ersten Versuch nicht.

`[cmd]` **Der massgebliche Mockup ist
`module-nutrition-fooddb.jsx`** in
`docs/spezifikation/10-plattform/design-system/theme-v1/`. **NICHT
der `.js`-Ordner.**

### Der Anlass: die Sortierung ist gebaut und unsichtbar

`[cmd]` **`nutrition.food_search` kennt seit G-245 zehn
Sortierwerte:**

    relevance · name_asc
    protein_desc · protein_asc
    kcal_desc · kcal_asc
    carbs_desc · carbs_asc
    fat_desc · fat_asc

`[cmd]` **Und einen Rueckmeldeweg:** ein unbekannter Wert liefert
`unsupported_sort` mit `requested_sort` und `supported_sorts`.

`[read]` **Die Oberflaeche kennt sie nicht.** **Tom, 2026-08-28:**
*,,der suchfilter filtert schon grob, dann fuehrt dieser tag die
sortierung der resultate aus"* — **acht Achsen, vier Naehrstoffe in
zwei Richtungen.**

### 2 · G-112: der Filter laesst nur einen Wert zu

`[read]` **Steht im Punkt daneben.** `[read]` **Und es haengt
zusammen:** wer nach *vegan* filtert und nach Protein sortiert, will
vielleicht auch *glutenfrei* dazu. **Die Sortierung wirkt obenauf,
nicht anstelle** (E-23).

### Was nicht zu tun ist

**Keine neuen Sortierwerte erfinden** — die zehn stehen fest.
**Keine Tags anlegen** — die fuenf Filter-Tags bleiben unberuehrt.
**`food_search` nicht aendern** — Codex hat den Bereich, er arbeitet
an G-107.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Sortierwerte in der Oberflaeche   Zahl, Soll 10
    je Wert: erste gegen letzte       bei `carbs_desc` mehr oben
                                      als unten
    Filter mehrfach                   zwei Tags gleichzeitig
    Filter + Sortierung               vegan + protein_desc: nur
                                      vegane Treffer, nach Protein
    unsupported_sort                  wird die Rueckmeldung genutzt?
    Ladezeit                          ms je Sortierung
    Attrappen im Reiter               am Schirm gezaehlt (A-59)
    Bildschirmfoto je Zustand         `node tools/schuss.mjs`

`[read]` **Die zweite Zeile ist die einfachste Probe und die, die
zaehlt:** bei `carbs_desc` muss oben mehr stehen als unten. **Wenn
nicht, sortiert etwas anderes.**

`[cmd]` **Und die fuenfte:** die Rueckmeldung existiert seit G-245 —
**wenn die Oberflaeche sie ignoriert, ist sie so still wie vorher.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205), und eine
Messung vor dem Neukompilieren zeigt alte Zahlen.
`[cmd]` **A-30** und **A-60** beachten.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
