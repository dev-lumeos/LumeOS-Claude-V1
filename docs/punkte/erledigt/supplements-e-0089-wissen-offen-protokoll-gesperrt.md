---
nr: E-89
typ: entscheidung
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-500
entscheidung: null
erledigt: 2026-09-08
commit: entschieden
beruehrt:
  tabellen: [supplements.supplements]
zahlen:
  gemessen: 2026-09-08
---

# E-89 - Wissen ist offen, das Protokoll ist gesperrt

## Die Frage

Aus G-500, Claude Code, 2026-09-08:

> *,,Die Auswahlliste zeigt Stoffe aus
`ladeInjizierbareSubstanzen()` ? ein SERVER-Leseweg, kein
Mockup. Nicht angefasst, eigene Frage."*

`[cmd]` **Sie listet ACE-031, Anamorelin, Boldenone,
BPC-157.**

## Die Antwort stand schon im Produkt

`[cmd]` **Selbst gemessen: der Katalog ist NICHT gesperrt** ?
**0 Treffer auf `reichtDerGrad` in `tab-katalog.tsx` und
`substanz-tafel.tsx`.**

    617 Substanzen
    596 Dosierungen
    offen fuer jeden

`[cmd]` **Toms eigenes Bildschirmfoto zeigt es: 1-Testosterone
mit Beleglage D, WADA *verboten*, Reitern fuer Dosierung,
Sicherheit und Rechtslage** ? **ungesperrt, mit Warnungen.**

`[read]` **Die Linie war also schon gezogen, nur nie
ausgesprochen.**

## Die Regel

    WISSEN ist offen
      was ein Stoff ist, was er tut, was er kostet,
      was er anrichtet, was die WADA sagt
      -> Katalog, Substanztafel, Wechselwirkungen

    das PROTOKOLL ist gesperrt
      was DU nehmen sollst, wieviel, wann, wie lange
      -> Extended, die Kur, der Plan

`[read]` **Ein Lexikon warnt, ein Plan empfiehlt.**

## Was daraus folgt

`[read]` **Die Auswahlliste bleibt OFFEN** ? **sie liest den
Katalog, und wer sich eintraegt, was er gespritzt hat, fuehrt
sein eigenes Tagebuch.**

`[read]` **Es waere widersinnig, ueber einen Stoff lesen zu
duerfen und nicht aufschreiben zu duerfen, dass man ihn
genommen hat.**

`[cmd]` **Und G-499/G-500 bleiben richtig: dort ging es um
ENTWURFSPROTOKOLLE mit Dosis und Zeitplan, nicht um den
Katalog.**

## Die Grenze fuer kuenftige Auftraege

`[cmd]` **Ein Feld gehoert hinter die Pruefung, wenn es sagt,
was der NUTZER tun soll:** `dose` **in einem Plan,** `timing`,
`cycling`, `nextLab`.

`[cmd]` **Es bleibt offen, wenn es sagt, was ein Stoff IST:**
`official_label_dose` **im Katalog,** `half_life`,
`wada_status`, `legal_status`.

`[read]` **Dieselbe Dosis, zwei Bedeutungen** ? **im Lexikon
eine Tatsache, im Plan eine Anweisung.**
