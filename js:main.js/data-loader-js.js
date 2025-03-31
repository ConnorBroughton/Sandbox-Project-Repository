// data-loader.js - Functions for loading external data
import { parseCSV } from './data-processor.js';
import { updateMapForDimension } from './map-layers.js';

// Shared data that can be accessed by other modules
export let parsedData = []; // Store CSV rows in memory
export let geoData = null;  // Original GeoJSON

/**
 * Loads GeoJSON and CSV data, then initializes the map
 * @param {Object} map - The Mapbox map instance
 */
export function loadData(map) {
  Promise.all([
    fetch('https://raw.githubusercontent.com/ConnorBroughton/Sandbox-Project-Repository/main/Africa_Countries.geojson').then(res => res.json()),
    fetch('https://raw.githubusercontent.com/ConnorBroughton/Sandbox-Project-Repository/main/Africa_Energy_Index_Data_Final.csv').then(res => res.text())
  ]).then(([geojson, csvText]) => {
    parsedData = parseCSV(csvText);
    
    // Add unique feature IDs for feature-state API
    geojson.features.forEach((feature, index) => {
      feature.id = index;
    });
    
    geoData = geojson;

    map.on('load', () => {
      updateMapForDimension(map, geoData, parsedData, "System Performance");
    });
  });
}