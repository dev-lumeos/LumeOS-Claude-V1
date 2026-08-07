---
status:     offen — Entscheidung steht aus (Tom)
stand:      2026-08-06
ankerhash:  305a078
betrifft:   30-module/training, 30-module/nutrition (MealCam), 10-plattform/architektur, Sektion E
---

# ADR-0004: Wo liegen die Medien?

## Kontext

Zwei Orte stehen nebeneinander, und keiner ist entschieden.

`[read]` Die Training-Spezifikation nennt an **sechs Stellen** Cloudflare R2:
`INDEX.md:90` („Media | Cloudflare R2 (~15 GB Images + Videos)"),
`SPEC_01_MODULE_CONTRACT.md:218–219`, `SPEC_02_ENTITIES.md:108`,
`SPEC_04_FEATURES.md:17`, `SPEC_06_DATABASE_SCHEMA.md:176`.
`[cmd]` Letzte Änderung an `docs/specs/Training/`: **2026-04-28** — die
Festlegung ist also gut drei Monate alt und stammt aus der Zeit vor der
Vermessung der Legacy-Instanz.

`[cmd]` Der Bestand liegt tatsächlich in **Supabase Storage**:
Bucket `exercises`, **10.776 Objekte, 15 GB, `public: true`**
(gemessen 2026-08-01, `docs/todo/TODO.md` Sektion E). Die Medien-URLs sind
absolut und öffentlich:
`https://<ref>.supabase.co/storage/v1/object/public/exercises/videos/<Kategorie>/<datei>.mp4`

`[cmd]` 2026-08-06 zusätzlich gefunden: Eine **lokale Kopie derselben
Medien** liegt unter `temp/lumeosold/assets/` — **7.012 Dateien, 13,4 GB**
(2.353 Videos mit 10,9 GB, 4.631 Bilder mit 2,4 GB). Die Zahlen decken
sich mit der Spezifikation (dort 4.645 Bilder, 2.363 Videos): es ist
derselbe Korpus, nicht ein zweiter.

Damit gilt: **Die Spezifikation beschreibt einen Ort, an dem nichts
liegt.** R2 ist eine Absicht, kein Zustand.

## Warum das jetzt entschieden werden muss

Nicht wegen der Medien selbst, sondern wegen der **Pfade in der Datenbank**.

`[read]` `E-06` (Medienpfade relativ speichern) wartet ausdrücklich auf
diese Entscheidung, und die Begründung dort trifft den Kern: Solange
absolute URLs gespeichert werden, steckt die Projekt-Referenz in **jeder
Zeile**. `[cmd]` Genau das ist heute der Fall — die URLs im Bestand tragen
`<ref>.supabase.co`.

Ein Ortswechsel nach dem Speichern absoluter Pfade heisst: 10.776 Zeilen
umschreiben, in einer Instanz, für die bezahlt wird, mit einem
Migrationsskript, das niemand zurückrollen kann, ohne die alten URLs zu
kennen. Ein Ortswechsel **vor** E-06 kostet nichts als eine
Konfigurationszeile.

**Deshalb ist die Reihenfolge wichtiger als die Antwort:** Diese
Entscheidung gehört vor E-06, nicht danach. Wer E-06 zuerst baut, baut sie
zweimal.

## Optionen

**A — Supabase Storage behalten**
*Dafür:* `[cmd]` Der Bestand liegt bereits dort, 15 GB, funktionierend und
öffentlich erreichbar. Kein Transfer, kein Ausfallfenster. Ein Dienst
weniger im Betrieb, eine Rechnung weniger, ein Zugangsschlüssel weniger.
Zeilenschutz und Storage-Policies liegen im selben System wie die
Nutzerdaten.
*Dagegen:* `[read]` Preview-Branches enthalten **kein** `exercises`-Bucket
(TODO Sektion E, „Was Supabase-Branching nicht kann", Punkt 3) — gegen die
15 GB liesse sich dort nicht testen. Supabase Storage ist kein CDN im
engeren Sinn; Auslieferung weltweit ist schwächer als bei R2.

**B — Nach Cloudflare R2 wechseln**
*Dafür:* `[read]` So steht es an sechs Stellen der Spezifikation. R2 hat
keine Egress-Gebühren — bei 15 GB Video und wachsender Nutzerzahl ist das
der Posten, der bei Supabase Storage zuerst weh tut. Ein CDN vor den
Medien ist der Normalfall für Videoauslieferung.
*Dagegen:* Ein Transfer von 15 GB, ein zweiter Anbieter, ein zweiter
Zugangsschlüssel, eine zweite Rechnung. Zugriffsschutz müsste getrennt
gelöst werden — R2 kennt die Supabase-Sitzung nicht. `[annahme]` Die
Egress-Kosten bei Supabase sind **nicht gemessen**; ob sie überhaupt ins
Gewicht fallen, ist offen.

**C — Beides, getrennt nach Zweck**
Stammdaten-Medien (Übungsvideos, unveränderlich, gross, oft abgerufen)
nach R2; Nutzermedien (MealCam-Bilder, privat, klein, selten abgerufen) in
Supabase Storage.
*Dafür:* Jede Klasse liegt dort, wo ihre Eigenschaften hingehören —
öffentliche Auslieferung gegen privaten, sitzungsgebundenen Zugriff.
*Dagegen:* Zwei Systeme ab Tag eins, doppelte Konfiguration, und die
Grenze muss bei jedem neuen Medientyp neu gezogen werden.

## Entscheidung

**Offen.** Bewusst nicht getroffen.

Die Wahl hängt an einer Zahl, die `[annahme]` niemand gemessen hat: was
Egress bei Supabase Storage für diesen Bestand tatsächlich kostet. Ohne
sie wäre jede Entscheidung geraten — und eine geratene Antwort in einem
ADR ist schlimmer als eine offene Frage, weil sie später als begründet
gilt.

**Empfehlung (Claude), wenn heute entschieden werden müsste: A —
Supabase Storage behalten, mit Wiedervorlage.**
Begründung: `[cmd]` Der Bestand liegt dort, funktioniert und ist bezahlt.
Ein Transfer ist Arbeit gegen ein Problem, das nicht gemessen ist. Die
Egress-Frage lässt sich später beantworten — **wenn E-06 vorher erledigt
ist.** Genau dann ist der Wechsel billig: relative Pfade plus eine
Basis-URL aus der Konfiguration, und der Ort wird zur Einstellung statt
zur Migration.

**Was Tom zum Entscheiden braucht:**
1. Die Egress-Kosten der letzten Monate aus der Supabase-Abrechnung.
2. Ob die Medien öffentlich bleiben sollen (`[cmd]` heute
   `public: true`) — bei privaten Medien verliert R2 einen Teil seines
   Vorteils, weil signierte URLs nötig würden.

## Folgen

- **E-06 wird zur Voraussetzung, nicht zur Folge.** Medienpfade relativ
  speichern (Bucket plus Objektpfad, Basis-URL aus der Konfiguration)
  macht diese Entscheidung nachträglich billig — unabhängig davon, wie sie
  ausfällt. Das ist der stärkste Grund, E-06 vorzuziehen.
- Solange die Entscheidung offen ist, wird **kein** neuer Medienpfad
  absolut gespeichert. Wer Medien anbindet, legt Bucket und relativen Pfad
  getrennt ab.
- `docs/specs/Training/` behauptet an sechs Stellen R2 als gegeben.
  `[read]` Das ist Zielbild, kein Ist-Zustand — bis zur Entscheidung ist
  jede dieser Stellen als Absicht zu lesen. Gehört in den Spec-Audit
  (D-05).
- MealCam (`docs/specs/Nutrition/`, Feature 9) erzeugt Nutzermedien und
  fällt unter dieselbe Frage; `[read]` `ADR_MEALCAM_CONSENT.md` regelt die
  Einwilligung, nicht den Ort.

## Was diese Entscheidung umstossen würde

- Die Egress-Rechnung bei Supabase Storage erreicht eine Grösse, die den
  Transferaufwand rechtfertigt.
- Die Medien sollen nicht mehr öffentlich sein — dann ändert sich die
  Rechnung für beide Optionen.
- Ein Client braucht Medien ohne Supabase-Sitzung (etwa eine öffentliche
  Übungsdatenbank als Marketingfläche).

## Offen

- `[annahme]` Egress-Kosten nicht gemessen — die tragende Zahl fehlt.
- `[cmd]` Die lokale Kopie unter `temp/lumeosold/assets/` (13,4 GB) ist
  weder gesichert noch versioniert. Solange sie die einzige lokale Kopie
  ist, ist sie **kein Löschkandidat** für A-05 — festgehalten am
  2026-08-06, weil sie dort beinahe unter „Repo-Müll" gefallen wäre.
