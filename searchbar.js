function createSearchBar() {
  const searchContainer = document.querySelector('.search-container');
  if (!searchContainer) {
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
    console.log(dimension)
    // Hide all views first
    createSearchBar()
    document.querySelectorAll('.active-view').forEach(element => {
      element.classList.remove('active-view');
    });
  
    // Show map and info panel
    document.getElementById('map').classList.add('active-view');
    document.querySelector('.info-panel').classList.add('active-view');
  
    // Update the map for the selected dimension
    updateMapForDimension(dimension);
  }