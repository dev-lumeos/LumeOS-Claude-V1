---
nr: C-343
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: C-324
entscheidung: null
beruehrt:
  tabellen: [nutrition.food_nutrients, nutrition.foods]
zahlen:
  gemessen: 2026-08-29
  lebensmittel_ohne_vitc: 420
  lebensmittel_gesamt: 7140
  betroffene_positionen: 2398
  tage_unvollstaendig: 180
  tage_gesamt: 181
---

# C-343 — Vitamin C fehlt an 180 von 181 Tagen

## Befund

Aus C-324, Codex, 2026-08-29. **Vom Orchestrator nachgemessen.**

`[cmd]` **420 von 7.140 Lebensmitteln haben keinen
Vitamin-C-Wert** — sechs Prozent.

`[cmd]` **Aber 2.398 erfasste Positionen betreffen sie**, und das
reicht, um **180 von 181 Tagen** unvollstaendig zu machen.

`[read]` **Sechs Prozent Luecke im Katalog werden zu
neunundneunzig Prozent Luecke in der Auswertung** — weil die
fehlenden Lebensmittel haeufig gegessen werden.

## Was daran haengt

`[read]` **Der Nutrition-Score aus E-25 ist deshalb nicht gebaut
worden.** Codex: *,,Sie muesste derzeit fast immer `incomplete`
liefern, nicht einen kuenstlich niedrigen Zahlenwert."*

`[cmd]` **Und G-248 zeigt dasselbe von der anderen Seite:** der
Sammelhinweis im Tagebuch nennt 76 von 138 Naehrstoffen mit fehlenden
Positionen.

## Zu klaeren

**Welche 420 sind es, und warum fehlt der Wert?**

`[read]` **BLS 4.0 ist die einzige Quelle** (E-03, keine
OpenFoodFacts, kein USDA). `[read]` **Wenn der Wert dort nicht steht,
ist er nicht zu beschaffen** — dann ist die Frage, ob ein Score
Naehrstoffe ueberspringen darf, deren Wert im Katalog fehlt.

`[read]` **Und das ist eine andere Frage als *,,der Nutzer hat es
nicht erfasst"*.** **Zwei Luecken, die gleich aussehen und
verschiedenes bedeuten** — dieselbe Unterscheidung wie in C-48.
