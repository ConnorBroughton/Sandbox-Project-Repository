// Simple function to toggle dimension content visibility
function initDimensionToggles() {
    // Get all dimension headers
    const headers = document.querySelectorAll('.static-dimension .dimension-header');
    
    // Add click handler to each header
    headers.forEach(header => {
      // Find the content elements within this dimension
      const dimension = header.closest('.static-dimension');
      const content = dimension.querySelector('.subdimension-grid');
      const description = dimension.querySelector('p');
      
      // Add click event
      header.onclick = () => {
        // Toggle content visibility
        const isVisible = content.style.display !== 'none';
        
        // Set display property based on current state
        if (isVisible) {
          content.style.display = 'none';
          if (description) description.style.display = 'none';
          header.classList.add('collapsed');
        } else {
          content.style.display = 'grid';
          if (description) description.style.display = 'block';
          header.classList.remove('collapsed');
        }
      };
      
      // Add a visual indicator for clickability
      header.style.cursor = 'pointer';
    });
  }
  
  // Initialize when the methodology tab is clicked
  document.getElementById('methodology-nav').addEventListener('click', () => {
    // Short delay to ensure the page has loaded
    setTimeout(initDimensionToggles, 200);
  });