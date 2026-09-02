---
nr: C-298
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-08-27
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-298 - der Datenlogik-Waechter meldet zwei harmlose Muster rot

## Befund

(neu 2026-08-27). Aus der Pruefung von C-291.

  `[cmd]` **Gemessen mit echten Probemigrationen:**

      DO $$ CREATE POLICY p ON x FOR UPDATE ... $$      rot
      DO $$ CREATE TABLE x (... ON DELETE CASCADE) $$   rot

  `[cmd]` **Ursache:** in Dollar-Bloecken sucht der Waechter die sechs
  Befehle als **freie Woerter** (`\b(insert|update|…)\b`), nicht am
  Anfang eines Statements wie auf oberster Ebene. `FOR UPDATE` und
  `ON DELETE CASCADE` treffen dieses Muster.

  `[read]` **Beides ist gewoehnliche Struktur-SQL** — eine idempotente
  Policy im `DO`-Block ist das uebliche Muster. `[read]` **Und aus der
  Uebergabe:** *„wenn eine Pruefung dauerhaft rot ist, wird sie
  umgangen statt repariert."* **Ein Fehlalarm auf einem normalen
  Konstrukt ist deshalb kein Schoenheitsfehler.**

  **Zu tun:** in Dollar-Bloecken ebenfalls am Statement-Anfang
  verankern, statt frei im Text zu suchen — **und die Gegenprobe
  behalten**, dass `DO $$ BEGIN INSERT ... END $$` weiter rot wird.
  `[read]` **Beide Richtungen, sonst tauscht die Reparatur nur die
  eine Luecke gegen die andere.**

## Auftrag

**Mitbeauftragt mit C-297 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-02: keine Ausnahmeliste noetig.

`[cmd]` **`FOR UPDATE` und `ON DELETE CASCADE` sind unterscheidbare
Strukturklauseln.**

`[read]` **Der Fehlalarm ist behebbar, ohne eine Liste zu pflegen** —
**und eine Liste waere schlechter gewesen: sie waechst mit jedem
neuen Muster.**
