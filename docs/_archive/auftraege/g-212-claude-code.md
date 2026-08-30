# G-212 — Claude Code, 2026-08-27

Bericht: `docs/berichte/g-212-claude-code.md`

**Du hast es selbst vorgeschlagen: *,,Die uebrigen 14 sollten auf
dieselbe Weise nachgeprueft werden, bevor daraus Auftraege werden."*
Hier ist der Auftrag dazu.**

---

## Warum

`[cmd]` **Vier Punkte sind heute an ihrer eigenen Praemisse
gescheitert** — G-207, G-211, G-138, G-176. `[read]` **Drei davon
hast du gefunden, den vierten habe ich gerade noch vor dem Schreiben
gemessen.**

`[read]` **Dein Satz aus G-138 ist die Diagnose:** *,,Der Punkt
zaehlte Namen, nicht Faehigkeiten."* `LogDoseModal` heisst hier
`LogDoseFenster`. **In einem deutsch benannten Repo findet ein
Namensvergleich gegen englische Vorlagen systematisch nichts.**

## Dein Teil: die G-Punkte

`[cmd]` **`scratchpad/supp-liste.txt` fuehrt 69 offene Punkte mit
Supplements-Bezug. Dir gehoeren die 18 G-Punkte** — die C-Punkte sind
C-315 bei Codex.

    G-06   G-53   G-78   G-138  G-152  G-162  G-165  G-170
    G-172  G-173  G-176  G-177  G-178  G-186  G-188  G-192
    G-202  G-205  G-209

`[cmd]` **G-138 und G-176 sind bereits geklaert** — G-138 durch dich,
G-176 durch meine Messung vorhin (`slice(0, 50)` ist Kommentar, ein
Test haelt *,,Suche verfeinern"* draussen). **Beide trotzdem
mitfuehren, mit Verweis, damit die Liste vollstaendig ist.**

## Zu tun — je Punkt ein Urteil mit Beleg

    erledigt          `[cmd]` welche Datei, welche Zeile, welcher Test
    teilweise         `[cmd]` was steht, `[cmd]` was fehlt
    offen             `[cmd]` was heute noch fehlt
    ueberholt         die Frage stellt sich nicht mehr, weil ...
    unklar            was gemessen werden muesste

`[read]` **Und die Zahlen gehoeren mitgeprueft.** `[cmd]` G-176 und
G-178 sprechen von **290 Substanzen — es sind 412.** G-186 nennt
318. **Ein Punkt mit toter Zahl ist auch dann neu zu fassen, wenn die
Sache offen ist.**

`[read]` **Zwei Punkte verdienen besondere Aufmerksamkeit, weil Tom
sie am Bildschirm gefunden hat:**

**G-178** — Reiter *,,Katalog 298"* gegen Fussleiste *,,50 von 290"*.
`[read]` Der Punkt war schon damals `[annahme]` mit drei
Moeglichkeiten und der Vorgabe *,,am Bildschirm nachmessen, nicht im
Code weiterraten"*. **Die Frage ist heute breiter: stimmen alle
Zahlen, die der Katalog nennt, mit der Datenbank ueberein?** Nicht
nur die zwei aus dem alten Bildschirmfoto.

**G-186** — Wechselwirkungen und Laborwirkung fehlen im Detail,
obwohl seit C-262 vorhanden. `[cmd]` `entity_transporters` 4.617,
`entity_cyp` 3.001, `supplement_lab_effects` 222,
`supplement_interactions` 78. **Pruef, ob das noch stimmt und ob die
Reiter es inzwischen zeigen.**

## WAS NICHT ZU TUN IST

**Nichts reparieren, nichts bauen.** `[read]` **Dies ist eine
Bestandsaufnahme.** Was du findest, wird ein Auftrag — aber erst,
wenn die Liste steht.

**`docs/todo/TODO.md` nicht anfassen** — `docs/` gehoert dem
Orchestrator. **Dein Bericht ist die Liste; ich ziehe sie nach.**

**Keine Punkte zusammenlegen oder streichen.** `[read]` **Zwei
Punkte, die dasselbe meinen, sind selbst ein Befund** — nenn sie,
entscheide nicht.

`supabase/_pipeline/` gehoert Codex (C-315).
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

    Punkte geprueft            Zahl, Soll 19
    erledigt                   Zahl, je mit Datei und Zeile
    teilweise / offen /        Zahlen
      ueberholt / unklar
    veraltete Zahlen           je Punkt, alt gegen heute
    Punkte, die dasselbe       je Paar benannt
      meinen

`[read]` **Jedes *erledigt* braucht seinen `[cmd]`** — Datei, Zeile,
und wenn es einen Test dazu gibt, dessen Name. **Sonst ist es eine
Vermutung mit Haekchen.**

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205). Wenn du
ihn fuer eine Sichtpruefung brauchst: `python tools/server.py start`,
nie `pnpm dev`.
**Lesend, ohne Schreibvorgaenge** — dieser Auftrag aendert nichts.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
