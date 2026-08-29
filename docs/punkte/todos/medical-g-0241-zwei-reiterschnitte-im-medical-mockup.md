---
nr: G-241
typ: entscheidung
modul: medical
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: E-26
beruehrt:
  dateien: [docs/spezifikation/00-MODULSTAND.md]
zahlen: null
---

# G-241 — zwei Reiterschnitte im Medical-Mockup

## Befund

**Aus der Modulstand-Erhebung vom 2026-08-28**,
`docs/spezifikation/00-MODULSTAND.md`.

`[cmd]` **`module-medical.jsx` (810 Zeilen) fuehrt sechs Reiter:**
Overview · Labs · Medications · History · Documents · Appointments.

`[cmd]` **`module-medical-v2.jsx` (819 Zeilen) fuehrt fuenf:**
Dashboard · Biomarkers · Import · Tracking · Insights — **mit dem
Vermerk *,,5 spec tabs"*.**

`[read]` **Beide liegen nebeneinander im selben Ordner.** `[cmd]` Der
gebaute Stand hat `tab-biomarker`, `tab-tracking`, `tab-wirkstoffe`.

**Welcher Schnitt gilt?** `[read]` `History`, `Documents` und
`Appointments` gibt es im v2-Schnitt nicht — **sind sie entfallen oder
verschoben?**

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

## Entschieden

**E-26, 2026-08-29.** Die Begruendung steht dort.
