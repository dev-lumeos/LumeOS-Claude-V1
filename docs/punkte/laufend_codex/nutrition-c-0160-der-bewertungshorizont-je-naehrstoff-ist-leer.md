---
nr: C-160
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: C-157
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-160 - Der Bewertungshorizont je Naehrstoff ist leer

## Befund

(neu
  2026-08-20). **Fuer den Rechercheweg.** Rest aus C-157.

  `[cmd]` **Die Felder stehen:** `assessment_horizon_days`, `_source`,
  `_notes` an `nutrient_defs`. **138 Zeilen, alle leer.**

  `[read]` **Was gebraucht wird, mit Quelle:**

  | | |
  |---|---|
  | Vitamin D, B12, Eisen, Folat | **Speicher — Wochen bis Monate** |
  | Vitamin C, B1, B2 | wasserloeslich — **Tage** |
  | Natrium, Kalium, Wasser | tagesaktuell |

  `[cmd]` **EFSA und DGE unterscheiden Tagesbedarf von Zufuhr ueber die
  Zeit** — das ist eine Recherche, keine Erfindung.

  `[read]` **Und die Wirkung ist konkret:** Die Anzeige zeigt dann von
  selbst das passende Fenster — **Vitamin D ueber 90 Tage, Natrium ueber
  einen.**

## Auftrag — drei Altlasten pruefen

**Mitbeauftragt: C-08, A-37.** Bericht in diese Datei.

**Beauftragt am 2026-08-30.**

`[read]` **Alle drei sind aelter als der Katalogneuaufbau.** **Die
Erwartung ist, dass mindestens einer sich als ueberholt erweist** —
**und das ist ein Ergebnis, kein halber Auftrag.** `[cmd]` **Am
30.08. waren es sechs von sechzehn.**

### 1 · C-160 — der Bewertungshorizont je Naehrstoff ist leer

`[cmd]` **Miss zuerst, ob es die Spalte ueberhaupt gibt** — sie war
in meiner Pruefung nicht auffindbar.

`[read]` **Wenn nicht: sag, was der Punkt gemeint hat, und schliess
ihn.** `[read]` **Wenn doch: was traegt sie heute, und was fehlt?**

### 2 · C-08 — `services/nutrition-api`

`[read]` **Der Punkt sagt, der ADR gelte.** `[cmd]` **Miss, ob der
Dienst existiert** — und ob irgendetwas ihn ruft.

`[read]` **A-59 gilt auch fuer Dienste:** was keinen Aufrufer hat,
wird beim naechsten Auftrag fuer gebaut gehalten.

### 3 · A-37 — zwoelf ADRs in `docs/specs/Nutrition/04_adrs/`

`[cmd]` **`docs/specs/` wird prueferisch gelesen, nicht als Archiv**
(CLAUDE.md).

`[read]` **Miss, welche der zwoelf noch gelten und welche durch
`docs/entscheidungen/E-xx` abgeloest sind.** `[cmd]` **Seit dem 29.08.
gibt es E-25 bis E-36** — **einige davon koennten dieselbe Frage
zweimal beantworten.**

`[read]` **Zwei ADRs, die sich widersprechen, sind schlimmer als
keiner.** **Melden, welche das sind — nicht selbst entscheiden.**

### Was nicht zu tun ist

**Keinen ADR aendern oder loeschen** — das ist Toms Bereich.
**Keine deutschen Namen setzen** — C-352 wartet auf eine
Entscheidung.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Punkt ein Urteil     erledigt / gebaut / offen / ueberholt
    Bewertungshorizont      Spalte da? was traegt sie?
    nutrition-api           existiert er, ruft ihn jemand?
    zwoelf ADRs             je gueltig / abgeloest / widerspruechlich
    Widersprueche           benannt, nicht aufgeloest

## Bericht

### 2026-08-30 - C-160, C-08 und A-37

#### C-160 - offen, nicht durch den Katalogneuaufbau ueberholt

Die laufende Datenbank hat an `nutrition.nutrient_defs` alle drei Spalten:
`assessment_horizon_days` (`integer`), `assessment_horizon_source` und
`assessment_horizon_notes` (je `text`, alle nullable). Die zugehoerigen
Kommentare nennen C-157 und verbieten geratenen Tages-/Wochenwerte. Von 138
Naehrstoffdefinitionen haben 0 einen Wert in einer der drei Spalten; 138 sind
vollstaendig leer.

Der Punkt meint also nicht eine beim Katalogneuaufbau verlorene Spalte, sondern
den bewusst vorbereiteten, quellenbasiert noch nicht gefuellten
Bewertungshorizont. C-160 bleibt offen; es wurden keine Horizonte gesetzt.

#### C-08 - gebaut, aber nicht aufgerufen

`services/nutrition-api` existiert mit sechs Dateien (Paket, `tsconfig` und
vier TypeScript-Dateien: Einstieg sowie Routen fuer Diary, Food und Meals).
Der Dienst ist ein Hono-Geruest auf Port 4200: alle Routen liefern
Platzhalterdaten und tragen die jeweiligen `TODO`-Kommentare. Sein eigener
Typecheck ist gruen.

Es gibt keinen produktiven Import, keinen HTTP-Aufruf auf Port 4200 und keinen
Listener auf Port 4200. Das Wurzel-`dev` startet mit `--filter=./apps/*` und
startet den Dienst folglich nicht. Er wird nur als Workspace-Paket in
`turbo run typecheck/test/build` mitgeprueft. C-08 ist damit nicht ueberholt:
der Dienst ist vorhanden, aber produktiv unverdrahtet; der ADR-0001-Befund gilt
weiter.

#### A-37 - 12 ADRs, davon sieben weiter tragfaehig, vier teilweise ueberholt

Die 12 Dateien sind vorhanden. Weder ihre Kopfzeilen noch die neueren
E-Entscheidungen tragen eine formale `loest_ab`-/`abgeloest_durch`-Verknuepfung;
die folgende Zuordnung ist deshalb eine inhaltliche Messung, keine nachtraeglich
gesetzte Ablosung.

| ADR | Urteil | spaetere Entscheidung / Grund |
|---|---|---|
| `ADR_BLS_ONLY` | gilt weiter | Keine E-Entscheidung aendert BLS als Masterquelle. |
| `ADR_CUSTOM_FOODS_V1` | gilt weiter | Keine spaetere E-Entscheidung aendert Privatheit oder Quellenmodell. |
| `ADR_GHOST_ENTRY_RECIPE` | gilt weiter, bedingt | Gilt laut eigenem Text erst mit Recipe-Logging; keine E-Ablosung. |
| `ADR_MEALCAM_V1` | gilt weiter | MealCam-V1/Barcode-Phase-2 wird durch E-20 nicht aufgehoben. |
| `ADR_RECIPE_SOURCE_BUDDY` | gilt weiter | Weiterhin nur vorbereiteter Schemawert, ohne Gegenentscheidung. |
| `ADR_RECIPES_SCHEMA_ONLY` | gilt weiter | Keine spaetere E-Entscheidung aendert den Scope-Beschluss. |
| `ADR_WATER_TOTAL_HYDRATION` | gilt weiter | Keine spaetere E-Entscheidung aendert die Summe aus Log und Nahrung. |
| `ADR_COACH_PERMISSIONS_V1` | teilweise abgeloest | E-11 legt Permissions je Modul und zweiwertig fest, nicht je Subfunktion; E-29 verlangt zudem eine Funktion fuer moduluebergreifende Coach-Zugriffe. Suggestions bleiben davon unentschieden. |
| `ADR_MEALCAM_CONSENT` | teilweise abgeloest | E-20 verlangt zwei getrennte Zwecke/Einwilligungen und einen Herkunftsfilter statt eines einzelnen `training_consent` mit Trainingspool. |
| `ADR_NUTRITION_PREFERENCES_V1` | teilweise abgeloest | E-16 und E-30 behandeln generelle Ausschluesse bei Suche als Rangfolge; Allergien bleiben hart. Das ersetzt keine Allergieregel. |
| `ADR_SUPPLEMENTS_API_BOUNDARY` | teilweise abgeloest | E-35 verlangt je Modul eine eigene Tagesbilanz und die Summe erst oberhalb der Module; die ADR fordert dagegen Nutrition-Konsolidierung ueber eine Supplements-API. |
| `ADR_IMPROVEMENTS_PACKAGE` | ueberholt / Archiv | Die Datei markiert sich selbst als `Archiviert (Pass-1-Inputs)`; ihr Barcode-Teil verweist bereits auf `ADR_MEALCAM_V1`. Sie ist keine aktuelle Entscheidungsquelle. |

Es gibt keinen unmittelbaren Widerspruch zwischen zwei ADR-Dateien. Es gibt aber
vier aktuelle ADR-gegen-E-Entscheidungskonflikte: Permission-Granularitaet
(`ADR_COACH_PERMISSIONS_V1` gegen E-11), Consent-Modell
(`ADR_MEALCAM_CONSENT` gegen E-20), Ausschlussverhalten
(`ADR_NUTRITION_PREFERENCES_V1` gegen E-16/E-30) und die
Modulbilanz-Grenze (`ADR_SUPPLEMENTS_API_BOUNDARY` gegen E-35). Diese sind
benannt, nicht aufgeloest. Kein ADR wurde geaendert oder geloescht.

## Abnahme

_(vom Orchestrator)_
