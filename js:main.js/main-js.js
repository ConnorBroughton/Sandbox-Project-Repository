// main.js - Entry point for the application
import { initMap } from './map-config.js';
import { loadData } from './data-loader.js';
import { setupUIControls } from './ui-controls.js';

// Wait for DOM to load before initializing
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Africa Energy Map application...');
  
  // Initialize Mapbox map
  const map = initMap();
  
  // Load data and initialize map layers when data is ready
  loadData(map);
  
  // Set up UI controls and event listeners
  setupUIControls(map);
});