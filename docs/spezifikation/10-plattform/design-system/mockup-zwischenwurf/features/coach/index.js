// features/coach/index.js — updated with Watcher tab
window.renderCoach = function(tab) {
  switch(tab) {
    case 0: return window.Coach_ChatInterface();
    case 1: return window.Coach_DecisionFeed();
    case 2: return window.Coach_TrendsView();
    case 3: return window.Coach_MemoryView();
    case 4: return window.Coach_WatcherView();
    default: return '';
  }
};
