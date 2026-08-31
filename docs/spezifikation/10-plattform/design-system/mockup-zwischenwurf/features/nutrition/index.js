// features/nutrition/index.js — 5 Primary Tabs × Sub-Tabs
// Tagebuch | Insights (Makros/Mikros/Targets) | Lebensmittel (Suche/Rezepte/Pläne/Eigene) | Trends | Einstellungen
window.renderNutrition = function(tab, subTab) {
  subTab = subTab || 0;
  switch(tab) {
    case 0: return window.Nutrition_DiaryView();
    case 1:
      switch(subTab) {
        case 0: return window.Nutrition_MacroDetail();
        case 1: return window.Nutrition_MicroDashboard();
        case 2: return window.Nutrition_TargetsView();
        default: return '';
      }
    case 2:
      switch(subTab) {
        case 0: return window.Nutrition_FoodSearchView();
        case 1: return window.Nutrition_RecipeList();
        case 2: return window.Nutrition_MealPlansView();
        case 3: return window.Nutrition_CustomFoodForm();
        default: return '';
      }
    case 3: return window.Nutrition_TrendsView();
    case 4: return window.Nutrition_PreferencesView();
    default: return '';
  }
};
