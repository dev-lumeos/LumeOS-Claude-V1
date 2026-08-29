---
nr: E-26
getroffen: 2026-08-29
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-241]
modul: medical
---

# E-26 — Documents und Appointments bleiben

## Frage

`[cmd]` **Der gebaute Stand hat sechs Reiter:** `dashboard`,
`biomarkers`, `import`, `tracking`, `wirkstoffe`, `insights`.
`[cmd]` **Der Entwurf `module-medical.jsx` nennt drei andere:**
`History`, `Documents`, `Appointments`.

**Sind sie entfallen oder nie gebaut?**

## Entscheidung

Tom, 2026-08-29: **beide bleiben, es waren nie verworfene Ideen.**

### Documents

*,,documents war eine idee dass man"* —

    seine original pdf/fotos/etc von labresults verfuegbar hat und
      nicht nur eingelesen
    allfaellige aerztliche medikamentenrezepte oder arztberichte
      ablegen kann
    alles was ein user so an medical dokumente hat die er gerne an
      einem ort haben will

`[read]` **Der erste Punkt ist der wichtigste und der am wenigsten
offensichtliche:** `[cmd]` **der Import liest Laborberichte ein** —
**aber das Original bleibt danach nirgends.** `[read]` **Wer seinem
Arzt den Befund zeigen will, hat nur unsere Auslesung.**

`[cmd]` **`lab_reports` existiert bereits als Tabelle.** `[read]`
**Ob sie eine Datei traegt oder nur die ausgelesenen Werte, ist zu
messen.**

### Appointments

*,,appointments war eine idee dass man seine arzttermine, lab
termine, etc in der plattform verwalten kann"*.

`[cmd]` **Kein Gegenstueck im Schema.** `[read]` **Das ist neu zu
bauen, nicht anzubinden.**

## Was daraus folgt

`[read]` **Der Reiterschnitt ist damit nicht *,,sechs gegen
sechs"*, sondern:** die fuenf Spec-Reiter plus `wirkstoffe` sind
gebaut, **`Documents` und `Appointments` fehlen** — und `History`
ist vermutlich in `tracking` aufgegangen. **Das gehoert gemessen.**

`[read]` **Beide sind eigene Punkte, nicht Teil von G-241.**

## Beruehrt

`[read]` **`Documents` beruehrt E-19/E-20** — dieselbe Frage wie bei
MealCam: **wo liegen Dateien, wer darf sie sehen, was passiert bei
Widerruf.** `[cmd]` **Und `SICHERHEIT.md` fuehrt Medical-Daten als
Klartext in der Entwicklungsphase (E-12)** — **ein hochgeladener
Arztbericht ist eine andere Klasse als ein ausgelesener Laborwert.**
