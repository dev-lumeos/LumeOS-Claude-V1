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

## Was es dafuer gibt und was nicht

`[cmd]` **`apps/web/src/components/ui/placeholder-page.tsx`
existiert** — genutzt in `/coach`, `/recovery`, `/settings`,
`/supplements`, `/training`.

`[read]` **Aber das ist eine ganze Seite, kein Modal** — **und sie
liegt im alten Routenbaum, nicht in `/v2/`.**

`[read]` **Toms Vermutung stimmt zur Haelfte:** das Muster gibt es,
die Bauform nicht.

## Was daraus folgt

`[read]` **Der Hinweis wird gebraucht, sobald etwas waehlbar ist und
nicht traegt** — **das trifft mehr als Thai.**

`[cmd]` **Kandidaten aus den offenen Punkten:** MealCam ohne Fotoweg
(G-276), Buddy als Attrappe im Kontextbereich, die Kacheln, die auf
leere Tabellen zeigen.

`[read]` **Also: eine Bauform, nicht ein Sonderfall fuer Thai.**
**Was sie sagt, gehoert je Ort entschieden** — *noch nicht
entwickelt* ist nicht dasselbe wie *keine Daten vorhanden*.
