---
nr: E-70
getroffen: 2026-09-07
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [E-68, E-69, G-359]
modul: quer
---

# E-70 — drei Zustaende je Mockup-Element

## Entscheidung

Tom, 2026-09-07:

> das mockup ist nicht ssot es ist eine moegliche variante eines
> moduls. aber wenn ich selbst definierte aenderungen und umsetzen
> als IST sehe und kein referenzobjekt als altes SOLL sehe, wie soll
> ich als mensch entscheiden koennen ob wir alles umgesetzt haben
> und es das kann was vorgesehen war

## Das Mockup ist ein Referenzobjekt, kein SSOT

`[read]` **Ein SSOT sagt *,,so muss es sein"*.**

`[read]` **Ein Referenzobjekt sagt *,,so war es gedacht"*** — **man
darf begruendet abweichen, aber man sieht, dass man es tut.**

## Drei Zustaende, jedes Element in genau einem

    angebunden   die Kopie laeuft, Attrappe darunter (E-69)
    Attrappe     noch nicht angebunden, wartet auf X (E-68)
    verworfen    Tom hat entschieden, es anders zu machen

`[read]` **Eine begruendete Abweichung bleibt nicht als Attrappe
stehen** — **sonst wartet sie auf etwas, das nie kommt.**

`[read]` **Aber sie verschwindet auch nicht stillschweigend** —
**sie wird verzeichnet, mit Grund und Datum.**

## Die Verwerfungsliste

`[cmd]` **`docs/spezifikation/10-plattform/design-system/
mockup-verworfen.json`**

    {
      "modul": "goals",
      "element": "Open annual cycle editor",
      "verworfen": "2026-09-07",
      "grund": "zu komplex fuer V1, ersetzt durch Phasenwahl",
      "entscheidung": "E-71"
    }

`[read]` **Eine Zeile je bewusster Abweichung.**

`[cmd]` **Der Waechter zieht sie von der Fehlmenge ab** — **und
meldet nur, was in keinem der drei Zustaende steht.**

`[read]` **Das ist dann wirklich verschwunden.**

## Warum es die Zahl vollstaendig macht

`[cmd]` **Gemessen 2026-09-07: 2.488 Elemente, 1.343 fehlen.**

`[read]` **Ohne die dritte Kategorie waere jede Abweichung fuer
immer ein Fehler** — **und die Zahl koennte nie auf null gehen.**

`[read]` **Mit ihr gilt: jedes Element ist angebunden, sichtbar als
Attrappe, oder verworfen mit Grund.** `[read]` **Alles andere ist
ein Befund.**
