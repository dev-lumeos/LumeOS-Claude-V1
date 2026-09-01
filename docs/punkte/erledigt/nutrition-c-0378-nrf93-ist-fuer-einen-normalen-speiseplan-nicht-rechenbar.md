---
nr: C-378
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-01
braucht: []
kind_von: C-368
entscheidung: E-38
erledigt: 2026-09-01
commit: OFFEN
beruehrt:
  tabellen: [nutrition.food_nutrients]
zahlen:
  gemessen: 2026-09-01
  katalog_vollstaendig: 5092
  katalog_gesamt: 7140
  anteil_prozent: 71.3
  scorefaehige_tage: 0
---

# C-378 — NRF9.3 ist fuer einen normalen Speiseplan nicht rechenbar

## Der Befund

Aus C-368, Codex, 2026-09-01.

`[cmd]` **5.092 von 7.140 Lebensmitteln (71,3 %) haben alle drei
Vitamin-A-Komponenten.** `[cmd]` **Der Speiseplan von `dev` trifft
die uebrigen 29 Prozent.**

**Die fuenfzehn Blockierer:**

    6 Getreide/Beilagen   weisser Reis, Vollkornreis, Bulgur (roh
                          und gekocht), Couscous, Haferflocken
    4 Fischvarianten      Lachs (roh und geduenstet), Thunfisch,
                          Kabeljau
    3 Frischkaese         Magerquark, Skyr, koerniger Frischkaese
    1 Ziegenfleisch
    1 Haehnchenbrust      nur Spuren, in beiden Komponenten

`[read]` **Keine Randfaelle.** **Wer Reis, Haferflocken und Fisch
isst, bekommt keinen Score.**

`[read]` **Und der Grund ist einleuchtend:** der BLS misst
Carotinoide dort nicht, **wo praktisch keine sind.** **Ein
Nichtvorkommen wird als Luecke gefuehrt, nicht als Null.**

## Die Frage

**Was tun, wenn ein Score an Lebensmitteln scheitert, die
tatsaechlich keine Carotinoide enthalten?**

## Drei Wege

`[read]` **1. Als *incomplete* stehenlassen.** Ehrlich, aber die
Kachel bleibt bei einem normalen Speiseplan dauerhaft leer.

`[read]` **2. `Luecke` bei Carotinoiden wie eine logische Null
behandeln** — **nur fuer CARTB und CAROTPAXB, nur bei
Lebensmittelgruppen, in denen Carotinoide nicht vorkommen.**

`[cmd]` **Das waere eine Ausnahme von E-38** und von C-48 Regel 1.
`[read]` **Fachlich vertretbar: Fisch, Milchprodukt und Getreide
enthalten kein Beta-Carotin.** `[read]` **Aber es waere unsere
Annahme, nicht die des BLS.**

`[read]` **3. Vitamin A aus der Formel nehmen.** `[cmd]` **Codex hat
belegt, dass NRF8.3 keine Vitamin-A-lose Fassung ist** — **dann waere
es unsere Formel, nicht die validierte.**

## Was ich empfehlen wuerde

`[read]` **Weg 2, eng begrenzt und sichtbar gemacht:** **nur die zwei
Carotin-Komponenten, nur wo `RETOL` gemessen vorliegt** — **also wo
der BLS das Lebensmittel auf Vitamin A untersucht hat und nur die
Carotinoide nicht beziffert.**

`[cmd]` **Bei zwoelf der fuenfzehn ist `RETOL` gemessen oder logische
Null.** `[read]` **Dort ist die Annahme *,,kein Beta-Carotin"* keine
Erfindung, sondern die naheliegende Lesart.**

`[read]` **Und der Score muss sagen, dass er so rechnet** — der
`teilweise`-Zustand aus C-177 traegt das.

## Abnahme

**2026-09-01, entschieden von Tom.**

*,,die datenlage bei bls ist klar oder? entweder 0 nichts/nicht
gemessen oder loq unter erfassbarem wert. was hackst du denn seit
tagen auf diesem thema rum? wenn die daten nicht da sind erfinden wir
sie nicht."*

**E-38 gilt unveraendert. Weg 2 und Weg 3 sind vom Tisch.**

    zensiert (<LOD/<LOQ)   0 -- gemessen, unter der Grenze
    Luecke                 bleibt Luecke
    logische Null          0 -- die Quelle sagt es
    Spuren                 bleibt unvollstaendig

`[read]` **Mein Vorschlag, die Carotinoid-Luecke bei Fisch und
Getreide als Null zu behandeln, war eine Erfindung** — **fachlich
plausibel, aber nicht aus der Quelle.**

`[read]` **Und die Regel steht seit E-38 und C-48 Regel 1:** ein
Fehlzaehler wird nicht zur Null.

## Was daraus folgt

`[cmd]` **NRF9.3 liefert `incomplete`, solange die Komponenten
fehlen.** `[cmd]` **Auf `dev` an 30 von 30 Tagen.**

`[read]` **Das ist kein Fehler, sondern die Datenlage** — **und die
Anzeige muss es sagen koennen.** `[cmd]` **Der `teilweise`-Zustand
aus C-177 traegt das.**

`[read]` **Was den Score rechenbar macht, ist ein Speiseplan aus den
71 Prozent des Katalogs, die vollstaendig sind** — **nicht eine
Annahme ueber die uebrigen 29.**

**Geschlossen.**
