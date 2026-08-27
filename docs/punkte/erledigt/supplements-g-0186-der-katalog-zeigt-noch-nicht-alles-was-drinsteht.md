---
nr: G-186
typ: befund
modul: supplements
schwere: mittel
angelegt: 2026-08-25
braucht: []
kind_von: null
kinder: []
agent: claudecode
beauftragt: 2026-08-27
erledigt: 2026-08-27
commit: 4899dc5d
entscheidung: null
beruehrt:
  tabellen: [supplements.entity_transporters, supplements.entity_cyp, supplements.supplement_interactions]
  dateien: [apps/web/src/app/v2/supplements/substanz-tafel.tsx, apps/web/src/app/v2/supplements/ansicht.tsx]
zahlen: null
---

# G-186 - Der Katalog zeigt noch nicht alles, was drinsteht

## Befund

(neu
  2026-08-25).

  `[cmd]` **Inhaltlich fertig:** 318 sichtbar, 318 mit Nutzertext, 318
  mit FAQ, 1.421 FAQ-Zeilen, **0 sichtbare Eintraege ohne Text.**

  `[cmd]` **Die Reiter Dosierung und Sicherheit sind duenn** — bei
  BPC-157 zwei Zeilen, seit der Enhanced-Kasten dort nicht mehr steht
  (G-182). `[read]` **Ein Reiter mit zwei Zeilen ist schlechter als
  kein Reiter.**

  `[cmd]` **Wechselwirkungen und Laborwirkung fehlen ganz**, obwohl
  seit C-262 vorhanden: `entity_transporters` **4.617** ·
  `entity_cyp` **3.001** · `supplement_lab_effects` 222 ·
  `supplement_interactions` 78.

  `[read]` **Das ist die Ebene, die aus einem Katalog ein System macht,
  das warnen kann.** `[cmd]` Digoxin ist P-gp-Substrat mit enger
  therapeutischer Breite, Biotin verfaelscht Laborwerte.

  `[read]` **`role = 'not_relevant'` ist ein Ergebnis, kein fehlender
  Wert** — *„geprueft, kein Effekt"* unterscheidet sich von *„nie
  geprueft"*.

  `[cmd]` **`wofuer_de` liegt bei 318/318 als Array vor, aber man kann
  nicht danach filtern.** `[read]` Der Katalog filtert nach dem, **was
  ein Stoff ist** — nicht **wofuer er da ist.** Wer *„Schlaf"* sucht,
  muss wissen, dass Magnesium ein Mineralstoff ist.

## Auftrag

**Der Wechselwirkungs-Reiter. Drei Punkte zusammen: G-186 (dieser),
G-188 und G-189 — sie betreffen dieselbe Ansicht.**

### Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine.** `[cmd]`
**Die Zahlen in diesem Punkt sind vom 25.08. und tot:** er nennt 318
sichtbare Substanzen (**heute 412**), 1.421 FAQ (**1.970**),
`supplement_lab_effects` 222 (**271**).

### Der Kern, heute gemessen

`[cmd]` **Die Rollenverteilung ist der eigentliche Befund:**

    entity_transporters  4.617   not_relevant 4.189 · unknown 190
                                 inhibitor 126 · substrate 104
                                 inducer 5 · substrate_and_inhibitor 3

    entity_cyp           3.001   not_relevant 2.133 · unknown 489
                                 substrate 304 · inhibitor 65
                                 inducer 10

`[read]` **91 Prozent der Transporterzeilen sind `not_relevant`** —
*,,geprueft, kein Effekt"*. **Wer nur die echten Rollen zeigt, zeigt
617 von 7.618 Zeilen** und laesst offen, ob *nichts angezeigt* heisst
*nicht geprueft* oder *geprueft und nichts gefunden*.

`[read]` **Das ist dieselbe Klasse wie *begruendet leer* gegen *nicht
bearbeitet* aus G-208 — und du hast die Form dafuer schon gebaut.**
**Hier sind es drei Zustaende:**

    echte Rolle            617   zeigen
    not_relevant         6.322   ,,geprueft, ohne Befund"
    unknown                679   ,,nicht geprueft"

`[cmd]` **In G-212 hast du gemeldet, dass `geprueft_ohne_befund` vom
Lesepfad nie gesetzt wird und immer 0 ist.** **Das ist der Rest von
G-186.**

### G-188 — der Reiter heisst nicht, was er zeigt

`[cmd]` **`supplement_interactions`: 77 gegen `drug`, 1 gegen
`alcohol`, 0 zwischen zwei Katalogsubstanzen.**

`[read]` **Der Reiter heisst *,,Wechselwirkungen"* und verspricht
Paare zwischen Supplements, die es nicht gibt.** Was er zeigt, sind
**Medikamenten-Wechselwirkungen** — und das ist wertvoll: `[cmd]`
`medical.medication_active_substances` traegt **498 Wirkstoffe**, die
Bruecke steht, und seit G-211 kann ein Nutzer seine Medikamente
erfassen.

**Benenn den Reiter, wie er ist.**

### G-189 — der tote Rueckfallzweig

`[cmd]` `ansicht.tsx:309-313` rendert `SuppInteractions` nur bei
`regeln.length === 0`. **`rule_catalog` laedt immer** — 64 Zeilen mit
`{authenticated}`-Policy ohne Nutzerfilter. **Der Zweig ist tot.**

`[read]` **G-163-Beschluss:** Rueckfallfassungen bleiben nicht als
Notfallanzeige stehen. **Ein Zweig, der nur bei einem Datenbankfehler
erscheint und dann eine erfundene Bewertung zeigt, ist genau der
Fall, fuer den die Regel geschrieben wurde.** Ersatzlos entfernen.

### Was nicht zu tun ist

**Nicht nach `wofuer_de` filterbar machen** — das steht im Befund,
ist aber ein eigener Punkt und braucht eine Entscheidung ueber die
Filtergruppen.
**Keine Tabelle anlegen** — Codex arbeitet an C-325.
**Keine Interaktionsdaten erfinden oder ableiten.** `[read]` **Eine
Wechselwirkung, die niemand belegt hat, ist gefaehrlicher als
keine.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Zeilen im Reiter je Zustand   echte Rolle / geprueft / unbekannt
    geprueft_ohne_befund          Zahl, Soll > 0
    Reitername                    vorher / nachher
    SuppInteractions              0 Fundstellen
    Attrappen im neuen Code       Soll 0
    Ladezeit                      ms, warm und kalt getrennt
    Bildschirmfoto je Zustand     `node tools/schuss.mjs`

`[read]` **Negativprobe:** einer Substanz testweise alle
`not_relevant`-Zeilen entziehen — **die Ansicht muss den Unterschied
zu *,,nie geprueft"* zeigen, nicht beide gleich leer lassen.** Danach
zurueckrollen und die Zeilenzahl gegenpruefen.

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **A-30:** kein Wert-Import aus dem Leseweg in eine
Browserdatei.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Claude Code, 2026-08-28.**

**Drei Punkte erledigt. Der Kern von G-186 ist gebaut — aber die
Rollenverteilung ist eine andere, als der Auftrag sagt, und der
Unterschied dreht die Betonung.**

### Die Zahlen — eine Korrektur, die traegt

`[cmd]` **Die toten Zahlen des Punktes bestaetigen sich als tot:**
412 sichtbar (nicht 318), 1.970 FAQ (nicht 1.421), 271 lab_effects
(nicht 222), 78 interactions (unveraendert).

**Aber die Zahlen des AUFTRAGS stimmen auch nicht.**

| | Auftrag | Gemessen |
|---|---|---|
| `entity_transporters` | 4.617 | **4.617** — davon **135** Katalogzeilen |
| `entity_cyp` | 3.001 | **3.001** — davon **816** Katalogzeilen |
| „7.618 Zeilen" | 7.618 | **951**, die der Katalog sieht |

`[cmd]` **Der Rest sind Medikamente und Performance-Verbindungen:**
4.482 + 1.890 `medication`, 295 `performance_compound`. **Der
Substanzkatalog zeigt sie nicht** — er zeigt Supplements.

`[cmd]` **Und damit dreht sich die Verteilung:**

    entity_transporters (Katalog, 135)
      unknown       64    <- die groesste Gruppe
      not_relevant  54
      inhibitor     16 · inducer 1

    entity_cyp (Katalog, 816)
      not_relevant 565
      unknown      190
      inhibitor     57 · substrate 2 · inducer 2

`[read]` **Der Auftrag sagt *„91 Prozent sind geprueft, kein
Effekt"*.** `[cmd]` **Ueber die Katalogzeilen sind es 65 Prozent, und
bei den Transportern ist `unknown` die Mehrheit** (64 von 135).

`[read]` **Das aendert die Aussage der Anzeige.** Haette ich die
91 Prozent geglaubt, waere *„geprueft, ohne Befund"* der Regelfall
gewesen und *„nicht geprueft"* die Ausnahme. **Es ist umgekehrt
haeufiger, als der Auftrag annimmt** — und genau deshalb muessen
beide Zahlen getrennt dastehen.

### Der Kern: drei Zustaende, gebaut

    lib/supplements/rollen-lage.ts       die Zustaende (serverfrei)
    lib/supplements/substanz-read.ts     + entity_cyp, + entity_transporters
    app/v2/supplements/substanz-tafel.tsx  die Anzeige
    lib/supplements/__tests__/rollen-lage.test.ts   22 Tests

    rolle          zeigen, mit Enzym/Transporter, Rolle und Evidenz
    ohne_befund    „N geprueft, ohne Befund"
    ungeprueft     „N nicht geprueft"
    (gar nichts)   „weder ein Befund noch das Ergebnis, dass keiner besteht"

`[read]` **Vier Faelle, nicht drei.** Der vierte kam beim Messen
dazu: `[cmd]` **299 der 412 sichtbaren Substanzen haben ueberhaupt
keine Zeile** — weder `not_relevant` noch `unknown`. **Das ist
nochmal etwas anderes als „geprueft, nichts gefunden"**, und ohne
eigenen Satz saehe es aus wie der zweite Zustand.

`[cmd]` **Die Verteilung ueber die 111 Substanzen mit CYP-Daten:**
22 mit Befund · 72 nur geprueft · 17 nur ungeprueft · 0 gemischt.

### Der Rest von G-186 ist zu

`[cmd]` **`geprueft_ohne_befund` wurde vom Lesepfad nie gesetzt** —
gemeldet in G-212, immer 0, die Zeile erschien nie. **Das Feld ist
entfernt** (nicht auskommentiert, G-163) und durch `rollen: RollenLage`
ersetzt. Ein Test haelt fest, dass es nicht zurueckkommt.

`[cmd]` **Am Bildschirm gegengelesen, Resveratrol:**

    CYP1A2 · Enzym · hemmt · in_vitro_only
    CYP2C19 · Enzym · hemmt · in_vitro_only
    CYP2C9 · Enzym · hemmt · in_vitro_only
    CYP2D6 · Enzym · hemmt · in_vitro_only
    Weitere Enzyme und Transporter: 7 nicht geprüft.

**Befunde und die ungepruefte Zahl nebeneinander** — das ist der
Punkt.

### G-188 — der Reiter heisst, was er zeigt

`[cmd]` **Unveraendert gemessen:** 77 gegen `drug`, 1 gegen
`alcohol`, **0 zwischen zwei Katalogsubstanzen.**

    Blocktitel   „Wechselwirkung und Labor"
              -> „Wechselwirkung mit Medikamenten und Labor"
    Reiter (de)  „Wechselwirkungen"
              -> „Wechselwirkungen · Medikamente"
    Reiter (en)  „Interactions"
              -> „Interactions · medications"

`[cmd]` **`block-ton.ts` mitgezogen** — die Ueberschrift steht in der
Farbtabelle aus G-196, und ein Test faellt, wenn sie dort fehlt. **Er
ist gefallen, ich habe ihn nicht umgangen.**

### G-189 — der tote Zweig ist weg

`[cmd]` **Bestaetigt:** `rule_catalog` traegt **64 Zeilen** mit einer
`{authenticated}`-Policy und `qual: true` — **kein Nutzerfilter.**
`regeln.length === 0` konnte nicht eintreten.

**Entfernt:** der Zweig in `ansicht.tsx`, die Funktion
`SuppInteractions` (97 Zeilen) und der Import. **Ersatzlos**, wie der
G-163-Beschluss verlangt.

#### Dabei waere eine Zusage verlorengegangen

`[read]` **`SuppInteractions` war keine Attrappe** — er las
`daten.wechselwirkungen` und trug **den Satz aus G-187**: *„alle gegen
Medikamente oder Alkohol, keine zwischen zwei Supplements."*

`[cmd]` **`InteractionsEchtTab` trug ihn nicht.** Er zeigt das
Regelwerk, heisst auf Englisch *„Interactions"* und sagte nichts
darueber, worauf sich die Paare beziehen.

`[read]` **Ersatzloses Entfernen haette also G-187 rueckgaengig
gemacht** — leise, weil der Test auf die geloeschte Datei zeigte und
mit ihr verschwunden waere. **Der Satz steht jetzt im erreichbaren
Reiter**, und der G-187-Test prueft dort.

`[read]` **Das ist der Befund dieses Punktes, den ich nicht erwartet
hatte:** *„ersatzlos entfernen"* stimmt fuer den Zweig, nicht fuer
alles, was er nebenbei trug.

### NACHWEIS

| | |
|---|---|
| Zeilen im Reiter je Zustand | **Resveratrol: 5 Rollen + 7 ungeprüft** |
| Substanzen je Lage | 22 Befund · 72 geprüft · 17 ungeprüft · 299 ohne Zeile |
| `geprueft_ohne_befund` | **entfernt** — ersetzt durch `rollen` |
| Reitername | *Wechselwirkungen* → *Wechselwirkungen · Medikamente* |
| `SuppInteractions` | **0 Fundstellen** ausserhalb von Kommentaren |
| Attrappen im neuen Code | **0** |
| Ladezeit | **1.538 ms kalt / 1.673 ms warm** |
| Bildschirmfoto | `backup/g186-befund.png`, `-ungeprueft.png`, `-katalog.png` |

### Gates

    Tests            776 pass / 0 fail   (22 davon neu)
    Typecheck        gruen
    Build            31/31 Routen
    serverimport     51 Client-Chunks, 0 Treffer  (A-30 gehalten)
    verdrahtung      kein unbewachter Zuwachs (47 → 48 bewachte Namen)
    encoding         20.509 Dateien sauber

`[cmd]` **Vier bestehende Tests sind durch die Aenderung gefallen** —
und alle vier zu Recht: der Attrappenzaehler (suchte
`SuppInteractions`), G-196 (kannte die neue Ueberschrift nicht) und
zwei G-187-Tests (zeigten auf die geloeschte Fassung). **Alle vier
nachgezogen, keiner entschaerft.**

### Die Waechter fallen wirklich

`[cmd]` **Fuenf Sabotagen, je einzeln, Rueckbau byteidentisch:**

    not_relevant wegfiltern statt zaehlen   -> 1 rot
    unknown als ohne_befund zaehlen         -> 2 rot
    die zwei Zahlen zusammenwerfen          -> 2 rot
    Blocktitel zurueckdrehen (G-188)        -> 2 rot (auch G-196)
    Rueckfallzweig wiederbeleben (G-189)    -> 1 rot

`[read]` **Die letzte brauchte zwei Anlaeufe** — beim ersten hatte
ich nur einen Kommentar mit dem Namen eingefuegt, und der Waechter
blieb zu Recht gruen. **Erst der echte Zweig macht ihn rot.**

### NEGATIVPROBE

**Auftrag: *„einer Substanz testweise alle `not_relevant`-Zeilen
entziehen."***

`[cmd]` **An `sub_03e86b16d2`, 6 `not_relevant`, 0 `unknown`:**

    vorher   {"befunde":[], "ohne_befund":6, "ungeprueft":0}
             -> „6 geprüft, ohne Befund"
    nachher  {"befunde":[], "ohne_befund":0, "ungeprueft":0}
             -> „weder ein Befund noch das Ergebnis, dass keiner besteht"

**Die zwei Faelle sind unterscheidbar.** `[cmd]` Rueckbau: `entity_cyp`
3.001 → 3.001, die Substanz wieder bei 6.

### Was NICHT getan wurde

**Nicht nach `wofuer_de` filterbar gemacht** — eigener Punkt, braucht
eine Entscheidung ueber die Filtergruppen.
**Keine Interaktionsdaten erfunden oder abgeleitet.**
**Keine Tabelle angelegt**, `supabase/_pipeline/` nicht angefasst
(C-325).
**Nicht committet, nicht gestaged, nicht gepusht.**

### Was mir aufgefallen ist

**1. Die Auftragszahlen zaehlten das falsche Ganze.** `[read]` 4.617
und 3.001 sind richtig — aber es sind nicht die Zeilen, die der
Katalog sieht. **Wer `entity_type` nicht filtert, misst zu 87 Prozent
Medikamente.** Dieselbe Klasse wie G-186s eigener Schemafehler
(`wissen.` statt `supplements.`, gemeldet in G-212).

**2. 299 von 412 Substanzen haben gar keine Zeile.** `[read]` **Das
ist der groesste Zustand und im Punkt nicht erwaehnt.** Er braucht
einen eigenen Satz, sonst sieht *„nie untersucht"* aus wie
*„geprueft"*.

**3. Die Evidenzstufe steht bei allen Befunden auf `in_vitro_only`.**
`[cmd]` Bei Resveratrol alle fuenf. `[read]` **Das ist eine wichtige
Einschraenkung** — eine Hemmung im Reagenzglas ist keine im Menschen.
**Sie wird angezeigt, aber nicht eingeordnet:** ob `in_vitro_only`
eine Warnung abschwaechen soll, ist eine Entscheidung, die ich nicht
treffe.

**4. `entity_pk` und `entity_renal_hepatic` sind leer.** `[cmd]` 0
Zeilen (schon in G-212 gemeldet, weiterhin offen). **Sie stehen neben
den zwei gefuellten Tabellen und sehen aus wie Bestand.**

**5. Der Katalog sucht in der Beschreibung mit.** `[cmd]` Beim
Nachweis fiel auf: die Suche nach *„Resveratrol"* liefert zuerst
**Pterostilbene**, weil dessen Beschreibung das Wort enthaelt.
`[read]` **Das ist gewollt** (G-186 Punkt 3, Zwecke durchsuchen) —
**aber die Trefferzeile sagt nicht, WARUM sie passt.** In G-210 habe
ich genau das fuer Handelsnamen gebaut; hier fehlt es.

## Abnahme

**2026-08-27, Orchestrator. Selbst gegen die Datenbank gemessen.**

`[cmd]` **Die Korrektur traegt:**

    entity_transporters  4.617   medication 4.482 · supplement 135
    entity_cyp           3.001   medication 1.890 · supplement 816
                                 performance_compound 295

`[read]` **Meine Auftragszahlen zaehlten das falsche Ganze.** Ich
hatte 7.618 Zeilen und *,,91 Prozent geprueft, kein Effekt"*
geschrieben — **davon sieht der Katalog nur einen Bruchteil.**

`[read]` **Und die Folge waere schlimmer gewesen als die Zahl:**
*,,geprueft, ohne Befund"* waere der Regelfall geworden und *,,nicht
geprueft"* die Ausnahme. **Bei den Transportern ist `unknown` die
Mehrheit — es ist haeufiger umgekehrt.**

### Zwei Zahlen weichen ab, und die Abgrenzung erklaert beide

`[cmd]` **Ich messe 1.087 Katalogzeilen, Claude Code 951.** `[cmd]`
Seine Zahl ist `entity_type = 'supplement'` (135 + 816 = 951), meine
ein Join ueber `supplement_id` auf sichtbare Substanzen — **der
nimmt `performance_compound`-Zeilen mit, die an einer sichtbaren
Substanz haengen.**

`[cmd]` **Dasselbe bei den Substanzen ohne Zeile: er 299, ich 245.**

`[read]` **Beide Zahlen sind richtig und messen Verschiedenes.**
**Genau deshalb steht seit heute in `CLAUDE.md`, dass ein Auftrag die
Abgrenzung mitverlangt** — nicht nur die Zahl. `[read]` **Hier haette
sie den Unterschied sofort sichtbar gemacht, statt ihn in die
Abnahme zu verschieben.**

### Der vierte Zustand stand in keinem Punkt

`[cmd]` **245 bis 299 der 412 sichtbaren Substanzen haben gar keine
Zeile** — weder `not_relevant` noch `unknown`.

`[read]` **Ohne eigenen Satz saehe das aus wie *,,geprueft, nichts
gefunden"*.** Das ist der groesste Zustand, und er kam beim Messen
heraus, nicht aus dem Auftrag.

### G-189 — fast waere eine Zusage verschwunden

`[read]` **`SuppInteractions` war keine Attrappe.** Er trug den Satz
aus G-187 (*,,keine zwischen zwei Supplements"*), `InteractionsEchtTab`
trug ihn nicht. **Ersatzloses Entfernen haette G-187 leise rueckgaengig
gemacht, weil der Test mit der geloeschten Datei verschwunden waere.**

`[read]` **Meine Vorgabe *,,ersatzlos entfernen"* stimmte fuer den
Zweig, nicht fuer alles, was er nebenbei trug.** Der Satz steht jetzt
im erreichbaren Reiter.

`[cmd]` **Vier bestehende Tests sind gefallen, alle zu Recht** —
Attrappenzaehler, G-196, zwei G-187-Tests. **Alle nachgezogen, keiner
entschaerft.**

`[cmd]` **Und die eigene Sabotageprobe brauchte zwei Anlaeufe:** beim
ersten war nur ein Kommentar eingefuegt, **und der Waechter blieb zu
Recht gruen.**

`[cmd]` **Gates:** 776 Tests / 0 Fehler (22 neu), Build 31/31,
Verdrahtung 47 → 48 ohne Zuwachs, Encoding 20.509, 0 Attrappen.
Negativprobe unterscheidbar, Rueckbau 3.001 → 3.001.

`[cmd]` **Nebenbei bestaetigt:** `entity_pk` und
`entity_renal_hepatic` stehen bei **0 Zeilen** — deckt sich mit
Codex' C-325-Befund.

**Abgenommen.**

