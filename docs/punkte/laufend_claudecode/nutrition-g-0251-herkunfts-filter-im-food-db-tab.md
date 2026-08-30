---
nr: G-251
typ: feature
modul: nutrition
schwere: niedrig
angelegt: 2026-08-28
braucht: []
kind_von: G-70
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
beruehrt:
  dateien: [apps/web/src/app/v2/nutrition/tab-foods.tsx]
zahlen: null
---

# G-251 — die Herkunfts-Filter im Food-DB-Reiter

## Befund

Aus G-70, Claude Code, 2026-08-28: **bewusst nicht gebaut, weil sie
nicht im Auftragsteil standen.**

`[read]` **Der Befundteil von G-70 nannte drei:** Favoriten, *,,wie
gestern"*, eigene Foods.

`[read]` **Sie sind etwas anderes als die Tag-Filter aus G-112** —
die filtern nach Eigenschaften des Lebensmittels, **diese nach der
Beziehung des Nutzers dazu.**

## Vor dem Bau zu messen

**Woraus wuerde jeder der drei kommen?** `[read]` *,,Wie gestern"*
setzt voraus, dass gestern etwas erfasst wurde — **was zeigt der
Filter an einem Tag ohne Vortag?**

## Auftrag

**Mitbeauftragt mit G-276 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Blockiert, 2026-08-30

**Aus G-276 gemessen:** `p_filters` hat keinen Schluessel fuer Favoriten, `foods_custom` hat
0 Zeilen und wird von `food_search` nicht gelesen.

`[read]` **Wartet auf C-355.**

## Auftrag — entblockt am 2026-08-30

`[cmd]` **`food_search` kennt zwei neue `p_filters`-Vertraege:**

    {"favorites": true}      nur als boost/liked materialisierte
    {"sources": ["custom"]}  nur eigene Foods des p_user_id

`[cmd]` **Fuer `dev` liefert der Favoritenfilter genau 1 Treffer.**
`[cmd]` **`foods_custom` hat 0 Zeilen, also liefert der Custom-Filter
0** — **der erwartete Leerzustand, keine angelegte Testzeile.**

`[read]` **Und die Gegenprobe traegt:** ein Nutzer ohne Vorlieben
bekommt dieselben 25 Food-IDs in derselben Reihenfolge. `[cmd]`
**+10,655 ms Median.**

`[read]` **Der dritte Filter — *wie gestern* — braucht `food_search`
nicht.** **Du hast dafuer am 30.08. drei Zustaende gebaut**, weil
*es gibt kein Gestern* etwas anderes ist als *gestern war nichts*.

### Regeln

`[cmd]` **A-30, A-59, A-62.** **Nichts auf `dev@lumeos.app`
schreiben.** Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    echte Zeilen        am Schirm, mit Bildschirmfoto
    Leerzustand         wo er auftritt, benannt
    Attrappen           vorher / nachher
    Ladezeit            ms, kalt und warm

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
