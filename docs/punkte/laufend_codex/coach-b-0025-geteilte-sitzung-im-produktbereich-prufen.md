---
nr: B-25
typ: befund
modul: coach
schwere: mittel
angelegt: 2026-08-12
braucht: []
kind_von: B-12
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
beruehrt:
  tabellen: []
  dateien: ["docs/ssot/38-cookie-bereich.md"]
zahlen: null
---

# B-25 - Geteilte Sitzung im Produktbereich prüfen

## Befund

(neu 2026-08-12,
  aus B-12) — B-12 hat die Trennung von `admin` entschieden und belegt.
  **Ungeprüft bleibt die andere Hälfte:** ob die Sitzung zwischen `web`,
  `buddy`, `coach` und `marketplace` tatsächlich geteilt wird
  (`auth-sso` AK-1) und ob eine Abmeldung überall wirkt (AK-5).
  `[cmd]` Derzeit nicht prüfbar: `apps/buddy` und `apps/coach` tragen je
  genau eine Datei (`src/.gitkeep`), `apps/marketplace` existiert nicht.
  Dafür braucht es das produktionsnahe Nachbilden aus dem alten
  B-12-Kern: `hosts`-Einträge und lokale Zertifikate — `[cmd]` eine
  Änderung an Toms System, deshalb nicht eigenmächtig.
  **Wiedervorlage mit der zweiten Produkt-App.** Vorher testet der
  Aufwand etwas, das niemand nutzt.
  *Achtung bei der Umsetzung:* Für den Produktbereich ist Weg A
  vorgesehen (`domain` auf `.lumeos.app`) — und der ist genau der
  umgebungsabhängige Sonderweg, dessentwegen `admin` ihn nicht bekommen
  hat. Vor dem Setzen ist zu klären, wie lokal geprüft wird, sonst
  entsteht wieder eine Konfiguration, die erst beim Deployment auffällt.
  Hintergrund: `docs/ssot/38-cookie-bereich.md` §4 (Weg A steht dort
  bewusst weiterhin ausformuliert).

## C — Produkt: apps/web

## Auftrag

**Mitbeauftragt mit G-280 am 2026-08-30.** Bericht dort.

`[cmd]` **Der Serverbefund vom 30.08. ist genau dieser Punkt:** zwei
Agenten teilen sich `apps/web`, **und `server.py neustart` fuehrt
`taskkill /T /F` auf Port 3200 aus.**

`[read]` **Jeder Neustart schiesst den Server des anderen ab.**
`[cmd]` **18 Starts im Log, sechs davon an einem Tag.**
