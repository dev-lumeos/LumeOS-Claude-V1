---
nr: G-283
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: G-228
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/diary-entwurf.tsx
zahlen:
  gemessen: 2026-08-31
  profile_pro: 2
  profile_null: 5
  rueckfallwert: 0.90
---

# G-283 — ein `pro`-Profil faellt still auf 0,90

## Befund

Aus G-226, Claude Code, 2026-08-31.

    SPEC_04:336                beginner | intermediate | advanced | elite
    profiles.experience_level  beginner | advanced | pro | elite  (CHECK)
    live                       2x 'pro', 5x NULL
    diary-entwurf.tsx:31       die vier Namen der Spec, `?? 0.90`

`[read]` **Die Spec kennt `intermediate`, die Datenbank kennt `pro`,
und keine kennt die andere.**

`[cmd]` **Der Code prueft gegen die Spec-Namen und faellt sonst auf
`?? 0.90`** — **den Wert, der fuer `intermediate` gedacht war.**

`[read]` **Ein `pro`-Nutzer bekommt also den Faktor einer Stufe, die
er nicht hat** — **ohne Fehler, ohne Meldung, ohne dass es jemandem
auffaellt.**

## Warum `hoch`

`[cmd]` **Zwei von sieben Profilen stehen auf `pro`.** `[read]` **Bei
den fuenf mit `NULL` ist der Rueckfall richtig; bei den zwei
anderen ist er eine falsche Antwort auf eine gestellte Frage.**

`[read]` **Und es ist dieselbe Klasse wie der stille Rueckfall in
A-60:** kein Absturz, keine Meldung, nur ein falscher Wert.

## Was zu tun ist

`[read]` **Der Rueckfall muss sagen, dass er greift** — **oder die
Namen muessen zusammenpassen.**

`[read]` **Welche vier Namen gelten, ist G-228 und gehoert Tom.**
**Dass ein unbekannter Name nicht stillschweigend zu 0,90 wird, ist
dieser Punkt.**

## Auftrag — drei Befunde aus G-226

**Mitbeauftragt: G-284, G-285.** Bericht in diese Datei.

`[read]` **Vorbereitet am 2026-08-31.**

### 1 · G-283 — der stille Rueckfall

`[cmd]` **Zwei von sieben Profilen stehen auf `pro`, der Code kennt
den Namen nicht und faellt auf 0,90.**

`[read]` **Welche vier Namen gelten, ist G-228 und gehoert Tom.**
**Dass ein unbekannter Name nicht stillschweigend zu einem Faktor
wird, ist dieser Punkt.**

`[read]` **Dieselbe Klasse wie A-60: kein Absturz, keine Meldung, nur
ein falscher Wert.** **Und du hast dort die Loesung gebaut — einen
Waechter auf die Signatur.**

### 2 · G-284 — die Mockups sind oeffentlich

`[cmd]` **94 Dateien, 592 kB, ohne Anmeldung ausgeliefert.**
`[cmd]` **`/mockup/index.html` ist ein lauffaehiges zweites Produkt.**

`[read]` **A-16 sagt: archivieren, nicht loeschen.** **Die Frage ist
nur, wohin** — **`public/` geht in den Build.**

### 3 · G-285 — der dreimal berichtigte Kommentar

`[cmd]` **`page.tsx:46` nennt `display_tier` weiter *,,das
Abo-Gate"*.** `[cmd]` **G-140, G-239 und G-235 haben es dreimal
geklaert.**

`[read]` **Berichtigen und sichern** — **G-173 hat gezeigt, dass eine
Korrektur ohne Waechter still zurueckkippt.**

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.** **Codex fasst ihn nicht
an.**

### Nachweis

    Rueckfall               meldet er sich? gebaut
    pro-Profil              was zeigt es jetzt
    Mockups                 nicht mehr oeffentlich, Fundus erhalten
    display_tier            berichtigt und gesichert
    Attrappen               am Schirm, vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
