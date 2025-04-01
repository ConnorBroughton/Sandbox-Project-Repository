// update legend based on selection
function updateMapForDimension(dimension) {
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