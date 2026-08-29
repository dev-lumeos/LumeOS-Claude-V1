---
nr: G-243
typ: befund
modul: recovery
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien: [docs/spezifikation/00-MODULSTAND.md]
zahlen: null
---

# G-243 — die Recovery-Schwellen stehen im Mockup, nicht im Punkt

## Befund

**Aus der Modulstand-Erhebung vom 2026-08-28**,
`docs/spezifikation/00-MODULSTAND.md`.

`[cmd]` **`module-recovery-engine.jsx` (395 Zeilen)** traegt
`MODALITY_BONUS` fuer elf Modalitaeten, `OVERTRAINING_SIGNALS` mit
vier Schwellen, `ACWR_DATA` und `HRV_BASELINE`.

`[read]` **Mehrere offene Punkte fuehren genau diese Werte als
*unbelegt* oder *fehlt*** — darunter E-06 und E-09, wo Tom
*,,Recherchieren statt setzen"* entschieden hat.

`[read]` **Die Frage ist, ob die Mockup-Werte belegt sind oder selbst
gesetzt.** `[read]` **Wenn belegt: die Quelle uebernehmen. Wenn
gesetzt: die Recherche steht weiter aus** — und der Mockup ist kein
Beleg.

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
