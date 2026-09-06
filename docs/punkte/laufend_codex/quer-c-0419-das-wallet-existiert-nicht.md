---
nr: C-419
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: null
entscheidung: null
agent: codex
beauftragt: 2026-09-07
beruehrt:
  tabellen: [public.profiles]
zahlen:
  gemessen: 2026-09-07
  tabellen: 0
  code_dateien: 0
  einnahmequellen: 5
---

# C-419 — das Wallet existiert nicht

## Befund

`[cmd]` **Gemessen 2026-09-07: kein Wallet-Schema, keine Tabelle,
keine Zeile Code.**

`[cmd]` **Elf Schemas:** `auth`, `coach`, `goals`, `medical`,
`nutrition`, `public`, `recovery`, `supplements`, `training`,
`wissen`, `_realtime` — **kein `market`, kein `wallet`.**

`[cmd]` **`git grep wallet` in `apps/` und `supabase/_pipeline/`: 0
Dateien.**

## Warum es der erste Punkt ist

`[cmd]` **`00_MASTER_VISION.md`, Abschnitt 5:** **fuenf
Einnahmequellen laufen ueber das Wallet.**

    User Subscription        Wallet-Gutschrift
    Wallet-Transaktionen     Fees auf interne Kaeufe
    B2B Coach                Stripe + Revenue Wallet
    Marketplace Commission   % auf Produktkaeufe
    Human Coach Fee          Plattform-Fee

> *,,Lumeos verdient an jeder Transaktion im Ecosystem."*

`[read]` **Das Wallet ist kein Marketplace-Feature** — **es ist der
Kernmechanismus.**

`[read]` **Und es betrifft `coach` genauso:** **Coach-Auszahlungen
und der Abo-Voucher laufen darueber.**

## Und es betrifft MealCam

`[cmd]` **`SPEC_05_WALLET_ECONOMICS.md`:**

    ai_usage       voucher -> --   AI Micro-Transaction
    Lumeos Basic   ai_credits_included: 20
                   -- 20 MealCam Scans/mo inklusive

`[read]` **MealCam kostet je Aufnahme, und das Wallet traegt die
Abrechnung.**

`[cmd]` **In `SPEC_11_MEALCAM` steht davon nichts** — **der
Orchestrator hat sie geschrieben, ohne diese Spec zu kennen.**

## Die Spec ist vollstaendig

`[cmd]` **`docs/specs/Marketplace/SPEC_05_WALLET_ECONOMICS.md`, 225
Zeilen.**

**Zwei Guthaben je Wallet:**

    VOUCHER   Abo, Top-up, Bonus, Geschenk
              nicht auszahlbar, verfaellt bei Kuendigung
    REVENUE   Verkaeufe, Coach-Sessions, B2B
              auszahlbar ueber Stripe Connect

`[cmd]` **Ausgabenreihenfolge: Voucher zuerst, dann Revenue.**

**Fuenf Besitzerarten:** `user`, `creator`, `gym`, `vendor`,
`brand` — **nur Creator und B2B duerfen auszahlen.**

**Neun Transaktionsarten**, **Gebuehrensaetze je Produktart und
Herkunft**, **vier Werbeplaetze mit Preisen**, **drei Aboplaene.**

## Was zuerst zu bauen ist

`[cmd]` **`SPEC_06_DATABASE_SCHEMA.md`, 417 Zeilen** — **das Schema
steht dort.**

`[read]` **Kein Bildschirm, keine Oberflaeche** — **die Tabellen,
die Transaktionsarten und die Ausgabenreihenfolge.**

`[read]` **Eine Buchung, die zur Haelfte geschieht, ist schlimmer
als keine** — **wie bei `decide_recipe_curation_candidate`** (C-31).

## Und die Grundregel gilt

`[cmd]` **`00_MASTER_VISION.md`, Kernprinzip 5:** *,,No direct DB
writes from UI — immer ueber Actions Layer."*

`[read]` **Bei Geld ist das keine Empfehlung.**

## Auftrag — das Wallet-Schema

**Mitbeauftragt: C-420.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-419 — das Wallet

`[cmd]` **Gemessen: kein Schema, keine Tabelle, keine Zeile Code.**

`[cmd]` **Und fuenf Einnahmequellen laufen darueber**
(`00_MASTER_VISION.md`, Abschnitt 5).

`[cmd]` **Die Spec ist vollstaendig:**
`docs/specs/Marketplace/SPEC_06_DATABASE_SCHEMA.md`, **417 Zeilen** —
**dort steht, was zu bauen ist.**

`[cmd]` **Dazu `SPEC_05_WALLET_ECONOMICS.md`, 225 Zeilen:**

    VOUCHER   Abo, Top-up, Bonus, Geschenk
              nicht auszahlbar, verfaellt bei Kuendigung
    REVENUE   Verkaeufe, Coach-Sessions, B2B
              auszahlbar ueber Stripe Connect

    Ausgabenreihenfolge: Voucher zuerst, dann Revenue

`[cmd]` **Fuenf Besitzerarten:** `user`, `creator`, `gym`, `vendor`,
`brand` — **nur Creator und B2B duerfen auszahlen.**

`[cmd]` **Neun Transaktionsarten**, **Gebuehrensaetze je Produktart
und Herkunft**, **vier Werbeplaetze**, **drei Aboplaene.**

**Bau das Schema** — **keine Oberflaeche, keine API.**

`[read]` **Eine Buchung, die zur Haelfte geschieht, ist schlimmer
als keine** — **wie bei `decide_recipe_curation_candidate`
(C-31).**

`[cmd]` **Und `00_MASTER_VISION.md`, Kernprinzip 5:** *,,No direct DB
writes from UI — immer ueber Actions Layer."* `[read]` **Bei Geld
ist das keine Empfehlung.**

### Lies zuerst `00-QUELLEN.md`

`[cmd]` **`docs/spezifikation/00-QUELLEN.md` sagt je Modul, was zu
lesen ist** — **der Orchestrator hat sie heute zweimal uebersprungen
und beide Male etwas Falsches behauptet.**

### 2 · C-420 — der Waechter kennt keine Uebersetzung

`[cmd]` **In `recovery`: 170 gemeldet, 11 wirklich weg.** `[cmd]`
**Faktor 15.**

`[cmd]` **`Muscle readiness` im Mockup gegen `Muskelbereitschaft` im
Code** — **die App ist mehrsprachig, das Mockup englisch.**

`[read]` **Miss, wo die Uebersetzungsdateien liegen** — `[cmd]`
**`packages/` oder `apps/web/src/i18n`.**

`[read]` **Und bau den Vergleich um:** **ein Mockup-Titel gilt als
vorhanden, wenn er selbst oder seine Uebersetzung im Code steht.**

`[cmd]` **`tools/mockup-deckung.mjs` laeuft im Gate** — **die Zahl
1.343 ist falsch, die Richtung stimmt.**

### Was nicht zu tun ist

**Keine Oberflaeche, keine API** — das sind spaetere Auftraege.
**Nie gegen die laufende Datenbank testen.**
`apps/` nicht anfassen — **Claude Code arbeitet dort.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Schema        alle Tabellen aus SPEC_06, gezaehlt
    Buchung       Voucher zuerst, dann Revenue -- belegt
    Teilzustand   ein Fehler hinterlaesst keinen
    RLS           je Tabelle in beide Richtungen
    Waechter      recovery meldet 11 statt 170

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
