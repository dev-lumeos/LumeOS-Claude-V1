---
nr: C-120
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-120 - Drei Sperren in `food_search`

## Befund

(neu 2026-08-19). Befund
  aus G-73.

  `[cmd]` **Alle drei in der Suchfunktion, die C-94 gesperrt hat:**

  | | |
  |---|---|
  | **`p_tag_code` ist Singular** | kein ODER/UND, nur Einfachauswahl |
  | **kein Ausschluss-Parameter** | die Allergen-Schalter wirken **nur auf der angezeigten Seite** — und sagen das an |
  | **kein `processing_level`** | die acht Stufen aus C-100 sind **nicht filterbar** |

  `[read]` **Der G-73-Agent hat sie gemeldet statt umgangen** — richtig,
  denn ein zweiter Suchweg neben `food_search` waere die schlechtere
  Loesung.

  `[cmd]` **Und ein Befund, der die Bauform bestimmt hat:** *„jeder
  vegane Eintrag traegt auch `vegetarian` (Schnittmenge 0) — „vegan ODER
  vegetarisch" waere also eine Scheinwahl."*

## Auftrag — die Suche messbar machen

**Mitbeauftragt: C-191, C-27, C-177.** Bericht in diese Datei.

### Das Ergebnis

`[read]` **Nach diesem Auftrag ist belegt, was die Suche kostet und
was sie nicht findet** — **und beides steht als Zahl, nicht als
Vermutung.**

### 1 · C-120 — die drei Sperren

`[read]` **Miss zuerst, ob sie noch da sind.** `[cmd]` **Der Punkt ist
aelter als C-347**, wo du die generellen Ausschluesse auf die
Rangfolge umgestellt hast — **eine der drei koennte dabei gefallen
sein.**

### 2 · C-191 — `p_user_id` kostet das Dreifache

`[cmd]` **Du hast in C-20 gemessen: die neuen Sortierungen liegen bei
115,4 bis 116,9 ms Median.** `[read]` **Miss den Aufschlag durch
`p_user_id` gegen denselben Aufruf ohne.**

`[read]` **Und wenn er noch besteht: sag, woher er kommt.** `[cmd]`
**Die Vorlieben werden je Treffer ausgewertet** — **das ist der
naheliegende Ort, aber naheliegend ist nicht gemessen.**

### 3 · C-27 — Alltagswoerter ohne Treffer

`[read]` **Der Punkt nennt zwei.** `[cmd]` **Er ist aelter als der
Dekompositor und die Synonymerweiterung** — **miss nach, welche heute
noch leer ausgehen.**

`[read]` **Und wenn beide gehen: schliess ihn.** **Ein Punkt, der
sich selbst erledigt hat, gehoert nicht in die Liste.**

### 4 · C-177 — Thai-Aliase

`[read]` **Der Punkt sagt *bewusst*.** `[cmd]` **E-16 hat Thai in der
Oberflaeche abgeschaltet.** `[read]` **Pruef, ob der Punkt damit
gegenstandslos ist** — dann schliess ihn.

### Was nicht zu tun ist

**Keine Rangregel setzen** — C-102/C-117 sind ueberholt, und eine
neue Rangfrage waere eine Entscheidung fuer Tom.
**Keine Tags anlegen.**
`apps/` nicht anfassen — Claude Code arbeitet an G-273 und G-275.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Punkt ein Urteil      erledigt / gebaut / offen / ueberholt
    die drei Sperren         welche stehen noch
    p_user_id                ms mit und ohne, derselbe Aufruf
    Ursache des Aufschlags   gemessen oder als unklar gemeldet
    Alltagswoerter           welche gehen heute leer aus
    Thai-Aliase              gegenstandslos?

`[read]` **Wenn sich zwei der vier als ueberholt erweisen, ist das
das Ergebnis** — **nicht ein halber Auftrag.**

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
**Wegwerf-Datenbank, Vollsicherung vor jedem Live-Eingriff.**
`[cmd]` **`food_search` ist gemessen empfindlich** — miss die
Laufzeit vor und nach jeder Aenderung.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

### 2026-08-30 - C-120, C-191, C-27 und C-177 nachgemessen

| Punkt | Urteil | Nachweis |
|---|---|---|
| C-120 | ueberholt | Alle drei historischen Sperren sind ueber `p_filters` auf dem laufenden Lesepfad aufgehoben. |
| C-191 | ueberholt | Kein Dreifach-Effekt mehr: dev-Aufruf +5,6 %, nicht 3x. |
| C-27 | erledigt | Beide letzten Alltagswoerter liefern Treffer. |
| C-177 | offen | Die behauptete Begruendung ueber E-16 geht nicht auf; Thai ist im aktuellen UI sogar waehlbar. |

#### C-120 - drei Sperren

`p_tag_code` selbst ist weiter ein einzelner Altparameter. Er ist aber
keine funktionale Sperre mehr: `p_filters.tag_groups` erlaubt ODER innerhalb
und UND zwischen Gruppen. Auf der laufenden DB liefert die leere Suche
7.140 Lebensmittel, die Gruppen `[vegan OR vegetarian] AND [high_protein]`
liefern 154. `p_filters.exclude_tag_codes = [ultra_processed]` liefert
6.213 statt 7.140 - der Ausschluss wirkt auf die Gesamtmenge, nicht erst auf
die angezeigte Seite. Auch `processing_level` ist filterbar: nur `raw`
liefert 3.251, Ausschluss von `raw` 3.889. Damit sind alle drei Befunde aus
C-120 durch C-164/C-347 ueberholt; keine neue Rangregel und keine Tags
wurden gesetzt.

#### C-191 - Kosten von `p_user_id`

Gemessen wurde derselbe warme Aufruf neunmal je Seite: `milch`,
`relevance`, Limit 25, `token_groups = [[milch]]`.

| Aufruf | Median | Differenz zu ohne Nutzer |
|---|---:|---:|
| ohne `p_user_id` | 151,752 ms | - |
| `test-user@lumeos.local`, 0 materialisierte Ziele | 149,958 ms | -1,794 ms (-1,2 %) |
| `dev@lumeos.app`, 2.465 Ziel-Lebensmittel | 160,231 ms | +8,479 ms (+5,6 %) |

Der Parameter allein kostet damit nichts Messbares. Die gemessene
Zusatzarbeit liegt vor dem Treffer-Join in
`food_preference_search_targets`: fuer dev liest ein Index-Only-Scan 2.977
Zielzeilen und `GroupAggregate` verdichtet sie auf 2.465 Lebensmittel in
6,975 ms (93 Shared-Buffer-Hits). Das erklaert den groessten Teil des
Aufschlags. Es ist nicht mehr die alte, je Treffer neu aufgebaute
Praeferenzkette; die Funktion aggregiert die materialisierten Ziele je
Nahrungsmittel.

#### C-27 - zwei leere Alltagswoerter

Beide damaligen Restfaelle sind durch den heutigen Dekompositor-/Aliaspfad
nicht mehr leer: `basmatireis` liefert 1 Treffer (`Reis poliert, roh`),
`griechischer joghurt` ebenfalls 1 (`Sahnejoghurt mind. 10 % Fett, mit
Magermilchpulverzusatz`). C-27 ist damit erledigt; der Auftrag verlangte
Treffer, nicht eine neue Relevanzentscheidung.

#### C-177 - Thai-Aliase

E-16 betrifft ausschliesslich generelle Ausschluesse; er schaltet Thai nicht
ab. Die genannte Praemisse widerspricht zudem dem aktuellen Code:
`SPRACHEN` enthaelt `de`, `en`, `th`, und die Kopf-Sprachwahl rendert alle
drei ohne `disabled`. Gleichzeitig misst die Datenbank weiter 0 Thai-Aliase
(`food_aliases`: 25.705 `de`, 7.140 `en`) und 0 von 7.140 befuellte
`foods.name_th`. Der Punkt ist deshalb nicht gegenstandslos und bleibt offen;
dieser Widerspruch wurde weder per UI-Aenderung noch durch erfundene Aliase
aufgeloest.

Alle Messungen waren lesend gegen den laufenden lokalen `postgres`-Stand.
Keine Aenderung unter `apps/`, keine Rangregel, keine Tags, nichts gestagt
oder committet.

## Abnahme

_(vom Orchestrator)_
