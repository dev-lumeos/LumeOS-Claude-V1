# G-196 — Claude Code, 2026-08-26

Bericht: `docs/berichte/g-196-claude-code.md`

**Die Farbordnung aus G-194 gilt erst an drei von acht Stellen.**

**Und vorweg, weil es dich Zeit gekostet hat:** `[cmd]` **die Datei
`docs/auftraege/g-194-claude-code.md` existiert.** Sie lag in
`docs/auftraege/wartend/`, als du nachgesehen hast — ich habe sie erst
danach zurueckgeholt. **Dein Befund war richtig, mein Zeitpunkt
falsch.**

---

## Was Tom am Bild sieht

**Tom, 2026-08-26**, an `AC-262356`:

    Reiter Fragen       Titel ohne Farbe
    Wechselwirkung      ohne Farbe
    Labor               ohne Farbe
    Dosierung           ueberall ohne Farbe
    Ueberblick          Ueberwachung, Reinheit, Beleglage, WADA

`[cmd]` Auf dem Bild stehen **UEBERWACHUNG** und **REINHEIT** weiterhin
grau — **die beiden, wegen denen G-194 ueberhaupt entstand.**

`[read]` **Die Ordnung selbst ist richtig und bleibt.** Vier
Bedeutungen, WADA ohne fuenfte Farbe, und du hast dabei zwei
G-184-Fehler korrigiert: `not_prohibited` hatte gar keine Farbe,
`monitored` trug die Wirkungsfarbe. **Beides gut gesehen.**

**Es fehlt die Anwendung, nicht die Regel.**

## WAS ZU TUN IST

**Die vier Bedeutungen auf alle Ueberschriften anwenden**, nach
derselben Zuordnung:

    gefahr       --warn        Bei zu viel · Was nicht zurueckkommt ·
                               Wer es nicht nehmen sollte
    wirkung      --acc         Wie es wirkt · Was es bringt · Im Labor
    pruefen      --acc-suppl   Ueberwachung · Reinheit · Nicht im Blut ·
                               Rechtslage · Zu wenig · Wann und wie
    entwarnung   --pos         Mythen

`[read]` **Zwei Faelle aus Toms Liste sind noch nicht zugeordnet:**

**Fragen** — `[read]` **keine der vier.** Eine Frage ist weder Gefahr
noch Wirkung. **Waehl und begruende:** entweder die Reiterfarbe wie
bisher, oder `--acc-suppl`, weil eine Antwort etwas klaert. **Wenn
keine passt, bleibt sie grau — und du sagst warum.**

**Wechselwirkungen** — `[read]` **`--warn`.** Eine Wechselwirkung ist
ein Risiko, kein Hinweis. `[cmd]` Der Block traegt seit G-187
Medikamenten-Interaktionen.

**Beleglage** — `[read]` **das ist eine Zahlenkachel, keine
Ueberschrift.** `[cmd]` Der Grad steht dort farbig (A gruen, D gelb).
**Miss, ob die Kachelbeschriftung eine Farbe braucht** — oder ob der
Wert darunter genuegt.

**WADA** — `[read]` **nicht anfassen.** `[cmd]` Der Block wandert mit
**G-195** in einen eigenen Reiter *Rechtslage*. **Zweimal umbauen ist
einmal zu viel.**

## Der Kontrastnachweis — meine Entscheidung

`[cmd]` **Du meldest: `--warn` liegt im Hellmodus bei 4.44 auf
getoentem Grund**, unter 4.5. Und die Messung an der gerenderten Seite
war unbrauchbar, weil `data-mode` von einem Startskript neu gesetzt
wird.

`[read]` **Dass du keine Tabelle geliefert hast, deren Zahlen du selbst
nicht glaubst, war richtig.** `[cmd]` Vierter Fall an zwei Tagen, in
dem eine Pruefung etwas anderes misst als gemeint — **und der erste,
bei dem es vor der Meldung auffiel.**

**Meine Entscheidung: die Toenung senken, nicht den Farbwert
aendern.**

`[read]` **Der Grund:** der Farbton ist im Designsystem verankert und
gilt modulweit — **wer ihn hier dunkler macht, hat elf Module mit zwei
Warntoenen.** Der Kachelgrund ist oertlich und aendert nichts ausserhalb
dieses Blocks.

`[cmd]` Und aus der Uebergabe: alle elf Modul-Akzenttoken liegen bei
Luminositaet 0.74–0.80 — **wer hier einen zwoelften Wert einfuehrt,
verschiebt das Problem in ein anderes Modul.**

**Zum Messproblem:** `[read]` **setz `data-mode` nicht zurueck, sondern
messe zweimal** — einmal mit erzwungenem Hellmodus, einmal dunkel, je
als eigener Lauf. **Wenn das Startskript es aus `prefers-color-scheme`
setzt, gib das der Browsersitzung mit, statt gegen das Skript zu
arbeiten.**

## WAS NICHT ZU TUN IST

**Keinen neuen Farbwert.** Nur vorhandene Tokens.
**Den WADA-Block nicht anfassen** — G-195.
**Keine Farbe ohne Bedeutung.**

`supabase/_pipeline/` nicht anfassen — Codex arbeitet an C-280.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

**Die Tabelle aus G-194, jetzt vollstaendig:** Ueberschrift →
Bedeutung → Token → Kontrast hell und dunkel. `[read]` **Diesmal
gemessen**, mit erzwungenem Thema je Lauf.

**Zahl der Ueberschriften ohne Farbe** — vorher und nachher. `[cmd]`
Erwartung vorher: alle ausser drei.

**Gegenprobe an einer Substanz je Reiter**, `AC-262356` ist Toms Fall.

**Negativprobe:** eine Ueberschrift auf einen Wert setzen, der nicht in
der Zuordnung steht — ein Waechter muss rot werden. `[read]` **Sonst
schleicht sich beim naechsten Block wieder Grau ein**, und genau das
ist hier passiert.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.

`[cmd]` **Der Dev-Server laeuft auf PID 351936.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
