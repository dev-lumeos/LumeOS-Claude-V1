---
nr: E-89
titel: Der Untertyp benennt die Messgroesse, nicht die Absicht
entschieden: 2026-10-01
entscheider: Tom
betrifft: [G-557, G-575, G-537]
---

# E-89 — Der Untertyp benennt die Messgroesse, nicht die Absicht

## Wie die Entscheidung entstand

`[read]` **Die Frage war klein:** welcher Text in `subtype` landet, wenn
der Nutzer den Knopf „Gewicht" oder „Eigenes" druckt. Beide trugen seit
G-554 `unsicher: true`.

**Tom, 2026-10-01, 13:26:** *„das kann nicht nur gewichtsabhaengig sein.
gewicht ist eine variable aber dazu kommen noch die bodymeasurements,
die deklarieren wo das gewicht weg oder hinzugekommen ist."*

`[read]` **Das ist die Antwort auf die groessere Frage, und sie
entscheidet die kleine mit:** wenn ein Ziel benennt, WORAN es gemessen
wird, dann ist genau das der Untertyp.

## Die Entscheidung

    weight                  die Waage ist die Messgroesse
    cut / gain_muscle       Koerperzusammensetzung: KFA, Umfaenge
    cardio_frequency        Haeufigkeit
    strength                Last
    training_capacity       Volumen
    (leer)                  "Eigenes" - der Nutzer benennt die Groesse
                            selbst, also steht kein Untertyp dafuer

`[cmd]` **Widerspruchsfrei zum Bestand** (`goals.user_goals`,
2026-09-30, 11 Zeilen): `body_composition/cut`,
`body_composition/gain_muscle`, `lifestyle/cardio_frequency`,
`performance/strength`, `performance/training_capacity` — **keine Zeile
mit leerem Untertyp**, und `weight` kommt nicht vor, weil es den Knopf
noch nicht gab.

`[read]` **`weight` ist damit ein eigener Wert, kein `cut`.** Ein
Gewichtsziel wird an der Waage gemessen, ein
Koerperzusammensetzungsziel an KFA und Umfaengen — das sind
verschiedene Messgroessen, auch wenn die Absicht dieselbe ist.

## Die Luecke, die Tom damit aufgedeckt hat

`[cmd]` **`goals.user_goals` traegt genau EINE Messgroesse:**
`target_value NUMERIC(12,3)`, `target_unit TEXT`, `start_value`,
`current_value`. **„5 kg weg, Taille −4 cm, Oberarm gleich" sind drei
Groessen und passen nicht hinein.**

`[cmd]` **`auto_update` steht auf `true`, und nichts im Schema sagt, aus
welcher Quelle `current_value` nachgezogen wird** — Waage, Umfang oder
Koerperzusammensetzung. `[cmd]` **Hoechstens drei aktive Ziele je
Nutzer** (`uq_user_goals_active_slot`), also laesst sich das auch nicht
ueber drei Ziele loesen.

`[read]` **Das ist G-575** und nicht Teil dieser Entscheidung — aber der
Grund, warum der Untertyp die Messgroesse benennt und nicht die Absicht:
**sobald ein Ziel mehrere Groessen fuehrt, braucht eine davon den
Vorrang, und der Untertyp ist der Ort, an dem er schon heute steht.**
