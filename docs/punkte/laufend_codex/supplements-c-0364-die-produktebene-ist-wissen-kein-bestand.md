---
nr: C-364
typ: entscheidung
modul: supplements
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: C-202
entscheidung: null
agent: codex
beauftragt: 2026-08-31
beruehrt:
  tabellen: [supplements.intake_logs]
zahlen:
  gemessen: 2026-08-30
  produkte: 50
  marken: 120
  hersteller: 63
---

# C-364 — die Produktebene ist Wissen, kein Bestand

## Befund

Aus C-202, Codex, 2026-08-30.

`[cmd]` **`wissen.product_entities` traegt 50 Produkte, 120 Marken, 63
Hersteller.**

`[cmd]` **Nutzerbestand und Einnahmen verweisen weiter nur auf
Stoffe.**

`[read]` **Ein Nutzer nimmt heute *Magnesium*, nicht *Produkt X von
Hersteller Y*.**

## Die Frage

**Soll eine Einnahme auf ein Produkt zeigen koennen?**

`[read]` **Dafuer spricht:** `[cmd]` **C-250 hat gemessen, dass
`cost_per_serving` und `serving_size` fehlen** — **beides sind
Produkteigenschaften, keine Stoffeigenschaften.** `[read]` **Und der
Cam-Weg aus C-207 liest Packungen, also Produkte.**

`[read]` **Dagegen:** die Bilanz aus C-351 rechnet Stoffe. **Ein
Produkt haette eine Dosierung, die auf einen Stoff zeigt** — **eine
Zwischenschicht, die heute niemand braucht.**

`[read]` **Und die Modulgrenze:** `wissen` ist der Katalog,
`supplements` der Bestand. **Eine Verbindung waere ein Fremdschluessel
ueber Schemagrenzen** — **dieselbe Klasse wie E-29 bei `coach`.**

## Auftrag — die Grenze zwischen Katalog und Bestand

**Mitbeauftragt: C-365.** Bericht in diese Datei.

**Beauftragt am 2026-08-31.**

### Was zu messen ist, bevor entschieden wird

`[cmd]` **`wissen.product_entities`: 50 Produkte, 120 Marken, 63
Hersteller.** `[cmd]` **`supplements.intake_logs`: 744 Einnahmen, alle
auf Stoffe.**

`[read]` **Miss, was eine Verbindung kosten wuerde** — **und ob sie
heute jemand braucht.**

`[cmd]` **C-250: `cost_per_serving` und `serving_size` fehlen** — beides
Produkteigenschaften. `[cmd]` **C-351: die Tagesbilanz rechnet
Stoffe.** `[cmd]` **C-207: der Cam-Weg liest Packungen, also
Produkte.**

`[read]` **Und die Modulgrenze zaehlt:** ein Fremdschluessel von
`supplements` nach `wissen` ist dieselbe Klasse wie E-29 bei `coach`.
**Melden, nicht setzen.**

### 2 · C-365 — die 33 CAS-Nummern

`[read]` **Die 27 Peptidsequenzen haben kein Ziel** — **das bleibt so,
bis jemand einen Leser nennt.**

`[cmd]` **Fuer CAS gibt es eine Spalte.** `[read]` **Miss, ob die 33
belegbar sind, und trag sie ein** — **kein Katalogausbau, nur
Kennungen.**

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Verbindung Produkt-Einnahme   was wuerde sie kosten
    braucht sie heute jemand      belegt
    Modulgrenze                   benannt, nicht ueberschritten
    CAS-Nummern                   wie viele belegbar, eingetragen
    Peptidsequenzen               unveraendert, mit Grund

## Bericht

### Messung 2026-08-31

`wissen.product_entities` hat die bekannte Wissensebene vollstaendig:
50 Produkte, 120 Marken und 63 Hersteller (353 Zeilen insgesamt). Die 50
Produkte enthalten 73 Stoffreferenzen: 36 haben genau einen Stoff, 14 mehrere.
Alle Referenzen loesen gegen bestehende `supplements.supplements.slug` auf.

Die Bestandsebene kennt hingegen kein Produkt:

| Befund | Ergebnis |
|---|---:|
| `supplements.intake_logs` | 744 |
| davon mit `stack_item_id` | 744 |
| davon aktuell auf einen Katalogstoff aufloesbar | 552 |
| davon Custom-Stack-Item ohne Stoff | 192 |
| Produktspalte/FK in `supplements` | 0 |
| FK von `supplements` nach `wissen` | 0 |

Die Bilanz aus C-351 folgt ausschliesslich
`intake_logs -> stack_items -> supplement_nutrients`. Sie kann deshalb weder
Preis noch Portionsgroesse einer Packung lesen. Von den 50 Wissensprodukten
haben 4 eine `serving_size`; ein strukturiertes `price_per_serving` hat keines.
Die Produkteigenschaften aus C-250 bleiben also weiterhin nicht im Bestand.

### Was eine Verbindung kosten wuerde

Eine minimale Verbindung braeuchte mindestens einen optionalen Produktverweis
am Stack-Item (nicht nur an der historischen Einnahme), eine FK ueber
`supplements -> wissen`, RLS-/Schreib- und Lesepfade sowie einen eindeutigen
Weg von Produktportion zu Stoffmenge. Die 14 Mehrstoffprodukte zeigen, warum
ein Verweis auf genau einen `supplement_id` dafuer nicht reicht: Es braeuchte
eine Produkt-Stoff- und Portionsabbildung, bevor eine Bilanz daraus rechnen
koennte.

Heute braucht sie kein Leser: Die DB hat 0 Funktionen und 0 Views, die
`wissen.product_entities` lesen; ausser dem Import gibt es im Nicht-`apps`-
Code keinen Leser. C-207 liefert sieben Scan-/Vision-Vertraege, vier davon
ausdruecklich `schema_only_no_implementation`; der Cam-Weg ist damit kein
heutiger Produktlesepfad. Es gibt folglich keinen Anlass, die Modulgrenze zu
ueberschreiten. **Kein FK und keine Produktebene im Bestand wurden gebaut.**
Die Entscheidung bleibt bei Tom: Produktbestand erst dann einfuehren, wenn
Packung, Portion oder Kosten einen benannten Leser erhalten.

### C-365 - CAS ja, Peptidsequenzen weiter nein

Der aktuelle maschinenlesbare Kimi-Bestand hat 446 Stoffdatensaetze. Vom
37er-Pruefsatz aus `reports/crawl_027_ws/A.json` loesen sich 36 eindeutig
gegen diese Daten auf; `5-Amino-1MQ` ist dort selbst als nicht vorhanden
markiert. 33 der 36 tragen eine `cas_number`, alle 33 unterschiedlich. Jeder
zugehoerige Quellschluessel existiert bereits als `supplements.supplements.slug`.

Die 33 Werte stehen jetzt als `identifier_type = 'CAS'`, Status `bekannt`, mit
Datensatz-, Quellschluessel- und Feldherkunft in
`supplement_identifiers.evidence_provenance`. Format und CAS-Pruefziffer wurden
vor dem Eintrag geprueft. Der Kettenschritt
`13_supplements/364_supplement_cas_kennungen.sql` ist idempotent; sein zweiter
Lauf hat 0 weitere Zeilen eingefuegt. Es wurden keine Stoffe, Namen oder
`cas_candidates` geaendert.

Bei den Peptidsequenzen bleibt es bei 0 Zielspalten und 0 Lesern. Deshalb
wurde keine neue Spalte und kein Ersatzfeld angelegt.

### Validierung

- Der C-365-Nachweistest war zuerst erwartungsgemaess rot (0 statt 33) und ist
  nach dem Eintrag gruen: 33 exakte CAS-Zuordnungen, 0 Peptidspalten.
- `kette.json` ist valides JSON; der neue Schritt haengt nur von der
  bestehenden Katalogbefuellung (`141y`) ab.
- Der globale `tsc --noEmit --project tsconfig.json` bleibt ausserhalb dieses
  Auftrags rot: bestehende `packages/ui/*.tsx` werden ohne JSX-Option geprueft.
  Der neue SQL-Schritt und sein gezielter Test sind davon nicht betroffen.

## Abnahme

_(vom Orchestrator)_
