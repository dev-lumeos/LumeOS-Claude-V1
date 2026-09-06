---
nr: G-355
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: null
entscheidung: E-67
beruehrt:
  tabellen: [goals.user_goals]
zahlen:
  gemessen: 2026-09-07
  tabellen: 6
  spalten: 110
  zeilen: 450
  leser: 37
---

# G-355 — Goals und Body gegen alle Quellen pruefen

## Befund

Tom, 2026-09-07:

> ich denke goals & body solltest nochmal komplett gegen spec, old
> repo, new design mockup und sonstigen quellen pruefen, denn da
> wurde einiges schon angepasst dass nicht der sinn der sache ist
> denke ich. da fehlt mittlerweile sehr viel das ploetzlich
> verschwunden ist

## Was gemessen ist

`[cmd]` **Sechs Tabellen, 110 Spalten, 450 Zeilen:**

    user_goals            23 Sp,  11 Zeilen
    goal_milestones       20 Sp,  13 Zeilen
    body_circumferences   22 Sp,  54 Zeilen
    body_measurements     17 Sp, 362 Zeilen
    goal_phases           14 Sp,   5 Zeilen
    nutrition_targets     14 Sp,   5 Zeilen

`[cmd]` **Und 37 Dateien in `apps/web/src` lesen `goals.`**

`[read]` **Die Daten sind also da** — **Toms Beobachtung betrifft die
Oberflaeche, nicht das Schema.**

## Was der Verdacht heisst

`[read]` **Wenn 110 Spalten existieren und der Schirm wenig zeigt,
gibt es zwei Erklaerungen:**

`[read]` **Entweder wurde nie alles angeschlossen** — **dann ist es
eine Luecke, kein Verlust.**

`[read]` **Oder etwas wurde entfernt** — **dann steht es in der
Geschichte, und man kann sagen wann und warum.**

`[cmd]` **Der Unterschied ist messbar:** `git log` **je Datei.**

## Die vier Quellen

`[cmd]` **Spec:** `docs/specs/` — **welche Spec traegt Goals?**
`[cmd]` **Altrepo:** `referenz/lumeos-2026/`, 91.290 Dateien —
**Struktur ja, Code nie.**
`[cmd]` **Mockup:** `00-QUELLEN.md` sagt, welche es je Modul gibt.
`[cmd]` **Und die Entscheidungen:** E-54 (Zeitachse), E-46
(Erfahrungsgrade), E-67 (Onboarding gegen Goals).

## Was der Auftrag liefern soll

`[read]` **Eine Gegenueberstellung, nicht eine Meinung:**

    was die Spec verlangt
    was die Datenbank traegt
    was der Schirm zeigt
    was fehlt -- und ob es je da war
