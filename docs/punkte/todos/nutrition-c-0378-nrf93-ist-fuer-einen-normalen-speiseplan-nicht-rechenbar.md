---
nr: C-378
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-09-01
braucht: []
kind_von: C-368
entscheidung: null
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
