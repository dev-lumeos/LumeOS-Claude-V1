---
nr: G-141
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: OFFEN
beruehrt:
  tabellen: []
  dateien: ["docs/specs/Core/ONBOARDING_ADR.md"]
zahlen: null
---

# G-141 - Das Onboarding ist als ADR final entschieden

## Befund

(neu
  2026-08-20). **Betrifft G-83.** Aus SSOT 173.

  `[cmd]` **`docs/specs/Core/ONBOARDING_ADR.md`, April 2026, Status
  final:** *„Option C: 7-Step Kern-Onboarding + Post-Onboarding
  Setup-Cards."*

  | Schritt | Inhalt | Ziel |
  |---|---|---|
  | 1 | Name, Sprache, Einheitensystem | Auth / Profil |
  | 2 | Geschlecht, Geburtstag, Groesse, Gewicht, **KFA** | Goals (TDEE) |
  | 3 | **Experience Level** | Goals, Nutrition, Training |
  | 4 | **Primaerziel: 12 Goal-Typen** | Goals → TDEE + Makros |
  | 5 | Training: Frequenz, Dauer, Equipment | Training |
  | 6 | Nutrition: Diaettyp, Allergien, Mahlzeiten, Vorlieben | Nutrition |
  | 7 | Zusammenfassung | alle Module |

  `[cmd]` **Beim Abschliessen:** `calculateTDEE()` → Goals-Targets →
  alle Modul-Einstellungen initialisieren.

  ### Eine Abweichung

  `[cmd]` **Der ADR nennt `beginner / intermediate / advanced / elite`.**
  **C-118 hat `beginner / advanced / pro / elite` gebaut** — Toms
  Vorgabe vom 2026-08-19.

  `[read]` **Toms Entscheidung ist juenger und gilt.** **Aber es gehoert
  gewusst**, dass der ADR etwas anderes sagt.

  `[cmd]` **Und *„Post-Onboarding Setup-Cards"*** — in noch nicht
  konfigurierten Modulen erscheinen Einrichtungskarten. **Das ist eine
  eigene Bauform, die niemand kennt.**

## Auftrag

**Mitbeauftragt mit G-83 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.

## Bericht

**Claude Code, 2026-09-06.** Mitbeauftragt mit G-83. **Der
vollstaendige Bericht steht in
[G-83](goals-g-0083-das-onboarding-ist-entworfen-aber-nicht-gebaut.md#bericht).**

`[cmd]` **Die Abweichung dieses Punktes ist nachgemessen:**
`profiles.experience_level` traegt `beginner | advanced | pro |
elite`, **der ADR nennt `intermediate`.** `[cmd]` **Dazu eine
dritte Skala in `rezept-lage.ts:273`** — sie meint aber die
Schwierigkeit eines Rezepts, nicht den Grad des Nutzers.

`[read]` **Toms Entscheidung gilt weiter** (C-118, 2026-08-19).
**Die offene Sache ist die Skala selbst, und die lebt in G-228
(E-46) weiter** — nicht in diesem Punkt.

`[read]` **Vorschlag: schliessen.** `[read]` **Aber die
*Post-Onboarding Setup-Cards* gehoeren als eigener Punkt angelegt**
— **sie sind der Gegenpart zum ueberspringbaren Onboarding und
gehen sonst mit diesem Punkt verloren.**

## Abnahme

_(vom Orchestrator)_

## Abnahme

**2026-09-07, mit G-353 abgenommen: leer genug.**

`[cmd]` **Nach G-353 bleibt nichts uebrig** — **die Setup-Karten
sind dort entworfen.**

`[read]` **Und sie haengen an der Leere, nicht am
Konfigurationszustand** — **deshalb braucht es keine Spalte fuer
*weggewischt*.**

**Geschlossen.**
