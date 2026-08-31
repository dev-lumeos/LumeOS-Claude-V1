---
nr: C-318
typ: befund
modul: coach
schwere: hoch
angelegt: 2026-08-27
braucht: []
kind_von: A-37
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
erledigt: 2026-08-31
commit: fcd36338
beruehrt:
  tabellen: [coach.client_permissions]
zahlen: null
---

# C-318 - ADR-Coach-Permissions weicht von der Umsetzung ab

## Befund

ADR_COACH_PERMISSIONS_V1 verlangt Freigabe pro Modul und Subfunktion; gebaut ist nur die Modulstufe. Die offene Produktfrage liegt in A-43.

## Auftrag — zwei Werkzeug- und Schemabefunde

**Mitbeauftragt: B-20.** Bericht in diese Datei.

**Beauftragt am 2026-08-30.**

### 1 · C-318 — der ADR weicht von der Umsetzung ab

`[cmd]` **Heute hast du in A-37 gemessen, dass
`ADR_COACH_PERMISSIONS_V1` durch E-11 und E-29 teilweise abgeloest
ist.** `[cmd]` **Der Vermerk steht seit C-357 im Kopf des ADR.**

`[read]` **Dieser Punkt ist aelter und nennt eine Abweichung zwischen
ADR und Umsetzung.** **Miss, ob es dieselbe ist** — **dann ist er
erledigt.**

`[read]` **Wenn nicht: sag, welche Abweichung bleibt.** `[cmd]`
**`client_permissions` und `client_autonomy` sind live, und
`coach.darf_nutrition_plan_aendern()` liest sie.**

### 2 · B-20 — Codex-Pfadschutz wiederherstellen

`[read]` **Miss zuerst, was der Schutz war und ob er fehlt.** `[cmd]`
**Der Punkt ist aelter als die Punktverwaltung** — **`.codex/` steht
in `CLAUDE.md` unter *nicht als Referenz lesen*.**

`[read]` **Wenn der Schutz an einer Stelle liegt, die es nicht mehr
gibt: schliessen.** **Wenn er fehlt und gebraucht wird: sagen,
wofuer.**

### Was nicht zu tun ist

**Keinen ADR aendern** — C-357 hat die Vermerke gesetzt.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    C-318 gegen A-37    dieselbe Abweichung? belegt
    was bleibt          benannt
    B-20                Schutz vorhanden / fehlt / gegenstandslos

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `server.py neustart`, kein `start`, kein
`aufraeumen`.** `[read]` **Wenn eine Messung ihn braucht: melden,
nicht starten.**

## Bericht

**Gemessen am 2026-08-31 auf `dev`; keine ADR-, Hook- oder App-Aenderung.**

| Punkt | Urteil | Nachweis |
|---|---|---|
| C-318 | **erledigt - derselbe Befund** | A-37 misst exakt dieselbe Feinstufen-Abweichung; C-357 hat den ADR-Vermerk gesetzt. |
| B-20 | **offen** | Die Schutzpfade existieren, Codex hat aber keinen verifizierten Pfadschutz. |

### C-318 - dieselbe Abweichung wie A-37

Der alte ADR verlangt Freigaben je Modul **und Subfunktion**, etwa
`nutrition.diary`, `nutrition.water` und `nutrition.mealcam_images`.
Die Live-Tabelle `coach.client_permissions` hat dagegen je Modul genau
eine Sichtbarkeitsstufe (`nutrition_visibility` bis `buddy_visibility`)
und einen `*_auto_apply`-Schalter. Es gibt weder Spalten noch eine
Unterstruktur fuer Nutrition-Subfunktionen.

Das ist wortgleich der in A-37 gemessene Befund, nicht eine zweite
Abweichung. E-11 legt die Modulstufe fest; E-29 verlangt fuer den
moduluebergreifenden Zugriff die Coach-Funktion. Beides ist live:
`coach.darf_nutrition_plan_aendern()` prueft die Nutrition-Modulrechte
und den Autonomy-Level, `coach.offene_aktionen(p_modul)` liest Pending
Actions nur fuer den angemeldeten Klienten und das angeforderte Modul.

Der Kopfvermerk in `ADR_COACH_PERMISSIONS_V1` nennt E-11/E-29 seit C-357
und laesst nur das Suggestions-Kapitel weiter gelten. C-318 ist damit
dokumentarisch und fachlich erledigt; eine verbleibende
Permissions-Abweichung wurde nicht gefunden.

### B-20 - Schutz fehlt weiterhin, und die zu schuetzenden Ziele leben

`.codex/hooks.json` hat nur zwei lean-ctx-`PreToolUse`-Hooks (Bash und
Lese-Werkzeuge), keine Regel fuer Pfadschutz. Die vorhandene
`.claude/hooks/protect-paths.ps1` ist kein Ersatz: Sie ist in der
Konvention ausdruecklich auf Claude Code beschraenkt und erwartet dessen
Werkzeugnamen sowie stdin-JSON. Sie schuetzt dort `.env*` und schreibende
Zugriffe auf `supabase/migrations/`, nicht `supabase/config.toml` oder
`.claude/rules/`.

Alle drei im Altpunkt genannten Ziele existieren weiterhin:
`supabase/config.toml`, `db/migrations/` (2 Dateien) und `.claude/rules/`
(7 Dateien). Die fruehere, nur messende `scratchpad/codex-sonde.ps1`
liegt heute nicht mehr vor. Ohne diese Sonde ist nicht belegt, welches
Payload-Format Codex an einen Hook uebergibt; ein Einhaengen wuerde daher
weiterhin nur scheinbaren Schutz erzeugen.

B-20 ist nicht gegenstandslos: Diese Pfade steuern Datenbankverbindung,
Schema-/Migrationsbestand bzw. Agentenregeln. Erst die erneute,
nicht-blockierende Messung des Codex-Hook-Payloads kann sagen, ob der
vorhandene Schutz angepasst werden kann oder ein eigener Adapter noetig
ist. Bis dahin bleibt die manuelle Schutzregel bestehen; nichts wurde
eingehängt.

## Abnahme

**2026-08-31, Orchestrator.**

`[cmd]` **Derselbe Befund wie A-37 — durch C-357 erledigt.** `[cmd]`
**Der Abloesungsvermerk steht seit dem 30.08. im Kopf von
`ADR_COACH_PERMISSIONS_V1`.**

`[read]` **Der Punkt war aelter und beschrieb dieselbe Abweichung.**

`[cmd]` **B-20 bleibt offen: Codex hat keinen verifizierten
Pfadschutz.** `[read]` **Das ist eine ehrliche Meldung** — er haette
sagen koennen, der Punkt sei gegenstandslos.

**Abgenommen.**

