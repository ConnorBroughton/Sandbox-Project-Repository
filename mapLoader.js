// Function to search countries and show results
function searchCountries(searchTerm) {
    if (!geoData) return;

    console.log("SEARCH TERM", searchTerm)
    
    searchTerm = searchTerm.toLowerCase().trim();
    
    // If search term is empty, hide results
    if (searchTerm === '') {
      searchResultsContainer.style.display = 'none';
      return;
    }
    
    // Filter countries based on search term
    const matchingCountries = geoData.features
      .filter(feature => feature.properties.COUNTRYAFF.toLowerCase().includes(searchTerm))
      .map(feature => feature.properties.COUNTRYAFF);
    
    // Remove duplicates
    const uniqueCountries = [...new Set(matchingCountries)];
    
    // Display results
    if (uniqueCountries.length > 0) {
      searchResultsContainer.innerHTML = '';
      uniqueCountries.forEach(country => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.textContent = country;
        resultItem.addEventListener('click', () => {
          showCountryDetails(country);
          searchResultsContainer.style.display = 'none';
          document.getElementById('country-search').value = '';
        });
        searchResultsContainer.appendChild(resultItem);
      });
      searchResultsContainer.style.display = 'block';
    } else {
      searchResultsContainer.innerHTML = '<div class="search-result-item">No countries found</div>';
      searchResultsContainer.style.display = 'block';
    }
  }

  // Create a search results container
const searchResultsContainer = document.createElement('div');
searchResultsContainer.className = 'search-results';
document.body.appendChild(searchResultsContainer);

// Variable to store the current search popup
let currentSearchPopup = null;

function showCountryDetails(countryName) {
    // Find the country feature
    const feature = geoData.features.find(f => f.properties.COUNTRYAFF === countryName);
    if (!feature) return;
    
    // Get country-specific data
    const countryData = parsedData.filter(row => 
      row.COUNTRYAFF === countryName && row.Dimension === currentDimension
    );
    
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
    
    // Calculate average score
    const score = feature.properties.score !== null ? 
      feature.properties.score.toFixed(1) : 'No data';
    
    // Build popup HTML
    let popupHTML = `
    <div class="country-popup" id="country-popup">
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
    
    // Remove any existing search popup before creating a new one
    if (currentSearchPopup) {
      currentSearchPopup.remove();
    }
    
    // Create and display a custom popup
    const searchPopup = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '400px' // Make the popup wider to accommodate more content
    });
    
    // Store the current popup for later removal
    currentSearchPopup = searchPopup;
    
    // Get coordinates for the country centroid
    const bounds = new mapboxgl.LngLatBounds();
    feature.geometry.coordinates.forEach(ring => {
      ring.forEach(coord => {
        bounds.extend(coord);
      });
    });
    
    // If the country is found on the map, fly to its location
    map.flyTo({
      center: bounds.getCenter(),
      zoom: 3,
      essential: true
    });
    
    // Display popup
    searchPopup.setLngLat(bounds.getCenter())
      .setHTML(popupHTML)
      .addTo(map);
  }

// Set up event listeners once the map is loaded
map.on('load', () => {
    createSearchBar()
  });