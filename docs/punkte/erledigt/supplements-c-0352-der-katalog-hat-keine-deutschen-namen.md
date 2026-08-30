---
nr: C-352
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-08-30
braucht: []
kind_von: C-316
entscheidung: null
agent: codex
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: 4c10e821
beruehrt:
  tabellen: [supplements.supplements]
zahlen:
  gemessen: 2026-08-30
  ohne_name_de: 412
  sichtbar_gesamt: 412
  mit_name_en: 412
---

# C-352 — der Katalog hat keine deutschen Namen

## Befund

Aus C-316, Codex, 2026-08-30. **Vom Orchestrator nachgemessen.**

`[cmd]` **412 von 412 sichtbaren Substanzen haben kein `name_de`.**
`[cmd]` **Alle 412 haben ein `name_en`.**

`[read]` **Der Punkt hiess *,,NAC steht im Katalog ohne deutschen
Namen"*.** **NAC war kein Einzelfall, sondern ein sichtbares
Beispiel.**

`[read]` **Meine Frage im Auftrag lautete: *,,eine Zeile ist ein
Tippfehler, zwanzig sind ein Importfehler"*.** **Die Antwort ist eine
dritte: alle.**

## Was daran haengt

`[cmd]` **Die Oberflaeche ist dreisprachig angelegt (DE/EN/TH).**
`[read]` **Ein Katalog ohne deutsche Namen zeigt jedem Nutzer
englische Substanznamen** — unabhaengig von seiner Sprachwahl.

`[read]` **Und es ist dieselbe Klasse wie C-177:** eine Sprache ist
vorgesehen, und die Daten dahinter fehlen. `[cmd]` **Dort sind es
Thai-Aliase, hier deutsche Substanznamen.**

## Zu klaeren, bevor gebaut wird

**Woher kaemen die deutschen Namen?**

`[read]` **Substanznamen sind nicht frei uebersetzbar** — *NAC*
heisst auch auf Deutsch NAC, *Vitamin D3* ebenso. `[read]` **Aber
*Ashwagandha* gegen *Schlafbeere* ist eine Entscheidung, und
*Cholecalciferol* gegen *Vitamin D3* auch.**

`[cmd]` **Der Medikamentenkatalog hat dasselbe Problem von der
anderen Seite:** `medication_products` traegt DE=0 bei 448
Produkten.

`[read]` **Also keine Uebersetzungsaufgabe, sondern eine Frage nach
der Quelle** — **und die gehoert Tom vorgelegt, nicht geraten.**

## Praezisiert, 2026-08-30

**Tom hat den Zuschnitt bestaetigt:** *,,fuer welche der 412 lohnt
sich ein deutscher Name? Und die Antwort waere eine kurze Liste,
keine Katalogarbeit."*

### Drei Faelle, gemessen an echten Namen

    Glucosamine              -> Glucosamin        Nomenklatur
    L-Citrulline             -> L-Citrullin       nur die Endung
    Insulin Glargine         -> Insulin glargin   INN, amtlich
    Testosterone Isocaproate -> Testosteronisocaproat

    Gotu Kola                -> Indischer Wassernabel?
    Cistanche                -> bleibt

    GHRP-6, AOD-9604, BAM15  -> bleiben           Codes
    Andarine (S4)            -> bleibt            Forschungscode
    1-Andro (1-DHEA)         -> bleibt            Szenename

`[read]` **Der erste Fall ist keine Uebersetzung, sondern
Nomenklatur** — `-ine` wird `-in`, `-ate` wird `-at`, und fuer
Wirkstoffe gibt es den INN mit amtlicher deutscher Schreibweise.

`[read]` **Der zweite ist eine Entscheidung, und meist gegen den
deutschen Namen:** *Gotu Kola* heisst *Indischer Wassernabel*,
**aber niemand sucht danach.** `[cmd]` **Die Suche findet heute ueber
`name_en`** — ein deutscher Name, den keiner eintippt, macht sie
schlechter.

`[read]` **Der dritte hat nichts zu uebersetzen.**

### Was daraus folgt

`[cmd]` **Ein leeres `name_de` mit Rueckfall auf `name_en` ist der
gebaute Weg** — gemessen in G-253.

`[read]` **Also nicht *,,412 Namen beschaffen"*, sondern messen, wie
viele in den ersten Fall fallen.** `[read]` **Das sind die, bei denen
ein deutscher Name eine Regel ist und keine Meinung** — und nur die
gehoeren gefuellt.

## Auftrag — die Nomenklaturfaelle zaehlen

**Mitbeauftragt: C-358.** Bericht in diese Datei.

**Beauftragt am 2026-08-30.**

### 1 · C-352 — nicht 412 Namen, sondern eine Liste

**Tom, 2026-08-30:** *,,fuer welche der 412 lohnt sich ein deutscher
Name? Und die Antwort waere eine kurze Liste, keine Katalogarbeit."*

`[read]` **Der Punkt oben nennt drei Faelle.** **Miss, wie viele in
den ersten fallen** — **wo ein deutscher Name eine Regel ist und
keine Meinung.**

    Nomenklatur    -ine -> -in, -ate -> -at, INN mit amtlicher
                   deutscher Schreibweise
    Meinung        Gotu Kola gegen Indischer Wassernabel
    nichts         GHRP-6, AOD-9604, Andarine (S4)

`[read]` **Nur die erste Gruppe fuellen.** `[read]` **Und wenn ein
Name unsicher ist, bleibt er leer** — `name_en` ist der gebaute
Rueckfall.

`[cmd]` **Kein Katalogausbau** — es geht um Namen, nicht um
Beschreibungen oder Evidenzstufen.

### 2 · C-358 — abgelaufene Aktionen

`[cmd]` **Zwei `dev`-Zeilen tragen vergangenes `expires_at` und
`status = 'pending'`.**

`[read]` **Das ist eine Entscheidung, keine Bauarbeit** — **miss den
Umfang und leg die drei Wege vor:** Schreibweg auf `expired`, Filter
in der Funktion, oder Vermerk in der Anzeige.

`[read]` **Und die Frage dahinter: wer schreibt?** **Einen
Hintergrundlauf gibt es nicht, und ein Lesevorgang, der schreibt, ist
eine eigene Klasse.**

### Nachweis

    Nomenklaturfaelle      Zahl, Liste
    gefuellt               wie viele, je mit Regel
    unsicher geblieben     wie viele, mit Grund
    abgelaufene Aktionen   Zahl, drei Wege vorgelegt

## Bericht

**Nachgemessen am 2026-08-30.** C-352 ist eine kleine, belegbare
Nomenklaturarbeit, keine Uebersetzung des Katalogs. C-358 braucht nach
G-258 keine Anzeigeentscheidung mehr, sondern nur noch die Entscheidung,
ob ein Statuswechsel je geschrieben wird. Die **20** regelbasierten Namen
sind als Kettenschritt eingespielt; Status-Werte, `apps/`-Dateien und ADRs
blieben unveraendert.

| Nachweis | Ergebnis |
|---|---|
| vor C-352 sichtbarer Katalog | **412/412** mit leerem `name_de`, **412/412** mit `name_en` |
| nach C-352 sichtbarer Katalog | **20/412** mit regelbasiertem `name_de`, **392/412** beim EN-Rueckfall |
| erster mechanischer Lauf | **78** Namen enden auf `-ine` oder `-ate`; das ist nur eine Kandidatenmenge, keine Einspielmenge |
| sicherer Nomenklatur-Satz | **20** Eintraege, unten einzeln; alle 20 wurden ohne Namensentscheidung gefuellt |
| unsicher / nicht fuellbar | **392**; darin alle Pflanzen-, Handels- und Forschungsnamen sowie jede nicht einzeln belegte INN-Form |
| abgelaufene Coach-Aktionen | **3** `pending` mit abgelaufener Frist: **2** fuer `dev@lumeos.app`, **1** Seed-Zeile |
| Status `expired` | im CHECK bereits erlaubt, live **0** Zeilen; kein Schreiber und kein Zeitplaner |

### 1. C-352 - die Nomenklaturliste ist kurz

Die Endung allein ist keine Regel: Die 78 Treffer enthalten etwa
`Andarine (S4)`, `Cardarine`, Handels- und Produktformen sowie
Mischbezeichnungen. Ein pauschales Ersetzen wuerde genau die
Namensentscheidung erzeugen, die ausgeschlossen ist.

Die folgenden **20** sind der enge Satz. Jede Aenderung ist entweder
die eindeutige deutsche Stoffschreibweise oder eine in deutscher
Arzneimittelinformation nachweisbare INN-Schreibweise; es wird weder ein
Trivialname noch eine Wirkung ergaenzt.

| `name_en` | eingespieltes `name_de` | Regel |
|---|---|---|
| Acetyl-L-carnitine (ALCAR) | Acetyl-L-Carnitin | `-ine` -> `-in` |
| Anastrozole (PCT/estrogen control) | Anastrozol | deutsche INN |
| Berberine | Berberin | `-ine` -> `-in` |
| Beta-alanine | Beta-Alanin | `-ine` -> `-in` |
| Beta-carotene (provitamin A) | Beta-Carotin | `-ene` -> `-in` Fachnomenklatur |
| Bromocriptine | Bromocriptin | deutsche INN |
| Caffeine | Koffein | deutsche Stoffschreibweise |
| Choline bitartrate | Cholinbitartrat | `-ine` / `-ate` |
| Citrulline malate | Citrullinmalat | `-ine` / `-ate` |
| Creatine hydrochloride (HCl) | Kreatinhydrochlorid | deutsche Stoffschreibweise |
| Creatine monohydrate | Kreatinmonohydrat | deutsche Stoffschreibweise |
| Creatine nitrate | Kreatinnitrat | deutsche Stoffschreibweise |
| Folate (B9) | Folat (B9) | `-ate` -> `-at` |
| Glucosamine | Glucosamin | `-ine` -> `-in` |
| L-Carnitine L-tartrate | L-Carnitin-L-tartrat | `-ine` / `-ate` |
| L-Citrulline | L-Citrullin | `-ine` -> `-in` |
| Semaglutide | Semaglutid | deutsche INN |
| Taurine | Taurin | `-ine` -> `-in` |
| Tirzepatide | Tirzepatid | deutsche INN |
| Zinc | Zink | deutsche Stoffschreibweise |

Die deutsche Schreibung von Anastrozol ist in der [deutschen Fachinformation
zu Anablock](https://www.fachinfo.de/fi/detail/012561/anablock-1-mg-filmtabletten)
belegt; die [EMA-Produktinformation](https://www.ema.europa.eu/de/documents/other/new-product-information-wording-extracts-prac-recommendations-signals-adopted-8-12-july-2024-prac_de.pdf)
fuehrt Semaglutid und Tirzepatid auf Deutsch. Diese Quellen stuetzen die
INN-Regel, nicht die 412 Namen als Ganzes. Die geschlossene Zuordnung liegt
als Schritt `141y` nach dem Katalogaufbau in der Kette; damit wird sie beim
Neuaufbau erneut gesetzt statt wieder geleert.

Alle uebrigen **392** bleiben absichtlich leer. Dazu gehoeren:

- Pflanzen- und Trivialnamen wie `Gotu Kola`, `Cistanche`, `Black
  Cohosh`, `Tongkat Ali` und `Whey Protein`: Ein deutscher Name waere
  eine Produkt- bzw. Sprachentscheidung.
- Forschungs-, Handels- und Szenenamen wie `GHRP-6`, `AOD-9604`,
  `Andarine (S4)`, `BAM15`, `1-Andro (1-DHEA)` und `Cardarine`.
- die restlichen INN- oder Wirkstoffkandidaten: ohne einzelne deutsche
  Primaerquelle bleibt auch eine plausibel wirkende Endung leer.

Der bestehende Rueckfall `name_de` -> `name_en` bleibt deshalb fuer
**392** sichtbare Eintraege der richtige Zustand. Ein Katalogausbau
wurde nicht vorgenommen.

Die C-352-Regression ist nach der Einspielung gruen (20 exakte
Zuordnungen, insgesamt 20 sichtbare `name_de`) und der Kettenschritt
laeuft idempotent mit `UPDATE 0` erneut. Die globale
Ketten-README-Pruefung bleibt mit 44 Dokumentationsabweichungen rot;
43 davon bestanden davor, die README ist bereits hinter vielen
Kettenschritten zurueck und wurde hier nicht nebenbei geaendert.

### 2. C-358 - `expired` ist moeglich, aber niemand schreibt es

Live gibt es drei `coach.pending_actions`; alle stehen auf `pending`,
alle drei Fristen sind vergangen. Nach G-258 werden sie beim Lesen
richtig als **abgelaufen** gezeigt, nicht als erledigt: die
`coach.offene_aktionen(p_modul)`-Funktion liefert pending-Zeilen
unveraendert, und `lageVon()` bildet den Anzeigezustand aus
`status` plus `expires_at`.

| Konto | Modul | Status | Anzeigezustand |
|---|---|---|---|
| `dev@lumeos.app` | nutrition | 2 x `pending`, Frist vorbei | 2 x abgelaufen |
| `tom.seed@example.com` | nutrition | 1 x `pending`, Frist vorbei | 1 x abgelaufen |

Der Tabellen-CHECK erlaubt bereits `pending`, `confirmed`, `rejected`,
`expired` und `cancelled`. Es gibt aber keinen Funktions- oder
Anwendungsweg, der `status = 'expired'` setzt; die einzige
Statusaenderung schreibt heute auf `confirmed` oder `rejected` und
verweigert vorher abgelaufene Aktionen. `pg_cron` ist nicht installiert,
`cron.job` existiert nicht, und im Coach-Schema gibt es keine
Verfallsfunktion.

Die drei vorliegenden Wege sind damit:

| Weg | Ergebnis | Wer schreibt / entscheidet |
|---|---|---|
| geplanter Statuswechsel | setzt nach Fristablauf einmalig `expired`; Historie und Listen koennen danach nach Status arbeiten | ein neu zu bestimmender Hintergrunddienst mit eigener Berechtigung; heute nicht vorhanden |
| Filter in `offene_aktionen()` | verbirgt abgelaufene pending-Zeilen, ohne ihren Status zu aendern | niemand; verwirft aber die von G-258 gebaute Anzeige und laesst die Wahrheit in der Tabelle liegen |
| Anzeigevermerk | laesst `pending` stehen und zeigt abgelaufen; keine Nebenwirkung beim Lesen | niemand; **heute gebaut** |

Ein Schreibvorgang im Lesepfad waere kein Ersatz fuer einen Job: Er
machte das Ergebnis davon abhaengig, dass ein Nutzer eine Seite oeffnet,
und vermischte die in E-29 getrennte Lesenaht mit einem Statuswechsel.
Die verbleibende Entscheidung fuer Tom lautet daher nur: Soll der
Status jemals materialisiert werden? Falls ja, muss vor dem Bau der
autoritative Schreiber (geplanter Dienst oder explizite Coach-Aktion)
festgelegt werden.

## Abnahme

**2026-08-30, Orchestrator.**

`[cmd]` **20 von 412 gefuellt, 392 bleiben beim EN-Rueckfall.**

### Die Endung allein war keine Regel

`[cmd]` **Der erste mechanische Lauf fand 78 Namen auf `-ine` oder
`-ate`** — **darunter `Andarine (S4)`, `Cardarine`, Handelsformen und
Mischbezeichnungen.**

`[read]` **Ein pauschales Ersetzen haette genau die
Namensentscheidung erzeugt, die ausgeschlossen war.** `[read]` **Er
hat von 78 auf 20 eingegrenzt und die Differenz begruendet.**

`[cmd]` **Jeder der 20 ist entweder eindeutige deutsche
Stoffschreibweise oder eine in deutscher Arzneimittelinformation
belegte INN-Schreibweise** — **mit Fundstelle: Fachinformation
Anablock, EMA-Produktinformation.**

`[read]` **Und kein Trivialname, keine Wirkung ergaenzt.**

`[cmd]` **Regression: exakt 20, keine weiteren.** Kettenschritt als
`141y` registriert.

### C-358 bleibt, aber kleiner

`[cmd]` **3 Aktionen abgelaufen, weiter `pending`. `expired` ist im
CHECK erlaubt, live 0 Zeilen, kein Schreiber, kein Zeitplaner.**

`[read]` **Seit G-258 traegt die Anzeige den Zustand** — *,,2
abgelaufen"*, nicht *,,2 offen"*.

`[read]` **Damit ist die Frage beantwortbar, ohne etwas zu
erfinden:** **beim Anzeigevermerk bleiben.** `[read]` **Ein
Statuswechsel braucht einen autoritativen Schreiber, und den gibt es
nicht** — **weder Hintergrundlauf noch Zeitplaner.** `[read]` **Ein
Lesevorgang, der schreibt, waere eine eigene Klasse und loeste kein
sichtbares Problem.**

**C-358 geschlossen.**

**Abgenommen.**

