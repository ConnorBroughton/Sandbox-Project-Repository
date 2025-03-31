// popup.js - Functions for creating and managing popups

/**
 * Creates a MapboxGL popup with consistent styling
 * @returns {Object} Configured Mapbox popup instance
 */
export function createPopup() {
  return new mapboxgl.Popup({ 
    closeButton: false, 
    closeOnClick: false,
    maxWidth: '300px',
    offset: 15
  });
}