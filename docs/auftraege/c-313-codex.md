# C-313 — Codex, 2026-08-27

Bericht: `docs/berichte/c-313-codex.md`

**Fuenfzehn Operatoren stehen in Regelbedingungen, aber nicht im
Evaluator. 28 von 64 Regeln koennen damit nicht feuern — vier davon
mit Schweregrad `high`, und keine wird rot.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.** `[cmd]` **Dieser Auftrag entstand aus deinem Satz in
C-296:** *,,Der Evaluator unterstuetzt `any_of` jedoch nicht,
wodurch sie derzeit unabhaengig von den Daten nicht erfuellt wird."*
**Ich habe das zum Anlass genommen, alle Operatoren zu pruefen — es
ist nicht einer.**

## 1 · Die Messung

`[cmd]` **27 Operatoren kommen in `rule_catalog.conditions` vor. 15
davon stehen nicht im Rumpf von `supplements.rule_assessment`:**

    any_of          eq              gt              lte
    lab_above       substance_gte   dsl             care_context_is
    symptom_present symptom_matches_adverse_effect
    prescription_status_is          prescription_status_in
    regulatory_state_is             has_fasting_requirement
    medication_started_within_days

`[cmd]` **28 von 64 Regeln tragen mindestens einen davon** — 4 `high`,
6 `medium`, 18 `low`.

`[cmd]` **Die vier mit Schweregrad `high`:**

    wr_drug_hyperkalemia_lab   lab_above
    wr_drug_testosterone_hct   lab_above
    wr_lab_biotin              lte, substance_gte
    wr_lab_vitc_glucose        eq

`[read]` **Alle vier verknuepfen Medikamente oder Supplements mit
Laborwerten.** `wr_lab_biotin` ist die Regel gegen Biotin-Interferenz
bei Troponin- und TSH-Messungen — **ein bekannter Grund fuer
Fehldiagnosen.**

`[read]` **Meine Suche ist grob:** ich habe geprueft, ob der
Operatorname als Zeichenkette im Funktionsrumpf steht. **Das
uebersieht eine Behandlung unter anderem Namen und findet einen
Namen in einem Kommentar.** Deine Messung gilt.

## 2 · Warum es niemandem aufgefallen ist

`[read]` **Ein unbekannter Operator macht die Bedingung nicht falsch
— er macht sie unerfuellt.** Kein Fehler, kein Protokolleintrag, kein
roter Test. **Die Regel verschwindet lautlos aus der Auswertung.**

`[read]` **Das ist die Lehre *,,aus der Existenz einer Sache folgt
nicht ihre Funktion"* eine Ebene ueber allem, was heute geprueft
wurde.** Der Katalog hat 64 Regeln. **Wie viele davon wirken, hat
niemand gemessen.**

## 3 · Zu tun — erheben, nicht bauen

**Je Operator: kommt er im Evaluator vor, unter welchem Namen, und
was passiert, wenn er fehlt?**

    Operator          im Evaluator?   Verhalten bei Unbekannt
    betroffene Regeln je Operator, mit Schweregrad
    seit wann         welcher Kettenschritt hat die Regel eingespielt,
                      welcher den Evaluator zuletzt geaendert?

`[read]` **Die dritte Zeile entscheidet ueber die Deutung.** Wenn die
Regeln aus Kimis Wellen kamen und der Evaluator aelter ist, sind die
Operatoren **nie implementiert worden** — dann ist es eine offene
Baustelle, kein Defekt. **Wenn der Evaluator juenger ist, ist etwas
verloren gegangen.**

`[read]` **Sieh nach, ob es dokumentiert ist**, bevor du es als Luecke
meldest: `docs/spezifikation/`, `docs/specs/`, die Kettenschritte
`133_kimi_rules.ts` und `145_kimi_wave4_medications_rules.ts`.
**Ein Teil kann bewusst spaeter geplant gewesen sein.**

**Und die Frage, die dahinter steht:** `[read]` **soll ein
unbekannter Operator kuenftig laut scheitern statt still nicht zu
erfuellen?** Beides hat Folgen — **die gehoeren benannt, nicht
entschieden.**

## 4 · WAS NICHT ZU TUN IST

**Keinen Operator implementieren.** `[read]` **Fuenfzehn Operatoren
nachzubauen, ohne zu wissen welche gewollt waren, ist der teuerste
denkbare Weg.**
**Keine Regel aendern, keine entfernen.**
**`drug_class` nicht anfassen** — C-296 ist erhoben, die Bereinigung
noch nicht entschieden.
`apps/` nicht anfassen. Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

    Operatoren gesamt in conditions      Zahl
    davon im Evaluator behandelt         Zahl, je einzeln
    betroffene Regeln                    Zahl, nach Schweregrad
    davon high oder critical             je einzeln benannt
    Verhalten bei unbekanntem Operator   belegt, nicht vermutet
    Herkunft je fehlendem Operator       Kettenschritt und Datum

`[read]` **Die vorletzte Zeile ist die wichtigste und die einzige,
die eine Probe braucht:** einen erfundenen Operator in eine
Wegwerf-Kopie einer Regel setzen und sehen, was `rule_assessment`
tut. **Schweigt sie, ist das der Beleg. Wirft sie einen Fehler, ist
meine ganze Deutung falsch** — und dann sag das zuerst.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Lesend gegen live ist in Ordnung. Die Operatorprobe gehoert in die
Wegwerf-Datenbank.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
