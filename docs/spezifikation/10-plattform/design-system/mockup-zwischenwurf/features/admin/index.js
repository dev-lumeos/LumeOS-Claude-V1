// features/admin/index.js
// Mirrors: src/features/admin/ — dispatches tabs to view components
window.renderAdmin = function(tab) {
  switch(tab) {
    case 0: return window.Admin_SettingsView();
    case 1: return window.Admin_UsersView();
    case 2: return window.Admin_SecurityView();
    default: return '';
  }
};
