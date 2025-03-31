// Function to search countries and show results
function searchCountries(searchTerm) {
    if (!geoData) return;
    
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

// Function to show country details
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
  
  // Remove any existing search popup before creating a new one
  if (currentSearchPopup) {
    currentSearchPopup.remove();
  }
  
  // Create and display a custom popup
  const searchPopup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: false
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
    const searchInput = document.getElementById('country-search');
    const searchButton = document.getElementById('search-button');
    
    // Search when button is clicked
    searchButton.addEventListener('click', () => {
      searchCountries(searchInput.value);
    });
    
    // Search as user types
    searchInput.addEventListener('input', () => {
      searchCountries(searchInput.value);
    });
    
    // Handle Enter key press
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        // If there are search results and the first one is visible
        if (searchResultsContainer.style.display === 'block' && 
            searchResultsContainer.querySelector('.search-result-item')) {
          
          // Get the first country from results
          const firstCountry = searchResultsContainer.querySelector('.search-result-item').textContent;
          
          // If it's not "No countries found", select it
          if (firstCountry !== 'No countries found') {
            showCountryDetails(firstCountry);
            searchResultsContainer.style.display = 'none';
            searchInput.value = firstCountry;
          }
        } else {
          // Otherwise just perform the search
          searchCountries(searchInput.value);
        }
      }
    });
    
    // Hide search results when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container') && !e.target.closest('.search-results')) {
        searchResultsContainer.style.display = 'none';
      }
    });
  });