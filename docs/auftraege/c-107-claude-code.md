# C-107 + C-195 — Claude Code, 2026-08-23

Bericht: `docs/berichte/c-107-claude-code.md`

**VORBEREITET, NOCH NICHT FREIGEGEBEN.** Er setzt voraus, dass C-254
durch ist. Widerspricht dein C-254-Bericht etwas hier, kommt ein
**Korrekturblock oben drauf** — der Auftrag wird nicht neu geschrieben.

**Vorbemerkung, weil es sonst doppelte Arbeit gaebe:** Der
Orchestrator wollte hier zuerst **G-172** beauftragen (Deutsch,
Scrollbarkeit, ein Katalog). `[cmd]` **Das ist erledigt** — Commit
`d019b79` vom 2026-08-23, Test `deutsch-und-scroll.test.ts` **5 von 5
gruen**, selbst nachgefahren. Der Punkt stand nur noch offen im
Register. **Genau deshalb wird vor jedem Auftrag gemessen statt aus dem
Register abgeschrieben.**

---

## Der Katalog steht. Jetzt fehlt ihm der Inhalt.

Nach Schritt 4 liest die Oberflaeche `supplements.supplements` mit
`im_katalog`. `[cmd]` **290 Eintraege sichtbar, 276 verborgen.**

## WAS ICH GEMESSEN HABE — live, 2026-08-23

`[cmd]` Was am Eintrag haengt: `supplement_dosing` 566 ·
`supplement_pharmacology` 566 · `supplement_safety` 290 ·
`supplement_warnings` 290 · `supplement_wada` 290 ·
`supplement_quality` 237 · `supplement_lab_effects` 222 ·
`supplement_organ_risks` 1450 · `supplement_identifiers` 1226 ·
`supplement_regulatory` 1119 · `supplement_interactions` 78 ·
`supplement_monitoring` 46 · `supplement_nutrients` 17.

`[cmd]` **`supplement_evidence` traegt seit C-248 alle 290
Evidenzgrade** — vorher 259, weil der Import Grad `E` abwies.

`[read]` **Der Punkt C-107 fragt, was dem Katalog fehlt.** Er ist am
2026-08-19 geschrieben worden, gegen einen Bestand von 44 Zeilen.
**Lies ihn pruefend** — ein Teil davon ist durch den Neuaufbau
beantwortet, ein Teil nicht. **Was beantwortet ist, meldest du als
beantwortet, statt es nochmal zu bauen.**

`[read]` **C-195** wollte `substance_catalog` auf Kimi-Tiefe bringen.
`[cmd]` **Die Tabelle wird nach C-255 entfernt.** Der Punkt gilt jetzt
fuer `supplements.supplements` und seine Detailtabellen — **pruef, was
davon der Neuaufbau schon erfuellt.**

## WAS ZU TUN IST

1. **Erst messen, dann bauen.** Fuer C-107 und C-195: welcher Teil ist
   durch den Neuaufbau erledigt, welcher nicht? **Zahl je Teil.**

2. **Was offen bleibt, im Detail sichtbar machen** — die
   Detailtabellen tragen Inhalt, den die Oberflaeche heute nicht zeigt.
   **Welche, entscheidest du nach der Messung; begruende die Auswahl im
   Bericht.**

3. **Rueckfall-Logik nach C-254** — jedes Textfeld, nicht nur
   `name_de`. `[cmd]` `summary_de` 0/288, `metabolism_de` 0/290,
   `storage_de` 0/54.

4. **Wo ein Feld leer ist, steht ein Hinweis, keine Zahl.** `[cmd]`
   276 Eintraege tragen gar keinen Inhalt — sie sind ueber
   `im_katalog` ausgeblendet, aber die 290 sichtbaren haben je nach
   Feld ebenfalls Luecken.

## WAS NICHT ZU TUN IST

**`im_katalog` nicht umgehen.** Die 276 bleiben verborgen — das ist
Toms Entscheidung C aus C-243.

**Keine Salzform-Entscheidung** (C-244, offen bei Tom).
**Keine deutschen Texte erfinden** (C-254).

`supabase/_pipeline/` **nicht anfassen** — Codex entfernt dort gerade
die alten Kataloge (C-255).
`apps/web/src/app/v2/recovery` und `apps/coach/` **nicht anfassen** —
Fable.

Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## NACHWEIS — Erwartung VOR dem Lauf, beide Richtungen

**Je Teil, den du als erledigt meldest: die Zahl, die es belegt.**

**Gegenprobe:** ein Eintrag mit vollem Detail und einer mit Luecken —
beide namentlich, beide muessen richtig anzeigen.

**Negativprobe:** ein Detailfeld kappen; die Pruefung muss rot werden.
`[read]` **Zum dritten Mal derselbe Hinweis, weil es zweimal passiert
ist:** eine Pruefung, die mit ihrem Gegenstand verschwindet, misst
nichts.

`node tools/schuss.mjs` — nach G-175 auf `test-user@lumeos.local`.
Vorher auf `dev@lumeos.app` mit Vermerk.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Bauen ueber `pnpm --filter @lumeos/web build`.
Pruefschleifen als Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`.
Repo-Text mit Sonderzeichen nicht ueber die Standardeingabe einer
interaktiven Sitzung schreiben.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
