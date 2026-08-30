---
nr: G-202
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-08-27
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: 12ffc1bf
beruehrt:
  dateien:
    - tools/dubletten-pruefen.mjs
zahlen: null
---

# G-202 - der Dublettenpruefer schreibt bei jedem Gate-Lauf

## Befund

(neu 2026-08-27).

  `[cmd]` **`tools/supplement-kern-dubletten-pruefen.mjs` schreibt
  `backup/c276/supplement-kern-dubletten.json` bei jedem Lauf neu** —
  nur `checked_at` aendert sich, der Inhalt bleibt (412 / 0 / 4
  Gruppen). **Damit erzeugt jeder Commit eine geaenderte Datei im
  Arbeitsverzeichnis**, weil der Pre-Commit-Hook das Gate faehrt.

  `[read]` **Das ist Rauschen, das jeden `git status` verunreinigt** —
  und ein Nachweis, der bei jedem Lauf einen neuen Stichtag traegt,
  belegt nicht mehr, wann er erhoben wurde.

  **Zu tun:** entweder nur bei Aenderung schreiben, oder nur mit
  ausdruecklichem Schalter — nicht bei jedem Gate.

## Auftrag — drei Werkzeugschaeden

**Mitbeauftragt: A-49, C-316.** Bericht in diese Datei.

`[read]` **Beauftragt am 2026-08-30.**

### 1 · G-202 — der Dublettenpruefer schreibt bei jedem Gate-Lauf

`[cmd]` **`backup/c276/supplement-kern-dubletten.json` aendert sich
bei jedem `pnpm gate`, weil nur `checked_at` neu gesetzt wird.**

`[read]` **Der Orchestrator setzt die Datei seit dem 27.08. vor jedem
Commit zurueck** — **dutzende Male, von Hand, in jedem Ablauf.**
`[cmd]` **Und Claude Code hat sie zweimal als fremde Aenderung
gemeldet**, weil sie im `git status` auftauchte, ohne dass jemand sie
angefasst hatte.

`[read]` **Ein Werkzeug, das bei jedem Lauf eine Datei aendert, ohne
dass sich etwas geaendert hat, erzeugt Rauschen** — und Rauschen
kostet Aufmerksamkeit, die anderswo fehlt.

`[read]` **Der Zeitstempel gehoert nicht in die Datei, oder die Datei
gehoert nicht ins Repo.** **Miss, was sie traegt, bevor du
entscheidest.**

### 2 · A-49 — der Attrappen-Waechter traegt eine veraltete Behauptung

`[read]` **Das ist A-62 in seiner ersten Erscheinung:** ein Waechter,
der eine Abwesenheit sichert, **und die Sache ist inzwischen da.**

`[cmd]` **Am 30.08. sind drei weitere Faelle aufgetreten** — eine
Karte, die *,,fehlt im Schema"* sagte, ein Waechter, der `lifecycle`
verbot, und einer, der seinen Beleg in einem Kommentar fand.

`[read]` **Miss, was dieser hier behauptet und ob es noch stimmt.**

### 3 · C-316 — NAC ohne deutschen Namen

`[cmd]` **Die Substanz steht im Katalog mit `slug = nac` und ohne
`name_de`.**

`[read]` **Kein Katalogausbau** — ein fehlender Name ist eine
Datenluecke, kein Ausbau. `[read]` **Und miss, ob es weitere gibt:**
eine einzelne fehlende Zeile ist ein Tippfehler, **zwanzig sind ein
Importfehler.**

### Was nicht zu tun ist

**Keine Namen erfinden** — was nicht belegt ist, bleibt leer.
**Kein Katalogausbau.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Dublettendatei       aendert sie sich noch bei jedem Lauf?
    Waechter A-49        was behauptet er, stimmt es
    Substanzen ohne      Zahl - einer oder viele?
      name_de
    Gate                 gruen, und der Baum bleibt sauber

`[read]` **Die letzte Zeile ist der eigentliche Nachweis fuer
G-202:** **nach diesem Auftrag soll `git status` nach einem
Gate-Lauf leer sein.**

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
**Wegwerf-Datenbank, Vollsicherung vor jedem Live-Eingriff.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

### 2026-08-30 - G-202, A-49 und C-316

#### G-202 - stabiler Dublettenbericht

`backup/c276/supplement-kern-dubletten.json` ist ein sinnvoller, versionierter
Nachweis: 412 Top-Level-Eintraege, 0 sichtbare Unterformen, 4
Dublettengruppen, davon alle 4 explizit erlaubt und 0 unbekannt. Allein
`checked_at` machte ihn bei jedem Lauf anders. Der Zeitstempel wurde daher aus
dem Bericht entfernt; das Werkzeug serialisiert den Befund und schreibt die
Datei nur noch, wenn sich diese Serialisierung gegenueber der vorhandenen Datei
unterscheidet.

Der neue Regressionstest ruft das Werkzeug mit einem Wegwerfbericht zweimal
auf: Kein `checked_at`, bytegleicher zweiter Lauf. Auch der normale Aufruf
gegen `backup/c276` war zweimal hintereinander erfolgreich und endete beide
Male mit demselben SHA-256-Hash
`C2A6791B27B55E27C9B29CBF4CF5275107FF191FD8C34482DCC14BA324A5E38F`.
Der Pruefer erzeugt damit keinen Gate-spezifischen `git status`-Eintrag mehr.

Der vollstaendige `pnpm gate`-Nachweis ist derzeit blockiert, bevor dieser
Pruefer erreicht wird: `node tools/punkte-index.mjs --pruefen` bricht mit
`docs/punkte/00-INDEX.md ist nicht auf dem Stand des Frontmatters` ab und
verlangt `--schreiben`. Das liegt ausserhalb dieses Auftrags und wurde nicht
geaendert. Ein komplett leerer Arbeitsbaum ist zudem hier nicht herstellbar:
es lagen bereits fremde Aenderungen unter `apps/` und `backup/` vor, und die
bewussten, nicht committeten G-202-Aenderungen selbst sind sichtbar. Der
nachweisbare Teil ist: Der Bericht blieb bei zwei normalen Laeufen unveraendert.

#### A-49 - Behauptung ueberholt

Der aktuelle Attrappen-Waechter behauptet nicht mehr, dass `SuppInteractions`
unangebunden sei. Er sichert jetzt den Rueckfall ab: Die entfernte Komponente
und `INTERACTIONS` duerfen nicht wieder auftauchen. Die Supplements-Ansicht
importiert und rendert fuer den Interactions-Reiter `InteractionsEchtTab` aus
`tab-interactions-echt.tsx`. Der gezielte Testlauf
`pnpm --filter @lumeos/web exec tsx --test src/components/shell/__tests__/v2-attrappen.test.ts`
war mit 87 von 87 Tests gruen. A-49 ist damit ueberholt; `apps/` wurde nicht
veraendert.

#### C-316 - kein einzelner NAC-Tippfehler

Die Messung der sichtbaren `substances` ergibt 412 von 412 mit leerem oder
NULL-`name_de`; zugleich haben alle 412 einen `name_en`. NAC ist also ein
sichtbares Beispiel (`slug = nac`, `name_en = NAC (N-Acetyl Cysteine)`), aber
nicht die einzige Luecke. Es handelt sich um eine vollstaendige
DE-Lokalisierungs-/Importluecke, nicht um einen einzelnen Katalogfehler.
Keine Namen wurden erfunden oder gesetzt und kein Katalog wurde erweitert.

## Abnahme

**2026-08-30, Orchestrator. Nachgemessen.**

`[cmd]` **G-202 behoben:** `checked_at` ist aus dem Bericht raus, das
Werkzeug schreibt die Datei nur noch bei echter Aenderung. `[cmd]`
**Zwei Laeufe, derselbe SHA-256.**

`[read]` **Und die Unterscheidung ist die richtige:** der Bericht
selbst ist ein sinnvoller Nachweis — 412 Eintraege, 0 sichtbare
Unterformen, 4 erlaubte Dublettengruppen. **Nur der Zeitstempel
machte ihn bei jedem Lauf anders.**

`[cmd]` **Der gemeldete Blocker war meiner:** `punkte-index.mjs
--pruefen` brach ab, weil ich den Index nicht geschrieben hatte.
**Nachgeholt, `--pruefen` gibt jetzt 0.**

`[read]` **Er hat es gemeldet statt umgangen, und ausserhalb seines
Auftrags gelassen.** Richtig.

### A-49 — ueberholt

`[cmd]` **Der Waechter behauptet nicht mehr, `SuppInteractions` sei
unangebunden** — er sichert jetzt den Rueckfall. `[cmd]` 87/87 Tests
gruen.

`[read]` **A-62 in seiner ersten Erscheinung, und sie hat sich
selbst erledigt.**

### C-316 — kein Tippfehler, sondern der ganze Katalog

`[cmd]` **412 von 412 sichtbaren Substanzen haben kein `name_de`.**
`[cmd]` **Alle 412 haben ein `name_en`.**

`[read]` **Meine Frage im Auftrag war: *,,eine Zeile ist ein
Tippfehler, zwanzig sind ein Importfehler"*.** **Die Antwort ist
eine dritte: alle.**

`[read]` **Und keine Namen erfunden** — genau wie vorgegeben. **Als
C-352 angelegt.**

**Abgenommen.**

