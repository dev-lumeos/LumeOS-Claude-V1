---
nr: A-88
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-01

braucht: []
kind_von: A-77

quellen:
  - docs/punkte/laufend_codex/quer-a-0077-werkzeugtests-liefen-nirgends.md

beruehrt:
  dateien:
    - supabase/_pipeline/_validierung/
---

# 31 Proben fallen still auf postgres zurueck

## Der Befund

`[cmd]` **Gemessen bei A-77/A5:** **70 Dateien tragen 70 verschiedene
`LUMEOS_*_DATABASE`-Variablennamen.** 35 laufen formal auch ohne
Variable — **31 davon nur, weil sie still auf `postgres` zurueckfallen.**

`[read]` **Das ist die schlimmste Form eines Nachweises:** die Probe
laeuft, sie wird gruen, und sie hat gegen die falsche Datenbank
gemessen. **Ein fehlender Wegwerf-Name darf nicht unbemerkt die
Basisdatenbank waehlen** — und die Projektregel sagt ausdruecklich: nie
gegen die laufende Datenbank testen.

`[cmd]` **Dazu drei Dateien, die `-d postgres` fest im Test tragen** —
die sind nicht einmal umleitbar.

`[read]` **Codex hat die Frage gegen seinen Auftrag beantwortet:** die
Kette **koennte** alle 70 Namen setzen und **sollte** es nicht. Der
bestehende Vertrag `PGDATABASE` reicht. **Das ist die richtige Antwort,
weil 70 Namen 70 Orte sind, an denen einer fehlen kann.**

## Was zu tun ist

**A1 — fail-closed.** Fehlt der Datenbankname, bricht die Probe ab und
sagt warum. **Kein Rueckfall, auch kein freundlicher.**

**A2 — auf einen Vertrag zusammenziehen.** `PGDATABASE` statt 70
eigener Namen. `[read]` **Je Datei einzeln, nicht pauschal ersetzt** —
eine Probe, die ihren Namen aus einem Grund traegt, nennt den Grund.

**A3 — die drei festverdrahteten umleitbar machen.**

**A4 — einen Waechter, der es haelt.** `[read]` **Sonst kommt es
zurueck** — eine Regel, die nirgends nachgezaehlt wird, wird zur
Empfehlung. **Zu belegen in beide Richtungen:** mit einem eingebauten
Rueckfall muss er rot werden.

**Nicht Teil:** welche Proben ueberholt sind (A-87) und der fehlende
Bestand (A-86).

**Zu belegen:** Zaehlung vorher und nachher · der Waechter mit Sabotage
in beide Richtungen · `pnpm gate` gruen · nichts committen.
