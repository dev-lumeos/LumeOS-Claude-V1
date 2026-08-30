---
nr: C-359
typ: feature
modul: medical
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: G-278
entscheidung: null
beruehrt:
  tabellen: [medical.symptoms]
zahlen:
  gemessen: 2026-08-30
  symptome_katalog: 34
---

# C-359 — Symptome brauchen ein Protokoll je Nutzer

## Befund

Aus G-278, Claude Code, 2026-08-30.

`[cmd]` **`medical.symptoms` hat 8 Spalten und 34 Zeilen und wird von
`lesen.ts:431` gelesen.** `[cmd]` **Eine Aussage im Code behauptete,
die Tabelle gebe es nicht** — **und stand als Grund am Schirm.**

`[read]` **Berichtigt mit dem, was wirklich fehlt:** `symptoms` ist
ein **Katalog**. **Fuers Erfassen fehlt ein Protokoll je Nutzer.**

## Was daran haengt

`[read]` **Der Knopf *Log symptom* kann nicht funktionieren**, solange
es keine Tabelle gibt, in die er schreibt.

`[read]` **Und die Klasse ist dieselbe wie bei `meal_plan_logs` vor
G-274:** ein Katalog ohne Ausfuehrungsspur. `[cmd]` **Dort hat der
Schreibweg drei Attrappen echt gemacht.**

## Vor dem Bauen

`[cmd]` **E-12 haelt Medical-Daten in der Entwicklungsphase als
Klartext.** `[read]` **Ein Symptomprotokoll ist eine Gesundheitsakte**
— **und `user_medications` darf laut Bestand erst gebaut werden, wenn
Verschluesselung und Schluesselverwaltung stehen.**

`[read]` **Ob dieselbe Auflage hier gilt, ist zu klaeren, bevor eine
Tabelle entsteht.**
