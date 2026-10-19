---
nr: G-680
typ: befund
modul: plattform
schwere: hoch
angelegt: 2026-10-19

braucht: []
kind_von: G-676

quellen:
  - docs/punkte/erledigt/plattform-g-0676-papierkorb-ueber-alle-module.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src
---
# Es gibt keinen Weg "Konto löschen"

## Befund

`[cmd]` 19.10.: `apps/web/src` enthält keinen Aufruf, der ein Konto löscht. Es gibt nur Abmelden.
`auth.users` wird einzig im Testdaten-Entferner gelöscht.

`[read]` Codex hat den Fremdschlüsselkatalog gelesen (G-676):
- 30 Tabellen mit `user_id` haben keinen FK auf `auth.users`.
- Mehrere Tabellen stehen auf RESTRICT oder NO ACTION, darunter `training.programs`, `marketplace.orders` und `goals.phase_transition_responses`.
- `storage.objects` hat keinen FK.

Ein einfaches Löschen von `auth.users` würde also Zeilen und Dateien zurücklassen oder abbrechen.

`[annahme]` Für Nutzer in der EU ist ein vollständiges Löschen des Kontos Pflicht (DSGVO Art. 17). Den Papierkorb muss es mit einschliessen.

## Was zu tun ist

- Codex: eine Kettenfunktion, die den FK-Graph, die Zeilen ohne FK, die Storage-Dateien und den Papierkorb vollständig und wiederholbar abarbeitet. `auth.users` kommt zuletzt.
- Gegenprobe: Nach dem Löschen findet sich keine Zeile mit dieser `user_id` mehr.
- Claude Code: "Konto löschen" unter Einstellungen, mit starker Rückfrage.
- Offen (Tom): Wie werden geteilte Daten behandelt, also Coach-Beziehungen und Marktplatz-Bestellungen?
