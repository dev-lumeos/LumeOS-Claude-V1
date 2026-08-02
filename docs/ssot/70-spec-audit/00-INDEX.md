# Spec-Audit — Übersicht (D-05)

**Stand:** 2026-08-02 (erste Fassung, autonome Sitzung) · **Ankerhash:** 76c8080
**Methode:** `[cmd]` Ordnerlisten aller 13 Module; alle INDEX-/README-Dateien
gelesen; Zählprüfungen (`CREATE TABLE` in SPEC_06 vs. Entity-Überschriften in
SPEC_02 vs. INDEX-Behauptungen); Querschnitts-Greps (CONSOLIDATED_KNOWLEDGE,
Next.js-Version, Ports, packages/scoring, apps/app, apps/mobile, apps/staff);
Gerüst-Abgleich gegen `apps/`, `services/`, `packages/`. **Nicht geleistet:**
Feld-für-Feld-Abgleich Entities↔DB↔API innerhalb der Module (als `[annahme]`
markiert, Folgearbeit). Die Vorbefunde aus `40-spec-code-matrix.md` wurden
nicht übernommen, sondern neu erhoben; wo sie sich bestätigen, ist das vermerkt.

---

## Je-Modul-Akten

| Modul | Datei | Schema komplett? | Härtester Befund |
|---|---|---|---|
| Admin | `Admin.md` | nein (1 von 10 Slots) | 3 konkurrierende Alt-Specs, Port 4100, „Komplett"-Claims aus Vorgängerrepo |
| BuddyandAICoach | `BuddyandAICoach.md` | ja (01–11) | INDEX: 9 tote Übersichtsdateien + falsches `spec/`-Präfix |
| Core | `Core.md` | n.a. (3 ADRs) | heimatlos, nirgends eingebunden |
| Dashboard | `Dashboard.md` | nein (Checkliste) | Doppelquelle zu WebPlatform/SPEC_03 |
| Goals | `Goals.md` | eigenes Schema | Vorgängerrepo-Pfade (`apps/app`, `src/api`); einziges Modul mit echtem CONSOLIDATED_KNOWLEDGE |
| HumanCoach | `HumanCoach.md` | ja (01–11) | sauberster Standardordner; toter CONSOLIDATED-Link |
| Marketplace | `Marketplace.md` | ja (01–11) | `apps/marketplace` als Bestand deklariert, existiert nicht |
| Medical | `Medical.md` | ja (01–10) | **10 Entities vs. 8 Tabellen — 2 Entities ohne Schema** |
| Nutrition | `Nutrition.md` | ja (01–10 + Schichten) | reifstes Modul; BLOCKED_BY_PRODUCT_GATE; Portfehler 5200/5300 im WO-Plan |
| Recovery | `Recovery.md` | ja (01–10) | Score-Formeln auf 3 Orte verteilt, einer existiert nicht |
| Supplements | `Supplements.md` | ja (01–10) | von Nutrition-WO-Plan unter falschem Port gerufen |
| Training | `Training.md` | ja (01–10) | Bestandszahlen (1.200 Übungen, R2 ~15 GB) ohne Repo-Substanz; Medienort widerspricht TODO-E-Befund (Supabase) |
| WebPlatform | `WebPlatform.md` | eigenes UI-Schema | 117 vs. 138 Nährstoffe; einzige „Next.js 14+"-Quelle neben Admin |

---

## Modulübergreifende Widersprüche (verifiziert)

1. **Modulzählung unversöhnt** `[cmd]`: Master Vision „Alle 10 Module" ·
   WebPlatform „alle 11 Module" bzw. „7 Core + Dashboard" · 13 Spec-Ordner.
2. **Next.js 14+ vs. 15** `[cmd]`: 10 Quellen sagen 15, WebPlatform-INDEX und
   Admin-INDEX sagen 14+; `apps/web` läuft real auf 14. Entscheidung nötig,
   dann repo-weit angleichen.
3. **CONSOLIDATED_KNOWLEDGE.md** `[cmd]`: in 7 INDEX-Dateien referenziert
   (Buddy, HumanCoach, Marketplace, Medical, Recovery, Supplements, Training),
   existiert genau einmal — in Goals. Bestätigt den Vorbefund.
4. **Port-Schema** `[cmd]`: Services konsistent 5100 Nutrition · 5200 Training ·
   5300 Supplements · 5400 Recovery · 5500 Buddy · 5600 HumanCoach ·
   5700 Marketplace · 5800 Medical · 5900 Goals; Apps 8502 Coach / 8503
   Marketplace. **Ausreisser:** Admin 4100 (ausserhalb des Schemas) und der
   Fehler `supplements:5200` im Nutrition-WO-Plan (Z. 47, 134).
5. **`packages/scoring`** `[cmd]`: von 10 Modulen als Implementierungsort
   deklariert (28+ Fundstellen), im Repo existiert kein solches Package.
   Admin-Backend-Spec behauptet sogar, es sei „bereits mit Tests gebaut" —
   auf dem Mini-PC des Vorgängersetups.
6. **`apps/app` vs. `apps/web`** `[cmd]`: 14 Spec-Dateien referenzieren eine
   App `apps/app`, die es nicht gibt. Nur WebPlatform benennt `apps/web` korrekt.
   `apps/marketplace` fehlt als Gerüst, wird aber vom Marketplace-INDEX als
   Bestand deklariert. Umgekehrt: `[cmd]` `apps/mobile` kommt im gesamten
   Spec-Baum genau einmal vor (Abgrenzungssatz in `WebPlatform/SPEC_01:57`),
   `apps/staff` **null** Mal — beide Gerüste existieren ohne jede Spec.
7. **117 vs. 138 Nährstoffe** `[cmd]`: WebPlatform-Specs (3 Stellen) vs.
   138 in Nutrition-SPEC_06 und Live-DB. Quelle der App-Shell-Literale (C-10)
   ist damit die Spec.

---

## Was einer „offiziellen Spec je Modul" generell im Weg steht

1. Kein Modul deklariert eine SSOT-Datei oder Versionsstände (ausser Nutrition
   mit Statuskopf und Review-Kette — das Muster taugt als Vorlage).
2. INDEX-Dateien sind teils blind (Admin), teils tot verlinkt (Buddy + 6×
   CONSOLIDATED) — ein Freigabe-Prozess bräuchte zuerst verlässliche Indizes.
3. Ist/Soll-Vermischung: Bestandsbehauptungen aus dem Vorgängerrepo
   (Training-Medien, Admin „Komplett", Goals-Code-Referenzen) stehen
   unmarkiert neben echtem Zielbild.
4. Die Infrastruktur-Annahmen (packages/scoring, packages/contracts,
   apps/app, globalAuthMiddleware, Hono-Services) existieren im Repo nur als
   leere Gerüste oder gar nicht — jede Spec-Freigabe wäre derzeit eine
   Freigabe gegen nicht existente Fundamente.

## Empfohlene Folgearbeit (offen, Toms Entscheidung)

- Feldabgleich Entities↔DB↔API je Modul (aufwendig; Medical zuerst, dort ist
  der Bruch nachgewiesen).
- Entscheidung Modulkanon (10/11/13) und Verzeichnis = Kanon herstellen.
- Entscheidung Next.js 14 vs. 15.
- Die 7 toten CONSOLIDATED-Verweise entfernen oder Dateien rekonstruieren.
- Nutrition-Muster (Statuskopf, ADRs, Reviews) auf andere Module übertragen.
