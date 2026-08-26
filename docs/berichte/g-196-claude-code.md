# G-196 — Die Farbordnung gilt jetzt ueberall

**Agent:** Claude Code · **Stichtag aller Zahlen: 2026-08-26**

---

## Kurz

`[cmd]` **Vorher 3 von 16 Ueberschriften gefaerbt, jetzt 14 von 21** —
und die 7 grauen sind einzeln entschieden, nicht uebrig geblieben.

`[cmd]` **Toms Fall `AC-262356`:** UEBERWACHUNG und REINHEIT tragen
jetzt die `pruefen`-Farbe, WAS NICHT ZURUECKKOMMT die Warnfarbe. **Die
zwei, wegen denen G-194 entstand, sind nicht mehr grau.**

**Und die Messung war der eigentliche Ertrag:** dein Hinweis hat sie
reparabel gemacht, und dabei kamen **drei Fehler in meiner Pruefung**
heraus — nicht in der Seite.

---

## 1 · Das Messproblem, dreifach

**Dein Hinweis: *„gib das der Browsersitzung mit, statt gegen das
Skript zu arbeiten."*** `[cmd]` Playwright kann genau das:
`colorScheme` je Kontext, ein eigener Lauf je Thema. **Damit schaltet
das Thema wirklich um** — belegt an der Grundhelligkeit: **0.004
(dunkel) gegen 0.955 (hell).**

`[read]` **Danach kamen zwei weitere Fehler zum Vorschein, beide
meine:**

**a) Der Grund wurde von WEISS aus gerechnet.** Eine 5-%-Toenung ueber
„weiss" ergab im Dunkelmodus einen hellen Grund — `--pos` darauf
gemessen: 4.2 statt 9.4.

**b) `getComputedStyle().backgroundColor` liefert `oklch(…)`
woertlich.** `[cmd]` Meine Regex las `0.78, 0.13, 150` als RGB und
`0.05` als Deckung. **Daraus wurde ein hellgruener Hintergrund**, der
mit der Seite nichts zu tun hatte.

`[read]` **Beides erklaert die G-194-Tabelle vollstaendig.** Die
Zahlen dort waren nicht „unsicher" — sie waren falsch, und zwar
zugunsten eines Problems, das es nicht gab.

**Die berichtigte Lage:** `[cmd]` Im Dunkelmodus liegen alle
gefaerbten Ueberschriften bei **7.94–10.13**. Nur der Hellmodus war
knapp.

---

## 2 · Die Tabelle — gemessen, beide Themen

| Ueberschrift | Bedeutung | Token | dunkel | hell |
|---|---|---|---|---|
| Bei zu viel | gefahr | `--warn` | 9.40 | 4.58 |
| Was nicht zurueckkommt | gefahr | `--warn` | 9.40 | 4.58 |
| Wer es nicht nehmen sollte | gefahr | `--warn` | 10.03 | 4.62 |
| **Wechselwirkung und Labor** | **gefahr** | `--warn` | 10.13 | 4.89 |
| Fuer wen das Verbot gilt | gefahr | `--warn` | 9.07 | **4.32 !** |
| Wie es wirkt | wirkung | `--acc` | 8.02 | 5.23 |
| Was es bringt | wirkung | `--acc` | 8.02 | 5.23 |
| **Ueberwachung** | **pruefen** | `--acc-suppl` | 8.02 | 5.23 |
| **Reinheit** | **pruefen** | `--acc-suppl` | 8.02 | 5.23 |
| Nicht im Blut nachweisbar | pruefen | `--acc-suppl` | 7.94 | 4.94 |
| Rechtslage | pruefen | `--acc-suppl` | 7.94 | 4.94 |
| **Wann und wie** | **pruefen** | `--acc-suppl` | 7.94 | 4.94 |
| Mythen | entwarnung | `--pos` | 9.34 | 4.89 |
| Fuer wen das gilt | entwarnung | `--pos` | 8.50 | 4.55 |

**Ohne Farbe, je einzeln entschieden:** Fragen · Weitere Angaben ·
Kategorie · Beleglage · Uebliche Menge · WADA · Wirkung.

`[read]` **Die grauen liegen bei 2.1–4.87** — sie tragen `--fg-dim`
und muessten steigen, wenn sie eine Aussage machen sollten. **Sie
machen keine**, deshalb bleiben sie.

---

## 3 · Die zwei offenen Faelle

### Fragen — bleibt grau, und hier ist der Grund

`[cmd]` **Gemessen an den Fragen im Bestand:**

    „Ist Tresiba in der Schwangerschaft untersucht?"      → Gefahr
    „Wie schnell wirkt Turinabol?"                        → Wirkung
    „Wie lange ist Turinabol im Dopingtest nachweisbar?"  → Pruefen

`[read]` **Der Block traegt alle vier Bedeutungen gleichzeitig.** Eine
Farbe darueber waere fuer drei Viertel des Inhalts falsch — und die
Regel lautet, dass die Farbe etwas BEDEUTET.

**Dasselbe bei „Weitere Angaben"** (Obergrenze, Einnahme, Mit Essen
nebeneinander) und **„Aus der Community"** (Rahmen um fuenf eigene
Bloecke).

### Wechselwirkungen — `--warn`, wie angewiesen

`[cmd]` Die Ueberschrift heisst im Code *„Wechselwirkung und Labor"*.
Sie traegt jetzt `gefahr`: **10.13 dunkel, 4.89 hell.**

---

## 4 · Beleglage — gemessen, keine Farbe noetig

`[cmd]` **Die Kachelbeschriftung liegt bei 3.68 (dunkel) / 4.87
(hell)** — sie traegt `--fg-dim` wie jede Kachelbeschriftung.

`[read]` **Der Wert darunter genuegt**, und er ist bereits gefaerbt:
`A` gruen, `E` gedaempft — das ist die Aussage. **Die Beschriftung
sagt nur, WAS dort steht, nicht wie es zu bewerten ist.** Faerbte man
sie mit, stuenden zwei Farben in einer 196-px-Kachel.

**Dasselbe gilt fuer „Uebliche Menge", „Wirkung" und „WADA".**

---

## 5 · Der Kontrast — deine Entscheidung, umgesetzt und gemessen

**Toenung gesenkt, Farbwert unberuehrt.**

`[cmd]` **Gemessen, welche Toenung traegt** (`--warn`, Hellmodus):

| Toenung | Kontrast |
|---|---|
| 0 % | 4.89 |
| 5 % | **4.58** |
| 6 % | 4.51 |
| 7 % | **4.44 ✗** |

**7 % → 5 %** an vier Stellen (drei in `supplements.css`, eine inline
mit 9 %). `[cmd]` Ergebnis: *„Bei zu viel"* **4.28 → 4.58**.

`[read]` **Kein Farbwert angefasst** — er gilt modulweit, und alle elf
Akzenttoken liegen bei Luminositaet 0.74–0.80.

### Eine Stelle bleibt unter 4.5, und sie gehoert nicht mir

`[cmd]` **„Fuer wen das Verbot gilt" liegt bei 4.32** — der
WADA-Block. **Seine Toenung ist bereits auf 5 %.**

`[cmd]` **Die Ursache ist der Grund darunter, nicht die Toenung:** der
Block sitzt auf `.v2-supp-tafel`, und die ist im Hellmodus
**`[253,247,249]`** — rosa getoent, nicht weiss. Dieselben 5 % ergeben
dort 4.32 statt 4.58.

`[read]` **Nicht angefasst — der Block wandert mit G-195 in einen
eigenen Reiter.** Dort steht er auf anderem Grund, und die Zahl
aendert sich ohnehin. **Zweimal umbauen ist einmal zu viel.**

---

## 6 · Ein Befund: es gab zwei Farbsysteme

`[cmd]` **`Textkacheln` und `UeberwachungUndReinheit` faerbten von
Hand** — `ton: 'acc'`, `ton: 'pos'`, `warn: true/false` —, nicht ueber
`tonFuer`.

`[read]` **Das ist der Grund, warum G-194 unvollstaendig blieb.** Die
Ordnung stand, aber diese Kacheln kannten sie nicht: *„Was nicht
zurueckkommt"* war richtig gefaerbt, *„Ueberwachung"* und
*„Reinheit"* daneben grau — **im selben Bauteil.**

`[cmd]` **Und ein Wert war unter der neuen Ordnung falsch:** *„Was es
bringt"* trug `pos`, was jetzt *Entwarnung* hiesse. **Es ist eine
Wirkungsaussage.**

**Beide Stellen laufen jetzt ueber `tonFuer`**, die CSS-Namen sind
angeglichen (`acc`/`pos`/`warn` → `wirkung`/`entwarnung`/`gefahr`).

---

## 7 · Negativprobe

`[cmd]` Vier Sabotagen, je einzeln, SHA-identischer Rueckbau:

| Sabotage | Waechter |
|---|---|
| fuenfte Bedeutung erfunden | **rot** (2 Tests) |
| Tippfehler im Ton (`gefaehr`) | **rot** (3 Tests) |
| **Ueberschrift ohne Entscheidung** | **rot** |
| neuer Farbwert statt Token | **rot** |

`[read]` **Der dritte ist der wichtige** — genau so ist in G-194 das
Grau stehengeblieben. Der Waechter zaehlt jetzt alle
`<BlockTitel>`-Titel im Code und verlangt fuer jeden eine
Entscheidung: Farbe **oder** namentlich in der Liste der Grauen.

---

## 8 · Pruefungen

| Pruefung | Ergebnis |
|---|---|
| `tsc --noEmit` (web) | sauber |
| volle Testreihe | **646 pass, 0 fail** |
| `block-ton.test.ts` | **11 Pruefungen**, davon 3 neu |
| `tools/serverimport-pruefen.mjs` | 51 Chunks, 0 Treffer |
| `tools/ladekette-pruefen.mjs` | 13 Seiten, keine ueber 3 |
| `tools/encoding-pruefen.mjs` | 20.028 Dateien, sauber |
| `pnpm --filter @lumeos/web build` | Compiled successfully, 31/31 |

**Der Dev-Server wurde NICHT neu gestartet** — durchgehend **PID
351936**, 0,1 s.

Bilder: `backup/g196-ac262356-hell.png`, `-dunkel.png`.

**`supabase/_pipeline/` nicht angefasst** (C-280, Codex).
**Nicht committet, nicht gestaged.**

---

## 9 · Was ich als Befund melde

**a) Der WADA-Block liegt bei 4.32 im Hellmodus.** `[cmd]` Nicht wegen
der Toenung — wegen des rosa Tafelgrunds darunter. **Gehoert in G-195
mitgemessen**, wenn der Block umzieht.

**b) `.v2-supp-tafel` ist im Hellmodus rosa getoent** (`[253,247,249]`
statt `--surface` weiss). `[read]` Das senkt jeden Kontrast in der
Tafel um rund 0.25. **Nicht falsch, aber es gehoert gewusst**, wenn
jemand kuenftig gegen `--surface` rechnet statt zu messen.

**c) Drei Messfehler in zwei Tagen, alle in meiner Pruefung.**
`[read]` Thema nicht umgeschaltet · Grund von Weiss aus gerechnet ·
`oklch` als RGB gelesen. **Alle drei haetten eine falsche Meldung
ergeben, und zwei davon haetten mich eine Farbe aendern lassen, die
in Ordnung war.** Die Lehre steht im Kopf von `g196-tabelle.mjs`.

---

## Geaenderte Dateien

| Datei | Was |
|---|---|
| `apps/web/src/lib/supplements/block-ton.ts` | Wechselwirkung, Wann und wie; Begruendung fuer die Grauen |
| `apps/web/src/lib/supplements/__tests__/block-ton.test.ts` | 3 neue Waechter |
| `apps/web/src/app/v2/supplements/substanz-tafel.tsx` | 2 Ueberschriften angeschlossen, 2 Kachelsysteme auf `tonFuer` |
| `apps/web/src/app/v2/supplements/substanz-abschnitte.tsx` | Toenung 9 % → 5 % |
| `apps/web/src/app/v2/supplements/supplements.css` | Toenung 7 % → 5 %, Tonnamen angeglichen |
| `backup/g196-tabelle.mjs` | **neu** — Messung je Thema, mit den drei Korrekturen |
