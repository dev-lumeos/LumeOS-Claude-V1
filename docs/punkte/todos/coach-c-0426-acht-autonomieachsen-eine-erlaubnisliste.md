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
`medical_level` erlaubt** — **und ob `safety_level` ueberhaupt
dieselben fuenf Stufen kennt.**

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
