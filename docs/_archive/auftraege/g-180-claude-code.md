# G-180 — Claude Code, 2026-08-25

Bericht: `docs/berichte/g-180-claude-code.md`

**Nachfolger von G-179.** Die Daten stehen, die Struktur nicht.

**Tom, 2026-08-25:** *„gefaellt mir nicht, hat nun daten aber plump
aufgelistet untereinander."*

---

## Aus dem Modal wird ein Ausklappen unter der Zeile

**Tom:** *„wieso modal und nicht gleich pulldown unter dem gewaehlten
eintrag?"*

`[read]` **Es gab keinen Grund** — dort war schon eines. Fuer das
Ausklappen spricht mehr:

- Der Platz in der Liste bleibt sichtbar. Man weiss, wo man ist, und
  scrollt nach dem Schliessen weiter, statt sich neu zu orientieren.
- Zwei Substanzen lassen sich nacheinander aufklappen und vergleichen.
- Auf dem Telefon ist ein Overlay fast immer schlechter als eine
  wachsende Zeile.
- Kein Schliessen-Knopf, den man suchen muss.

`[read]` **Damit das nicht beim naechsten Umbau wieder ein Modal
wird:** die Begruendung gehoert als Kommentar an die Komponente.

## Wie es aussehen soll — nicht nur wie es heisst

**Tom, 2026-08-25, zum Entwurf:** *„diese grafik viel besser"* — und
zur Rueckfrage: *„baut das pulldown in diese richtung ja? nicht wieder
plumpe text auflistungen."*

`[read]` **Der Unterschied liegt nicht in der Reihenfolge, sondern in
der Flaeche.** Dieselben Inhalte als Absaetze mit Fettdruck sind wieder
eine Aufzaehlung.

**Was Flaeche haben muss:**

    "Auf einen Blick"   eigener Kasten, gedaempfter Grund,
                        Zeile je Angabe mit Trennlinie,
                        Wert RECHTSBUENDIG und groesser als die
                        Beschriftung - "200-400 mg" muss ablesbar
                        sein, ohne den Satz davor zu lesen
    "Bei zu viel"       eigener Kasten in Warnfarbe, nicht ein
                        Absatz mit fetter Ueberschrift
    "Laborbezug"        eigener Kasten, kompakt
    Die Formen          weisse Karten im Raster, je mit farbigem
                        Gradpunkt (gruen B, gelb C) rechts oben -
                        das unterscheidet eine Karte von einer Zeile
    Zwecke              Chips, nicht Komma-Liste
    Kopfzeile           Grad und WADA-Status als Pillen rechts

`[read]` **Fettdruck plus Absatz ist kein Kasten.** Wenn ein Bereich
keinen eigenen Grund, keine eigene Kante und keinen eigenen Innenabstand
hat, ist er nicht umgesetzt.

`[cmd]` **Zwei Fehler im Entwurfsbild NICHT uebernehmen:** die
Unterzeile sagt dort *„Ashwagandha-Gruppe"* — dort gehoert die
Kategorie hin. Und *„Obergrenze 250 mg"* unter *„Uebliche Menge
200-400 mg"* ist widerspruechlich; die Obergrenze gilt zusaetzlich zur
Nahrung. **Beides sind Platzhalter aus dem Mockup, keine Vorgabe** —
nimm die echten Werte aus der Datenbank.

## Die Struktur

**Reiter statt Scrollstrecke.** Ueberblick · Dosierung · Sicherheit ·
Formen · Fragen. **Jeder Reiter traegt seine Zahl, wo es eine gibt**
(*„Fragen · 5"*, *„7 Formen"*). **Ein Reiter ohne Inhalt erscheint
nicht.**

`[read]` **Die Reiter sind beim Ausklappen wichtiger als im Modal** —
sie begrenzen die Hoehe. **Immer nur ein Bereich offen; die Zeile
waechst nie ueber eine Bildschirmhoehe.**

**Gestapelt, nicht zweispaltig.** Im Modalentwurf standen Fliesstext
links und Zahlen rechts. In einer eingerueckten Zeile fehlt die Breite
dafuer. Also:

    Kopf          Name, Gruppe, Zahl der Formen
                  rechts: Evidenzgrad, WADA-Status
    Reiterleiste  nur Reiter mit Inhalt
    Zahlenkasten  "Auf einen Blick" - Menge, Obergrenze, Einnahme,
                  mit Essen. Zeile je Angabe, Wert rechtsbuendig.
    Warnkasten    "Bei zu viel", in Warnfarbe
    Laborbezug    kompakt
    Fliesstext    kurz_was, dann wie_wirkt, was_bringt_es
    Formen        Karten im Raster, je mit Grad und form_note_de
    Knoepfe       Zum Stack hinzufuegen · Quellen · N

**Bei Enhanced und Peptiden tauscht der obere Kasten den Inhalt:**
statt *„Auf einen Blick"* steht dort **`irreversibel`** in Warnfarbe,
darunter `ueberwachung` und `reinheit`. `[read]` **Reinheit gehoert
neben die Menge** — wenn in Praeparaten wiederholt andere Wirkstoffe
gefunden wurden, entwertet das jede Dosisangabe.

`[cmd]` **Achtung, heute leer:** die fuenf Enhanced-Felder stehen bei
**0 von 290** (vorher 136). **Codex fuellt sie parallel (C-266).**
Bau die Bereiche, pruef sie mit einem Test — nicht am Bild.

## G-176 gehoert dazu

`[cmd]` `substanz-detail.tsx` begrenzte die Liste auf 50. G-179 hat
318 erreichbar gemacht. **Wie die Liste die 318 zeigt, entscheidet sich
jetzt zusammen mit der Zeilenhoehe** — eine wachsende Zeile in einem
Scroll-Container mit festem Kopf braucht Sorgfalt.

`[read]` **Nicht nacheinander entscheiden.** Wer erst virtualisiert und
dann ausklappt, baut zweimal.

## WAS ZU TUN IST

1. Modal zu Ausklappen umbauen, Begruendung als Kommentar.
2. Reiter mit Zahlen; leere Reiter entfallen.
3. Zahlenkasten, Warnkasten, Laborbezug als eigene Bloecke — nicht als
   Absaetze untereinander.
4. Formen als Karten im Raster.
5. Bei Enhanced und Peptiden den oberen Kasten tauschen.
6. Zeilenhoehe und Listendarstellung zusammen loesen.

`[read]` **Die Regel aus §9 gilt weiter: kein Block ohne Inhalt.**
`[cmd]` `zu_wenig_de` ist bei 241 von 290 leer, `mythen_de` bei 30.

## WAS NICHT ZU TUN IST

**Keine Texte aendern.** Du zeigst sie.
**Keinen Platzhalter**, wo Inhalt fehlt — der Block entfaellt.
`supabase/_pipeline/` nicht anfassen — Codex.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

`node tools/schuss.mjs` auf `/v2/supplements`, `test-user@lumeos.local`.
**Bilder: Liste zu · eine Zeile aufgeklappt · zweiter Reiter offen ·
ein Enhanced-Eintrag.**

**Erwartung vor dem Lauf:** welche Reiter bei welcher Substanz
erscheinen. **Gegenprobe:** Creatine zeigt keinen *„Zu wenig"*-Block,
Beta-carotene schon — beide namentlich im Bericht.

**Negativprobe:** einen Reiterinhalt leeren; der Reiter muss
verschwinden, nicht leer dastehen.

**Und die Hoehe messen:** eine aufgeklappte Zeile darf eine
Bildschirmhoehe nicht ueberschreiten. Zahl in den Bericht.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Bauen ueber `pnpm --filter @lumeos/web build`.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
