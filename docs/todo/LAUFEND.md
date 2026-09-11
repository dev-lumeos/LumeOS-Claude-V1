# Laufende Auftraege

**Stand: 2026-09-08, 19:40**

| Agent | Nr | Inhalt | raus seit |
|---|---|---|---|
| Codex | C-467 | Lieferantenprodukte ? vier Tabellen | 19:35 |
| Claude Code | G-413 | Filtersuche ohne Suchbegriff | 19:10 |

---

## Bereich je Agent

    supabase/_pipeline/          Codex
    apps/web/src/app/v2/         Claude Code
    apps/coach/src/              Claude Code
    packages/ui, packages/scoring  Claude Code (mit Gegenprobe)
    docs/                        Orchestrator

---

## Was als naechstes wartet

**Codex:**

    C-460   welcher Coach fuer welches Modul
    C-466   Naehrstoffe aus Supplementen -- wartet auf C-467

**Claude Code:**

    G-414   admin und coach teilen 65 Prozent
    G-418   Seed-Tage in der Zukunft
    G-399   der Trenner und die Tokens, zweite Haelfte

**Tom:**

    C-451   die Aufnahme eines Coaches
    C-460   die vier Coach-Typen
    G-403   Trenner und Tokens: apps/web erlauben?
    G-408   Bilder liegen nur lokal

---

## Die Regel seit heute

`[cmd]` **Ein Auftrag, ein Bericht.**

`[read]` **Ketten sind erlaubt, aber sie melden EINMAL am Ende** ?
**kein Zwischenstand.**

`[cmd]` **Und: nichts laeuft losgeloest im Hintergrund** ? **ausser
`tools/server.py start`, das ein Log schreibt.**
