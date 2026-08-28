---
nr: C-208
typ: befund
modul: supplements
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: null
entscheidung: null
erledigt: 2026-08-28
commit: OFFEN
durch: C-326
beruehrt:
  tabellen:
    - supplements.supplements
    - medical.medication_active_substances
    - medical.medication_formulations
    - medical.medication_products
  dateien:
    - docs/punkte/todos/supplements-c-0129-der-kimi-bestand-brauchbar-aber-nicht-importierbar.md
zahlen:
  gemessen: 2026-08-28
  supplements_gesamt: 596
  supplements_sichtbar: 412
  wirkstoffe: 498
  formulierungen: 453
  produkte: 448
---

# C-208 - C-129 neu fassen: der Import ist laengst passiert

## Befund

`[cmd]` **Gemessen 2026-08-28:** `supplements.supplements` hat 596
Zeilen, davon 412 sichtbar; `medical.medication_active_substances` 498,
`medical.medication_formulations` 453 und `medical.medication_products`
448. Die Importannahme aus C-129 (237 Substanzen, 56 Wirkstoffe, 124
Produkte) trifft nicht mehr zu.

`[read]` C-129 traegt dennoch weiterhin genau diese historische
Ueberschrift und Ausgangszahlen. Der verlangte Schritt aus C-208 war
nicht der Import, sondern den offenen Befund auf die verbleibende
Luecke zu richten. Diese Neufassung ist nicht erfolgt.

## Wiederhergestellt

`[cmd]` A-57 hat C-208 am 2026-08-28 direkt gegen den Datenbestand und
die noch unveraenderte C-129-Punktdatei geprueft. C-208 war am
2026-08-27 per Textheuristik als erledigt geschlossen worden, ohne den
geforderten Dokumentationsschritt zu messen.

## Was zu tun ist

**C-129 mit dem heutigen Bestand neu fassen.** Der Import selbst ist
nicht als offene Arbeit zu beschreiben; verbleibende Deckungs- und
Erfassungsluecken brauchen eigene, messbare Aussagen.

## Abnahme

**2026-08-28, Orchestrator.** `[cmd]` **Durch C-326 erfuellt:** C-129
traegt jetzt den heutigen Bestand und trennt statische Regeldeckung
von Laufzeit-Ergebnis.

`[read]` **Codex hat ihn nicht selbst geschlossen, obwohl er ihn
erfuellt hat** — nach dem Modell verschiebt nur der Orchestrator.
**Richtig.**

**Abgenommen.**
