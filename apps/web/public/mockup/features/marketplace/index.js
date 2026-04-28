// features/marketplace/index.js
// Mirrors: src/features/marketplace/ — dispatches tabs to view components
window.renderMarketplace = function(tab) {
  switch(tab) {
    case 0: return window.Marketplace_DiscoverView();
    case 1: return window.Marketplace_InstalledView();
    case 2: return window.Marketplace_FeaturedView();
    default: return '';
  }
};
