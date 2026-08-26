# G-184 — Claude Code, 2026-08-26

Bericht: `docs/berichte/g-184-claude-code.md`

**Die WADA-Kachel sagt nicht, fuer wen sie gilt.** Seit C-272 steht die
Antwort in der Datenbank.

**Tom, 2026-08-25:** *„WADA verboten gilt das auch fuer bodybuilding?"*

---

## Der Stand

`[cmd]` **`note_de` ist bei 320 von 320 gefuellt** — vorher 0.

    prohibited      145   alle mit wada_category
    not_prohibited  172
    monitored         3

`[cmd]` **Beispiel Kreatin:** *„Steht nicht auf der WADA-Verbotsliste
und ist dopingrechtlich in keinem Verband verboten — weder in
WADA-Code-Signatar- bzw. WADA-testenden Ligen (NADOs, IPF, IFBB,
Natural-Verbaende wie INBA/PNBA, WNBF...)"*

`[read]` **Die Ligen stehen namentlich drin, mit verifizierten
Quellen.** Genau das, was ich Tom als `[wahrscheinlich]` gesagt und
ausdruecklich **nicht** anzeigen lassen wollte — **jetzt ist es
belegt.**

`[cmd]` **Und die Antwort ist genauer als meine Vermutung:** die
Natural-Ligen fuehren **eigene, teils weitergehende Sperrlisten**
(DHEA, Ephedrin, 7-Keto) mit Sperrfristen bis zehn Jahre. NPC und IFBB
Pro testen **bei ausgewiesenen Natural-Wettkaempfen**, sonst nicht.

`[cmd]` **Die Kachel sagt seit G-182 *„im getesteten Wettkampf"***
— das war die Sofortmassnahme und ist richtig. **Der Satz dahinter
fehlt.**

## WAS ZU TUN IST

### 1 · `note_de` anzeigen

`[read]` **Nicht in die Kachel.** `[cmd]` Der Kreatin-Text ist ueber
200 Zeichen — **eine Zahlenkachel traegt das nicht**, und G-191 hat
gerade gezeigt, was passiert, wenn Fliesstext dort landet.

**Wohin, entscheidest du und begruendest es.** `[read]` Zwei Wege:
unter der Kachelzeile als eigener Block, oder aufklappbar an der
Kachel. **Miss die Laengen, bevor du waehlst** — wenn der laengste
Text drei Zeilen fuellt, ist ein Block richtiger als ein Aufklapper.

### 2 · Die Kategorie gehoert dazu

`[cmd]` **Bei allen 145 verbotenen liegt `wada_category` vor** — S1.1,
S2, S4.1, S0.

`[read]` **Die Kategorie ist keine Zierde:** S0 heisst *nicht
zugelassene Substanz*, S1.1 *anaboles Steroid*, S4.1 *Aromatasehemmer*.
**Wer die Kategorie kennt, versteht, warum etwas verboten ist.**

`[cmd]` Bei `not_prohibited` steht sie nur bei 3 von 172 — **dort
entfaellt sie.**

### 3 · Drei Zustaende, nicht zwei

`[cmd]` **`monitored` gibt es dreimal** — Substanzen auf dem
Beobachtungsprogramm, weder erlaubt noch verboten.

`[read]` **Heute faellt das vermutlich unter *„erlaubt"***, und das ist
falsch. **Miss, wie die Kachel den Zustand heute abbildet**, und nenn
die drei Substanzen im Bericht.

## WAS NICHT ZU TUN IST

**Keinen Text kuerzen, keinen umschreiben.** `[read]` Die Saetze
tragen Quellen — wer sie strafft, loest die Belegkette.

**Nichts ueber Verbaende ergaenzen, was nicht in `note_de` steht.**
`[read]` Das war die Regel in G-182, und sie gilt weiter: **was ich
ueber IFBB und NPC gesagt habe, war `[wahrscheinlich]`.** Was jetzt
angezeigt wird, ist belegt — **die Erweiterung um eigenes Wissen waere
wieder eine Vermutung.**

`supabase/_pipeline/` nicht anfassen — Codex arbeitet an C-280.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

**Laengenverteilung von `note_de`** — min, median, max. **Vor dem Bau
hinschreiben**, sie entscheidet ueber die Darstellung.

**Gegenprobe an vier namentlich genannten:** ein S1.1-AAS · Kreatin
(`not_prohibited`, langer Text) · eine der drei `monitored` · **eine
Substanz ohne `supplement_wada`-Zeile** — `[cmd]` es gibt 92 davon bei
412 sichtbaren, **dort darf nichts erscheinen.**

**Negativprobe:** `note_de` leeren — der Block muss verschwinden, nicht
leer dastehen.

`node tools/schuss.mjs`, `test-user@lumeos.local`, **1280 und 1920.**

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Feste Kachelbreiten wie G-181, **kein `1fr` ohne `max-width`.**

`[cmd]` **Der Dev-Server laeuft auf PID 351936** — Tom sieht sich den
Katalog an. **Nicht neu starten.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
