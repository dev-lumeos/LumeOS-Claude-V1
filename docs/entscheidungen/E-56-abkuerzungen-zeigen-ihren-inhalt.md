---
nr: E-56
getroffen: 2026-09-02
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-279, G-263, C-108]
modul: nutrition
---

# E-56 — Abkuerzungen zeigen ihren Inhalt

## Entscheidung

Tom, 2026-09-02, zu G-279:

> ich denke hier muessen wir ein bisschen weiter gehen und es
> schlauer machen
>
> ja beide verwenden aber darin auch zeigen was das ist, sprich same
> as yesterday und darunter was das war / most used und darunter was
> das war

## Der Befund

`[cmd]` **`wieGestern()` steht in `mahlzeiten.tsx:316`**, mit einem
Knopf, der abschaltet, wenn es nichts zu uebernehmen gibt.

`[cmd]` **Und `vorschlags-lage.ts` traegt die Messung:** *Vortag mit
16 Posten ueber vier Mahlzeiten.*

`[read]` **Was fehlt, ist die Ansicht:** **der Knopf sagt *wie
gestern*, nicht *was gestern war*.**

`[cmd]` **G-263 hat die Attrappe *Smart suggestions* entfernt** —
keine ihrer vier Zeilen trug. `[read]` **Aber eine Zahl darin war
zaehlbar: ein Fruehstueck kam an 27 von 30 Tagen vor.**

## Was gilt

**Beide Abkuerzungen, und beide zeigen, was sie enthalten.**

    Wie gestern      darunter: die Posten des Vortags
    Am haeufigsten   darunter: was das war, mit Zahl

`[read]` **Der Unterschied zur entfernten Attrappe ist die
Ehrlichkeit:** `[cmd]` **sie machte aus 27 von 30 Tagen ein *,,Top
breakfast, 78 %"*** — **Top ist ein Urteil, die Quote war
erfunden.**

`[cmd]` **C-108 und F-02 gelten:** nennen ja, bewerten nein.

`[read]` ***Am haeufigsten* ist eine Angabe.** **Und die Zahl steht
daneben, nicht als Prozentwert, sondern als das, was sie ist:** *27
von 30 Tagen*.

## Warum es besser ist als zwei Knoepfe

`[read]` **Ein Knopf ohne Inhalt zwingt zum Ausprobieren.** **Wer
sieht, was er uebernimmt, entscheidet vorher.**

`[read]` **Und die zwei unterscheiden sich dann sichtbar:** `[cmd]`
**gestern kann ein Ausreisser gewesen sein, das Haeufigste ist ein
Muster.**

## Zu messen, bevor gebaut wird

`[cmd]` **Auf `dev` kam gestern fuenf Mahlzeiten** — **aber das
haeufigste Fruehstueck nur einmal in 30 Tagen.**

`[read]` **Die 27 aus G-263 stammen aus einem anderen Zeitraum oder
einer anderen Zaehlung.** `[cmd]` **Was *am haeufigsten* zaehlt** —
**dieselbe Mahlzeit, dieselben Posten, oder derselbe Name?** — **ist
zu klaeren, bevor die Kachel entsteht.**

`[cmd]` **Als G-328.**
