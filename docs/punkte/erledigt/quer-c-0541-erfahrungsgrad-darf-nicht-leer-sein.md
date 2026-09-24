---
nr: C-541
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: E-86
entscheidung: E-86
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 31fffcbb
beruehrt:
  tabellen: [public.profiles]
zahlen:
  gemessen: 2026-09-24
  profile_leer_vorher: 5
  profile_leer_nachher: 0
---

# C-541 - der Erfahrungsgrad darf nicht leer sein

## Toms Befund

Tom, 2026-09-08:

> wenn bestehende nutzer keinen erfahrungsgrad haben, ist das
> ein FEHLER, dieser zustand kann gar nicht sein

> wenn alles fertig ist, registriert sich ein user mit einem
> onboarding, und diese frage ist bestandteil davon

## Gemessen

Vor C-541:

    dev@lumeos.app          pro
    test-user@lumeos.local  pro
    coach@lumeos.app        LEER
    max.seed@example.com    LEER
    sarah.seed@example.com  LEER
    coach.seed@example.com  LEER
    tom.seed@example.com    LEER

`[cmd]` **`public.profiles.experience_level`: `nullable`, keine
Vorgabe.**

`[read]` **Die beiden echten Konten tragen einen Grad; leer
sind vier Saatkonten und das Coachkonto.**

`[read]` **Aber die Spalte erlaubt leer, und das ist der
Fehler: Wer sie liest, muss einen Fall behandeln, den es nicht
geben darf.**

## Wer sie liest

    supplements/extended-gate.tsx   blendet Extended ein
    nutrition/score-echt.tsx
    coach/rechte-echt.tsx
    settings/formular.tsx
    coach/tab-autonomie.tsx

## Zu klaeren, VOR dem Bauen

    A  was tut jeder Leser bei NULL heute?
    B  welcher Grad ist die richtige Vorgabe? Die
       Leser sagen es -- wer Extended ausblendet,
       meint beginner.
    C  die vier Saatkonten und coach@lumeos.app:
       welcher Grad? Gemeldet, nicht geraten.
    D  vertraegt ein NOT NULL die bestehenden Zeilen?

## Und das Onboarding

`[cmd]` **`coach/tab-onboarding.tsx` existiert: ein
Coach-Onboarding.**

`[cmd]` **Das Nutzer-Onboarding fehlt, das steht in
`docs/todo`.**

`[read]` **Dieser Punkt macht die Spalte dicht; die Frage im
Onboarding kommt mit ihm.**

## Abnahmebedingungen

    A1  was tut jeder Leser bei NULL? Je Stelle.
    A2  die Vorgabe, begruendet aus den Lesern.
    A3  die leeren Zeilen gefuellt -- welche, womit,
        warum.
    A4  die Spalte ist NOT NULL.
    A5  Gegenprobe: ein INSERT ohne Grad faellt.
    A6  die fuenf Leser unveraendert oder benannt.
    A7  Sicherung, Vollkette, ALLE Waechter.

## Entschieden, 2026-09-08, Orchestrator

`[cmd]` **Claude Code hat in G-117 gemessen:**

> *"Nicht angegeben" ist ein vorgesehener Zustand: Der
> zweite Klick in den Settings schreibt `''`, und
> `z.preprocess(leerZuNull, ...)` macht NULL daraus.*

`[read]` **Die Leere ist nicht nur ein Datenfehler; sie ist
ein Knopf.**

### Die Entscheidung

`[read]` **Der Ruecknahmeklick verschwindet.**

Tom: *"Dieser Zustand kann gar nicht sein"* -- dann darf ihn
auch kein Knopf herstellen.

`[read]` **Der Grad ist aenderbar, nicht loeschbar: wie ein
Geburtsdatum; man korrigiert es, man leert es nicht.**

### Was das fuer den Auftrag heisst

    A8  der zweite Klick leert nicht mehr, er waehlt
        nur um. GEMELDET an Claude Code, der
        settings/formular.tsx aendert.
    A9  die Vorgabe fuer die bestehenden Zeilen folgt
        aus den Lesern: wer Extended ausblendet,
        meint beginner.

## Bericht, 2026-09-24, Codex

### Vier Quellen

- **Code:** Die fuenf benannten Leser, der Profil-Validator,
  der Auth-Trigger und die bestehende Check-Constraint wurden
  gelesen.
- **Daten:** Vorher waren 5 von 7 Profilen leer; die beiden
  echten Konten standen auf `pro`.
- **Spec und Mockup:** Die Onboarding-ADR verlangt die Frage
  als Pflichtschritt. Das aktuelle Onboarding-Mockup zeigt sie
  noch nicht; das ist eine offene Darstellungsluecke und keine
  Erlaubnis fuer NULL. Fuer den aktuellen Katalog gelten
  `beginner`, `advanced`, `pro`, `elite`.
- **Vorgaengerrepo:** Das Archiv `D:\github\lumeos-2026.zip`
  wurde nach Erfahrungsgrad- und Onboarding-Implementierungen
  durchsucht. Es enthaelt keine einschlaegige Umsetzung, die
  fuer C-541 uebernommen werden koennte.

### A1 - Verhalten der fuenf Leser bei NULL

| Leser | Verhalten bei NULL vor C-541 |
|---|---|
| `supplements/extended-gate.tsx` | Normalisiert leer und unbekannt zu `grad: null`; Extended bleibt geschlossen und die Ansicht meldet "nicht angegeben". |
| `nutrition/score-echt.tsx` | Reicht NULL an die Score-Berechnung weiter; ohne Faktor entsteht kein Score, und die Ansicht meldet den fehlenden Grad. |
| `coach/rechte-echt.tsx` | Liest `experience_level` zur Laufzeit nicht; das Autonomierecht ist davon getrennt. NULL hat dort keine Wirkung. |
| `settings/formular.tsx` | Zeigt keine Auswahl. Ein zweiter Klick auf die gewaehlte Stufe schreibt `''`; die Vorverarbeitung macht daraus NULL. |
| `coach/tab-autonomie.tsx` | Liest `experience_level` nicht; die Coach-Autonomie ist ein eigenes Modell. NULL hat dort keine Wirkung. |

### A2 und A9 - begruendete Vorgabe

`beginner` ist die konservative Vorgabe fuer bestehende leere
Zeilen und fuer den technischen Profil-Bootstrap:

- Das Extended-Gate erteilt damit keine hoeheren Rechte; es
  bleibt unter der erforderlichen Stufe `pro` geschlossen.
- Der Nutrition-Score benutzt den niedrigsten Faktor `0.75`,
  statt wegen NULL gar nicht rechenbar zu sein.
- Die beiden Coach-Leser leiten aus dem Grad keine Rechte ab.

Es gibt absichtlich **keinen Spalten-Default**. Ein normaler
INSERT muss den Grad nennen und faellt andernfalls an `NOT
NULL`. Nur der Auth-Trigger schreibt beim technisch notwendigen
Profil-Bootstrap explizit `beginner`; das spaetere verpflichtende
Onboarding darf diesen Wert aendern.

### A3 - gefuellte Zeilen

Die fuenf zuvor leeren, bereits vorhandenen Profile wurden aus
der Leserlogik nachvollziehbar mit `beginner` gefuellt, nicht
individuell geraten:

    coach@lumeos.app        beginner
    max.seed@example.com    beginner
    sarah.seed@example.com  beginner
    coach.seed@example.com  beginner
    tom.seed@example.com    beginner

Unveraendert blieben:

    dev@lumeos.app          pro
    test-user@lumeos.local  pro

Nachher: 7 Profile, 0 NULL, 5 `beginner`, 2 `pro`.

### A4 und A5 - Schema und Gegenprobe

- `public.profiles.experience_level` ist `NOT NULL` und hat
  weiterhin keinen Spalten-Default.
- Die vorhandene Wertemenge bleibt auf `beginner`, `advanced`,
  `pro`, `elite` beschraenkt.
- Der Auth-Trigger legt ein neues Profil explizit mit
  `beginner` an; die Registrierung bricht deshalb nicht.
- Die Gegenprobe in einer Wegwerfdatenbank belegt: Ein
  gewoehnlicher Profil-INSERT ohne Erfahrungsgrad faellt an der
  NOT-NULL-Constraint.

Vor der Implementierung war der Test rot: Die Spalte war
nullable, der Auth-Trigger erzeugte NULL und ein INSERT ohne
Grad gelang. Nach der Implementierung sind alle drei
Gegenproben gruen.

### A6 und A8 - Leser und Meldung an Claude Code

Codex hat `apps/` nicht geaendert. Vier Leser brauchen durch
das geschlossene Schema keine Anpassung. Die eine notwendige
UI-Aenderung ist hiermit ausdruecklich an Claude Code gemeldet:

> In `settings/formular.tsx` darf der Klick auf die bereits
> gewaehlte Stufe nicht mehr `experience_level = ''` setzen.
> Der Klick muss wirkungslos bleiben oder nur eine andere Stufe
> waehlen lassen. Auch der zugehoerige Formularpfad darf NULL
> nicht mehr als speicherbaren Zustand anbieten. Die Datenbank
> weist einen solchen Speicherversuch jetzt zurueck.

Der Grad bleibt damit aenderbar, aber nicht loeschbar.

### A7 - Sicherung und Validierung

Gebaut wurden:

- `supabase/_pipeline/09_identitaet/541_experience_level_backfill.sql`
- `supabase/migrations/20260924160000_c541_experience_level_required.sql`
- `supabase/_pipeline/_validierung/quer-c541-experience-level-required.test.ts`

Die Pipeline enthaelt beide Schritte in der erforderlichen
Reihenfolge: erst die fuenf NULL-Zeilen fuellen, dann `NOT NULL`
setzen und den Trigger ersetzen. Der Backfill ist wiederholbar.

- Sicherung vor dem Vollkettenlauf:
  `backup/schema/20260924095333_c43_vor_kettenlauf.sql`
- Vollkette: **272 Schritte, KETTE OK**
- C-541-Integrationstest auf der voll aufgebauten
  Wegwerfdatenbank: **3 von 3 gruen**
- Vollstaendiges Gate: **gruen**, einschliesslich aller
  Waechter, 18 von 18 Turbo-Aufgaben und 2000 Web-Tests. Zwei
  bereits vorhandene, nicht fehlschlagende `<img>`-Warnungen
  blieben bestehen.

Der Dev-Server wurde nicht beruehrt. Es wurde nicht committed.

## Abnahme

**2026-09-08, Orchestrator. LIVE, nachgemessen.**

`[cmd]` **`experience_level`: `nullable NO`, keine Vorgabe.**

    coach.seed@example.com   beginner
    coach@lumeos.app         beginner
    dev@lumeos.app           pro
    max.seed@example.com     beginner
    sarah.seed@example.com   beginner
    test-user@lumeos.local   pro
    tom.seed@example.com     beginner

`[cmd]` **Gegenprobe selbst gefahren: ein INSERT ohne Grad
wird ABGEWIESEN (`not_null_violation`).**

`[cmd]` **Der Auth-Trigger setzt `beginner`.**

### Keine Spalten-Vorgabe, sondern ein Trigger

`[read]` **Ein `DEFAULT` haette den Fehler still geheilt** ?
**so faellt ein Schreibweg, der den Grad vergisst, auf.**

`[read]` **Dieselbe Haltung wie bei C-500 und C-512: lieber
eine Luecke, die auffaellt, als eine Zahl, die stimmt, weil sie
geraten wurde.**

### Und die Vorgabe ist begruendet

`[cmd]` **`beginner` folgt aus den Lesern** ? **wer Extended
ausblendet, meint genau das.** **A9 erfuellt.**

`[cmd]` **Die beiden echten Konten blieben `pro`.**

`[cmd]` **Vollkette 272 Schritte, Gate 18/18, 2.000 Proben.**

**Abgenommen. Die Oberflaeche folgt als G-501.**

