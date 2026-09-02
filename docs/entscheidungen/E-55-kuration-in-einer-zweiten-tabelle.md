---
nr: E-55
getroffen: 2026-09-02
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-229, C-366, C-29, C-31]
modul: nutrition
---

# E-55 — Kuration in einer zweiten Tabelle

## Entscheidung

Tom, 2026-09-02, zu G-229.

**Was der Import erzeugt und was ein Mensch entscheidet, stehen
getrennt.**

    food_tags           bleibt, was der Import erzeugt
    food_tags_kuriert   was ein Mensch gesetzt oder entfernt hat

## Der Befund

`[cmd]` **`NUTRITION_NEXT_SPEC_DECISIONS` Paragraph 5:** *,,Admin
darf Tags bei BLS Foods korrigieren."*

`[cmd]` **Codex hat gemessen (C-366):** der Import ersetzt 12
Tag-Codes **ohne Herkunftsunterscheidung** — **eine Kuration waere
nicht geschuetzt.**

`[cmd]` **`food_tags` traegt heute `food_id`, `tag_code`,
`confidence`** — keine Herkunft, 30.797 Zeilen.

## Warum zwei Tabellen und kein Herkunftsflag

`[read]` **C-29 loest dasselbe Problem bei den Namen schon so:**
`[cmd]` **`name_de` ist der Quellname, `name_display_de` der
kuratierte.** **Der Import schreibt nur die erste.**

`[read]` **Der Vorteil ist derselbe:** **der Import kann seine
Tabelle jederzeit leeren und neu fuellen** — **er muss nicht wissen,
was er anfassen darf.**

`[read]` **Und eine Kuration ueberlebt auch dann, wenn der Import
einen Tag gar nicht mehr setzt.**

### Der Fall, den ein Flag nicht koennte

`[read]` **Wer *,,entferne `vegan` von Kokosmilch"* ausdruecken
will, braucht eine Zeile, die es nicht gibt.**

`[cmd]` **Mit zwei Tabellen geht es:** die kuratierte traegt ein
`entfernt`-Kennzeichen. **Ein Flag am selben Datensatz kann eine
Abwesenheit nicht festhalten.**

## Was gilt

    food_tags           Import, mit confidence
    food_tags_kuriert   Mensch, ohne confidence -- sie ist
                        entschieden, nicht geschaetzt
                        mit entfernt-Kennzeichen
    Anzeige und Suche   lesen beide, kuriert schlaegt Import

`[cmd]` **`confidence` bleibt beim Import** — **eine Kuration hat
keine.**

## Was vorher zu messen ist

`[cmd]` **`auto_tag_food` existiert nicht** — Codex hat es in C-366
gemessen, die Spec nennt es als Trigger.

`[read]` **Wer die 30.797 Zeilen heute schreibt, ist ungemessen:**
der Import, ein Kettenschritt, oder etwas Drittes.

`[read]` **Das gehoert gemessen, bevor die zweite Tabelle
entsteht** — **sonst schuetzt sie vor einem Schreiber, den es nicht
gibt, und der echte laeuft weiter.**

`[cmd]` **Als C-384.**

## Und der Weg fuer den Admin

`[cmd]` **`apps/admin` hat eine Kurationsseite mit 314 Zeilen**
(A-36), **vollstaendig lesend** (C-366).

`[read]` **Sie ist der Ort, an dem `food_tags_kuriert` gefuellt
wird** — **nicht eine neue Oberflaeche.** `[cmd]` **C-31 fuehrt das
bereits als Punkt.**
