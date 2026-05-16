## 16. MealPlanLog — PATCH

Dieser Abschnitt ergänzt SPEC_02 Entity 16 (MealPlanLog) um die Architektur-Entscheidung
zur retroaktiven Bestätigung. Der vollständige Entity-Eintrag bleibt in SPEC_02_ENTITIES.md.

---

> ### ⚠️ ARCHITEKTUR-ENTSCHEIDUNG: Retroaktive Bestätigungen + Goals-Export
> **Entschieden:** April 2026 — **Kann später geändert werden, Änderungsanleitung unten**
>
> **Situation:**
> User bestätigt einen Ghost Entry nachträglich (z.B. Montags-Mittagessen wird erst am
> Mittwoch bestätigt). `execution_date = Montag`, `confirmed_at = Mittwoch`.
>
> **Gewählte Option B — Snapshot-Prinzip:**
>
> Retroaktive Bestätigungen ändern **nichts** am bereits an Goals exportierten
> Tages-Compliance-Wert. Was täglich an Goals exportiert wurde, bleibt unveränderlich.
>
> Die Bestätigung ist jedoch im `MealPlanLog` vollständig gespeichert und beeinflusst:
> - Die **Gesamt-Plan-Compliance** (Lifetime-Ansicht des Plans in der UI)
> - Die **Mahlzeiten-History** im Diary (vollständig korrekt sichtbar)
> - Den **Nutrition Score** für diesen Tag (wird on-demand neu berechnet wenn
>   User den Tag im Diary aufruft)
>
> **Was Goals NICHT bekommt:**
> Goals-Tagesexport für `Montag` bleibt bei dem Wert der am Montag gesendet wurde.
> Goals weiß nicht, dass nachträglich bestätigt wurde.
>
> **Warum nicht Option A (Live Recalculation zu Goals):**
> Goals müsste historische Compliance-Werte per `PATCH` überschreiben können.
> Das erhöht die Komplexität beider Module erheblich und schafft Inkonsistenzen
> in History-Charts. Der Nutzen (korrektere historische Goals-Compliance) ist
> gering — retroaktive Bestätigungen sind Ausnahme, nicht Regel.

---

### Falls wir das später ändern wollen (Checkliste):

```
□ 1. Goals-Modul: PATCH /api/goals/contributions/:date Endpoint implementieren
     → Überschreibt calorie_adherence_pct, protein_adherence_pct etc. für gegebenen Tag
     → Nur Nutrition darf diesen Endpoint aufrufen (Auth via Service-Token)

□ 2. Nutrition: Retroaktive Bestätigung triggert Event
     → Nach MealPlanLog UPDATE auf confirmed/deviated für vergangene Tage
     → Recalculate DailyNutritionSummary für execution_date
     → Recalculate NutritionScore für execution_date
     → POST zu Goals: PATCH /api/goals/contributions/:date

□ 3. Goals-Modul: History-Overwrites erlauben
     → Aktuell: contributions sind append-only
     → Neu: PATCH erlaubt Überschreiben mit audit_log Eintrag
     → goals.contribution_audit Tabelle: original_value, new_value, changed_by, changed_at

□ 4. Spec-Updates nötig:
     → SPEC_03 Flow 4: "Retroaktive Bestätigung" um Goals-Recalc ergänzen
     → SPEC_07 Nutrition API: neuer Event-Typ dokumentieren
     → Goals SPEC_07: PATCH /contributions/:date Endpoint hinzufügen
     → Goals SPEC_02: contribution_audit Entity hinzufügen

□ 5. Testen:
     → Was passiert mit Goals-History-Chart wenn sich Wert rückwirkend ändert?
     → Race Condition: Zwei retroaktive Bestätigungen gleichzeitig?
     → UI: Wie zeigen wir dem User, dass sein Montag-Score nachträglich korrigiert wurde?
```
