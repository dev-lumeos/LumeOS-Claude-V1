# Was laeuft und wem was gehoert

**Was gerade laeuft, steht nicht mehr hier** — es ist aus dem
Dateisystem ableitbar: **eine Punktdatei in `docs/punkte/laufend_*/`
ist ein laufender Auftrag.**

`[read]` **Warum die alte Tabelle weg war:** sie war handgepflegt und
am 2026-08-23 dreimal falsch — sie fuehrte G-160, G-161 und C-235 als
laufend, obwohl alle drei fertig waren. `[cmd]` **Gefunden hat es ein
Waechter, nicht der Orchestrator.** *Regeln, die berichtet statt
erzwungen werden, brechen.*

`[read]` **Berichtigt 2026-08-29:** diese Datei beschrieb noch
`docs/auftraege/` gegen `docs/berichte/`. **Beide gibt es seit der
Punktverwaltung nicht mehr** — der Zustand steckt im Ordnernamen.

---

## Stand 2026-08-29


**Codex — 1 Punkte:**

    C-342    Vitamin A in IE gegen Mikrogramm

**Claude Code — 3 Punkte:**

    G-266    Detailsuche mit Naehrwerten oeffnet eine eigene Seit
    G-272    `+ Add` braucht ein Erfassungsmodal
    G-273    den Reiter auf die zaehlende Funktion umstellen

`[cmd]` **Getrennt gehalten:** Codex im Schema, Claude Code in der
Oberflaeche. **Kein gemeinsamer Bereich.**

## Was als Naechstes drankommt

**Der Tagesplan steht in `docs/sessions/2026-08-29-plan.md`.**

`[read]` **Runde 2 wartet auf Codex' Bericht:** G-267, G-268, G-269
und G-270 haengen alle am Plan-Schema, das in der Kette liegt und
nicht live ist.

## Wem was gehoert

    supabase/_pipeline/          Codex
    apps/web/src/app/v2/<modul>  je ein UI-Agent
    docs/                        Orchestrator

`[read]` **Ein UI-Agent je Modul.** **Zwei Agenten in `apps/web`
teilen sich die Browsersitzung.**

`[read]` **Und `/nutrition` ohne `/v2/` bleibt unberuehrt** — dort
laeuft ein eigenes Template, das bleiben soll (Tom, 2026-08-29).
