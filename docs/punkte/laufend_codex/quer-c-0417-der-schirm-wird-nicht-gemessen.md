---
nr: C-417
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-359
entscheidung: E-70
agent: codex
beauftragt: 2026-09-07
beruehrt:
  dateien:
    - tools/mockup-deckung.mjs
zahlen:
  gemessen: 2026-09-07
  im_code: 2488
  versteckt_goals: 18
---

# C-417 — der Schirm wird nicht gemessen

## Befund

Aus G-359, 2026-09-07.

`[cmd]` **`mockup-deckung.mjs` zaehlt Beschriftungen im Code.**

`[cmd]` **Aber in `goals` standen 18 von 26 Elementen hinter
Entweder-Oder-Verzweigungen, die immer den Echtdaten-Zweig nahmen** —
**sichtbar im Code, unerreichbar am Schirm.**

`[read]` **Der Waechter haette sie als *,,ist da"* gezaehlt.**

`[read]` **Das ist die gefaehrlichere Haelfte:** **ein geloeschtes
Element faellt auf, ein verstecktes nicht.**

## Was fehlt

`[cmd]` **`tools/schuss.mjs` macht Bildschirmfotos, meldet sich
selbst an, zaehlt Attrappen und Konsolenfehler.**

`[read]` **Es koennte den gerenderten Text auslesen** — **dann waere
die Messung *Mockup gegen Schirm* statt *Mockup gegen Code*.**

## Zu klaeren

`[read]` **Was kostet ein Lauf ueber alle Module?** `[cmd]` **Der
Kettenlauf braucht 267 s und laeuft taeglich** — **ein Schirmlauf
waere vermutlich billiger.**

`[read]` **Und ob er ins Gate gehoert oder zum taeglichen Lauf** —
`[cmd]` **C-416 hat gerade gezeigt, wie ein taeglicher Lauf
gemeldet wird.**

`[read]` **Ein Schirmlauf braucht einen laufenden Server** — **das
ist der Unterschied zu allen anderen Waechtern.**

## Auftrag — den Schirm messen

**Mitbeauftragt: C-31, C-155.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-417 — Mockup gegen Schirm

`[cmd]` **Der Waechter zaehlt Code, nicht Schirm** — **und haette
die 18 versteckten Elemente in `goals` als vorhanden gemeldet.**

`[cmd]` **`tools/schuss.mjs` meldet sich selbst an und zaehlt
Attrappen** — **es koennte den gerenderten Text mitliefern.**

`[read]` **Miss, was ein Lauf ueber alle Module kostet.**

`[read]` **Und entscheide, wo er hingehoert:** `[cmd]` **du hast
gerade den taeglichen Kettenlauf gebaut** — **derselbe Weg wuerde
passen, mit demselben Statusweg ueber
`backup/_manifests/`.**

`[read]` **Der Unterschied zu allen anderen Waechtern: ein
Schirmlauf braucht einen laufenden Server.** `[cmd]` **Der
Dev-Server gehoert Claude Code** — **kläre, ob ein eigener Port
noetig ist.**

### 2 · C-31 — der atomare Vertrag fuer Annehmen

`[cmd]` **Du hast gemeldet: fuer Annehmen und Ablehnen fehlt der
atomare Serververtrag** — **insbesondere, ob dabei ein Rezept
erzeugt oder geaendert wird.**

`[read]` **Das ist die richtige Frage** — **E-70 sagt, das Mockup
ist eine Variante, kein SSOT.**

`[cmd]` **Und C-411 hat drei Tabellen gebaut:**
`recipe_curation_candidates`, `_ingredients`, `_decisions`.

`[read]` **Bau den Vertrag** — **ein angenommener Kandidat wird
Katalogmaterial, wie `food_tags_kuriert` bei den Tags** (E-55).

`[read]` **Und begruende, ob dabei ein Rezept entsteht oder nur eine
Ueberlagerung.**

### 3 · C-155 — nicht wechseln, aber vorbereiten

`[cmd]` **`@supabase/ssr` liegt bei 0.1.0, aktuell waere 0.12.6.**
`[cmd]` **Vier Workspaces betroffen.**

`[read]` **Nicht wechseln** — **schreib auf, was ein Wechsel
braeuchte:** **Build, Admin- und Coach-Login, Sitzung, Abmeldung.**

`[read]` **Damit es entscheidbar wird, wenn Tom Zeit dafuer hat.**

### Was nicht zu tun ist

**Keine Abhaengigkeit aktualisieren.**
**Nie gegen die laufende Datenbank testen.**
`apps/` nicht anfassen — **Claude Code arbeitet dort an G-359.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Schirmlauf   was er kostet, wo er hingehoert
    Gegenprobe   ein verstecktes Element wird gemeldet
    C-31         der Vertrag, mit Begruendung
    C-155        was ein Wechsel braeuchte, als Liste

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
