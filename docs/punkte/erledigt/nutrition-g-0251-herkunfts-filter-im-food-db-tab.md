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
erledigt: 2026-08-30
commit: 7136eabd
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-foods.tsx
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

**Claude Code, 2026-08-30.** Mitbeauftragt mit G-258. **Der
vollstaendige Bericht steht in
[G-258](nutrition-g-0258-pending-actions-im-tagebuch.md#bericht)**,
weil beide Auftraege zusammen liefen. Das Wesentliche hier:

### Eine Praemisse ist gefallen

`[cmd]` **Gemessen fuer `dev@lumeos.app`, 2026-08-30:**

    ohne Filter               total 4.970
    {"favorites": true}       total 4.098    ← nicht 1
    {"sources": ["custom"]}   total 0        ← wie erwartet

`[cmd]` **Ursache, in der Funktion selbst** (075, Zeile 945):
`is_favorite = bool_or(constraint_level = 'boost')` — **und ein
`boost` entsteht auch aus einem gemochten TAG** (5.557 Ziele gegen 1
Lebensmittel).

`[read]` **Die „1" ist die Zahl der ausdruecklich gemochten
Lebensmittel; der Filter zeigt alles zu gemochten Merkmalen.** Kein
Fehler — aber es entscheidet die Beschriftung.

**Deshalb heisst die Pille „Bevorzugt", nicht „Favoriten."**

`[cmd]` **Und ein Messfehler auf meiner Seite:** `food_search` gibt
**ein `json`** zurueck, keine Tabelle — `count(*)` darauf ist immer 1.
**Die erste Messung ergab dreimal „1" und sah nach Bestaetigung des
Auftrags aus.**

### Gebaut

**Zwei von drei**, ueber `food_search` (nicht clientseitig):
`?herkunft=bevorzugt` und `?herkunft=eigene`.

`[read]` **„Wie gestern" bleibt ungebaut, und das ist kein
Rueckstand** — `meals`/`meal_items` des Vortags sind eine eigene
Liste, keine Verfeinerung der Katalogsuche. Der Typ `SuchHerkunft`
schliesst ihn aus, damit der Reiter ihn nicht versehentlich sendet.
Die drei Zustaende aus G-276 (`posten`/`leer`/`kein_tag`) stehen
unveraendert bereit.

### A-62: drei Waechter waren gekippt

`[cmd]` **Die G-276-Waechter sicherten den blockierten Zustand.** Einer
hiess *„kein Filter wurde gebaut"* und **haette genau diesen Auftrag
verhindert.** Alle drei umgedreht bzw. berichtigt — Einzelheiten im
G-258-Bericht.

## Abnahme

_(vom Orchestrator)_

## Abnahme

**2026-08-30, mit G-258 abgenommen.**

`[cmd]` **Der Favoritenfilter liefert 4.098 von 4.970, nicht 1** —
ein Boost kommt auch von einem gemochten Tag.

`[read]` **Deshalb heisst die Pille *,,Bevorzugt"*, nicht
*,,Favoriten"*.**

`[cmd]` ***,,Wie gestern"* bleibt ungebaut** — `meals`/`meal_items`
sind eine eigene Liste, und der Typ schliesst den Filter aus.
