# G-190 — Claude Code, 2026-08-25

Bericht: `docs/berichte/g-190-claude-code.md`

**Nachtraeglich angelegt.** Der Auftrag ging am 2026-08-25 muendlich
raus, waehrend Tom und Claude Code am Design arbeiteten — **ohne
Auftragsdatei.** `[read]` Genau das, was `docs/auftraege/` verhindern
soll: *„der auftrag der verloren geht wenn ich claude wechsle."*

---

## Der Befund

`[cmd]` **Sieben `await` nacheinander in `v2/supplements/page.tsx`,
keiner baut auf dem vorigen auf.** Ladezeit 1,8–2,9 s.

`[cmd]` **`Promise.all` steht in sechs von sieben Modulen** —
training, goals, recovery, nutrition, medical. **Nur Supplements
nicht.** Es lag im Nachbarordner und wurde **fuenfmal nicht
angewandt:**

| Commit | Datum | `await` |
|---|---|---:|
| `6700f94` Attrappe | 17.8. | 0 |
| `5a67903` vier Reiter | 18.8. | 2 |
| `08803ce` inventory, compliance, cost | 20.8. | 2 |
| `3d3f7c9` interactions + gate | 20.8. | 4 |
| `fd0936b` Katalog mit Herkunft | 22.8. | 6 |

`[read]` **Nie ein Sprung, immer zwei dazu.** Jeder Auftrag war fuer
sich vertretbar. **Keiner hat gefragt, was die Kette insgesamt
kostet.**

## Die drei Punkte

**1 · Die langsamste Einzelabfrage messen.** Bei sieben parallelen ist
sie die Untergrenze — **liegt das Ergebnis deutlich darueber, ist noch
etwas anderes im Weg, und das gehoert genannt.**

**2 · Ein Waechter**, der sequenzielle `await` in einer `page.tsx`
zaehlt und ab einer Schwelle rot wird. **Die Schwelle kommt aus den
sechs anderen Modulen, nicht aus dem Bauch.**

`[read]` **Der Grund:** `[cmd]` **C-189 hat dieselbe Lehre
hinterlassen** — fuenf Auftraege, eine Datei, keiner hat gemessen,
7.641 ms auf 144 ms — **als Merksatz in `CLAUDE.md`. Er hat nicht
getragen.** **Eine Lehre, die keine Pruefung wird, wiederholt sich.**

**3 · Jede Abfrage behaelt ihr eigenes `.catch()`** statt eines
gemeinsamen `try` — dann faellt weiterhin nur die einzelne Abfrage
aus, nicht die Seite.

## Nachweis

**Zwei Laeufe, kalt und warm.** Der Nachweis gilt nur, wenn **beide**
schneller sind.

## Zur Zurechnung

`[read]` **Die fuenf Auftraege waren meine.** Jeder sagte *„haeng zwei
Abfragen an"*, keiner *„miss die Summe"*.

`[read]` **Claude Codes Gegenrede, und sie traegt:** *„Ein Auftrag,
der ‚haeng zwei Abfragen an' sagt, verbietet nicht, beim Anhaengen
nach links und rechts zu sehen. Das war fuenfmal meine Gelegenheit.
Dass die Auftraege es nicht erzwungen haben, macht die Kette
erklaerbar, nicht richtig."*
