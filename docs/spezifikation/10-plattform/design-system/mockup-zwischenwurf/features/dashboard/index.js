// features/dashboard/index.js
// Mirrors: src/features/dashboard/ — dispatches tabs to view components
window.renderDashboard = function(tab) {
  switch(tab) {
    case 0: return window.Dashboard_TodayView();
    case 1: return window.Dashboard_InsightsView();
    case 2: return window.Dashboard_IntelligenceView();
    default: return '';
  }
};
