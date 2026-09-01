---
nr: C-207
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-08-22
braucht: []
kind_von: null
kinder: [C-319, C-320, C-321, C-322]
entscheidung: null
agent: codex
beauftragt: 2026-09-01
erledigt: 2026-09-01
commit: OFFEN
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-207 - Vier Entscheidungen aus dem 035-Handoff

## Befund

(neu 2026-08-22). **Entscheidung Tom. Blockiert C-202 und die
  Cam-Funktionen.**

  `[cmd]` Der Handoff nennt sie ausdruecklich als offen:
  **Speicherweg** (hybrid / remote-url / object-store) ·
  **Datenschutz und Aufbewahrung je Rechtsraum** (Thai PDPA, DSGVO) ·
  **Einwilligungs-Fuehrung** · **Wahl des Vision-Modells**.

  `[cmd]` Fertig liegen: **vier Cam-Contracts** (medication,
  supplement, peptide, prescription), `vision_product_match_signals`,
  `vision_learning_example_schema`, `product_media_rights_registry`
  (8 Rechte-Zustaende). **Spezifiziert bis zu den OCR-Grenzen.**

### Widerlegt oder ueberholt

## Auftrag — die vier Entscheidungen aus dem Handoff

**Mitbeauftragt: C-303, C-220.** Bericht in diese Datei.

**Beauftragt am 2026-09-01.**

### 1 · C-207 — vier Entscheidungen aus dem 035-Handoff

`[read]` **Lies den Punkt und miss, welche der vier noch offen
sind.** `[cmd]` **Der Handoff ist aelter als der Katalogneuaufbau** —
**bei zweiundzwanzig geprueften Altpunkten waren neun ueberholt.**

`[cmd]` **Und eine der vier ist seit heute beantwortbar:** `[cmd]`
**`coach.client_consent_log` steht** — dein eigener C-362-Bau.
`[read]` **Wenn eine der Entscheidungen an einer fehlenden
Einwilligung hing, ist sie es nicht mehr.**

### 2 · C-303 — das Nutzersymptom-Protokoll

`[cmd]` **Du hast es in A-33 als einzigen offenen Rest genannt.**

`[cmd]` **`medical.symptoms` ist ein Katalog mit 34 Zeilen, gelesen
von `lesen.ts:431`** (C-359). `[read]` **Fuers Erfassen fehlt ein
Protokoll je Nutzer.**

`[read]` **Vor dem Bau zu klaeren:** `[cmd]` **E-12 haelt
Medical-Daten in der Entwicklungsphase als Klartext.** `[cmd]` **Und
`user_medications` ist gesperrt, bis Verschluesselung und
Schluesselverwaltung stehen.**

`[read]` **Ob dieselbe Auflage fuer ein Symptomprotokoll gilt, ist zu
messen und zu melden** — **nicht selbst zu entscheiden.**

### 3 · C-220 — `buddy` in 0 von 16 Tabellen

`[cmd]` **Miss, was der Punkt behauptet und ob es noch gilt.**
`[cmd]` **Seit heute traegt `plan_origin` den Wert `buddy` und
`recipes.source` ebenso** (C-371, C-374).

`[read]` **Also mindestens zwei Stellen mehr als null.**

### Was nicht zu tun ist

**Kein `user_medications`** — gesperrt.
**Keine Tabelle bauen, bevor die Verschluesselungsfrage beantwortet
ist.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    je Punkt ein Urteil    erledigt / gebaut / offen / ueberholt
    die vier               welche haengen noch, welche nicht
    Symptomprotokoll       Auflage geklaert? gemeldet
    buddy                  in wie vielen Tabellen jetzt

## Bericht

### 2026-09-01 - Codex

## C-207 - alle vier Entscheidungen sind erledigt

Der Handoff ist ueberholt: Seine vier Kinder C-319 bis C-322 sind seit
2026-08-27 abgenommen und verweisen auf zwei weiterhin gueltige
Entscheidungen.

- **Speicherweg (C-319):** E-19 entscheidet privaten,
  S3-kompatiblen Objektspeicher; Bild und Analyse bleiben getrennt.
- **Vision-Modell (C-322):** E-19 entscheidet eine austauschbare
  Modellnaht mit `modell` und `modell_version` je Erkennung.
- **Datenschutz/Aufbewahrung (C-320):** E-20 entscheidet zwei Zwecke
  (Analyse und optionale Modellverbesserung); Rechtsraumfristen und
  die Trainingsausleitung werden erst vor Produktiv gebaut.
- **Einwilligungsfuehrung (C-321):** E-20 entscheidet zwei getrennte,
  widerrufbare Einwilligungen; Verbesserung ist standardmaessig aus.

`coach.client_consent_log` ist jetzt die passende strukturierte
Aufnahme fuer diese zwei Zwecke und einen Widerruf. Auf dev hat die
Tabelle noch **0 Ereignisse** und bewusst keinen Dialog bzw.
Schreibpfad. Das ist kein Rest der Entscheidung: E-20 ordnet genau
diesen Ablauf dem Endausbau zu. **C-207 hat keine offene
Entscheidung mehr und kann geschlossen werden.**

## C-303 - Verschluesselungsfrage ist nicht entschieden

`medical.user_symptom_logs` und das aeltere
`medical.user_symptoms` existieren beide nicht. Der fehlende Weg ist
also weiterhin ein Protokoll je Nutzer, nicht der Katalog
`medical.symptoms` (34 Reihen) oder seine 102 Markerzuordnungen.
Der Entwurf traeegt neben strukturierten Schwere-, Zeit- und
Symptomfeldern auch `triggers`, `relieving` und eine freie `note`.

E-12 sagt im Titel und Entscheidtext allgemein: Medical-Daten bleiben
in der Entwicklungsphase Klartext. Sein Geltungsfeld nennt aber nur
C-285. `docs/todo/SICHERHEIT.md` konkretisiert die spaetere
Verschluesselung ebenfalls nur fuer die vier bereits vorhandenen
Medical-Tabellen, darunter `user_medications`; ein Symptomprotokoll
kommt dort nicht vor, weil es noch nicht existiert. Damit gibt es
keine explizite Regel, ob C-303 dieselbe Medikamenten-Auflage erbt.

Die Quellen erlauben zwei gegensaetzliche Lesarten (E-12 allgemein
gegen sein auf C-285 begrenztes Metafeld). Das wird nicht selbst
aufgeloest. **C-303 bleibt vor dem Tabellenbau blockiert, bis Tom den
Geltungsbereich fuer Symptomdaten festlegt.**

## C-220 - die Null gilt nur noch fuer die Buddy-Entitaeten

Die Behauptung "buddy in 0 Tabellen" ist als Text-/Feldbefund falsch:
der gebaute Stand nennt `buddy` in **8 Tabellen**. Fuenf liegen im
Coach-Schema (`action_log`, `alerts`, `client_autonomy`,
`client_permissions`, `pending_actions`), dazu
`wissen.buddy_knowledge_records` und seit C-371/C-374
`nutrition.meal_plans.plan_origin` sowie `nutrition.recipes.source`.
Die beiden Nutrition-CHECKs erlauben jeweils `buddy`.

Es gibt aber weiterhin kein `buddy`-Schema und keine der im Punkt
genannten 16 Buddy-Entitaetstabellen. Zudem sind die neuen Werte nur
vorgesehen: **0 von 2** Meal-Plans und **0 von 6** Recipes tragen
heute `buddy`. **C-220 ist daher als pauschaler Nullbefund ueberholt;
sein eigentlicher 0-von-16-Entitaetsbefund gilt weiter.**

## Abnahme

**2026-09-01, Orchestrator.**

`[cmd]` **Alle vier Entscheidungen sind seit E-19 und E-20
getroffen.** `[read]` **Der Punkt zaehlte offene Fragen, die
inzwischen beantwortet waren** — **wie C-112, C-29 und die
Review-Gruppe.**

`[cmd]` **Und das Consent-Log ist vorhanden, absichtlich ohne
Ereignisse und ohne Dialog** — sein eigener C-362-Bau von heute.

`[read]` **Das ist die richtige Reihenfolge: der Ort steht, bevor
etwas hineingeschrieben wird.**

### C-303 bleibt blockiert, und der Grund ist praezise

`[cmd]` **E-12 sagt allgemein Klartext in der Entwicklung, verweist
aber nur auf C-285** — **fuer Symptomdaten gibt es keine
ausdrueckliche Verschluesselungsregel.**

`[read]` **Er hat keine Tabelle gebaut und die Luecke benannt.**
**Richtig: eine Gesundheitsakte entsteht nicht auf einer Auflage,
die niemand geschrieben hat.**

### C-220 — pauschal ueberholt, und der Rest ist scharf

`[cmd]` **`buddy` erscheint in 8 Tabellen** — nicht in null.

`[cmd]` **Aber: kein `buddy`-Schema, keine der 16
Buddy-Entitaetstabellen.** `[cmd]` **Und die zwei neuen
Herkunftswerte sind bisher unbenutzt** — `plan_origin` und
`recipes.source`, beide seit heute.

`[read]` **Damit ist der Punkt praeziser geworden statt erledigt:**
**die Herkunft ist vorgesehen, das Modul nicht gebaut.** **Genau das,
was E-39 und E-40 als *vorsehen* meinen.**

**Abgenommen.**

