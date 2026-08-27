---
nr: E-17
getroffen: 2026-08-27
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-122]
modul: quer
---

# E-17 — eigene Uebungen und eigene Messwerte bekommen eigene Tabellen

## Frage

`[cmd]` **Zwei der fuenf Tabellen aus G-122 brauchten vor dem Bau eine
Entscheidung:**

**Eigene Uebung** — `training.exercises` fuehrt 1.416 geteilte
Uebungen. Liegt eine selbst angelegte in derselben Tabelle mit einer
Besitzerspalte, oder in einer eigenen?

**Eigener Messwert** — `medical.lab_result_values` traegt 280
Laborbefunde. Dieselbe Tabelle mit Herkunftsspalte, oder getrennt?

## Entscheidung

**Beide bekommen eine eigene Tabelle im Profil des Nutzers.**

Tom, 2026-08-27: *,,ein user hat weder die videos noch die
benoetigten texte, bei eignen uebungen geht es eigentlich nur um
persoenlich spezifische sachen zum anlegen. eigene tabelle in seinem
profil."*

## Warum sie traegt

`[cmd]` **Am Schema nachpruefbar:** `training.exercises` hat
`instructions`, `tips`, `media_paths`, `difficulty`, `equipment_id`,
`discipline_rule` — **und kein `user_id`.**

`[read]` **Ein Nutzer fuellt davon nichts.** Eine Besitzerspalte
haette 1.416 Zeilen mit `NULL` erzeugt und eine Tabelle, die zwei
verschiedene Dinge meint.

`[read]` **Beim Messwert dieselbe Logik:** ein Laborbefund traegt
Labor, Probenzeitpunkt und Referenzbereich. Ein selbst gemessener
Wert nichts davon — **andere Verlaesslichkeit, andere Einheiten,
moeglicherweise andere Warnschwellen.**

## Was daraus folgt

**Die drei uebrigen Tabellen aus G-122** — `recovery.checkins`,
`goals.body_measurements`, `recovery.modality_log` — **brauchen keine
Entscheidung.** Sie tragen bereits `user_id` und bekommen nur ihren
Schreibweg.

`[read]` **Die Regel-Engine muss wissen, woher ein Wert kommt.** Ein
selbst gemessener Blutdruck darf keine Regel ausloesen, die einen
Laborwert voraussetzt — **die Trennung in zwei Tabellen macht das
erzwingbar, statt es einer Spalte zu ueberlassen.**

## Nummernwechsel

`[read]` **Diese Entscheidung hiess zuerst E-02.** Sie wurde
umnummeriert, weil ich sie waehrend des laufenden Auftrags A-55
angelegt habe, in dem Codex ab E-02 nummerieren sollte — **eine
Kollision, die ich selbst verursacht habe.**
