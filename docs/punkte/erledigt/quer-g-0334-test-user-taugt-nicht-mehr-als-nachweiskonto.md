---
nr: G-334
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: C-394
entscheidung: null
agent: codex
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: OFFEN
beruehrt:
  tabellen: [nutrition.meal_slots]
zahlen:
  gemessen: 2026-09-02
---

# G-334 — `test-user` taugt nicht mehr als Nachweiskonto

## Befund

Aus C-394, Codex, 2026-09-02.

`[cmd]` **`test-user@lumeos.local` hat keine Preferences, keine
Meals und liegt nicht im historischen Zwei-Konten-Seed.**

`[read]` **Die Regel sagt: Nachweise werden auf `test-user`
gefuehrt** — **Laeufe auf `dev` ueberschreiben Toms gespeicherte
Einstellungen.**

`[read]` **Aber ein Konto ohne Daten kann nichts belegen.**

## Was heute geschieht

`[cmd]` **Die Agenten bauen ihre Buehne selbst** — Plaene,
Protokollzeilen, Slots. `[cmd]` **Und raeumen sie danach weg**, weil
die Regel es verlangt.

`[read]` **Der Nachweis existiert dann nicht mehr, wenn der
Orchestrator abnimmt** — **das war der Fehler in G-311.**

## Zu entscheiden

`[read]` **Bekommt `test-user` einen Grundbestand?** `[read]`
**Oder bleibt er leer, und die Buehne wird je Auftrag gebaut und
stehen gelassen?**

`[cmd]` **Auf `dev` stehen inzwischen vier Plaene, sechs
Protokollzeilen, fuenf Slots** — **vom Orchestrator angelegt, damit
Tom etwas sieht.**

`[read]` **Damit ist `dev` faktisch das Nachweiskonto geworden** —
**gegen die Regel, aber mit Toms Wissen.**

## Auftrag

**Mitbeauftragt mit C-241 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-02, mit C-241 abgenommen:** gemessen, Vorschlag liegt vor.

`[cmd]` **`test-user` hat in allen geprueften Tabellen 0 Zeilen.**
`[cmd]` **`dev` traegt vier Plaene, sechs Logzeilen, sechs Slots.**

`[read]` **Der Seed-Vorschlag steht in C-241, mit Groessenordnung** —
**vorgelegt, nicht entschieden.**
