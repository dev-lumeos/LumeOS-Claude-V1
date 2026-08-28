---
nr: C-331
typ: messung
modul: medical
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: C-328
entscheidung: null
beruehrt:
  tabellen: [supplements.rule_catalog, medical.user_medications]
  dateien: [supabase/_pipeline/13_supplements/328_count_risk_flag_values.sql]
zahlen: null
agent: codex
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: 942e9259
---

# C-331 — C-328 live einspielen und den Durchstich wiederholen

## Befund

`[cmd]` **Der C-328-Umbau ist gebaut und in der Wegwerf-Kette
belegt** — fuenf positive und fuenf negative Proben, einschliesslich
der nie zuvor feuernden `critical`-Regel. `[cmd]` **Live ist er
nicht:** die Zustaende stehen unveraendert bei 39 / 23 / 1 / 1.

`[read]` **Und der Durchstich aus G-215 lief ueber `wr_anticoag_stack`
— eine Regel, die `drug_class` liest, nicht `risk_flags`.** **Genau
deshalb hat sie funktioniert, waehrend die fuenf anderen stumm
blieben.**

`[read]` **Was fehlt, ist der Beleg, dass die Behebung beim Nutzer
ankommt.** Eine Regel, die in der Wegwerf-Datenbank feuert, ist noch
keine Warnung auf einem Bildschirm.

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator.

`[read]` **Und eine Lehre aus C-328 gehoert hierher:** ich hatte
einen Defekt behauptet, den es nicht gab — der `true`-Filter war da,
ich hatte aus einer Messung ueber die Daten auf den Code
geschlossen. **Du hast den Code gelesen und mich berichtigt.**
**Dieselbe Vorsicht gilt fuer alles, was in diesem Auftrag steht.**

### Zu tun

**Den Kettenschritt live einspielen**, mit Vollsicherung vorher.

**Dann messen, was sich aendert** — `evaluation_state` ueber alle 64,
vorher und nachher.

**Und die fuenf Regeln einzeln pruefen**, live, nicht im Klon:
`wr_drug_bleeding_stack`, `wr_drug_hyperkalemia_stack`,
`wr_drug_qt_stack`, `wr_drug_serotonergic_combo`,
`wr_drug_hyperkalemia_lab`.

`[read]` **Je Regel eine Lage auf `test-user@lumeos.local`, in der
sie zutreffen muss** — und eine, in der sie nicht zutreffen darf.
`[cmd]` **Ueber `user_medications`**, nicht per direktem `INSERT` in
Hilfstabellen.

### Der Teil, der ueber deine bisherige Arbeit hinausgeht

`[read]` **Bis zur Datenbank ist es belegt. Bis zum Bildschirm
nicht.** `[cmd]` **Claude Code hat in G-215 sechs Stationen
nachgemessen** — Erfassung, `rule_assessment`, Rueckgabe, Leseweg,
Anzeige.

`[read]` **Miss die ersten drei; die letzten zwei kannst du nicht.**
**Sag im Bericht, wo deine Kette endet** — daraus wird ein
Anschlussauftrag fuer Claude Code, kein Versaeumnis.

### Was nicht zu tun ist

**Keine Regel aendern, keine `risk_flags` aendern.**
**Keine weiteren Operatoren** — die 23 warten.
**Nichts auf `dev@lumeos.app` schreiben.**
`apps/` nicht anfassen — Claude Code arbeitet dort an G-217.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Vollsicherung vor Live         Pfad genannt
    evaluation_state               vorher / nachher, alle 64
    je Regel: trifft zu            Lage ueber `user_medications`
    je Regel: trifft nicht zu      Lage ueber `user_medications`
    wr_drug_serotonergic_combo     feuert live - belegt
    Rueckbau                       gezaehlt, `dev` unberuehrt
    wo endet die Kette             benannt

`[read]` **Die vorletzte Zeile ist die, die zaehlt.** Die einzige
`critical`-Regel im Bestand hat nie gefeuert. **Wenn sie es jetzt
tut, ist das der erste Beleg, dass LumeOS vor etwas warnen kann, das
gefaehrlich ist.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**
**Schreibende Nachweise auf `test-user@lumeos.local`**, mit
gezaehltem Rueckbau.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

Datum: 2026-08-28

### Live-Stand

Die Ausgangsannahme stimmt nicht: C-328 war bereits live. Die
Funktionsdefinition von `supplements.rule_assessment` enthielt vor
diesem Auftrag sowohl den `true`-Filter als auch `GROUP BY mas.id,
key`. Ein erneutes Einspielen haette keinen Zustand geaendert und
wurde deshalb nicht wiederholt. Die Zustaende des leeren Testkontos
waren erwartungsgemaess unveraendert, weil dort keine Medikation lag;
sie sind kein Gegenbeweis gegen den bereits live vorhandenen Code.

Vor den ausdruecklich verlangten schreibenden Live-Proben liegt die
Vollsicherung `backup/c331/20260828_c331_vor_live_test.dump`
(25.257.829 Byte).

### Live-Gegenproben

Alle Proben liefen auf `test-user@lumeos.local` unter seiner
authentifizierten RLS-Identitaet. Die Risiko-Lagen wurden ausschliesslich
ueber `medical.user_medications` hergestellt, nicht ueber eine
Hilfstabelle. Fuer die Laborregel kam zusaetzlich ein regulaerer
Laborbericht mit Kalium `5.1 mmol/L` auf dasselbe Testkonto hinzu.

| Regel | trifft zu | trifft nicht zu |
|---|---|---|
| `wr_drug_bleeding_stack` | zwei unterschiedliche Wirkstoffe mit `bleeding_risk: true` -> `fulfilled` | ein Wirkstoff -> `not_fulfilled` |
| `wr_drug_hyperkalemia_stack` | zwei unterschiedliche Wirkstoffe mit `hyperkalemia_risk: true` -> `fulfilled` | zweimal derselbe Wirkstoff -> `not_fulfilled` |
| `wr_drug_qt_stack` | zwei unterschiedliche Wirkstoffe mit `QT_risk: true` -> `fulfilled` | ein Wirkstoff -> `not_fulfilled` |
| `wr_drug_serotonergic_combo` | Amitriptylin plus Benzoate/Codeine -> `fulfilled`, `critical`, `physician_referral` | Amitriptylin allein -> `not_fulfilled` |
| `wr_drug_hyperkalemia_lab` | Hyperkaliaemie-Risiko plus Kalium `5.1 mmol/L` -> `fulfilled` | Warfarin ohne Hyperkaliaemie-Risiko bei demselben hohen Kalium -> `not_fulfilled` |

Die `critical`-Regel `wr_drug_serotonergic_combo` hat damit live zum
ersten Mal nachweislich gefeuert. Die Rueckgabe enthielt dabei
`rule_id`, `evaluation_state`, `severity`,
`recommended_action_type = physician_referral` und den Regeltext.

### Die drei belegten Stationen

1. **Erfassung:** Die RLS-Sicht des angemeldeten Testkontos sah je
   Lage exakt die angelegten ein oder zwei Medikationszeilen.
2. **Auswertung:** `supplements.rule_assessment(auth.uid(),
   current_date)` sah dieselben Zeilen und lieferte je Lage den oben
   erwarteten Zustand.
3. **Rueckgabe:** Als Rolle `authenticated` war der vollstaendige
   Regel-Record lesbar; es war keine Superuser-Only-Messung.

Die Kette endet hier am Datenbank-RPC. `apps/web/src/lib/supplements/
regeln-read.ts` (Leseweg) und der Bildschirm wurden nicht geprueft
und nicht angefasst, wie beauftragt. Der Anschlussauftrag fuer Claude
Code ist daher: dieselbe `critical`-Lage ueber den Leseweg bis zur
Anzeige pruefen.

### Zustand und Rueckbau

| Messpunkt auf `test-user` | vorher | nach Rueckbau |
|---|---:|---:|
| Medikationszeilen | 0 | 0 |
| Laborberichte | 0 | 0 |
| Laborwerte | 0 | 0 |
| `fulfilled` von 64 Regeln | 0 | 0 |
| `not_fulfilled` | 40 | 40 |
| `missing_input` | 1 | 1 |
| `unsupported_operator` | 23 | 23 |

15 Test-Medikationszeilen sowie ein Testbericht mit einem Laborwert
wurden angelegt und wieder entfernt. `dev@lumeos.app` hatte vorher
und nachher genau eine Medikationszeile und wurde nicht beschrieben.

Keine Regel, kein `risk_flags`-Wert, kein weiterer Operator und keine
Datei unter `apps/` wurden geaendert. Nichts wurde gestaged,
committet oder gepusht.

## Abnahme

**2026-08-28, Orchestrator. Selbst gemessen.**

`[cmd]` **Der Umbau ist live:** `v_med_risk_flags` wird ueber
`SELECT mas.id, key AS flag_key` gebildet — **die Wirkstoff-ID ist
Teil der Auswahl**, das globale `DISTINCT` ueber alle Medikamente ist
weg. Beide Kettenschritte `313c` und `328` stehen im Manifest.

`[cmd]` **Rueckbau sauber:** `test-user` 0 Medikamente, 0 Laborwerte;
`dev` unveraendert bei 1.

### Der Meilenstein

`[cmd]` **`wr_drug_serotonergic_combo` liefert erstmals `fulfilled`,
`critical`, `physician_referral`** — live, unter authentifizierter
RLS-Identitaet, ueber `user_medications`.

`[read]` **Das ist der erste Beleg, dass LumeOS vor etwas warnen kann,
das gefaehrlich ist.** Die Regel existierte seit dem Katalogimport
und hat nie ausgeloest. **Sie waere nie aufgefallen — sie meldete
`not_fulfilled`, genau wie *,,trifft nicht zu"*.**

`[cmd]` **Alle fuenf positiv und negativ geprueft.** `[read]` **Die
negative Seite ist die, die sonst fehlt:** eine Regel, die immer
feuert, besteht jede Probe, die nur das Zutreffen prueft.

### Meine Auftragsannahme war wieder falsch

`[read]` Ich hatte geschrieben: *,,Live ist er nicht — die Zustaende
stehen unveraendert bei 39 / 23 / 1 / 1."*

`[cmd]` **Er war live.** `[read]` **Die Zustaende standen unveraendert,
weil auf `dev` ein einziges Medikament liegt und die fuenf Regeln
zwei brauchen.** Ich habe aus *,,Zahlen unveraendert"* auf *,,nicht
eingespielt"* geschlossen — **derselbe Schluss aus einer Messung ueber
etwas anderes wie bei C-328, zwei Auftraege hintereinander.**

`[read]` **Und Codex hat das unnoetige Wiedereinspielen vermieden** —
ein Live-Eingriff, den mein Auftrag verlangte und der nichts geaendert
haette ausser Risiko zu erzeugen.

`[cmd]` **Die Grenze ist benannt statt uebergangen:** Leseweg und
Anzeige ungeprueft, weil `apps/` nicht zum Auftrag gehoerte. **Als
G-218 angelegt.**

**Abgenommen.**

