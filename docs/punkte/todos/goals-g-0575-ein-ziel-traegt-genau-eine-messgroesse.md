---
nr: G-575
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-01

braucht: [G-537]
entscheidung: E-89

quellen:
  - docs/entscheidungen/E-89-der-untertyp-benennt-die-messgroesse.md
  - docs/punkte/erledigt/goals-g-0557-die-zuordnung-erreicht-die-datenbank-nicht.md

beruehrt:
  tabellen:
    - goals.user_goals
  dateien:
    - supabase/_pipeline/11_goals/111_goals_ziele_phasen.sql
---

# Ein Ziel traegt genau eine Messgroesse

## Der Befund

**Tom, 2026-10-01, 13:26:** *„das kann nicht nur gewichtsabhaengig sein.
gewicht ist eine variable aber dazu kommen noch die bodymeasurements, die
deklarieren wo das gewicht weg oder hinzugekommen ist."*

`[cmd]` **Gemessen in `goals.user_goals`:**

    target_value    NUMERIC(12,3)     eine Zahl
    target_unit     TEXT              ein Einheitentext, frei
    start_value     NUMERIC(12,3)
    current_value   NUMERIC(12,3)
    auto_update     BOOLEAN NOT NULL DEFAULT true

**„5 kg weg" passt hinein. „5 kg weg, Taille −4 cm, Oberarm gleich"
nicht** — das sind drei Groessen, und die Tabelle hat Platz fuer eine.

`[cmd]` **`auto_update` steht auf `true`, aber nichts im Schema sagt, aus
welcher Quelle `current_value` nachgezogen wird.** Waage
(`body_measurements`), Umfang (`body_circumferences`) oder
Koerperzusammensetzung (`body_composition_navy`) — `target_unit` ist
Freitext und keine Zuordnung.

`[cmd]` **Und drei aktive Ziele je Nutzer sind das Maximum**
(`uq_user_goals_active_slot`, plus die Regel, dass ein aktives Ziel
Prioritaet 1 bis 3 traegt). **Das Problem laesst sich also nicht ueber
drei Ziele umgehen** — und es waeren drei Ziele fuer eine Absicht.

`[read]` **Die Folge heute:** ein Nutzer kann sein Ziel nicht so
beschreiben, wie er es denkt. Er kann „5 kg" eintragen und den Fortschritt
an der Waage ablesen — aber nicht festhalten, dass es Fett sein soll und
der Oberarm bleiben soll. **Der Fortschritt rechnet dann auf einer Zahl,
die seine Absicht nicht abbildet**, und `progress_pct` behauptet eine
Genauigkeit, die es nicht hat.

## Was zu entscheiden ist, bevor gebaut wird

`[read]` **Drei Formen, und sie unterscheiden sich im Produkt, nicht in
der Technik:**

1. **Eine fuehrende Groesse plus Nebenbedingungen** — das Ziel bleibt
   eine Zahl (`weight`, E-89), dazu kommen Bedingungen („Taille −4 cm",
   „Oberarm haelt"). Der Fortschritt rechnet auf der fuehrenden, die
   Bedingungen werden daneben gezeigt.
2. **Mehrere Messgroessen gleichrangig** — eine eigene Zeilentabelle je
   Ziel, jede mit Quelle, Start-, Ziel- und Istwert. Der Fortschritt ist
   dann eine Zusammenfassung, und wie sie rechnet, ist zu entscheiden.
3. **Bleibt bei einer** — dann ist festzuhalten, dass ein Ziel genau eine
   Groesse hat, und die Oberflaeche sagt es. Billigste Form, und die
   Antwort auf Toms Satz lautet dann nein.

`[annahme]` **Form 1 passt zu E-89 und zum Bestand** — der Untertyp
benennt schon heute die fuehrende Groesse, und keine Zeile im Bestand
braucht mehr als eine. Das ist eine Einschaetzung, keine Messung.

## Was mitentschieden werden muss

`[read]` **Welche Quelle `current_value` nachzieht**, je Messgroesse —
ohne das ist `auto_update` eine Behauptung. **Und was `progress_pct`
bedeutet**, wenn ein Ziel mehrere Groessen fuehrt.

**Nicht Teil:** der Untertyp selbst (E-89, entschieden) und die
Zielarten-Durchreichung (G-557, erledigt).
