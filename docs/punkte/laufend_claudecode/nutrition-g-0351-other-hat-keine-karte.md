---
nr: G-351
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-348
entscheidung: E-58
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  dateien:
    - apps/web/src/lib/nutrition/slots-lage.ts
zahlen:
  gemessen: 2026-09-07
---

# G-351 — `other` hat keine Karte

## Befund

Aus G-348, Claude Code, 2026-09-07.

`[cmd]` **Ein Quick-Add-Posten auf `other` ist ueber *Wie gestern*
gar nicht erreichbar** — **`rasterZeilen` kennt nur die vier
Rasterreihen.**

`[read]` **Es gibt keine Karte *Sonstiges*.**

`[cmd]` **Der `meal_type`-CHECK kennt sieben Werte:** `breakfast`,
`lunch`, `dinner`, `snack`, `pre_workout`, `post_workout`, `other`.

`[cmd]` **In Gebrauch sind vier.**

## Was das heisst

`[read]` **Seit E-58 ordnet die Zeit zu, nicht die Kategorie** —
**und die Slots liefern die Reihen.**

`[read]` **Ein Posten auf `other` faellt durch, weil kein Slot ihn
traegt.**

`[read]` **Zwei Wege:**

`[read]` **Eine Sammelreihe fuer alles ohne Slot** — **aber E-63 hat
gerade *Sonstige* abgeschafft, weil alles zuteilbar war.**

`[read]` **Oder: Quick-Add setzt kein `other`** — **der Nutzer waehlt
einen Slot, und wer keinen passenden hat, legt einen an** (E-58:
keine Obergrenze).

`[read]` **Der zweite Weg passt besser zu E-58 und E-63.**

## Auftrag — drei Reste aus dem Diary

**Mitbeauftragt: G-346, G-305.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · G-351 — `other` erreichbar machen oder vermeiden

`[read]` **Miss zuerst, ob ein Nutzer `other` ueberhaupt setzen
kann** — `[cmd]` **Quick-Add hat eine Auswahl, und `modale.tsx`
traegt sie.**

`[read]` **Wenn ja: entscheide dich fuer einen der zwei Wege und
begruende ihn.** `[read]` **Ich halte den zweiten fuer richtig** —
**der Nutzer waehlt einen Slot, und wer keinen passenden hat, legt
einen an.**

`[cmd]` **E-58: keine Obergrenze.** `[cmd]` **E-63: eine Sammelgruppe
ist die Aussage *,,wir wissen nicht, wohin damit"*.**

### 2 · G-346 — Quick-Add und die Mahlzeit

`[cmd]` **E-66 hat es fuer MealCam entschieden:** **die Mahlzeit
steht vor dem Foto, gewaehlt statt abgeleitet.**

`[read]` **Fuer Quick-Add gilt dasselbe** — **aber die Frage aus
deinem Bericht bleibt: legt *Mahlzeit mit anlegen* immer eine neue
an, oder verwendet es eine bestehende wieder?**

`[read]` **Mein Vorschlag: die bestehende im selben Slot.**
`[read]` **Wer um 15:00 Kaffee und um 15:10 einen Keks erfasst, hat
einen Nachmittagssnack** — **nicht zwei.**

`[read]` **Das folgt E-58: die Zeit ordnet zu, der Slot ist die
Ordnung.** `[read]` **Kein erfundenes Zeitfenster.**

### 3 · G-305 — vier Sackgassen, der Rest

`[cmd]` **Fuenf von sechs waren am 02.09. erledigt.** `[cmd]` **Der
sechste war ein `InEntwicklungKnopf`, ersetzt.**

`[read]` **Miss, ob der Punkt jetzt zu ist** — **oder was noch
offen ist.**

### Was nicht zu tun ist

**Keine Sammelgruppe** — E-63.
**Nichts in `supabase/` aendern.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    other           erreichbar oder vermieden, begruendet
    Quick-Add       neue oder bestehende Mahlzeit, belegt
    15:00 / 15:10   ein Snack oder zwei, am Schirm
    G-305           zu / was fehlt
    Bildschirmfoto  vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
