---
nr: C-229
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx", "apps/web/src/lib/nutrition/naehrstoff-anzeige.ts"]
zahlen: null
---

# C-229 - Ein Katalog aus `DatabaseEcht`, Detail und Add getrennt

## Befund

(neu 2026-08-22). **Laeuft bei Fable.** Haengt an C-228.

  **Tom, 2026-08-22:** *„das sieht viel mehr wie eine brauchbare
  version aus plus noch bisschen erweitern. detail ist das supplement
  / add ist separat / links wird name und keypoints was es macht
  angezeigt"*

  `[cmd]` **Die Vorlage steht im Repo:** `tabs.tsx:779`,
  `DatabaseEcht`. Sie macht richtig, was der neue Katalog nicht kann —
  links Name mit Keypoints als Unterzeile, Add als eigene Spalte,
  `Active`/`View` wenn im Stack, Zeilenklick oeffnet das Detail mit
  `stopPropagation` auf den Knoepfen, **eine** Suche, **ein**
  Kategorienfeld.

  `[cmd]` **Ihr fehlt nur die Tabelle:** sie liest
  `supplement_catalog` mit 44 Eintraegen.

  `[cmd]` **Heute stehen drei Einstiege nebeneinander** — `Catalog`
  mit 44 und Evidenzleiste, `Database` mit 44, die
  `SubstanzKatalogKarte` mit 566 als Anhang darunter. **Es bleibt
  einer.**

  `[cmd]` **Toms Add-Befund:** `modale.tsx:589` sendet
  `supplement_id`, `custom_name`, `dose`, `dose_unit`, `timing` —
  **keine `stack_id`.** Der Dialog schreibt in den aktiven Stack, ohne
  dass man ihn sieht oder waehlen kann. Der Weg existiert seit C-224.

  `[cmd]` **Das Klappen ist gebaut und wird abgeschaut, nicht
  nacherfunden:** `naehrstoff-ordnung-tab.tsx` (518 Zeilen) und
  `naehrstoff-anzeige.ts` — `Sicht` mit `zeige`/`kindZeige`/
  `erzwungenOffen`, Start ueberall zu, Ansicht gespeichert nach
  `user_display_preferences`.

  `[read]` **Der Orchestrator hatte gemeldet, es gebe kein klappbares
  Element** — er hatte in `packages/ui` gesucht, nichts gefunden und
  daraus auf Nichtexistenz geschlossen. **Dasselbe Muster wie die neun
  falschen Banner.** Was generisch ist, gehoert nach `packages/ui`,
  sonst wird es ein drittes Mal neu erfunden.

## Auftrag

**Vorbereitet mit C-205 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.
