# G-186 — Claude Code, 2026-08-25

Bericht: `docs/berichte/g-186-claude-code.md`

**Der Katalog ist inhaltlich fertig. Jetzt zeigt er noch nicht alles,
was drinsteht.**

---

## Der Stand

`[cmd]` **318 sichtbar · 318 mit Nutzertext · 318 mit FAQ · 1.421
FAQ-Zeilen.** Seit Codex' C-265-Nachtrag ist **kein sichtbarer Eintrag
mehr ohne Text** — das war Toms Beschwerde von heute frueh
(*„ein paar klicks und hab bcaa/electrolytes etc nichts drin"*).

`[cmd]` `wofuer_de` **318/318 als Array** — die Zwecke liegen
strukturiert vor.

## 1 · Die Reiter Dosierung und Sicherheit sind duenn

`[cmd]` Auf Toms Bildern vom 2026-08-25 zeigt *Dosierung* bei BPC-157
**zwei Zeilen** — der Rest der Flaeche ist leer, seit der
Enhanced-Kasten dort nicht mehr steht (G-182, Punkt 2).

**Was hineingehoert, und heute nirgends erscheint:**

    Dosierung    wann_wie_de · studied_dose_ranges · upper_limit ·
                 usage_hint · Portionsgroesse wo vorhanden
    Sicherheit   wer_nicht_de · zu_viel_de · zu_wenig_de ·
                 mythen_de · nicht_im_blut_de · rechtslage_klartext_de

`[read]` **Miss zuerst, was je Reiter tatsaechlich gefuellt ist**, und
bau die Bloecke in der Reihenfolge ihrer Abdeckung. **Ein Reiter mit
zwei Zeilen ist schlechter als kein Reiter** — dann gehoert der Inhalt
in den Ueberblick.

## 2 · Wechselwirkungen und Laborwirkung fehlen ganz

`[cmd]` **Seit C-262 liegen sie vor und werden nirgends gezeigt:**

    entity_transporters       4.617 Zeilen, 10 Transporter je Substanz
    entity_cyp                3.001 Zeilen, 6 Enzyme
    supplement_lab_effects      222
    supplement_interactions      78

`[read]` **Das ist die Ebene, die aus einem Katalog ein System macht,
das warnen kann.** `[cmd]` Digoxin ist ein P-gp-Substrat mit enger
therapeutischer Breite; Biotin verfaelscht Laborwerte.

`[read]` **`role = 'not_relevant'` ist ein Ergebnis, kein fehlender
Wert** — *„geprueft, kein Effekt"* unterscheidet sich von *„nie
geprueft"*, und die Oberflaeche muss beides auseinanderhalten.

**Ein eigener Reiter oder ein Block im Ueberblick — deine
Entscheidung.** `[read]` Bei zehn Transportern und sechs Enzymen je
Substanz ist eine Tabelle vermutlich richtiger als Kacheln. **Miss,
wie viele davon nicht `not_relevant` sind** — das entscheidet, ob es
drei Zeilen sind oder sechzehn.

## 3 · Die Zwecke sind ein Array und werden nicht gefiltert

`[cmd]` `wofuer_de` liegt bei 318/318 als Array vor. Die Chips im
Ueberblick zeigen sie — **aber man kann nicht danach suchen.**

`[read]` **Der Katalog filtert heute nach Gruppe und Kategorie** —
also danach, *was ein Stoff ist*. **Nicht danach, wofuer er da ist.**
Wer *„Schlaf"* sucht, muss wissen, dass Magnesium ein Mineralstoff
ist.

**Zu tun:** die Zwecke als dritte Filterebene. `[read]` **Miss
zuerst, wie viele verschiedene es gibt** — bei 318 Substanzen mal
2-4 Zwecken koennen es zu viele fuer eine Leiste sein. **Dann sind es
die haeufigsten plus Suche, nicht alle.**

## WAS NICHT ZU TUN IST

**Keine Texte aendern.**
**Keinen Block mit Platzhalter fuellen.** Was leer ist, entfaellt.
**Keinen Wert erfinden**, um eine Kachel zu fuellen — das war G-181,
Punkt 2, und deine Ablehnung dort war richtig.
`supabase/_pipeline/` nicht anfassen — Codex arbeitet an C-269.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

**Je Reiter: Zahl der Bloecke bei einer gut und einer duenn
gefuellten Substanz** — beide namentlich. `[cmd]` Kreatin gegen
BPC-157 waere ein Paar; **miss selbst, welches besser trennt.**

**Fuer die Wechselwirkungen:** Zahl der Zeilen, die nicht
`not_relevant` sind, bei drei Substanzen. `[cmd]` Digoxin, Metformin,
Biotin sind die Faelle, bei denen es zaehlt.

**Fuer die Zwecke:** Zahl der verschiedenen Werte in `wofuer_de` ueber
alle 318. **Vor dem Bau hinschreiben.**

**Negativprobe je Punkt.** `[read]` **Und bewach die Verdrahtung, nicht
nur die Funktion** — das war zweimal dein blinder Fleck, in G-180 bei
der Hoehenbremse und in G-183 bei zwei Eingriffen, die zuerst gruen
blieben.

`node tools/schuss.mjs`, `test-user@lumeos.local`, alle Reiter.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Feste Kachelbreiten wie in G-181: Zahlenkachel 180-220 px, Textkachel
`max-width` 520-620 px, **kein `1fr` ohne `max-width`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
