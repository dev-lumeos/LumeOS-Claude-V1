---
nr: C-173
typ: befund
modul: coach
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: OFFEN
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-173 - `MARKETPLACE_PRODUCTS` traegt `inStack` und `evidence`

## Befund

(neu 2026-08-20). Aus SSOT 173. **Kleiner, wichtiger
  Befund.**

  `[cmd]` **Die Produktzeilen im Entwurf tragen `inStack: true` und
  `evidence: "A"`** — sie kennen den Stack des Nutzers und den
  Evidenzgrad aus dem Katalog.

  `[read]` **Das ist die Verbindung Marketplace → Supplements**, und
  sie zeigt, dass der Marktplatz nicht als getrennter Laden gedacht war.

  `[cmd]` **`substance_catalog` traegt 567 Eintraege mit Evidenzgrad**
  — die Gegenseite steht.

## Auftrag

**Mitbeauftragt mit G-151 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-02, mit G-151 abgenommen:** gemessen: ueberholt.

`[cmd]` **Es gibt keine Marketplace-Produkttabelle und kein Modell
mit `inStack` plus `evidence`.**

`[cmd]` **`inStack` liegt ausschliesslich in statischen, als Entwurf
markierten Supplements-Dateien** (15 bzw. 34 Vorkommen). `[cmd]`
**Die 419 `evidence_grade`-Werte gehoeren zum Stoffkatalog.**

`[read]` **Das entspricht E-37.**
