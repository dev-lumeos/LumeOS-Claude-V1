---
nr: A-16
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-17
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-31
commit: OFFEN
beruehrt:
  tabellen: []
  dateien: ["apps/web/public/mockup/features/nutrition/MicroDashboard.js", "apps/web/public/mockup/features/nutrition/PreferencesView.js", "apps/web/public/mockup/features/nutrition/DiaryView.js", "apps/web/public/mockup/features/training/HistoryView.js", "apps/web/public/mockup/tokens.css", "apps/web/public/mockup/index.html", "docs/ssot/80-vorgaengerrepo-fundus.md"]
zahlen: null
---

# A-16 - `public/mockup/` als dritten Fundus auswerten

## Befund

(neu
  2026-08-17). **Tom, 2026-08-17:** *„Der Rest — koennen wir als
  Ergaenzung anschauen und weitere Ideen einbringen; das war ein
  Zwischenwurf, der auch schon sehr weit war."*

  `[cmd]` **Ueber 90 Dateien fuer alle elf Module**, teils sehr
  ausgearbeitet: `MicroDashboard.js` 27 KB, `PreferencesView.js` 18 KB,
  `DiaryView.js` 17 KB, `HistoryView.js` 12 KB, dazu `tokens.css`,
  `index.html` und ein Shell-Geruest.

  `[cmd]` **Es stand in keinem Index** — weder im SSOT noch in der
  Spezifikation. Damit ist es der dritte unentdeckte Fundus nach
  `referenz/lumeos-2026/` und `theme-v1/`.

  ### Der Rang ist geklaert

  `[read]` **`theme-v1/` bleibt die Vorgabe.** `public/mockup/` ist
  **Ergaenzung und Ideenquelle**, kein Sollwert — Tom nennt es einen
  Zwischenwurf.

  **Was das praktisch heisst:** Wo `theme-v1` etwas zeigt, gilt
  `theme-v1`. Wo es eine Luecke hat oder `public/mockup` eine bessere
  Loesung traegt — wie bei der Muskelkarte — **wird sie vorgelegt, nicht
  uebernommen.**

  **Der Wegweiser fehlt.** `[read]` Bei `referenz/` hat
  `docs/ssot/80-vorgaengerrepo-fundus.md` das geloest; hier braucht es
  dasselbe: was liegt wo, und was davon ist besser als das, was wir
  haben.

## Auftrag — der dritte Fundus

`[read]` **Vorbereitet am 2026-08-30.**

`[cmd]` **`apps/web/public/mockup/features/` traegt 94 `.js`-Dateien.**
`[cmd]` **`theme-v1/` traegt 53 `.jsx` und ist die massgebliche
Ideenquelle** (Tom, 28.08.).

`[read]` **Die Frage ist, ob der dritte Fundus etwas traegt, das in
keinem der beiden steht.**

### Was zu messen ist

`[read]` **Nicht alle 94 lesen — messen, welche Module dort Dateien
haben, die in `theme-v1` fehlen.** `[cmd]` **Nutrition und Training
wurden dort neu gebaut, Supplements/Medical/Goals sind
Spiegel-Stubs** (gemessen am 28.08.).

`[read]` **Und die Gegenprobe: wird der Ordner ueberhaupt
ausgeliefert?** `[cmd]` **`public/` geht in den Build** — **94 Dateien
im Auslieferungsverzeichnis, die niemand braucht, sind eine
eigene Frage.**

### Was nicht zu tun ist

**Nichts loeschen** — erst messen, was drinsteht.
**Keine Umsetzung** — nur Bestandsaufnahme.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Dateien je Modul       welche, wie gross
    nur dort vorhanden     was steht in keinem anderen Fundus
    ausgeliefert           gehen sie in den Build? gemessen
    Urteil                 behalten / archivieren / loeschen

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen** — **er laesst einen gesunden
Server stehen** (G-280, Gegenprobe: 18 Starts unveraendert).

`[read]` **`neustart` nur, wenn `start` nicht reicht** — **er beendet
den Server hart, und Tom arbeitet auf demselben Port.**

`[cmd]` **Codex fasst ihn nicht an** — die Regel steht seit
2026-08-30 in `CLAUDE.md`.

## Bericht — Urteil: **archivieren**, und ein Nebenbefund

**Claude Code, 2026-08-31.** Mitbeauftragt mit A-35, im Anschluss an
G-226. Nichts geloescht, nichts gebaut, nichts committet.

### Bestand

`[cmd]` **94 Dateien, 592 kB** unter `apps/web/public/mockup/`.
`[cmd]` **theme-v1 traegt 184 Dateien.**

    Modul         Dateien
    training           25
    nutrition          15
    coach               6
    recovery            6
    goals               5
    admin/analytics/dashboard/intelligence/
      marketplace/medical/supplements  je 4

`[cmd]` **Die groessten liegen in Nutrition und Training** — genau die
zwei Module, die der Punkt als *,,dort neu gebaut"* nennt:
`MicroDashboard.js` 26 kB, `PreferencesView.js` 18 kB,
`DiaryView.js` 16 kB, `InsightsView.js` 14 kB; bei Training
`HistoryView.js` 11 kB, `MusclesView.js` 10 kB.

`[read]` **Die Messung im Punkt stimmt** — die uebrigen zehn Module
liegen bei je vier Dateien und sind Spiegel-Stubs.

### Der Nebenbefund wiegt schwerer als der Fundus

`[cmd]` **Der Ordner wird oeffentlich ausgeliefert — ohne
Anmeldung.** Gemessen 2026-08-31 aus einer nicht angemeldeten
Sitzung:

    /mockup/index.html                            HTTP 200   22 kB
    /mockup/tokens.css                            HTTP 200   16 kB
    /mockup/features/nutrition/MicroDashboard.js  HTTP 200   26 kB

`[read]` **Der Punkt hat es vermutet** (*,,`public/` geht in den
Build"*) — **jetzt ist es belegt, und zwar ohne Sitzung.** **592 kB
Entwurfsstand liegen fuer jeden abrufbar im Netz.**

`[read]` **Das ist kein Geheimnisverlust** — es sind Mockups, keine
Daten. **Aber es ist ein Auslieferungsverzeichnis mit 94 Dateien, die
niemand braucht**, und die Startseite `index.html` ist ein
lauffaehiger Zweitstand neben dem echten Produkt.

### Urteil

**archivieren** — nach `docs/spezifikation/` oder `_archive/`,
**nicht loeschen.**

`[read]` **Wofuer er taugt:** als Ideenquelle fuer Nutrition und
Training, wo er ausgearbeitet ist. `[read]` **Wofuer nicht:** als
Sollwert — `theme-v1` bleibt die Vorgabe (Tom, 28.08.).

`[read]` **Was das Verschieben aufhaelt, ist eine Produktfrage, keine
Messung:** ob jemand den Zweitstand unter `/mockup/` noch aufruft.
**Nicht entschieden, nur benannt.**

`[read]` **Der Wegweiser, den der Punkt fordert, entsteht dabei von
selbst** — die Tabelle oben ist er, sobald der Ordner umzieht.

## Abnahme

_(vom Orchestrator)_

## Abnahme

**2026-08-31, mit G-226 abgenommen:** archivieren, nicht loeschen. Der Nebenbefund zur oeffentlichen
Auslieferung geht als G-284 weiter.

`[read]` **Anmerkung: dieser Punkt lag in `next/`, nicht ausgegeben.**
`[cmd]` **Claude Code hat ihn an Ort und Stelle bearbeitet und es
gemeldet** — **mein Fehler beim Zurueckstellen.**
