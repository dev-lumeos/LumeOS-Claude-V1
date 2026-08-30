# C-265 + C-267 — Codex, 2026-08-25

Bericht: `docs/berichte/c-265-codex.md`

**Zwei Punkte derselben Klasse: etwas laeuft auseinander, und niemand
merkt es, bis jemand hinsieht.**

---

## 1 · C-265 — die Kette erzeugt nicht mehr den Live-Stand

`[cmd]` **Du hast es dreimal gemeldet** — bei C-262, C-264 und C-266,
jedes Mal korrekt als nicht-eigene Ursache. **Dreimal derselbe Befund
ist ein eigener Punkt.**

`[cmd]` **Live gruen, frischer Kettenlauf rot.** Abweichungen:
`biomarker_spec_enrichment` · `biomarker_aliases` · **zwei Funktionen**
· **LOINC-Slug-Eindeutigkeit**.

`[read]` **Warum das mehr ist als ein roter Waechter:**
`supabase/README.md` sagt, der Datenbankzustand entsteht aus der Kette,
nicht aus `migrations/`. **Wenn die Kette einen anderen Stand erzeugt
als die laufende Instanz, ist der Live-Bestand nicht reproduzierbar.**

`[cmd]` **Besonders heikel: die LOINC-Slug-Eindeutigkeit.** C-248 hat
sie live repariert — 13 Codes mit mehreren `curated_slug`, sechs leere
ApoB-Zeilen auf `1869-7` entfernt — und einen Waechter gebaut.
**Erzeugt die Kette sie nicht, kommt der Fehler beim naechsten
Neuaufbau zurueck.** `[cmd]` Heute live: `biomarker_reference_ranges`
**560**.

### Zu tun

**Je Abweichung feststellen, welcher der beiden Staende der richtige
ist.** Zwei Moeglichkeiten, und sie fuehren zu verschiedenen
Reparaturen:

    KETTE UNVOLLSTAENDIG   ein Schritt fehlt oder ist nicht verkettet
                           -> Schritt ergaenzen
    LIVE AUSSERHALB        etwas wurde direkt eingespielt, ohne
                           Kettenschritt
                           -> nachtraeglich als Schritt abbilden

`[read]` **Erst messen, dann entscheiden.** Ein Schritt, der live
nachbaut, was jemand von Hand gemacht hat, ist etwas anderes als ein
vergessener Schritt — **und der Bericht muss sagen, welcher Fall
vorlag.**

`[read]` **Nichts live aendern, um die Kette gruen zu bekommen.** Der
Live-Stand ist der geprueftere von beiden — er traegt C-243 bis C-266
mit gemessenen Nachweisen.

### Nachweis

**Voller Kettenlauf auf der Wegwerf-Datenbank, Abschluss-Waechter
gruen.** `[cmd]` Heute bricht er an den vier genannten Stellen.

**Danach Gegenprobe:** Wegwerf-Stand gegen Live vergleichen — Tabellen,
Spalten, Funktionen, Policies. **Zahl der Abweichungen: heute vier
Gruppen, nachher 0.**

**Negativprobe:** einen Kettenschritt ueberspringen, der Waechter muss
rot werden und **den Schritt nennen**.

---

## 2 · C-267 — falsche Kennungen, und vermutlich nicht nur eine

`[cmd]` **Von Kimi gefunden, vom Orchestrator live bestaetigt:**
`Caffeine (anhydrous)` traegt PubChem-CID **6435808**, Formel
**`C10H12FN3O4`** und InChIKey
**`GFFXZLZWLOBBLO-ASKVSEFXSA-N`**.

`[cmd]` **Der Nachbareintrag `Caffeine (fat-loss context cross-ref)`
hat dieselben Felder richtig:** CID **2519**, **`C8H10N4O2`**,
**`RYYVLZVUVIJVGH-UHFFFAOYSA-N`**.

`[read]` **Die Formel schliesst es aus: `C10H12FN3O4` enthaelt Fluor,
Koffein nicht.** Der InChIKey mit `-ASKVSEFXSA-` weist zusaetzlich auf
ein Stereozentrum — Koffein hat keines. **Das ist ein fluoriertes
Nukleosid.**

`[cmd]` Importiert am 2026-08-23 aus `kimi_supplement`,
`evidence_class B`, Quelle `src_pubchem_6435808`.

### Der Bestand

`[cmd]` `supplement_identifiers` **1.226 Zeilen**:

    UNII               272
    molecular_formula  242
    PubChem_CID        241
    InChIKey           239
    ChEMBL_ID          155
    cas_candidates      77

`[read]` **Formel, InChIKey und CID gehoeren zusammen** — der erste
Block des InChIKey kodiert die Summenformel und die Konnektivitaet.
**Das ist pruefbar, kein Rateverfahren.**

### Zu tun

**Eine Gate-Pruefung, die die drei gegeneinander haelt.** Wo sie
auseinanderlaufen: **melden, nicht korrigieren.**

`[read]` **Kimi laeuft parallel ueber denselben Bestand** und wurde
gebeten, dasselbe auf seiner Seite zu tun. **Zwei unabhaengige
Ergebnisse sind hier ein Vorteil** — wenn sie sich unterscheiden, ist
das ein Befund.

`[read]` **Der Konfliktfall selbst wird nicht still korrigiert.** Kimi
dokumentiert ihn als Konflikt-Record; unsere Seite meldet ihn. **Wer
still ueberschreibt, verliert die Spur zur Ursache** — vermutlich ein
`crawl_022`-Enrichment.

### Nachweis

**Zahl der Substanzen mit widerspruechlichen Kennungen — vor der
Pruefung hingeschrieben.** `[annahme]` Ich erwarte eine einstellige bis
niedrig zweistellige Zahl; **weicht es stark ab, ist das ein Befund,
kein Fehler.**

**Gegenprobe:** Koffein **muss** unter den Treffern sein. **Findet die
Pruefung ihn nicht, misst sie das Falsche.**

**Negativprobe:** eine korrekte Formel absichtlich verstellen, die
Pruefung muss anschlagen und die Substanz nennen.

---

## WAS NICHT ZU TUN IST

**Keine Kennung korrigieren.** Melden.
**Nichts live aendern**, um die Kette gruen zu bekommen.
`apps/` nicht anfassen — Claude Code arbeitet dort an G-183.
Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## REGELN

Wegwerf-Datenbank zum Pruefen, danach verwerfen. Vollsicherung vor
jedem Live-Eingriff.
`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Pruefschleifen als Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`.
Repo-Text mit Sonderzeichen nicht ueber die Standardeingabe einer
interaktiven Sitzung schreiben.

`[cmd]` **Kimis Daten liegen jetzt unter
`docs/kimi_research/supplement_performance_database/data/`** — der alte
Pfad `backup/kimi-research/` ist ueberholt. Beides in `.gitignore`.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
