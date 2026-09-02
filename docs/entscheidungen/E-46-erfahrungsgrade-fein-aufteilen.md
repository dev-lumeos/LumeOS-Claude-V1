---
nr: E-46
getroffen: 2026-09-02
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-228]
modul: nutrition
---

# E-46 — Erfahrungsgrade fein aufteilen

## Entscheidung

Tom, 2026-09-02, zu G-228:

> maximale aufsplittung des Erfahrungsgrad, je mehr stufen wir haben
> umso genauer koennen wir die multiplikatoren nutzen und bessere
> resultate fuer den user kriegen. dementsprechend ausbauen.

## Der Befund, den es aufloest

`[cmd]` **`SPEC_04` kennt `intermediate`, die Datenbank kennt
`pro`.** `[cmd]` **Ein `pro`-Profil fiel auf 0,90** — den Wert fuer
`intermediate`.

`[cmd]` **G-283 hat den stillen Rueckfall entfernt:** `nutritionScore`
liefert jetzt `null` bei unbekanntem Level.

`[read]` **Damit ist die Luecke sichtbar statt still** — **und Toms
Antwort loest sie nicht durch Angleichen, sondern durch Ausbauen.**

## Was daraus folgt

**Mehr Stufen, je eigener Multiplikator.**

`[read]` **Die heutige Zahl der Stufen ist zu messen, bevor gebaut
wird** — `[cmd]` **der CHECK an der Spalte und die Werte in
`SPEC_04` gehoeren nebeneinander gelegt.**

`[read]` **Und die Multiplikatoren brauchen eine Quelle.** `[cmd]`
**0,90 fuer `intermediate` steht in `SPEC_04`** — **woher, ist
ungeprueft.**

`[read]` **Nach C-109 und E-43 gilt hier dasselbe:** **eine Zahl ohne
Beleg ist ein *conservative default*, kein Ergebnis.**

## Zu klaeren, bevor gebaut wird

`[read]` **Wie viele Stufen?** **Und woran haengt der Multiplikator
fachlich** — Trainingsjahre, Koerperzusammensetzung, etwas anderes?

`[read]` **Tom hat das Ziel genannt, nicht die Zahl** — *,,je mehr
stufen umso genauer"*. **Die Skala selbst ist noch zu entwerfen.**
