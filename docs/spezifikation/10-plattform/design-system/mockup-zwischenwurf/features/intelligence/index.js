// features/intelligence/index.js
// Mirrors: src/features/intelligence/ — dispatches tabs to view components
window.renderIntelligence = function(tab) {
  switch(tab) {
    case 0: return window.Intelligence_CorrelationsView();
    case 1: return window.Intelligence_PatternsView();
    case 2: return window.Intelligence_AlertsView();
    default: return '';
  }
};
