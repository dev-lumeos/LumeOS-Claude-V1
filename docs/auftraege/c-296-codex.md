# C-296 — Codex, 2026-08-27

Bericht: `docs/berichte/c-296-codex.md`

**Zehn Regeln lesen `drug_class`. Eine davon ist `critical` und
sucht `MAOI` in Grossschreibung — die Spalte fuehrt beide
Schreibweisen. Wer sie naiv normalisiert, schaltet eine
Serotonin-Warnung ab.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.** `[cmd]` **In C-310 hast du meine 31 auf 20
berichtigt.** Ich hatte einen Textsuchtreffer fuer eine Kategorie
gehalten: `rule_type = 'medication'` sind **20**, das Wort
`medication` in `conditions` steht bei **31**, `modules_involved`
enthaelt `medical` bei **48**. **Drei Abfragen, drei Zahlen — ich
hatte die falsche in vier Auftraege geschrieben.**

## 1 · Der Bestand

`[cmd]` **Jeder Tag steht doppelt:**

    maoi 15  ·  MAOI 15
    ssri 10  ·  SSRI 10
    snri  4  ·  SNRI  4

`[cmd]` **Acht Wirkstoffe tragen alle vier Schreibweisen
gleichzeitig** — Bupropion, Citalopram, Escitalopram, Fluvoxamin,
Paroxetin, Trazodon, Vilazodon, Vortioxetin, jeder mit
`{SSRI,MAOI,maoi,ssri}`.

`[read]` **Ein Feld, das denselben Stoff als SSRI und als MAO-Hemmer
fuehrt, kann keine Regel bedienen** — die Kombination ist genau die,
vor der eine Interaktionswarnung schuetzen soll.

`[cmd]` **Kein einziger Wirkstoff traegt nur die Kleinschreibung.**
Die Verdopplung ist vollstaendig, nicht teilweise.

## 2 · Der Fallstrick, der diesen Auftrag gefaehrlich macht

`[cmd]` **`wr_serotonergic`, Schweregrad `critical`, sucht:**

    "field": "medications[].drug_class",
    "value": ["SSRI", "SNRI", "MAOI", "triptan", "tramadol"]

`[read]` **Grossschreibung bei den drei Klassen, Kleinschreibung bei
`triptan` und `tramadol`.** `[cmd]` **21 Wirkstoffe tragen die
Grossform, 5 tragen `triptan` oder `tramadol`.**

`[read]` **Wer `drug_class` auf Kleinschreibung normalisiert, ohne
die Regeln anzufassen, schaltet eine `critical`-Regel stumm.** Sie
wuerde nicht rot werden — **sie wuerde einfach nie mehr feuern.**

`[cmd]` **Und die zehn Regeln sind untereinander uneinheitlich:**

    wr_serotonergic       SSRI, SNRI, MAOI, triptan, tramadol
    wr_potassium_raas     RAAS_inhibitor          10 Traeger
    wr_sedative_additive  sedative                 9 Traeger
    wr_hypoglycemic       antidiabetic            22 Traeger
    wr_warfarin_ginseng   anticoagulant:warfarin   1 Traeger

`[read]` **Gross, klein, mit Doppelpunkt — es gibt keine Konvention,
die man wiederherstellen koennte. Sie muss erst festgelegt werden.**

## 3 · Zu tun

**Erst erheben, dann vorschlagen. In diesem Auftrag wird nichts
zusammengefuehrt.**

    alle Werte in drug_class          Liste mit Traegerzahl
    alle Werte in Regelbedingungen    Liste mit Regel-ID
    Werte in Regeln ohne Traeger      welche Regel kann nie feuern?
    Traeger ohne Regel                welche Klasse wird nie geprueft?

`[read]` **Die dritte Zeile ist die stille Gefahr:** eine Regel, die
einen Wert sucht, den kein Wirkstoff traegt, ist heute schon tot —
**und sie meldet es nicht.**

**Dann die zehn fachlich falschen Tags**, die Kimi in den MoA-Notes
dokumentiert hat: neun Antidepressiva als `maoi`, Olmesartan als
`diuretic_thiazide`, Acetaminophen als `opioid`, Phenobarbital als
`anticholinergic`, Pioglitazon als `insulin`, Griseofulvin als
`antineoplastic_misc`, Mercaptopurin als `antiviral_nucleoside`,
Chlorine als `vitamin_c`.

**Und ein Vorschlag, nicht mehr:** wie die Bereinigung aussehen soll
— **Daten normalisieren, Regeln anpassen, oder beide Seiten
unabhaengig von der Schreibweise vergleichen.** `[read]` **Jede
Variante hat andere Folgen, und die gehoeren benannt, bevor jemand
baut.**

## 4 · WAS NICHT ZU TUN IST

**Keinen Tag aendern, keine Schreibweise vereinheitlichen, keine
Regel anfassen.** `[read]` **Dieser Auftrag erhebt.** Eine
Korrektur, die vorher nicht gezaehlt hat, welche Regel bei welchem
Wirkstoff feuert, **ist nicht nachweisbar.**

**Keine Dubletten zusammenfuehren** — C-310 wartet auf diesen Punkt,
nicht umgekehrt. `[read]` **Der Grund:** eine Zusammenfuehrung, die
`drug_class` vereinigt, wuerde die Fallverdopplung in den neuen
Eintrag hineinschreiben.

`apps/` nicht anfassen. Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

    Werte in drug_class               Zahl, Liste
    Werte in Regelbedingungen         Zahl, Liste
    tote Regeln                       Zahl, je einzeln benannt
    ungepruefte Klassen               Zahl
    wr_serotonergic feuert heute      bei wie vielen Wirkstoffen?
    davon fachlich falsch             Zahl

`[read]` **Die letzten zwei Zeilen zusammen sind die Antwort auf die
Frage, ob das ein Anzeigefehler ist oder eine falsche Warnung.**

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Lesend gegen live ist in Ordnung** — dieser Auftrag schreibt nicht.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
