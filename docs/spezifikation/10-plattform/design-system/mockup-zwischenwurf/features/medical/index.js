// features/medical/index.js
// Mirrors: src/features/medical/ — dispatches tabs to view components
window.renderMedical = function(tab) {
  switch(tab) {
    case 0: return window.Medical_OverviewView();
    case 1: return window.Medical_LabsView();
    case 2: return window.Medical_MedicationsView();
    default: return '';
  }
};
