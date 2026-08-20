# 139 — Permissions und Autonomy im Coach-Modul

**Auftrag:** G-90 · **Stand:** 2026-08-20 · **Modul:** Coach
**Vorher:** C-119 (`docs/ssot/123-rechtemodell.md`, das Schema) ·
F-04 (`docs/spezifikation/recherche-coach-portale.md`, warum der
Vorgänger ersetzt wurde)

**Kurz:** Der Leseweg für alle sechs `coach`-Tabellen ist gebaut, der
Schreibweg für Rechte ebenso, und beide Historien werden angezeigt.
**Sichtbar wird davon heute nichts:** `coach` ist nicht für PostgREST
freigegeben — dieselbe Sperre, die G-64 bei `training` traf. Die
Oberfläche zeigt deshalb einen Leerzustand, der die Ursache benennt.
**Die Attrappenmarken sind trotzdem weg:** Permissions 7 → **0**,
Autonomy 13 → **0**, Proposals → **0**, im Browser gezählt.

---

## Wie die zwei Achsen getrennt sind

`[read]` Tom, 2026-08-19: *„In Permissions setzt der User, was der
Coach sehen darf und wie autonom es sein soll. Unter Autonomy setzt
der Coach den Level seines Users. Das sind zwei verschiedene
Sachen."*

`[cmd]` **Die Trennung steht in der Datenbank, nicht in der
Oberfläche.** `150_coach_permissions_autonomy.sql`:

```sql
client_permissions_insert  WITH CHECK (auth.uid() = client_id)
client_permissions_update  USING (auth.uid() = client_id)
client_autonomy_insert     WITH CHECK (auth.uid() = coach_id)
client_autonomy_update     USING (auth.uid() = coach_id)
```

**Der Coach kann seine eigenen Sichtrechte nicht setzen, der Klient
nicht seinen eigenen Reifegrad.** Ein Regler an der falschen Stelle
wäre wirkungslos — deshalb hat der Autonomy-Tab keinen.

`[read]` **Das ist genau die Umkehr, die die Recherche verlangt.**
F-04, 7.3: *„Der Coach setzt seine eigene Autonomiestufe — halte ich
für einen Irrtum, nicht für eine Alternative."* Im Vorgängerrepo lief
das über `PUT /autonomy/:clientId`, ohne Einwilligung des Klienten und
ohne RLS.

### Ein Widerspruch, der benannt gehört

`[read]` **Die Recherche und dieser Auftrag sagen etwas
Verschiedenes.** F-04 gibt C-95 so wieder: *„der Nutzer entscheidet,
wie autonom sein Coach handeln darf"* — und wertet es als Fehler, dass
der Coach die Stufe setzt. Der Auftrag G-90 sagt: *„Unter Autonomy
setzt der Coach den Level seines Users."*

`[cmd]` **Aufgelöst hat es das Schema, und zwar in Toms Richtung:**
`client_autonomy` nimmt Schreibzugriffe nur vom Coach. Der Widerspruch
ist keiner, weil die zwei Dinge verschiedene Fragen sind:

- **Wie autonom der Coach handeln darf** — das ist
  `*_auto_apply` in `client_permissions`, **und das setzt der Nutzer.**
  Genau Toms *„und wie autonom es sein soll"*.
- **Wie reif der Athlet ist** — das ist `client_autonomy`, eine
  Einschätzung, **und die trifft der Coach.**

`[read]` **Die Recherche hat die zwei zusammengeworfen**, weil sie im
Vorgängerrepo dieselbe Tabelle waren. Hier sind es zwei, und beide
Schreibrichtungen sind richtig herum.

`[cmd]` **Nicht mit `experience_level` verwechseln** — der steht seit
C-140 in `profiles` und ist Selbstauskunft. Autonomy ist
Fremdeinschätzung. Der Hinweis steht in der Kachel, weil die beiden
sonst verwechselt werden.

---

## Was der Nutzer setzen kann

**Je Modul zwei Dinge**, wie das Schema sie führt:

| | Spalte | Werte |
|---|---|---|
| **Sicht** | `<modul>_visibility` | `none` · `summary` · `full` |
| **Ändern ohne Bestätigung** | `<modul>_auto_apply` | ja · nein |

`[read]` Die Kachel schreibt aus, was jede Stufe heisst — „sieht das
Modul nicht" · „sieht Verlauf und Kennzahl, keine Einzeleinträge" ·
„sieht jeden Eintrag". **Und sie sperrt das Häkchen bei `none`:** ohne
Sicht ist ein Änderungsrecht sinnlos.

### Sieben Module — aber nicht die sieben des Mockups

`[cmd]` **Das Mockup und das Schema führen beide sieben Module, und
sie sind nicht dieselben:**

| | |
|---|---|
| Schema | nutrition, training, recovery, goals, supplements, medical, **buddy** |
| Mockup | training, nutrition, recovery, supplements, medical, goals, **body_metrics** |

**Gebaut ist gegen das Schema**, wie der Auftrag es nennt („Sieben
Module: … Buddy"). `[read]` **`body_metrics` hätte keine Spalte** —
ein Schalter dafür wäre stumm geblieben. Ob Körpermasse eine eigene
Sicht braucht oder unter `goals` fällt, ist eine Produktfrage; hier
nur gemeldet.

### Zwei heikle Module, nicht erfunden

`[cmd]` `medical` steht im Schema als Voreinstellung auf `none` und
trägt in der Recherche Art. 9 DSGVO; `recovery` führt HRV und Schlaf.
**Beide tragen in der Tabelle einen Vermerk** — keine erfundene
Einstufung, sondern die aus Schema und Entwurf.

---

## Was die Historie zeigt

`[cmd]` **Die Historie schreibt ein Trigger, nicht die Oberfläche.**
`client_permissions_change_log` hängt AFTER INSERT OR UPDATE OR DELETE
an der Tabelle und legt Alt- und Neuwert als JSONB ab; `changed_by`
setzt `set_changed_by()` aus `auth.uid()`.

`[read]` **Das ist der Unterschied zum Vorgänger.** F-04, 3.1: Rechte
wurden dort *„in place überschrieben"*, und das dokumentierte
`coach_client_autonomy_log` **hat nie eine Migration bekommen**. Wer
hier eine Freigabe zurücknimmt, kann nicht verhindern, dass es
protokolliert wird — und wer sie von Hand protokollieren wollte,
erzeugte die Zeile doppelt.

`[read]` **Der Log speichert ganze Zeilen, nicht einzelne Felder.**
Die Anzeige bildet den Unterschied selbst und zeigt je Änderung nur
die betroffenen Felder — „Ernährung · Sicht: none → full" statt einer
20-spaltigen JSONB-Zeile. `updated_at`, `created_at` und `id` sind
ausgenommen, sonst stünde in jeder Zeile ein Zeitstempelwechsel.

`[cmd]` **Beide Historien sind angebunden** — Rechte im
Permissions-Tab, Autonomy im Autonomy-Tab, jeweils unter der Kachel.

**Nicht geprüft werden konnte, dass eine echte Änderung eine Zeile
erzeugt** — dafür müsste das Schema erreichbar sein. Der Auftrag
verlangt diesen Nachweis („Setzen und neu laden … die Historie hat
eine Zeile mehr"); **er steht aus, und zwar aus dem Grund im nächsten
Abschnitt.**

---

## Der Blocker: `coach` ist nicht freigegeben

`[cmd]` **Gemessen am 2026-08-20, angemeldet als `dev@lumeos.app`**
(`tools/g90-freigabe.mjs`):

| Abfrage | Ergebnis |
|---|---|
| `coach.client_permissions` | **`Invalid schema: coach`** |
| `coach.client_autonomy` | **`Invalid schema: coach`** |
| `recovery.scores` | 170 Zeilen |
| `training.exercises` | 1.416 Zeilen |
| `goals.body_measurements` | 181 Zeilen |
| `gibtesnicht.egal` (Gegenprobe) | `Invalid schema: gibtesnicht` |

`[read]` **`coach` verhält sich wie ein Schema, das es gar nicht
gibt** — während drei andere im selben Lauf lesen. **Die Tabellen
existieren trotzdem:** C-119 legt sie an, `kette.json` führt Schritt
150, `schema-sollstand.json` führt alle sechs mit ihren Grants.

**Es fehlt die Freigabe in der Supabase-Konfiguration** (`db-schemas`),
und die ist kein SQL. `[cmd]` **Dieselbe Sperre traf G-64 bei
`training`** (Bericht 115, PGRST106) — dort wurde sie gemeldet statt
umgangen, und Tom hat sie danach gesetzt.

`[cmd]` **C-119 hat den Punkt nicht erwähnt** — der Bericht 123
enthält kein Wort zu PostgREST. Der Schritt legt das Schema an und
vergibt Grants; dass beides ohne Freigabe unerreichbar bleibt, fiel
erst beim Anbinden auf.

**Das gehört zu `supabase/` und damit zu Codex — nicht angefasst.**

### Was die Oberfläche stattdessen zeigt

`[read]` **Leerzustand, kein Attrappenmuster** — wie der Auftrag es
vorgibt (G-65). Der Unterschied ist der wichtigste im Modul: eine
Attrappe zeigt erfundene Zahlen, ein Leerzustand zeigt keine und sagt,
woran es liegt.

Im Browser steht wörtlich: *„Die Tabellen sind da, aber nicht
erreichbar. Das Schema `coach` ist für die Datenschnittstelle nicht
freigegeben — die sechs Tabellen aus C-119 existieren, PostgREST kennt
sie nicht."*

`[read]` **Der Code liest echt, sobald die Freigabe da ist.** Es ist
nichts zu ändern — kein Schalter, kein zweiter Pfad.

---

## Was der Bestätigungspfad noch bräuchte

`[cmd]` **Gebaut ist der Zustandswechsel:** `pending_actions` trägt
`preview` (Vorschau), `expires_at` (10 Minuten), `status` und
`confirmed_at`/`confirmed_by`. Die Kachel zeigt je Vorschlag die
Vorschau, die Restfrist und zwei Knöpfe; `entscheideAktion` setzt den
Status.

**Und sie prüft den Verfall, statt ihn nur anzuzeigen.** `[cmd]` Die
Pruefbedingung des Schemas deckt nur ab, dass bei `confirmed` auch
`confirmed_at` und `confirmed_by` gesetzt sind — **dass eine
abgelaufene Aktion nicht mehr bestätigt werden darf, erzwingt die
Datenbank nicht.** Das tut heute der Schreibpfad.

### Was fehlt — und das ist der Kern der Frage

**1. Es gibt keinen Ausführer.** `[read]` `payload` beschreibt, was
geschehen soll; **niemand wendet es auf das Zielmodul an.** Eine
bestätigte Aktion ändert heute ihren eigenen Status und sonst nichts.
Der Auftrag fragt, ob der Knopf mehr bräuchte als Anzeige: **ja, genau
das.**

**2. Der Verfall gehört in die Datenbank.** `[read]` Solange die
Prüfung nur im Anwendungscode steht, kann ein zweiter Schreibweg sie
umgehen. Ein `CHECK` oder ein Trigger wäre die haltbare Fassung —
Schemafrage, hier nur benannt.

**3. `action_log` ist ungenutzt.** `[cmd]` Die Tabelle trägt
`undo_data` und `undone_at`, also das Rückholmuster aus dem
Vorgängerrepo (022). **Ohne Ausführer gibt es nichts zurückzuholen.**
Sie wird gelesen, aber nie geschrieben.

**4. Niemand legt Vorschläge an.** `[cmd]` `pending_actions_insert`
erlaubt nur `auth.uid() = coach_id` — **einträge kommen aus dem
Coach-Portal**, und das ist ein eigener Arbeitsbereich
(`coach.lumeos.app`, extern verlinkt seit G-02). Bis dahin bleibt die
Kachel leer, auch mit freigegebenem Schema.

---

## Die drei Sätze aus F-04, gegengeprüft

Der Auftrag nennt sie als Prüfstein:

**„Der Klient hatte keine Stimme."** `[cmd]` Beantwortet: Rechte
nehmen Schreibzugriffe **nur vom Klienten** an, und die Oberfläche
bietet sie nur ihm. Es gibt keinen Seed, der Einwilligung vergibt —
`medical_visibility` steht per Voreinstellung auf `none`.

**„RLS war Attrappe."** `[cmd]` Beantwortet: Alle sechs Tabellen
tragen `ENABLE ROW LEVEL SECURITY` und benannte Policies, **kein
einziges `USING (true)`**. Der Kettenschritt bricht selbst ab, wenn
weniger als sechs Tabellen RLS führen.

**„Kein Mechanismus, der eine neue Antwort zwang, die alte
abzulösen."** `[read]` Teilweise beantwortet: Es gibt **eine**
Rechtetabelle und **eine** Autonomietabelle statt vier
Repräsentationen, und die Historie kommt aus einem Trigger. **Was
diese Arbeit nicht leisten kann**, ist die Garantie, dass die nächste
Welle nicht wieder danebenbaut — das ist Konsolidierungsdisziplin,
kein Codeartefakt.

---

## Nachweise

`[cmd]` **Angemeldet als `dev@lumeos.app`**, eigener Entwicklungs-
server. Bildschirmfoto bei 1440 px, Permissions-Tab: keine
Attrappenmarke, der Warnhinweis nennt die Ursache, darunter „Zwei
Achsen, zwei Zuständigkeiten" mit beiden Zuständigkeiten und die
leere Historie.

`[cmd]` **Attrappenmarken im Browser gezählt** (A-24 — nicht über
Textmarken):

| Tab | vorher | jetzt |
|---|---:|---:|
| Permissions | 7 | **0** |
| Autonomy | 13 | **0** |
| Proposals | — | **0** |

`[cmd]` **Im Text bleiben die Marken stehen, und das ist richtig:**
`tab-rechte.tsx` 5, `tab-autonomie.tsx` 11, unverändert gegenüber
HEAD. Sie sind in eigene Funktionen gewandert
(`PermissionsEntwurf` 2, `ProposalsEntwurf` 1, `AutonomyEntwurf` 8),
die nur greifen, wenn die Seite gar nichts geladen hat. **Die
Live-Pfade tragen null** (`tools/g90-marken.mjs`).

`[cmd]` **`pnpm gate` grün, 8 von 8.**

`[cmd]` **Kein Serverfehler im Browserbündel:** `/login` 200,
`/v2/coach/human` 307 (Anmeldeweiche). **Die Falle aus G-74/G-79 war
real und wurde umgangen:** `ansicht.tsx` ist `'use client'` und
brauchte `CoachRechteStand`; ein Wert-Import aus `rechte-read.ts`
hätte `next/headers` ins Browserbündel geholt. Modell und
Beschriftungen stehen deshalb in `rechte-modell.ts` (serverfrei), der
Typ kommt als `import type`.

**Nicht erbracht:** `[read]` **Setzen, neu laden, Historie prüfen** —
geht nicht ohne Freigabe des Schemas. Ebenso der Zeilenschutz-Nachweis
mit `test-user@lumeos.local`: **beide Konten sehen dasselbe, nämlich
`Invalid schema`.** Der Schutz ist in den Policies gelesen und
zitiert, **aber nicht gemessen.** Das steht aus, bis Codex das Schema
freigibt.

---

## Ein Fehler in eigener Sache

`[cmd]` **Ich habe `apps/web/.next` gelöscht** — nach der damaligen
Auftragsfassung („`.next` löschen und den Server neu starten"), bevor
die Korrektur eintraf. **Das war falsch**, und die Folge trat ein: der
Entwicklungsserver auf Port 3200 lief weiter, verlor sein
Build-Verzeichnis und antwortete danach nicht mehr. Tom hat den
Neustart selbst übernommen.

`[read]` **Die Regel, die jetzt gilt, hat einen zweiten Zahn, den ich
auch gefunden habe:** Ich bin auf einen eigenen Port mit
`LUMEOS_DIST_DIR=.next-g90` ausgewichen — sauber gegenüber dem
Dev-Server, **aber das Gate scannt jedes Verzeichnis**, und die
Vendor-Chunks darin lösten die Kodierungsprüfung aus (5 Befunde,
U+FFFD). `[cmd]` **`.next` und `.next-gate` sind die einzigen zwei
Namen, die vorgesehen sind.** Nach dem Entfernen von `.next-g90` lief
das Gate durch.

## Was nicht angefasst wurde

- **Kein Schema geändert** — nur gelesen; `supabase/` gehört Codex.
- **Keine Autonomy-Wirkung** — die Stufen werden gezeigt, nicht
  ausgewertet.
- **Kein `tab-onboarding.tsx`.**
- **`packages/ui` nicht angefasst.**
- **Kein Autonomy-Schreibweg** — das wäre der Fehler des Vorgängers.

## Hilfsskripte

Nur lesend, unter `tools/`: `g90-bestand.mjs` (die sechs Tabellen),
`g90-freigabe.mjs` (Freigabe gegen vier Vergleichsschemata),
`g90-schema-pruefen.mjs` (fehlend gegen gesperrt),
`g90-marken.mjs` (Marken je Tab-Funktion, HEAD gegen jetzt).
