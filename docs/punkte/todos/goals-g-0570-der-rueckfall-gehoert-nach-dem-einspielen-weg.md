---
nr: G-570
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-10-01

braucht: [G-563]
kind_von: G-568

quellen:
  - docs/punkte/erledigt/goals-g-0568-die-zielwerte-brauchen-ihr-ziel.md
  - docs/punkte/erledigt/goals-g-0565-die-einheit-ist-eine-nutzerwahl.md

beruehrt:
  dateien:
    - apps/web/src/lib/profile/zielwerte-read.ts
    - apps/web/src/lib/profile/__tests__/g568-zielwerte-ziel.test.ts
---

# Der Rueckfall auf die Zweiparameter-Fassung gehoert nach dem Einspielen weg

## Der Befund

`[cmd]` **Die Goals-Seite fiel am 2026-10-01 aus.** Am Schirm stand

    Could not find the function
    goals.berechne_zielwerte(p_goal_id, p_stichtag, p_user_id)
    in the schema cache

`[cmd]` **Ursache:** G-568 reicht bei genau einer offenen Phase ein
`p_goal_id` durch, **live steht aber nur die Zweiparameter-Fassung** —
G-563 ist gebaut und nicht eingespielt.

`[cmd]` **Behoben in `f3088a98`** mit einem Rueckfall, der
ausschliesslich bei `PGRST202` greift: fehlt die Signatur, wird ohne
Zielbezug gefragt, die Datenbank waehlt wie bisher, und bei mehreren
Phasen wirft sie weiter (G-568/A4).

`[read]` **Der Rueckfall ist eine Bruecke, kein Zustand.** Bleibt er
nach dem Einspielen stehen, **verdeckt er genau den Fehler, den er
heute ueberbrueckt**: faellt die Dreiparameter-Fassung kuenftig aus
einem anderen Grund weg, waehlt die Seite still eine von zwei Raten —
die Klasse von Fehler, die G-559 bis G-568 gerade beseitigt haben. Ein
dauerhafter Umweg wird nicht repariert, er wird benutzt.

## Was zu tun ist

**A1 — nach dem Einspielen von G-563 messen**, dass die
Dreiparameter-Fassung live steht: Signatur aus `pg_proc`, mit
`prokind = 'f'`.

**A2 — den Rueckfall entfernen**, `istSignaturFehlt` mit ihm, und die
Zusicherungen in `g568-zielwerte-ziel.test.ts` auf den Zustand ohne
Rueckfall ziehen. **Der Fehlerpfad bleibt:** ein `PGRST202` ist danach
ein Fehler und wird als solcher gezeigt, ueber `ladefehler.ts`.

**A3 — die Reihenfolge festschreiben.** Eine Anwendung, die eine neue
Signatur ruft, muss **vor** dem Einspielen laufen und danach. `pnpm
gate` kann das nicht sehen — es laeuft gegen keine Datenbank (A-77).
**Belegen, wie der naechste Fall auffaellt, bevor er am Schirm
auffaellt.**

**Zu belegen:** Nachweise auf `test-user@lumeos.local` · die Seite vor
und nach dem Entfernen · `pnpm gate` gruen mit Testzahl · Sabotage je
Zusicherung in beide Richtungen.
