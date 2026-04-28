// features/supplements/index.js
// Mirrors: src/features/supplements/ — dispatches tabs to view components
window.renderSupplements = function(tab) {
  switch(tab) {
    case 0: return window.Supplements_TodayView();
    case 1: return window.Supplements_StackView();
    case 2: return window.Supplements_EnhancedView();
    default: return '';
  }
};
