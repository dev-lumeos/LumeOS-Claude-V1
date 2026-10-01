---
nr: G-565
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-30
beauftragt: 2026-10-01
erledigt: 2026-10-01
agent: claudecode
commit: bdaea479

braucht: [G-539, G-543]
kind_von: G-543
entscheidung: E-83

quellen:
  - docs/entscheidungen/E-83-der-nutzer-waehlt-die-einheit.md
  - docs/punkte/erledigt/goals-g-0539-der-phasen-editor-fehlt.md

beruehrt:
  tabellen:
    - goals.goal_phases
    - public.user_display_preferences
  dateien:
    - apps/web/src/app/v2/goals/phasen-editor-echt.tsx
    - apps/web/src/app/v2/goals/einheiten-schalter.tsx
    - apps/web/src/lib/goals/zielrate-einheit.ts
    - apps/web/src/lib/goals/einheit-speichern.ts
    - apps/web/src/lib/goals/phase-regeln.ts
---

# Die Einheit ist eine Nutzerwahl, heute gibt es nur Prozent

    AUFTRAG FUER Claude Code - G-565: der Nutzer waehlt die Einheit,
                                     Prozent oder Kilokalorien
    Bereich: apps/web/src/app/v2/goals/
             apps/web/src/lib/goals/
    Fremd:   supabase/ gehoert Codex, der gerade an G-561 baut (die
             Waechter pruefen Kilogramm statt Prozent) - seine
             Waechtertexte kommen dort an, nicht von dir.
             docs/ gehoert dem Orchestrator, auch diese Punktdatei:
             der Bericht kommt als Antwort, nicht als Anhang hier.
    Stand:   2026-10-01

**Zuerst lesen, vollstaendig:** diese Datei und
`docs/entscheidungen/E-83-der-nutzer-waehlt-die-einheit.md`.


## Der Befund

**Tom, 2026-09-30, 17:45:** *„das soll doch ein user entscheiden,
manchmal ist es klarer mit prozenten zu arbeiten und manchmal easier mit
direkt kcal."*

`[cmd]` **Heute gibt es nur Prozent.** Das Editorfeld fuehrt
`weight_change_target_percent` mit `%` als Suffix, `tdee_modifier` ist
ein nackter Faktor (0,85). **Keine Stelle zeigt den
Kilokalorienbetrag daneben** — gemessen in
`phasen-editor-echt.tsx:148-156`.

`[cmd]` **Und im selben Editor rechnet das Kalorienradeln schon in
kcal** (+200 / −300). **Dieselbe Oberflaeche fuehrt beide Einheiten, ohne
dass eine Stelle sie ineinander umrechnet.**

`[read]` **Was fehlt, ist nicht ein zweites Feld, sondern ein
Umschalter.** Zwei Eingabefelder fuer dieselbe Groesse waeren die
Fehlerklasse aus G-529 — zwei Namen fuer eine Sache, die auseinanderlaufen.

## Was gilt

`[cmd]` **Gespeichert wird die Rate** (E-83): kcal haengt am Gewicht und
waere beim naechsten Wiegen falsch, ohne dass sich die Absicht geaendert
hat. **Die Umrechnung ist E-1, in beide Richtungen:**

    kcal/Tag = 11 × Rate × Gewicht        Rate = kcal / (11 × Gewicht)

`[cmd]` **Das Gewicht ist das am Phasenbeginn**, nicht das heutige
(G-543).

## Auftrag

**A1 — der Umschalter, dort wo die Rate vorkommt.** Messen, wo das ist:
Anlegen-Modal, Editor, Zeitachse, Zielkarten. **Sag, wie du abgegrenzt
hast.** Je Stelle: dieselbe Groesse, zwei Einheiten, ein gespeicherter
Wert.

**A2 — die Umrechnung liegt server-frei in `lib/goals/`**, neben E-1, und
wird nicht in der Komponente wiederholt. `goals.kcal_delta_aus_zielrate`
ist die Datenbankseite — **die Zahlen muessen auf beiden Wegen
uebereinstimmen, und das ist zu belegen, nicht zu behaupten.**

**A3 — die Rueckrichtung darf nicht driften.** Gibt der Nutzer kcal ein,
wird eine Rate gespeichert. **Zu belegen mit einer Zahl, die von Hand
nachrechenbar ist:** kcal eingeben, Rate lesen, wieder anzeigen — dieselbe
Kilokalorienzahl, kein Rundungsverlust, der sich aufschaukelt. `numeric(5,3)`
ist die Grenze.

**A4 — die Wahl gehoert an den Nutzer, nicht an die Phase.** Eine
Einstellung, keine Spalte in `goal_phases`. **Wo sie liegt, ist zu
melden** — wenn es keinen Ort dafuer gibt, ist das ein Befund fuer Codex
und kein Grund, sie in die Phase zu schreiben.

**Nicht Teil:** ob unsere Katalogwerte stimmen (G-566, bei Tobias), und
`tdee_modifier` als Faktor — der ist eine eigene Groesse, und ob er
ueberhaupt bleibt, haengt an G-530.

**Zu belegen:** Nachweise auf `test-user@lumeos.local` · Bilder je
Einheit · die Umrechnung in beide Richtungen mit einer von Hand
nachrechenbaren Zahl · Sabotage je Waechter in beide Richtungen ·
`pnpm gate` gruen mit Testzahl UND der Aussage zu den neun Waechtern im
Vorcommit-Haken · nichts committen.

## Abnahme — 2026-10-01, Commit `bdaea479`

**Gemessene Merkmale, keine nachgerechneten Agentenzahlen.**

`[cmd]` **Die Umrechnung gegen meine eigene Handrechnung**, 16 Faelle,
0 Abweichungen — `kcalAusRate` und `rateAusKcal` aus
`zielrate-einheit.ts` direkt aufgerufen, die Sollwerte von mir
gerechnet (11 × Rate × kg, Haelfte von der Null weg, 1 Stelle):

    -2,5 % bei 55,5 kg -> -1526,3      (Math.round gaebe -1526,2)
    -0,5 % bei 81,4 kg ->  -447,7
    +0,5 % bei 50,5 kg ->  +277,8      (Haelfte, nach aussen)
    -0,5 % bei 50,5 kg ->  -277,8
    0,271 % bei 83,74 kg -> 249,6
    230 kcal bei 83,74 kg -> 0,250     (Rueckweg, numeric(5,3))
    -447,7 kcal bei 81,4 kg -> -0,500

`[cmd]` **Gegenprobe:** mit `-1526,2` als Soll wird die Pruefung rot,
zwei Zeilen (`kcalAusRate` und `rundeWieDb`). **Sie misst also genau
den behobenen Fehler**, nicht nur irgendeine Zahl.

`[cmd]` **Null Treffer** auf `einheiten-schalter` oder
`zielrate-einheit` in `strategie-vorschau.tsx` und
`strategie-wahl.tsx` — der Katalog bleibt in Prozent, wie E-83 es
verlangt.

`[cmd]` **`Math.round` steht in `phase-regeln.ts` nur noch im
Kommentar** (Zeilen 222, 228, 231), der den Fehler erklaert. Die
Rechnung laeuft durch `kcalAusRate`.

`[cmd]` **31 Zusicherungen in fuenf Abschnitten** in
`g565-einheit.test.ts` — darunter „der Katalog bleibt in Prozent",
„sie steht NICHT an der Phase" und „keine Stelle rechnet selbst mit
11".

`[cmd]` **Die Einstellung liegt in `public.user_display_preferences`**
unter dem Schluessel `goals.zielrate_einheit`
(`einheit-speichern.ts:28`) — kein Schemawechsel, kein Befund fuer
Codex.

**Eine Zahl im Bericht stimmt nicht, am Ergebnis aendert sie nichts:**
230 / (11 × 83,74) ist 0,24969, nicht 0,24973. Gerundet beides 0,250.

**Mitgeliefert und getrennt abgelegt (`f3088a98`):** der Rueckfall in
`zielwerte-read.ts`, der die Goals-Seite heute wieder lauffaehig macht,
solange G-563 nicht eingespielt ist. **Er ist kein Zustand, sondern
G-570** — nach dem Einspielen gehoert er weg.
