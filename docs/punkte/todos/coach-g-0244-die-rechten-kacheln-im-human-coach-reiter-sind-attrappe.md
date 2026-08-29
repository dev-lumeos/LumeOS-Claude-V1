---
nr: G-244
typ: befund
modul: coach
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien: [docs/spezifikation/00-MODULSTAND.md]
zahlen: null
---

# G-244 — die rechten Kacheln im Human-Coach-Reiter sind Attrappe

## Befund

**Aus der Modulstand-Erhebung vom 2026-08-28**,
`docs/spezifikation/00-MODULSTAND.md`.

`[cmd]` **Elf Attrappen-Vorkommen in fuenf Dateien** unter
`v2/coach/`. **Betroffen sind die rechten Kacheln** — Coaching
balance, Trust circle, Coach activity — **und *,,Latest from your
coaches"*.**

`[cmd]` **Die zehn Reiter selbst sind angebunden**, und das
`coach`-Schema traegt Daten: `relationships` 6,
`client_permissions` 5, `client_autonomy` 5, `checkins` 6,
`messages` 6, `alerts` 6.

`[read]` **Die Kacheln zeigen erfundene Zahlen** — Coaching balance
nennt Betraege in Euro, Trust circle zaehlt Module je Coach. **Beides
gibt es im Schema nicht.**

`[cmd]` **Mockup dazu:** `module-coach-athlete.jsx` (566 Zeilen),
`module-coach-meta.jsx` (201) — **Beziehungsdaten und Bewertung, mit
`Ref:` auf HumanCoach SPEC_02 §1/§2 und SPEC_05 §1.**

## Berichtigung, 2026-08-28

**Der gebaute `/v2/`-Stand ist der Massstab, nicht der Mockup.**

**Tom:** *,,theme-v1 ist das claude design von welchem wir v2
abgeleitet haben ... also ist theme-v1 nur noch eine ideen struktur
falls uns in v2 was fehlt."*

`[read]` **Dieser Punkt entstand aus der Modulstand-Erhebung, die den
Mockup fuer den Sollzustand hielt.** `[read]` **Ein Unterschied
zwischen Mockup und `/v2/` ist damit kein Befund mehr** — er ist
hoechstens eine Frage, ob in v2 etwas fehlt.

`[cmd]` **In G-249 hat die falsche Richtung 1.009 Zeilen gekostet:**
eine zweite Ansicht wurde neben eine bestehende gebaut, weil ich den
Entwurf fuer den Massstab hielt.

`[read]` **Vor einem Auftrag zu klaeren:** ist hier wirklich etwas
offen, oder war nur die Blickrichtung falsch?
