---
nr: C-411
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: null
entscheidung: E-66
agent: codex
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: 0a0b8b93
beruehrt:
  tabellen: [nutrition.food_curation_candidates]
zahlen:
  gemessen: 2026-09-07
  kandidaten: 0
---

# C-411 — Rezeptvorschlaege in der Kuration

## Befund

Tom, 2026-09-07, zu MealCam: *,,das rezept muss aber auch im
adminbereich zur validierung auftauchen, dann koennen wir einen
ausbau administrieren."*

`[cmd]` **Der Weg existiert, fuer Lebensmittel:**

    food_curation_candidates
      food_id, target_type, target_field, proposed_value,
      source, reason, status, reviewer
      0 Zeilen

    food_curation_decisions
      candidate_id, decision, reviewer, reason
      0 Zeilen

`[cmd]` **`status`:** `pending`, `accepted`, `rejected`,
`superseded`.

`[cmd]` **`target_type`:** `category_assignment`, `display_name`,
`alias`, `preference_item_mapping`.

`[read]` **Kein Wert fuer Rezepte** — **das ist die Luecke.**

`[read]` **Und `food_id` ist Pflicht** — **ein Rezeptvorschlag haengt
an keinem einzelnen Lebensmittel.**

## Zu entscheiden

`[read]` **Ein `target_type` fuer Rezepte** — **oder eine eigene
Kandidatentabelle?**

`[read]` **Ein Rezept traegt Zutaten mit Mengen** — **das passt
schlecht in `proposed_value`.**

`[cmd]` **Und `food_id` muesste optional werden** — **eine
Strukturaenderung an einer Tabelle mit 0 Zeilen ist billig, spaeter
nicht.**

## Und der Herkunftswert

`[cmd]` **`recipes.source` kennt `user`, `coach`, `marketplace`,
`buddy`.**

`[read]` **Traegt ein MealCam-Rezept `buddy`, oder braucht es einen
eigenen Wert?**

`[read]` **`buddy` ist der Gefaehrte, MealCam ist eine Kamera** —
**zwei verschiedene Herkuenfte.**

`[cmd]` **E-45 regelt, was mit jeder Herkunft geschieht** —
**ein fuenfter Wert braucht dort einen Eintrag.**

## Auftrag — Rezeptvorschlaege und die Laufzeit

**Mitbeauftragt: C-404, C-193.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-411 — Rezepte in die Kuration

`[cmd]` **E-66, Tom 2026-09-07:** *,,mealcam kann rezepte im
userprofil erstellen, das rezept muss aber auch im adminbereich zur
validierung auftauchen."*

`[cmd]` **Der Weg existiert:** `food_curation_candidates` und
`food_curation_decisions`, **beide 0 Zeilen.**

`[cmd]` **Aber `target_type` kennt nur `category_assignment`,
`display_name`, `alias`, `preference_item_mapping`** — **kein
Rezept.**

`[cmd]` **Und `food_id` ist Pflicht** — **ein Rezeptvorschlag haengt
an keinem einzelnen Lebensmittel.**

`[read]` **Entscheide: ein `target_type` fuer Rezepte, oder eine
eigene Kandidatentabelle?** `[read]` **Ein Rezept traegt Zutaten mit
Mengen** — **das passt schlecht in `proposed_value`.**

`[cmd]` **Eine Strukturaenderung an einer Tabelle mit 0 Zeilen ist
billig, spaeter nicht.**

### Und der Herkunftswert

`[cmd]` **`recipes.source` kennt `user`, `coach`, `marketplace`,
`buddy`** (E-45).

`[read]` **Traegt ein MealCam-Rezept `buddy`, oder braucht es einen
eigenen Wert?** `[read]` **`buddy` ist der Gefaehrte, MealCam eine
Kamera** — **zwei Herkuenfte.**

`[cmd]` **E-45 regelt, was mit jeder Herkunft geschieht** — **ein
fuenfter Wert braucht dort einen Eintrag.** `[read]` **Vorschlagen,
nicht entscheiden.**

### 2 · C-404 — die Laufzeit, jetzt mit Auftrag

`[cmd]` **Du hast gemessen: die vierte Aufbau-Woche ist beabsichtigt
(kopierte Woche) und darf nicht geloescht werden.**

`[read]` **Damit ist E-62 eindeutig:** `days_count` **ist die
Laufzeit** — **vier Wochen heisst 28.**

`[cmd]` **Du hast ohne Auftrag keine nicht-persistente
Einzelkorrektur vorgenommen** — richtig.

**Hiermit beauftragt:** `[read]` **modelliere die Lifecycle-Felder in
der Seedquelle** — **damit `days_count 28` den naechsten Kettenlauf
ueberlebt.**

### 3 · C-193 — der Leseweg fuer MealCam

`[cmd]` **Du hast gemessen: MealCam ist rein statisch, kein
Leseweg.**

`[cmd]` **Und `SPEC_11` steht seit heute** — **mit vier
Aufloesungsgraden und dem Kandidatenraum aus dem BLS.**

`[read]` **Miss, was ein Leseweg braeuchte, der harte Ausschluesse
beachtet:** `[cmd]` **A-47 hat belegt, dass die Suche 120
`contains_nuts`-Zeilen bei JEDER Suche entfernt.**

`[read]` **Ein Vorschlag, der eine Allergie enthaelt, waere
schlimmer als kein Vorschlag.**

`[read]` **Melden, nicht bauen** — **MealCam ist Phase 0.**

### Was nicht zu tun ist

**Keine Datenlogik in `migrations/`.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Rezeptkandidat   angelegt und wieder entfernt, belegt
    Herkunftswert    vorgeschlagen, begruendet
    Aufbau-Plan      days_count 28, ueberlebt den Kettenlauf
    C-193            was ein Leseweg braeuchte, mit Zahl

## Bericht

**Codex, 2026-09-05.** Keine Datei in `apps/`, keine Migration, kein
Dev-Server, kein Commit. C-411 und C-404 sind gebaut; C-193 ist nur
gemessen, wie beauftragt.

### C-411 — ein eigener Rezeptkandidatenraum

**Entscheidung:** eigene Tabellen, nicht ein weiterer `target_type` in
`food_curation_candidates`.

`food_curation_candidates` bleibt eine Feldkorrektur an genau einem
Lebensmittel (`food_id`, `target_field`, `proposed_value`). Ein Rezept ist
dagegen eine eigene Entitaet mit geordneten Zutaten und Grammwerten. Ein
JSON-Text in `proposed_value` waere weder sinnvoll lesbar noch einzeln
pruefbar.

Der neue Kettenschritt `411` legt deshalb an:

    recipe_curation_candidates
      recipe_id                 -- optionale Spur, bei Rezeptloeschung NULL
      recipe_owner_id
      name_de, Beschreibung, Anleitung, Portionen, Tags  -- Snapshot
      submitted_via = mealcam
      status, reviewer, reason

    recipe_curation_candidate_ingredients
      candidate_id, sort_order
      food_source, food_id / custom_food_id, Namenssnapshot, amount_g
      Portionssnapshot, Notiz

    recipe_curation_decisions
      candidate_id, Entscheidung, reviewer, reason

Damit bleibt die zu pruefende Zusammensetzung bestehen, auch falls der
Nutzer sein Rezept danach aendert oder loescht. Alle drei Tabellen haben RLS
und ausschließliches Admin-SELECT fuer `authenticated`; der kuenftige
MealCam-Schreibweg ist nicht Teil dieses Auftrags. Der Kandidatstisch startet
mit **0 Kandidaten, 0 Zutaten, 0 Entscheidungen**.

**Gegenprobe:** Ein vorhandenes Rezept wurde innerhalb einer Transaktion als
Kandidat mit seinen Zutaten und Mengen gesnapshottet. Der Kandidat war
`pending`, enthielt Zutaten und eine positive Gesamtmenge; `ROLLBACK` liess
anschliessend wieder 0 Kandidaten zurueck.

**Herkunftsvorschlag, nicht umgesetzt:** `recipes.source` sollte einen
fuenften Wert **`mealcam`** erhalten. `buddy` benennt den handelnden
Gefaehrten, nicht die Kamera als Entstehungsweg. E-45 braeuchte dazu eine
vierte Regel: MealCam-Rezepte bleiben fuer den Nutzer editierbar, erzeugen
eine Kurationsvorlage, aber keine Buddy- oder Coach-Rueckmeldung. Bis zu
dieser Entscheidung bleibt das bestehende Vierer-Enum unveraendert.

### C-404 — Laufzeit ist jetzt Seed-Datum

`MealPlanRow` traegt jetzt `lifecycleType`, `startDate` und `daysCount`; die
temporäre Seed-Tabelle und ihr `INSERT` schreiben diese Felder mit. Fuer den
`Aufbau-Wochenplan` stehen damit dauerhaft:

    lifecycle_type = once
    start_date     = 2026-09-01
    days_count     = 28

Die vierte Woche bleibt Teil des Plans. Der lokale aktive Aufbau-Plan wurde
auf dieselben drei Seedwerte korrigiert; der C-404-Test belegt 28
Tageszeilen bis 2026-09-28 bei `days_count = 28`.

### C-193 — ein MealCam-Leseweg darf nicht die Suche wiederverwenden

`dev@lumeos.app` hat `allergies = {tree_nuts}`. `contains_nuts` traegt
**120** effektive Food-Zeilen. Die Suche liefert ohne Nutzer **7.140** und
mit seinen Praeferenzen **4.970** Foods; unter den Resultaten einer
Nuss-Suche mit Nutzer liegen **0** `contains_nuts`-Treffer. A-47 gilt also
weiter: der Suchleser entfernt die 120 bei jeder Anfrage.

Der neue MealCam-Leser braeuchte daher drei getrennte Schritte:

1. Den BLS-Kandidatenraum ohne `p_user_id` lesen, damit die vier
   Aufloesungsgrade nicht bereits vor der Erkennung Informationen verlieren.
2. Nach Exact-/Parent-/Ambiguous-Aufloesung jedes ausgewaehlte Food — bei
   Rezepten jede Zutat — gegen `food_preference_search_targets` pruefen.
   Die Sicht hat `food_id`, `constraint_level`, `match_type` und `source`;
   die 120 Allergieziele sind dort als `profile_allergy` materialisiert.
3. Einen harten Konflikt als sichtbare Warnung mit Grund zurueckgeben,
   niemals den Kandidaten filtern. Allgemeine Ausschluesse muessen dabei von
   Allergie-, Diät- und ausdruecklichen Hard-Excludes getrennt bleiben, weil
   E-16/E-30 sie nur bewerten lassen.

Es gibt heute keinen MealCam-Leseweg, keine Kamera-Tabellen und keinen
Resolver-Aufruf. Das ist deshalb eine Anforderung an Phase 0, keine hier
eingebaute Datenlogik.

### Nachweis

`nutrition-c411-recipe-curation.test.ts` und
`meal-plan-lifecycle-and-flags.test.ts`: **5/5 gruen**. ESLint und
`tsc --noEmit` gruen; die Migrationspruefung meldet keine Datenlogik.

## Abnahme

**2026-09-07, Orchestrator. Nachgemessen.**

### Drei Tabellen statt eines `target_type`

`[cmd]` **Selbst gemessen:**

    recipe_curation_candidates              18 Spalten
    recipe_curation_candidate_ingredients   13 Spalten
    recipe_curation_decisions                6 Spalten

`[read]` **Er hat die Frage aus dem Auftrag entschieden** — **ein
Rezept traegt Zutaten mit Mengen, das passt nicht in
`proposed_value`.**

`[read]` **Und die Trennung folgt dem Vorbild:** `[cmd]`
**`food_curation_candidates` und `food_curation_decisions` sind
ebenfalls zwei Tabellen** — **die Entscheidung ist ein eigener
Vorgang.**

`[cmd]` **Die Gegenprobe erstellt Zutaten-Snapshots transaktional:
Admin sieht ihn, Normalnutzer nicht, danach 0 Zeilen.**

`[read]` **Beide Richtungen belegt** — **wer sieht was, und was
bleibt zurueck.**

### Und der Herkunftswert ist vorgeschlagen, nicht gesetzt

`[cmd]` **`recipes.source = 'mealcam'` als fuenfter Wert, nicht
`buddy`.**

`[read]` **Richtig** — **und er hat es als Vorschlag fuer eine
E-45-Entscheidung markiert, nicht selbst gebaut.**

`[cmd]` **SPEC_11 schlaegt zusaetzlich ein zweites Feld vor:**
`created_via` **neben `source`** — **weil `source` sagt, WEM ein
Rezept gehoert, nicht WODURCH es entstand.**

`[read]` **Beide Vorschlaege gehen an Tom.**

### C-404 — und ein zweiter Plan mit demselben Fehler

`[cmd]` **Lifecycle-Felder in der Seedquelle modelliert.** `[cmd]`
**`dev`: `once`, `days_count 28`, 28 Tage** — **stimmig.**

`[cmd]` **Aber `tom.seed@example.com` traegt `days_count 7` bei 21
Tagen.**

`[read]` **Dasselbe Muster, anderes Konto** — **und es war nicht im
Auftrag, weil ich nur `dev` gemessen hatte.**

`[read]` **Zum sechsten Mal eine Zahl ohne `user_id`.** **Als
C-413.**

### C-193 — dokumentiert, mit der richtigen Reihenfolge

`[read]` **Sein Satz ist der Kern:** *,,MealCam muss BLS-Kandidaten
ungefiltert lesen und erst danach Konflikte pro Food/Zutat als
Warnung zurueckgeben."*

`[cmd]` **Die Suche entfernt aktuell alle 120
`contains_nuts`-Foods** (A-47).

`[read]` **Fuer eine Suche ist das richtig** — **wer nach Nuss
sucht, will keine Nuss vorgeschlagen bekommen.**

`[read]` **Fuer eine Kamera ist es falsch:** **wer eine Nuss
fotografiert, hat sie vor sich.** `[read]` **Sie zu verschweigen
waere gefaehrlicher als sie zu benennen.**

`[cmd]` **Und SPEC_11 Abschnitt 5 traegt es bereits:** **die Quelle
je Eigenschaft ist ein Datentyp** — `IMAGE` **ist etwas anderes als**
`DATABASE`.

**Abgenommen.**

