# G-199 — Claude Code, 2026-08-26

Bericht: `docs/berichte/g-199-claude-code.md`

**Vier Punkte aus Toms Durchsicht — und einer davon ist Arbeit, die
schon getan ist und nur haengt.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Wie in G-195: jede Zahl unten stammt aus einer Messung von
mir. Pruef sie zuerst. Weicht deine ab, gilt deine — und du nennst
beide.**

`[cmd]` **In G-195 hat das beim ersten Einsatz drei Abweichungen
gefunden**, und die wichtigste ging **gegen** meine Erwartung:
`rechtslage_klartext_de` war **zu niedrig** geschaetzt — 201 statt 136.
**Mit 136 waere der Reiter ein Randfall gewesen.**

## 1 · Der Community-Reiter haengt seit C-280

`[cmd]` **Du hast ihn in G-192 gebaut, konntest ihn aber nicht
befuellen** — `wissen` war nicht ueber PostgREST erreichbar.

`[cmd]` **Seit C-280 gibt es die Sicht
`supplements.community_anzeige`, 212 Zeilen, 28 Spalten** — im
Fachschema, also ueber die bestehende Freigabe erreichbar.

`[read]` **Mein Fehler: ich habe C-280 im Register als „damit ist
G-192 entblockt" vermerkt und dir nie einen Anschlussauftrag
gegeben.** Die Arbeit liegt fertig da.

**In der Sicht:**

    37 Nebenwirkungen      side_effect, prevalence, onset_context,
                           attribution_confidence,
                           community_consistency,
                           scientific_alignment, limitations
    31 Stacks              name, expected_tradeoff
    40 Qualitaetssignale   quality_signal, quality_claim,
                           independent_testing, quality_sources
    71 Begriffe            term, community_definition
    30 Science-Delta       community_claim, community_resolution
     3 Konzepte            concept, physiological_implications

`[cmd]` **`substance_ids` ist bei 64 der 212 gefuellt**, dazu
`substance_class` als Kontext — **die Zuordnung greift praezise, wo sie
kann, und ueber die Klasse, wo nicht.**

`[cmd]` **`raw` und die vier Anleitungsfelder sind nicht in der
Sicht** — sie koennen gar nicht ankommen.

`[read]` **`evidence_class` gehoert sichtbar in den Reiter.** Es heisst
*Erfahrungsberichte, nicht Studien* — **das muss man sehen, ohne zu
suchen.**

## 2 · WADA steht noch in der Dosierung

`[cmd]` **Auf Toms Bild von Desoxymethyltestosterone steht die
WADA-Kachel unter *Dosierung*.**

`[read]` **Das ist ein Rest:** G-195 hat den Textblock in die
Rechtslage verschoben, **die Kachel nicht.** Sie gehoert in den
Ueberblick — die schnelle Antwort, ob erlaubt oder verboten — **und
der Satz dahinter in die Rechtslage. In der Dosierung hat sie nichts
verloren.**

## 3 · „Weitere Angaben" werden Kacheln

`[cmd]` **Heute stehen dort graue Zeilen mit dem Begruendungstext
darunter:** *Obergrenze — „Fuer nicht zugelassene Wirkstoffe gibt es
keine Obergrenze"*, *Uebliche Menge — „Keine Leitlinie nennt eine
Dosis."*

`[read]` **Das ist der Rest von G-191:** dort wurde der Statuscode aus
der Kachel entfernt, **die Zeile blieb als Notloesung.**

**Tom, 2026-08-26:** *„weitere angaben obergrenze/untergrenze/etc
koennen wir eher schoene kacheln machen in dosierung, als komische
zeilen."*

## 4 · Immer alle Kacheln — mit drei Zustaenden

**Tom:** *„von mir aus muessen immer alle kacheln angezeigt werden dass
es einheitlich wirkt, wenn wir keine daten zur kachel haben das halt in
der kachel ausweisen."*

`[read]` **Seine Begruendung traegt:** wer drei Substanzen
durchklickt, will die Zahlen an derselben Stelle finden. **Das ist
eine Aenderung gegenueber §9** — dort hiess es *„kein Block ohne
Inhalt"*. **Fuer Textbloecke gilt das weiter. Fuer die Zahlenkacheln
gilt jetzt: feste Menge je Reiter.**

**Aber drei Zustaende, nicht zwei:**

    Wert            "3–5 g taeglich"
    gibt es nicht   "Fuer nicht zugelassene Wirkstoffe gibt es keine
                     Obergrenze" -- eine AUSSAGE
    nicht erhoben   niemand hat gemessen

`[read]` **Der Unterschied ist sicherheitsrelevant.** *„Nie
untersucht"* darf nicht aussehen wie *„unbedenklich"* — bei
Enhanced-Stoffen ist das der Unterschied zwischen Vorsicht und
falscher Sicherheit.

`[cmd]` **Die Datenlage traegt es:** `guideline_dose` hat `value` und
`missing_reason` getrennt — **wo ein Grund dasteht, ist es Zustand
zwei; wo beides fehlt, Zustand drei.**

`[read]` **Miss, wie viele in welchen Zustand fallen**, bevor du die
Darstellung waehlst. **Wenn Zustand drei fast nie vorkommt, brauchen
zwei Zustaende eine eigene Form und der dritte nicht.**

## 5 · Acht Reiter sind entschieden

**Tom:** *„lieber acht thematische reiter und das im ueberblick dass
der user auf die schnelle sehen will als 10 kacheln in einem reiter
die niemand liest."*

`[read]` **Damit ist meine Faustregel „ab sieben sucht man"
ueberholt** — seine Begruendung ist besser: **ein Reitername sagt, was
drin ist. Zehn Kacheln in einem Reiter sagen nichts, bis man sie
liest.**

`[cmd]` **Deine Messung aus G-195: 7 Reiter bei 63 Substanzen, 6 bei
272, 5 bei 76.** Mit dem Community-Reiter kommt der achte dazu —
**bei den Substanzen, die Community-Daten haben.**

**Nicht deckeln.** `[read]` Ein Reiter, der nichts traegt, erscheint
weiterhin nicht.

## WAS NICHT ZU TUN IST

**Keine Texte aendern, keinen Wert erfinden.**
**Keine Anleitung anzeigen** — die vier Felder sind nicht in der
Sicht, aber der Waechter aus G-192 bleibt.
**Kein neuer Farbwert** — die Ordnung aus G-196 gilt.

`[cmd]` **`.v2-supp-tafel` nicht anfassen** — der rosa Boden
(`oklch(0.982 0.006 1)`) ist als **G-197** offen und betrifft beide
Reiter.

`supabase/_pipeline/` nicht anfassen — Codex arbeitet an C-283.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

**Deine Zahlen neben meinen, wo sie abweichen gelten deine.**

**Je Zustand: wie viele Kacheln fallen hinein?** Vor dem Bau
hinschreiben.

**Bei wie vielen der 412 erscheint der Community-Reiter?** `[cmd]`
Meine Vermutung: deutlich weniger als 212, weil mehrere Zeilen
dieselbe Substanz betreffen — **miss es.**

**Gegenprobe an vier namentlich genannten:** ein 19-nor-AAS (*„Deca
dick"*) · ein SARM (JAMA-Zahlen zur Produktqualitaet) · **ein Vitamin
— dort darf der Community-Reiter nicht erscheinen** ·
Desoxymethyltestosterone, **wo die WADA-Kachel aus der Dosierung
verschwinden muss.**

**Negativprobe:** eine Kachel auf einen vierten Zustand setzen — ein
Waechter muss rot werden. `[read]` **Und bewach die Verdrahtung, nicht
nur die Funktion** — das war viermal dein blinder Fleck.

`node tools/schuss.mjs`, `test-user@lumeos.local`, **beide Themen**,
1280 und 1920.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Feste Kachelbreiten wie G-181, **kein `1fr` ohne `max-width`.**

`[cmd]` **Der Dev-Server laeuft auf PID 351936.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
