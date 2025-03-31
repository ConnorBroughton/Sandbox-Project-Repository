// ui-controls.js - Functions for handling UI interactions and events
import { updateMapForDimension } from './map-layers.js';
import { parsedData, geoData } from './data-loader.js';

/**
 * Sets up UI controls and event listeners
 * @param {Object} map - The Mapbox map instance
 */
export function setupUIControls(map) {
  // Set up navigation tab click handlers
  setupNavigationTabs(map);
  
  // Set up description handlers
  setupDescriptionHandlers();
}

/**
 * Sets up navigation tab click handlers
 * @param {Object} map - The Mapbox map instance
 */
function setupNavigationTabs(map) {
  document.querySelectorAll("nav a").forEach(button => {
    button.addEventListener("click", e => {
      e.preventDefault();
      const dimension = button.dataset.dimension;

      // Update active tab
      document.querySelectorAll("nav a").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      // Update map for selected dimension
      updateMapForDimension(map, geoData, parsedData, dimension);
    });
  });
}

/**
 * Sets up handlers for updating subdimension descriptions
 */
function setupDescriptionHandlers() {
  document.getElementById('systems-performance-nav').addEventListener('click', () => {
    document.getElementById('description-1').innerHTML = "Systems performance description 1";
    document.getElementById('description-2').innerHTML = "Systems performance description 2";
    document.getElementById('description-3').innerHTML = "Systems performance description 3";
  });

  document.getElementById('transition-readiness-nav').addEventListener('click', () => {
    document.getElementById('description-1').innerHTML = "Transition Readiness description 1";
    document.getElementById('description-2').innerHTML = "Transition Readiness description 2";
    document.getElementById('description-3').innerHTML = "Transition Readiness description 3";
  });
  
  // Add handlers for other dimensions
  document.querySelectorAll('nav a').forEach(tab => {
    if (tab.id !== 'systems-performance-nav' && tab.id !== 'transition-readiness-nav') {
      tab.addEventListener('click', () => {
        const dimension = tab.dataset.dimension;
        document.getElementById('description-1').innerHTML = `${dimension} description 1`;
        document.getElementById('description-2').innerHTML = `${dimension} description 2`;
        document.getElementById('description-3').innerHTML = `${dimension} description 3`;
      });
    }
  });
}