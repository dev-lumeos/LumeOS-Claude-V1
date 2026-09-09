---
nr: C-426
typ: befund
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-361
entscheidung: null
beruehrt:
  tabellen: [coach.client_autonomy]
zahlen:
  gemessen: 2026-09-08
  achsen: 8
  stufen: 5
---

# C-426 — acht Autonomieachsen, eine Erlaubnisliste

## Befund

**Gemessen 2026-09-08, vor der Auftragsvergabe zu G-361.**

`[cmd]` **`referenz/lumeos-2026/AUTONOMY_ARCHITECTURE.md`, 444
Zeilen** — **eine Datei, die `00-QUELLEN.md` am 30.08. nachgetragen
hat.**

**Dort: fuenf Stufen, EINE Achse.**

    1 Supervised      alles gesperrt, alles braucht Freigabe
    2 Guided          Wasser, Schlaf, Hydration, Ruhe
                      alles andere gesperrt
    3 Collaborative   Vorgabe
    4 Adaptive
    5 Autonomous

`[cmd]` **`coach.client_autonomy` traegt ACHT Achsen:**

    nutrition_level    training_level    recovery_level
    goals_level        supplements_level medical_level
    buddy_level        safety_level

`[read]` **Das ist kein Fehler, sondern eine Weiterentwicklung:**
**wer beim Training frei sein will, muss es beim Medizinischen nicht
sein.**

## Was fehlt

`[read]` **Die Erlaubnisliste je Stufe gibt es nur fuer die eine
Achse des Altrepos.**

`[read]` **Fuer acht Achsen ist nicht entschieden, was Stufe 2 in
`medical_level` erlaubt.**

**Berichtigung 2026-09-08:** `[cmd]` **Die Annahme *achtmal fuenf*
war falsch.** `[cmd]` **Gemessen: `safety_level` geht 1 bis 3, die
uebrigen sieben 1 bis 5** (`client_autonomy_levels_ck`).

`[cmd]` **`ADR_COACH_PERMISSIONS_V1.md` liegt in
`docs/specs/Nutrition/04_adrs/`** — **zu pruefen, ob er die acht
Achsen kennt.**

## Warum es vor G-361 kommt

`[read]` **Die Oberflaeche zeigt Autonomiestufen** —
`module-coach.jsx` **und `module-coach-athlete.jsx`.**

`[read]` **Ein Schieberegler ohne Erlaubnisliste ist ein Regler
ohne Wirkung.**

`[cmd]` **Und `client_autonomy` traegt vier Zeilen auf `dev`** —
**es wird bereits geschrieben.**

## Zu messen

`[read]` **Was sagt `SPEC_04_FEATURES.md` und
`SPEC_05_COACH_WORKFLOWS.md` zu den Stufen?**

`[read]` **Und deckt sich die Fuenferskala mit der des Altrepos?**

`[cmd]` **Erst danach ist ein UI-Auftrag zu G-361 sinnvoll.**

## Auftrag

**Mitbeauftragt mit G-241 am 2026-09-08.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-08: die Erlaubnisliste fehlt, und meine Annahme war falsch.

`[cmd]` **Nicht *achtmal fuenf*:** **`safety_level` geht 1 bis 3,
die anderen sieben 1 bis 5.**

`[cmd]` **`SPEC_04:158` rechnet eine einzelne Empfehlung,
`SPEC_05:18` nennt nur Startwert Stufe 2.**

`[cmd]` **Genau ein fachlicher Leser im Bestand:**
`nutrition_level >= 5` **erlaubt direkte Planbearbeitung.**

`[read]` **Sieben Achsen ohne Matrix** — **als Entscheidung an
Tom.**

## Auftrag

**Mitbeauftragt mit C-425 am 2026-09-08.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-08 — die Erlaubnisliste des Altrepos

`[cmd]` **`referenz/lumeos-2026/AUTONOMY_ARCHITECTURE.md:172`:**

    L1 Supervised    alles gesperrt, Coach-Freigabe noetig
    L2 Guided        Wasser- und Schlaferinnerungen,
                     Hydration, Ruhehinweise
    L3 Collaborative + Ernaehrung, Mahlzeiten, Supplement-Timing,
                     Makroanpassungen unter 5 %, Recovery
    L4 Adaptive      + Deload, Volumen, Trainingslast, Uebungen,
                     Ruhetage -- kein Programmumbau
    L5 Autonomous    + Programm, Ziele, grosse Makros,
                     Trainingsphasen, Stacks

### Codex' Vorschlag: nicht kopieren

> *,,Nicht kopieren, sondern in acht fachliche Matrizen ueberfuehren:
> `axis x capability -> Mindeststufe x Modus` (lesen, vorschlagen,
> direkt)."*

`[cmd]` **Mindestens 38 Stufenbeschreibungen** — **7x5 plus
Safety 3** — **acht Faehigkeitslisten und ein gemeinsamer
Datenbank-Waechter.**

`[read]` **Und der Satz, der die Achse rettet:** *,,`safety_level`
bleibt ein dreistufiges Schutz-Gate, keine fuenfte
Freiheitsachse."*

`[read]` **Ein Schutz, der wie eine Freiheit aussieht, wird
irgendwann hochgestellt.**

`[cmd]` **Heute genau ein Leser:
`coach.darf_nutrition_plan_aendern`** — **die einzige
`darf_`-Funktion im Bestand.**

`[read]` **Das ist Arbeit fuer einen eigenen Tag** — **und eine
Entscheidung fuer Tom, ob acht Achsen bleiben.**

## Aus dem Altrepo gelesen, 2026-09-08

Tom: *,,wir haben schon 90% von lumeos gebaut vorher, und das ist
eine quelle die fast alle fragen beantwortet."*

`[cmd]` **`referenz/lumeos-2026/AUTONOMY_ARCHITECTURE.md`, Zeile
165-220: die Erlaubnismatrix, vollstaendig.**

    Level 1  Supervised     ALLES gesperrt, Coach-Freigabe noetig
    Level 2  Guided         Wasser, Schlaf, Hydration, Ruhe
                            alles andere gesperrt
    Level 3  Collaborative  + Ernaehrung, Supplement-Timing,
       DEFAULT              Mahlzeiten, Makros unter 5 %,
                            Recovery
                            Trainingsaenderungen gesperrt
    Level 4  Adaptive       + Deload, Volumen, Trainingslast,
                            Uebungstausch, Ruhetage
                            Programmumbau gesperrt
    Level 5  Autonomous     ALLES erlaubt: Programm, Ziele,
                            grosse Makros, Trainingsphasen,
                            Supplement-Stapel

`[read]` **Und jede Stufe nennt ausdruecklich, was gesperrt
BLEIBT** ? **nicht nur, was dazukommt.**

### Der Empfehlungsalgorithmus, Zeile 224-262

`[cmd]` **Vier Faktoren, je +1, 0 oder -1:**

    Erfahrung       Anfaenger -1, Mittel 0, Fortgeschritten 0,
                    Elite +1
    Beziehungsdauer unter 7 Tage -1, 7-90 Tage 0, ueber 90 +1
    Einhaltung      unter 70 % -1, 70-90 % 0, ueber 90 % +1
    Komplexitaet    mit Merkern -1, ohne 0

`[cmd]` **Rechnung: Start bei Stufe 3, Faktoren addieren, auf 1-5
begrenzen, Empfehlung MIT Begruendung zurueckgeben.**

`[read]` **Eine Empfehlung ohne Begruendung waere eine
Anweisung** ? **dieselbe Regel wie bei `suggestSite`.**

### Was das Altrepo an Datenbank hatte

`[cmd]` **Zeile 71-88:**

    coach_clients               coach_client_autonomy_log
      coach_id                    id, coach_id, client_id
      client_id                   old_level, new_level
      autonomy_level (3)          changed_by, reason
      created_at, updated_at      created_at

`[read]` **EINE Stufe je Beziehung, mit Protokoll und Grund.**

`[cmd]` **LumeOS hat ACHT Achsen** ? `nutrition_level`,
`training_level`, `recovery_level`, `goals_level`,
`supplements_level`, `medical_level`, `buddy_level`,
`safety_level`.

`[cmd]` **Und `coach.autonomy_change_log` gibt es** ? **das
Protokoll ist uebernommen, die Matrix nicht.**

### Die API des Altrepos, Zeile 58-65

    GET  /clients/:id/autonomy
    PUT  /clients/:id/autonomy
    GET  /clients/:id/autonomy/recommendation
    GET  /clients/:id/autonomy/history
    GET  /autonomy/levels

`[cmd]` **`src/api/human-coach/routes/autonomy.ts`, 404 Zeilen.**

## Die Entscheidung, die bleibt

`[read]` **Die Matrix liegt vor ? fuer EINE Achse.**

`[read]` **Codex' Vorschlag aus C-425: acht fachliche Matrizen,
`axis x capability -> Mindeststufe x Modus`, mindestens 38
Stufenbeschreibungen.**

`[read]` **Die Altrepo-Matrix ist die Vorlage fuer je eine Spalte**
? **was in Level 3 unter *Ernaehrung* steht, gehoert in
`nutrition_level` 3.**

`[cmd]` **`safety_level` hat nur drei Stufen** ? **es ist ein
Schutz-Gate, keine Freiheitsachse** (C-435).

`[read]` **Damit ist die Arbeit klar umrissen:** **die
Fuenferliste aufteilen, nicht neu erfinden.**
