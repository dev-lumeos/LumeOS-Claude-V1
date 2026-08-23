# C-245 — Codex, 2026-08-23

**Rausgegangen 2026-08-23.** Im Wortlaut uebernommen, nicht
nachgeschrieben. Bericht: `docs/berichte/c-245-codex.md`.

---

## Kreatin steht doppelt im Nachweis-Stack

Das ist ein Nachtrag zu C-243. Der Fehler liegt in meinem Auftragstext,
nicht in deiner Umsetzung: ich habe *„mindestens zwei Positionen mit
gesetzter `supplement_id`"* geschrieben und nicht gesagt, dass die
vorhandenen `custom_name`-Positionen dabei umzuhaengen sind. Du hast
genau das gebaut, was dastand.

## WAS ICH GEMESSEN HABE (live, nach C-243)

`test-user@lumeos.local`, Stack *„Nachweis-Stack"*, `is_active = true`,
**vier Positionen**:

| Position | Zuordnung | Einnahmen |
|---|---|---:|
| Creatin Monohydrat | `custom_name` | 12 |
| Creatine monohydrate | `sub_9f9bb8c160` | 0 |
| Vitamin D3 | `custom_name` | 12 |
| Omega-3 (EPA/DHA) | `sub_4480fcfa86` | 0 |

Kreatin ist damit zweimal im selben aktiven Stack.
`supplements.stack_items` gesamt **12**, davon **6** mit
`supplement_id`. `intake_logs` gesamt **744**.

## WAS ZU TUN IST

1. Die bestehende Position *„Creatin Monohydrat"* (`custom_name`) auf
   `supplement_id = sub_9f9bb8c160` umhaengen, `custom_name` leeren.

2. Die in C-243 neu angelegte Kreatin-Position entfernen — **nicht die
   alte.** Die alte traegt die 12 Einnahmen.

   Falls du es andersherum baust: dann muessen die 12 `intake_logs`
   vorher auf die neue `stack_item_id` umgehaengt werden. Was du
   waehlst, ist mir gleich; **nicht gleich ist, dass die 12 Einnahmen am
   Ende an genau einer Kreatin-Position haengen.**

3. Omega-3: pruefen, ob dasselbe Muster vorliegt. Nach meiner Messung
   gab es vorher keine Omega-3-Position auf `test-user`, die neue steht
   also allein. **Wenn du etwas anderes misst, melde es.**

4. Vitamin D3 bleibt `custom_name`. Dort gibt es keine Dublette, weil es
   keine zweite Zeile gibt — die Formentscheidung ist C-244 und offen.

## WAS NICHT ZU TUN IST

Keine Positionen bei `dev@lumeos.app` oder `tom.seed@example.com`
anfassen. Dort ist die Lage anders und nicht Gegenstand.

Keine Entscheidung zur Salzform treffen (C-244).

Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## NACHWEIS — Erwartung VOR dem Lauf, beide Richtungen

Nachher auf `test-user@lumeos.local`:

    3 Positionen im Nachweis-Stack
      davon 2 mit supplement_id (Creatine monohydrate, Omega-3)
      davon 1 mit custom_name  (Vitamin D3)
    Creatine monohydrate traegt 12 Einnahmen
    Vitamin D3 traegt 12 Einnahmen
    intake_logs gesamt weiterhin 744 - keine verloren, keine doppelt

**Gegenprobe:** eine Abfrage, die zaehlt, ob eine `supplement_id` oder
ein gefoldeter `custom_name` mehr als einmal je Stack vorkommt. Sie muss
**heute 1 Treffer** liefern und **nach dem Lauf 0**.

**Negativprobe:** dieselbe Abfrage mit einer absichtlich eingebauten
zweiten Position muss rot werden. Ohne diesen Beleg misst sie nichts.

## BERICHT

`docs/berichte/c-245-codex.md`

## REGELN

Wegwerf-Datenbank zum Pruefen, danach verwerfen. Vollsicherung vor jedem
Live-Eingriff. **Ein Auftrag ist nicht fertig, wenn die Kette gruen
laeuft, sondern wenn die Aenderung dort ist, wo Tom sie sieht.**

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster. Nie `pnpm dev`
oder `npx next dev` — nur `python tools/server.py`. `.next` nie
loeschen, `next build` nie direkt aufrufen. Pruefschleifen als
Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`. Nachweisdateien
mit `encoding="utf-8", newline="\n"`.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
