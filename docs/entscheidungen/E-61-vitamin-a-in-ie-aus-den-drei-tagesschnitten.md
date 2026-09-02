---
nr: E-61
getroffen: 2026-09-02
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-398, C-324, E-34, E-38]
modul: nutrition
---

# E-61 — Vitamin A in IE aus den drei Tagesschnitten

## Entscheidung

Tom, 2026-09-02:

> die einzelgesamt schnitt/tag haben wir ja, egal ob sie vollstaendig
> sind oder nicht, das aendert ja nichts an dieser tatsache. also
> nehmen wir diese werte, rechnen sie um zu IE und verwenden dann die
> summe

## Der Befund

`[cmd]` **`nrf93_daily` meldet `VITA` als einzigen fehlenden Code an
120 von 120 Tagen.**

`[cmd]` **Die IE-Funktion rechnet aus `RETOL`, `CARTB`, `CAROTPAXB`
und verweigert die Ausgabe bei jeder Komponentenluecke** — **sie
summiert keine Nullen.**

`[read]` **Sie prueft, ob jeder Posten einen Wert hat, und gibt
`null` zurueck, sobald einer fehlt** — **statt die vorhandenen zu
summieren.**

Tom: *,,eine summe kann man bilden mit 0."*

`[read]` **Dieselbe Klasse wie 1+1+1+0:** **sie behandelt eine Luecke
als *unbekannt viel*, obwohl der `VITA`-Snapshot daneben zeigt, dass
sie als Null zaehlt.**

## Was gilt

**Die drei Tagesschnitte werden einzeln umgerechnet und addiert.**

    RETOL       x 3,3333
    CARTB       x 1,6667
    CAROTPAXB   x 0,8333
                  --------
                  Summe in IE

`[cmd]` **Beispiel `dev`, 60 Tage:**

    391,5     x 3,3333  =  1.305 IE
    15.329,3  x 1,6667  = 25.549 IE
    1.088,6   x 0,8333  =    907 IE
                          ---------
                          27.761 IE

`[read]` **Die Tagesschnitte existieren je Komponente, unabhaengig
von der Vollstaendigkeit** — **das ist die Tatsache, an der die
Luecke nichts aendert.**

## Warum nicht ueber `VITA`

`[read]` **Ein erster Gedanke war, `VITA` in ug mit 3,3333
umzurechnen** — es ist ein Retinol-Aequivalent, und fuer Retinol gilt
dieser Faktor.

`[read]` **Toms Weg ist besser:** **er umgeht die Frage, ob RE oder
RAE gemeint ist** (`VITA` 3.079,1 gegen `VITAA` 1.714,7 ug), **und
rechnet mit den Rohwerten und ihren eigenen Faktoren.**

`[cmd]` **E-34 bleibt damit gueltig:** kein Gesamtfaktor, drei
Komponenten.

## Was sich nicht aendert

`[cmd]` **Die drei Komponenten bleiben einzeln im Reiter sichtbar**,
mit ihrer Vollstaendigkeitsangabe.

`[read]` **Die Warnung *0/60 Tg. vollstaendig* bleibt ehrlich** —
**sie sagt, dass Einzelwerte fehlen.** `[read]` **Nur der Score wird
nicht mehr blockiert.**

`[cmd]` **Und E-38 gilt weiter:** `censored` und `trace` sind Nullen,
**`missing` traegt nichts bei** — **aber verhindert die Summe nicht.**
