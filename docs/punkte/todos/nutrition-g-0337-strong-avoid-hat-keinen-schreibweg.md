---
nr: G-337
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: C-174
entscheidung: null
beruehrt:
  tabellen: [nutrition.food_preference_items]
zahlen:
  gemessen: 2026-09-02
  check_werte: 6
  belegt: 3
---

# G-337 — `strong_avoid` hat keinen Schreibweg

## Befund

Aus A-47, Claude Code, 2026-09-02.

`[cmd]` **Der CHECK auf `food_preference_items.strength` kennt sechs
Werte:** `hard_exclude`, `strong_avoid`, `soft_dislike`, `neutral`,
`like`, `boost`.

`[cmd]` **Belegt sind drei:** `boost 5`, `hard_exclude 2`,
`soft_dislike 2`.

`[cmd]` **Und kein Erzeuger setzt `strong_avoid`:**

    preferences-model.ts:29    like | soft_dislike | hard_exclude
    vorlieben-aktionen.ts:53   hard_exclude | soft_dislike | boost
    food_preferences_write     'strong_avoid' 0 mal im Rumpf

`[cmd]` **Und der `preference`-CHECK kennt nur drei Worte:** `liked`,
`disliked`, `hard_exclude`.

`[read]` **Ein Wert, den der CHECK erlaubt und niemand erzeugen
kann.**

## Zu entscheiden

`[read]` **Die mittlere Stufe wirkt in der Suche** — `strong`
schliesst bei leerem Suchbegriff aus (`075_preference_search_
application.sql:1053-1065`).

`[cmd]` **Sie kommt heute aus `intolerances`, nicht aus
`strong_avoid`.**

`[read]` **Also: braucht ein Nutzer die Stufe je Lebensmittel?**
`[read]` **Oder faellt der Wert aus dem CHECK, weil die Stufe an der
Unvertraeglichkeit haengt?**

`[read]` **Ein CHECK-Wert ohne Schreibweg ist dieselbe Klasse wie
eine Funktion ohne Aufrufer** — **beim naechsten Auftrag wird er fuer
gebaut gehalten.**
