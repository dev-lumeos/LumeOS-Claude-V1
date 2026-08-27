# C-315 — Codex, 2026-08-27

Bericht: `docs/berichte/c-315-codex.md`

**Vier von vier stichprobenartig geprueften Punkten waren veraltet.
Bevor daraus Auftraege werden, muss jemand nachsehen, was davon noch
gilt.**

---

## Warum dieser Auftrag existiert

`[cmd]` **Heute sind vier Punkte an ihrer eigenen Praemisse
gescheitert:**

    G-207   die Symptomtabellen existierten laengst
    G-211   keine Regel liest `active_substance_id`
    G-138   der Schreibweg existiert seit G-148
    G-176   die 50er-Grenze ist entfernt, ein Test haelt es fest

`[read]` **Claude Code hat den Grund benannt:** *,,Der Punkt zaehlte
Namen, nicht Faehigkeiten"* — `LogDoseModal` heisst im Code
`LogDoseFenster`. **Ein Vergleich von Vorlagennamen gegen Codenamen
findet in einem deutsch benannten Repo systematisch nichts.**

`[read]` **Und die Zahlen altern schneller als die Texte:** G-176 und
G-178 sprechen von 290 Substanzen, heute sind es **412**.

## Dein Teil: die C-Punkte

`[cmd]` **`scratchpad/supp-liste.txt` fuehrt 69 offene Punkte mit
Supplements-Bezug.** Davon gehoeren dir die **47 C-Punkte** —
Oberflaeche ist G-212 bei Claude Code.

`[read]` **Der Schwerpunkt liegt beim Katalogaufbau vom 22. und 23.
August:** C-195, C-196, C-228, C-229, C-232, C-242, C-244, C-253,
C-257, C-258, C-259, C-261. **Der Katalog ist seither fertig
geworden** — 412 sichtbar, alle mit Nutzertext und FAQ. **Vermutlich
ist der groesste Teil davon erledigt und nie geschlossen worden.**

## Zu tun — je Punkt ein Urteil mit Beleg

    erledigt          `[cmd]` was beweist es
    teilweise         `[cmd]` was steht, `[cmd]` was fehlt
    offen             `[cmd]` was heute noch fehlt
    ueberholt         die Frage stellt sich nicht mehr, weil ...
    unklar            was gemessen werden muesste, um zu urteilen

`[read]` **`[cmd]` je Urteil, ohne Ausnahme.** `[read]` **Ein Punkt,
den du ohne Messung fuer erledigt haeltst, bleibt `unklar` — das ist
kein Makel, sondern das ehrliche Ergebnis.**

`[read]` **Und die Zahlen im Punkt gehoeren mitgeprueft.** Wenn ein
Punkt von 290 Substanzen spricht und es 412 sind, ist er **auch dann
neu zu fassen, wenn die Sache offen ist.**

## WAS NICHT ZU TUN IST

**Nichts reparieren, nichts anlegen, nichts aendern.** `[read]`
**Dies ist eine Bestandsaufnahme.** Was du findest, wird ein Auftrag
— aber erst, wenn die Liste steht.

**`docs/todo/TODO.md` nicht anfassen** — `docs/` gehoert dem
Orchestrator. **Dein Bericht ist die Liste; ich ziehe sie nach.**

**Keine Punkte zusammenlegen oder streichen**, auch nicht offenkundig
doppelte. `[read]` **Zwei Punkte, die dasselbe meinen, sind selbst ein
Befund** — nenn sie, entscheide nicht.

`apps/` nicht anfassen. Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

    Punkte geprueft            Zahl, Soll 47
    erledigt                   Zahl, je mit Beleg
    teilweise                  Zahl
    offen                      Zahl
    ueberholt                  Zahl
    unklar                     Zahl, je mit der noetigen Messung
    veraltete Zahlen           je Punkt, alt gegen heute

`[read]` **Kein Nachweis in beide Richtungen noetig** — dies ist eine
Erhebung, kein Waechter. **Aber jedes *erledigt* braucht seinen
`[cmd]`**, sonst ist es eine Vermutung mit Haekchen.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Lesend gegen live ist in Ordnung. Dieser Auftrag schreibt nicht.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
