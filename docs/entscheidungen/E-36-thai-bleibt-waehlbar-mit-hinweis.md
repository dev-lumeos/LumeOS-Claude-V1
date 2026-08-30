---
nr: E-36
getroffen: 2026-08-30
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-177]
modul: nutrition
---

# E-36 — Thai bleibt waehlbar, mit Hinweis

## Frage

`[cmd]` **TH ist im UI auswaehlbar, und die Datenbank hat 0
Thai-Aliase** bei 32.845 insgesamt (C-120, Codex, 2026-08-30).

`[read]` **Die Sprache laesst sich waehlen, und die Suche findet
nichts** — eine Zusage ohne Deckung.

## Entscheidung

Tom, 2026-08-30: *,,lassen wir die sprachauswahl aber setzen ein
modal darueber wenn es gewaehlt wird mit *noch nicht entwickelt* oder
sowas"*.

**Die Auswahl bleibt. Wer TH waehlt, bekommt einen Hinweis.**

## Warum das besser ist als Abschalten

`[read]` **Eine fehlende Sprachoption sagt nichts.** **Eine, die
etwas sagt, sagt: es ist vorgesehen, aber noch nicht da.**

`[cmd]` **TH ist eine der drei Zielsprachen** (DE/EN/TH), und Tom
sitzt in Thailand. `[read]` **Sie zu entfernen waere eine Aussage
ueber das Produkt, nicht ueber den Stand.**

## Der Baustein existiert

**Berichtigt 2026-08-30.** Tom hat ihn mit einem Bildschirmfoto
belegt.

`[cmd]` **`packages/ui/src/in-entwicklung.tsx`, 126 Zeilen**, genutzt
in **39 Dateien** quer durch `v2/training`, `v2/nutrition`,
`v2/goals`, `v2/medical`, `v2/recovery`, `v2/supplements`,
`v2/coach`.

    <InEntwicklung titel grund? onClose />

`[cmd]` **Und er traegt genau die Unterscheidung, die diese
Entscheidung offenlassen wollte:** das Feld `grund` ist optional —
*,,Woran es haengt. Ohne Angabe bleibt es beim allgemeinen Satz."*

`[read]` **Also ist *,,noch nicht entwickelt"* gegen *,,keine Daten
vorhanden"* der Unterschied zwischen mit und ohne `grund`.**
**Nichts Neues zu bauen.**

`[cmd]` **Escape schliesst** — *,,sonst ist das Modal per Tastatur
eine Sackgasse."*

### Wie ich ihn nicht gefunden habe

`[read]` **Ich habe nach *,,noch nicht entwickelt"* gesucht.** **Der
Baustein heisst `InEntwicklungKnopf` und schreibt *,,in
Entwicklung"*.**

`[read]` **Nach dem Wort gesucht statt nach der Sache** — dasselbe
Muster, das am 30.08. viermal bei Waechtern auffiel (G-216, G-247,
G-246, G-108).

`[cmd]` **`placeholder-page.tsx` war ein falscher Treffer:** eine
ganze Seite im alten Routenbaum, nicht der gesuchte Baustein.

## Was daraus folgt

**Fuer Thai: `InEntwicklung` mit `titel="Thai"` und einem `grund`**,
der sagt, dass die Aliase fehlen und woher sie kaemen offen ist.

`[read]` **Kein neuer Baustein, kein Sonderfall** — **ein weiterer
Aufrufer von 39.**
