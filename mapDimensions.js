// update legend based on selection
function updateMapForDimension(dimension) {
    // Update the current dimension globally
    currentDimension = dimension;
    map.resize()
  
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
        [0, '#E76f51'],    // Deep red (poorest performance)
        [20, '#f4a261'],   // Orange-red
        [40, '#fff3b0'],   // Light yellow
        [60, '#a8dadc'],   // Light blue
        [80, '#457b9d'],   // Medium blue
      ]
    },
    "Transition Readiness": {
      noData: '#ccc',
      colors: [
        [0, '#8c510a'],    // Brown (least ready)
        [20, '#d8b365'],   // Light brown
        [40, '#fefae0'],   // Beige
        [60, '#606c38'],   // Light teal
        [80, '#283618'],   // Teal
      ]
    },
    "Tech Preparedness": {
      noData: '#ccc',
      colors: [
        [0, '#89023e'],    // Purple (least prepared)
        [20, '#ea638c'],   // Light purple
        [40, '#ffd9da'],   // Very light purple
        [60, '#83c5be'],   // Light green
        [80, '#006d77'],   // Medium green
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
  
  // Create a simple classification with discrete color boundaries
  map.addLayer({
    id: 'country-fill',
    type: 'fill',
    source: 'countries',
    paint: {
      'fill-color': [
        'case',
        ['==', ['get', 'score'], null], scheme.noData,  // No data
        ['<', ['get', 'score'], scheme.colors[0][0]], scheme.noData,  // Below minimum (shouldn't occur)
        ['<', ['get', 'score'], scheme.colors[1][0]], scheme.colors[0][1],  // First range
        ['<', ['get', 'score'], scheme.colors[2][0]], scheme.colors[1][1],  // Second range
        ['<', ['get', 'score'], scheme.colors[3][0]], scheme.colors[2][1],  // Third range
        ['<', ['get', 'score'], scheme.colors[4][0]], scheme.colors[3][1],  // Fourth range
        scheme.colors[4][1]  // Fifth range (highest)
      ],
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

      // Add cursor change on hover
      map.on('mouseenter', 'country-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
  
      map.on('mouseleave', 'country-fill', () => {
        map.getCanvas().style.cursor = '';
      });
  
      let currentClickPopup = null;
  
      map.on('click', 'country-fill', e => {
        const props = e.features[0].properties;
        const countryName = props.COUNTRYAFF;
        const score = typeof props.score === 'number' ? props.score.toFixed(1) : 'No data';
        
        // Use the CURRENT dimension
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
        
        let popupHTML = `
      <div class="country-popup">
        <h3>${countryName}</h3>
        <table class="popup-table">
          <tr>
            <td><strong>${currentDimension} Score:</strong></td>
            <td><span class="score-highlight">${score}/100</span></td>
          </tr>
          <tr>
            <td><strong>Ranking:</strong></td>
            <td><span class="rank-display">#${countryRank}</span> of ${totalCountries}</td>
          </tr>
          <tr class="sub-heading">
            <td colspan="2">Key Metrics</td>
          </tr>`;
      
        // Add ALL sub-dimensions instead of just the first three
        Object.entries(subDimensions).forEach(([subDim, subScore]) => {
          popupHTML += `
          <tr>
            <td>${subDim}:</td>
            <td><span class="metric-highlight">${subScore ? subScore.toFixed(1) : 'N/A'}</span></td>
          </tr>`;
        });
      
        popupHTML += `
          <tr class="sub-heading">
            <td colspan="2">Highlights</td>
          </tr>
          <tr class="strength-row">
            <td><strong>Strength:</strong></td>
            <td>${topSubDim.name} <span class="strength-highlight">${topSubDim.score.toFixed(1)}</span></td>
          </tr>
          <tr class="challenge-row">
            <td><strong>Challenge:</strong></td>
            <td>${lowSubDim.name} <span class="challenge-highlight">${lowSubDim.score.toFixed(1)}</span></td>
          </tr>
        </table>
      </div>`;
        
        // Remove any existing click popup before creating a new one
        if (currentClickPopup) {
          currentClickPopup.remove();
        }
        
        // Create and display the detailed popup
        const clickPopup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          maxWidth: '400px' // Make the popup wider to accommodate more content
        });
        
        // Store the current popup for later removal
        currentClickPopup = clickPopup;
        
        // Display popup
        clickPopup.setLngLat(e.lngLat)
          .setHTML(popupHTML)
          .addTo(map);
      });
  
  // Add hover event handlers to highlight countries
  map.on('mousemove', 'country-fill', e => {
    // Change cursor to pointer on hover
    map.getCanvas().style.cursor = 'pointer';
    
    // Add a highlight outline around the hovered country
    if (map.getLayer('country-hover-outline')) {
      // Get the feature being hovered
      const feature = e.features[0];
      
      // Update the hover outline source with just this feature
      const hoverFeature = {
        type: 'FeatureCollection',
        features: [feature]
      };
      
      map.getSource('hover-source').setData(hoverFeature);
    } else {
      // First time hover - create the source and layer
      map.addSource('hover-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [e.features[0]]
        }
      });
      
      // Add highlight outline around the hovered country
      map.addLayer({
        id: 'country-hover-outline',
        type: 'line',
        source: 'hover-source',
        paint: {
          'line-color': '#ffcc00', // Bright yellow highlight
          'line-width': 3,
          'line-opacity': 0.8
        }
      });
    }
  });
  
  // Remove the highlight when mouse leaves a country
  map.on('mouseleave', 'country-fill', () => {
    map.getCanvas().style.cursor = '';
    
    // If the highlight layer exists, clear its data
    if (map.getLayer('country-hover-outline')) {
      map.getSource('hover-source').setData({
        type: 'FeatureCollection',
        features: []
      });
    }
  });
  
  // Add a click event listener to the map container
  map.on('click', (e) => {
    // Check if the click was on a country
    const features = map.queryRenderedFeatures(e.point, { layers: ['country-fill'] });
    
    // If the click was not on a country (i.e., clicked on water or empty space)
    if (features.length === 0) {
      // Close any active popup
      if (currentClickPopup) {
        currentClickPopup.remove();
        currentClickPopup = null;
      }
    }
  });
  
  // Add a click event listener to the entire document
  document.addEventListener('click', (e) => {
    // Ignore clicks on map, popups, search containers and results
    if (e.target.closest('#map') || 
        e.target.closest('.mapboxgl-popup') || 
        e.target.closest('.search-container') || 
        e.target.closest('.search-results')) {
      return;
    }
    
    // Close any active popup when clicking elsewhere on the page
    if (currentClickPopup) {
      currentClickPopup.remove();
      currentClickPopup = null;
    }
  });
    }
  
    // Add a legend to the map
    updateLegend(dimension);
  }