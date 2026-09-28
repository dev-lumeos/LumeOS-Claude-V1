---
nr: A-76
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-27
quellen:
  - docs/specs/Goals/README.md:8
  - docs/specs/Goals/FEATURES.md
  - docs/specs/Goals/OPEN_ITEMS.md:3
  - CLAUDE.md:391

beruehrt:
  dateien:
    - docs/specs/Goals/README.md
    - docs/specs/Goals/FEATURES.md
    - docs/specs/Goals/OPEN_ITEMS.md
    - docs/specs/Supplements/SPEC_01_MODULE_CONTRACT.md
    - docs/spezifikation/00-QUELLEN.md

zahlen:
  gemessen: 2026-09-27
  spec_dateien: 159
  mit_fremdem_port: 16
  mit_hono: 11
  mit_apps_app: 10
  mit_vollstaendig_implementiert: 3
  hono_im_repo: 0
  apps_app_im_repo: nein
---

# A-76 - die Specs beschreiben ein Repo, das es hier nicht gibt

## Der Befund

`[cmd]` **159 Dateien in `docs/specs/`, gemessen am 2026-09-27:**

    "Port <vierstellig>"            20 Treffer in 16 Dateien
    packages/contracts              20 Treffer in 19 Dateien
    "routes/"                       15 Treffer in  5 Dateien
    Hono                            12 Treffer in 11 Dateien
    apps/app/                       12 Treffer in 10 Dateien
    "Vollstaendig implementiert"     3 Treffer in  3 Dateien

`[cmd]` **Und im Repo:**

    apps/            admin, buddy, coach, mobile, staff, web
    apps/app/        gibt es nicht
    Hono             0 Treffer in allen package.json
    Ports            3200 (web), 3220 (coach) - kein 5900

`[read]` **`docs/specs/Goals/README.md` beschreibt als Architektur:**
`apps/app/(app)/goals/page.tsx`, 30 Komponenten, 18 Hooks, zwei
Zustand-Stores, eine Hono-API auf Port 5900 mit vierzehn
Routendateien. **Keine dieser Dateien existiert.** `packages/contracts`
und `packages/scoring` existieren — deshalb liest es sich stimmig.

`[read]` **`FEATURES.md` fuehrt zehn Features, jedes mit einer
`Code:`-Zeile.** Alle zeigen auf `routes/*.ts` und `*.tsx` des
Vorgaengers. **`OPEN_ITEMS.md` Zeile 3 sagt: ,,Status: Vollstaendig
implementiert (2026-04-14)."** Dasselbe steht in
`CONSOLIDATED_KNOWLEDGE.md` und in `Supplements/SPEC_01`.

## Warum das die Ursache ist, nicht ein Schoenheitsfehler

`[read]` **Ein Agent liest ,,vollstaendig implementiert" und sucht
nicht mehr.** Er nimmt die Feldnamen, nicht die Absicht; er baut
gegen `is_active`, obwohl live ein Gueltigkeitszeitraum steht; er
haelt `findBottleneck` fuer vorhanden, weil die Spec es als fertig
fuehrt und eine Datei denselben Namen traegt — mit erfundenen Zahlen
(G-522).

`[read]` **Genau das ist der Grund, warum der gebaute Stand sich
,,weit weg" anfuehlt.** Nicht weil wenig gebaut waere, sondern weil
die Quelle einen fertigen Zustand behauptet und niemand die Differenz
fuehrt. Die Quellensichtung Goals hat sie an vier Stellen gefunden:
G-522 bis G-525.

`[read]` **`docs/specs/` bleibt richtig und bleibt massgeblich.** Die
Entscheidungen darin sind getroffen — Gewichtungen, Formeln,
Phasenparameter, Schwellen. **Falsch ist nur die eine Ebene: was
davon schon steht und wo.** Die Spec beantwortet ,,wie es sein soll".
Sie darf nicht gelesen werden als ,,wo es liegt".

## Was der Punkt vorschlaegt

**1. Eine Geltungszeile je Spec-Datei**, ganz oben, vor dem ersten
Absatz:

    > GELTUNG: Entscheidungen gelten. Pfade, Ports, Dateinamen und
    > Statusangaben beschreiben lumeos-2026 und gelten NICHT.

**2. Die drei Statuszeilen streichen.** ,,Vollstaendig implementiert
(2026-04-14)" ist eine Aussage ueber ein anderes Repo und in diesem
falsch. Was hier steht, sagt `docs/punkte/00-INDEX.md`.

**3. Ein Waechter mit Sollstand**, wie bei A-75: `tools/specs-pruefen.mjs`
zaehlt Dateien ohne Geltungszeile und Dateien mit
Implementierungsbehauptung. **Er wird nicht sofort gruen** — 159
Dateien haben die Zeile nicht. Er friert den Stand ein und faellt
rot, wenn eine Datei dazukommt oder eine Behauptung zurueckkehrt.

## Nachweiszeilen

**A1** — die drei Statuszeilen gestrichen, je mit Vor- und Nachzeile
belegt.

**A2** — Geltungszeile in allen Goals-Dateien, weil dort gerade
gearbeitet wird. Die uebrigen Module folgen je Auftrag, nicht in
einem Durchlauf.

**A3** — `tools/specs-pruefen.mjs` mit Sollstand und
Sabotageprobe: **eine neue Datei ohne Geltungszeile muss rot
werden.** Ohne diese Probe misst er nichts.

**A4** — ins Gate, neben `punkte-pruefen`. Eine Regel, die nicht
rot werden kann, bindet nicht — das ist die Lehre aus G-518.

## Verhaeltnis zu A-75

`[read]` **A-75 verlangt, dass ein Auftrag seine Quellen nennt.
A-76 verlangt, dass die Quelle nicht luegt, wenn man sie liest.**
Beide zusammen schliessen die Luecke; einzeln keiner von beiden. Wer
nur A-75 baut, zwingt Agenten auf Quellen, die einen fremden Zustand
behaupten.

## Abnahme

`[cmd]` **Gebaut am 2026-09-28.** `tools/specs-pruefen.mjs`, neu,
im Gate zwischen `punkte-pruefen` und `sammelfragen-pruefen` (29
Schritte).

### Eine Korrektur an meinem eigenen Befund

`[cmd]` **Es sind zwei Statuszeilen, nicht drei.** Der dritte
Treffer, `docs/specs/Supplements/SPEC_01_MODULE_CONTRACT.md:177`,
lautet ,,**Enhanced Mode ist First-Class** — vollstaendig
implementiert, aber immer explizit vom User aktiviert." Das ist
eine Aussage ueber ein Feature, keine Statusangabe. **Mein
Suchmuster hat sie eingesammelt, nicht der Text sie verdient.**

`[read]` **Der Waechter sucht deshalb nach BEIDEM in einer Zeile**,
»Status« und »implementiert«. Die Supplements-Zeile ist als
Gegenprobe eingebaut: sie darf nicht rot werden.

### Was geaendert wurde

`[cmd]` **Zwei Zeilen gestrichen:**

    CONSOLIDATED_KNOWLEDGE.md:16  **Status:** Vollstaendig implementiert (2026-04-14)
    OPEN_ITEMS.md:3               ## Status: Vollstaendig implementiert (2026-04-14)

`[cmd]` **Geltungszeile in allen zehn Goals-Dateien** (A2), direkt
nach der Ueberschrift:

    > GELTUNG: Die Entscheidungen in dieser Datei gelten. Pfade,
    > Ports, Dateinamen und Angaben darueber, was schon gebaut ist,
    > beschreiben das Vorgaengerrepo lumeos-2026 und gelten NICHT.
    > Wo etwas liegt, sagt der Code; was offen ist, sagt
    > docs/punkte/00-INDEX.md. (A-76)

`[cmd]` **Die Dateien behalten ihre Umlaute und ihre Zeilenenden** —
sie sind Quelltexte, keine Hausdateien. Gemessen: kein BOM, null
Ersatzzeichen, keine gemischten Zeilenenden in allen zehn.

### Die Gegenprobe, vier Richtungen

    neue Datei ohne Geltungszeile          ROT    150 statt 149
    neue Datei MIT Geltungszeile           GRUEN
    Statusbehauptung kehrt zurueck         ROT    Soll 0
    implementiert ohne "Status"            GRUEN  (kein Fehlalarm)

`[cmd]` **Sollstand 149 von 159.** Die zehn Goals-Dateien tragen die
Zeile, weil dort gerade gearbeitet wird. **Die Zahl darf nur
sinken** — je Modul, das seine Zeilen bekommt, wird sie
nachgezogen.

### Was NICHT gebaut wurde

`[read]` **Kein Waechter auf `apps/app/`, Hono oder Port 5900.** 16
Dateien nennen einen fremden Port, 11 nennen Hono, 10 nennen
`apps/app/`. Ein Sollstand darauf waere ein zweiter Zaehler fuer
dieselbe Sache — **die Geltungszeile sagt dem Leser genau das**,
ohne 159 Dateien zu aendern. Wenn die Zeile ueberall steht, ist der
Rest Redundanz.
