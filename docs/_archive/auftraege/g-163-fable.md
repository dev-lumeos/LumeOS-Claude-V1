# G-163 (recovery + coach) — Fable, 2026-08-23

Bericht: `docs/berichte/g-163-fable.md`

---

## Rueckfallfassungen entfernen — recovery und coach

Tom hat am 2026-08-23 entschieden: **sie fliegen.**

## WAS ICH GEMESSEN HABE

`[cmd]` Marken je Datei, 2026-08-23:

    apps/web/src/app/v2/recovery/tab-protokolle.tsx   19
    apps/web/src/app/v2/recovery/tab-messwerte.tsx    10
    apps/web/src/app/v2/recovery/ansicht.tsx           5
    apps/coach/.../tab-rechte                          5

`[cmd]` Das Muster steht in `recovery/ansicht.tsx:66` — eine Konstante
`ATTRAPPE` mit dem Markentext, die als `attrappe={ATTRAPPE}` an jede
Karte gereicht wird.

`[cmd]` **Die Fassungen erscheinen im Betrieb nicht.** Sie greifen nur,
wenn der Lesepfad leer zurueckkommt. `recovery.checkins` traegt auf
`test-user@lumeos.local` 30 Zeilen, davon 8 mit `hrv_rmssd` und 30 mit
`sleep_hours` — der echte Pfad laedt.

`[cmd]` **Deshalb sind sie gefaehrlich, nicht nur ueberfluessig:** sie
verfaelschen jede Markenzaehlung. Am 2026-08-23 hat der Orchestrator
die 10 in `tab-messwerte.tsx` als offenes G-160 gemeldet — G-160 war
seit Tagen fertig.

## WAS ZU TUN IST

**Nur die Rueckfaelle entfernen, nicht die echten Attrappen.**
Unterscheidung: eine echte Attrappe hat **keinen** echten Zweig daneben.
Eine Rueckfallfassung steht im `else` eines Ausdrucks, dessen `then`
echte Daten liest.

An die Stelle des Rueckfalls tritt **eine leere Flaeche mit Hinweis**,
die sagt, dass nicht gelesen werden konnte. **Nicht ein Strich, keine
Null.** Aus G-161: *„auch nicht als Strich, denn ein Strich hiesse
‚leer' statt ‚gibt es nicht'."*

`[cmd]` **Diese bleiben Attrappe und behalten ihre Marke** — die
Geraetefunktion fehlt ganz: *„Phone camera HRV"* (`tab-messwerte.tsx`,
Begruendung steht in Zeile 258).

## WAS NICHT ZU TUN IST

`apps/web/src/app/v2/nutrition` und `.../supplements` **nicht
anfassen** — dort laeuft ein anderer Agent an derselben Sache.

Keine echte Attrappe entfernen, nur weil sie eine Marke traegt. **Im
Zweifel stehen lassen und melden.**

Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## NACHWEIS — Erwartung VOR dem Lauf, beide Richtungen

**Schreib die erwartete Markenzahl je Datei hin, bevor du misst.**

Gemessen wird mit `node tools/schuss.mjs` an der **gerenderten** Seite,
nicht am Quelltext — `[cmd]` G-161 hat sich genau daran vertan (5
gemeldet, 4 gerendert).

Vorher/nachher je Tab, angemeldet als `test-user@lumeos.local`.

**Gegenprobe:** eine Seite ohne Sitzung oder mit abgeschaltetem
Lesepfad muss den Hinweis zeigen — **nicht die alten erfundenen
Zahlen.** Wenn du den Rueckfall nicht ausloesen kannst, ist der Beleg
nicht gefuehrt.

**Negativprobe:** einen Rueckfall absichtlich wieder einbauen; die
Markenzaehlung muss steigen.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` oder `npx next dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Pruefschleifen als Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`.
Nachweise auf `test-user@lumeos.local`, nicht auf `dev`.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
