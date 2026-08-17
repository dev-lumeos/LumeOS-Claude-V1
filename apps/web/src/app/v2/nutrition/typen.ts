// Die Typen der Nutrition-Tabs.
//
// Sie beschreiben die Daten der Vorlage, nicht das Schema — `plans`,
// `prefs` und `planner` haben keine Tabelle. `[cmd]` Deshalb tragen die
// Tabs weiterhin den Attrappen-Hinweis: gebaut ist die Oberflaeche,
// angebunden ist nichts.

export type DietTag = {
  code: string
  de: string
  type: string
  rule: string
}

/** Der Zustand eines geplanten Eintrags gegen die Wirklichkeit. */
export type GhostStatus = 'confirmed' | 'deviated' | 'skipped' | 'pending'

export type GhostEntry = {
  id: string
  meal: string
  time: string
  plan: string
  items: string[]
  status: GhostStatus
  kcal: number
  note?: string
}

/** Wie eine Vorliebe gewichtet wird — die Vorlage kennt drei Stufen. */
export type Neigung = 'like' | 'neutral' | 'dislike'
