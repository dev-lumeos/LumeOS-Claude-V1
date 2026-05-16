# Recovery Module — Strategie & Markt

## Markt-Landscape

**13 Competitors analysiert** — 5 Kategorien: Wearable Ecosystems (WHOOP, Oura, Garmin, Polar), Sleep Tech (Eight Sleep), HRV Specialists (HRV4Training, Elite HRV), Stress/Wellbeing (Welltory, Calm), Muscle Recovery (NONE dedicated)

| App/Device | Preis | Stärke | Schwäche |
|---|---|---|---|
| **WHOOP** | $30/mo + Band | Bester Recovery Score, Strain Coach | Teuer, Hardware-Pflicht |
| **Oura** | $6/mo + Ring $299 | Bester Sleep Tracker | Kein Training-Kontext |
| **Garmin** | $0 + $300 Watch | Body Battery, breites Ökosystem | Watch-gebunden |
| **HRV4Training** | $10/yr | Validiertes Phone Camera HRV | Kein Nutrition/Training |
| **Eight Sleep** | $2K Pod | Beste Sleep-Optimierung | Extrem teuer, niche |

---

## Kritische Markt-Lücken

1. **Muscle-Specific Recovery = COMPLETELY UNDERSERVED** — kein Wearable trackt welche Muskelgruppe wie erholt ist
2. **Kein Recovery-App verbindet Training + Nutrition** — WHOOP kennt deinen Strain, aber nicht dein Protein
3. **HRV ohne Wearable möglich** — HRV4Training beweist es (r=0.98 vs. Chest Strap, 200K+ Users)
4. **Recovery Score ist Industry Standard** — alle haben einen — Lumeos MUSS einen haben
5. **Hardware-Zwang frustriert User** — WHOOP $30/mo + Band = hohe Einstiegshürde

---

## User Personas

### Alex — Serious Lifter ohne Wearable (35%)
- **Profil:** 27J, 5–6×/Woche Training, kein WHOOP ($30/mo zu teuer)
- **Pain:** Will wissen ob er heute trainieren sollte, ohne $300 auszugeben
- **Needs:** Muscle Recovery Map, Phone Camera HRV, Training Load Tracking, Sleep Logging
- **Zahlungsbereitschaft:** $9.99/mo (deutlich günstiger als WHOOP)

### Sandra — Oura/WHOOP User (25%)
- **Profil:** 34J, CrossFit + Running, hat Wearable
- **Pain:** WHOOP zeigt Recovery Score aber weiß nicht was sie gegessen hat
- **Needs:** Wearable Sync, Cross-Module Insights, Muscle Recovery, Nutrition×Recovery
- **Zahlungsbereitschaft:** $9.99/mo zusätzlich zu Wearable

### Peter — Sleep Optimizer (25%)
- **Profil:** 45J, Manager, Schlafprobleme
- **Pain:** Oura zeigt Schlafdaten aber keine Empfehlungen basierend auf Supplementen
- **Needs:** Sleep Analysis, Supplement Correlation (Magnesium, Melatonin), Caffeine Tracking
- **Zahlungsbereitschaft:** $9.99/mo

### Lisa — Injury Recovery (15%)
- **Profil:** 30J, nach Kreuzband-OP
- **Pain:** Will Reha-Fortschritt tracken, sicherer Trainingsrückkehr
- **Needs:** Injury Tracking, Recovery Timeline, Modified Training Suggestions
- **Zahlungsbereitschaft:** $9.99/mo (temporär)

---

## Lumeos USPs

### Primary USP: "Recovery That Knows Your Training, Nutrition, and Body — Not Just Your Heart Rate"

WHOOP weiß dass dein HRV niedrig ist.
**Lumeos weiß WARUM:**
- Training-Volumen war 30% über MAV letzte Woche
- Protein 40g unter Ziel gestern
- Ferritin gefallen laut Bluttest
- Nur 5.5h geschlafen

**→ Und empfiehlt konkret:** Deload-Woche + Eisen supplementieren + 22:00 Schlafenszeit

### Secondary USPs

1. **Muscle-Specific Recovery Map** — "Quads 47% → kein Leg Day heute". Kein Competitor hat das.
2. **Kein Wearable nötig** — Phone Camera HRV (validated). WHOOP $30/mo + Band. Lumeos $9.99/mo.
3. **Cross-Module Recovery** — "Score steigt +15% bei >30g Protein zum Abendessen"

---

## Kompetitive Positionierung

| Kriterium | WHOOP | Oura | Garmin | HRV4Training | **LumeOS** |
|---|:---:|:---:|:---:|:---:|:---:|
| Recovery Score | ✅ | ✅ | ✅ (Body Battery) | 🟡 | ✅ |
| Sleep Tracking | ✅ | ✅ (Best) | ✅ | ❌ | ✅ |
| HRV | ✅ | ✅ | ✅ | ✅ | ✅ (Phone!) |
| **Muscle Recovery** | ❌ | ❌ | ❌ | ❌ | **✅** |
| Training Integration | 🟡 | ❌ | 🟡 | ❌ | **✅ Deep** |
| Nutrition Integration | ❌ | ❌ | ❌ | ❌ | **✅** |
| Kein Wearable nötig | ❌ | ❌ | ❌ | ✅ | **✅** |
| Preis | $30/mo + Band | $6/mo + $299 | $0 + $300 | $10/yr | **$9.99/mo** |

---

## Key Design-Entscheidungen

| Entscheidung | Rationale |
|---|---|
| Morning Check-in <30s | Tägliche Compliance nur bei sehr geringem Aufwand |
| 3 Score-Modi (manual/hrv/wearable) | Progressive Enhancement — Score besser mit Daten, nie schlechter ohne |
| Muscle-Specific Recovery als Killer Feature | Kein Competitor — Training-Modul liefert die Daten |
| Apple HealthKit + Google Health Connect first | 2 Integrationen decken ~90% aller Wearable-User |
| ACWR für Training Load Score | Industry Standard, evidenzbasiert |
| Trigger für Score nach Checkin | Score immer aktuell, kein manuelles Refresh |
| Modality Bonus capped bei 5 | Verhindert Score-Manipulation durch excessive Logging |
| Übertraining: Signal-Kombination | Einzelne Signale normal, Kombination = Problem |
