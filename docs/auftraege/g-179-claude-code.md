# G-179 — Claude Code, 2026-08-24

Bericht: `docs/berichte/g-179-claude-code.md`

**Das Substanzdetail. Tom will es endlich sehen.**

Umfasst **G-176** (50er-Limit), **G-177** (Detail zeigt den Bericht
statt den Inhalt) und den Anzeigeteil von **C-107**.

---

## Das Layout ist entschieden

`docs/spezifikation/substanz-katalog-nutzertexte.md` **§9**, von Tom am
2026-08-23 bestaetigt: *„es geht in die richtige richtung."*

    Kopf          Name, Gruppe, Zahl der Formen
                  rechts: Evidenzgrad, WADA-Status
    Erster Satz   kurz_was_de - WAS IST DAS
    Zwecke        wofuer_de als Chips
    Drei Kacheln  Uebliche Menge - Obergrenze - Einnahme
    Zu viel       zu_viel_de
    Zu wenig      zu_wenig_de, ENTFAELLT wo leer
    Wie wirkt     wie_wirkt_de
    Was bringt es was_bringt_es_de
    Wer nicht     wer_nicht_de
    Mythen        mythen_de, entfaellt wo leer
    Die Formen    je Form: Name, form_note_de, eigener Grad
    Fragen        supplement_faq, 3-6 je Substanz
    Fusszeile     Laborbezug; Rechtslage/Kennungen/Qualitaet zugeklappt
    Knopf         Zum Stack hinzufuegen

## Die vier Regeln

**Der erste Satz beantwortet *was ist das*.** Alles Technische steht
unten und ist zugeklappt.

**Zahlen stehen als Zahlen da**, nicht im Fliesstext vergraben.

**Kein Block ohne Inhalt.** Wo ein Feld leer ist, **entfaellt der
Abschnitt** — nicht *„Sicherheit · 2 Felder"*, hinter denen zweimal
`unknown` steht. `[cmd]` `zu_wenig_de` ist bei **241 von 290** leer,
`mythen_de` bei 30. **Das ist der Normalfall, nicht die Ausnahme.**

**Die Formen stehen unter dem Sammelnamen.** `[cmd]` `form_note_de`
existiert fuer alle 29 Unterformen und ist heute unsichtbar.

## G-176 — das 50er-Limit

`[cmd]` `apps/web/src/app/v2/supplements/substanz-detail.tsx:314`:

    return { gezeigt: menge.slice(0, 50), gesamt: menge.length }

Tom sieht *„50 von 290 Treffern — Suche verfeinern fuer mehr."*

`[read]` **Das widerspricht G-172:** der Scroll-Container wurde gebaut,
**weil** unten alles unerreichbar war — und dann auf 50 begrenzt. **Wer
den Namen nicht kennt, kann nicht verfeinern. Dafuer ist ein Katalog
da.**

**Wie du es loest, ist deine Entscheidung** — Nachladen, Blaettern oder
virtualisierte Liste. `[read]` **Miss zuerst, was 318 Zeilen im DOM
kosten**, statt das Limit blind zu entfernen oder blind zu behalten.

## G-177 — der Lueckenbericht raus

`[cmd]` Das Detail zeigt heute fuenf zugeklappte Bloecke (*„Evidenz · 7
Felder"*) und darunter **aufgeklappt und laenger als alles zusammen**
den Abschnitt *„OHNE QUELLE IM NEUEN KATALOG"* mit Saetzen wie *„Die
alte Breittabelle fuehrte `cyp` als jsonb."*

**Das ist ein Bericht, kein Produkt.** Raus.

`[read]` **`substanz-luecken.ts` bleibt richtig** — die Messung war der
halbe Ertrag von C-252. **Sie gehoert nur nicht so vor den Nutzer.**
Dass eine Angabe fehlt, ist relevant; **warum sie im Schema fehlt,
nicht.**

`[cmd]` **Nebenbefund:** unter dem Namen steht `sub_b30d752d32`. Ob die
technische Kennung dorthin gehoert, entscheide und begruende.

## Bei Enhanced und Peptiden dreht sich die Reihenfolge

    Ganz oben     irreversibel - was nicht zurueckkommt.
                  Hervorgehoben, nicht als Fussnote.
    Kacheln       statt Dosis: ueberwachung - welche Werte,
                  welcher Abstand
    Daneben       reinheit, direkt neben der Mengenangabe
    Titel         beide Namen, wo vorhanden

`[read]` **Warum Reinheit neben der Menge steht:** wenn in Praeparaten
wiederholt andere Wirkstoffe gefunden wurden, entwertet das jede
Mengenangabe. Getrennt gelesen wirkt die Zahl verlaesslicher, als sie
ist.

## Die Datenlage

`[cmd]` **Codex importiert parallel (C-264)** die 290 Nutzertexte und
1.279 FAQ-Zeilen in `supplement_user_texts` und `supplement_faq`.

**Bau gegen das Schema, nicht gegen den Inhalt.** Ist der Import noch
nicht durch, stehen dort die alten Schablonen — die Ansicht muss
trotzdem richtig sein. `[read]` **Wenn eine Kachel bei Schablonentext
gut aussieht und bei echtem Text bricht, ist sie falsch gebaut.**

`[cmd]` Dazu vorhanden: `entity_transporters` 4.617 · `entity_cyp`
3.001 · `medical.biomarker_explanations` 66 · `im_katalog` 318.

## WAS NICHT ZU TUN IST

`supabase/_pipeline/` **nicht anfassen** — Codex.
**Keine Texte aendern.** Du zeigst sie, du schreibst sie nicht.
**Keinen Block mit Platzhalter fuellen**, wo Inhalt fehlt.

Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

`node tools/schuss.mjs` auf `/v2/supplements`, angemeldet als
`test-user@lumeos.local`, **Katalog-Tab und mindestens drei
Detailfenster**: ein Supplement mit vollem Inhalt, eines mit Luecken,
ein Enhanced.

**Erwartung vor dem Lauf hinschreiben:** wie viele Eintraege die Liste
zeigt (nicht 50), welche Bloecke bei welcher Substanz erscheinen.

**Gegenprobe:** eine Substanz mit leerem `zu_wenig_de` **darf den
Abschnitt nicht zeigen** — nenn sie namentlich. Eine mit gefuelltem
muss ihn zeigen.

**Negativprobe:** einen Block auf leeren Text setzen; er muss
verschwinden, nicht als leere Flaeche stehenbleiben.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Bauen ueber `pnpm --filter @lumeos/web build`.
Nachweise auf `test-user@lumeos.local`.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
