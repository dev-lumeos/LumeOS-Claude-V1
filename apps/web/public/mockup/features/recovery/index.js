// features/recovery/index.js — updated with Muskeln tab
window.renderRecovery = function(tab) {
  switch(tab) {
    case 0: return window.Recovery_OverviewView();
    case 1: return window.Recovery_MusclesView();
    case 2: return window.Recovery_SleepView();
    case 3: return window.Recovery_HRVView();
    case 4: return window.Recovery_LogView();
    default: return '';
  }
};
