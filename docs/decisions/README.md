# docs/decisions/ — aufgelöst (D-06, 2026-08-06)

**Hier liegen keine Entscheidungen. Der ADR-Ort ist**
**`docs/spezifikation/90-entscheidungen/`.**

## Warum dieser Ordner leer ist

`[cmd]` 2026-08-06: Die einzige getrackte Datei hier war `.gitkeep` —
der Ordner wurde angelegt, aber nie befüllt. Parallel entstand der reale
ADR-Bestand unter `docs/spezifikation/90-entscheidungen/`.

Die Wahl fiel auf `90-entscheidungen/`, weil dieser Ort in der lebenden
Spezifikationsstruktur verankert ist:

| Verweis | Datei |
|---|---|
| Ordnerübersicht der Spezifikation | `docs/spezifikation/00-INDEX.md` |
| Systemarchitektur (zwei Stellen) | `docs/spezifikation/10-plattform/architektur/00-systemarchitektur.md` |
| Modulvorlage | `docs/spezifikation/_vorlagen/modul.md` |

`[cmd]` Die Verweise auf `docs/decisions/` stammen dagegen ausnahmslos aus
totem Bestand: archivierte Governance-Skills (`.claude/skills/`,
`.agents/skills/`), `CLAUDE.md.v1.bak`, `_archive/governance/`,
`docs/prompts/`, der Repomix-Abzug und die Obsidian-Spiegelung. Kein
lebender Pfad schrieb hierher.

## Was das für ADRs bedeutet

- Neue ADRs entstehen in `docs/spezifikation/90-entscheidungen/`,
  benannt `ADR-NNNN-<slug>.md`.
- Modulspezifische ADRs bleiben, wo sie sind:
  `docs/specs/Nutrition/04_adrs/` (12 Stück).
- Das historische Register liegt unter
  `docs/_archive/ist-zustand/04-adr-liste.md` — Herkunft, kein Sollwert.

## Zur Nummerierung

Das historische Register zählte `ADR-002`/`ADR-003`; die Dateien im
Zielordner tragen vierstellige Nummern (`ADR-0001` ff.). Gemeint ist
dasselbe:

| Register | Datei | Thema |
|---|---|---|
| ADR-002 | `ADR-0002-preferences-tabellendesign.md` | Tabellendesign der Preferences |
| ADR-003 | `ADR-0003-diary-naehrstoffmodell.md` | Diary: EAV gegen flachen Entwurf |

`ADR-004` des Registers (DB-Zugriffspattern) ist inhaltlich in
`ADR-0001-datenzugriff.md` aufgegangen.

Dieser Ordner bleibt vorerst bestehen, damit der Verweis auffindbar ist.
Ob er samt `.gitkeep` entfällt, entscheidet Tom (A-05-Nachbarschaft).
