---
nr: C-524
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: [C-519, C-525]
kind_von: G-483
entscheidung: E-84
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen:
    - nutrition.meal_plan_entries
zahlen:
  gemessen: 2026-09-21
---

# C-524 — Planeinträge können Supplemente vorsehen

## Ergebnis

Der Datenbankvertrag ist gebaut, aber nicht live eingespielt. Ein
Planeintrag ist weiterhin nur eine Absicht: Er verweist über
`supplements.meal_plan_product_references` auf ein Produkt und erzeugt dabei
keinen `supplements.intake_logs`-Satz. Die Tabelle ist bewusst getrennt von
`supplements.recipe_product_references`, weil deren zwingender Fremdschlüssel
auf `nutrition.recipe_ingredients` zeigt und ein Planeintrag kein Rezept ist.

Die bestehende Ghost-Oberfläche verarbeitet weiterhin nur Foods. Sie würde an
den neuen Spalten nicht abstürzen, zeigt einen Supplement-Planeintrag heute
aber leer und bestätigt ihn mit der vorhandenen Meldung, dass keine
Lebensmittel hinterlegt seien. Daher wurden weder der Food-Ghost noch
`apps/` verändert. A3 und A4 benötigen die anschließende UI-Erweiterung:
Referenz lesen/anzeigen und nach dem Anlegen der realen Mahlzeit
`record_supplier_product_intake(..., meal_id)` aufrufen.

## Bauform und Beleg

| Bauform | Semantik | Entscheidung |
|---|---|---|
| `meal_items.supplement_intake_log_id` | bereits erfolgte Einnahme mit Snapshot | ungeeignet für einen Plan |
| `recipe_product_references` | Produktabsicht, aber zwingend an Rezeptzutat | Vorbild, technisch nicht wiederverwendbar |
| `meal_plan_product_references` | Produktabsicht zu genau einem Planeintrag | gebaut |

`nutrition.meal_plan_entries.entry_type` kennt zusätzlich `supplement`. Der
zugehörige Target-Check verbietet dafür Food-, Rezept- und Custom-Ziele; die
Produktabsicht liegt ausschließlich in der neuen Supplements-Tabelle.
`meal_plan_product_references` hat einen eindeutigen Verweis auf den
Planeintrag, Produkt, optionale Portionsgröße sowie positive Portionsanzahl.
Ein Trigger prüft Planbesitzer, `entry_type = 'supplement'` und die Formregel.

## Formregel: einmal in der Datenbank

Die Formregel gehört in die Datenbank, weil G-480 sie sonst zusätzlich in der
Oberfläche führen müsste. `supplements.product_form_placement_rules` ist für
`authenticated` lesbar; `supplier_product_meal_eligibility(product_id)` gibt
Rohform, Formcode, Platzierung, `allowed_in_meal` und einen Hinweis zurück.

| Formcode | Form | Platzierung |
|---|---|---|
| E0162 | Powder | meal |
| E0165 | Liquid | meal |
| E0164 | Bar | meal |
| E0176 | Gummy or Jelly | meal |
| E0159 | Capsule | stack |
| E0155 | Tablet or Pill | stack |
| E0161 | Softgel Capsule | stack |
| E0174 | Lozenge | stack |
| E0172 | Other (e.g. tea bag) | unsupported |
| E0177 | Unknown | unsupported |

Gemessen im Katalog: 36.485 Powder, 32.532 Liquid, 59 Bar, 4.677 Gummy,
79.822 Capsule, 33.717 Tablet/Pill, 19.924 Softgel und 994 Lozenge-Produkte.
Eine Capsule-Referenz wird durch den Datenbank-Trigger mit `check_violation`
abgewiesen; sie kann deshalb nicht stillschweigend im Plan landen.

## Ghost-Bestätigung und G-486-Gegenprobe

Der aktuelle Leser in `apps/web/src/lib/nutrition/plan-lesen.ts` liest
generische Planeintragsfelder und bricht an `entry_type = 'supplement'` nicht
ab. Er bildet jedoch nur Food- und Rezeptposten. Der aktuelle Schreiber in
`plan-log-write.ts` legt nur Food-Posten an und ruft keine Supplement-RPC auf.
Ein neuer Supplementeintrag wäre also leer und kontrolliert nicht
bestätigbar, nicht ein erneuter fehlender-Spalten-Absturz wie G-485.

Die uncommitteten G-486-Änderungen in `apps/web` ändern nur die Darstellung
erfüllter Ghostentries. C-524 hat keine dieser Dateien geändert. Der
notwendige UI-Vertrag lautet: Produktreferenz lesen, im Ghost als Supplement
anzeigen, reale Mahlzeit anlegen, anschließend
`supplements.record_supplier_product_intake` mit dieser `meal_id` aufrufen und
erst danach den Planlog schreiben.

## Prüfungen

Die Vertragsprobe lief gegen die frische Wegwerf-Datenbank
`lumeos_c524_vollkette` und rollt ihre Testdaten zurück:

| Kriterium | Ergebnis |
|---|---|
| A1 | eigene Absichts-Referenz gebaut und durch FK/Check belegt |
| A2 | Powder-Planeintrag mit Referenz angelegt; kein Intake vor Bestätigung |
| A3 | Backend-Vertrag vorhanden; Ghost-Anzeige noch UI-offen |
| A4 | vorhandene Intake-RPC mit `meal_id` erzeugt Intake; UI-Aufruf noch offen |
| A5 | BLS-Planeintrag bleibt unverändert lesbar und bestätigbar |
| A6 | Regel zentral in Datenbank; Capsule wird abgewiesen |
| RLS | `authenticated` liest Regeln und bearbeitet eigene Referenzen; `anon` nicht |

`nutrition-c524-meal-plan-supplements.test.ts`: 4/4 grün.
`quer-c525-allergy-search-terms.test.ts`: 2/2 grün.
`migration-kette-pruefen.mjs`: grün, 71 Dateien.
`migration-datenlogik-pruefen.mjs`: grün, exakt 44 historische
Datenoperationen.

Die gemeinsame Vollkette führte C-525 und C-524 einschließlich beider
Datenimporte aus. Ihre alleinige Abweichung ist der bekannte fremde
C-327-Grantbefund: `supplements.substance_group_memberships` hat für
`service_role` zu viele Rechte. C-524/C-525 selbst sind in der
Schema-Abschlussprüfung vollständig (35/35 RLS, 39/39 Grants, 64/64 FKs).

Sicherung vor den Arbeiten:
`backup/schema/20260921090000_c525_c524_vorher.sql`.

## Nächster Schritt

Die Datenbankmigration ist nicht live eingespielt. Vor einer Live-Einspielung
braucht die Oberfläche den beschriebenen Lese- und Bestätigungsweg; so bleibt
ein Planeintrag eine Absicht und ein Intake eine bestätigte Einnahme.
