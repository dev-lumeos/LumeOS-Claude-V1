---
nr: A-50
typ: feature
modul: recovery
schwere: mittel
angelegt: 2026-08-23
braucht: []
kind_von: G-160
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: OFFEN
beruehrt:
  dateien:
    - tools/gefallene-spalten-pruefen.mjs
zahlen: null
---

# A-50 - Ein `DROP COLUMN` prueft die Lesepfade nicht

## Befund

(neu
  2026-08-23). Aus G-160.

  `[cmd]` **`recovery.scores.acwr_used` ist seit C-215 gedroppt und
  seit C-226 live weg** — `scores-read.ts` hat sie trotzdem weiter
  selektiert. **Sechs Treffer im committeten Stand.** Gefunden hat es
  Fable in G-160, drei Tage spaeter, beim Anbinden einer Kachel.

  `[read]` **Die Luecke ist im Ablauf des Orchestrators:** er prueft
  Pipeline-Auftraege gegen die Datenbank — Spalten da, Zeilen stabil,
  Policies gezaehlt — **aber nie gegen die Lesepfade.** Ein
  `DROP COLUMN` braucht denselben `git grep`, den ein
  Tabellenname bekommt.

  `[cmd]` **Gegenprobe ueber alle gedroppten Spalten:** `acwr_used`,
  `enhanced_mode`, `enhanced_accepted_at`, `enhanced_age_verified`.
  **Nur `acwr_used` wurde je in `apps/web` gelesen.** Ein Fall, kein
  Muster — aber einer, der unbemerkt blieb.

  **Zu bauen:** die Regel in `CLAUDE.md` und ein Schritt in jedem
  Pipeline-Auftrag — wer eine Spalte entfernt, zaehlt vorher ihre
  Leser. Besser noch: eine Gate-Pruefung, die selektierte Spalten
  gegen den Sollstand haelt.

## Auftrag

**Mitbeauftragt mit G-102 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen** — **er laesst einen gesunden
Server stehen** (G-280, Gegenprobe: 18 Starts unveraendert).

`[read]` **`neustart` nur, wenn `start` nicht reicht** — **er beendet
den Server hart, und Tom arbeitet auf demselben Port.**

`[cmd]` **Codex fasst ihn nicht an** — die Regel steht seit
2026-08-30 in `CLAUDE.md`.

## Bericht

**Claude Code, 2026-08-31.** Mitbeauftragt mit G-281. **Der
vollstaendige Bericht steht in [G-281](supplements-g-0281-der-treffergrund-in-der-katalogsuche.md#bericht).**

### Gebaut: `tools/gefallene-spalten-pruefen.mjs`, im Gate

`[cmd]` **21 `DROP COLUMN` in der Pipeline, 20 ohne Wiederkehr.**

**Zwei Unterscheidungen entscheiden, ob der Waechter benutzbar ist:**

`[cmd]` **Wiederkehr:** `im_katalog` faellt in
`144_kimi_wave3_name_bridge.ts:91` **und wird zwei Zeilen weiter neu
angelegt.** Sie steht live. `[read]` **Wer nur `DROP` zaehlt, meldet
zwei saubere Lesewege als Fehler** — und wird abgeschaltet.

`[cmd]` **Tests sind keine Lesepfade:** der G-173-Waechter nennt
`acwr_used` viermal, um einen KOMMENTAR zu pruefen. `[read]` **Ein
Waechter, der einen Waechter meldet, erzieht dazu, ihn
abzuschalten.**

`[cmd]` **Gegengeprobt am historischen Fall:** `acwr_used` als
Lesefeld in `scores-read.ts` eingesetzt — **der Waechter meldet genau
die Stelle.** Rueckbau byte-gleich.

`[cmd]` **Heute sauber:** 20 Spalten, 372 Codedateien, kein lebender
Lesepfad darauf.

## Abnahme

**2026-08-30, mit G-281 abgenommen:** gebaut: `tools/gefallene-spalten-pruefen.mjs` im Gate, gegen den
historischen Fall geprueft.
