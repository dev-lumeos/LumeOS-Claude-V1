# Agentenberichte — roh, unbearbeitet

**Angelegt 2026-08-23** auf Toms Vorgabe: *„diese berichte gehoeren
sowieso protokolliert ins repo."*

## Wozu

Hier liegt, was der Agent gemeldet hat. In `docs/ssot/` liegt, was der
Orchestrator daraus geprueft hat. **Beides nebeneinander zeigt, was
behauptet wurde und was stimmte.**

`[cmd]` **Der Anlass:** Am 2026-08-23 kamen vier Agentenberichte
hintereinander als leerer Anhang an — in einem langen Gespraech faellt
Anhangsinhalt zuerst weg. Der Orchestrator hat C-235 abgenommen, indem
er die 33 Zeilenzahlen selbst nachmass, **ohne den Bericht je gesehen
zu haben.**

## Regeln

**Der Agent legt selbst ab**, unter `<nummer>-<agent>.md`. Roh, so wie
er ihn schreibt — nicht geglaettet, nicht gekuerzt.

**Der Orchestrator aendert hier nichts.** Er prueft und schreibt seinen
SSOT-Bericht daneben. Eine widerlegte Behauptung bleibt stehen, wie sie
war; die Korrektur steht im SSOT.

**Dateiname:** `c-235-codex.md`, `g-160-fable.md`,
`g-172-claude-code.md`. Kleinschreibung, Bindestriche.

**Encoding:** `utf-8`, `newline="\n"`, kein BOM. `[cmd]` Doppelte
Kodierung hat am 2026-08-22 dreimal jeden Commit im Repo blockiert.

## Was hier fehlt

`[read]` Die Berichte vom 2026-08-22 und 2026-08-23 liegen nicht hier —
sie sind in einem Gespraechsverlauf entstanden, bevor dieser Ordner
existierte, und vier davon sind verloren. **Was davon geprueft wurde,
steht in `docs/todo/ERLEDIGT.md` und in `docs/ssot/`.**
