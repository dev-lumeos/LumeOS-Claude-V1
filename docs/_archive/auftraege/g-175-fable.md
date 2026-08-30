# G-175 — Fable, 2026-08-23

Bericht: `docs/berichte/g-175-fable.md`

**Das ist der teuerste offene Punkt**, weil er jeden weiteren Auftrag
verteuert: solange kein Agent sich auf `test-user@lumeos.local`
anmelden kann, laufen alle Browser-Nachweise auf dem falschen Konto.

---

## WAS ICH GEMESSEN HABE

`[cmd]` Das dokumentierte Passwort `LumeosTestUser2026` passt nicht
mehr. `updated_at` auf dem Konto steht auf **2026-08-23 09:42**.
Bei `dev@lumeos.app` passt es noch (09:21 geaendert).

`[cmd]` **Betroffen sind die Nachweisskripte** `_g154`, `_g166`,
`_g167` — sie tragen das Wort fest verdrahtet und laufen so nicht.

`[read]` **Wer den Hash geaendert hat, ist offen.** Der Orchestrator
hatte dir das zugeschrieben; du hast widersprochen und ihn nicht
getauscht. Die Zuschreibung war eine Schlussfolgerung aus `updated_at`,
keine Messung. **Sie steht als Fehler im Punkt.**

## WAS ZU TUN IST

1. **Ein festes, bekanntes Passwort fuer `test-user@lumeos.local`**,
   hinterlegt so, dass `tools/schuss.mjs` es findet — `LUMEOS_WORT`
   oder der Weg, den `schuss.mjs` heute schon vorsieht. **Sieh nach,
   wie es dort gelesen wird, bevor du etwas neues baust.**

2. **Setzen gehoert in die Kette**, nicht in einen Einmalbefehl —
   sonst ist es nach dem naechsten Neuaufbau wieder weg. Die
   Testdaten-Schritte liegen unter `supabase/_pipeline/_testdaten/`.

3. `_g154`, `_g166`, `_g167` auf den hinterlegten Weg umstellen. **Kein
   fest verdrahtetes Wort mehr in einem Skript.**

4. **Der Kopierschritt faellt damit weg.** Er war die eigentliche
   Fehlerquelle: solange jeder Agent sich sein Konto selbst
   zurechtbiegt, ist der naechste Zusammenstoss eine Frage der Zeit.

## WAS NICHT ZU TUN IST

`dev@lumeos.app` **nicht anfassen** — dort haengen Toms gespeicherte
Einstellungen.

`supabase/_pipeline/` gehoert sonst Codex; **fuer die Testdaten-Schritte
bist du hier zustaendig, aber nur dafuer.** Wenn die Aenderung darueber
hinausreicht: melden und stehen lassen.

Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## NACHWEIS — beide Richtungen

`node tools/schuss.mjs` auf einer beliebigen v2-Seite, angemeldet als
`test-user@lumeos.local`, **ohne Kopierschritt.** Bild als Beleg.

**Gegenprobe:** ein falsches Wort muss scheitern, nicht still auf ein
anderes Konto ausweichen. `[read]` **Ein Nachweis, der bei falschem
Passwort trotzdem ein Bild liefert, misst nichts.**

**Und nach einem Kettenlauf auf der Wegwerf-Datenbank muss die
Anmeldung weiterhin gehen** — sonst ist Punkt 2 nicht erfuellt.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Wegwerf-Datenbank zum Pruefen, danach verwerfen.
Repo-Text mit Sonderzeichen nicht ueber die Standardeingabe einer
interaktiven Sitzung schreiben.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
