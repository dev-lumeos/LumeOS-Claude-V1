// Erzeugt 024_suchsynonyme.sql aus den beiden Quellen.
// Die Ableitung passiert hier, damit sie nachvollziehbar ist; der
// Kettenschritt traegt das Ergebnis.
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'

const C = 'supabase_db_LumeOS-Claude-V1'
function sql(q) {
  return execFileSync('docker',
    ['exec', '-i', C, 'psql', '-U', 'postgres', '-d', 'postgres', '-q', '-t', '-A', '-c', q],
    { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 })
}

// Faltung wie nutrition.search_fold seit 072.
const falte = s => s.toLowerCase()
  .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()

const bestand = new Set(
  sql(`SELECT DISTINCT lower(w) FROM nutrition.foods f,
         unnest(regexp_split_to_array(
           regexp_replace(f.name_de, '[^[:alpha:] ]', ' ', 'g'), '\\s+')) AS w
       WHERE length(w) >= 3`).trim().split('\n').map(s => s.trim()).filter(Boolean))

// --- 1. Thesaurus, gerichtet gefiltert ---
const gruppen = fs.readFileSync('docs/ssot/daten/quellen/openthesaurus.txt', 'utf8')
  .split('\n').filter(z => z && !z.startsWith('#'))
  .map(z => z.split(';')
    .map(t => t.replace(/\([^)]*\)/g, '').trim())
    .filter(t => t && !t.includes(' '))
    .map(t => t.toLowerCase()))
  .filter(g => g.length >= 2)

const paare = new Map()
for (const g of gruppen) {
  const drin = g.filter(t => bestand.has(t))
  const draussen = g.filter(t => !bestand.has(t))
  if (!drin.length || !draussen.length) continue
  for (const f of draussen) {
    if (f.length < 4) continue
    const fk = falte(f)
    if (!fk || fk.includes(' ')) continue
    if (!paare.has(fk)) paare.set(fk, new Set())
    for (const d of drin) {
      const dk = falte(d)
      if (dk && !dk.includes(' ') && dk !== fk) paare.get(fk).add(dk)
    }
  }
}
for (const [k, v] of [...paare]) if (!v.size) paare.delete(k)

// --- 2. Handarbeit: die Bruecken, die keine Quelle liefert ---
const HAND = [
  ['haehnchen', 'huhn',            'BLS benutzt haehnchen 105x; Thesaurus kennt nur Huhn'],
  ['huehnchen', 'haehnchen',       'Umgangssprache, in keiner Quelle'],
  ['huehner',   'haehnchen',       'Pluralstamm, entsteht beim Zerlegen von huehnerbrust'],
  ['huhn',      'haehnchen',       'Gegenrichtung: der BLS fuehrt ueberwiegend haehnchen'],
  ['poulet',    'haehnchen',       'Schweiz; Thesaurus zeigt auf huhn, der BLS fuehrt haehnchen'],
  ['hendl',     'haehnchen',       'Oesterreich/Bayern'],
  ['chicken',   'haehnchen',       'englisch; der Alias traegt nur den vollen Namen'],
  ['schwein',   'schweinefleisch', 'BLS trennt "Schwein Fleisch"'],
  ['rind',      'rindfleisch',     'wie oben'],
  ['truthahn',  'pute',            'beide gebraeuchlich, BLS fuehrt Pute'],
  ['kalb',      'kalbfleisch',     'wie Schwein/Rind'],
  ['lamm',      'lammfleisch',     'wie Schwein/Rind'],
]

// --- 3. Zusammenfuehren, Handarbeit gewinnt ---
const alle = new Map()
for (const [f, ziele] of paare) alle.set(f, { ziele: [...ziele], quelle: 'openthesaurus' })
for (const [f, ziel, grund] of HAND) {
  const vorhanden = alle.get(f)
  alle.set(f, {
    ziele: vorhanden ? [...new Set([ziel, ...vorhanden.ziele])] : [ziel],
    quelle: 'handarbeit',
    grund,
  })
}

const esc = s => s.replace(/'/g, "''")
const zeilen = [...alle].sort((a, b) => a[0].localeCompare(b[0]))
  .map(([f, v]) =>
    `  ('${esc(f)}', ARRAY[${v.ziele.map(z => `'${esc(z)}'`).join(',')}], '${v.quelle}', ` +
    `'${esc(v.grund ?? 'Gruppe enthaelt ein Bestandswort')}')`)

const kopf = `-- =============================================================
-- 024 — Suchsynonyme: Thesaurus (gefiltert) und Handarbeit
-- Datum: 2026-08-14 · Laeuft NACH 023. Idempotent.
-- Grundlagen: docs/ssot/41-… und 43-…
-- =============================================================
--
-- ANLASS: \`[cmd]\` Toms Ausgangsfall — "huehnerbrust" liefert nichts.
-- 15 von 71 geprueften Alternativbezeichnungen laufen ins Leere,
-- ueberwiegend Mundart und Umgangssprache.
--
-- =============================================================
-- QUELLE 1: OpenThesaurus, GERICHTET gefiltert
-- =============================================================
-- Bezogen von https://www.openthesaurus.de/export/OpenThesaurus-Textversion.zip
-- am 2026-08-14. Lizenz: LGPL oder CC-BY-SA 4.0 (Wahl des Nutzers),
-- Lizenztext in docs/ssot/daten/quellen/openthesaurus-LICENSE.txt.
-- \`[read]\` Lokal unkritisch; die Angabe steht hier, weil sie bei einem
-- spaeteren Deployment gebraucht wird.
--
-- DIE FALLE, gemessen statt vermutet: Ein Thesaurus kennt ALLE
-- Bedeutungen. \`[cmd]\` Ungefiltert liefert er
--   kartoffel -> mof, piefke, boche, deutscher, teutone
--   quark     -> scheisse, quatsch, unfug, blödsinn
--   brust     -> titte, busen, mamma
-- \`[cmd]\` Der naheliegende Filter "Gruppe beruehrt den Bestand" reicht
-- NICHT: er laesst 17 von 20 Stichproben Unsinn durch, weil dieselbe
-- Gruppe beides enthaelt.
--
-- WAS STATTDESSEN TRAEGT — die RICHTUNG:
-- Uebernommen wird nur \`fremdes Wort -> Bestandswort\`. Eine Beleidigung
-- ist nie das ZIEL einer Suche, sondern hoechstens die Eingabe. Wer
-- "Piefke" tippt, bekommt Kartoffeln — unschoen, aber harmlos; wer
-- "Kartoffel" tippt, bekommt niemals "Piefke" angezeigt.
-- \`[cmd]\` Ergebnis: 48.427 Gruppen -> ${alle.size - HAND.length} gerichtete Eintraege.
-- \`[cmd]\` Kein Eintrag zeigt auf mehr als vier Ziele — die Zuordnung ist
-- von sich aus spezifisch, eine Ausschlussliste war nicht noetig.
--
-- \`[cmd]\` VERWORFEN: ein zusaetzlicher Kontexttest ("mindestens die
-- Haelfte der Gruppe steht im Bestand") liess nur 99 Eintraege uebrig
-- und warf dabei karfiol, marille, paradeiser und poulet mit weg — er
-- entfernte mehr Richtiges als Falsches.
--
-- =============================================================
-- QUELLE 2: Handarbeit, ${HAND.length} Eintraege
-- =============================================================
-- \`[cmd]\` "haehnchen" steht in KEINER Quelle — weder im Thesaurus noch
-- im Zerlegewoerterbuch. Ausgerechnet das Wort, das der BLS 105x
-- benutzt, haeufiger als Huhn (68). Diese Bruecke kann nur von Hand
-- kommen. Jeder Eintrag traegt seinen Grund in \`grund\`.
--
-- \`[read]\` Tom hat angemerkt, "Haehnchen" benutze niemand — er ist in
-- der Schweiz, dort heisst es Poulet. Das Wort bleibt trotzdem, weil
-- der BESTAND es benutzt; "poulet" zeigt darauf.
-- =============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS nutrition.search_synonyms (
  term     TEXT PRIMARY KEY,
  targets  TEXT[] NOT NULL,
  source   TEXT NOT NULL CHECK (source IN ('openthesaurus','handarbeit')),
  grund    TEXT NOT NULL
);

COMMENT ON TABLE nutrition.search_synonyms IS
  'Gerichtete Suchsynonyme: term (was der Nutzer tippt) -> targets '
  '(Woerter, die im Bestand vorkommen). Alle Werte gefaltet wie '
  'nutrition.search_fold. Erzeugt von Kettenschritt 024.';

TRUNCATE nutrition.search_synonyms;

INSERT INTO nutrition.search_synonyms (term, targets, source, grund) VALUES
${zeilen.join(',\n')};

ALTER TABLE nutrition.search_synonyms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS search_synonyms_select ON nutrition.search_synonyms;
CREATE POLICY search_synonyms_select ON nutrition.search_synonyms
  FOR SELECT TO authenticated USING (true);
GRANT SELECT ON nutrition.search_synonyms TO authenticated, service_role;

CREATE INDEX IF NOT EXISTS idx_search_synonyms_term
  ON nutrition.search_synonyms (term);

DO $$
DECLARE v_n int; v_hand int;
BEGIN
  SELECT COUNT(*) INTO v_n FROM nutrition.search_synonyms;
  SELECT COUNT(*) INTO v_hand FROM nutrition.search_synonyms WHERE source='handarbeit';
  IF v_n < 1000 THEN RAISE EXCEPTION 'Nur % Synonyme — Quelle unvollstaendig?', v_n; END IF;
  IF v_hand < 10 THEN RAISE EXCEPTION 'Handarbeit fehlt: %', v_hand; END IF;
  -- Toms Fall muss abgedeckt sein.
  IF NOT EXISTS (SELECT 1 FROM nutrition.search_synonyms
                  WHERE term='huehner' AND 'haehnchen' = ANY(targets)) THEN
    RAISE EXCEPTION 'huehner -> haehnchen fehlt';
  END IF;
  RAISE NOTICE 'OK: % Synonyme, davon % von Hand', v_n, v_hand;
END $$;

COMMIT;
`

fs.writeFileSync('supabase/_pipeline/02_human_layer/024_suchsynonyme.sql', kopf)
console.log('024_suchsynonyme.sql geschrieben')
console.log('  Eintraege gesamt :', alle.size)
console.log('  davon Handarbeit :', HAND.length)
console.log('  Zeilen           :', kopf.split('\n').length)
