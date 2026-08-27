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
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
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

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
