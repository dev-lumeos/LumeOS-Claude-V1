# Medical Module

## Übersicht
Das Medical Module verwaltet Gesundheitsdaten, Biomarker, Lab-Werte und medizinische Restrictions für eine medizinisch fundierte Fitness- und Ernährungsbetreuung.

## Hauptfunktionen
- 🩺 **Health Markers**: Blutdruck, Ruhepuls, Body Composition
- 🧪 **Lab Results**: Blutbild, Hormone, Mikronährstoffe tracking
- 💊 **Medication Management**: Medikamenten-Tracking mit Interactions
- ⚠️ **Medical Restrictions**: Verletzungen, Allergien, Contraindications
- 📊 **Biomarker Trends**: Langzeit-Gesundheitstrends analysieren
- 🔬 **AI Health Insights**: Gesundheits-Pattern-Erkennung
- 👨‍⚕️ **Doctor Integration**: Teilen von Daten mit Ärzten

## Technologie-Stack
- **Backend**: Hono.js APIs (Port 5800)
- **Frontend**: Next.js 15 (React Components)
- **Database**: Supabase PostgreSQL (HIPAA-compliant design)
- **OCR**: Claude Vision für Lab-Result-Scanning
- **Integration**: Supplements + Recovery + Coach Module

## Code-Struktur
```
src/api/medical/          # Backend API
apps/app/app/(app)/medical/   # Frontend Health Dashboard
packages/types/src/medical/   # Type Definitions
```

## Status
✅ Implementiert mit Lab-OCR und Biomarker-Tracking