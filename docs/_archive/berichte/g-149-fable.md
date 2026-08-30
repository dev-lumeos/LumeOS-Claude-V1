# G-149 + G-158 — Fable, 2026-08-23

Auftrag: `docs/auftraege/g-149-fable.md`.

## 1 · G-149: der Einnahme-Haken bucht jetzt auf den angesehenen Tag

**Wo der Stichtag herkam und wo er verlorenging — gemessen, nicht
geraten:** Die Today-Kachel zeigt den juengsten Protokolltag
(`daten.einnahmen[0].intake_date`), und die
`takenToday`-Initialisierung nutzt denselben Tag. `toggleTaken`
suchte und buchte dagegen auf `stichtag` (= echtes Heute aus
`heuteProp`). Eine Tagesnavigation gibt es nicht — der „angesehene
Tag" IST der Protokolltag; genau dort ging er verloren.

**Fix** (`app/v2/supplements/ansicht.tsx`, eine Stelle):
`toggleTaken` bildet `ansichtsTag = einnahmen[0].intake_date ??
stichtag` und sucht/bucht darauf — konsistent mit Anzeige und
Initialisierung. `lib/supplements/stack-write.ts` (C-250, Codex) ist
NICHT beruehrt; der Fehler lag ausschliesslich im Aufrufer.

**Nachweis, Erwartung vorher hingeschrieben:** dev sieht als
Protokolltag **2026-08-19** (juengster `intake_date`; die
Intake-Seeds enden dort, nur Check-ins laufen weiter) — ein wirklich
zurueckliegender Tag. Erwartung: der Klick bucht auf **2026-08-19**;
die alte Logik haette auf 2026-08-23 gebucht. Durchgefuehrt
(Playwright, `backup/g149-klick-nachweis.mjs`): die Creatine-Zeile
des 19.8. gesichert und freigemacht, Haken geklickt, gemessen:

    intake_date 2026-08-19 · taken · Creatine monohydrate · manual

**Rueckbau gezaehlt:** Klickzeile geloescht (DELETE 1), Original aus
der Sicherung wiederhergestellt (INSERT 1), Sicherungstabelle weg.

**Negativprobe:** Korrektur auf `intake_date: stichtag`
zurueckgedreht → der neue Waechter („G-149: der Einnahme-Haken bucht
auf den angesehenen Tag") wird rot mit genau dieser Meldung →
wiederhergestellt, 522/522 gruen.

**Beobachtung, nicht geaendert:** Die Dialoge „Log dose"/„Log skip"
buchen ebenfalls auf `stichtag` — zeigen ihn aber SICHTBAR im
Untertitel. Anzeige und Buchung stimmen dort ueberein; ob sie kuenftig
den Ansichtstag nutzen sollen, ist eine Produktfrage.

## 2 · G-158: der Coach-Kopf zaehlt aus dem Stand

Der Kopf bildet jetzt `aktiveBeziehungen`
(`stand.beziehungen.filter(status='active')`) und
`ungeleseneNachrichten` (read_at null, fremder Absender) — dieselben
Regeln wie die Tab-Zaehler seit G-158. Ohne Stand: Pill
**„Nicht geladen"** mit Grund im title — kein Strich, keine Null.
`COACHES` kommt im Kopf nicht mehr vor (Waechter „G-158: der
Coach-Kopf zaehlt aus dem Stand, nicht aus COACHES").

**Nachweis:** gerendert als dev (`backup/g149-kopf-dev.png`):
**„1 active · 0 unread"** — die RLS-Sicht (1 aktive Beziehung; die
einzige ungelesene Nachricht ist devs eigene), NICHT die Gesamtzahl
(6 Beziehungen) und nicht der Entwurf („4 active · 1 unread"). Die
C-241-Falle ist damit ausdruecklich vermieden. Erwartung fuer
test-user DB-seitig gemessen: **0 active · 0 unread** (echte Nullen
der RLS-Sicht, kein Platzhalter).

## Warum die gerenderten Nachweise auf dev liefen — Bescheid gemaess Auftrag

`[cmd]` Der test-user-Login mit dem schuss-Standardwort schlaegt
weiterhin fehl (GET-Redirect zurueck auf /login). Laut Auftrag tausche
ich den Hash NICHT mehr ohne Bescheid — **hiermit der Bescheid**: fuer
Browser-Nachweise auf test-user brauche ich das hinterlegte Wort (oder
die angekuendigte Dauerloesung). Bis dahin: Browser-Nachweise auf dev
mit Vermerk, test-user-Erwartungen DB-seitig belegt. Der
G-149-Klick-Nachweis ist ohnehin konto-unabhaengig (derselbe Codepfad).

## Nebenbeobachtungen

- Ein erster Playwright-Lauf scheiterte mit Zugangsdaten in der URL
  (GET-Submit) — tote Hydration waehrend des Recompiles nach Codex'
  C-252-Dateiaenderungen, kein Codefehler; der zweite Lauf war sauber.
- `lib/supplements/*` wird gerade auf C-252 umgestellt
  (supplements.supplements statt substance_catalog) — nicht beruehrt;
  meine beiden Aenderungen liegen ausserhalb (ansicht.tsx supplements,
  coach/ansicht.tsx) und kollidieren nicht.

Tests **522/522 gruen**, tsc sauber (auch mit Codex' Zwischenstand).
