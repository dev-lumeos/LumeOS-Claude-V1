// Gemeinsame Stelle für zod-Schemas (M2-Fundament, 2026-08-04).
// Konvention: Eingabe- und API-Schemas liegen unter src/lib/schemas/,
// ein Modul je Fachbereich (z. B. nutrition.ts), hier re-exportiert.
export { z } from 'zod'
export * from './login'
