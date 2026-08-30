# C-275 — Codex, 2026-08-25

Bericht: `docs/berichte/c-275-codex.md`

**Die 128 fehlenden Substanzen. Vor allem anderen.**

**Ersetzt C-272 in der Reihenfolge.** Der Anreicherungsauftrag war
falsch angesetzt — er hat den Katalog verfeinern wollen, dem ein
Drittel der Substanzen fehlt.

---

## Der Befund

`[cmd]` **Kimi hat 446 Stammdatensaetze geliefert, unser Katalog zeigt
318.**

    supplements.jsonl            182 -> 243
    peptides.jsonl                61 ->  79
    performance_compounds.jsonl   75 -> 124
    substance_user_texts.jsonl   318 -> 446
    substance_faq.jsonl        1.421 -> 1.970

`[cmd]` **Live steht Testosteron weiterhin so:**

    Testosterone Cypionate       f05_substance_candidate  im_katalog=false
    Testosterone Enanthate       f05_substance_candidate  im_katalog=false
    Testosterone Propionate      f05_substance_candidate  im_katalog=false
    Testosterone Undecanoate     f05_substance_candidate  im_katalog=false
    Testosterone Base (No Ester) f05_substance_candidate  im_katalog=false
    Testosterone Suspension      f05_substance_candidate  im_katalog=false

`[read]` **Testosteron ist der meistverwendete Stoff der ganzen Gruppe
und im Katalog unsichtbar.** Deca, Tren und Methandienone sind da.

## Die Aufteilung — vom Orchestrator gemessen

`[cmd]` Kimis 446 gegen unsere 549 Zeilen, ueber den normalisierten
Namen:

    trifft sichtbaren Eintrag    317   schon drin, nichts zu tun
    trifft UNSICHTBARE Huelse     99   AUFLOESEN, nicht neu anlegen
    ganz neu anzulegen            30   supplements 5, peptides 11,
                                       performance 14

`[read]` **Die 99 sind der heikle Teil.** `Testosterone Cypionate`
existiert bereits als leere `f05`-Zeile mit Slug
`f05_testosterone_cypionate`. **Kimis Record gehoert dorthin — nicht
als zweite Zeile daneben.**

`[cmd]` Weitere Huelsen: ACE-031, Anamorelin, Generic Chinese HGH,
Lonapegsomatropin, Macimorelin, Pegvisomant, Somatrogon, Albuterol,
BMS-564929, Boldenone Acetate/Cypionate, Calusterone, Chrysin, Danazol,
Eplerenone, Fulvestrant, Furazabol, HMG, Halotestin Injectable.

`[cmd]` **Die 30 ganz neuen** sind vor allem die Praeparate, die es bei
uns nie gab: **alle sieben Insuline** (Aspart, Degludec, Detemir,
Glargine, Glulisine, Lispro, Regular), **drei HGH-Marken** (Humatrope,
Omnitrope, Saizen) und Somapacitan, dazu Cabergolin, Clomifencitrat,
Clostebolacetat, Furosemid, Hydrochlorothiazid, Letrozol,
Levothyroxin.

## WAS ZU TUN IST

### 1 · Die 99 Huelsen aufloesen

**Kimis Stammdaten auf die bestehende Zeile schreiben**, Slug und ID
behalten, `source` auf die Kimi-Quelle setzen. `[read]` **Wer eine
zweite Zeile anlegt, hat Testosteron doppelt im Katalog.**

`[cmd]` **Die Zuordnung laeuft ueber den normalisierten Namen** —
Kleinschreibung, alle Nicht-Alphanumerischen entfernt. **Wo das nicht
eindeutig trifft: melden, nicht raten.**

### 2 · Die 30 neu anlegen

Mit Kimis `entity_id` als Slug, wie bei den bestehenden
`kimi_*`-Quellen.

### 3 · Nutzertexte und FAQ nachziehen

`[cmd]` `substance_user_texts` **318 → 446**, `substance_faq`
**1.421 → 1.970**.

`[read]` **Die Zuordnung ist dieselbe wie in deinem C-265-Nachtrag:**
exakter Slug → normalisierter Slug gegen `canonical_name` → `name_en`
→ Alias. **Sie hat dort getragen, sie traegt hier.**

### 4 · Sichtbarkeit

`[cmd]` `im_katalog` ist generiert:
`parent_id IS NULL AND (description_de <> '' OR description_en <> ''
OR evidence_grade IS NOT NULL)`.

`[read]` **Sobald ein Record Inhalt bekommt, erscheint er von selbst.**
Kein Schalter — **aber miss nachher, ob die Zahl stimmt.**

## WAS NICHT ZU TUN IST

**Keine Anreicherung.** WADA-Geltungsbereich, Laborwirkung, Thailand,
Studien kommen als **C-272 danach.**

**Keine Substanz doppelt anlegen.**

**Keine der 15 Sammelnamen anfassen** — `[cmd]` Magnesium, Vitamin C,
Zink und die anderen haben seit C-265 Texte und Unterformen.

`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS — Erwartung VOR dem Lauf

    supplements.supplements       549 -> Zahl nennen, Erwartung 579
    im_katalog                    318 -> Zahl nennen, Erwartung ~446
    supplement_user_texts         318 -> Erwartung 446
    supplement_faq              1.421 -> Erwartung 1.970
    Zeilen mit source f05, unsichtbar  248 -> Zahl nennen

**Gegenprobe an fuenf namentlich genannten:** `Testosterone Enanthate`
(Huelse, muss sichtbar werden), `Insulin Glargine` (neu),
`Humatrope (somatropin)` (neu), `Magnesium` (Sammelname, darf sich
nicht aendern), `BPC-157` (war schon sichtbar, darf keine Dublette
bekommen).

**Negativprobe:** eine Erwartungszahl um eins verstellen, der Lauf muss
rot werden.

**Und die Dublettenprobe:** `select name_en, count(*) from
supplements.supplements where im_katalog group by 1 having count(*) > 1`
— **muss leer sein.**

## PIPELINE

Kettenschritt hinter `141c`. Wegwerf-Datenbank, Sicherung vorher,
**und live einspielen** mit Vollsicherung in `backup/vollsicherung/`.

`[cmd]` Die Kette steht bei 101 Schritten, `KETTE OK`, Gate gruen.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
`docs/kimi_research/` steht in `.gitignore` — lesen, nicht committen.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
