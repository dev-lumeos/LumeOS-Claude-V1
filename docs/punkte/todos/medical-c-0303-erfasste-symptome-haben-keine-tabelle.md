---
nr: C-303
typ: feature
modul: medical
schwere: mittel
angelegt: 2026-08-27
braucht: []
kind_von: G-207
kinder: []
entscheidung: null
beruehrt:
  tabellen: ["medical.symptoms"]
  dateien: ["docs/_archive/berichte/g-207-claude-code.md"]
zahlen: null
---

# C-303 - erfasste Symptome haben keine Tabelle

## Befund

(neu
  2026-08-27). Aus G-207, Entwurf steht in
  `docs/_archive/berichte/g-207-claude-code.md`.

  `[cmd]` **`medical.symptoms` ist ein Katalog von 34 Symptomarten**
  — `symptom_id`, `slug`, `name_de/_en/_th`. **Es gibt keine Tabelle
  fuer erfasste Symptome:** kein `severity`, `onset`, `impact`,
  `triggers`.

  `[read]` **Die Unterscheidung stammt von Claude Code und ist die
  richtige** — ich hatte im Auftrag *,,SYMPTOMS bekommt eine
  Tabelle"* geschrieben und dabei Katalog und Tagebuchzeile
  verwechselt. **Die vier Eintraege in der Konstante sind
  Tagebuchzeilen, kein Katalog.**

  `[cmd]` **Die Konstante war ausserdem in sich widerspruechlich:**
  7 Symptome in der Karte, nur 4 in der Liste — `low_libido`,
  `poor_recovery` und `weight_gain` erschienen nie.

  **Zu tun:** `user_symptom_logs` nach dem Entwurf, **mit
  Fremdschluessel auf `symptoms`.** `[read]` **Dann kann genau der
  Fehler aus G-207 strukturell nicht wiederkehren.**

## Auftrag

**Mitbeauftragt mit C-207 am 2026-09-01.** Der Auftragstext
und der Bericht stehen dort.

## Blockiert, gemessen am 2026-09-01

`[cmd]` **E-12 sagt allgemein Klartext in der Entwicklung, verweist
aber nur auf C-285.** `[cmd]` **Fuer Symptomdaten gibt es keine
ausdrueckliche Verschluesselungsregel.**

`[read]` **Codex hat keine Tabelle gebaut und die Luecke benannt.**

`[read]` **Zu entscheiden:** gilt fuer ein Symptomprotokoll dieselbe
Auflage wie fuer `user_medications` — **oder faellt es unter E-12 und
kann als Klartext entstehen?**
