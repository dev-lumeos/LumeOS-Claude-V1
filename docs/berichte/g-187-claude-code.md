# G-187 — Der Wechselwirkungs-Block, `tabs.tsx:862`

**Agent:** Claude Code · **Stichtag aller Zahlen: 2026-08-25**

---

## Kurz

Die Marke ist weg, der Block liest echt — **aber der Auftrag steht auf
zwei Annahmen, die beide nicht halten.** Beide sind gemessen, beide
gehoeren vor die Arbeit:

1. **Der Reiter, wie der Auftrag ihn beschreibt, ist mit diesen Daten
   nicht baubar.** `[cmd]` `supplement_interactions` traegt 78 Zeilen —
   **77 gegen Medikamente, 1 gegen Alkohol, 0 zwischen zwei
   Katalogsubstanzen.** *„Die Paare ZWISCHEN den Substanzen im Stack"*
   gibt es in der Tabelle nicht. Nicht null Treffer bei vorhandenen
   Paaren — **null Paare.**

2. **Der Block, den ich umgebaut habe, wird nicht angezeigt.**
   `[cmd]` `ansicht.tsx:309-313` rendert `SuppInteractions` nur, wenn
   `regeln.regeln.length === 0`. Der Regelkatalog hat 64 Zeilen und
   eine RLS-Policy fuer alle `authenticated` — **er laedt immer.** Auf
   dem Schirm steht `InteractionsEchtTab` aus G-110.

**Punkt 3 des Auftrags ist damit schon erledigt, nur anders als
gedacht:** die Kopfzahl kommt seit G-110 aus `regeln?.erfuellt`, nicht
aus einer Konstanten. Sie ist gemessen und richtig.

---

## 1 · Was in der Tabelle steht

`[cmd]` Gezaehlt gegen die laufende Datenbank:

| Frage | Zahl |
|---|---|
| `supplement_interactions` gesamt | **78** |
| davon `partner_type = 'drug'` | **77** |
| davon `partner_type = 'alcohol'` | **1** |
| davon zwischen zwei Katalogsubstanzen | **0** |

**Die Tabelle beantwortet eine andere Frage als der Reiter stellt:**
nicht *„welche zwei Mittel in deinem Stack beissen sich"*, sondern
*„womit beisst sich dieses eine Mittel"* — und die Gegenseite ist
immer ein Medikament.

### Die drei Staende, je Position gezaehlt

`[cmd]` `stack_items` → `user_stacks` → `auth.users`, links gegen
`supplement_interactions`:

| Konto | Position | im Katalog | Treffer |
|---|---|---|---|
| `test-user@lumeos.local` | Creatine monohydrate | ja | 1 |
| `test-user@lumeos.local` | Omega-3 (EPA/DHA) | ja | 1 |
| `test-user@lumeos.local` | Vitamin D3 | nein | 0 |
| `dev@lumeos.app` | Creatine monohydrate | ja | 1 |
| `dev@lumeos.app` | Omega-3 (EPA/DHA) | ja | 1 |
| `dev@lumeos.app` | Magnesium, Vitamin D3 | nein | 0 |
| `tom.seed@example.com` | wie dev | | 2 |

**Also: 2 Zeilen je Stand, 0 Paare.** `[read]` Ich hatte in der
Zwischenmessung *„1 Zeile"* genannt — das war je Substanz gezaehlt,
nicht je Stand. Die Aussage *„0 Paare"* aendert sich dadurch nicht.

`[cmd]` Die beiden Zeilen von `test-user`:

- Creatine monohydrate → *„caffeine interaction debated (likely
  minimal)"*, `drug`, `caution`
- Omega-3 (EPA/DHA) → *„anticoagulants (mild additive)"*, `drug`,
  `caution`

`[read]` **Drei `partner_label` enthalten zufaellig Namen von
Katalogsubstanzen** (u. a. Koffein). Das sind Medikamenten- und
Laborhinweise, keine Paare — wer sie als Paar liest, baut die Anzeige
falsch.

---

## 2 · Was die Kachel vorher behauptete

`[cmd]` `INTERACTIONS` aus `daten.ts` trug **eine erfundene Paarung**
— *Caffeine + Ashwagandha* — mit dem Satz *„your current schedule is
fine"*.

`[read]` **Das ist genau die Bewertung, die C-108 ausgeschlossen
hat**, und sie stand unter einer Marke, die seit C-68 einen falschen
Grund nannte (*„es gibt kein `supplements`-Schema"* — seit C-232 gibt
es das).

**Die Konstante ist geloescht, nicht versteckt** (G-163-Beschluss).
Ein Waechter haelt fest, dass sie nicht zurueckkommt.

---

## 3 · Was jetzt dasteht

`apps/web/src/lib/supplements/stack-wechselwirkungen.ts` — **neu**,
serverfrei, damit die Regel ohne Browser pruefbar ist. Kein zweiter
Lesepfad: die Datei liegt neben `stack-read.ts` und
`substanz-read.ts`, und `stack-read.ts` ruft sie auf.

`SuppInteractions` hat drei Faelle:

| Lage | Anzeige |
|---|---|
| kein Stand geladen | der Satz aus `OHNE_DATEN` |
| 0 Zeilen | *„Fuer die Positionen dieses Stacks ist keine Wechselwirkung hinterlegt."* + der gemessene Nachsatz |
| n Zeilen | Kachel *„Wechselwirkungen"*, Unterzeile **„n · mit Medikamenten, nicht untereinander"** |

**Der Nachsatz nennt die Zahl:** *„Der Katalog fuehrt 78
Wechselwirkungen — alle gegen Medikamente oder Alkohol, keine zwischen
zwei Supplements."*

`[read]` **Nichts erfunden.** Wo die Beschreibung woertlich der
Partner ist — bei beiden Zeilen von `test-user` der Fall — entfaellt
sie, statt denselben Text zweimal danebenzustellen.

**Breiten nach G-181:** `minmax(0, 190px) minmax(0, 1fr) auto` wie
`.v2-supp-labor-zeile`, Partner auf `62ch`, Hinweis auf `78ch`, unter
620 px einspaltig. **Kein blankes `1fr`.**

---

## 4 · Die Verdrahtung, nicht nur die Funktion

`[cmd]` **Negativprobe, drei Sabotagen einzeln, Rueckbau im
`finally`:**

| Sabotage | Waechter |
|---|---|
| `wechselwirkungenFuer(positionen` → `…FuerX(` | **rot** |
| `.from('supplement_interactions')` → `…X')` | **rot** |
| `daten?.wechselwirkungen` → `…X` | **rot** |

`[cmd]` **SHA-256 vor und nach identisch**, beide Dateien:
`stack-read.ts` `591fa5d54483…`, `tabs.tsx` `274271ad6729…`.
Danach wieder `# fail 0`.

### Der dritte Waechter war beim ersten Lauf gruen

`[cmd]` **Und das war mein Fehler, nicht der der Probe.** Das Muster
lautete `/daten\?\.wechselwirkungen/` und passte auch auf
`daten?.wechselwirkungenX` — ein Teilstring passt eben.

`[read]` **Das Verankern am Wortende haette es nur verschoben.** Der
Feldname ist die falsche Frage: **dass der Zugriff zum Typ passt,
prueft `tsc`.** Der Waechter haelt jetzt fest, dass ueberhaupt aus
`daten` gelesen wird und welches Feld — und meldet, wenn jemand es
still umhaengt.

**Es ist derselbe blinde Fleck wie in G-186, zum dritten Mal.**

### Negativprobe an den Daten

`[cmd]` In einer Transaktion, die zurueckgerollt wird:

| Schritt | Omega-3-Zeilen | gesamt |
|---|---|---|
| vorher | 1 | 78 |
| nach `delete` | **0** | **77** |
| nach `rollback` | 1 | 78 |

**Kein Zustand blieb liegen.**

---

## 5 · Wo der Block wirklich steht

`[cmd]` `ansicht.tsx:309-313`:

```
{tab === 'interactions' && (
  regeln && regeln.regeln.length > 0
    ? <><InteractionsEchtTab d={regeln} /><RegelHinweis /></>
    : <SuppInteractions />
)}
```

`[cmd]` `rule_catalog` hat **64 Zeilen**, Policy `rule_catalog_select`
fuer `{authenticated}` ohne Nutzerfilter. **Der Katalog laedt fuer
jeden Angemeldeten** — `SuppInteractions` erscheint nur, wenn die
Abfrage ganz scheitert.

**Das heisst nicht, dass die Arbeit umsonst war:** die erfundene
Paarung stand im Rueckfallpfad und waere bei jedem Datenbankfehler
sichtbar geworden — mit einer Bewertung. **Jetzt steht dort eine
gemessene Aussage.**

**Es heisst aber, dass Punkt 1 des Auftrags am gezeigten Reiter nichts
aendert.** Wer den Reiter meint, meint `InteractionsEchtTab`.

---

## 6 · Punkt 3: die Kopfzahl

`[cmd]` `ansicht.tsx:13013`: `tabs(t, stackAnzahl, regeln?.erfuellt ??
null, substanzen.length)` — **die Zahl ist seit G-110 die der
zutreffenden Regeln.** Keine Konstante.

`[cmd]` Am Bild gemessen, beide Konten:

| Konto | zutreffend | nicht zutreffend | Daten fehlen |
|---|---|---|---|
| `dev@lumeos.app` | **1** (`wr_anticoag_stack`) | 52 | 11 |
| `test-user@lumeos.local` | **0** | 53 | 11 |

`[read]` **Die 1 bei `dev` ist genau die Omega-3-Zeile aus der
Tabelle** — dieselbe Wechselwirkung, ueber den Regelweg gefunden.
**Die Regel-Engine leistet damit, was der Auftrag vom Reiter wollte**,
nur ueber `rule_catalog` statt ueber `supplement_interactions`.

**Punkt 3 ist erfuellt** — die Zahl ist gemessen und verschwindet bei
0 (`count: regelAnzahl ?? undefined`).

---

## 7 · Nachweise

`[cmd]` Angemeldet, Port 3200, derselbe Server vor und nach dem Build
(PID 175672):

| Bild | Konto | Lage |
|---|---|---|
| `backup/g187-ww.png` | `dev@lumeos.app` | **mit Treffer** (zutreffend 1) |
| `backup/g187-ww-testuser.png` | `test-user@lumeos.local` | **ohne Treffer** (zutreffend 0) |

**Beide zeigen `InteractionsEchtTab`, nicht den umgebauten Block** —
aus dem Grund in Abschnitt 5.

`[cmd]` **`--nutzer` gibt es an `schuss.mjs` nicht.** Mein erster
Versuch mit dem Schalter lief still als `dev` durch und haette als
`test-user` gegolten. Das Konto kommt ueber `LUMEOS_KONTO`; das zweite
Bild traegt `test-user@lumeos.local` unten links, `Stack 3`, `12 d
logged`.

### Zahlen der Messung

| | dev | test-user |
|---|---|---|
| `gesamt_ms` | 2950 / 2740 | 1882 / 2168 |
| `dokument_ms` | 1773 / 1571 | 758 / 868 |
| Konsolenfehler | 1 | 1 |
| Attrappen | 1 | 1 |

`[cmd]` **Der eine Konsolenfehler ist die bekannte
`data-mode`-Hydrierungswarnung des Wurzel-Layouts**, nicht aus diesem
Umbau. **Die eine Attrappe ist die Buddy-Flaeche der rechten Leiste
(G-02)** — anderes Modul.

`[cmd]` **In `tabs.tsx` steht `attrappe={ATTRAPPE}` jetzt 0 Mal.**

---

## 8 · Pruefungen

| Pruefung | Ergebnis |
|---|---|
| `tsc --noEmit` (web) | sauber |
| `npx tsx --test src/**/__tests__/*.test.ts` | **585 pass, 0 fail** |
| `stack-wechselwirkungen.test.ts` (neu) | **8 pass, 0 fail** |
| Attrappenwaechter | **87 pass, 0 fail**, `[SUPP, 1, 17]` → `[SUPP, 0, 17]` |
| `tools/serverimport-pruefen.mjs` | 50 Chunks, **0 Treffer** |
| `tools/sprachrueckfall-pruefen.mjs` | 12 Abfragen, **0 ohne Rueckfall** |
| `pnpm --filter @lumeos/web build` | **Compiled successfully, 31/31** |
| Dev-Server nach dem Build | PID 175672 unveraendert, 0.3 s |

**Nicht angefasst:** `supabase/_pipeline/` (C-270, Codex).
**Nicht committet, nicht gestaged.**

---

## 9 · Was ich als Befund melde

**a) Der Reiter ist mit `supplement_interactions` nicht zu bauen, wie
gedacht.** 0 von 78 Zeilen sind Supplement-Paare. **Entweder** die
Tabelle bekommt Paare (dann ist es ein Datenauftrag), **oder** der
Reiter heisst, was er zeigt: Wechselwirkungen mit Medikamenten.
`[read]` **Ich wuerde das Zweite nehmen** — die Regel-Engine deckt den
Paar-Fall bereits ab (`wr_anticoag_stack` traf auf `dev`), und zwei
Wege zur selben Aussage sind einer zu viel.

**b) `SuppInteractions` ist auf dem Live-Pfad toter Code.** Er
erscheint nur bei einem Datenbankfehler. `[read]` Solange er da ist,
muss sein Inhalt stimmen — das tut er jetzt. **Ob er bleiben soll, ist
eine Entscheidung, keine Messung**, deshalb habe ich ihn nicht
geloescht.

**c) Der Waechter-Fehler aus G-186 ist zum dritten Mal aufgetreten.**
`[read]` Ein Regex auf einen Bezeichner passt immer auch auf
`Bezeichner + X`. **Das ist kein Einzelfall mehr, sondern ein Muster
in meiner Arbeit** — gefunden hat es diesmal die Negativprobe, nicht
ich beim Schreiben.

---

## Geaenderte Dateien

| Datei | Was |
|---|---|
| `apps/web/src/lib/supplements/stack-wechselwirkungen.ts` | **neu** — die Regel, serverfrei |
| `apps/web/src/lib/supplements/stack-read.ts` | Abfrage, Typ, Aufruf |
| `apps/web/src/app/v2/supplements/tabs.tsx` | Block ersetzt, `INTERACTIONS` raus |
| `apps/web/src/app/v2/supplements/supplements.css` | drei Klassen, feste Breiten |
| `apps/web/src/lib/supplements/__tests__/stack-wechselwirkungen.test.ts` | **neu** — 8 Pruefungen inkl. Verdrahtung |
| `apps/web/src/components/shell/__tests__/v2-attrappen.test.ts` | Erwartung und Rueckfall-Waechter |
