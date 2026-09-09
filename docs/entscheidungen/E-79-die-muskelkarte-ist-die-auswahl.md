---
nr: E-79
getroffen: 2026-09-08
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-455, C-454, C-453, G-396]
modul: supplements
---

# E-79 — die Muskelkarte ist die Auswahl, nicht der Katalog

## Entscheidung

Tom, 2026-09-08:

> gerade bei bpc157 und tb500 ist es wichtig, die nahe an den
> beschwerden (subq nearby) zu spritzen. die meisten anderen
> peptides gehen subq bauch. also prinzipiell sind die 16 plus
> bauchstellen die ueblichen, aber wieso sollen wir uns
> einschraenken, wenn wir einfach die musclemap vorne/hinten nehmen
> koennen und der user definiert, wo er das gewaehlte ueberall
> spritzen will, und daraus die rotation dann bildet?

## Was das aendert

`[cmd]` **`Injection Planner:363` sagt:** *,,No user-created custom
sites ? the 16 seeded sites cover standard practice."*

`[read]` **Diese Zeile faellt.**

`[read]` **Die 16 Orte bleiben** ? **aber als FACHWISSEN, nicht als
Auswahlliste.**

    vorher   der Katalog sagt, wo gespritzt werden darf
    jetzt    der Katalog sagt, was ueber eine Stelle bekannt ist

`[read]` **Wer `gluteal` waehlt, bekommt Ruhezeit, Hoechstmenge und
Nadelgroesse dazu.** `[read]` **Wer `triceps` waehlt, bekommt die
Stelle ohne Fachwissen** ? **und das wird benannt, nicht
verschwiegen** (E-72).

## Warum es fachlich richtig ist

`[cmd]` **BPC-157 und TB-500 wirken lokal** ? `compound-taxonomy.md`
**nennt beide *Tissue Repair*.**

Tom: *,,nahe an den beschwerden (subq nearby)."*

`[read]` **Eine feste Liste kann das nicht abbilden** ? **die
Stelle folgt der Verletzung.**

`[cmd]` **Die uebrigen Peptide gehen subkutan in den Bauch** ?
**`abd_l/r` deckt das ab.**

`[read]` **Also: die Regel ist der Bauch, die Ausnahme ist die
Problemstelle** ? **und eine Oberflaeche, die nur die Regel kennt,
taugt fuer die zwei wichtigsten Peptide nicht.**

## Was gebaut wird

**Die Auswahl zeigt die Muskelkarte**, vorne und hinten.

`[cmd]` **21 Flaechen liegen vor**, `side` ist gepflegt:

    front   chest, abs, obliques, biceps, quadriceps,
            knees, tibialis
    back    gluteal, hamstring
    both    triceps, deltoids, trapezius, neck, forearm,
            adductors, calves, head, hands, ankles, feet

`[read]` **Der Nutzer waehlt je Substanz, wo er spritzen will.**

`[read]` **Die Rotation laeuft ueber die gewaehlten Flaechen** ?
**nicht ueber alle 21, und nicht ueber die 16.**

`[read]` **Eine gewaehlte Flaeche: kein Rotationsvorschlag** ? **es
gibt nichts zu waehlen** (Toms Trizeps-Beispiel).

## Was das Schema braucht

    eine Nutzerauswahl je Substanz und Flaeche      C-454
    injection_logs zeigt auf die Flaeche,
      nicht nur auf den Katalogort                  C-455
    die 16 Katalogzeilen bekommen eine Zuordnung
      zur Flaeche                                   C-455

`[read]` **Und die Flaechen brauchen Beschriftungen** ? **`[cmd]`
heute haben nur die 16 Punkte `label`, die 21 Flaechen nicht.**

## Was NICHT gilt

`[read]` **Keine freie Koordinate auf der Figur.** `[read]` **Eine
Flaeche ist die kleinste Einheit** ? **wer genauer zielen will,
weiss ohnehin, wo.**

Tom: *,,der bodybuilder weiss schon wo exakt, er muss nur wissen
welcher bereich dran ist."*
