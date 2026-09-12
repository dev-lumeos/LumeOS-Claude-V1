---
nr: G-434
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
erledigt: 2026-09-08
commit: 4b38da12
braucht: []
kind_von: G-432
entscheidung: null
agent: claudecode
beruehrt:
  dateien:
    - packages/ui/src/koerperkarte-pfade.ts
zahlen:
  gemessen: 2026-09-08
  flaechen: 43
---

# G-434 — die Karte, direkt mit Tom erledigt

## Woher

Tom, 2026-09-08:

> ich habs direkt mit claude code erledigt und codex laeuft noch.
> war mir zu doof mit deinen annahmen. die grafiken zumindest
> sind nun richtig.

`[read]` **Ohne Auftrag des Orchestrators** ? **nach fuenf
Anlaeufen (G-425, G-430, G-431, G-432, G-433).**

## Was gemessen ist

`[cmd]` **`koerperkarte-pfade.ts`: 43 Flaechen.**

    23   vor G-430
    26   G-430  (Ruecken geteilt)
    28   G-431  (Glutes, Hamstrings)
    43   jetzt

`[cmd]` **Neu darunter:**

    adductor-brevis, adductor-longus
    gluteus-maximus, gluteus-medius
    biceps-femoris, semitendinosus

`[cmd]` **`soleus` und `gastrocnemius` weiter NICHT** ? **die
bekannte Luecke.**

`[cmd]` **Geaendert: `muskel-ebenen.ts`, `muskel-zuordnung.ts`,
`ebenen.ts`, `injektion-flaechen.ts` und fuenf Testdateien.**

`[cmd]` **Proben: `apps/web` 1661/1661, `apps/coach` 65/65.**

`[cmd]` **Am Schirm: einzelne Muskeln, keine Buendel.**

## Was der Orchestrator falsch gemacht hat

`[read]` **Fuenf Auftraege fuer etwas, das Tom in sechs Zeilen
beschrieben hat.**

**1** ? **Bei Schritt 4 angefangen** (*,,jeder Muskel
anwaehlbar"*) **ohne 1 bis 3** (*,,was gibt die Grafik her"*).

**2** ? **Eine Regel erfunden und nicht geprueft:** *,,triceps
hat drei Koepfe und bleibt EIN Muskel"* ? **dreimal
weitergereicht.**

**3** ? **`training.muscle_groups` nicht gelesen** ? **die
Hierarchie stand die ganze Zeit da.**

**4** ? **Und zuletzt eine falsche Begruendung geschrieben:**
**der Baum liest `muscle_groups`, nicht `koerperflaechen`** ?
**Tom hat nachgefragt, ich musste es berichtigen.**

## Was offen bleibt

`[cmd]` **`Per-muscle detail` zeigt weiter `Upper back`,
`Lower back`, `Quadriceps`, `Hamstrings`** ? **aus
`motor.ts:41`.**

`[cmd]` **G-433 laeuft.**

`[cmd]` **Und `public.koerperflaechen` traegt noch die alten
Buendel** ? **C-482.**
