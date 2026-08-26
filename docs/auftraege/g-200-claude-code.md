# G-200 + G-201 — Claude Code, 2026-08-26

Bericht: `docs/berichte/g-200-claude-code.md`

**Zwei Reste aus G-197 — und beide betreffen die Pruefungen selbst,
nicht das Produkt.**

---

## Vorweg

`[read]` **Zahlen im Auftrag sind Ausgangsvermutungen. Pruef sie
zuerst.**

`[read]` **Und dieser Auftrag hat kein Zeitfenster.** Tom geht
schlafen; wenn du bei Punkt 1 nicht weiterkommst, ist das ein
Ergebnis. **Zehn weitere Anlaeufe sind keins.**

## 1 · G-200 — zwei bekannte Faelle bleiben gruen

`[cmd]` **`tools/verdrahtung-pruefen.mjs` steht:** 89 verdrahtete
Namen, **54 in keinem Test.** Die sechste, nicht genannte Stelle
(`exercises` in Training) wird gefunden — **die Kernforderung ist
erfuellt.**

`[cmd]` **Aber zwei der fuenf bekannten Faelle fallen nicht.** Der
Waechter erkennt beide Namen einzeln korrekt, die Sabotage erzeugt
einen unbekannten Namen — **er faellt trotzdem nicht.**

`[read]` **Du hast nach zehn Anlaeufen abgebrochen. Das war richtig**,
und ich will nicht, dass daraus zwanzig werden.

### Die Frage ist eine andere geworden

`[read]` **Nicht: wie bringe ich den Waechter dazu, sie zu finden.**
Sondern: **was unterscheidet diese beiden von den anderen 87?**

`[read]` **Miss die Faelle gegeneinander**, statt den Waechter weiter
zu aendern. Liegt der Name in einer anderen Datei-Art? Steht er in
einem Kommentar? Wird er ueber eine Variable erreicht statt woertlich?
**Ein Unterschied, den du benennen kannst, ist mehr wert als ein
Waechter, der zufaellig faellt.**

`[read]` **Und wenn du ihn findest, aber nicht schliessen kannst:**
schreib ihn in den Waechter als bekannte Luecke, mit Namen. `[cmd]`
**Der Kennungswaechter aus C-267 macht es so** — drei bekannte
Konflikte als Ausnahme, ein vierter macht rot. **Eine benannte Luecke
ist ehrlich, eine unsichtbare nicht.**

`[cmd]` **Die Einzelwaechter aus G-184, G-187, G-191, G-196 und G-199
bleiben stehen**, solange das offen ist. **Nicht anfassen.**

## 2 · G-201 — Teilstring-Vergleiche brauchen Wortgrenzen

`[read]` **Dein Befund, und er ist der wertvollste des Tages:**

`[cmd]` **Der Teilstring-Fehler aus G-187 ist dir im Waechter GEGEN
diesen Fehler unterlaufen** — `includes` traf `community_anzeige` in
`community_anzeigeX`. `[cmd]` **In G-187 traf
`/daten\?\.wechselwirkungen/` auch `…wechselwirkungenX`.**

`[read]` **Deine Einordnung:** *„Das sagt, dass diese Klasse nicht
durch Aufmerksamkeit vermeidbar ist."* **Damit ist es keine Ermahnung
mehr, sondern eine Bauvorschrift.**

### Zu tun

**a) Die Regel nach `CLAUDE.md`**, neben die uebrigen
Werkzeugregeln: **wer einen Namen in einem Waechter sucht, sucht ihn
mit Wortgrenze** — `\b`, Zeichenklasse oder exakter Vergleich. **Nie
`includes`, nie ein unverankertes Muster.**

**b) Pruefen, ob eine Pruefung moeglich ist.** `[read]` Ein Waechter,
der `includes` und unverankerte Muster in `tools/*-pruefen.mjs`
findet.

`[cmd]` **Miss zuerst, wie viele Stellen betroffen waeren.** `[read]`
**Wenn es zwei sind, ist ein Waechter Ueberbau — dann richte sie und
lass es bei der Regel.** Wenn es zwanzig sind, ist er faellig.

`[read]` **Und der Waechter darf nicht denselben Fehler machen** —
**das ist die Pointe: ein Waechter gegen unverankerte Muster, der
selbst eines benutzt, ist die dritte Auflage desselben Fehlers.**

## WAS NICHT ZU TUN IST

**Die fuenf Einzelwaechter nicht entfernen** — G-200 ist offen.
**Nicht am Produkt arbeiten.** `[read]` Beide Punkte betreffen
`tools/` und die Tests.
**Keine zwanzig Anlaeufe.** Wenn Punkt 1 nicht aufgeht: **melden, mit
dem, was du ueber die zwei Faelle herausgefunden hast.**

`supabase/_pipeline/` nicht anfassen — Codex arbeitet an C-289.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

**Fuer Punkt 1:** was unterscheidet die zwei Faelle von den 87? **Eine
Antwort, auch wenn sie „nicht gefunden" lautet — dann mit dem, was du
ausgeschlossen hast.**

**Fuer Punkt 2:** Zahl der Stellen mit `includes` oder unverankertem
Muster in `tools/`. **Vor der Entscheidung ueber den Waechter.**

**Negativprobe, falls du einen baust:** er muss sich selbst finden,
wenn du ihn absichtlich unverankert schreibst.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.

`[cmd]` **Der Dev-Server laeuft auf PID 351936** — nicht neu starten.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
