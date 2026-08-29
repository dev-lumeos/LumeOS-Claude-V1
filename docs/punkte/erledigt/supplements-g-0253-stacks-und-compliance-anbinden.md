---
nr: G-253
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: G-240
entscheidung: null
beruehrt:
  tabellen: [supplements.user_stacks, supplements.stack_items, supplements.intake_logs]
  dateien: [apps/web/src/app/v2/supplements/tabs.tsx]
zahlen: null
agent: claudecode
beauftragt: 2026-08-29
erledigt: 2026-08-29
commit: 618fa72a
---

# G-253 — Stacks und Compliance anbinden

## Befund

**Aus G-240, Claude Code, 2026-08-28** — deine eigene Bauliste:

`[read]` *,,Sofort baubar: `stacks` (4 Attrappen, `user_stacks` wird
bereits geladen) und die Kalenderansicht von `compliance`
(`intake_logs` traegt Zeilen). Dort fehlt weder Tabelle noch
Entscheidung — das ist der naechste Bauauftrag."*

`[read]` **Elf Reiter im Mockup, elf gebaut, eins zu eins** — was
fehlt, ist die Anbindung zweier davon.

## Auftrag

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
`[cmd]` **Und der gebaute `/v2/`-Stand ist der Massstab** —
`theme-v1` nur nachschlagen, wenn etwas fehlt und die Frage ist, wie
es gemeint war. **Der Baum ohne `/v2/` bleibt unberuehrt.**

`[cmd]` **Die Seed-Daten reichen bis November 2026** — eine offene
Datumsgrenze faengt alles Zukuenftige mit. **Das hat dich in G-11
fast einen Fehlbefund gekostet.**

### 1 · Stacks

`[cmd]` **`user_stacks` wird bereits geladen**, `stack_items` haengt
darunter, **und seit G-138 gibt es einen Schreibweg fuer Einnahmen.**

`[read]` **Miss zuerst, was der Reiter heute zeigt und woher es
kommt.** **Vier Attrappen — woran haengt jede?**

### 2 · Compliance, Kalenderansicht

`[cmd]` **`intake_logs` traegt Zeilen mit `status` (`taken`,
`skipped`) und den vier `_snapshot`-Spalten aus G-138.**

`[read]` **Ein Kalender zeigt Tage, an denen etwas war — und Tage,
an denen nichts war.** `[read]` **Das sind zwei verschiedene
Aussagen:** nicht genommen und nicht erfasst. **Dieselbe
Unterscheidung, die du in C-48 fuer das Tagebuch gebaut hast.**

### Was nicht zu tun ist

**Keine zweite Ansicht neben eine bestehende bauen.** `[read]`
**Dreimal ist das passiert** — G-249 im Nutrients-Reiter, G-11 im
Insights-Reiter, und beide Male musste es wieder raus. **Miss zuerst,
ob der Reiter das schon zeigt.**
**Keine Tabelle anlegen** — Codex arbeitet an Recovery.
**Kein Katalogausbau.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Attrappen im Reiter          vorher / nachher, am Schirm gezaehlt
    Stacks: Datenquelle          je Kachel benannt
    Compliance: zwei Leerlagen   unterscheidbar - Bildschirmfoto
    Doppelung                    zeigt der Reiter etwas zweimal?
    Ladezeit                     ms, kalt und warm getrennt
    Bildschirmfoto je Zustand    `node tools/schuss.mjs`

`[read]` **Die vierte Zeile ist die, die ich dreimal uebersehen
habe.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205), und eine
Messung vor dem Neukompilieren zeigt alte Zahlen.
`[cmd]` **A-30, A-59, A-60 beachten** — kein Wert-Import aus dem
Leseweg, Attrappen am Schirm zaehlen, keine `Map` ueber die
Client-Grenze.
`[read]` **Und eine Sabotage, die nicht faellt, kann zweierlei
heissen** — der Waechter taugt nichts, oder die sabotierte Stelle ist
wirkungslos.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Claude Code, 2026-08-29.** Nutzer `dev@lumeos.app`, Stichtag
2026-08-29, Zeitraum je Messung genannt.

### Die Kurzfassung

**Compliance brauchte nichts.** Der Reiter zeigt die Unterscheidung
bereits — mit Kalender, Legende und einem Satz. **Gebaut wurde nur
Stacks: 4 Attrappen auf 0.**

**Und die Nachweiszeile, die dreimal uebersehen wurde, hat diesmal
zugeschlagen:** ich hatte fuer „My stacks" einen neuen Leser
(`ladeStackListe`) geschrieben und wieder verworfen —
**`ladeEigeneStacks` laedt die Liste seit C-229 bereits**, ihr fehlten
nur drei Felder. Erweitert statt danebengestellt.

### Die Nachweiszeilen

| Zeile | Ergebnis |
|---|---|
| Attrappen im Reiter | **stacks 4 -> 0**, compliance **0 -> 0** — am Schirm gezaehlt (A-59) |
| Stacks: Datenquelle | je Kachel benannt, siehe unten |
| Compliance: zwei Leerlagen | **unterscheidbar, war es schon** — Bildschirmfoto |
| Doppelung | **keine** — kein Kartentitel kommt zweimal vor, in keinem der beiden Reiter |
| Ladezeit | stacks **3.389 ms kalt / 2.727 ms warm**, compliance **3.250 / 2.715** |

### 1 · Compliance war schon gebaut — nichts angefasst

`[cmd]` **Gemessen vor jeder Aenderung: 0 Attrappen, 3 echte Karten.**
`ComplianceEcht` (`tab-inventory-echt.tsx:203`) unterscheidet die
beiden Leerlagen bereits auf drei Wegen:

    Farbe     `quotenFarbe(null)` -> `var(--surface-2)` (grau)
              `quotenFarbe(0)`    -> `var(--neg)` (rot)
    Titel     `${t.datum}: nichts erfasst` gegen `x von y`
    Legende   ein eigener Eintrag „nichts erfasst"
    Satz      „Leere Felder heissen: an diesem Tag wurde nichts
              erfasst. Das ist etwas anderes als 'nichts genommen'."

`[cmd]` **Und beide Lagen kommen in den Daten wirklich vor** — dev,
90 Tage bis 2026-08-29: **10 Tage nichts erfasst, 7 Tage erfasst und
nichts genommen, 73 Tage mit Einnahme.** 320 Eintraege auf 80 Tagen,
292 genommen, 28 ausgelassen.

`[read]` **Ein zweiter Kalender waere die vierte Doppelung nach G-249
und G-11 gewesen.** Deshalb: nichts gebaut, und ein Test, der es
verhindert (siehe Sabotage 6).

**Befund, nicht behoben:** `SuppCompliance` in `tab-compliance.tsx:35`
traegt eine Umschaltung Heatmap/Kalender. `[cmd]` **Sie ist mit echten
Daten nicht erreichbar** — `ansicht.tsx:314-318` rendert
`ComplianceEcht`, sobald `einnahmen.length > 0`, und faellt nur ohne
Daten auf `SuppCompliance` zurueck. Der Playwright-Klick auf
„Calendar" lief deshalb in einen Timeout; **das war kein Skriptfehler,
sondern der Befund.** Toter Zweig — gemeldet, nicht angefasst.

### 2 · Stacks: woran jede der vier Kacheln haengt

`[cmd]` **Gemessen am 2026-08-29:**

| Kachel (vorher) | Quelle | Lage |
|---|---|---|
| My stacks | `supplements.user_stacks` | dev **1 Zeile**, Bestand **3** — angebunden |
| System templates | `supplements.stack_templates` | **existiert, 0 Zeilen** (`stack_template_items` 0) |
| Frequency options | `stack_items.frequency` | Bestand **ein Wert: `daily`, 11x**; dev 4 von 4 |
| Item customization | `stack_items` | `dose`, `dose_unit`, `timing`, `frequency`, `cycling`, `notes` — angebunden |

**Drei von vier laufen jetzt ueber Daten, die die Seite ohnehin
laedt** (`StackDaten.positionen` und `ladeEigeneStacks`).

**Die vierte nicht, und das ist der Befund:** `stack_templates`
existiert als Tabelle und ist leer. `[read]` **Eine leere Tabelle ist
kein fehlender Bau, sondern fehlender Inhalt** — ihn zu erfinden waere
Katalogausbau, und der ist ausgeschlossen. Die Kachel sagt es jetzt
im Klartext: *„Fuer Vorlagen gibt es eine Tabelle, aber noch keinen
Inhalt. Das ist kein Fehler in der Anzeige."*

`[read]` **Der Satz ist der Punkt** — sonst sucht der naechste den
Fehler in der Oberflaeche. Das ist dieselbe Dreiteilung wie in G-208
und G-239: **keine Tabelle / Tabelle ohne Inhalt / Inhalt da.**

### 3 · Der verworfene zweite Leser

**Der Auftrag warnte davor, und es waere trotzdem passiert.**

`getStackDaten` laedt nur den **aktiven** Stack (`.eq('is_active',
true).limit(1)`) — ein eindeutiger Index laesst je Nutzerin nur einen
zu. Die Kachel „My stacks" braucht die **Liste**. Ich hatte dafuer
`ladeStackListe` in `stack-read.ts` geschrieben, samt eigenem Typ
`StackZeile`.

`[cmd]` **Beim Verdrahten fiel auf: `ansicht.tsx:123` fuehrt bereits
eine Eigenschaft `stacks: EigenerStack[]`**, gespeist von
`ladeEigeneStacks` (`substanz-read.ts:1130`) — dieselbe Tabelle,
dieselbe Sortierung, nur ohne Postenzahl, Ziel und Datum.

**Also: neuen Leser geloescht, den bestehenden um drei Felder
erweitert.** Eine Naht je Ziel.

### 4 · Was gebaut wurde

    stack-lage.ts                    NEU, serverfrei (A-30)
      vorlagenLageVon / VORLAGEN_LEER_SATZ   Tabelle leer vs. gefuellt
      stackListeSatz                         kein Stack / keiner aktiv
      frequenzSatz                           nur belegte Werte nennen
      NAME_LUECKE_SATZ                       Befund, nicht gefuellt

    substanz-read.ts   ladeEigeneStacks erweitert: posten, goal,
                       seit, quelle. Postenzahl in EINER Abfrage
                       ueber `.in('stack_id', ids)`, nicht je Stack.

    tab-spec.tsx       SuppStacks liest jetzt `useSupp()`.
                       Vier Kacheln, keine `attrappe`-Marke mehr.

    __tests__/stack-lage.test.ts     11 Tests

`[cmd]` **Keine `Map` ueber die Client-Grenze** (A-60) — die
Frequenzen werden im Browser aus `positionen` gezaehlt, per `useMemo`.
`[cmd]` **Kein Wert-Import aus dem Leseweg** (A-30) — `stack-lage.ts`
importiert nur den Typ `EigenerStack`.

### 5 · Die Sabotagen — 6 von 6 fallen

Jede einzeln, Rueckbau bytegleich per SHA-256 geprueft.

| # | Sabotage | Test faellt | Rueckbau |
|---|---|---|---|
| 1 | leere Tabelle als gefuellt ausgeben | ja | bytegleich |
| 2 | Satz fuer „kein Stack" faellt weg | ja | bytegleich |
| 3 | eine einzige Frequenz nicht mehr benennen | ja | bytegleich |
| 4 | der Reiter benutzt die Stack-Liste nicht mehr | ja | bytegleich |
| 5 | der Vorlagenzustand wird nicht geprueft | ja | bytegleich |
| 6 | **eine ZWEITE Compliance-Ansicht daneben** | ja | bytegleich |

`[read]` **Sabotage 6 ist die, um die es geht.** Der Waechter zaehlt
die Komponenten im `compliance`-Zweig und verlangt genau zwei in
genau dieser Reihenfolge — **`ComplianceEcht` mit Daten,
`SuppCompliance` ohne.** Wer eine dritte danebenstellt, faellt.
**Wirkung, nicht Wort:** ein `includes('ComplianceEcht')` haette die
Doppelung durchgelassen.

**Und der Frequenzsatz wurde nach der ersten Messung berichtigt.**
`[cmd]` Er sagte *„Im Bestand kommt nur 'daily' vor (4x)"* — **4 ist
dev, der Bestand hat 11.** Der Satz behauptete einen Ausschnitt als
Ganzes. Jetzt: *„Alle 4 Eintraege nutzen 'daily'."* Ein Test haelt es
fest (`assert.doesNotMatch(s, /Bestand/)`).

### 6 · Gate und Testlage

`[cmd]` **`pnpm gate`: 11 von 11 Aufgaben, gruen.** Typecheck sauber,
`[serverimport]` 51 Client-Chunks, 0 Treffer.

`[cmd]` **Alle Supplements-Tests: 230 von 230 gruen.**

`[cmd]` **Ein bestehender Test musste nachgezogen werden:**
`tabs-vollstaendig.test.ts` zaehlt die Attrappenmarken in
`tab-spec.tsx` und stand auf 16. Jetzt 12. **Er sagt selbst, was zu
tun ist** (*„Angebunden? Dann die Erwartung hier senken"*) — und er
ist der Grund, warum die vier Marken nicht unbemerkt verschwinden
konnten.

### 7 · Zwei Befunde, nicht behoben

**a) Drei Attrappen-Konstanten haben keinen Aufrufer mehr.**
`[cmd]` `USER_STACKS`, `STACK_TEMPLATES`, `FREQUENCY_OPTIONS` in
`spec-daten.ts` werden von keiner Anzeige mehr gelesen — nur noch von
`spec-daten.test.ts:74-76`, der prueft, dass sie nicht leer sind.

`[read]` **Nach A-59 gehoeren sie geloescht** — Code ohne Aufrufer
wird beim naechsten Mal fuer gebaut gehalten. **Ich habe es nicht
getan:** die Datei ist geteilt, und in G-249 war das Loeschen eine
ausdrueckliche Entscheidung von Tom, keine Nebenwirkung eines
Anbindungsauftrags. **Zur Entscheidung vorgelegt.**

**b) Zwei Posten von dev tragen kein `name_de`.**
`[cmd]` „Creatine monohydrate" und „Omega-3 (EPA/DHA)" stehen nur in
`name_en`. Der Leseweg faellt bereits zurueck (`anzeigename`), die
Anzeige ist also richtig — **die Luecke steht in den Daten.** Gemeldet,
nicht gefuellt (kein Katalogausbau).

### 8 · Was eingehalten wurde

Nichts auf `dev@lumeos.app` geschrieben — **der Auftrag brauchte
keinen Schreibnachweis**, es wurde nur gelesen. Keine Tabelle
angelegt, kein Katalogausbau, `food_search` nicht beruehrt, der Baum
ohne `/v2/` nicht angefasst. **Nicht committet, nicht gestaget.**

**Bildschirmfotos:** `backup/g253-vorher-stacks.png`,
`g253-vorher-compliance.png`, `g253-nachher-stacks.png`,
`g253-nachher-compliance.png`.

## Abnahme

**2026-08-29, Orchestrator.**

`[cmd]` **Stacks: 4 Attrappen auf 0.** `[cmd]` **Compliance: 0 vorher,
0 nachher** — es brauchte nichts.

### Die Doppelungsprobe hat zum ersten Mal gegriffen

`[read]` **Compliance unterschied die zwei Leerlagen bereits
vierfach** — graue Flaeche gegen rot, Kurztext *,,nichts erfasst"*,
Legende, ausgeschriebener Satz. `[cmd]` **Und beide Lagen kommen in
den Daten vor:** ueber 90 Tage 10 ohne Erfassung, 7 erfasst ohne
Einnahme, 73 mit.

`[read]` **Ein zweiter Kalender waere die vierte Doppelung gewesen** —
nach G-249, G-11 und der Micronutrient-Trend-Kachel, die er in G-11
bereits verweigert hat.

`[read]` **Und bei den Stacks hat sie ihn mitten im Bau erwischt:**
er hatte `ladeStackListe` geschrieben, **dann in `ansicht.tsx:123`
gefunden, dass `ladeEigeneStacks` dieselbe Tabelle bereits laedt** —
nur drei Felder fehlten. **Neuen Leser geloescht, vorhandenen
erweitert.**

`[read]` **Das ist die Nachweiszeile, die ich dreimal uebersehen
habe, angewandt waehrend der Arbeit statt danach.**

`[cmd]` **Und die vierte Karte ist der Befund:** `stack_templates`
existiert mit **0 Zeilen** — die Karte sagt das, statt erfundene
Vorlagen zu zeigen. **Sie zu fuellen waere Katalogausbau.**

`[cmd]` 6 von 6 Sabotagen fallen, Rueckbauten sha256-identisch,
**darunter eine, die eine zweite Compliance-Ansicht einfuegt.**
230/230 Tests, Gate 11/11, Encoding ueber 20.604 Dateien.

### Die zwei gemeldeten Auffaelligkeiten sind meine

`[cmd]` **`scratchpad/`** ist mein Arbeitsverzeichnis — je Handgriff
ein Python-Skript, nach jedem Commit geleert. **Es stand nicht in
`.gitignore`. Jetzt schon.** `[read]` **Er hatte recht, es zu
melden.**

`[cmd]` **`backup/c276/supplement-kern-dubletten.json`** ist **G-202**:
der Dublettenpruefer schreibt bei jedem Gate-Lauf eine neue
Pruefsumme, weil nur `checked_at` sich aendert. **Seit dem 27.08.
bekannt, ich setze die Datei vor jedem Commit zurueck.**

**Abgenommen.** Die drei Attrappen-Konstanten gehen als **G-255** an
Tom.

