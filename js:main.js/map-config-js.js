// map-config.js - Mapbox initialization and configuration

/**
 * Initializes and configures the Mapbox map
 * @returns {Object} The configured Mapbox map instance
 */
export function initMap() {
  mapboxgl.accessToken = 'pk.eyJ1IjoiYW5kZXI5MjQiLCJhIjoiY201b2RweHNhMGxjazJscTI0cm92MDNuOCJ9.DUSIWV2_-BR0a9LOqhn15w';

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/ander924/cm8ukbb3x00nq01s38w30d4md",
    center: [20, 5],
    zoom: 2.3,
    minZoom: 1, 
    maxZoom: 3
  });
  
  return map;
}