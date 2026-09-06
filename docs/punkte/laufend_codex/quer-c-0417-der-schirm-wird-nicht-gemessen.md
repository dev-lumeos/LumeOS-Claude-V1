---
nr: C-417
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-359
entscheidung: E-70
agent: codex
beauftragt: 2026-09-07
beruehrt:
  dateien:
    - tools/mockup-deckung.mjs
zahlen:
  gemessen: 2026-09-07
  im_code: 2488
  versteckt_goals: 18
---

# C-417 — der Schirm wird nicht gemessen

## Befund

Aus G-359, 2026-09-07.

`[cmd]` **`mockup-deckung.mjs` zaehlt Beschriftungen im Code.**

`[cmd]` **Aber in `goals` standen 18 von 26 Elementen hinter
Entweder-Oder-Verzweigungen, die immer den Echtdaten-Zweig nahmen** —
**sichtbar im Code, unerreichbar am Schirm.**

`[read]` **Der Waechter haette sie als *,,ist da"* gezaehlt.**

`[read]` **Das ist die gefaehrlichere Haelfte:** **ein geloeschtes
Element faellt auf, ein verstecktes nicht.**

## Was fehlt

`[cmd]` **`tools/schuss.mjs` macht Bildschirmfotos, meldet sich
selbst an, zaehlt Attrappen und Konsolenfehler.**

`[read]` **Es koennte den gerenderten Text auslesen** — **dann waere
die Messung *Mockup gegen Schirm* statt *Mockup gegen Code*.**

## Zu klaeren

`[read]` **Was kostet ein Lauf ueber alle Module?** `[cmd]` **Der
Kettenlauf braucht 267 s und laeuft taeglich** — **ein Schirmlauf
waere vermutlich billiger.**

`[read]` **Und ob er ins Gate gehoert oder zum taeglichen Lauf** —
`[cmd]` **C-416 hat gerade gezeigt, wie ein taeglicher Lauf
gemeldet wird.**

`[read]` **Ein Schirmlauf braucht einen laufenden Server** — **das
ist der Unterschied zu allen anderen Waechtern.**

## Auftrag — den Schirm messen

**Mitbeauftragt: C-31, C-155.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-417 — Mockup gegen Schirm

`[cmd]` **Der Waechter zaehlt Code, nicht Schirm** — **und haette
die 18 versteckten Elemente in `goals` als vorhanden gemeldet.**

`[cmd]` **`tools/schuss.mjs` meldet sich selbst an und zaehlt
Attrappen** — **es koennte den gerenderten Text mitliefern.**

`[read]` **Miss, was ein Lauf ueber alle Module kostet.**

`[read]` **Und entscheide, wo er hingehoert:** `[cmd]` **du hast
gerade den taeglichen Kettenlauf gebaut** — **derselbe Weg wuerde
passen, mit demselben Statusweg ueber
`backup/_manifests/`.**

`[read]` **Der Unterschied zu allen anderen Waechtern: ein
Schirmlauf braucht einen laufenden Server.** `[cmd]` **Der
Dev-Server gehoert Claude Code** — **kläre, ob ein eigener Port
noetig ist.**

### 2 · C-31 — der atomare Vertrag fuer Annehmen

`[cmd]` **Du hast gemeldet: fuer Annehmen und Ablehnen fehlt der
atomare Serververtrag** — **insbesondere, ob dabei ein Rezept
erzeugt oder geaendert wird.**

`[read]` **Das ist die richtige Frage** — **E-70 sagt, das Mockup
ist eine Variante, kein SSOT.**

`[cmd]` **Und C-411 hat drei Tabellen gebaut:**
`recipe_curation_candidates`, `_ingredients`, `_decisions`.

`[read]` **Bau den Vertrag** — **ein angenommener Kandidat wird
Katalogmaterial, wie `food_tags_kuriert` bei den Tags** (E-55).

`[read]` **Und begruende, ob dabei ein Rezept entsteht oder nur eine
Ueberlagerung.**

### 3 · C-155 — nicht wechseln, aber vorbereiten

`[cmd]` **`@supabase/ssr` liegt bei 0.1.0, aktuell waere 0.12.6.**
`[cmd]` **Vier Workspaces betroffen.**

`[read]` **Nicht wechseln** — **schreib auf, was ein Wechsel
braeuchte:** **Build, Admin- und Coach-Login, Sitzung, Abmeldung.**

`[read]` **Damit es entscheidbar wird, wenn Tom Zeit dafuer hat.**

### Was nicht zu tun ist

**Keine Abhaengigkeit aktualisieren.**
**Nie gegen die laufende Datenbank testen.**
`apps/` nicht anfassen — **Claude Code arbeitet dort an G-359.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Schirmlauf   was er kostet, wo er hingehoert
    Gegenprobe   ein verstecktes Element wird gemeldet
    C-31         der Vertrag, mit Begruendung
    C-155        was ein Wechsel braeuchte, als Liste

## Bericht

### C-417 - Der Schirmlauf ist ein eigener taeglicher Nachweis

`mockup-deckung.mjs` bleibt ein Quelltext-Waechter. Sein aktueller Lauf
meldet 1.145 von 2.488 sichtbar, weil er JSX-Beschriftungen sammelt; er kann
nicht unterscheiden, ob ein Ternaer seinen Zweig je erreicht. Die Gegenprobe
aus G-359 belegt genau den fehlenden Fall: Nach Anmeldung, allen zehn
Goals-Reitern und den erreichbaren Editorwegen waren zunaechst 8 von 26
benannten Elementen am Schirm, obwohl alle 26 im Code standen. 18 waren hinter
drei immer datenbevorzugenden Ternaries unerreichbar. Ein gerenderter
Textvergleich haette sie daher als fehlend gemeldet, der heutige Waechter
nicht.

Der vorhandene Vollschirmnachweis `backup/bestand/aufnahme.json` misst 128
Aufnahmen (64 Wege, hell und dunkel), keine davon fehlgeschlagen. Die Summe
aus erstem und zweitem Laden sowie der dokumentierten 700-ms-Wartezeit ist
502,4 s = 8,37 min; Anmeldung, Chromium-Start und Screenshots kommen noch
dazu. Das bestaetigt die fruehere 7,8-Minuten-Groessenordnung und ist deutlich
teurer als der 267-s-Kettenlauf. Er gehoert weder ins Gate noch in denselben
Prozess wie die Kette.

Empfehlung: ein eigener taeglicher Schirmlauf darf das C-416-Muster
(atomarer JSON-Status unter `backup/_manifests/`, roter Hinweis im Punktelauf)
uebernehmen, aber mit eigener Datei `schirm-status.json`. Ein gemeinsamer
Status wuerde Ketten- und Bildschirmfehler gegenseitig verdecken. Er braucht
einen eigenen, nach dem Lauf beendeten Server auf einem eigenen Port (etwa
3201), nie Claude Codes Dev-Server auf 3200, sowie seine kontrollierte
Seed-Datenbank. `schuss.mjs` kann ueber `LUMEOS_BASIS` bereits auf diesen Port
zeigen und mit `--zaehle` erwartete gerenderte Texte zaehlen. Fuer einen
automatischen Soll-Ist-Lauf fehlt nur noch die explizite Zuordnung
Mockup-Element -> Route/Tab/Klickweg; ein Body-Text-Dump allein verwechselt
gleiche Beschriftungen und erreicht keine Modale. Das ist ein eigener
Schirmrunner-Auftrag, nicht still in den Tageskettenlauf einzubauen.

### C-31 - Atomarer Annahmevertrag

`nutrition.decide_recipe_curation_candidate(candidate_id, decision, reason)`
ist nun der einzige authentifizierte Admin-Schreibweg. Er sperrt den pending
Kandidaten, prueft Rolle und Entscheidung und schreibt Status plus genau eine
Entscheidung atomar. `rejected` und `superseded` erzeugen kein Material.

`accepted` kopiert den unveraenderlichen Kandidaten-Snapshot nach
`nutrition.recipe_curation_catalog` und seine Zutaten nach
`recipe_curation_catalog_ingredients`. Die Annahme ist nur mit mindestens
einer vollstaendigen BLS-Zutat moeglich; Custom Foods bleiben privat und
koennen deshalb nicht unbemerkt globales Katalogmaterial werden. Bei einem
Fehler bleiben Kandidat, Entscheidungsprotokoll und Katalog unveraendert.

Es entsteht bewusst kein Eintrag in `nutrition.recipes`: Diese Tabelle ist
ein privates Nutzerobjekt mit `user_id` und eigener RLS. Ein Annahmevorgang
waere sonst entweder ein fremdes Nutzerrezept oder eine falsch als Nutzerrezept
modellierte Katalogkopie. Der neue Katalog ist davon getrennt, fuer
authenticated lesbar und ohne direkte authenticated-DML; der offene
`recipes.source`-Wert wird damit ebenfalls nicht vorweg entschieden.

Nachweis ausschliesslich auf `lumeos_c417_gruen`: 158 Kettenschritte,
`SCHEMA VOLLSTAENDIG`, 252,9 s. Drei Vertragsproben sind gruen: BLS-Annahme
kopiert einen Katalog-Snapshot ohne Nutzerrezept, Nicht-Admins sind gesperrt
und eine Custom-Food-Annahme bricht ohne Teilzustand ab.

### C-155 - Entscheidungscheckliste, kein Wechsel

`@supabase/ssr` bleibt unveraendert bei 0.1.0; `pnpm outdated -r` nennt
0.12.6. Direkt betroffen sind `@lumeos/admin`, `@lumeos/coach`,
`@lumeos/shared` und `@lumeos/web`. Vor einem beschlossenen Wechsel braucht
es eine gemeinsame Probe, nicht vier isolierte Paketupdates:

1. Lockfile- und Produktionsbuild aller vier Workspaces, danach Lint,
   Typecheck und Tests.
2. Admin-Browserweg ueber den Shared-Client: Anmeldung, Seitenwechsel bzw.
   Token-Erneuerung, Neuladen mit erhaltener Sitzung und Abmeldung.
3. Coach-Browserweg mit seinem eigenen Cookie-/`storageKey`-Client: dieselben
   vier Schritte, einschliesslich getrennter Cookie-Namen.
4. Middleware-/Serverclient in Admin, Coach und Web gegen dieselbe Sitzung:
   Cookie lesen, erneuern und entfernen; damit der alte Fehler
   `cookieOptions` ohne Browser-Cookies nicht nur in einem Weg verschwindet.

Der Wechsel beruehrt damit beide Agenten und die Shared-Naht zugleich. Er ist
nicht ausgefuehrt worden; A-69 ersetzt diesen Laufzeit-/Konfigurationsbefund
nicht.

## Abnahme

_(vom Orchestrator)_
