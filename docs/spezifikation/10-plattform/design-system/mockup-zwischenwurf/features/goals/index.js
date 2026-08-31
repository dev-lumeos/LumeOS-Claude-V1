// features/goals/index.js
// Mirrors: src/features/goals/ — dispatches tabs to view components
window.renderGoals = function(tab) {
  switch(tab) {
    case 0: return window.Goals_OverviewView();
    case 1: return window.Goals_BodyView();
    case 2: return window.Goals_TrendsView();
    case 3: return window.Goals_IntelligenceView();
    default: return '';
  }
};
