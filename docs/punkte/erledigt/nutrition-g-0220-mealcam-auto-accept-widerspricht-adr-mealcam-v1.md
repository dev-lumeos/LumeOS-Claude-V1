---
nr: G-220
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
erledigt: 2026-08-28
commit: 3c632b05
beruehrt:
  dateien: [docs/specs/Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md]
zahlen: null
---

# G-220 — MealCam Auto-Accept widerspricht ADR_MEALCAM_V1

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, CRIT-1.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`ADR_MEALCAM_V1.md` "V1 MealCam Flow":
> User bestätigt/korrigiert jedes Item einzeln
> Erst nach User-Bestätigung: Meal Item erstellen
> **MealCam darf NIE automatisch finale Meal Items schreiben.**

`NUTRITION_NEXT_SPEC_DECISIONS.md §18`:
> User muss jedes erkannte Item bestätigen
> niedrige Confidence blockiert automatisches Hinzufügen

`SPEC_03_USER_FLOWS.md §Flow 2 (MealCam ohne Plan)`:
> Confidence ≥ 0.85 (AUTO_ACCEPT):
> → Erkannte Foods direkt als Vorschlag
> → User kann Mengen anpassen
> → "Hinzufügen" → MealItems erstellt

`SPEC_04_FEATURES.md §Feature 9 (MealCam)`:
> | AUTO_ACCEPT | ≥ 0.85 | **Sofort übernehmen** |

SPEC_03 ist mehrdeutig ("als Vorschlag" + "Hinzufügen" erfordert Klick), aber SPEC_04 sagt explizit "Sofort übernehmen". Das widerspricht dem ADR.

`SPEC_10_PASS2_PATCH.md` (korrigiert):
> | ≥ 0.75 | 🟢 Grün | Item direkt in Confirmation |
> "Alles hinzufügen" ist ein bewusster User-Klick.

SPEC_10_PASS2 ist mit dem ADR konsistent. SPEC_03 und SPEC_04 sind es nicht.

**Konsequenz:** Workorder-Generator könnte einen Auto-Accept-Pfad implementieren, der die ADR-Regel verletzt. Datenintegrität (Diary nur mit User-Bestätigung) wäre kompromittiert.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

**Verwandter Punkt:** E-19 / E-20 (Cam-Entscheidungen vom 27.08.). `[read]` **Nicht zusammengelegt** — ob es
derselbe Befund ist, gehoert geprueft, nicht angenommen.

## Abnahme

**2026-08-28, Orchestrator. Selbst gemessen und berichtigt.**

`[cmd]` **Die Review ist zur Haelfte ueberholt.** `SPEC_04` Feature 9
sagt heute: *,,AUTO_ACCEPT existiert nicht in V1. Auch bei HIGH
Confidence wird ..."* — **es wurde seit der Review korrigiert.**
`SPEC_10_PASS2` war ohnehin konsistent.

`[cmd]` **Nur `SPEC_03` Flow 2 stand noch**, Zeile 99:
*,,Confidence >= 0.85 (AUTO_ACCEPT)"*.

`[read]` **Und der Ablauf darunter war bereits richtig** —
*,,Hinzufuegen"* ist ein Klick. **Falsch war nur der Name der Stufe.**

### Berichtigt

    vorher   Confidence >= 0.85 (AUTO_ACCEPT)
    nachher  Confidence >= 0.85 (HIGH)
             ... vorausgewaehlt
             KEIN Auto-Accept: der Klick ist Pflicht

**Mit Vermerk im Dokument**, der `ADR_MEALCAM_V1` als Grundlage nennt.

`[read]` **Gedeckt durch Toms Regel vom 28.08.:** *,,ja wenn es aus
einem brainstorm mit mir abgeleitet wird und ein adr fuer die
entscheidung hat. es ist nicht alles gold oder endzustand in den
specs."* **Der ADR ist eindeutig, die Spec-Stelle widersprach ihm.**

**Abgenommen.**
