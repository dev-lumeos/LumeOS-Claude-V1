# G-194 — Claude Code, 2026-08-26

Bericht: `docs/berichte/g-194-claude-code.md`

**Zwei Dinge aus Toms Durchsicht.**

---

## 1 · Der Quellen-Chip unten links ist hinfaellig

**Tom, 2026-08-26:** *„ich denke quellen unten links ist hinfaellig."*

`[cmd]` Auf seinem Bild zeigt der Chip unten links **„Quellen · 1"**,
der Reiter oben **„Quellen 4"** — **dieselbe Sache, zwei Zahlen, und
die untere ist falsch.**

`[read]` **Der Chip stammt aus der Zeit vor dem Quellen-Reiter** (G-182,
Punkt 4). Damals war er der einzige Hinweis, dass Belege existieren.
**Seit es den Reiter gibt, ist er ein zweiter Weg zur selben Sache —
und ein Weg mit falscher Zahl ist schlechter als keiner.**

**Zu tun:** raus. `[read]` **Miss vorher, woher seine Zahl kommt** —
wenn sie aus einer anderen Quelle stammt als die des Reiters, ist das
ein eigener Befund und gehoert genannt, bevor der Chip verschwindet.

## 2 · Farbige Ueberschriften in allen Bloecken

**Tom:** *„fuer ueberwachung und reinheit waeren passende
headerfarben noch machbar dass es zu den anderen 3 ins konzept passt,
auch die anderen reiter sollen die headertitel farben kriegen."*

`[cmd]` Heute farbig: **„Was nicht zurueckkommt"** (Warnfarbe),
**„Wie es wirkt"** und **„Was es bringt"** (Akzent, mit Symbol).
`[cmd]` Ohne Farbe: **„Ueberwachung"** und **„Reinheit"** —
`substanz-abschnitte.tsx:424`, `UeberwachungUndReinheit`.

`[read]` **Und Tom erweitert es auf alle Reiter:** *Bei zu viel* ·
*Wer es nicht nehmen sollte* · *Mythen* · *Nicht im Blut nachweisbar* ·
*Rechtslage* · *Wann und wie* · *Fragen* stehen heute in Grau.

### Die Farbe muss etwas bedeuten

`[read]` **Sonst ist es Dekoration.** Das Muster liegt schon vor:

    Warnfarbe   was schaden kann - "Was nicht zurueckkommt",
                "Bei zu viel", "Wer es nicht nehmen sollte"
    Akzent      wie es wirkt und was es bringt
    ?           was zu tun oder zu pruefen ist - "Ueberwachung"
    ?           was unsicher ist - "Reinheit", "Nicht im Blut",
                "Mythen"

`[read]` **Die letzten zwei Gruppen sind die Frage.** *Ueberwachung* ist
keine Warnung — sie sagt, was gemessen gehoert. *Reinheit* ist keine
Wirkung — sie sagt, dass der Inhalt unsicher ist.

**Waehl die Zuordnung und begruende sie.** `[read]` **Zwei
Bedingungen:** die Zahl der Farben bleibt klein — **vier sind eine
Ordnung, sieben sind ein Regenbogen** — und **dieselbe Bedeutung
bekommt ueberall dieselbe Farbe.** *Reinheit* im Ueberblick und
*Nicht im Blut* in der Sicherheit sagen dasselbe: **verlass dich nicht
darauf.**

`[cmd]` **Die Tokens liegen vor:** `--text-warning`, `--text-accent`,
`--text-success`, `--text-secondary`, `--text-muted` in
`styles/themes/lume.css` und `packages/ui/src/styles/v2.css`.

`[read]` **Keine neuen Farbwerte erfinden.** `[cmd]` Aus der Uebergabe:
alle elf Modul-Akzenttoken liegen bei Luminositaet 0.74–0.80 —
**wer hier einen eigenen Wert setzt, verschiebt das Problem.**

### Der WADA-Block gehoert dazu

`[cmd]` **G-184 laeuft parallel und baut ihn gerade** — `note_de` bei
320 von 320, mit `wada_category` bei allen 145 verbotenen.

`[read]` **Nimm ihn in dieselbe Ordnung auf.** Er ist der schwierigste
Fall, weil er **drei Zustaende** traegt: `prohibited` (145),
`not_prohibited` (172), `monitored` (3).

`[read]` **Und die drei bedeuten Verschiedenes:** *verboten* ist eine
Warnung. *Erlaubt* ist eine Entwarnung — **und Entwarnung in
Warnfarbe waere falsch.** *Beobachtet* ist keins von beidem.

`[read]` **Das ist der Pruefstein deiner Zuordnung:** wenn die Regel
hier traegt, traegt sie ueberall. **Wenn du dafuer eine fuenfte Farbe
brauchst, ist die Ordnung zu fein.**

### Kontrast pruefen, nicht schaetzen

`[read]` Die Ueberschriften sind klein und in Grossbuchstaben.
**Miss den Kontrast gegen den Kachelgrund** — hell und dunkel. **Was
unter 4,5:1 liegt, ist keine Ueberschrift, sondern ein Farbfleck.**

## WAS NICHT ZU TUN IST

**Keine neuen Farbwerte.** Nur vorhandene Tokens.
**Keine Farbe ohne Bedeutung.**
**Keinen Text aendern.**

`supabase/_pipeline/` nicht anfassen — Codex arbeitet an C-280.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

**Eine Tabelle: Ueberschrift → Bedeutung → Token → Kontrastwert**,
hell und dunkel. `[read]` **Sie ist der Nachweis, nicht das Bild** —
sie zeigt, ob die Zuordnung eine Regel ist oder eine Aneinanderreihung.

**Zahl der verwendeten Farben.** `[read]` Ueber vier gehoert
begruendet.

**Gegenprobe:** *Reinheit* und *Nicht im Blut nachweisbar* tragen
dieselbe Farbe — **oder du begruendest, warum nicht.**

`node tools/schuss.mjs`, **beide Themen**, alle vier Reiter bei einer
Enhanced-Substanz. `[cmd]` **Testosterone Enanthate** ist der Fall auf
Toms Bild.

**Negativprobe fuer Punkt 1:** der Chip darf nach dem Ausbau nirgends
mehr im DOM stehen — als Test, nicht am Bild.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.

`[cmd]` **Der Dev-Server laeuft auf PID 351936** — Tom sieht sich den
Katalog an. **Nicht neu starten.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
