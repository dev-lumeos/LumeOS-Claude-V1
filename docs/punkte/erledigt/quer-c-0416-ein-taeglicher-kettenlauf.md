---
nr: C-416
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: C-415
entscheidung: null
agent: codex
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: 027a383e
beruehrt:
  dateien:
    - tools/backup-wachstum.mjs
zahlen:
  gemessen: 2026-09-07
  gate_sekunden: 31.6
  kette_sekunden: 266.6
  schritte: 157
---

# C-416 — ein taeglicher Kettenlauf

## Befund

Aus C-415, Codex, 2026-09-07.

`[cmd]` **Der Vollkettenlauf dauert 266,6 s ueber 157 Schritte.**
`[cmd]` **`pnpm gate` dauert 31,6 s.**

`[read]` **Seine Empfehlung: nicht ins Gate, sondern taeglich als
Wegwerf-Lauf** — **rund 4,5 Minuten am Tag.**

`[read]` **Richtig.** **Ein Vollauf je Commit waere achtmal so
teuer wie das Gate** — **und niemand wuerde ihn abwarten.**

## Warum es einen Waechter braucht

`[cmd]` **C-415 hat gezeigt: die Kette war seit dem 05.09. gebrochen
und niemand hat es gemerkt** — **weil alles live eingespielt wurde.**

`[read]` **Zwei Tage** — **und in dieser Zeit entstanden C-405,
C-407, C-408, C-411, C-412, C-413, C-414.**

`[read]` **Alles davon steht auf einem Fundament, das nicht neu
aufgebaut werden konnte.**

## Zu bauen

`[read]` **Ein taeglicher Lauf auf einer Wegwerf-Datenbank, der bis
zum Ende geht** — **und meldet, wenn nicht.**

`[cmd]` **Und die Meldung muss jemanden erreichen** — **C-410 hat
gezeigt, dass ein roter Test ohne Empfaenger eine Notiz ist.**

`[read]` **Wo die Meldung landet, ist zu klaeren:** `[cmd]` **es gibt
keinen CI-Lauf, Tom arbeitet am Desktop.**

`[read]` **Vielleicht reicht eine Datei, die der Punktelauf
liest** — **wie das Backup-Manifest.**

## Auftrag

**Mitbeauftragt: C-31, C-155.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-416 — der taegliche Lauf

`[read]` **Deine Empfehlung uebernommen:** **nicht ins Gate,
taeglich als Wegwerf-Lauf.**

`[cmd]` **266,6 s gegen 31,6 s Gate** — **achtmal so teuer.**

`[read]` **Die offene Frage ist, wo die Meldung landet:** `[cmd]`
**es gibt keinen CI-Lauf, Tom arbeitet am Desktop.**

`[read]` **Vielleicht reicht eine Datei, die der Punktelauf
liest** — **wie `backup/_manifests/`.** `[cmd]` **Dort meldet
`backup-wachstum.mjs` bei ueber sieben Tagen ohne Inventur.**

`[read]` **Miss, was am wenigsten kostet und trotzdem
ankommt.**

### 2 · C-31 — die Admin-Oberflaeche

`[cmd]` **Der Schreibweg steht seit heute:** `curate_food_tag` **mit
Rechteschranke.**

`[cmd]` **Und `recipe_curation_candidates` mit drei Tabellen**
(C-411).

`[read]` **Miss, was die Oberflaeche braeuchte** — **das ist ein
UI-Auftrag, aber du kennst die Vertraege.**

### 3 · C-155 — zwei Befunde in `@supabase/ssr`

`[cmd]` **Du hast gemessen: beide bestehen, der Admin nutzt den
gefaehrdeten Pfad.**

`[cmd]` **A-69 ersetzt es nicht** — **nur ein transitives
`ws`-Advisory ueberschneidet sich.**

`[read]` **Miss, was ein Wechsel kosten wuerde** — **nicht
wechseln.** `[read]` **Ein Abhaengigkeitswechsel beruehrt beide
Agenten gleichzeitig.**

### Was nicht zu tun ist

**Keine Abhaengigkeit aktualisieren.**
**Nie gegen die laufende Datenbank testen.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    taeglicher Lauf   gebaut, Meldung erreicht jemanden
    Gegenprobe        ein eingebauter Bruch wird gemeldet
    C-31              was die Oberflaeche braucht
    C-155             was ein Wechsel kosten wuerde

## Bericht

### C-416 - Tageslauf und Empfaenger

Der leichteste Weg ohne CI ist ein lokaler Statusnachweis:
`tools/kettenlauf-taeglich.mjs` startet den bestehenden Lauf mit einer
tagesbezogenen Wegwerf-Datenbank und schreibt danach atomar
`backup/_manifests/kettenlauf-status.json`. Der Status enthaelt nur
Ergebnis, Zeit, Dauer, Datenbank, Manifest und Exit-Code. Es sind keine
Produkt- oder Entwicklungsdaten enthalten.

`tools/kettenlauf-status-pruefen.mjs` macht bei fehlendem, rotem oder mehr
als 36 Stunden altem Nachweis rot. `tools/punkte-pruefen.mjs` ruft ihn nun
immer auf. Damit erreicht ein Nachtfehler beim naechsten Punktelauf und damit
auch bei `pnpm gate` dieselbe Person, die den Arbeitsstand prueft. Der
Status selbst ist bewusst nicht versioniert.

Der Windows-Task `LumeOS - taeglicher Kettenlauf` ist lokal fuer 04:00 Uhr
(+07) taeglich registriert, mit `StartWhenAvailable`, 30-Minuten-Limit,
`node tools/kettenlauf-taeglich.mjs` und dem Repo als Working Directory.
Er laeuft nur im angemeldeten Desktop-Kontext; Docker muss deshalb verfuegbar
sein. Das ist absichtlich kein CI- und kein Gate-Schritt.

Die Gegenprobe ist automatisiert: Ein absichtlich ungueltiges Manifest mit
fehlendem Schrittpfad beendet den Tageslauf mit Exit 1, schreibt
`status: failed` samt Datenbankname, und der Statuswaechter meldet ihn rot.
Der echte Lauf danach war gruen: 157 Schritte plus Abschlusspruefung,
`KETTE OK: 267.7s`; der Status misst inklusive Aufraeumen 270.9 s. Die
Wegwerf-Datenbank `lumeos_tageskette_20260906` wurde danach automatisch
entfernt, und `punkte-pruefen --ohne-db` meldet den frischen Lauf gruen.

Dabei wurde ein bisher verdeckter Aufraeumfehler korrigiert: Der Kettenrunner
versuchte, auch fremde Superuser-Verbindungen zur Wegwerf-Datenbank zu
beenden. Die Bereinigung beschraenkt sich nun auf `current_user`; damit
bleibt sie im eigenen Rollenbereich und der Tageslauf wird nicht nach einer
gruenen Kette faelschlich rot.

### C-31 - Vertrag fuer die Admin-Oberflaeche

Die Tag-Kuration kann als UI-Auftrag beginnen. Sie braucht eine
Admin-geschuetzte Such-/Detailansicht mit Import-Tags aus
`food_tags_effective`, der Liste gueltiger `tag_definitions` und getrennten
Aktionen `set` sowie `removed`. Die Mutation muss serverseitig die RPC
`nutrition.curate_food_tag(food_id, tag_code, action)` mit der Sitzung
aufrufen, ihre vier Fehlerfaelle (keine Adminrolle, ungueltige Aktion,
unbekanntes Food, unbekanntes Tag) anzeigen und danach die effektiven Tags
neu lesen. Direkte DML auf `food_tags_kuriert` bleibt ausgeschlossen; die
Datenbankschranke ist die Autoritaet.

Die Rezeptansicht kann admin-only die Kandidaten nach Status/Erstelldatum,
ihren unveraenderlichen Zutaten-Snapshot in `sort_order`, Mengen, Herkunft,
Besitzer und vorhandene Entscheidungen lesen. Die drei C-411-Tabellen
erlauben `authenticated` jedoch ausschliesslich SELECT unter Admin-RLS.
Ein Annehmen/Ablehnen ist noch nicht als atomarer Serververtrag definiert:
Es fehlt insbesondere, ob eine Entscheidung nur Status und
`recipe_curation_decisions` schreibt oder zugleich ein Rezept erzeugt bzw.
veraendert. Die Rezeptliste ist daher jetzt baubar; Entscheidungsbuttons
brauchen einen eigenen, vorher festgelegten Admin-Schreibweg.

### C-155 - Wechselaufwand, nicht ausgefuehrt

`pnpm outdated -r @supabase/ssr` misst 0.1.0 gegen 0.12.6. Vier
Arbeitsbereiche deklarieren die Abhaengigkeit direkt:
`@lumeos/admin`, `@lumeos/coach`, `@lumeos/shared` und
`@lumeos/web`; der Lockfile-Wechsel ist damit ein gemeinsamer
Versionswechsel, nicht ein isolierter Admin-Fix.

Der gefaehrdete Admin-Login ruft den Shared-Browserclient auf. Coach hat
dagegen einen eigenen Browserclient mit expliziter Cookie-Implementierung und
`auth.storageKey`; die Serverclients in Admin, Coach, Web und Shared geben
ebenfalls `cookieOptions` weiter. Ein Wechsel muss daher mindestens vier
Workspace-Builds sowie die beiden Browser-Wege pruefen: Admin-Login mit
eigenem Cookienamen und Coach-Login mit getrenntem Speicher-/Cookienamen,
jeweils inklusive Session-Persistenz und Abmeldung. Er beruehrt damit beide
Agenten und die gemeinsame Shared-Naht zugleich. Keine Abhaengigkeit und
keine App-Datei wurde geaendert.

## Abnahme

**2026-09-07, Orchestrator. Nachgemessen.**

### Der taegliche Lauf steht

`[cmd]` **Selbst gelesen,
`backup/_manifests/kettenlauf-status.json`:**

    status             passed
    duration_seconds   270.9
    database           lumeos_tageskette_20260906
    exit_code          0

`[cmd]` **Windows-Task taeglich 04:00 (+07), nur Wegwerf-DB,
Ergebnis atomar geschrieben.**

`[cmd]` **Punktelauf und Gate lesen den Status** — **fehlend, rot
oder aelter als 36 Stunden wird sichtbar rot.**

`[read]` **Die 36 Stunden sind die richtige Wahl:** **ein
uebersprungener Tag faellt auf, eine Stunde Verzug nicht.**

### Und die Gegenprobe ist die richtige

`[cmd]` **Ein absichtlich defektes Manifest wird automatisiert rot
gemeldet.**

`[read]` **Damit ist belegt, dass der Waechter in beide Richtungen
misst** — **nicht nur, dass er heute gruen ist.**

`[cmd]` **Dazu ein realer Lauf: 157 Schritte in 267,7 s, danach
entfernt.**

### Ein Nebenbefund, der zaehlt

`[cmd]` **Der Kettenrunner beendete fremde Superuser-Sitzungen** —
**jetzt auf eigene Verbindungen beschraenkt.**

`[read]` **Ein taeglicher Lauf um 04:00, der fremde Sitzungen
abraeumt, haette irgendwann etwas getroffen** — **und niemand haette
den Zusammenhang gesehen.**

`[read]` **Er hat es gefunden, weil er den Lauf taeglich machen
sollte** — **nicht, weil jemand danach gefragt hat.**

### C-31 und C-155

`[cmd]` **Die Admin-UI kann Tags ueber die abgesicherte RPC
kuratieren und Rezeptkandidaten lesen.**

`[read]` **Und er hat gemeldet, was fehlt:** **der atomare
Serververtrag fuer Annehmen und Ablehnen** — **insbesondere, ob
dabei ein Rezept entsteht.**

`[read]` **Das ist die richtige Frage, und sie steht im
Folgeauftrag.**

`[cmd]` **C-155: `@supabase/ssr` bei 0.1.0, aktuell 0.12.6, vier
Workspaces betroffen.** `[cmd]` **Nicht gewechselt** — richtig.

`[read]` **Ein Wechsel braucht Build, Admin- und Coach-Login,
Sitzung, Abmeldung** — **das ist ein eigener Tag, kein Nebenbei.**

**Abgenommen.**

