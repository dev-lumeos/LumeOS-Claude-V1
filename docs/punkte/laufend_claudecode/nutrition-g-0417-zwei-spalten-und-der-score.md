---
nr: G-417
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-416
entscheidung: E-80
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-insights.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-417 — zwei Spalten und der Score

## Auftrag

Tom, 2026-09-08, nach dem Blick auf den neuen Stand.

**Beauftragt am 2026-09-08.**

---

## 1 · Der Nutrition score rechnet immer noch nicht

`[cmd]` **Selbst gemessen (`backup/score-jetzt.png`), ZWEI
Sperren:**

    Level multiplier   pro - offen (G-228)
    Ballaststoffe      kein Ziel im Schema

`[read]` **Sperre 2 ist VERALTET.**

`[cmd]` **C-464 ist live:** `goals.nutrition_targets.fiber_g`
**existiert, `dev` hat 30,0 g, `herkunft: formel`.**

`[cmd]` **Fuenf Nutzer haben den Wert.**

`[read]` **Die Kachel zeigt die alte Meldung** ? **sie liest die
neue Spalte nicht.**

`[read]` **Sperre 1 haelt zu Recht** ? **E-80 ist entschieden,
aber nicht gebaut.**

### E-80 bauen

`[cmd]` **`docs/entscheidungen/E-80-vier-erfahrungsstufen.md`:**

    beginner  0.75
    advanced  0.90
    pro       1.00
    elite     1.10

`[cmd]` **`public.profiles.experience_level` ist die Quelle**
(G-412), **CHECK: `beginner | advanced | pro | elite`.**

`[read]` **Vier Werte, vier Faktoren** ? **kein `intermediate`.**

`[cmd]` **Codex misst in C-464, WO die Faktoren hingehoeren** ?
`packages/scoring/` **oder eine Tabelle im Modul.**

`[read]` **Wenn sein Bericht das schon beantwortet: dorthin.**
`[read]` **Sonst: in das Modul, wo die Kachel heute rechnet.**

`[cmd]` **Und die Zeile *,,Source of level"* bleibt** ? **sie
sagt, woher der Wert kommt.**

### Danach

`[read]` **`dev` steht auf `pro` = 1.00, und Ballaststoffe haben
ein Ziel.**

`[read]` **Der Score muesste `0.85 von 1.00` -> `1.00 von 1.00`
zeigen, und eine ZAHL statt eines Grundes.**

---

## 2 · Die Kacheln richten sich immer noch aus

Tom: *,,insights hat er die kacheln immer noch ausgerichtet an dem
links ? das sind zwei unabhaengige spalten."*

`[cmd]` **Im Bild gemessen:** *Calorie balance* **und** *Macro
split* **enden auf derselben Hoehe.**

`[read]` **G-416 hat `align-items` gesetzt** ? **das reicht
nicht.**

`[read]` **Ein Raster mit zwei Spalten haelt Zeilen zusammen** ?
**auch mit `align-items: start` beginnt Zeile 2 erst, wenn beide
Kacheln aus Zeile 1 fertig sind.**

`[read]` **Was Tom will, sind ZWEI UNABHAENGIGE SPALTEN** ?
**jede fuellt sich fuer sich.**

`[cmd]` **Bauformen, die das koennen:**

    zwei <div> nebeneinander, je ein eigener Stapel
    oder CSS columns
    oder ein Masonry-Raster

`[read]` **Miss, welche zu `v2-` passt** ? **und ob es das schon
irgendwo gibt.**

`[cmd]` **`.v2-grid` NICHT anfassen** ? **217 Aufrufer** (G-416).

---

## 3 · Die neue Anordnung

Tom:

    links    Calorie balance
             Verlauf
             Makros im Detail

    rechts   Macro split
             Auffaellige Naehrstoffe
             Tagesdeckung

    darunter Micronutrient trend

`[read]` **Drei Kacheln je Spalte, eine ueber die volle
Breite.**

`[read]` **Die Ordnung folgt dem Inhalt:**

    links    Kalorien -- Bilanz, Verlauf, Aufschluesselung
    rechts   Verteilung -- Makros, Auffaelligkeiten, Deckung
    unten    der Naehrstoffverlauf ueber 30 Tage

`[cmd]` **`Micronutrient trend` hat in der Vorlage
`gridColumn: span 2`** (`module-nutrition.jsx:393`) ? **volle
Breite ist die Vorlage.**

---

## Abnahmebedingungen

    A1  der Score zeigt eine ZAHL, nicht zwei Gruende.
        Bildschirmfoto.
    A2  E-80 gebaut: vier Stufen, vier Faktoren. Wo?
        Begruendet.
    A3  die Ballaststoffzeile liest fiber_g. Gemessen:
        0.85 -> 1.00.
    A4  zwei unabhaengige Spalten. Gegenprobe: eine Kachel
        links hoeher machen -- rechts darf sich NICHTS
        verschieben. Zwei Fotos.
    A5  die Anordnung wie oben. Foto.
    A6  Micronutrient trend ueber die volle Breite.
    A7  .v2-grid unveraendert. Belegt.
    A8  apps/web 1559 oder mehr.

## Was nicht zu tun ist

**Die Mockup-Referenz BLEIBT** ? **Tom nimmt sie selbst ab.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-465.**
**`.v2-grid` nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 laeuft** (PID 1332072, `server.py start`).
`[cmd]` **3220 laeuft.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
