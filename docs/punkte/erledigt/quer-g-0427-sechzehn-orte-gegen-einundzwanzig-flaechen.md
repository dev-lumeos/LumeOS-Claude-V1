---
nr: G-427
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-389
entscheidung: null
erledigt: 2026-09-08
commit: 8a60059a
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-injektionen.tsx
zahlen:
  gemessen: 2026-09-08
  orte: 16
  flaechen: 21
---

# G-427 — sechzehn Orte gegen einundzwanzig Flaechen

## Befund

`[cmd]` **Zum ZWEITEN Mal gemeldet, beide Male von Claude
Code:**

**G-423:**

> *,,Die Injektionskarte zeichnet die konfigurierten Flaechen noch
> nicht ein ? sie kennt 16 anatomische Orte MIT Seitigkeit, die
> Konfiguration 21 Flaechen OHNE. Eine Zuordnung waere eine
> Behauptung."*

**G-389:**

> *,,Die Protokollliste zeigt weiter Entwurfszeilen.
> `tab-injektionen.tsx:525` rendert `INJ_PROTOKOLL`, waehrend
> `stand.protokoll` in Zeile 166 gelesen und nur fuer die
> Flaechengruppen benutzt wird."*

`[read]` **Beide Male hat er die Luecke NICHT ueberbrueckt** ?
**richtig.**

## Die zwei Listen

    medical.injection_sites            16 Zeilen
      anatomische Orte MIT Seitigkeit
      (ventrogluteal L, ventrogluteal R, ...)

    public.koerperflaechen             23 Kartenflaechen
      OHNE Seitigkeit auf Ebene 2,
      28 Seitenzeilen auf Ebene 3

`[cmd]` **C-468 hat `koerperflaechen` heute gebaut** ? **mit
Ebene 3 fuer links und rechts.**

`[read]` **Die dritte Ebene ist genau, was fehlte.**

## Was zu messen ist

**1** ? **Passen die 16 Orte auf die 28 Seitenzeilen?**

`[cmd]` **`injection_sites` hat `body_view`, `x_pct`, `y_pct`** ?
**Koordinaten, keine Flaechennamen.**

`[cmd]` **Und `user_injection_site_selections.body_area_code`
zeigt auf eine FLAECHE** ? **das ist E-79.**

**2** ? **Wo klafft es genau?**

`[read]` **Ein Ort wie *ventrogluteal L* muesste auf
`gluteal` + `seite: links` zeigen.**

`[cmd]` **Miss, wie viele der 16 sich so abbilden lassen.**

**3** ? **Und was mit dem Rest?**

`[read]` **Ein Ort ohne Flaeche ist kein Fehler** ? **er ist eine
Stelle, die die Karte nicht zeigt.**

`[read]` **Das gehoert gemeldet, nicht erfunden.**

## Was daran haengt

`[cmd]` **Die Protokollliste in `tab-injektionen.tsx:525`.**

`[cmd]` **Die Rotationskarte** (G-423, halb).

`[read]` **Und jede kuenftige Ansicht, die eine erfasste
Injektion auf der Karte zeigen will.**

## Aufgeloest 2026-09-08 in G-430

`[read]` **Dieser Punkt war eine Ecke** ? **er geht in den
Durchgang ueber alle vier Module.**

`[cmd]` **G-430: die Muskelhierarchie zu Ende bringen.**
