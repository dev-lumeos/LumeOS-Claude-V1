# G-195 — Claude Code, 2026-08-26

Bericht: `docs/berichte/g-195-claude-code.md`

**Ein eigener Reiter „Rechtslage" statt zweier halber Bloecke.**

**Tom, 2026-08-26:** *„wuerde es nicht sinn machen wada als eigenen
reiter zu haben anstatt das ganze bild zu zerstoeren?"* Und zur
Position: *„am ende reiter vor quellen, das ist alles nice to have
aber wird kaum einen interessieren, deswegen macht ein eigener reiter
sinn anstatt halbherzig was in ueberblick und was in dosierung."*

---

## Vorweg: meine Zahlen sind Ausgangsvermutungen

**Neue Regel seit heute, `docs/auftraege/00-LIESMICH.md`:**

`[read]` **Jede Zahl unten stammt aus einer Messung von mir. Pruef sie
zuerst. Weicht deine ab, gilt deine — und du nennst beide.**

`[cmd]` **Der Grund:** in vier Tagen lagen sechs meiner Auftragszahlen
falsch, jedes Mal weil die Abfrage den falschen Ausschnitt traf.
`im_katalog::text` gegen `'t'` statt `'true'`. Dublettenprobe auf
`name_en` statt auf den Kern. `upper_limit` gegen 290 statt 412 Zeilen.
**In fuenf von sechs Faellen hat der Agent es gefunden, nicht ich.**

## Meine Messung, zu pruefen

    note_de gefuellt              320 von 412
    rechtslage_klartext_de        136
    wada_category                 145 (bei den prohibited)
    note_de Median                387 Zeichen, max 818

**Abfragen, mit denen das entstand:**

    select count(*) filter (where coalesce(btrim(note_de),'')<>'')
    from supplements.supplement_wada

`[read]` **Achtung, hier steckt schon ein moeglicher Fehler:** ich habe
gegen `supplement_wada` gezaehlt, **nicht gegen die sichtbaren 412**.
`[cmd]` Die Tabelle hat seit C-281 **337 Zeilen**, davon 17 geerbt.
**Miss selbst, wie viele der 412 sichtbaren Substanzen tatsaechlich
einen Rechtslage-Reiter bekaemen.**

## WAS ZU TUN IST

### Ein Reiter, drei Inhalte

    note_de                   der Geltungsbereich
    wada_category             die Kategorie, wo vorhanden
    rechtslage_klartext_de    die Rechtslage je Land

`[read]` **Ein Thema, nicht drei Felder:** WADA ist eine Rechtsfrage,
keine Wirkungsfrage. Sie steht neben *Rechtslage*, nicht neben *Wie es
wirkt*.

### Position vor „Quellen"

`[read]` **Toms Begruendung, und sie ist der eigentliche Grund:** wer
wissen will, **ob** ein Stoff erlaubt ist, sieht die Kachel. Wer die
Ligen und Paragraphen liest, **sucht sie gezielt.** **Halb im
Ueberblick, halb in der Dosierung heisst: fuer beide am falschen
Ort.**

### Die Kachel bleibt im Ueberblick

`[read]` Sie sagt in drei Worten, ob erlaubt oder verboten. **Der Satz
dahinter wandert.**

### Die Farben kommen aus G-196

`[cmd]` `--acc-suppl` fuer *pruefen*, `--warn` fuer *gefahr*,
`--pos` fuer *entwarnung*. **Nicht neu erfinden.**

`[read]` **Und ein Fall wartet dort auf dich:** `[cmd]` der WADA-Block
liegt bei **4.32 Kontrast**, weil `.v2-supp-tafel` im Hellmodus rosa
getoent ist (`[253,247,249]`, nicht weiss). **Nicht die Toenung ist
das Problem, der Grund ist es** — als **G-197** angelegt. **Miss, ob
der Umzug es loest.** Wenn ja, faellt G-197 weg; wenn nein, sag es.

## WAS NICHT ZU TUN IST

**Keinen Text kuerzen.** `[read]` Die Saetze tragen Quellen — wer sie
strafft, loest die Belegkette.

**Nichts ueber Verbaende ergaenzen, was nicht in `note_de` steht.**

**Kein siebter Reiter.** `[cmd]` Nachher sind es sechs — Ueberblick,
Dosierung, Sicherheit, Community, Rechtslage, Quellen. **Ab sieben
sucht man**, und der naechste Zuwachs waere eine eigene Entscheidung.

`supabase/_pipeline/` nicht anfassen — Codex arbeitet dort.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

**Deine Zahlen neben meinen.** `[read]` Wo sie abweichen: **deine
gelten, und beide stehen im Bericht.**

**Bei wie vielen der 412 erscheint der Reiter?** Und **bei wie vielen
bleibt der Ueberblick danach kuerzer** — das war Toms Anlass.

**Gegenprobe an vier namentlich genannten:** ein S1.1-AAS · Kreatin
(langer Text, `not_prohibited`) · eine der drei `monitored` ·
**eine Substanz ohne `supplement_wada`-Zeile und ohne Rechtslage** —
dort darf der Reiter nicht erscheinen.

**Negativprobe:** beide Felder leeren — der Reiter muss verschwinden,
nicht leer dastehen.

`node tools/schuss.mjs`, **beide Themen**, 1280 und 1920.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.

`[cmd]` **Der Dev-Server laeuft auf PID 351936.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
