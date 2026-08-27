---
nr: E-19
getroffen: 2026-08-27
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-319, C-322]
modul: nutrition
---

# E-19 — Cam: Objektspeicher, Bild und Analyse getrennt, Modell austauschbar

## Frage

C-319: hybrid, remote-url oder Objektspeicher fuer die Cam-Daten?
C-322: welches Vision-Modell?

## Entscheidung

**Objektspeicher.** Tom, 2026-08-27: *,,ich sehe die daten im s3
storage"*. `[read]` Supabase Storage ist S3-kompatibel — **keine
zweite Infrastruktur.**

**Bild und Analyse werden getrennt gespeichert.** Das Foto in den
Bucket, das Ergebnis in eine Tabelle mit `bild_pfad`.

`[read]` **Der Grund ist nicht Ordnung, sondern Loeschbarkeit:** sonst
zerstoert jede Bildloeschung die Ernaehrungshistorie — **und genau das
verlangt jede Loeschanfrage.**

**Das Modell ist austauschbar hinter einer Naht**, wie in G-211.
`[cmd]` **Das Vorgaengerrepo hatte zwei Anbieter** —
`claude-vision.ts` und `zai-vision.ts`, einer davon als `.backup`.
`[read]` **Sie haben gewechselt. Das ist die Erfahrung, die zaehlt.**

**Jede Erkennung speichert `modell` und `modell_version`.** `[read]`
**Ohne das weiss niemand nach einem Modellwechsel, welche Erkennung
von welchem Modell stammt** — und ein spaeteres Learning traeniert
auf gemischten Daten.

## Ausgangslage

`[cmd]` **Gemessen 2026-08-27:** keine Storage-Buckets, 0 Objekte,
keine Cam-Tabelle. `[cmd]` Im Vorgaengerrepo ist `useMealCam.ts` eine
**Attrappe mit acht hartkodierten BLS-Lebensmitteln** — es wurde nie
fertig gebaut.

## Zeitpunkt

`[read]` **Endausbau.** `[cmd]` MealCam steht in **69 Spec-Dateien**,
quer durch Admin, Subscription-Gates, AI-Usage-Wallet,
Coach-Workflows und Marketplace. **Es ist kein Nutrition-Feature, das
man nebenbei baut.**
