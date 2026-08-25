# G-187 — Claude Code, 2026-08-25

Bericht: `docs/berichte/g-187-claude-code.md`

**Die letzte markierte Kachel im Supplements-Modul.**

---

## Der Stand

`[cmd]` **`tabs.tsx` traegt noch genau eine `attrappe={ATTRAPPE}`** —
Zeile 862, der Wechselwirkungs-Block. `[cmd]` Der Reiter *„Wechsel­
wirkungen"* zeigt im Kopf eine **1**.

`[cmd]` **Die Daten liegen seit C-262 vor:**
`supplement_interactions` **78 Zeilen** · `supplement_lab_effects`
**222 Zeilen auf 90 Substanzen** · `entity_cyp` **816 mit
`entity_type='supplement'`** plus 295 Performance Compounds ·
`entity_transporters` **135**.

`[read]` **Claude Code hat sie in G-186 bereits im Detail
angebunden** — als Block in der Sicherheit, nicht als eigener Reiter,
**weil sie nur 121 von 318 Substanzen betreffen.** Diese Entscheidung
gilt weiter.

`[read]` **Hier geht es um etwas anderes:** der eigene
Wechselwirkungs-Reiter zeigt die Paare **zwischen den Substanzen im
Stack des Nutzers** — nicht die Eigenschaften einer einzelnen Substanz.

## WAS ZU TUN IST

### 1 · Der Reiter liest den Stack gegen die Interaktionen

`[cmd]` `supplements.stack_items` traegt **11 Zeilen, 6 mit
`supplement_id`.** Auf `test-user@lumeos.local` sind es drei
Positionen.

**Fuer jedes Paar im Stack pruefen, ob es in
`supplement_interactions` steht.**

`[read]` **Miss zuerst, wie viele Paare bei den vorhandenen Staenden
tatsaechlich treffen.** `[cmd]` Bei drei Positionen sind es drei Paare
— **triffst du null, ist der Nachweis am Nachweiskonto nicht
fuehrbar**, und du meldest das, statt eine Anzeige ohne Beleg zu
bauen.

### 2 · Die Kachel entweder anbinden oder mit Grund markieren

`[read]` **Beides ist zulaessig, aber nicht das, was heute dasteht.**
Die Marke sagt seit C-68, es gebe kein `supplements`-Schema — **das
stimmt seit C-232 nicht mehr.**

`[cmd]` **Wenn du sie markiert laesst, muss die Begruendung gemessen
sein**, wie in G-161: nicht *„noch nicht angebunden"*, sondern
*„`supplement_interactions` traegt 78 Paare, davon treffen 0 auf den
Stack des Nutzers"*.

### 3 · Die Kopfzahl stimmt oder verschwindet

`[cmd]` Der Reiter zeigt **1**. **Woher die Zahl kommt, ist zu
messen** — wenn sie aus einer Konstante stammt, faellt sie unter den
G-163-Beschluss.

## WAS NICHT ZU TUN IST

**Keine Wechselwirkung erfinden.** `[read]` Eine ausgedachte Warnung
ist schlimmer als keine — sie sieht aus wie eine geprueufte.

**Keinen zweiten Lesepfad bauen.** `lib/supplements/` traegt bereits
`stack-read.ts` und `substanz-read.ts`.

**Kein Reiter, der bei den meisten leer ist** — dieselbe Regel, die du
in G-186 auf die Lab-Effects angewandt hast. **Wenn der Reiter fast
immer leer ist, gehoert der Inhalt woandershin, und du schlaegst vor,
wohin.**

`supabase/_pipeline/` nicht anfassen — Codex arbeitet an C-270.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

**Zahl der treffenden Paare je Konto** — `test-user@lumeos.local` und
ein zweites, falls dort mehr liegt. **Vor dem Bau hinschreiben.**

`node tools/schuss.mjs`: Reiter mit Treffern und Reiter ohne.

**Negativprobe:** ein Paar aus der Tabelle nehmen, die Anzeige muss es
verlieren. **Und die Verdrahtung bewachen, nicht nur die Funktion** —
`[read]` das war in G-186 dreifach dein blinder Fleck, und du hast es
selbst ausgeschrieben.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Feste Kachelbreiten wie in G-181, **kein `1fr` ohne `max-width`.**
Nachweise auf `test-user@lumeos.local`.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
