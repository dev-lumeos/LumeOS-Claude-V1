---
nr: E-63
getroffen: 2026-09-02
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [E-48, G-136]
modul: nutrition
---

# E-63 — *Sonstige* faellt weg

## Entscheidung

Tom, 2026-09-02:

> was macht cholesterol in mikros in sonstige? gehoert das nicht als
> Unterpunkt zu den Fetten (Lipiden) oder in eine separate Spalte
> fuer *Fettbegleitstoffe*?

> dann faellt naemlich das sonstige weg, das sieht unprofessionell
> aus denn die sind alle zuteilbar

## Der Befund

`[cmd]` **Gemessen 2026-09-02: `nutrition.nutrient_defs`,
`group_de = 'Sonstige Naehrstoffe'` haelt genau zwei Codes:**

    CHORL   Cholesterin        parent = NULL
    NT      Stickstoff, gesamt parent = NULL

`[read]` **Zwei Eintraege in einer Sammelgruppe, beide zuteilbar** —
**das ist keine Gruppe, das ist ein Rest.**

## Was gilt

### `CHORL` bekommt eine eigene Gruppe

`[read]` **Cholesterin ist kein Fett** — **es ist ein Sterol.**
`[cmd]` **`FAMS + FAPU + FASAT` ergeben `FAT`, Cholesterin nicht.**

`[read]` **Es unter `FAT` zu haengen waere falsch:** **es wuerde in
einer Summe erscheinen, in die es nicht gehoert.**

`[read]` **Aber es kommt ausschliesslich mit tierischem Fett** —
**wer die Fettqualitaet eines Tages beurteilt, will es dort sehen.**

**Neue Gruppe: *Fettbegleitstoffe*.**

`[read]` **Sichtbar bei den Lipiden, ohne in die Fettsumme
einzugehen** — **dieselbe Trennung wie bei `FIBT`** (E-48: eigene
Karte, kein `parent_code`).

### `NT` gehoert zu Protein

`[cmd]` **Stickstoff ist die Rechengroesse, aus der Protein
entsteht** — `PROT625` heisst so, weil es `NT x 6,25` ist.

`[read]` **Er gehoert zu Protein, nicht in einen Rest.**

`[read]` **Ob als Kind mit `parent_code = 'PROT625'` oder nur in der
Gruppe: zu messen.** `[cmd]` **Ein `parent_code` bedeutet, dass die
Anzeige es als Bestandteil zeigt** — **und Stickstoff ist kein
Bestandteil von Protein, sondern seine Quelle.**

## Und die Regel dahinter

Tom: *,,die sind alle zuteilbar."*

`[read]` **Eine Sammelgruppe ist die Aussage *,,wir wissen nicht,
wohin damit"*.** `[read]` **Wo jeder Eintrag zuteilbar ist, ist sie
ein Eingestaendnis, kein Ordnungsmerkmal.**

`[cmd]` **E-48 hat am 02.09. vier Wurzeln aus *Sonstige*
herausgeloest** — `WATER`, `ALC`, `OA`, `ASH`. `[cmd]` **`CHORL`
blieb als einziger Rest, plus `NT`.**

`[read]` **Damit ist der Kreis geschlossen: die Gruppe verschwindet.**
