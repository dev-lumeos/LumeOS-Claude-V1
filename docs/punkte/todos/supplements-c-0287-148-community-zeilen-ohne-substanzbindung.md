---
nr: C-287
typ: befund
modul: supplements
schwere: mittel
angelegt: 2026-08-26
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-287 - 148 Community-Zeilen ohne Substanzbindung

## Befund

(neu
  2026-08-26). Aus G-199, in C-286 **bewusst nicht geloest.**

  `[cmd]` **Der Community-Reiter erscheint bei 49 der 412 Substanzen.**
  148 von 212 Zeilen haben keine Zuordnung:

      community_science_delta            30 von 30   ALLE
      community_usage_concepts            3 von 3    ALLE
      community_terminology_terms        57 von 71
      community_product_quality_signals  32 von 40
      community_stack_patterns           24 von 31
      community_side_effect_patterns      2 von 37

  `[read]` **Die Verteilung ist kein Zufall.** Nebenwirkungen betreffen
  einen Stoff und sind fast vollstaendig zugeordnet. **Mythen und
  Konzepte betreffen eine Praxis** — *„SARMs sind selektiv"* gehoert zu
  keiner einzelnen Substanz.

  `[cmd]` **Drei Ursachen, von Claude Code gemessen:**
  `substance_ids` traegt **Slugs, keine UUIDs** · `substance_class`
  hat **0 Treffer** gegen `supplement_groups` · **der Klassen-Rueckfall
  aus C-280 existiert nicht** — ich hatte ihn als Sicherheitsnetz
  angenommen.

  `[read]` **Codex hat es in C-286 nicht gebaut**, mit der Begruendung:
  *„Datenbasis traegt keine sichere automatische Bindung."* **Das war
  richtig** — eine falsch zugeordnete Nebenwirkung ist schlimmer als
  eine fehlende.

  **Zu tun — und es ist eine Entscheidung, keine Automatik:** die
  Klassen gegen `supplement_categories` abbilden (`injizierbare_aas`,
  `sarm`, `orale_aas`) · die Mythen an **Gruppen** haengen statt an
  Substanzen · **und pruefen, ob die 71 Begriffe ueberhaupt
  substanzgebunden sind** — *„blast"* und *„pin"* gelten allgemein und
  gehoeren vermutlich in ein eigenes Glossar.
