// features/analytics/index.js
// Mirrors: src/features/analytics/ — dispatches tabs to view components
window.renderAnalytics = function(tab) {
  switch(tab) {
    case 0: return window.Analytics_OverviewView();
    case 1: return window.Analytics_ChartsView();
    case 2: return window.Analytics_ReportsView();
    default: return '';
  }
};
