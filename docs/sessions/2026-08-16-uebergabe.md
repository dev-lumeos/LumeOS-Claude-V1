# Übergabe — 2026-08-16

**Anker:** `2b447cb` auf `dev`, gepusht bis `e76db63`.
`[cmd]` Working Tree sauber: 0 untracked, 0 modified.

**Zuerst lesen:** `CLAUDE.md`, dann `docs/ssot/00-INDEX.md` und
`docs/todo/TODO.md`. Die Plantabelle im TODO-Kopf verweist auf die
Umsetzungspläne.

---

## Drei Regeln, die heute entstanden sind

**1. Die Agenten committen nicht.** `[read]` Tom: *„Du orchestrierst —
dann machst du deinen Job falsch. Die beiden arbeiten und du prüfst es;
wenn ok, committest du."* `[cmd]` In `.claude/settings.json` gesperrt:
`git add`, `commit`, `stage`, `rebase`, `cherry-pick`, `revert`.

**Die Sperre greift nur bei Claude Code** — `[cmd]` Codex liest die
Datei nicht (belegt: Sperre 20:51, Codex committete 20:53). **Bei ihm
steht es im Auftragstext:** *„Nicht committen, nicht stagen — melden."*

**2. Die Vorlage ist die Vorgabe, nicht Material.** `[read]` Tom:
*„Wieso sieht es nicht wie die Vorlage aus? Für was mache ich tagelang
Design?"* Struktur, Reihenfolge, Anordnung kommen aus
`theme-v1/module-*.jsx`. Angepasst wird nur, was technisch nicht geht.
**Abweichungen werden vorgelegt, nicht entschieden.**

**3. Mockup-Marken sind der Fortschrittsbalken.** `[read]` Tom: *„Alles
kommt rein. Wenn es eine Attrappe ist, ist scheissegal, was da drin
steht — es zeigt ja nur, wie es aussehen könnte."* Nichts wird
weggelassen; Knöpfe ohne Ziel öffnen ein Modal „in Entwicklung".

`[cmd]` Drei Argumente sind dabei gefallen, alle vom Typ „weglassen
statt kennzeichnen" — sie stehen mit Widerlegung in
`theme-v1-umsetzung.md`.

**Dazu:** Neustarten und live prüfen gehört zum Job der Agenten, nicht
zu Toms. Und **wer welche Dateien anfasst, schneide ich** — Codex in
`supabase/`, Claude Code in `apps/web/` und `packages/ui/`, geteilte
Dateien trage ich nach.

---

## Der Stand

`[cmd]` **50 offen, 5 in Arbeit, 107 erledigt.**

**Die Kette steht vollständig:** Suche → Tagebuch → Tagesbilanz →
Bewertung → Ringe.

| | |
|---|---|
| Suche | 234 ms, Massstab 34/37, jede Anfrage protokolliert |
| Lebensmittel | 7.140 mit Anzeigenamen, 32.845 Aliase, 17.967 Tags |
| Nährwerte | 869.501 über 138 Codes |
| Portionen | 23.402 über 7.048 Lebensmittel |
| Tagebuch | Schreibpfad steht, Nährwerte werden eingefroren |
| Tagesbilanz | 74 Spalten, 24 Mikros mit Fehlzählern |
| Bewertung | 165 Referenzwerte, Deckungsgrade gegen das Profil |
| Ziele | TDEE, Makros, zwei essenzielle Fettsäuren, Wasser |
| Oberfläche | `/v2` mit Shell, Dashboard, Nutrition, Settings |
| Testdaten | 3 Nutzer, 512 Mahlzeiten, 43 Tage, **11 Szenariotage mit Register** |

`[cmd]` **Toms Konto ist gefüllt:** `dev@lumeos.app` /
`LumeosDev2026`, 172 Mahlzeiten, 43 Tage, Profil vollständig.

---

## Was morgen ansteht

**Beide Agenten sind frei, die Bereiche überschneiden sich nicht.**

### Claude Code — Oberfläche

**G-12** ist der grösste sichtbare Schritt: die Suche in die Erfassung
einbinden. `[cmd]` Schreibpfad (C-03) und Portionsspalten (C-51) stehen,
es fehlt die Verbindung — Suche in der Mahlzeitenkarte, Portionsauswahl,
„Same as yesterday".

**G-10** ist klein und behebt einen Shell-Fehler: `[cmd]`
`v2-btn-accent` färbt sich aus `--acc`, und Seiten ohne Modulakzent
haben keinen — der Speichern-Knopf in Settings war deshalb unsichtbar.
Betrifft alles, was aus `--acc` liest.

### Codex — Datenseite

**G-11**, Teil `Preferences`: `[cmd]` `food_preferences` und
`food_preference_items` stehen seit Kettenschritt `050` mit Zeilenschutz,
sind leer und nirgends angebunden. Der Tab ist eine Attrappe.

**Oder `Insights`:** `[cmd]` Auswertungen über Zeiträume — seit den
Testdaten mit 43 Tagen je Nutzer erstmals belegbar. `daily_summary`
rechnet je Tag, nicht je Woche.

---

## Zwei Fundstellen, die noch niemand ausgewertet hat

`[cmd]` **`docs/ssot/70-spec-audit/`** — 15 Dateien, ein Feldabgleich
über alle elf Module, entstanden am 2026-08-02. Er nennt je Modul den
härtesten Befund: drei konkurrierende Alt-Specs bei Admin, tote
Übersichtsdateien bei Buddy, Vorgängerrepo-Pfade bei Goals.

Der dort genannte härteste Fund — **14 `FOR ALL`-Policies mit `USING`
ohne `WITH CHECK`** — betrifft die Specs, nicht das Gebaute: `[cmd]`
heute null solche Policies, die Trennung je Operation kam mit C-42.

`[cmd]` **Das Konsolidierungsregister steht bei 74 offen, 6 gelesen, 4
aufgelöst** von 84 Nutrition-Dateien. `[read]` Zweimal hat das Fehlen
einer Auswertung Tage gekostet.

---

## Was ich heute falsch gemacht habe

**Die Vorlage als Materialsammlung behandelt.** Drei Durchgänge, bis
die Nutrition-Seite aussah wie der Entwurf. Der Fehler stand jedes Mal
im Auftrag: Ich nannte die Vorlage und gab dann eine andere Struktur vor.

**Sechs Aufträge ohne TODO-Punkt laufen lassen.** `[read]` Die Regel
*„eine Entscheidung ohne Punkt existiert nicht"* habe ich vormittags
aufgeschrieben und nachmittags selbst gebrochen. Nachgetragen als G-08,
G-09, C-55 bis C-58.

**Einen Commit mit sechs fremden Dateien gemacht**, weil ich
`git diff --cached --name-only` nicht gelesen habe — die Regel, die
genau dafür existiert.

**Dreimal etwas als offene Frage behandelt, das im Vorgängerrepo fertig
lag:** TDEE-Formeln, Portionsgrössen, Einheiten-Umrechnung. Jedes Mal
kam der Hinweis von Tom. `[read]` Daraus entstand
`docs/ssot/80-vorgaengerrepo-fundus.md` und Schritt 1b im Verfahren.

---

## Werkzeuglage

`[cmd]` Dev-Server auf Port 3200, Supabase-Stack läuft, `goals` ist über
PostgREST erreichbar (brauchte `supabase stop`/`start`, nicht
`docker restart`).

**Zwei Stolpersteine, die einen halben Tag gekostet haben:** `[cmd]`
`netstat | grep LISTENING` findet auf deutschem Windows nichts — der
Zustand heisst `ABHÖREN`. Und `pnpm build` schreibt nach `.next-gate`,
während `pnpm start` in `.next` sucht.

`[cmd]` Ein zwei Tage alter Node-Prozess lieferte dabei einen veralteten
Build aus — **welche Prüfungen dieser Sitzung dagegen gemessen haben,
ist ungeklärt.**
