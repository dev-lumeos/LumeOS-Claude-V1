---
nr: G-296
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: C-364
entscheidung: null
agent: codex
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: OFFEN
beruehrt:
  dateien:
    - tsconfig.json
zahlen: null
---

# G-296 — das globale `tsc` ist rot wegen `packages/ui`

## Befund

Aus C-364, Codex, 2026-08-31.

`[cmd]` **Ein globales `tsc` bleibt rot** — **eine bestehende
JSX-Konfiguration in `packages/ui`.**

`[read]` **Codex hat es gemeldet, statt es zu umgehen oder zu
beheben.** **Richtig: es gehoerte nicht zu seinem Auftrag.**

## Warum es zaehlt

`[cmd]` **`pnpm gate` laeuft gruen** — der Gate ruft `tsc` je
Arbeitsbereich, nicht global.

`[read]` **Damit ist es kein Blocker, sondern ein blinder Fleck:**
**wer `tsc` global ruft, bekommt Rot und weiss nicht warum.**

`[cmd]` **Und `packages/ui` traegt `InEntwicklung` mit 135
Aufrufern** (C-177) — **die Datei ist im Umlauf.**

## Zu messen

`[read]` **Was genau ist falsch konfiguriert, und seit wann?**
`[read]` **Und ob der Gate es fangen sollte** — **ein Gruen, das
einen bekannten Fehler nicht sieht, ist ein halbes Gruen.**

## Auftrag — zwei blinde Flecken

**Mitbeauftragt: C-366.** Bericht in diese Datei.

**Beauftragt am 2026-08-31.**

### 1 · G-296 — das globale `tsc`

`[cmd]` **Du hast es in C-364 gemeldet.** `[read]` **Miss, was genau
falsch konfiguriert ist und seit wann.**

`[cmd]` **`pnpm gate` laeuft gruen**, weil er `tsc` je
Arbeitsbereich ruft. `[read]` **Ein Gruen, das einen bekannten Fehler
nicht sieht, ist ein halbes Gruen** — **sag, ob der Gate es fangen
sollte.**

### 2 · C-366 — `food_tags` hat keinen Pflegeweg

`[cmd]` **30.797 Zeilen, kein Trigger, keine Funktion, keine
Oberflaeche.** `[cmd]` **Und `auto_tag_food` existiert nicht** —
Claude Code hat es in G-226 gemessen.

`[read]` **Die Tags wirken:** `[cmd]` **E-22 fuehrt 14
Tag-Definitionen, `food_search` rankt danach, und G-116 hat gemessen,
dass ein einzelner Tag 162 Treffer entscheidet.**

`[read]` **Etwas, das die Suche steuert und niemand aendern kann, ist
ein Einbahnweg.**

`[cmd]` **`apps/admin` hat eine Kurationsseite mit 314 Zeilen**
(A-36) — **miss, ob sie Tags kennt.**

`[read]` **Und ob der Import sie ueberschreiben wuerde** — **dieselbe
Frage wie C-29 bei den Anzeigenamen, die dort geloest ist:** der
Kettenschritt liest `name_display_de` aus der Quelldatei und laesst
Kuratiertes stehen.

### Was nicht zu tun ist

**Keine Tags aendern** — erst den Weg, dann die Daten.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    tsc global        was ist rot, seit wann
    Gate              soll er es fangen? begruendet
    food_tags         wer koennte pflegen, gemessen
    Import            wuerde er ueberschreiben

## Bericht

**Gemessen am 2026-08-31 auf Branch `dev`.**

### G-296 - der globale Compilerfehler ist echt und seit dem ersten UI-TSX da

`[cmd]` `pnpm exec tsc --noEmit --pretty false` liefert ausschliesslich
486 Fehler aus `packages/ui`: 450-mal `TS17004` (*JSX nur mit
`--jsx`*) und 36-mal `TS6142` (eine `.tsx`-Aufloesung bei fehlendem
`jsx`).

`[cmd]` Das Root-`tsconfig.json` umfasst mit `packages/*/src/**/*` auch
`packages/ui`, setzt aber keine Compileroption `jsx`. `packages/ui` hat
kein eigenes `tsconfig.json`. Damit fehlt dem einen Projekt, das die
TSX-Dateien einschliesst, genau deren Sprachmodus.

`[cmd]` Das Root-`tsconfig.json` wurde am 2026-04-23 angelegt und trug
auch damals kein `jsx`. Die ersten `.tsx`-Dateien unter `packages/ui`
kamen am 2026-08-15 hinzu (`a52d1d5`, Shared Primitives; am selben Tag
die Shell). Seit diesem Zeitpunkt ist der globale Aufruf rot. Der
spatere `InEntwicklung`-Baustein ist nicht die Ursache, sondern einer
der betroffenen UI-Aufrufer.

### Der Gate prueft UI nicht, obwohl der Taskname erscheint

`[cmd]` `pnpm gate` endet bei `turbo run typecheck test build`. Der
Turbo-Trockendurchlauf fuehrt zwar `@lumeos/ui#typecheck` und
`@lumeos/ui#build` auf, ihre Befehle stehen aber jeweils auf
`<NONEXISTENT>`: `packages/ui/package.json` hat weder `typecheck` noch
`build`. Turbo kann die Knoten deshalb als Abhaengigkeit von Web und
Coach zeigen, ohne einen UI-Compiler auszufuehren.

`[cmd]` Die Gegenprobe lief voll durch: `pnpm gate` endete mit Exit 0
nach 56,658 s und meldete 11 erfolgreiche Turbo-Tasks. Das ist genau
der blinde Fleck, nicht sein Gegenbeweis.

`[read]` Das gruene Gate belegt damit die Arbeitsbereiche mit echten
Skripten, nicht `packages/ui`. Es widerspricht dem roten globalen
Compiler nicht; es sieht ihn schlicht nicht.

**Folgerung:** Der Gate soll diesen Fehler fangen. `packages/ui` ist
eine Build-Abhaengigkeit von Web und Coach und ein geteilter Baustein im
Umlauf. Ob das durch ein eigenes UI-Projekt mit JSX-Konfiguration oder
durch einen zusaetzlichen Root-Check geschieht, ist ein Bauentscheid;
in diesem Auftrag wurde weder Konfiguration noch Gate veraendert.

### C-366 - die Admin-Kuration sieht Tags, pflegt sie aber nicht

`[cmd]` Auf dev hat `nutrition.food_tags` 30.797 Zuordnungen ueber 13
Codes. `nutrition.tag_definitions` hat 14 Definitionen; `thai_food` ist
die Definition ohne Zuordnung. Die Tabelle hat nur `food_id`,
`tag_code` und `confidence` - keine Herkunft, keinen Bearbeitungsstatus
und kein Feld, das eine kuratierte Zuordnung von einer Ableitung trennt.

`[cmd]` Es gibt keinen Trigger auf `nutrition.food_tags`. Die vier
Funktionen, die die Tabelle lesen (`food_search`,
`preference_search_preview`, `refresh_food_preference_search_targets`,
`curation_overview`), enthalten keinen Schreibzugriff. RLS gibt
`authenticated` ausschliesslich `SELECT`.

`[cmd]` Die 314 Zeilen von `apps/admin/src/app/curation/page.tsx` kennen
Tags: Filterparameter, Tags je Lebensmittel und die Kachelserie *V1 Tag
Coverage*. Der einzige API-Handler exportiert aber `GET`; seine eigene
Nutzlast bezeichnet den Modus als `read_only` und `writes_enabled` als
`false`. Die Adminseite ist daher eine Leselupe fuer Tags, kein
Pflegeweg.

### Der Import wuerde Kuration heute nicht bewahren

`[cmd]` Kettenschritt 027 loescht vor dem Einspielen alle zehn von ihm
verwalteten Codes aus `food_tags` und setzt sie aus
`daten/lebensmittel-tags.jsonl` neu. Schritt 032 loescht und berechnet
`halal` und `kosher` danach erneut. Schritt 221 loescht ebenso
`high_fat` und `gluten_free`, falls er eingespielt wird. Damit werden
bei einem Kettenlauf zwoelf Tag-Codes gezielt ersetzt; fuer die vier
Makro-Tags aus Schritt 020 gibt es nur `INSERT ... ON CONFLICT DO
NOTHING`.

`[cmd]` Schritt 221 liegt zwar in `kette.json`, seine beiden
Definitionen (`high_fat`, `gluten_free`) stehen auf dev noch nicht in
`tag_definitions`. Der Kettenschritt ist also nicht derselbe Nachweis
wie ein Live-Stand.

`[read]` Anders als bei einer geschuetzten Kuration kann die Datenbank
heute nicht erkennen, welche Zuordnung sie beim erneuten Import bewahren
muesste. Der einzige Pflegeort ist derzeit die Eingabedatei plus
Kettenlauf, nicht die Adminoberflaeche. Erst ein Herkunfts- oder
Kurationsmodell kann diesen Einbahnweg aufheben; keine Tags wurden
veraendert.

## Abnahme

**2026-08-31, Orchestrator. Nachgemessen.**

`[cmd]` **486 UI-Fehler, weil das Root-`tsconfig` kein `jsx` setzt.**
`[cmd]` **Rot seit dem 15.08. — den ersten UI-TSX-Dateien.**

### Und der schwerere Teil

`[cmd]` **Die UI-Tasks stehen im Turbo-Graphen auf `<NONEXISTENT>`.**

`[cmd]` **Nachgemessen mit `turbo run typecheck --dry-run`:**

    @lumeos/web#typecheck      tsc --noEmit
    @lumeos/admin#typecheck    tsc --noEmit
    @lumeos/coach#typecheck    tsc --noEmit
    @lumeos/shared#typecheck   <NONEXISTENT>
    @lumeos/ui#typecheck       <NONEXISTENT>

`[read]` **Zwei Pakete haben kein Skript, und der Gate laeuft
darueber hinweg.** `[cmd]` **Dasselbe bei `build`.**

`[read]` **Jede *Gate 11/11 gruen*-Meldung der letzten Wochen hat
diese beiden nicht geprueft** — **und `packages/ui` traegt
`InEntwicklung` mit 135 Aufrufern.**

`[cmd]` **Sein Urteil: *,,Der Gate sollte das erfassen."*** **Als
G-303.**

### C-366 — Tags

`[cmd]` **Admin zeigt und filtert Tags, ist aber vollstaendig
lesend.** `[cmd]` **Der Import ersetzt 12 Tag-Codes ohne
Herkunftsunterscheidung** — **eine Kuration waere nicht geschuetzt.**

`[read]` **Damit ist die Frage aus meinem Auftrag beantwortet:** bei
den Anzeigenamen ist es geloest (C-29), **bei den Tags nicht.**

**Abgenommen.**

