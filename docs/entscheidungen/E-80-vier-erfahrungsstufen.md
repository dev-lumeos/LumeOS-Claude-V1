---
nr: E-80
getroffen: 2026-09-08
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-228, G-412, G-415]
modul: nutrition
---

# E-80 — vier Erfahrungsstufen, vier Faktoren

## Entscheidung

Tom, 2026-09-08:

> Datenbank: beginner 0.75 / advanced 0.9 / pro 1 / elite 1.1

    beginner  0.75
    advanced  0.90
    pro       1.00
    elite     1.10

`[read]` **Die DATENBANK gilt, nicht die Spec.**

## Was das aufloest

`[cmd]` **`public.profiles` hat den CHECK:**
`beginner | advanced | pro | elite` ? **er bleibt unveraendert.**

`[cmd]` **`SPEC_04_FEATURES.md` nennt
`beginner | intermediate | advanced | elite`** ? **die Spec ist
ueberholt.**

`[read]` **`intermediate` gibt es nicht.**

`[read]` **Und die Werte verschieben sich:** **`advanced` war
1.00, ist jetzt 0.90** ? **`pro` nimmt die 1.00.**

    Spec (alt)              Entscheidung
    beginner      0.75      beginner  0.75
    intermediate  0.90      advanced  0.90
    advanced      1.00      pro       1.00
    elite         1.10      elite     1.10

`[read]` **Dieselben vier Zahlen, andere Namen** ? **`pro` ist
der Bezugspunkt, nicht `advanced`.**

## Was daran haengt

`[cmd]` **G-228 ist damit beantwortet** ? **die Frage war, welche
Stufen es gibt und woher sie kommen.**

`[cmd]` **`public.profiles.experience_level` ist die Quelle**
(G-412).

`[cmd]` **Und `dev@lumeos.app` steht auf `pro`** ? **Faktor 1.00,
der Score wird nicht mehr verschoben.**

## Wo es hingehoert

`[read]` **Die vier Faktoren sind eine Rechenregel, keine
Nutzereinstellung** ? **sie stehen im Code, nicht in einer
Tabelle.**

`[cmd]` **`SPEC_09_SCORING.md` (HumanCoach) legt Formeln nach
`packages/scoring/`** ? **dieselbe Bauform waere hier richtig.**

`[read]` **Aber die Kachel rechnet heute in
`apps/web/src/app/v2/nutrition/`** ? **messen, ob ein Umzug
noetig ist oder ob eine Tabelle im Modul reicht.**
