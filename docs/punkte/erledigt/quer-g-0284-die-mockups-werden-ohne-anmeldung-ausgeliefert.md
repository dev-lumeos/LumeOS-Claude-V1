---
nr: G-284
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: A-16
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: 33a526a3
beruehrt:
  dateien:
    - docs/spezifikation/10-plattform/design-system/mockup-zwischenwurf
zahlen:
  gemessen: 2026-08-31
  dateien: 94
  groesse_kb: 592
---

# G-284 — die Mockups werden ohne Anmeldung ausgeliefert

## Befund

Aus A-16, Claude Code, 2026-08-31. **Gemessen aus einer abgemeldeten
Sitzung.**

`[cmd]` **94 Dateien, 592 kB unter `docs/spezifikation/10-plattform/design-system/mockup-zwischenwurf/`.**
`[cmd]` **`public/` geht in den Build und wird ohne Anmeldung
ausgeliefert.**

`[cmd]` **`/mockup/index.html` ist ein lauffaehiges zweites Produkt
neben dem echten.**

## Warum `hoch`

`[read]` **Es ist kein Datenleck** — die Mockups tragen erfundene
Zahlen, keine Nutzerdaten.

`[read]` **Aber es ist eine zweite Anwendung unter derselben Domain,
die niemand pflegt** — **und die aussieht wie das Produkt.**

`[cmd]` **Der Fundus selbst ist als *archivieren* beurteilt** (A-16)
— **die Auslieferung ist die eigentliche Frage.**

## Zu klaeren

`[read]` **Genuegt das Verschieben aus `public/`?** `[cmd]` **Der
Fundus soll erhalten bleiben** (A-16: archivieren, nicht loeschen) —
**aber nicht dort, wo er ausgeliefert wird.**

## Auftrag

**Vorbereitet mit G-283 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.

## Bericht — erledigt

**Claude Code, 2026-08-31.** Mitbeauftragt mit G-283. **Der vollstaendige Bericht steht in [G-283](nutrition-g-0283-ein-pro-profil-faellt-still-auf-090.md#bericht).**

### Vorher / nachher, ohne Anmeldung

    /mockup/index.html                            200 -> 404
    /mockup/tokens.css                            200 -> 404
    /mockup/features/nutrition/MicroDashboard.js  200 -> 404

`[cmd]` **Und das echte Produkt antwortet weiter:** `/login` 200,
`/v2/nutrition` 200.

### Verschoben, nicht geloescht (A-16)

    von   apps/web/public/mockup/            94 Dateien, 592 kB
    nach  docs/spezifikation/10-plattform/
            design-system/mockup-zwischenwurf/

`[read]` **Neben `theme-v1`, weil es dasselbe ist** — eine Ideenquelle
im Entwurfsordner. `[cmd]` **`public/` ist danach leer**, es enthielt
nichts ausser dem Mockup.

`[cmd]` **Nichts bricht:** vier Quelldateien nennen den Pfad, **alle
vier als Kommentar `QUELLE:`**, kein Import — mitgezogen.

`[cmd]` **Der Umzug hat den Gate rot gemacht:** zehn
`beruehrt.dateien`-Angaben zeigten auf den alten Pfad. **Sieben
Punktdateien nachgezogen, Gate wieder gruen.**

`[read]` **Ein Hinweis fuer den Commit:** die 94 verschobenen Dateien
sind **ungetrackt** — der `git mv` hat sie bewegt, die Indexaenderung
ist verlorengegangen. **Sie liegen vollstaendig am neuen Ort.**

`[cmd]` **Bewacht:** eine Sabotage, die den Ordner zurueck nach
`public/` legt, laesst die Kette fallen. **Der Waechter liest die
Platte, nicht `git ls-files`** — ein zurueckkopierter Ordner ist
ungetrackt, und Next.js liefert trotzdem aus.

## Abnahme

**2026-08-31, mit G-283 abgenommen:** nicht mehr oeffentlich: alle drei Pfade 404, 94 Dateien neben
`theme-v1` archiviert.
