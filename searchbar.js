function createSearchBar() {
  const searchContainer = document.querySelector('.search-container');
  const introPageIsActive = !!document.getElementById('introduction-nav')?.classList.contains('active');
  const methodPageIsActive = !!document.getElementById('methodology-nav')?.classList.contains('active');

  if (!searchContainer && !introPageIsActive && !methodPageIsActive) {
    // Create search container div
    const searchBar = document.createElement('div');
    searchBar.classList.add('search-container');

    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'country-search';
    input.placeholder = 'Search for a country...';

    // Create button element
    const button = document.createElement('button');
    button.id = 'search-button';
    button.textContent = 'Search';

    // Append input and button to search container
    searchBar.appendChild(input);
    searchBar.appendChild(button);

    // Append search container to the body or a specific element
    document.body.appendChild(searchBar);

    const searchInput = document.getElementById('country-search');
    const searchButton = document.getElementById('search-button');
    if (searchButton && searchInput) {

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
    }
  }
}

  function clearSearchBar() {
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
      searchContainer.remove()
    }
  }

  // Modify handlePageNavigation to control search visibility
  function handlePageNavigation(pageId) {
    clearLegend()
    clearSearchBar()
    // Hide all views
    document.querySelectorAll('.active-view').forEach(element => {
      element.classList.remove('active-view');
    });
    
    // Show the selected page
    document.getElementById(`${pageId}-page`).classList.add('active-view');
  }
  
  // Modify handleDimensionChange to ensure search is visible
  function handleDimensionChange(dimension) {
    // Hide all views first
    createSearchBar()
    if (currentSearchPopup) {
      currentSearchPopup.remove()
    }

    if (mapMoved) {
      map.flyTo({
        center: [20, 5],
        zoom: 2.3,
        essential: true
      });
    } else {
      mapMoved = true
    }
    
    document.querySelectorAll('.active-view').forEach(element => {
      element.classList.remove('active-view');
    });
  
    // Show map and info panel
    document.getElementById('map').classList.add('active-view');
    document.querySelector('.info-panel').classList.add('active-view');
  
    // Update the map for the selected dimension
    updateMapForDimension(dimension);
  }