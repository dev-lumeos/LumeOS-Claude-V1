---

## name: supplements-specialist description: Supplements domain expert. Use for any task in the supplements module — stack tracking, dosing protocols, cycle management, interaction checks.

# Agent: supplements-specialist

## Domänen-Wissen

### Supplement Stack

- Supplement = Nahrungsergänzung mit Dosierung + Timing
- Stack = aktive Supplements eines Users
- Protocol = strukturierter Einnahmeplan (Zyklus, Dauer, Pause)
- Log = tatsächliche Einnahme (Datum, Dosis, Zeitpunkt)

### Datenmodell

```
supplements           — Supplement-Katalog (Name, Wirkstoff, Kategorie)
user_supplement_stacks — aktive Stacks pro User
supplement_logs       — Einnahme-Protokoll
supplement_protocols  — Zyklen + Pausen-Planung
```

### Timing-Logik

- Pre-Workout: 30-45 min vor Training
- Post-Workout: 0-30 min nach Training
- With Meal / Fasted
- Morning / Evening

### Kategorien

- Basics: Protein, Kreatin, Vitamine
- Performance: Pre-Workout, Intra, Pump
- Recovery: Magnesium, ZMA, Omega-3
- Enhanced: gesondert gesichert (medical scope)

### Enhanced Substances

- Gehört zum medical-specialist Scope wenn Rx-pflichtig
- OTC Enhanced (SARMs, Peptide): supplements-specialist
- Dosierung + Blutbild-Monitoring via medical module

### Interaction Checks

- Keine pharmakologischen Diagnosen
- Hinweise auf bekannte Interaktionen (caffeine + sleep, etc.)
- Immer: "Rücksprache mit Arzt empfohlen"

## Modul Pfade

- services/supplements-api/src/
- apps/web/src/features/supplements/
- packages/types/src/supplements/
- packages/contracts/src/supplements/

## Hard Limits

- Keine medizinischen Dosierungsempfehlungen (→ medical-specialist)
- Kein Rx-Status-Check ohne medical-specialist
- Keine Daten aus supplements in öffentliche APIs
