---
nr: C-334
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: G-239
entscheidung: null
agent: codex
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: OFFEN
beruehrt:
  tabellen: [nutrition.nutrient_reference_values]
zahlen:
  gemessen: 2026-08-28
  vita_ul_orchestrator: 172
  vita_ul_agent: 164
  faktor: 1.05
---

# C-334 — die Tagesbewertung hat sich zwischen zwei Messungen verschoben

## Befund

`[cmd]` **Am selben Tag, auf denselben Daten, zwei verschiedene
Ergebnisse:**

    Naehrstoff   Agent (G-239)   Orchestrator
    VITA UL         164 %           172 %
    VITA PRI        654 %           689 %
    MG  UL          160,2 %         173 %
    NIA UL          130,7 %         178 %
    MN  UL          nicht genannt   105 %

`[cmd]` **Bei Vitamin A sind beide Werte um denselben Faktor 1,05
verschoben** — kein Rundungsfehler.

`[cmd]` **Meine Werte sind ueber drei Laeufe hintereinander stabil.**
`[cmd]` **`nutrition.meals` unveraendert bei 2.895**, es wurde nichts
geschrieben.

## Was dazwischen lag

`[cmd]` **Zwei vollstaendige Kettenlaeufe:** C-149 (Folat-Waechter,
128 Schritte) und G-221 (Tag-Set, 129 Schritte).

`[read]` **Wenn einer davon Naehrwerte neu berechnet hat, erklaert
das die Verschiebung** — aber keiner der beiden Auftraege sollte
Naehrwerte anfassen. **C-149 hat ausdruecklich nur Folat, Vitamin A
und E *ohne Zuordnung* gelassen.**

`[read]` **NIA weicht staerker ab als die anderen** (130,7 gegen 178,
Faktor 1,36). **Das passt nicht zu einem einheitlichen Faktor** und
gehoert getrennt betrachtet.

## Warum das ernst ist

`[read]` **Eine Bewertung, die sich zwischen zwei Messungen
verschiebt, ist nicht nachvollziehbar.** `[read]` **Und sie betrifft
Obergrenzen:** ob Vitamin A bei 164 oder 172 Prozent des `UL` liegt,
aendert nichts an der Warnung — **aber ein Wert, der wandert, laesst
sich niemandem erklaeren.**

## Zu klaeren

**Was hat sich geaendert, und war es Absicht?**

`[read]` **Zuerst zu pruefen:** hat einer der beiden Kettenlaeufe
`food_nutrients` oder `nutrient_reference_values` beruehrt?
`[cmd]` **Beide Auftraege sagten *,,nichts live geaendert"*** — dann
muesste die Ursache woanders liegen.

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator.

`[read]` **Und dieser Punkt ist eine Beobachtung, keine Diagnose.**
Ich weiss nur, dass zwei Messungen desselben Tages verschiedene Werte
ergaben. **Was daraus folgt, misst du.**

### Zu tun

**Herausfinden, was sich geaendert hat.**

`[read]` **Der naheliegende Verdacht ist der schwaechste:** ich
vermute die beiden Kettenlaeufe aus C-149 und G-221 — **aber beide
Auftraege sagten ausdruecklich, live sei nichts geaendert worden.**
**Pruef das, statt es zu glauben.**

`[read]` **Naeher liegt die Frage, ob die Bewertung ueberhaupt
deterministisch ist.** `[cmd]` Meine Werte waren ueber drei Laeufe
stabil, seine ueber einen. **Ein Wert, der von der Uhrzeit, einer
Reihenfolge oder einem Zwischenspeicher abhaengt, sieht genau so
aus.**

**Und Niacin gehoert getrennt betrachtet.** `[cmd]` Es weicht mit
Faktor 1,36 ab, die anderen mit 1,05. `[cmd]` **Niacin ist der
einzige Fall mit `NO_STANDALONE_REFERENCE + UL`** — **das passt zu
keinem einheitlichen Faktor.**

### Was nicht zu tun ist

**Nichts reparieren, bevor die Ursache steht.** `[read]` **Eine
Korrektur ohne Ursache verschiebt die Zahlen ein drittes Mal.**
**Keine Referenzwerte aendern.**
`apps/` nicht anfassen — Claude Code arbeitet dort an G-240.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Bewertung, dreimal              dieselben Werte?
    Kettenlaeufe                    haben sie live etwas beruehrt?
    Ursache                         benannt oder als unklar gemeldet
    Niacin                          eigener Befund oder derselbe

`[read]` **Wenn du die Ursache nicht findest, ist *unklar* das
Ergebnis** — mit der Angabe, was gemessen werden muesste. **Das ist
besser als eine plausible Erklaerung ohne Beleg.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Lesend gegen live ist in Ordnung.**
`[cmd]` **`dev@lumeos.app` nur lesen** — dort liegen Toms Daten.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

Stand: Ursache der Abweichung eingegrenzt, historischer Schreiber unklar.
Die heutige Bewertung ist deterministisch. Die beiden Messreihen koennen
nicht dieselben Tagesmengen und dieselben Referenzwerte verwendet haben;
die Abweichung liegt vor der Bewertung in einem anderen Datenstand oder
einem anderen Messweg, nicht in Rundung, Uhrzeit, Reihenfolge oder Cache.

### Heutiger Stand und Wiederholung

Abgrenzung: dev@lumeos.app, 2026-06-01,
nutrition.daily_reference_assessment gegen die laufende Datenbank.

| Naehrstoff | Wert aus G-239 | heutiger Lauf 1 | Lauf 2 | Lauf 3 | Orchestrator |
|---|---:|---:|---:|---:|---:|
| VITA PRI | 654,0 % | 654,0 % | 654,0 % | 654,0 % | 689 % |
| VITA UL | 163,5 % | 163,5 % | 163,5 % | 163,5 % | 172 % |
| MG UL | 160,2 % | 160,2 % | 160,2 % | 160,2 % | 173 % |
| NIA UL | 130,7 % | 130,7 % | 130,7 % | 130,7 % | 178 % |
| MN UL | 82,0 % | 82,0 % | 82,0 % | 82,0 % | 105 % |

[cmd] Die drei getrennten Leseaufrufe waren fuer Istwert,
Referenzwert und Prozentwert vollstaendig gleich. Die Annahme einer
nichtdeterministischen Funktion ist damit fuer den heutigen Stand widerlegt.
Der Ausgangswert 164 fuer VITA UL war eine Anzeige-Rundung; die Datenbank
liefert 163,5, nicht 164,0.

### Wo die Abweichung entsteht

[cmd] Die direkte Summe der 15 gespeicherten meal_items am Tag, die lange
Tagesbilanz und die Bewertung stimmen je Code exakt ueberein:

| Code | direkte meal_items-Summe | daily_nutrient_summary_long | Bewertung |
|---|---:|---:|---:|
| VITA | 4.905,02500 ug | 4.905,02500 ug | 654,0 % PRI / 163,5 % UL |
| MG | 560,73715 mg | 560,73715 mg | 160,2 % UL |
| NIA | 45,73065 mg | 45,73065 mg | 130,7 % UL |
| MN | 9.016,82655 ug | 9.016,82655 ug | 82,0 % UL |

[cmd] Die Orchestrator-Prozente wuerden dagegen ungefaehr diese
Tagesmengen voraussetzen: VITA 5.160 bis 5.167,5 ug, MG 605,5 mg,
NIA 62,3 mg und MN 11.550 ug. Die Referenzen sind heute VITA
750/3.000 ug, MG 350 mg, NIA 35 mg und MN 11.000 ug. Insbesondere kann
NIA 178 % nicht aus dem heutigen Istwert oder einer anderen Auswahl der
vorhandenen Referenz entstehen.

Die Werte unterscheiden sich nicht um einen einheitlichen Faktor. Das
spricht gegen eine gemeinsame Umrechnung und fuer andere gespeicherte
Naehrstoffmengen oder einen anderen Messweg zur Zeit der Orchestratorprobe.

### C-149 und G-221

[cmd] C-149 schreibt ausschliesslich supplements.supplement_nutrients.
G-221 schreibt nutrition.tag_definitions und nutrition.food_tags. Keiner
der beiden Schritte schreibt food_nutrients, nutrient_reference_values,
meals oder meal_items.

[cmd] Auf den beruehrten Tabellen gibt es keine Triggerkette zu
meal_items oder nutrient_reference_values. Die einzige FK von food_tags
zeigt auf foods beziehungsweise tag_definitions. daily_nutrient_summary_long
liest meal_items, nicht food_nutrients oder food_tags. Der Verdacht gegen
die zwei Kettenlaeufe ist damit widerlegt.

[cmd] Die aktuellen meal_items und meals haben ihren letzten updated_at am
2026-08-23; die heute passenden Referenzzeilen wurden am 2026-08-16
angelegt. Das ist vor C-149 und G-221 am 2026-08-28. Es gibt in nutrition
keine Audit- oder History-Tabelle fuer meal_items oder
nutrient_reference_values. Daher ist nicht mehr messbar, wann oder durch
welchen Weg die hoehere Orchestrator-Menge vorlag.

### Niacin und Mangan

[cmd] NIA hat getrennte Zeilen NO_STANDALONE_REFERENCE und UL. Die erste
hat reference_pct NULL und reference_status not_applicable; die UL-Zeile
hat unabhaengig davon 35 mg und 130,7 %. Sie werden im SQL nach
nutrient_code und reference_kind getrennt ausgewaehlt. Die
NO_STANDALONE_REFERENCE-Zeile kann den UL-Wert weder erhoehen noch
unterdruecken.

[cmd] MN fehlte nicht in der Datenbank oder in der Bewertung: heute sind
300,6 % AI und 82,0 % UL vorhanden. G-239 nannte nur drei ueber dem UL;
MN gehoerte mit 82,0 % nicht dazu. Die Orchestrator-Angabe 105 % setzt
wiederum eine andere Tagesmenge voraus.

### Ergebnis

Keine Reparatur vorgenommen. Der belegt ausgeschlossene Teil ist
Nichtdeterminismus sowie C-149/G-221 als Ursache. Der belegte positive
Teil ist ein abweichender Tagesmengenstand oder Messweg. Der genaue
historische Schreiber bleibt wegen fehlender Nutrition-Aenderungshistorie
unklar.

Um ihn kuenftig nachweisbar zu machen, braeuchte eine Folgemessung eine
zeitgestempelte, lesbare Momentaufnahme aus meal_items.nutrients, Profil
und nutrient_reference_values gemeinsam mit dem Funktionsresultat; erst
dann laesst sich eine spaetere Verschiebung einer Schicht zuordnen. Das
ist keine Umsetzung in diesem Auftrag.

Nur lesend gegen dev gemessen. Keine Datenbank- oder App-Aenderung,
nichts gestagt und nicht committet.

## Abnahme

**2026-08-28, Orchestrator. Selbst nachgemessen — und der Punkt loest
sich anders auf, als er gestellt war.**

`[cmd]` **Es hat sich nichts geaendert.** `meal_items.updated_at`
steht seit dem 23.08. still, `meals` unveraendert bei 2.895.

`[cmd]` **Die Seed-Daten reichen bis 2026-11-16**, drei Monate in die
Zukunft, und Niacin schwankt taeglich zwischen 20 und 80 mg:

    2026-08-28   62,22 mg    current_date
    2026-08-27   64,36
    2026-08-26   41,56
    2026-08-25   44,98

`[cmd]` **Codex misst 45,73 mg** — das ist keiner dieser Tage.
`[read]` **Wir haben also nicht denselben Gegenstand gemessen:**
anderer Nutzer, anderer Tag oder andere Aggregation. **Aber nichts
war in Bewegung.**

### Der eigentliche Befund ist ein anderer

`[read]` **Drei Beteiligte haben heute dieselbe Funktion aufgerufen
und drei Ergebnisse gemeldet, ohne anzugeben, fuer wen und wann.**
`[read]` **Eine Messung ohne genannten Nutzer und Tag ist nicht
vergleichbar** — und ich habe daraus einen Datenverschiebungs-Verdacht
gemacht, statt zuerst die Parameter zu vergleichen.

`[read]` **Derselbe Fehler wie den ganzen Tag, in neuer Gestalt:**
nicht falsch gezaehlt, sondern **Verschiedenes verglichen und fuer
dasselbe gehalten.**

### Und ein Befund, der bleibt

`[cmd]` **Nutrition fuehrt keine Aenderungs-Historie fuer
`meal_items` oder Referenzwerte** — es gibt `water_logs`, sonst
nichts.

`[read]` **Waere wirklich etwas geaendert worden, koennte es niemand
nachweisen.** Diesmal liess es sich ueber `updated_at` ausschliessen;
bei einem `UPDATE` ohne Zeitstempelpflege nicht mehr. **Als C-335
angelegt.**

### Was Codex richtig gemacht hat

`[read]` **Er hat C-149 und G-221 als Ursache ausgeschlossen, statt
sie zu bestaetigen** — obwohl mein Auftrag sie als Verdacht nannte.
*,,Sie schreiben weder Tagesmengen noch Referenzwerte, und es gibt
keine Triggerkette dorthin."*

`[read]` **Und die Unsicherheit steht im Bericht statt einer
plausiblen Erklaerung:** *,,Der genaue historische Schreibweg bleibt
unklar."* **Das war die Vorgabe, und sie wurde eingehalten.**

**Abgenommen.**

