---
nr: C-149
typ: blocker
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-91
kinder: []
agent: codex
beauftragt: 2026-08-28
entscheidung: null
beruehrt:
  tabellen: [supplements.supplement_nutrients]
  dateien: [supabase/_pipeline/13_supplements/149_folate_unit_guard.sql, supabase/_pipeline/kette.json, supabase/README.md]
zahlen:
  gemessen: 2026-08-28
  supplement_nutrients_zeilen: 17
  biologische_umrechnungen: 1
  codes_mit_zwei_kanonischen_einheiten: 0
  bekannte_zeilen_nach_guard: 16
  unbekannte_zeilen_nach_guard: 1
---

# C-149 - Vitamin D in IU gegen µg

## Befund

(neu 2026-08-20). Befund aus
  G-91.

  `[cmd]` **Naiv addiert: 33.430 % statt rund 930 %** — **Faktor 40.**
  Supplement in IU, Mikro-Pfad in µg.

  `[cmd]` **Ein Umrechnungsfaktor liegt nirgends im Repo, auch nicht im
  Vorgaengerrepo.** Betroffen ist **genau eine von 11 Zeilen.**

  `[read]` **Nicht gesetzt** — *„das waere die Zahl ohne Beleg."*
  **Richtig: 1 µg Vitamin D3 sind 40 IU, aber der Faktor gehoert
  belegt, nicht aus dem Kopf.**

  `[cmd]` **Und der halbe Blocker ist weg:**
  `nutrition.micronutrient_snapshot` hat 8 echte Zeilen, **7 der 8 Codes
  kommen in `nutrients_provided` vor.**

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator. **Die Zahlen im Befund
sind vom 20.08. und ungeprueft.**

`[read]` **Und der Befund selbst ist zu pruefen, nicht zu glauben.**
`[cmd]` Vier Auftraege sind in den letzten zwei Tagen an ihrer eigenen
Praemisse gescheitert; **einen Defekt habe ich behauptet, den es nicht
gab.**

### Warum das kein Detail ist

`[read]` **Vitamin D ist fettloeslich und kumuliert.** Eine Bilanz,
die 33.430 Prozent statt 930 anzeigt, ist nicht nur falsch — **sie
ist in der Richtung falsch, die zu Unterdosierung fuehrt**, wenn
jemand daraufhin absetzt.

`[read]` **Und der Fehler ist der von heute, in anderer Gestalt:**
zwei Zahlen mit demselben Namen und verschiedener Einheit werden
addiert. `[cmd]` **Genau wie `count_risk_flag_gte` Schluessel statt
Werte zaehlte.**

### Zu tun

**Zuerst messen, wie gross das Problem heute ist.** `[read]` Der
Befund nennt *,,genau eine von 11 Zeilen"* — **das war vor acht
Tagen.** **Welche Naehrstoffe tragen heute Werte in zwei Einheiten?**
`[read]` **Nicht nur Vitamin D** — Vitamin A, E und Folat haben
dieselbe Klasse Problem (IE gegen µg, DFE gegen µg).

**Dann den Umrechnungsfaktor belegen, nicht setzen.** `[read]` **Der
Befund sagt es selbst:** *,,1 µg Vitamin D3 sind 40 IU, aber der
Faktor gehoert belegt, nicht aus dem Kopf."*

`[read]` **Wo der Beleg herkommt, ist deine Entscheidung** — DGE,
EFSA, oder eine Quelle, die schon im Bestand steht. **Nenn sie, und
nenn sie je Naehrstoff**, denn die Faktoren unterscheiden sich: bei
Vitamin E haengt er an der Form.

**Und die Umrechnung dorthin, wo sie hingehoert.** `[read]` **Nicht
in die Anzeige.** Eine Bilanz, die nur beim Anzeigen richtig rechnet,
ist bei der naechsten Auswertung wieder falsch — **dasselbe Muster
wie die Snapshots aus G-138.**

### Was nicht zu tun ist

**Keinen Faktor aus dem Gedaechtnis setzen**, auch keinen richtigen.
`[read]` **Eine Zahl ohne Beleg ist der Fehler, den dieser Punkt seit
acht Tagen offenhaelt.**
**Keine Referenzwerte aendern.**
`apps/` nicht anfassen — Claude Code arbeitet dort an G-218.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Naehrstoffe mit zwei Einheiten   Zahl, je einzeln benannt
    je Faktor                        Quelle genannt
    Umrechnung wo                    Ort begruendet
    Vitamin D vorher / nachher       die Bilanz in Prozent
    Gegenprobe                       ein Wert in µg und derselbe
                                     in IU ergeben dieselbe Bilanz
    andere Naehrstoffe               unveraendert - belegt

`[read]` **Die letzte Zeile ist die, die sonst fehlt.** Eine
Einheitenkorrektur, die nebenbei andere Werte verschiebt, faellt erst
auf, wenn jemand seine Bilanz vergleicht.

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

### Urteil: teilweise

Die behauptete IU/ug-Addition ist im heutigen Tagesbilanzcode nicht mehr
vorhanden: `nutrition.daily_reference_assessment()` liest ausschliesslich
`daily_nutrient_summary_long` aus Mahlzeiten. Supplemente werden dort noch
nicht mitgerechnet. Der C-158-Katalogpfad normalisiert Vitamin D bereits vor
einer moeglichen Bilanzierung; eine Anzeige rechnet nichts um.

`[cmd]` Ausgangsvermutung vom 2026-08-20: eine von 11 Zeilen mit Faktor,
33.430 % statt rund 930 %. Heute vor dem Guard: 17
`supplements.supplement_nutrients`-Zeilen, davon eine biologische
Einheitenumrechnung (Vitamin D; daneben eine reine mg/ug-Umrechnung bei B6),
und 0 Naehrstoffcodes mit zwei gespeicherten kanonischen Einheiten. Die drei
offenen Kollisionen sind Vitamin A, Vitamin E und Folat. Nach dem Guard sind
16 Zeilen `bekannt`, eine (Folat) `unbekannt`; die Zeilenzahl bleibt 17.

### Quellen und Entscheidung

`[read]` Vitamin D: Das NIH Office of Dietary Supplements belegt 1 ug =
40 IU. Der Katalog speichert 5.000 IU als 125 ug mit Faktor 0,025 in
`supplement_nutrients`; Quelle:
https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/.

`[read]` Vitamin A: kein pauschaler Faktor. NIH ODS nennt je nach Form
0,3 ug RAE/IU (Retinol oder Beta-Carotin-Supplement), 0,05 ug RAE/IU
(Beta-Carotin aus Nahrung) und 0,025 ug RAE/IU (Alpha-Carotin oder
Beta-Cryptoxanthin aus Nahrung). Die Form des 5.000-IU-Katalogeintrags fehlt,
daher bleibt er ohne Naehrstoffzuordnung. Quelle:
https://ods.od.nih.gov/factsheets/VitaminA-HealthProfessional/.

`[read]` Vitamin E: ebenfalls kein pauschaler Faktor. 1 IU entspricht
0,67 mg bei natuerlichem und 0,45 mg Alpha-Tocopherol bei synthetischem
Vitamin E. Die Form der 400-IU-Katalogportion fehlt; sie bleibt ohne
Naehrstoffzuordnung. Quelle:
https://ods.od.nih.gov/factsheets/VitaminE-HealthProfessional/.

`[read]` Folat: 1 ug DFE entspricht 1 ug Nahrungsfolat, 0,6 ug Folsaeure
mit Nahrung oder 0,5 ug Folsaeure nuechtern; fuer 5-MTHF besteht kein
festgelegter Faktor. Form und Einnahmebezug fehlen. Der vorher trotzdem als
`bekannt` gefuehrte 400-ug-Eintrag wurde deshalb durch den neuen Kettenschritt
`149_folate_unit_guard.sql` auf `unbekannt` gesetzt und von
`supplement_nutrient_intake_for_day()` ausgeschlossen. Quelle:
https://ods.od.nih.gov/factsheets/Folate-HealthProfessional/.

### Nachweis

`[cmd]` Wegwerf-Datenbank `lumeos_c149`: Bei 15 ug aus einer Mahlzeit und
5.000 IU Vitamin D ergibt die alte hypothetische Rohaddition 33.433,333 %;
die quellenbelegte Rechnung mit 125 ug ergibt 933,333 %. Das weicht von der
Auftragszahl 33.430 % bzw. rund 930 % nur durch deren Rundung ab. Die beiden
Eingaben 5.000 IU und 125 ug lieferten jeweils 125 ug aus
`supplement_nutrient_intake_for_day()`.

`[cmd]` Gegenprobe: Vor dem Guard gab derselbe Test fuer Folat 400 ug
zurueck. Danach gab er nur Vitamin D (125 ug) zurueck; die Folat-Zeile steht
als `unbekannt` mit leerer Menge, Einheit und Faktor. Die Mahlzeitenwerte
blieben in beiden Vitamin-D-Faellen unveraendert: Vitamin A 100 ug,
Vitamin E 10 mg und Folat 330 ug. Die Tagesbewertung blieb erwartungsgemaess
bei 100 %, weil ihr Vertrag derzeit Mahlzeiten, nicht Supplemente, umfasst.

`[cmd]` Vollstaendige Kette: `pnpm exec tsx
supabase/_pipeline/kette-ausfuehren.ts --database lumeos_c149_final
--keep-database` lief mit 128 Schritten in 155 s durch. Kein Live-Eingriff,
keine Sicherung und keine Aenderung an Referenzwerten; getestet wurde nur in
Wegwerf-Datenbanken.

`[cmd]` `node tools/migration-datenlogik-pruefen.mjs` ist gruen.
`kette-readme-pruefen.ts` bleibt bei 41 bereits bekannten Dokumentationsluecken;
der neue Schritt ist dokumentiert und hat keine weitere Abweichung erzeugt.
`node tools/punkte-pruefen.mjs` ist rot bei 26 statt Soll 25, ausschliesslich
wegen des gleichzeitig neu angelegten Punkts G-219; C-149 fuegt keinen
Waecherbefund hinzu.

### Rest

Eine Gesamtbilanz aus Mahlzeiten und Supplementen ist nicht Teil dieses
Punkts: Sie muss den bestehenden Supplement-Lesepfad verwenden und darf weder
Roh-IU noch eine Anzeige-Umrechnung einfuehren. Bis diese Verbindung explizit
gebaut ist, bleibt `daily_reference_assessment()` eine reine
Mahlzeitenbilanz. Der Einheitenfehler ist damit am kanonischen
Supplement-Eingang abgesichert; die fachliche Gesamtbilanz ist separat offen.

## Abnahme

_(vom Orchestrator)_
