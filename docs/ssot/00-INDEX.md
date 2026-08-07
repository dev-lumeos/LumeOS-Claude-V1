# LumeOS — SSOT Index

**Stand:** 2026-08-01
**Gilt für:** `D:\GitHub\LumeOS-Claude-V1`

---

## Für neue Sessions: lies das zuerst

Dieser Ordner ist die einzige verbindliche Beschreibung des Ist-Zustands.
Wenn eine andere Datei im Repo etwas anderes behauptet, gilt diese hier —
ausser der Code selbst widerspricht.

**Rangfolge bei Widerspruch:**

1. Code (verifiziert per Befehl)
2. `docs/ssot/`
3. `docs/specs/` (beschreibt das Ziel, nicht den Ist-Zustand)
4. alles andere

---

## Was LumeOS ist

Ein Health & Performance Operating System. Kernprodukt ist **Buddy**,
ein AI-Companion; die Fachmodule liefern das Wissen, aus dem Buddy schöpft.

Vollständige Produktvision: `docs/specs/00_MASTER_VISION.md`.
Diese SSOT beschreibt **nicht** das Produkt, sondern was davon gebaut ist.

---

## Herkunftsmarker — Pflicht bei jeder Aussage

Jede Tatsachenbehauptung in diesem Ordner trägt einen Marker.
Ohne Marker ist eine Aussage ungültig.

| Marker | Bedeutung | Beispiel |
|---|---|---|
| `[cmd]` | Durch ausgeführten Befehl belegt, mit Datum | `[cmd]` pnpm typecheck 2026-08-01, 17/17 grün |
| `[read]` | Datei gelesen, Inhalt zitierbar | `[read]` apps/web/package.json |
| `[annahme]` | Ungeprüft, Vermutung, Übernahme aus älterem Dokument | `[annahme]` Curation-Tabellen stammen aus manuellem SQL |

**Regel:** Nur `[cmd]`-Aussagen dürfen in `CLAUDE.md` oder in Agent-Anweisungen
als Regel übernommen werden. `[annahme]` gehört auf die Todo-Liste, nicht in eine Regel.

**Warum diese Regel existiert:** Am 2026-07-30 lief eine Bestandsaufnahme ohne
funktionierende Shell. Sie schloss daraus, `services/` und `packages/` seien leer.
Der Satz wanderte ungeprüft in die Projektanweisung und galt dort als Regel.
Tatsächlich enthalten beide Ordner 17 kompilierende Packages.
Ein `[annahme]`-Marker hätte das verhindert.

---

## Inhalt dieses Ordners

| Datei | Beantwortet |
|---|---|
| `00-INDEX.md` | Diese Datei. Einstieg, Regeln, Rangfolge |
| `10-workspace.md` | Was liegt im Monorepo? Was lebt, was ist Gerüst, was ist Altlast? |
| `11-zielarchitektur.md` | Wie soll es am Ende aussehen? Welche Apps, welche Services? |
| `20-apps-web-ist.md` | Was kann `apps/web` heute wirklich? |
| `30-datenbank.md` | Welches Schema ist live? Welche Entwürfe liegen daneben? |
| `35-naehrwert-bezugsgroesse.md` | Worauf beziehen sich die Nährwerte, und wie rechnet man auf eine Menge um? (Grundlage jeder Diary-Rechnung) |
| `36-testbasis.md` | Was wird womit geprüft — und was ausdrücklich **nicht**? (Gate, Rechteprüfung, E2E-Entscheidung) |
| `40-spec-code-matrix.md` | Je Modul: Spec vorhanden? Code vorhanden? Delta? |
| `60-legacy-cloud.md` | Was liegt wirklich in der Legacy-Cloud-Instanz? (echte Zeilenzahlen, Medienverweise, Schemakonflikt — ersetzt alle Schätzungen) |
| `50-governance-rest.md` | Was ist vom alten Governance-System übrig und warum? |

**Was als Nächstes zu tun ist:** `docs/todo/TODO.md`
**Getroffene Entscheidungen:** `docs/spezifikation/90-entscheidungen/`
(D-06, 2026-08-06: `docs/decisions/` war nie befüllt — `[cmd]` einzige
getrackte Datei dort ist `.gitkeep`. Der Ort ist aufgelöst.)
**Sitzungsübergaben:** `docs/sessions/`

---

## Was hier NICHT steht

- **Produktspezifikation** → `docs/specs/` (13 Module, ~1,5 MB, Zielbild)
- **Design-System** → `docs/design-system/`
- **Historische Brainstorms** → `docs/BrainstormDocs/` (archiviert, keine Referenz)
- **Altlast Governance-Dokumentation** → `docs/_archive/`

---

## Pflege

Diese Dateien werden bei jeder Sitzung aktualisiert, in der sich etwas ändert.
Wer eine Aussage ändert, ändert auch ihren Marker und das Datum im Kopf der Datei.
Eine SSOT ohne Datum ist wertlos.
