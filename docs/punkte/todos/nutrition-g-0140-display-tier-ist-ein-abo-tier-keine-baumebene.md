---
nr: G-140
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["docs/specs/Core/SUBSCRIPTION_GATES_ADR.md"]
zahlen: null
---

# G-140 - `display_tier` ist ein Abo-Tier, keine Baumebene

## Befund

(neu
  2026-08-20). **Fehler in der Anzeige.** Aus SSOT 173.

  `[cmd]` **`docs/specs/Core/SUBSCRIPTION_GATES_ADR.md` sagt es
  ausdruecklich:**

  | Feature | Gate spaeter |
  |---|---|
  | **Mikro-Tier 2 (Athlete)** | **Plus-only** |
  | **Mikro-Tier 3 (Medical)** | **Pro-only** |

  *„`nutrient_defs.display_tier` (1/2/3) ist in DB vorhanden ·
  `nutrition_settings.show_micros_tier` existiert · User-Profile hat
  `subscription_tier` (free | plus | pro | coach)."*

  `[cmd]` **Verteilung passt:** Stufe 1 **31**, Stufe 2 **47**, Stufe 3
  **60**.

  `[read]` **G-101 hat es als Hierarchie-Ebene gelesen** und daraus die
  Einrueckung gebaut. **C-161 hat das mit `parent_code` behoben.**

  `[cmd]` **Aber die Anzeige traegt weiter eine Spalte *„STUFE"* mit
  1/2/3** — sichtbar in Toms Bildschirmfoto. **Sie zeigt das Abo-Tier,
  als waere es eine Baumtiefe.**

  **Zu tun:** Spalte umbenennen oder entfernen. `[read]` **In V1 gibt es
  kein Gate** (derselbe ADR), **aber die Bedeutung ist eine andere.**
