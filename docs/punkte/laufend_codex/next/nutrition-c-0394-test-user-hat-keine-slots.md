---
nr: C-394
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: C-392
entscheidung: E-58
beruehrt:
  tabellen: [nutrition.meal_slots]
zahlen:
  gemessen: 2026-09-02
  dev: 5
  test_user: 0
---

# C-394 — `test-user` hat keine Slots

## Befund

Aus C-392, 2026-09-02.

`[cmd]` **Der Bericht sagt: *,,Beide Konten haben je fuenf gemessene
Slots."***

`[cmd]` **Nachgemessen: `dev@lumeos.app` fuenf, `test-user@lumeos.
local` null.**

    dev          Fruehstueck 07:30, Snack 10:14, Mittagessen 12:30,
                 Nachmittagssnack 16:00, Abendessen 19:30
    test-user    keine

## Zu klaeren

`[read]` **Warum bekam `test-user` keine?** `[cmd]` **Fehlt die
`food_preferences`-Zeile, oder gibt es keine Mahlzeiten, aus denen
sich Zeiten ableiten liessen?**

`[read]` **Und was zeigt G-332 einem Konto ohne Slots?** `[read]`
**Eine leere Liste waere richtig, wenn der Nutzer noch nichts
festgelegt hat** — **aber der Weg dorthin muss vorhanden sein.**

`[cmd]` **Nachweise werden auf `test-user` gefuehrt** — **ohne Slots
laesst sich G-332 dort nicht belegen.**

## Auftrag

**Mitbeauftragt: C-393, C-388, C-389.** Bericht in diese Datei.

`[read]` **Vorbereitet am 2026-09-02.**

### 1 · C-394 — warum `test-user` keine Slots hat

`[cmd]` **`dev` fuenf, `test-user` null.** `[read]` **Miss, woran es
liegt** — fehlende `food_preferences`-Zeile, keine Mahlzeiten, oder
etwas Drittes.

`[read]` **Nachweise werden auf `test-user` gefuehrt** — **ohne
Slots laesst sich G-332 dort nicht belegen.**

### 2 · C-393 — eine Pruefung erwartet eine Tabelle, die es nicht gibt

`[cmd]` **Die Schema-Vollstaendigkeit bleibt rot:**
`supplements.substance_group_memberships` **0 statt 8** — **und die
Tabelle existiert gar nicht.**

`[cmd]` **`supplements.supplement_groups` gibt es.**

`[read]` **Woher kommt die Sollzahl 8, und wer sollte die Zeilen
schreiben?** `[read]` **Solange die Pruefung rot bleibt, verdeckt sie
neue Fehler.**

### 3 · C-388 und C-389 — zwei Reste aus C-35

`[cmd]` **C-388: 504 mehrzeilige Familien ohne 100/000-Form, nur 101
mit eindeutigem hoechstem `sort_weight`, 403 gebunden.**

`[read]` **Der dritte Fall aus C-35 greift bei 101 von 504** —
**ein vierter fehlt, oder eine Kuration.**

`[cmd]` **C-389: Frucht, Saft und Nektar liegen alle in `obst`,
`processing_level` bei Saft ist `raw`.**

`[read]` **Ein Saft ist kein rohes Obst.** `[read]` **Und mit
`match_reason` aus C-391 laesst sich jetzt zeigen, warum ein Saft
oben steht.**

### Was nicht zu tun ist

`apps/` nicht anfassen. Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    test-user        warum keine Slots, mit Zahl
    C-393            woher die 8, wer sollte schreiben
    C-388            greift ein vierter Fall, oder Kuration
    C-389            processing_level bei Saft, mit match_reason
