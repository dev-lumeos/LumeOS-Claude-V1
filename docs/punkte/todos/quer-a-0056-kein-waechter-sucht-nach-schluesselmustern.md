---
nr: A-56
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien:
    - .gitignore
zahlen:
  gemessen: 2026-08-28
  getrackte_dateien_mit_echtem_key: 0
---

# A-56 — kein Waechter sucht nach Schluesselmustern

## Berichtigung des urspruenglichen Befunds

`[read]` **Ich hatte gemeldet, ein Anthropic-Schluessel stehe im
Klartext in einer getrackten und gepushten Datei.** `[cmd]` **Das war
falsch.**

`[cmd]` **Was tatsaechlich dort steht**, in
`docs/_archive/.../coach_MIGRATION.md`, Zeile 376:

    ANTHROPIC_API_KEY=sk-ant-api03-...
    ZAI_API_KEY=2571478a2adb4b8d...

`[read]` **Abgeschnitten mit drei Punkten, in einem
Beispiel-`.env`-Block einer Migrationsanleitung.** Kein Schluessel,
ein Platzhalter.

`[read]` **Mein Fehler:** `git grep -l 'sk-ant-api03'` gefunden, **den
Kontext nicht gelesen.** `[read]` **Teurer als eine falsche Zahl** —
haette Tom der Empfehlung folgen wollen, haette er einen
funktionierenden Schluessel wegen eines Platzhalters rotiert.

## Was bleibt

`[cmd]` **In `referenz/lumeos-2026/src/api/shared/claude-vision.ts`
steht ein vollstaendiger Schluessel** — kein Platzhalter.

`[cmd]` **Die Datei ist per `.gitignore:175` ausgeschlossen und war
nie im Repo.** `[read]` **Er ist also nicht oeffentlich — aber er
liegt im Klartext auf der Platte, und wenn das Vorgaengerrepo je
woanders lag, ist er dort mitgegangen.**

`[read]` **Ob er noch gueltig ist, weiss nur Tom.**

## Der eigentliche Befund

`[cmd]` **`pnpm gate` prueft Encoding, Nummern, Verdrahtung,
Migrationen, Punkte, Serverimporte, Sprachrueckfall, Kataloganker,
Dubletten und Kennungen** — **und nichts sucht nach
Schluesselmustern.**

`[read]` **Ein Waechter dafuer haette beide Faelle sofort
unterschieden:** der eine endet auf `...`, der andere ist 108 Zeichen
lang. **Ein Muster mit Laengenpruefung trennt Platzhalter von
Schluessel, ohne dass jemand den Kontext lesen muss.**

**Zu suchen waere nach:** `sk-ant-`, `sk-`, `eyJ` (JWT),
`SUPABASE_SERVICE_ROLE`, `service_role` — **mit Mindestlaenge und
einer Ausnahmeliste fuer Beispielbloecke.**

`[read]` **Und `docs/_archive/` steht in der Liste *,,nicht als
Referenz lesen"*.** Ein Waechter liest trotzdem — **genau dort, wo
niemand hinsieht.**
