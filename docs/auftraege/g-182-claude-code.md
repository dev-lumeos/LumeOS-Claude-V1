# G-182 — Claude Code, 2026-08-25

Bericht: `docs/berichte/g-182-claude-code.md`

**Vier Fehler, keine Geschmacksfragen.** Alle auf Toms Bildschirmfotos
vom 2026-08-25 sichtbar.

**Tom:** *„am morgen frueh schon am verzweifeln, weder state of the art
noch wirklich wie man sowas loest."*

---

## 1 · Der Filter haengt — Grundlagenfehler

**Tom:** *„waehle ich zb enhanced/fatburner und danach supplements
kommt nichts mehr weil er die subkategorie nicht auf alle
zuruecksetzt und immer noch auf fatburner steht."*

`[read]` **Ein Kategoriefilter aus einer anderen Gruppe bleibt aktiv,
wenn die Gruppe wechselt.** `fatburner` gibt es unter `supplements`
nicht — die Liste ist leer, und der Nutzer sieht nicht warum.

**Zu tun:**

- **Gruppenwechsel setzt die Kategorie auf `Alle` zurueck.**
- Die Kategorieleiste zeigt nur Kategorien, die es in der gewaehlten
  Gruppe gibt.
- **Wenn ein Filterstand 0 Treffer ergibt: sagen warum**, nicht eine
  leere Liste zeigen. *„Keine Treffer — Filter zuruecksetzen"* mit
  Knopf.

`[read]` **`Alle` ist in G-181 dazugekommen und ist richtig** — es
loest aber nur das Abwaehlen, nicht den Gruppenwechsel. **Die
Zustandsfuehrung ist der Fehler, nicht der fehlende Knopf.**

**Nachweis:** `enhanced` → `fatburner` → `supplements`. Die Liste muss
182 Eintraege zeigen, die Kategorie auf `Alle` stehen. **Als Test, nicht
als Bild** — dieser Fall muss dauerhaft bewacht sein.

## 2 · Derselbe Kasten steht auf jedem Reiter

`[cmd]` Auf Toms Bildern 3, 4 und 5 steht **„WAS NICHT ZURUECKKOMMT"
identisch** unter *Ueberblick*, *Dosierung* **und** *Sicherheit* —
dreimal derselbe Text, jedes Mal die halbe Tafel.

**Tom:** *„es gibt keinen grund oben ueberall dasselbe zu zeigen."*

`[read]` **Der Kasten gehoert in den Ueberblick, einmal.** Auf den
anderen Reitern nimmt er den Platz weg, den ihr eigener Inhalt braucht
— bei *Dosierung* bleiben dadurch zwei Zeilen uebrig.

**Zu tun:** Der Enhanced-Kasten erscheint **nur im Ueberblick**. Die
Reiter *Dosierung* und *Sicherheit* zeigen ihren eigenen Inhalt.

## 3 · Die obere Kachel ist unstrukturiert

**Tom:** *„peptide detail sieh selber rein erste obere kachel
unstrukturiert."*

`[cmd]` Im Enhanced-Kasten stehen drei Dinge untereinander ohne
Gliederung: der Fliesstext zu *irreversibel*, dann `Ueberwachung` und
`Reinheit` als Zeilen mit **rechtsbuendigem Fliesstext**.

`[read]` **Rechtsbuendiger Fliesstext ueber vier Zeilen ist unlesbar.**
Die Rechtsbuendigkeit war fuer **Zahlen** gedacht, nicht fuer Saetze.

**Zu tun:** die drei als **eigene Kacheln nebeneinander**, wie im
Ueberblick — `Was nicht zurueckkommt` · `Ueberwachung` · `Reinheit`,
je mit Ueberschrift und **linksbuendigem** Text.

## 4 · Der Quellen-Knopf tut nichts

**Tom:** *„quellen haben keine funktion."*

`[cmd]` Der Chip *„Quellen · 7"* steht unten und reagiert nicht.
`[cmd]` Die Daten liegen vor: `sources` als `jsonb` an
`supplement_user_texts` und `supplement_faq`, **290/290 und 1.279/1.279
gefuellt** (C-264).

**Zu tun:** Klick oeffnet die Quellenliste. Titel, Herausgeber, Jahr,
Verweis wo vorhanden. `[read]` **Wie du sie zeigst, entscheidest du** —
eigener Reiter oder Ausklappen unter dem Chip. **Ein Chip mit einer
Zahl, der nichts tut, ist schlechter als kein Chip.**

## 5 · `[object Object]` bei den Mythen

`[cmd]` Auf Bild 5 steht unter *MYTHEN* zweimal woertlich
`[object Object]`.

`[cmd]` **Vom Orchestrator gemessen: 127 von 260 gefuellten
`mythen_de` sind JSON-Arrays in einer `text`-Spalte.**

`[read]` **Das wurde in G-180 gemeldet und nur halb geloest** — die
Anzeige liest Zeichenkette und Array, aber nicht das Array **aus
Objekten**. Bei diesen 127 steht je Eintrag ein Objekt mit Mythos und
Korrektur.

**Zu tun:** alle drei Gestalten lesen. **Wo ein Objekt steht, Mythos
und Korrektur getrennt zeigen** — auf Bild 7 (6-OXO) sieht man, wie es
aussehen soll, wenn es funktioniert.

`[read]` **Die Texte nicht anfassen.** Das ist ein Anzeigefehler.

## 6 · Fliesstext, wo eine Aufzaehlung dasteht

**Tom, 2026-08-25, zur Rechtslage von 6-OXO:** *„so schreibt und liest
kein mensch. wieso schluesselt man das nicht als aufzaehlung auf? zb
auf das : reagieren."*

Heute steht dort ein Absatz:

    6-OXO wurde in den USA als Supplement verkauft, ohne je als
    Arzneimittel oder gepruefte Supplement-Zutat anerkannt zu sein;
    sein rechtlicher Status als 'legale Zutat' ist umstritten.
    Sportlich gilt klar: WADA S4.1, zu jeder Zeit verboten.

Lesbar waere:

    In den USA      als Supplement verkauft, nie als Arzneimittel
                    oder geprüfte Zutat anerkannt
    Rechtlich       Status als "legale Zutat" umstritten
    Im Wettkampf    WADA S4.1, jederzeit verboten

**Betrifft drei Felder:**

`[cmd]` **`wer_nicht_de` ist bereits ein `text[]`** — **281 von 290
sind mehrteilig** und werden trotzdem als Absatz gerendert. **Das ist
kein Umbau, sondern eine fehlende Liste.** Sofort loesbar.

`[cmd]` **`mythen_de`: 33 tragen `Mythos:` und `Korrektur:`** — ein
fertiges Paar. Getrennt zeigen, wie auf Toms Bild 7 (6-OXO), wo es
funktioniert.

`[cmd]` **`rechtslage_klartext_de`: 54 von 290 tragen einen
Doppelpunkt.** Nur dort greift die Aufschluesselung.

`[read]` **Vorsicht mit der Automatik.** Ein Doppelpunkt mitten im Satz
darf nicht umbrechen. Die Regel setzt am Satzanfang oder nach
Semikolon an — **und wo sie nicht greift, bleibt der Absatz stehen,
nicht zerhackt.** `[cmd]` Bei 236 von 290 ist der Absatz der
Normalfall.

**Miss vorher, wie viele Felder die Regel trifft**, und nenn die Zahl.
`[read]` **Trifft sie unter 30 Prozent, ist sie zu eng — trifft sie
ueber 90, ist sie zu weit.**

## 7 · Die WADA-Kachel sagt nicht, fuer wen sie gilt

**Tom:** *„WADA verboten gilt das auch fuer bodybuilding?"*

`[wahrscheinlich]` **Fuer den typischen Nutzer nicht.** Die WADA-Liste
bindet nur Verbaende, die den Code unterzeichnet haben. Im
Bodybuilding heisst das: **getestet** sind IFBB Elite/Amateur unter
nationalen Verbaenden und die Natural-Ligen (WNBF, INBA/PNBA, OCB) —
**nicht getestet** sind IFBB Professional League und NPC.

`[cmd]` **Der Bestand:** 124 `prohibited`, 163 `not_prohibited`, 3
`monitored`; Kategorie bei 129 — **aber keine einzige `note_de`.** Der
Geltungsbereich steht nirgends.

`[read]` **Die Kachel steht heute prominent bei jeder Substanz und
suggeriert eine Verbindlichkeit, die fuer die meisten nicht besteht.**

**Zu tun:** die Kachel beschriftet sich genauer — *„im getesteten
Wettkampf"* statt nur *„verboten"*. `[cmd]` Wo `wada_category` vorliegt
(129), gehoert sie dazu: *„S4.1 · im getesteten Wettkampf verboten"*.

`[read]` **Nicht ausblenden.** Die Information bleibt relevant, sobald
jemand je an einem getesteten Wettkampf teilnimmt — sie muss nur sagen,
worauf sie sich bezieht.

`[read]` **Was du NICHT tust:** aufzaehlen, welche Verbaende testen.
Das ist eine inhaltliche Aussage ohne Beleg im Bestand — **als eigener
Punkt melden, nicht in die Oberflaeche schreiben.**

## WAS NICHT ZU TUN IST

**Keine Texte aendern.**
**Kein Umbau der Kachelstruktur** — die ist seit G-181 in Ordnung.
`supabase/_pipeline/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

**Punkt 1 als Test**, nicht als Bild: Gruppenwechsel setzt die
Kategorie zurueck. **Negativprobe:** Ruecksetzung entfernen, der Test
muss rot werden.

**Punkt 2:** Zahl der Vorkommen des Enhanced-Kastens je Reiter — heute
3, nachher 1.

**Punkt 5:** Zahl der Substanzen, bei denen `[object Object]` im
gerenderten Text steht — heute messen, nachher **0**.

`node tools/schuss.mjs`: BPC-157 auf allen vier Reitern, dazu die
geoeffnete Quellenliste.

`[read]` **Zu G-181, weil es dieselbe Klasse ist:** deine Meldung zu
Punkt 2 war richtig — eine Regex haette *„60-70 %"* bei BPC-157 als
Wirkung angezeigt, obwohl der Text sagt, dass Humanstudien fehlen.
**Das war die erfundene Zahl mit einem Automaten davor.** Gepflegte
Liste plus Waechter ist die richtige Antwort.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
