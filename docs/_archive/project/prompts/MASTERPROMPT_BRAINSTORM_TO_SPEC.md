# Masterprompt: Brainstorm → Spec
# docs/project/prompts/MASTERPROMPT_BRAINSTORM_TO_SPEC.md

Kopiere diesen Prompt und fülle die Platzhalter aus. Gib ihn dann an Claude.

---

## Prompt (kopierbar)

```
Du bist Architektur-Partner für das LUMEOS-Projekt.

Ich habe ein Brainstorming zu folgendem Thema durchgeführt:

**Spec-Name:** [SPEC_NAME]

**Brainstorm-Notizen:**
[BRAINSTORM_NOTES]

**Bekannte betroffene Dateien oder Module:**
[KNOWN_FILES_OR_MODULES]

**Explizit nicht Teil davon:**
[OUT_OF_SCOPE]

---

Deine Aufgabe:

1. Lies die Brainstorm-Notizen sorgfältig.

2. Prüfe ob das Brainstorming ausreichend reif für eine Spec ist.
   Wenn wichtige Fragen offen sind, liste sie auf und frage nach — erzeuge noch keine Spec.

3. Wenn das Brainstorming reif ist, erzeuge eine strukturierte Spec im folgenden Format:

---
# SPEC — [SPEC_NAME]
**Stand:** [heutiges Datum] | **Status:** draft

## Ziel
(Was soll nach Umsetzung möglich sein? 1–3 Sätze)

## Hintergrund
(Warum bauen wir das? Welches Problem löst es?)

## Aktueller Stand
(Was existiert bereits? Was fehlt?)

## Gewünschtes Verhalten
(Konkrete Beschreibung der Funktionalität)

## Betroffene Module / Dateien
(Welche services/, apps/, packages/ sind betroffen?)

## Out of Scope
(Was ist ausdrücklich NICHT Teil dieser Spec?)

## Risk Category
Vorschlag: [standard / docs / i18n / test / db-migration / security / auth / rls / medical / payments / shared-core / architecture / release]
Begründung: ...

## Akzeptanzkriterien
- [ ] Kriterium 1 (messbar)
- [ ] Kriterium 2
...

## Negative Constraints
- NIEMALS ...
- NIEMALS ...
...

## Validierung
(Welche Commands nach Umsetzung? z.B. pnpm tsc --noEmit, pnpm test)

## Rollback / Recovery
(Wie lässt sich rückgängig machen?)

## Offene Fragen
- [ ] (unkritische Fragen die einen ersten Schritt nicht blockieren)

## Workorder-Splitting-Hinweise
(Wie lässt sich diese Spec in kleine WOs aufteilen? Empfohlene Reihenfolge?)
---

4. Erzeuge noch KEINE Workorders. Das passiert in einem separaten Schritt.

5. Gib am Ende eine Einschätzung: Ist die Spec workorder-ready?
   Falls nicht: was muss noch geklärt werden?

Antworte auf Deutsch.
```

---

## Platzhalter-Erklärung

| Platzhalter | Was einfügen |
|---|---|
| `[SPEC_NAME]` | Kurzer, eindeutiger Name, z.B. `Nutrition Diary Summary API` |
| `[BRAINSTORM_NOTES]` | Alle Notizen aus der Brainstorm-Session, unstrukturiert OK |
| `[KNOWN_FILES_OR_MODULES]` | Dateipfade oder Modul-Namen die du bereits kennst |
| `[OUT_OF_SCOPE]` | Was explizit NICHT gebaut werden soll |

---

## Wann nutzen?

Nutze diesen Prompt wenn:
- Eine Brainstorming-Session einen klaren Fokus hat
- Du mit Claude eine Entscheidung getroffen hast die umgesetzt werden soll
- Du aus einer Idee einen wiederverwendbaren Plan machen willst

Nutze ihn **nicht** wenn:
- Das Brainstorming noch sehr offen ist
- Grundlegende Architekturentscheidungen fehlen
- Du nur erkunden willst ohne Umsetzungsabsicht
