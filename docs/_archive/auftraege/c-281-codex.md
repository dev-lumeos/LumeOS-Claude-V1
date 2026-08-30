# C-281 + C-282 — Codex, 2026-08-26

Bericht: `docs/berichte/c-281-codex.md`

**216 Angaben haengen an Eintraegen, die niemand sieht.** Und zwei
Datensaetze widersprechen sich in derselben Zeile.

Beides aus G-184, angestossen durch einen Koffein-Fund von Claude
Code.

---

## 1 · C-281 — das Wissen ist mitgewandert, statt hochzurutschen

`[cmd]` **Claude Code fiel auf, dass Koffein `monitored` ist und
`im_katalog = false`** — eine der drei beobachteten Substanzen ist
unsichtbar. `[read]` **Die Ursache ist groesser als der Fall.**

`[cmd]` **Vom Orchestrator gemessen, Angaben an Zeilen mit
`parent_id`:**

    supplement_dosing        101   von 596
    supplement_lab_effects    48
    supplement_user_texts     35
    supplement_wada           32   von 320

`[cmd]` **Und bei allen 32 WADA-Zeilen hat der Sammelname keine
eigene.**

`[read]` **Das ist die Folge von C-244 und C-276.** Die Entscheidung
*„der Sammelname gewinnt"* hat die **Anzeige** geordnet — 101 Formen
haengen richtig unter ihren Sammelnamen. **Aber das Wissen ist
mitgewandert.** Magnesiumcitrat traegt seine Dosisangabe,
*„Magnesium"* zeigt sie nicht.

### Blindes Vererben waere falsch — und ich kann es belegen

`[cmd]` **Koffein hat zwei Formen mit verschiedenem WADA-Status:**
`monitored` und `not_prohibited`.

`[read]` **Ein einzelner Gegenfall reicht, um die einfache Regel zu
verwerfen.** Bei den uebrigen 31 Sammelnamen ist der Status einheitlich
— **dort ist Vererben richtig.**

### Zu tun

**Je Feld und je Sammelname messen, ob die Kinder uebereinstimmen.**

    einheitlich    -> hochreichen, mit Vermerk woher
    uneinheitlich  -> NICHT vererben, melden

`[read]` **Der Vermerk ist nicht schmueckendes Beiwerk.** Wer spaeter
liest, muss unterscheiden koennen zwischen *„fuer Magnesium
gemessen"* und *„von Magnesiumcitrat uebernommen"*. **Ohne den Vermerk
ist die geerbte Angabe nach drei Wochen nicht mehr von einer eigenen
zu unterscheiden.**

`[read]` **Und C-266 hat fuer die Texte bereits entschieden:** keine
Vererbung, weil Sammeltexte eigene Belege brauchen. `[cmd]`
**`supplement_user_texts` ist damit ausgenommen** — die 35 bleiben, wo
sie sind. **Es geht um Dosis, Laborwirkung und WADA.**

`[read]` **Wo du zu einem anderen Schnitt kommst: begruenden.** Ich
habe die Felder nicht einzeln durchgesehen — **du schon, bevor du
entscheidest.**

## 2 · C-282 — zwei Zeilen widersprechen sich selbst

`[cmd]` **`wada_status = 'prohibited'`, waehrend `wada_category`
woertlich sagt:**

    Phenibut     "not on WADA list (not prohibited)"
    Tianeptine   "not prohibited"

`[read]` **Kimi hat den Widerspruch selbst vermerkt** — er stammt aus
dem Altbestand, nicht aus der Anreicherung.

`[cmd]` **Claude Code unterdrueckt die widerspruechliche Klasse in der
Anzeige**, sonst staende *„verboten · not prohibited"* nebeneinander.
`[read]` **Richtig als Sofortmassnahme — aber die Anzeige repariert
gerade einen Datensatz, und das gehoert nicht dorthin.**

### Zu tun

**Aufloesen, nicht raten.** `[cmd]` `wada_scope_enrichment` und
`wada_status_enrichment` tragen beide Quellen — **wo sie sich
unterscheiden, ist das ein Konflikt-Record**, wie bei den sechs
WADA-Korrekturen aus C-272.

**Und den umgekehrten Fall pruefen:** `[cmd]` die Abfrage
`wada_status = 'prohibited' AND wada_category ILIKE '%not prohibited%'`
findet heute zwei. **`not_prohibited` mit einer Verbotskategorie ist
ungeprueft** — und waere der gefaehrlichere Fehler.

## WAS NICHT ZU TUN IST

**Keine Angabe vererben, wo die Kinder auseinandergehen.**
**Keinen Widerspruch still aufloesen** — Konflikt-Record, wie C-267.
**`supplement_user_texts` nicht vererben** — C-266 steht.
**Keine Zeile loeschen.**

`apps/` nicht anfassen — Claude Code arbeitet an G-196.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS — Erwartung VOR dem Lauf

    Sammelnamen mit einheitlichen Kindern   je Feld, Zahl nennen
    davon hochgereicht                      je Feld
    uneinheitlich, gemeldet                 je Feld, mit Namen
    Widersprueche wada_status/category      heute 2, Gegenrichtung?

**Gegenprobe an drei namentlich genannten:** **Koffein** — `[cmd]` zwei
Formen, `monitored` und `not_prohibited`, **darf nichts erben.**
**Magnesium** — sieben Formen, Dosis muss unterscheidbar bleiben.
**Ein Sammelname mit einer einzigen Form** — dort ist Vererben
unstrittig.

**Negativprobe:** einen Kindwert verstellen, sodass zwei
auseinandergehen — **die Vererbung muss ausbleiben und gemeldet
werden.**

`[cmd]` **Und wie zuletzt: `im_katalog` fuer Kette und Live.** Beide
stehen bei **412**, sichtbare Unterformen **0**.

## PIPELINE

Kettenschritte hinter `280_community_anzeige.sql`, **eine Sache je
Schritt.** Wegwerf-Datenbank, Sicherung vorher, live einspielen mit
Vollsicherung in `backup/vollsicherung/`.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.

`[cmd]` **Der Dev-Server laeuft auf PID 351936.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
