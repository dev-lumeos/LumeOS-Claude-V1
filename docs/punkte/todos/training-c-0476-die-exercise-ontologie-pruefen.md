---
nr: C-476
typ: befund
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  tabellen: [training.exercises]
zahlen:
  gemessen: 2026-09-08
  uebungen: 1416
---

# C-476 — hat LumeOS dieselben Katalogfehler?

## Woher

`[cmd]` **Due Diligence openGym, Abschnitt 06.**

`[read]` **Das Fremdprojekt fuehrt 1.324 Uebungen und bekommt
4/10 fuer den Katalog** ? **LumeOS fuehrt 1.416.**

`[read]` **Die Frage ist nicht, ob wir mehr haben, sondern ob wir
dieselben Fehler haben.**

## Die gemeldeten Maengel

    Body Parts    nur 10 grobe Buckets
                  upper arms 292, upper legs 227,
                  back 203, waist 169

    Equipment     inkonsistent
                  "band" vs "resistance band"
                  "barbell" vs "olympic barbell"
                  "weighted"

    Namen         43 normalisierte Duplikatgruppen
                  Mischung aus Varianten und echten Dubletten

    Semantik      "wind sprints" als waist/abs
                  "assisted prone rectus femoris stretch"
                  als waist/abs statt Quadrizeps

    Text          "sitted", "rollerout", "rollerer",
                  "squad stretch"

    Gewichtung    Primaermuskel pauschal 1,0
                  Sekundaermuskel pauschal 0,4

## Was LumeOS hat

`[cmd]` **`training.exercises` 1.416, `exercise_muscles` 6.588,
`equipment` 58, `muscle_groups` 95 mit `parent_id`.**

`[cmd]` **Und seit C-468: `public.koerperflaechen`, 59 Zeilen,
drei Ebenen.**

`[read]` **Die Muskelzuordnung ist reicher als beim
Fremdprojekt** ? **6.588 Zuordnungen gegen 19 Zielkategorien.**

`[read]` **Aber: woher kommen die 1.416?**

## Was zu messen ist

**1** ? **Die Herkunft.**

`[cmd]` **Ist es derselbe Upstream (`hasaneyldrm/exercises-dataset`),
oder eine andere Quelle?**

`[read]` **Wenn derselbe: dieselben Fehler, mit hoher
Wahrscheinlichkeit.**

**2** ? **Je Mangel eine Messung:**

    Equipment       58 Werte -- wie viele meinen dasselbe?
    Namen           Duplikatgruppen nach Normalisierung
    Semantik        Stichprobe: 20 Uebungen gegen
                    ihre Muskelzuordnung
    Text            "sitted", "rollerout" und Verwandte
    Gewichtung      exercise_muscles.role -- pauschal
                    oder differenziert?

**3** ? **Und die Sprache.**

`[cmd]` **LumeOS ist dreisprachig** ? **miss, ob die 1.416
uebersetzt sind oder englisch bleiben.**

## Die Konsequenz aus dem Bericht

> *,,Ein grosser Katalog ist nicht automatisch eine gute
> Ontologie. Fuer Coach, Suche und Safety ist ein kleinerer,
> kuratierter Kern oft wertvoller als 1.324 inkonsistente
> Eintraege."*

`[read]` **Dieselbe Entscheidung wie bei den Supplementen** ?
**596 Substanzen, davon 17 mit Naehrstoffzuordnung.**

`[read]` **Dort ist die Luecke sichtbar (C-466:
`unmapped_taken_log_count`).** `[read]` **Hier vermutlich
nicht.**
