# G-197 + G-198 — Der rosa Boden, das dritte Farbsystem, und ein Waechter statt sechs

**Agent:** Claude Code · **Stichtag aller Zahlen: 2026-08-26**

---

## Kurz

**G-197 ist geloest:** *„Fuer wen das Verbot gilt"* liegt jetzt bei
**4.58** statt 4.32.

**G-198 hat ein DRITTES Farbsystem gefunden** — nicht nur die zwei aus
G-196.

**Punkt 3: die gemeinsame Form gibt es**, der Waechter steht — **aber
er ist nur teilweise belegt.** Abschnitt 4, und das ist die
wichtigste Einschraenkung dieses Berichts.

---

## 1 · G-197 — woher der Ton kommt

`[cmd]` **Gemessen: `.v2-supp-tafel` traegt
`color-mix(in oklch, var(--acc) 4%, var(--bg-elev))`** —
`supplements.css:975`.

`[cmd]` **Und `--acc` ist dort der Supplements-Akzent**
(`oklch(0.55 0.15 25)`), gemessen IM aufgeklappten Panel.

`[read]` **Deine Vermutung war richtig** — es ist der Modulakzent, und
damit eine Entscheidung ueber das Modul, nicht ueber diese Tafel.

### Ein Messfehler von mir, der fast ein falscher Befund geworden waere

`[cmd]` **Mein erster Lauf verglich acht Module und meldete fuer alle
denselben Akzent** (`oklch(0.48 0.06 240)`, Dashboard-Blau) — daraus
haette ich *„kein Supplements-Problem, sondern ein Systemproblem"*
gemacht.

`[cmd]` **Der Grund: ich las an `document.documentElement`.** Der
Modulakzent haengt aber an `.lume-shell-supplements`, und der Wert
gilt erst weiter unten im Baum. **Im Panel gemessen ist es der
Supplements-Ton.**

`[read]` **Andere Module tragen dasselbe Muster** (`globals.css` und
`v2.css` toenen an 30+ Stellen mit `var(--acc)`), **aber nicht
dieselbe Stelle** — `.v2-supp-tafel` gibt es nur hier. **Kein
Systemproblem.**

### Die drei Wege, gemessen

`[cmd]` Warntext auf 5 % Warn-Toenung, Hellmodus:

| Weg | Kontrast |
|---|---|
| heute (4 % Akzent) | **4.32** |
| Akzent auf 3 % | 4.41 |
| Akzent auf 2 % | 4.45 |
| Akzent auf 1 % | 4.51 |
| **eigener, deckender Grund** | **4.58** |

`[read]` **Dein Vorschlag (abschwaechen) traegt nicht.** Er kommt erst
bei **1 %** ueber die Schwelle — und dort ist die Toenung nicht mehr
sichtbar. **Also Weg 3.**

`[cmd]` **Die Ursache war eine Kleinigkeit:** die drei Ton-Varianten
des Blocks mischten auf `transparent` statt auf `--surface`. **Dadurch
schlug der Tafelboden durch.** Jetzt deckend — **der Modulcharakter der
Tafel bleibt unangetastet.**

`[cmd]` **Nachher, hell:** alle gefaerbten Ueberschriften **4.58–5.23**,
keine unter 4.5. Dunkel unveraendert **7.2–10.13**.

---

## 2 · G-198 — es war ein DRITTES System

`[cmd]` **Gefunden:** `substanz-kacheln.ts` fuehrte `Kachel.ton` als
`'pos' | 'warn' | 'acc'` — **neben den vier Bedeutungen aus G-196 und
neben den Textkacheln, die G-196 bereits umgestellt hatte.**

**Drei Stellen betroffen:**

    GRAD_TON            A/B -> pos, C -> acc, D-F -> warn
    WADA-Kachel         prohibited -> warn
    .v2-supp-zahl-wert  drei CSS-Regeln mit den alten Namen

`[read]` **Und eine Zuordnung war unter der neuen Ordnung falsch:**
Grad **C trug `acc`**, also die WIRKUNGSfarbe — dabei sagt der
Evidenzgrad nichts ueber die Wirkung, sondern ueber die Beleglage.
**C bekommt jetzt keine Farbe:** *„gemischt belegt"* ist keine der
vier Aussagen.

`[cmd]` **Farbzuweisungen ausserhalb von `tonFuer`: 3 → 0.**

---

## 3 · Punkt 3 — die gemeinsame Form gibt es

**Auftrag: *„Miss, ob es eine gemeinsame Form gibt … Wenn es eine
gibt, bau sie einmal."***

`[cmd]` **Es gibt sie.** Alle sechs Faelle sind dieselbe Gestalt:
**ein Name, der die Anwendung mit ihren Daten verbindet und in keiner
Pruefung vorkommt.**

`[cmd]` **Gemessen 2026-08-26:**

    89 verdrahtete Namen (Tabellen, Sichten, RPC)
    35 davon in mindestens einem Test genannt
    54 in keinem

**`tools/verdrahtung-pruefen.mjs`** zaehlt sie und faellt, wenn ein
**unbewachter Zuwachs** dazukommt. `[read]` **Bestandsliste statt
Verbot** — 54 auf einmal zu beheben geht nicht, und ein Waechter, der
ab Tag eins rot ist, wird abgeschaltet (die Lehre aus
`ladekette-pruefen.mjs`).

**Befehl: `pnpm verdrahtung`.**

### Zwei Fehler in meinem eigenen Waechter

`[cmd]` **Erster:** `tests.includes(name)` blieb bei
`community_anzeigeX` gruen, **weil `includes` auf dem Teilstring
`community_anzeige` anschlug**, der im Test steht. **Das ist genau der
G-187-Fehler, reproduziert im Waechter gegen ihn.** Jetzt mit
Wortgrenze.

`[cmd]` **Zweiter:** das Muster verlangte `.from('name')` **mit
schliessender Klammer** — und fand mehrzeilige Aufrufe nicht.

`[cmd]` **Die Wortgrenze hat drei weitere Namen sichtbar gemacht**,
die vorher als Teilstring durchgingen: `adaptive_tdee`,
`muscle_groups`, `user_goals`.

---

## 4 · Die Einschraenkung — der Nachweis ist unvollstaendig

**Auftrag: *„Ein neuer Waechter, der sie nicht alle findet, loest das
Problem nicht."***

`[cmd]` **Negativprobe, drei Sabotagen:**

| Stelle | Waechter |
|---|---|
| G-199 `community_anzeige` → `…X` | **gruen** ✗ |
| G-187 `supplement_interactions` → `…Y` | **gruen** ✗ |
| **SECHSTE: `exercises` → `exercises_neu`** (Training) | **rot** ✓ |

`[read]` **Die Kernforderung ist erfuellt** — der Waechter findet eine
sechste, in ihm nicht genannte Stelle in einem Modul, das an keinem der
Faelle beteiligt war. **Das war die eigentliche Frage.**

`[read]` **Aber zwei bekannte Faelle bleiben gruen, und ich habe die
Ursache nicht gefunden.** Der Waechter erkennt beide Namen einzeln
korrekt (`--warum` zeigt `verdrahtet: true`), die Sabotage erzeugt
einen unbekannten Namen, und trotzdem faellt er nicht. **Ich habe rund
zehn Anlaeufe gebraucht und breche hier ab, statt weiter zu raten.**

`[read]` **Was das bedeutet:** der Waechter deckt den Zuwachs
(nachgewiesen), aber **ich kann nicht behaupten, dass er alle sechs
Altfaelle gefunden haette.** Bis das geklaert ist, bleiben die
Einzelwaechter aus G-184/187/191/196/199 stehen — **sie sind nicht
ueberfluessig geworden.**

---

## 5 · Pruefungen

| Pruefung | Ergebnis |
|---|---|
| `tsc --noEmit` (web) | sauber |
| volle Testreihe | **663 pass, 0 fail** |
| `tools/verdrahtung-pruefen.mjs` (neu) | 89 Namen, kein Zuwachs |
| `tools/encoding-pruefen.mjs` | 20.063 Dateien, sauber |
| `pnpm --filter @lumeos/web build` | Compiled successfully, 31/31 |

`[cmd]` **Zwei Tests mussten mit** (`substanz-kacheln.test.ts`) — sie
pruefen die Tonnamen und wurden auf die vier Bedeutungen gezogen,
nicht abgeschwaecht.

**Bilder:** `backup/g197-hell-1280.png`, `g197-dunkel-1920.png`.

**Der Dev-Server wurde NICHT neu gestartet** — durchgehend **PID
351936**.

**`supabase/_pipeline/` nicht angefasst** (C-286, Codex).
**Nicht committet, nicht gestaged.**

---

## 6 · Was ich als Befund melde

**a) Der Nachweis zu Punkt 3 ist unvollstaendig** — Abschnitt 4. Die
sechste Stelle wird gefunden, zwei bekannte nicht, Ursache offen.

**b) Der Teilstring-Fehler aus G-187 ist mir im Waechter gegen ihn
selbst unterlaufen.** `[read]` Das sagt etwas ueber die Fehlerklasse:
**sie ist nicht durch Aufmerksamkeit zu vermeiden**, sonst waere sie
mir hier nicht passiert.

**c) 54 von 89 verdrahteten Namen stehen in keinem Test.** Das ist der
Bestand, nicht der Zuwachs — aber es ist die Zahl, die die sechs
Faelle erklaert.

---

## Geaenderte Dateien

| Datei | Was |
|---|---|
| `tools/verdrahtung-pruefen.mjs` | **neu** — ein Waechter statt sechs |
| `package.json` | `pnpm verdrahtung` |
| `apps/web/src/app/v2/supplements/supplements.css` | Bloecke deckend, Tonnamen angeglichen |
| `apps/web/src/lib/supplements/substanz-kacheln.ts` | drittes Farbsystem auf `BlockTon` |
| `apps/web/src/lib/supplements/__tests__/substanz-kacheln.test.ts` | Tonnamen nachgezogen |
| `backup/g197-module.mjs`, `g197-wege.mjs` | Messskripte |
