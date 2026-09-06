---
nr: C-31
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-14
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: ["nutrition.foods"]
  dateien: ["docs/ssot/daten/wortschatz-luecke.json"]
zahlen: null
---

# C-31 - Admin-Oberfläche für die Kuration

## Befund

(neu 2026-08-14).
  Setzt C-29 und C-30 voraus — bewusst **zuletzt**. `[cmd]` Der Umfang
  ist seit C-28 beziffert: **468 Arten** mit unbrauchbarem Namen, nicht
  rund 2.000 Einträge.

  Die Oberfläche kuriert **Zuordnungen** — Begriff auf Eintrag, samt
  Anzeigename — und schreibt in die Override-Tabelle aus C-29, niemals
  direkt in `nutrition.foods`. `[cmd]` Die frühere Fassung „Gattungsnamen
  je Art" ist mit C-28/C-33 hinfällig; die Priorisierung kommt aus C-18,
  nicht aus einer Artenliste.

  **Warum nicht zuerst, obwohl Tom dort beginnen wollte:** C-28 bis C-30
  sind Schema- und Vertragsfragen. Eine Oberfläche vor dem Vertrag wird
  zweimal gebaut — und eine Oberfläche auf `name_display` würde Handarbeit
  produzieren, die der nächste Kettenlauf verwirft.

  Priorisierung der Kurationsarbeit, solange C-18 (Fehlsuchen
  mitschreiben) nicht steht: die Häufigkeitsliste aus
  `daten/wortschatz-luecke.json` (1.581 Kandidaten) und die 37 Zutaten
  des MealCam-Maßstabs.

## Auftrag

**Mitbeauftragt mit C-389 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-02: gemessen: die Naht ist bekannt.

`[cmd]` **Die Admin-Kuration ist vollstaendig lesend.**

`[read]` **Ein Schreibweg braucht drei Teile:** serverseitige
Admin-Mutation, Overlay-Upsert, Lesen ueber `food_tags_effective`.

`[cmd]` **Der dritte steht seit C-366.** `[read]` **Damit ist es ein
UI-Auftrag mit bekannter Naht, kein Entwurf mehr.**

## Auftrag

**Mitbeauftragt mit C-409 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-07: der Schreibweg steht.

`[cmd]` **`nutrition.curate_food_tag(p_food_id, p_tag_code,
p_action)`** — validierter Overlay-Upsert.

`[cmd]` **Nicht-Admins abgewiesen, keine direkten Schreibrechte fuer
`authenticated`.**

`[read]` **Die Schranke liegt in der Datenbank, nicht in der
Oberflaeche.**

`[read]` **Die Admin-Oberflaeche bleibt ein UI-Auftrag.**

## Auftrag

**Mitbeauftragt mit C-416 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-07: der Vertrag steht.

`[cmd]` **`nutrition.decide_recipe_curation_candidate(...)`, Schritt
417 in der Kette.**

`[cmd]` **Annahme erzeugt einen unveraenderlichen
BLS-Katalog-Snapshot** — **kein privates `recipes`-Objekt.**

`[read]` **Die Ueberlagerung statt der Kopie** — **wie
`food_tags_kuriert`** (E-55).

`[cmd]` **Fehler hinterlassen keinen Teilzustand.**

`[read]` **Was bleibt: die Oberflaeche zum Annehmen und Ablehnen** —
ein UI-Auftrag.
