// features/training/index.js — 7 Primary Tabs × Sub-Tabs = 22 Screen-States
window.renderTraining = function(tab, subTab) {
  subTab = subTab || 0;
  switch(tab) {
    case 0: // 💪 Training
      switch(subTab) {
        case 0: return window.Training_WorkoutStart();
        case 1: return window.Training_QuickLog();
        case 2: return window.Training_Templates();
        default: return '';
      }
    case 1: // 📚 Übungen
      switch(subTab) {
        case 0: return window.Training_ExerciseBrowse();
        case 1: return window.Training_ExerciseCategories();
        default: return '';
      }
    case 2: // 📊 Fortschritt
      switch(subTab) {
        case 0: return window.Training_HistoryView();
        case 1: return window.Training_StatsView();
        case 2: return window.Training_CalendarView();
        case 3: return window.Training_InsightsView();
        default: return '';
      }
    case 3: // 🎯 Programme
      switch(subTab) {
        case 0: return window.Training_RoutineList();
        case 1: return window.Training_CoachRoutines();
        case 2: return window.Training_ScheduleView();
        case 3: return window.Training_PeriodizationView();
        default: return '';
      }
    case 4: // 🧘 Erholung
      switch(subTab) {
        case 0: return window.Training_RecoveryIntel();
        case 1: return window.Training_MusclesView();
        case 2: return window.Training_BodyComposition();
        default: return '';
      }
    case 5: // 📈 Analytik
      switch(subTab) {
        case 0: return window.Training_AnalyticsOverview();
        case 1: return window.Training_StrengthView();
        case 2: return window.Training_VolumeView();
        case 3: return window.Training_RecordsView();
        case 4: return window.Training_ToolsView();
        default: return '';
      }
    case 6: return window.Training_SettingsView();
    default: return '';
  }
};
