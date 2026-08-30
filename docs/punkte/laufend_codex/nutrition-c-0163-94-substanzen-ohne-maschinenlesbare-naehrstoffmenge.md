---
nr: C-163
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: C-158
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-163 - 94 Substanzen ohne maschinenlesbare Naehrstoffmenge

## Befund

(neu 2026-08-20). **Fuer den Rechercheweg.** Rest aus C-158.

  `[cmd]` **Gemessen:** 567 Substanzen, **111 moegliche
  Naehrstofftraeger, 17 eindeutig zugeordnet.**

  `[cmd]` **Was fehlt, je Substanz:** **BLS-Code** (aus unseren 138) und
  **Menge je Portion mit Einheit.**

  `[read]` **Der Code kommt von uns** — Kimi kennt `nutrient_defs` nicht.
  **Die Menge steht auf dem Etikett** und ist seine Aufgabe.

  `[cmd]` **Und drei Einheiten brauchen die Form**, bevor sie
  umgerechnet werden koennen: **Vitamin A** (Retinol gegen Carotinoide),
  **Vitamin E** (natuerlich gegen synthetisch), **Folat** (Folat,
  Folsaeure, DFE).

## Auftrag — die Naehrstoffkette der Supplemente fuellen

**Mitbeauftragt: C-351.** Bericht in diese Datei.

### Das Ergebnis, auf das es hinauslaeuft

`[cmd]` **`supplements.supplement_nutrients` traegt 17 Zeilen fuer 17
Substanzen — von 412 im Katalog.** `[cmd]` **`intake_logs` hat 744
Einnahmen.**

`[read]` **Solange die Kette leer ist, kann Supplements keine
Tagesbilanz rechnen** (C-351, E-35). **Und die Obergrenzen fuer
Magnesium, Niacin und Folsaeure bleiben wirkungslos**, weil sie nur
fuer Praeparate gelten und niemand weiss, was aus Praeparaten kam
(C-344).

**Nach diesem Auftrag soll eine Tagesbilanz rechenbar sein.**

### 1 · C-163 — die 94 Substanzen

`[read]` **Der Punkt nennt 94 ohne maschinenlesbare
Naehrstoffmenge.** `[read]` **Miss nach** — er ist aelter als der
Katalogneuaufbau.

`[read]` **Und miss, welche ueberhaupt gebraucht werden:** `[cmd]`
**von 360 Einnahmen erreichen 90 einen Naehrstoffcode, alle
denselben** (C-323). **Die Substanzen, die jemand nimmt, sind
wenige** — **die zuerst.**

### 2 · C-351 — die Tagesbilanz

`[read]` **Dieselbe Gestalt wie `nutrition.daily_summary`:** aus
`intake_logs` und `supplement_nutrients`, je Tag und Naehrstoff.

`[cmd]` **E-35 gilt: jedes Modul rechnet seine eigene Bilanz,
summiert wird oben.** **Kein Griff nach `nutrition.meal_items`.**

`[read]` **Und dieselbe Ehrlichkeit wie dort:** eine Einnahme ohne
Naehrstoffzuordnung ist **nicht null, sondern unbekannt.**

### Was nicht zu tun ist

**Kein Katalogausbau.** `[read]` **Tom, 27.08.: *,,Schluss mit
Katalogdetails."*** **Es geht um die Naehrstoffmengen, die eine
Bilanz braucht — nicht um Beschreibungstexte, Evidenzstufen oder
Interaktionen.**

**Keine Menge raten.** `[read]` **Was auf der Packung steht, steht in
den Daten oder nicht** — **und wenn nicht, bleibt es unbekannt.**
`[cmd]` **Dieselbe Regel wie bei den Umrechnungsfaktoren in C-342 und
den Tag-Schwellen in G-221.**

`apps/` nicht anfassen — Claude Code arbeitet an G-274.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Substanzen mit Menge      vorher / nachher
    davon tatsaechlich        wie viele werden eingenommen?
      genommen
    Einnahmen mit Naehrstoff  vorher 90 von 360, nachher
    Tagesbilanz               rechnet sie? an einem Tag belegt
    unbekannte Mengen         Zahl - nicht als null gerechnet
    ohne Beleg geblieben      welche, mit Grund

`[read]` **Die vorletzte Zeile ist die ehrliche:** **wie viel bleibt
unbekannt, und weiss die Bilanz es?**

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
**Wegwerf-Datenbank, Vollsicherung vor jedem Live-Eingriff.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
