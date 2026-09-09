---
nr: G-395
typ: entscheidung
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-393
entscheidung: null
erledigt: 2026-09-08
commit: 21c54ef9
beruehrt:
  dateien:
    - packages/ui/src/koerperkarte-pfade.ts
zahlen:
  gemessen: 2026-09-08
  orte: 16
  ohne_punkt: 6
---

# G-395 — sechs Injektionsorte ohne Punkt auf der Figur

## Befund

Aus G-393, Claude Code, 2026-09-08. **Selbst nachgemessen.**

    delt_l/r    glute_l/r   lat_l/r   quad_l/r   -> Punkt da
    vglute_l/r                                   -> heisst vg_l/r
    abd_l/r     sq_delt_l/r  thigh_sq_l/r        -> kein Punkt

`[cmd]` **10 von 16.**

## Die vier Vorschlaege

**1 ? `vg_l/r` umbenennen zu `vglute_l/r`.**

`[read]` **Die Datenbank folgt der Spec** (`Injection Planner:48`),
**die Karte ist aelter.**

`[cmd]` **`KARTEN_ORTE` berichtigt es heute** ? **eine
Umbenennung macht die Zuordnung fuer diesen Fall ueberfluessig.**

**2 ? `sq_delt` und `thigh_sq` als eigene Punkte.**

`[read]` **Versetzt neben den IM-Punkten** ? **subkutan wird
flacher und weiter aussen gesetzt.**

**3 ? `abd_l/r` neu.**

`[cmd]` **Die Figur hat keinen Bauchpunkt** ? **er waere neu
anzulegen.**

**4 ? `pec`, `bicep`, `tricep` BLEIBEN.**

`[read]` **Sie sind fuer die Erholungskarte da, nicht fuer
Injektionen** ? **die Karte hat zwei Verwendungen.**

`[read]` **Das ist der Grund, warum sie nicht *aufgeraeumt* werden
duerfen.**

## Warum es eine Entscheidung ist

`[cmd]` **`packages/ui` gehoert Admin und Coach mit** ? **jede
Aenderung dort trifft drei Anwendungen.**

`[read]` **Und eine Umbenennung bricht jeden Aufrufer, der `vg_l`
kennt** ? **miss zuerst, wie viele es sind.**

## Entschieden am 2026-09-08 — bauen

Tom: *,,wir haben 16 injektionsstellen und gezeigt werden 10."*

`[read]` **Der Punkt war als Entscheidung angelegt** ? **das war zu
vorsichtig.**

`[cmd]` **Die sechs SubQ-Punkte werden in G-396 gebaut.**

`[read]` **Und der Befund darunter ist groesser:** **`quad` liegt
am Knie, `lat` am Oberarm** ? **die bestehenden zehn stimmen auch
nicht.**

## Abnahme

**2026-09-08, mit G-396 abgenommen: hinfaellig.**

`[read]` **Der Punkt fragte nach sechs fehlenden PUNKTEN auf der
Figur.**

`[cmd]` **E-79: es gibt keine Punkte mehr** ? **die Auswahl sind
die 21 Muskelflaechen.**

`[cmd]` **Was bleibt, ist `latissimus`** ? **es fehlt unter den
Flaechen, `lat_l/r` faellt auf `trapezius`.**

**Das geht in C-455.**
