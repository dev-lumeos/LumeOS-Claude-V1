---
nr: G-214
typ: befund
modul: supplements
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: G-186
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/lib/supplements/substanz-read.ts
    - apps/web/src/lib/medical/wirkstoff-marke.ts
zahlen: null
---

# G-214 — die Katalogsuche sagt nicht, warum ein Treffer passt

## Befund

Aus G-186, Claude Code, 2026-08-28.

`[cmd]` **Die Suche nach *,,Resveratrol"* findet auch
*Pterostilbene* — ohne zu sagen warum.** Der Treffer entsteht ueber
einen Erklaertext, in dem der andere Stoff vorkommt.

`[read]` **Fuer den Nutzer sieht das aus wie ein Fehler.** Er sucht
einen Stoff und bekommt einen anderen, ohne Verbindung dazwischen.

`[read]` **Die Loesung ist gebaut und liegt daneben:** in G-210 wurde
fuer Handelsnamen genau das gemacht — *,,Scemblix ist ein Handelsname
von Asciminib - Novartis"*. **Der Treffer zeigt, warum er ein Treffer
ist.**

`[read]` **Hier fehlt dieselbe Zeile.** Und der Fall ist unangenehmer
als bei Handelsnamen: **eine Marke ist derselbe Stoff, ein
Erklaertext-Treffer ist ein anderer.** Wer das nicht sagt, laesst den
Nutzer glauben, Pterostilbene sei Resveratrol.

---

`[read]` **Vor dem Bau zu messen:** wie viele Treffer entstehen
ueberhaupt ueber Erklaertexte statt ueber Namen und Synonyme, und
wie oft fuehrt das zu einem fremden Stoff? **Wenn es Einzelfaelle
sind, reicht eine Begruendungszeile. Wenn es die Mehrheit ist, ist
die Suche falsch gewichtet.**

## Verwandt

**G-150** — *die Volltextsuche findet ueber Erklaertexte*. `[read]`
**Vermutlich derselbe Befund aus anderer Richtung; beide vor dem Bau
zusammenlegen oder abgrenzen.**

## Auftrag

**Vorbereitet mit C-205 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.
