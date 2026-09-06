---
nr: E-69
getroffen: 2026-09-07
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [E-68, G-359, A-59]
modul: quer
---

# E-69 — Tom entscheidet, wann etwas erledigt ist

## Entscheidung

Tom, 2026-09-07:

> wenn etwas vollumfaenglich angebunden ist nehme ich das ab und
> dann ist die attrappe obsolet weil erledigt. und ich definiere
> wann was erledigt ist

## Was gilt

**Eine Attrappe verschwindet mit der Abnahme, nicht mit dem
Anschluss.**

    angebunden      der Agent hat gebaut
    geprueft        der Orchestrator hat gemessen
    abgenommen      Tom hat es gesehen und bestaetigt
                    -> erst jetzt faellt die Attrappe

`[read]` **Kein Agent entfernt eine Attrappe.** `[read]` **Der
Orchestrator auch nicht.**

## Warum die Trennung noetig ist

`[cmd]` **Gemessen 2026-09-07: 1.343 von 2.488 Mockup-Elementen
fehlen in der UI** (G-359).

`[read]` **Sie sind nicht durch eine Entscheidung verschwunden** —
**sie sind beim Bauen weggefallen.**

`[read]` **Wer eine Attrappe entfernt, weil er glaubt, sie sei
erledigt, entfernt die einzige Stelle, an der noch steht, was
geplant war.**

`[cmd]` **Und *vollumfaenglich* ist der Massstab, nicht
*teilweise*:** `[cmd]` **`goal_phases` ist zu 14 von 14 Spalten
lesbar und zu 4 von 14 schreibbar** — **das ist nicht angebunden.**

## Was daraus folgt

`[read]` **Ein Agent meldet: *,,angebunden, bereit zur Abnahme"*.**

`[read]` **Der Orchestrator prueft und legt Tom vor** — **mit dem,
was ein Mensch sehen muss, um zu entscheiden.**

`[read]` **Tom nimmt ab oder nicht.** `[read]` **Bis dahin bleibt
die Attrappe stehen, auch wenn daneben die echte Sache schon
funktioniert.**

`[cmd]` **Das kostet ein paar Tage doppelte Anzeige** — **und
verhindert, dass etwas still verschwindet.**

## Und A-59 bleibt davon unberuehrt

`[cmd]` **Toter Code wird geloescht, nicht auskommentiert.**

`[read]` **Der Unterschied: toter Code hatte nie einen Zweck.**
**Eine Attrappe traegt einen, der noch nicht abgenommen ist.**
