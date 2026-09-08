---
nr: C-429
typ: befund
modul: medical
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-241
entscheidung: E-26
beruehrt:
  tabellen: [medical.lab_reports]
zahlen:
  gemessen: 2026-09-08
  reiter: 5
---

# C-429 — die zentrale Zeitachse fehlt

## Befund

Aus G-241, Codex, 2026-09-08.

`[cmd]` **E-26 vermutete: *,,`History` ist vermutlich in `tracking`
aufgegangen. Das gehoert gemessen."***

`[cmd]` **Gemessen: `tracking` enthaelt nur Symptome und
Medikamente.**

    Biomarker-Verlauf     -> Biomarkers
    Import-Historie       -> Import
    Symptome, Medikamente -> Tracking
    Diagnose, Behandlung,
    Bildgebung, Operation -> NIRGENDS

`[read]` **Die alte zentrale Zeitachse hat weder Reiter noch
Tabelle.**

## Was das heisst

`[read]` **Vier Ereignisarten haben keinen Ort:** **Diagnose,
Behandlung, Bildgebung, Operation.**

`[read]` **Das sind genau die, die ein Arzt sehen will** — **und
die ein Nutzer ueber Jahre sammelt.**

## Zusammenhang

`[cmd]` **`public.activity_stream` vereint sechs Module** (C-414) —
**`medical` traegt dort 10 Zeilen, aus Laborberichten.**

`[read]` **Zu klaeren, ob die Zeitachse eine eigene Tabelle
braucht** — **oder ob sie aus den bestehenden entsteht, sobald
Diagnosen und Behandlungen einen Ort haben.**

`[cmd]` **`docs/specs/Medical/SPEC_02_ENTITIES.md` und
`SPEC_06_DATABASE_SCHEMA.md` sind zu lesen.**

## Berichtigung 2026-09-08 — die Spec verbietet es

**Gemessen vor der Auftragsvergabe.**

`[cmd]` **`SPEC_01_MODULE_CONTRACT.md:10`:**
**,,KEIN Arzt. KEINE Diagnose. KEIN Therapieplan."**

`[cmd]` **`INDEX.md:27`: ,,Keine Diagnose."**

`[cmd]` **`SPEC_02_ENTITIES.md:245`: AI-Erkenntnisse sind
,,nicht-diagnostisch, keine Therapieempfehlung."**

`[cmd]` **Und: `treatment`, `imaging`, `surgery`, `timeline` kommen
in der gesamten Medical-Spec NICHT vor.** `[cmd]` **Im Altrepo null
Treffer.**

`[cmd]` **`history` heisst in der Spec ausschliesslich
Biomarker-Verlauf** — `biomarkerHistory: LabValue[]`
(SPEC_04:188).

## Was daraus folgt

`[read]` **Die vier Ereignisarten stammen aus dem Mockup, nicht aus
der Spec** — **und drei davon sind Bereiche, die das Modul bewusst
nicht betritt.**

`[read]` **Eine Diagnose einzutragen waere kein fehlendes Feature,
sondern ein Bruch des Modulvertrags.**

## Was bleibt

`[read]` **Zu klaeren ist nicht *,,wo ist die Zeitachse"*, sondern:**

**1 · Darf ein Nutzer eine Diagnose erfassen, die ein Arzt gestellt
hat?**

`[read]` **Das ist keine Diagnose durch LumeOS** — **es ist eine
Notiz ueber eine fremde.** `[cmd]` **`conditions` traegt schon
etwas Aehnliches** — zu messen.

**2 · Und wenn ja: gehoert sie ins Modul oder in Documents?**

`[cmd]` **G-241 hat Documents beauftragt** — **ein Arztbericht ist
ein Dokument, keine Datenstruktur.**

`[read]` **Der einfachere Weg waere: das Original ablegen, nicht
die Diagnose modellieren.**

## Der Mockup-Reiter bleibt

`[cmd]` **E-70: das Mockup ist Referenzobjekt.** `[read]` **Der
History-Reiter bleibt als Attrappe sichtbar, mit dem Grund
*,,widerspricht dem Modulvertrag"*** — **verworfen, nicht
vergessen.**
