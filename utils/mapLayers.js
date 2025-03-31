// map-layers.js - Functions for creating and updating map layers
import { computeAverageScores } from './data-processor.js';
import { updateLegend } from './legend.js';
import { createPopup } from './popup.js';

/**
 * Updates the map for the selected dimension
 * @param {Object} map - The Mapbox map instance
 * @param {Object} geoData - The GeoJSON data
 * @param {Array} parsedData - The parsed CSV data
 * @param {string} dimension - The dimension to display
 */
export function updateMapForDimension(dimension) {
  // Update the current dimension globally
  currentDimension = dimension;
  
  const averageScores = computeAverageScores(parsedData, dimension);
  
  // Calculate the ranking for each country
  const allCountryScores = Object.entries(averageScores)
    .sort((a, b) => b[1] - a[1]);
    
  // Create ranking map for easy lookup
  const rankings = {};
  allCountryScores.forEach((item, index) => {
    rankings[item[0]] = index + 1;
  });
  
  // Apply updated scores and rankings to the geoData
  geoData.features.forEach(feature => {
    const country = feature.properties.COUNTRYAFF;
    feature.properties.score = averageScores[country] ?? null;
    feature.properties.rank = rankings[country] ?? null;
    feature.properties.totalCountries = allCountryScores.length;
  });

  // If the source already exists, just update the data
  if (map.getSource('countries')) {
    map.getSource('countries').setData(geoData);
  } else {
    map.addSource('countries', {
      type: 'geojson',
      data: geoData
    });

    // Create a more distinct color scheme for the selected dimension
    const colorSchemes = {
      "System Performance": {
        noData: '#ccc',
        colors: [
          [0, '#d73027'],    // Deep red (poorest performance)
          [20, '#fc8d59'],   // Orange-red
          [40, '#fee090'],   // Light yellow
          [60, '#e0f3f8'],   // Light blue
          [80, '#91bfdb'],   // Medium blue
          [100, '#4575b4']   // Deep blue (best performance)
        ]
      },
      "Transition Readiness": {
        noData: '#ccc',
        colors: [
          [0, '#8c510a'],    // Brown (least ready)
          [20, '#d8b365'],   // Light brown
          [40, '#f6e8c3'],   // Beige
          [60, '#c7eae5'],   // Light teal
          [80, '#5ab4ac'],   // Teal
          [100, '#01665e']   // Dark teal (most ready)
        ]
      },
      "Tech Preparedness": {
        noData: '#ccc',
        colors: [
          [0, '#762a83'],    // Purple (least prepared)
          [20, '#af8dc3'],   // Light purple
          [40, '#e7d4e8'],   // Very light purple
          [60, '#d9f0d3'],   // Light green
          [80, '#7fbf7b'],   // Medium green
          [100, '#1b7837']   // Dark green (most prepared)
        ]
      },
      "Introduction": {
        noData: '#ccc',
        colors: [
          [0, '#878787'],    // Dark gray
          [25, '#bababa'],   // Medium gray
          [50, '#e0e0e0'],   // Light gray
          [75, '#4d4d4d'],   // Very dark gray
          [100, '#000000']   // Black
        ]
      }
    };
    
    // Get the color scheme for the current dimension
    const scheme = colorSchemes[dimension] || colorSchemes["System Performance"];
    
    // Build the color interpolation array
    const colorInterpolation = ['interpolate', ['linear'], ['coalesce', ['get', 'score'], -1]];
    colorInterpolation.push(-1, scheme.noData);
    
    // Add all color stops
    scheme.colors.forEach(stop => {
      colorInterpolation.push(stop[0], stop[1]);
    });
    
    map.addLayer({
      id: 'country-fill',
      type: 'fill',
      source: 'countries',
      paint: {
        'fill-color': colorInterpolation,
        'fill-opacity': 0.85
      }
    });

    map.addLayer({
      id: 'country-outline',
      type: 'line',
      source: 'countries',
      paint: {
        'line-color': '#fff',
        'line-width': 1
      }
    });

    const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });

    // Add cursor change on hover
    map.on('mouseenter', 'country-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    
    map.on('mouseleave', 'country-fill', () => {
      map.getCanvas().style.cursor = '';
    });

    map.on('mousemove', 'country-fill', e => {
      const props = e.features[0].properties;
      const countryName = props.COUNTRYAFF;
      const score = typeof props.score === 'number' ? props.score.toFixed(1) : 'No data';
      
      // Use the CURRENT dimension instead of the dimension from when this event was set up
      // Get country-specific data from parsedData
      const countryData = parsedData.filter(row => row.COUNTRYAFF === countryName && 
                                                   row.Dimension === currentDimension);
      
      // Compute ranking
      const allCountryScores = Object.entries(computeAverageScores(parsedData, currentDimension))
        .sort((a, b) => b[1] - a[1]);
      const countryRank = allCountryScores.findIndex(item => item[0] === countryName) + 1;
      const totalCountries = allCountryScores.length;
      
      // Get sub-dimension scores
      const subDimensions = {};
      countryData.forEach(row => {
        subDimensions[row['Sub-Dimension']] = row.Score;
      });
      
      // Get top sub-dimension and challenge sub-dimension
      let topSubDim = {name: 'N/A', score: 0};
      let lowSubDim = {name: 'N/A', score: 100};
      
      Object.entries(subDimensions).forEach(([name, score]) => {
        if (score > topSubDim.score) {
          topSubDim = {name, score};
        }
        if (score < lowSubDim.score) {
          lowSubDim = {name, score};
        }
      });
      
      // Build the popup HTML
      let popupHTML = `
        <div class="country-popup">
          <h3>${countryName}</h3>
          <table class="popup-table">
            <tr>
              <td><strong>${currentDimension} Score:</strong></td>
              <td>${score}/100</td>
            </tr>
            <tr>
              <td><strong>Ranking:</strong></td>
              <td>${countryRank} of ${totalCountries}</td>
            </tr>
            <tr class="sub-heading">
              <td colspan="2"><strong>Key Metrics</strong></td>
            </tr>`;
      
      // Add the top 3 sub-dimensions if available
      const subDimKeys = Object.keys(subDimensions).slice(0, 3);
      subDimKeys.forEach(subDim => {
        const subScore = subDimensions[subDim];
        popupHTML += `
            <tr>
              <td>${subDim}:</td>
              <td>${subScore ? subScore.toFixed(1) : 'N/A'}</td>
            </tr>`;
      });
      
      popupHTML += `
            <tr class="sub-heading">
              <td colspan="2"><strong>Highlights</strong></td>
            </tr>
            <tr>
              <td><strong>Strength:</strong></td>
              <td>${topSubDim.name}: ${topSubDim.score.toFixed(1)}</td>
            </tr>
            <tr>
              <td><strong>Challenge:</strong></td>
              <td>${lowSubDim.name}: ${lowSubDim.score.toFixed(1)}</td>
            </tr>
          </table>
        </div>`;
      
      popup.setLngLat(e.lngLat).setHTML(popupHTML).addTo(map);
    });

    map.on('mouseleave', 'country-fill', () => {
      popup.remove();
    });
  }
  
  // Add a legend to the map
  updateLegend(dimension);
}

/**
 * Adds map layers for countries
 * @param {Object} map - The Mapbox map instance
 * @param {string} dimension - The current dimension
 */
function addMapLayers(map, dimension) {
  const colorScheme = getColorScheme(dimension);
  
  // Build the color interpolation array
  const colorInterpolation = ['interpolate', ['linear'], ['coalesce', ['get', 'score'], -1]];
  colorInterpolation.push(-1, colorScheme.noData);
  
  // Add all color stops
  colorScheme.colors.forEach(stop => {
    colorInterpolation.push(stop[0], stop[1]);
  });
  
  // Add fill layer
  map.addLayer({
    id: 'country-fill',
    type: 'fill',
    source: 'countries',
    paint: {
      'fill-color': colorInterpolation,
      'fill-opacity': 0.85
    }
  });

  // Add outline layer
  map.addLayer({
    id: 'country-outline',
    type: 'line',
    source: 'countries',
    paint: {
      'line-color': '#fff',
      'line-width': 1
    }
  });
  
  // Add hover outline layer
  map.addLayer({
    id: 'country-hover-outline',
    type: 'line',
    source: 'countries',
    paint: {
      'line-color': '#000',
      'line-width': 3,
      'line-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0]
    }
  });
}

/**
 * Sets up interactions for the map (hover, click, etc.)
 * @param {Object} map - The Mapbox map instance
 * @param {Array} parsedData - The parsed CSV data
 * @param {string} dimension - The current dimension
 */
function setupMapInteractions(map, parsedData, dimension) {
  const popup = createPopup();
  
  // Hover state variables
  let hoveredStateId = null;
  
  // Add cursor change and hover effect on mouseenter
  map.on('mouseenter', 'country-fill', (e) => {
    map.getCanvas().style.cursor = 'pointer';
    
    // Update hover state
    if (e.features.length > 0) {
      if (hoveredStateId !== null) {
        map.setFeatureState(
          { source: 'countries', id: hoveredStateId },
          { hover: false }
        );
      }
      
      hoveredStateId = e.features[0].id;
      map.setFeatureState(
        { source: 'countries', id: hoveredStateId },
        { hover: true }
      );
    }
  });
  
  // Remove hover effect on mouseleave
  map.on('mouseleave', 'country-fill', () => {
    map.getCanvas().style.cursor = '';
    
    // Reset hover state
    if (hoveredStateId !== null) {
      map.setFeatureState(
        { source: 'countries', id: hoveredStateId },
        { hover: false }
      );
    }
    hoveredStateId = null;
    popup.remove();
  });

  // Show popup on mousemove
  map.on('mousemove', 'country-fill', e => {
    const props = e.features[0].properties;
    const countryName = props.COUNTRYAFF;
    const score = typeof props.score === 'number' ? props.score.toFixed(1) : 'No data';
    
    // Get country-specific data from parsedData
    const countryData = parsedData.filter(row => row.COUNTRYAFF === countryName && 
                                                row.Dimension === dimension);
    
    // Compute ranking
    const allCountryScores = Object.entries(computeAverageScores(parsedData, dimension))
      .sort((a, b) => b[1] - a[1]);
    const countryRank = allCountryScores.findIndex(item => item[0] === countryName) + 1;
    const totalCountries = allCountryScores.length;
    
    // Get sub-dimension scores
    const subDimensions = {};
    countryData.forEach(row => {
      subDimensions[row['Sub-Dimension']] = row.Score;
    });
    
    // Get top sub-dimension and challenge sub-dimension
    let topSubDim = {name: 'N/A', score: 0};
    let lowSubDim = {name: 'N/A', score: 100};
    
    Object.entries(subDimensions).forEach(([name, score]) => {
      if (score > topSubDim.score) {
        topSubDim = {name, score};
      }
      if (score < lowSubDim.score) {
        lowSubDim = {name, score};
      }
    });
    
    // Build the popup HTML
    let popupHTML = `
      <div class="country-popup">
        <h3>${countryName}</h3>
        <table class="popup-table">
          <tr>
            <td><strong>${dimension} Score:</strong></td>
            <td>${score}/100</td>
          </tr>
          <tr>
            <td><strong>Ranking:</strong></td>
            <td>${countryRank} of ${totalCountries}</td>
          </tr>
          <tr class="sub-heading">
            <td colspan="2"><strong>Key Metrics</strong></td>
          </tr>`;
    
    // Add the top 3 sub-dimensions if available
    const subDimKeys = Object.keys(subDimensions).slice(0, 3);
    subDimKeys.forEach(subDim => {
      const subScore = subDimensions[subDim];
      popupHTML += `
          <tr>
            <td>${subDim}:</td>
            <td>${subScore ? subScore.toFixed(1) : 'N/A'}</td>
          </tr>`;
    });
    
    popupHTML += `
          <tr class="sub-heading">
            <td colspan="2"><strong>Highlights</strong></td>
          </tr>
          <tr>
            <td><strong>Strength:</strong></td>
            <td>${topSubDim.name}: ${topSubDim.score.toFixed(1)}</td>
          </tr>
          <tr>
            <td><strong>Challenge:</strong></td>
            <td>${lowSubDim.name}: ${lowSubDim.score.toFixed(1)}</td>
          </tr>
        </table>
      </div>`;
    
    popup.setLngLat(e.lngLat).setHTML(popupHTML).addTo(map);
  });
}

/**
 * Gets the color scheme for the specified dimension
 * @param {string} dimension - The dimension to get colors for
 * @returns {Object} Color scheme with colors and noData value
 */
function getColorScheme(dimension) {
  const colorSchemes = {
    "System Performance": {
      noData: '#ccc',
      colors: [
        [0, '#d73027'],    // Deep red (poorest performance)
        [20, '#fc8d59'],   // Orange-red
        [40, '#fee090'],   // Light yellow
        [60, '#e0f3f8'],   // Light blue
        [80, '#91bfdb'],   // Medium blue
        [100, '#4575b4']   // Deep blue (best performance)
      ]
    },
    "Transition Readiness": {
      noData: '#ccc',
      colors: [
        [0, '#8c510a'],    // Brown (least ready)
        [20, '#d8b365'],   // Light brown
        [40, '#f6e8c3'],   // Beige
        [60, '#c7eae5'],   // Light teal
        [80, '#5ab4ac'],   // Teal
        [100, '#01665e']   // Dark teal (most ready)
      ]
    },
    "Tech Preparedness": {
      noData: '#ccc',
      colors: [
        [0, '#762a83'],    // Purple (least prepared)
        [20, '#af8dc3'],   // Light purple
        [40, '#e7d4e8'],   // Very light purple
        [60, '#d9f0d3'],   // Light green
        [80, '#7fbf7b'],   // Medium green
        [100, '#1b7837']   // Dark green (most prepared)
      ]
    },
    "Introduction": {
      noData: '#ccc',
      colors: [
        [0, '#878787'],    // Dark gray
        [25, '#bababa'],   // Medium gray
        [50, '#e0e0e0'],   // Light gray
        [75, '#4d4d4d'],   // Very dark gray
        [100, '#000000']   // Black
      ]
    }
  };
  
  return colorSchemes[dimension] || colorSchemes["System Performance"];
}