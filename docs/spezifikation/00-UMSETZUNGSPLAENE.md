# Umsetzungspläne — wie ein Modul angepackt wird

`[read]` Festgelegt von Tom, 2026-08-15: *„Jedes Modul, wo wir neu
anpacken, MUSS einen Umsetzungsplan kriegen, der mit der TODO.md
verlinkt ist. Ansonsten bauen wir, und die Hälfte geht vergessen."*

---

## Warum

Zweimal hat das Fehlen einer solchen Datei Tage gekostet:

`[cmd]` **`SPEC_05_FOOD_TAXONOMY.md`** enthielt Namensstrategie,
Scoring-Formel und Prioritätenliste — gelesen wurde sie am vierten Tag
der Arbeit an genau diesen Fragen, nach zwei gemessenen und gefallenen
Modellen (C-28: 39 von 100, C-33: 47 von 100).

`[read]` **`docs/specs/Goals/CONSOLIDATED_KNOWLEDGE.md`** trägt im Kopf
*„Status: Vollständig implementiert (2026-04-14)"* — mit 30+
Komponenten, 18 Hooks, 14 API-Routen. `[cmd]` In diesem Repo existiert
kein `goals`-Schema. Der Vermerk beschreibt das Vorgängerrepo.

**Beide Male war die Information da. Beide Male hat niemand sie gelesen,
weil kein Ort dafür bestand.**

---

## Die Regel

**Eine Datei je Modul**, bevor gebaut wird:

```
docs/spezifikation/<bereich>/00-umsetzungsplan.md
```

Sie wird **im Kopf von `docs/todo/TODO.md`** in der Plantabelle
verlinkt. Ohne diesen Eintrag existiert der Plan praktisch nicht — das
ist die Lehre aus zwei verlorenen Dokumenten.

**Was nicht dazugehört:** keine Vorlagendatei, kein Statusübergang, keine
Zuständigkeitsmatrix, keine Genehmigung. `[read]` Die Projektregel sagt
*keine Governance-Pipeline*; der frühere Cluster umfasste 476 Dateien und
hat nichts gebaut. **Sobald der Plan Pflege kostet, ist er falsch
gebaut.**

---

## Was drinstehen muss

Fünf Abschnitte. Mehr nicht, weniger auch nicht.

### 1. Quellen, mit Stand je Datei

Alle Spec- und Brainstorm-Dateien des Moduls, je Zeile ein Stand:
`offen` · `gelesen` · `aufgeloest` · `verworfen`.

`[read]` Muster: `docs/spezifikation/00-KONSOLIDIERUNG.md`.

**`aufgeloest` setzt voraus, dass Tom die Entscheidung bestätigt hat.**
Was ein Agent gelesen hat, ist `gelesen`.

### 1b. Im Vorgängerrepo nachsehen — vor allem anderen

`[cmd]` `referenz/lumeos-2026/` enthält das lauffähige Vorgängerprodukt.
**Bevor etwas als „fehlt" eingestuft wird, wird dort gesucht.**

**Ein Wegweiser liegt vor:** `docs/ssot/80-vorgaengerrepo-fundus.md`
— 75 Migrationen, `packages/scoring`, `rules-engine`, und die
Fundstellen zu TDEE, Makros, Portionen, 1RM, Körperfett, HRV,
Halbwertszeiten und Biomarker-Synonymen. **Dort zuerst nachsehen,
dann suchen.**

Zweimal an einem Tag hat sich das gerächt:

| | |
|---|---|
| **TDEE-Formeln** | als „muss recherchiert werden" eingestuft — `[cmd]` `src/modules/onboarding/utils/calculateTDEE.ts` rechnet sie vollständig, inklusive der beiden Regeln, die in keiner Spec stehen |
| **Portionsgrössen** | als Kuration von 7.140 Einträgen beschrieben — `[cmd]` `scripts/seed-portions.py` löst es mit rund hundert kategoriebasierten Definitionen |

`[read]` Tom, 2026-08-15: *„Ich denke, die Formeln dazu gibt es schon,
denn alles hat schonmal funktioniert."* Und: *„Hatten wir auch schon
komplett gelöst, suche."*

**`referenz/` ist gesperrt fürs Schreiben, nicht fürs Lesen.** 22
Stashes, 19 ungepushte Commits — es wird dort nichts verändert, aber es
ist die belegte Quelle für alles, was schon einmal lief.

**Was übernommen wird, wird gemessen.** `[read]` *Aus der Existenz einer
Sache folgt nicht ihre Funktion.* Der Code ist gegen ein anderes Schema
gelaufen (`public.foods` statt `nutrition.foods`, UUID statt
`bls_code`) — er ist ein belegter Ausgangspunkt, keine fertige Lösung.

### 2. Ist-Zustand, gemessen

Was existiert heute — mit `[cmd]`, nicht aus der Spec abgeschrieben.
Tabellen, Zeilenzahlen, Kettenschritte, Oberfläche.

`[read]` *Aus der Existenz einer Sache folgt nicht ihre Funktion.* Eine
Spec, die „implementiert" sagt, ist keine Messung.

### 3. Widersprüche

Spec gegen Ist, und Spec gegen Spec. **Notieren, nicht auflösen** — das
entscheidet Tom.

`[cmd]` Beispiel aus Nutrition: `ADR_CUSTOM_FOODS_V1` schliesst
`mealcam` als `source`-Wert aus, die Patch-Datei führt ihn. Zwei
Spec-Dateien, zwei Aussagen.

### 4. Die Schritte, mit TODO-Kennungen

Je Schritt eine Kennung, die **in `TODO.md` als eigener Punkt steht**.
Der Plan trägt die Begründung und die Reihenfolge, die TODO den Stand.

**Nicht doppelt pflegen:** Der Plan sagt *warum* und *in welcher
Reihenfolge*, die TODO sagt *wie weit*. Wer beides an beiden Orten
führt, hält keines aktuell.

### 5. Was nicht gebaut wird

Der wichtigste Abschnitt. `[read]` Bei Goals umfasst die Spec neun
Tabellen, eine TDEE-Engine, Cross-Module-Aggregation, 13 Umfangmessungen
und Fotosessions mit Bildanalyse — für gefüllte Ringe in Nutrition
braucht es **vier Zahlen**.

Ohne diesen Abschnitt wird aus jedem Modul das ganze Modul.

---

## Bestehende Pläne

| | |
|---|---|
| **Theme V1** (Sektion G) | `10-plattform/design-system/theme-v1-umsetzung.md` |
| **Nutrition-Altbestand** (A-11) | `00-KONSOLIDIERUNG.md` — Register über 84 Dateien |

`[cmd]` Beide sind vor dieser Regel entstanden und erfüllen sie
teilweise. Sie werden nicht nachträglich umgeschrieben — sie werden
ergänzt, wenn ohnehin daran gearbeitet wird.
