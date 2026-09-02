---
nr: G-331
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-323
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/mahlzeiten.tsx
zahlen:
  gemessen: 2026-09-02
---

# G-331 — vier Suchen auf den Hook umstellen

## Befund

Aus G-323, Claude Code, 2026-09-02.

    Lehre                  tab-foods  mahlzeiten  vorlieben  erfassen
    G-70   Seitensortier.     ja          -          -          -
    G-112  mehrere Tags       ja          -          -          -
    G-133  ohne               ja          -          -          -
    G-154  prefs              ja         ja         ja          -
    G-251  herkunft           ja          -          -          -
    G-266  Erstlauf           ja          -          -          -
    Abbruch                   ja          -         ja          -
    Entprellen                ja         ja         ja          -
    fehlen von 8:              0          6          5          8

`[read]` **Der Schaden sind nicht die doppelten Zeilen** — **es sind
sechs teuer gelernte Lehren, die in Kopien fehlen.**

`[cmd]` **`rezepte-echt.tsx` ist seit G-323 umgestellt** — **die
uebrigen vier nicht.**

## Was jetzt geht

`[cmd]` **G-72 hat zehn Bauteile aus `tab-foods.tsx` exportiert:**
`PILLEN`, `SEITE_GROESSE`, `FILTERGRUPPEN`, `UNVERTRAEGLICH_LABEL`,
`filterLabel`, `FilterChip`, `facettenZahl`, `SortKopf`, `zahl`,
`makro`.

`[cmd]` **Und `food-suche-hook.ts` traegt Entprellen, Abbruch,
Filterparameter** (G-320).

`[read]` **Die Voraussetzung steht** — **es ist Verdrahtung, kein
Neubau.**

## Auftrag

**Mitbeauftragt: G-305, G-314.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · Die vier Suchen

`[cmd]` **`mahlzeiten` fehlen sechs Lehren, `vorlieben` fuenf,
`erfassen` alle acht.**

`[cmd]` **`food-suche-hook.ts` traegt Entprellen, Abbruch,
Filterparameter.** `[cmd]` **Und zehn Bauteile aus `tab-foods.tsx`
sind seit G-72 exportiert.**

`[read]` **Miss je Suche, ob der Hook passt** — **`erfassen.tsx`
koennte einen anderen Zweck haben als eine Trefferliste.**

`[read]` **Und wo eine Suche das Modal aus G-320 rufen kann statt
einer eigenen Liste: melden.**

### 2 · G-305 — vier Sackgassen in Plaenen und Planner

`[read]` **Lies den Punkt und miss, was davon noch gilt** — **seit
G-311, G-315, G-319 und G-326 ist viel daran gebaut worden.**

### 3 · G-314 — die Vorschau fuer nicht-aktive Plaene

`[cmd]` **`SPEC_03` Flow 3 Schritt 3: *Tap auf Plan →
Plan-Vorschau*, danach *Plan aktivieren*.**

`[cmd]` **Seit G-311 gibt es `?plan=`** — der Planner oeffnet einen
beliebigen Plan. `[read]` **Die Vorschau braucht dasselbe, nur
lesend.**

`[cmd]` **Und seit G-327 gilt `?plan=` nur im Planner** — **die
Vorschau darf den Reiter nicht wieder umschalten.**

### Was nicht zu tun ist

**Keine fuenfte Suche.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Suche         welche Lehren jetzt gelten, gezaehlt
    erfassen.tsx     passt der Hook, oder anderer Zweck
    G-305            was gilt noch
    Vorschau         oeffnet nicht-aktive Plaene, Reiter bleibt
    Bildschirmfoto   vorher / nachher
