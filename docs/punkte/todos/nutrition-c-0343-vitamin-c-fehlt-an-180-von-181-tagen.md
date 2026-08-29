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
  ohne_vitc_zeile: 420
  vitc_gleich_null: 1797
  vitc_groesser_null: 4923
  vitc_null_wert: 0
  lebensmittel_gesamt: 7140
---

# C-343 — zwei Schreibweisen fuer *,,kein Vitamin C"*

## Berichtigung des urspruenglichen Befunds

`[read]` **Dieser Punkt hiess *,,Vitamin C fehlt an 180 von 181
Tagen"* und behandelte das als Datenluecke.** **Tom, 2026-08-29:**
*,,schonmal in betracht gezogen dass nicht jedes lebensmittel vitamin
c drin hat?"*

`[cmd]` **Er hat recht, und ich hatte es nicht geprueft.** Unter den
420 ohne Wert stehen **Butterschmalz, Backpulver, Balsamicoessig,
Cashewkerne** — dort ist null der richtige Wert.

## Der eigentliche Befund

`[cmd]` **Gemessen 2026-08-29, alle aus `bls_4_0_local_import`:**

    VITC = 0        1.797 Lebensmittel
    VITC > 0        4.923
    VITC NULL           0
    keine Zeile       420

`[read]` **Zwei Schreibweisen fuer dieselbe Aussage:** 1.797
Lebensmittel tragen eine Zeile mit null, 420 tragen gar keine.
**Und `NULL` gibt es nirgends** — wo eine Zeile steht, steht ein
Wert.

## Warum das nicht nur Kosmetik ist

`[cmd]` **Apfelsaft hat 119 Naehrstoffwerte — aber keinen fuer
Vitamin C.** `[read]` **Apfelsaft ohne Vitamin C ist unplausibel.**

`[read]` **Also bedeutet *,,keine Zeile"* nicht durchgaengig
*,,nicht enthalten"*.** **Butterschmalz ist der eine Fall, Apfelsaft
der andere — und wir koennen sie heute nicht unterscheiden.**

`[cmd]` **Der Durchschnitt liegt bei 121,8 Naehrstoffen je
Lebensmittel.** `[cmd]` Apfelpektin hat 31, Backpulver 47 — **dort
ist die duenne Belegung plausibel.** Apfelsaft mit 119 ist es nicht.

## Was daran haengt

`[cmd]` **`vitc_missing` feuert an 180 von 181 Tagen** und hat
deshalb C-324 blockiert.

`[read]` **Wenn *,,keine Zeile"* meist *,,nicht enthalten"* heisst,
ist der Zaehler ein Fehlalarm** — und der Score nicht blockiert.
**Wenn nicht, ist er richtig.** **Beides ist heute nicht
unterscheidbar.**

## Zu messen

**Fuehrt BLS 4.0 eine Kennzeichnung fuer *nicht bestimmt* gegen
*nicht enthalten*, und hat der Import sie mitgenommen?**

`[read]` **Wenn ja: nachtragen, und der Zaehler wird ehrlich.**
`[read]` **Wenn nein: entscheiden, wie fehlende Zeilen zu lesen
sind** — und die Entscheidung aufschreiben, statt sie im Zaehler zu
verstecken.
