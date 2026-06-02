import { Card, EmptyState, ModuleCard } from '../../components/ui/cards'
import { PageHeader, SectionHeader } from '../../components/ui/page-header'
import { StatusBadge } from '../../components/ui/status-badge'

const macroStrip = [
  { label: 'Calories', current: '0', target: '2400', unit: 'kcal' },
  { label: 'Protein', current: '0', target: '180', unit: 'g' },
  { label: 'Carbs', current: '0', target: '240', unit: 'g' },
  { label: 'Fat', current: '0', target: '70', unit: 'g' },
]

const mealSlots = [
  { name: 'Breakfast', time: '08:30', state: 'leer', note: 'Noch kein live Diary Logging.' },
  { name: 'Lunch', time: '12:30', state: 'leer', note: 'Food Search ist separat verfügbar.' },
  { name: 'Dinner', time: '19:00', state: 'leer', note: 'Keine Add-Meal- oder Save-Aktion in Phase 1B.' },
]

const foundationCards = [
  { title: 'Foods', description: 'BLS-basierte Food Foundation als Review-Scope. Keine Live-Userdaten.', status: 'Candidate', tone: 'candidate' as const },
  { title: 'Aliases', description: 'Alias-Schicht bleibt Kandidatenmaterial und braucht Review.', status: 'Review', tone: 'candidate' as const },
  { title: 'Tags', description: 'Tag-Definitionen und Food Tags sind Foundation-Kontext.', status: 'Candidate', tone: 'candidate' as const },
  { title: 'Preferences', description: 'Präferenzen, Likes/Dislikes und Ausschlüsse bleiben Produktlogik-Kandidaten.', status: 'Candidate', tone: 'candidate' as const },
]

const boundaryRows = [
  { label: 'Datenquelle', text: 'Nur Bundeslebensmittelschlüssel, kein USDA und kein OpenFoodFacts.', status: 'BLS-only', tone: 'readonly' as const },
  { label: 'Foundation DB Schema', text: 'Kandidatenmaterial für Review, nicht Product Truth.', status: 'Candidate', tone: 'candidate' as const },
  { label: 'Broad Nutrition DB', text: 'Meals, Recipes, MealCam, Planner und Shopping bleiben Backlog.', status: 'Blockiert', tone: 'blocked' as const },
]

export default function NutritionEntryPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        badges={[
          { label: 'Diary default', tone: 'candidate' },
          { label: 'BLS-only', tone: 'readonly' },
          { label: 'Nicht live', tone: 'mock' },
        ]}
        description="Nutrition startet gemäß WebPlatform Source-Spec diary-first. Die Fläche ist read-only, zeigt keine Live-Mahlzeiten und bietet sichere Links zu Food Search, Preferences und Foundation-Review."
        eyebrow="Nutrition"
        title="Nutrition Diary"
      />

      <section>
        <SectionHeader kicker="Tabs laut Spec" title="Nutrition Navigation" />
        <div className="lume-tab-row">
          <span className="lume-tab-pill lume-tab-pill-active">Diary · /nutrition</span>
          <a className="lume-tab-pill" href="/nutrition/foods">Foods · Food Search</a>
          <span className="lume-tab-pill">Planner · später</span>
          <span className="lume-tab-pill">Insights · später</span>
        </div>
      </section>

      <section>
        <SectionHeader kicker="Heute" title="Diary Placeholder" />
        <Card accent="var(--acc-nutri)" title="Macro-KPI-Strip" sub="Read-only Mock">
          <div className="lume-macro-strip">
            {macroStrip.map((item) => (
              <div className="lume-macro-kpi" key={item.label}>
                <div className="lume-small-label">{item.label}</div>
                <div className="mt-2">
                  <span className="num text-[24px] font-semibold text-[var(--fg)]">{item.current}</span>
                  <span className="ml-1 text-[12px] text-[var(--fg-subtle)]">/ {item.target} {item.unit}</span>
                </div>
                <div className="mt-3 lume-progress">
                  <span style={{ width: '0%' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="lume-grid-2">
        <Card title="Meal List" sub="Kein Logging">
          <div className="space-y-3">
            {mealSlots.map((meal) => (
              <div className="lume-meal-card" key={meal.name}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[15px] font-semibold text-[var(--fg)]">{meal.name}</h3>
                    <div className="mt-1 text-[12px] text-[var(--fg-subtle)]">{meal.time} · {meal.note}</div>
                  </div>
                  <StatusBadge tone="mock">{meal.state}</StatusBadge>
                </div>
                <div className="mt-4 lume-meal-row">
                  <span>Food Item</span>
                  <span className="num">Protein</span>
                  <span className="num">Carbs</span>
                  <span className="num">Fat</span>
                  <span className="num">kcal</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Sichere Einstiegspunkte" sub="Bestehende UI erhalten">
          <div className="grid gap-3">
            <ModuleCard
              description="Erhaltene BLS Food Search mit Preference-aware Preview und Food Detail."
              href="/nutrition/foods"
              meta="Foods Tab"
              status="Read-only"
              title="Food Search"
              tone="readonly"
            />
            <ModuleCard
              description="Redirect auf Food Search, weil dort die Preference Preview sichtbar bleibt."
              href="/nutrition/preferences"
              meta="Preferences"
              status="Redirect"
              title="Preferences Preview"
              tone="readonly"
            />
          </div>
        </Card>
      </section>

      <section className="lume-grid-3">
        {boundaryRows.map(({ label, status, text, tone }) => (
          <Card accent="var(--acc-nutri)" key={label} title={label} sub="Boundary">
            <p className="text-[13px] leading-6 text-[var(--fg-muted)]">{text}</p>
            <div className="mt-4">
              <StatusBadge tone={tone}>{status}</StatusBadge>
            </div>
          </Card>
        ))}
      </section>

      <section>
        <SectionHeader kicker="Foundation Scope" title="BLS Foundation und Backlog" />
        <div className="lume-grid-4">
          {foundationCards.map(({ description, status, title, tone }) => (
            <Card key={title}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="lume-small-label">Nutrition</div>
                  <h3 className="mt-1 text-[15px] font-semibold text-[var(--fg)]">{title}</h3>
                </div>
                <StatusBadge tone={tone}>{status}</StatusBadge>
              </div>
              <p className="mt-3 text-[13px] leading-6 text-[var(--fg-muted)]">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader kicker="Safety" title="Keine DB-Write-Actions" />
        <EmptyState
          description="Diary, Planner, MealCam und Targets werden nicht als live behauptet. Diese Seite enthält keine Add-Meal-, Save- oder Recalc-Aktion und schreibt keine Foods, Preferences, Diary Logs oder Targets."
          title="Read-only Nutrition Diary Draft"
        />
      </section>
    </div>
  )
}
