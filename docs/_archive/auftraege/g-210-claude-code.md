# G-210 — Claude Code, 2026-08-27

Bericht: `docs/berichte/g-210-claude-code.md`

**Tom hat nach Scemblix gesucht und nichts gefunden. Scemblix steht in
der Datenbank.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.** `[read]` **In G-208 hast du meine `drug_class`-Zahl
korrigiert** — 15 statt 9, wegen Fallverdopplung. **Denselben Blick
brauche ich hier auf die Marken.**

## 1 · Der Befund

`[cmd]` **Vom Orchestrator gemessen, nachdem Tom es gemeldet hat:**

    medication_products              448 Zeilen, 428 verschiedene Marken
    davon 'Scemblix'                   2  (Novartis, Novartis Canada)
      -> formulation -> drug_0642bd1e2f  Asciminib
    davon 'Concor'                     0

`[cmd]` **Die Verknuepfung existiert und traegt:**
`medication_products.formulation_id` → `medication_formulations.id` →
`.active_substance_id` → `medication_active_substances.id`.

`[cmd]` **453 Formulierungen auf 390 Wirkstoffe, 448 Produkte** —
aber nur **124 Wirkstoffe** haben ueberhaupt ein Produkt.

`[read]` **Der Katalog aus G-208 sucht nur in
`medication_active_substances`.** Handelsnamen liegen eine Ebene
tiefer. **Niemand sucht nach *Asciminib*. Menschen suchen nach dem
Namen auf der Packung.**

## 2 · Zu tun

**Die Suche muss `brand_name` mitdurchsuchen und den Treffer auf den
Wirkstoff aufloesen.**

**Der Treffer zeigt, warum er ein Treffer ist.** `[read]` Wer
*Scemblix* eingibt und *Asciminib* bekommt, muss sehen, dass das
dasselbe ist — sonst wirkt es wie ein Fehler. **Marke, Hersteller und
der Weg zum Wirkstoff gehoeren in die Trefferzeile.**

`[cmd]` **Eine Marke kann mehrfach vorkommen** — Scemblix zweimal, mit
verschiedenen Herstellerschreibweisen (`Novartis` und
`NOVARTIS PHARMACEUTICALS CANADA INC`). **Ein Wirkstoff darf in der
Ergebnisliste trotzdem nur einmal stehen.**

## 3 · Was der Nutzer nicht findet, und warum

`[cmd]` **`jurisdictions` je Produkt:**

    US                    324
    CA                     56
    TH,US,EU,UK,CA,AU      56
    TH                      6
    UK                      4
    AU                      2
    DE                      0

`[read]` **Das ist keine Sprachfrage, sondern eine Marktfrage.**
Recherchiert: Bisoprolol heisst in den USA **Zebeta**, in
Grossbritannien **Cardicor** oder **Emcor**, in Oesterreich, Brasilien,
China und weiteren **Concor** — dazu **Bicor**, **Biso**, **BisoABZ**,
**Bisomerck**, **Bisobloc**, **Cardensiel**, **Monocor**, **Soprol**.
**Ein Wirkstoff, mindestens fuenfzehn Marktnamen.**

`[read]` **Scemblix ist der andere Fall:** weltweit derselbe Name, USA
2021, EU 2022. **Beide Faelle muss dieselbe Suche aushalten.**

**Deshalb, wenn nichts gefunden wird:** `[read]` **nicht schweigen.**
Wenn ein Suchwort weder Wirkstoff noch Marke trifft, gehoert gesagt,
dass der Katalog Handelsnamen nur fuer bestimmte Maerkte kennt —
**und welche.** `[read]` **Ein leeres Ergebnis ohne Erklaerung sieht
aus wie *,,gibt es nicht"*, und das ist bei Concor falsch.**

## 4 · WAS NICHT ZU TUN IST

**Keine Marken erfinden, ableiten oder aus dem Wirkstoffnamen
erzeugen.** `[read]` **Das waere dieselbe Klasse Fehler wie
`b?.abbr ?? m`** — nur schlimmer, weil ein falscher Handelsname zu
einem falschen Medikament fuehrt.
**Keine Produktdaten nachtragen** — das ist **C-308** und braucht
zuerst eine Quellenentscheidung von Tom.
**Keine Tabelle anlegen**, `supabase/_pipeline/` gehoert Codex (C-305
laeuft dort).
**Kein Erfassungsweg** — C-302.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

    Suche "Scemblix"        findet Asciminib
    Suche "scemblix"        desgleichen, Gross/Klein egal
    Suche "Asciminib"       findet ihn weiter
    Suche "Concor"          leer, MIT Erklaerung
    Marken durchsuchbar     Zahl, Soll 428
    Wirkstoffe je Treffer   einmal, auch bei zwei Produkten
    Ladezeit                ms, warm und kalt getrennt
    Bildschirmfoto          `node tools/schuss.mjs`

`[read]` **Negativprobe:** einer Marke testweise die
`formulation_id` entziehen — **der Treffer muss verschwinden oder sich
als unaufloesbar zeigen, nicht auf einen falschen Wirkstoff fallen.**
Danach zurueckrollen und die Zeilenzahl gegenpruefen.

`[cmd]` **Der Fall ist nicht erfunden:** von 448 Produkten haengen
nicht alle sauber an einer Formulierung — pruef das mit und nenn die
Zahl.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205, nicht dein
Fehler). `python tools/server.py start`, nie `pnpm dev`.
`[cmd]` **A-30 aus G-208 im Kopf behalten:** kein Wert-Import aus dem
Leseweg in eine Browserdatei.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
