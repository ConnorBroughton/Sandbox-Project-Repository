// Simple function to toggle dimension content visibility
function initDimensionToggles() {
  // Get all dimension headers
  const headers = document.querySelectorAll('.static-dimension .dimension-header');
  
  // Add click handler to each header
  headers.forEach(header => {
    // Find the content elements within this dimension
    const dimension = header.closest('.static-dimension');
    const content = dimension.querySelector('.subdimension-grid');
    
    // Add click event
    header.onclick = () => {
      // Toggle content visibility
      const isVisible = content.style.display === 'grid';
      
      // Set display property based on current state
      content.style.display = isVisible ? 'none' : 'grid';
    };
  });
}

// Initialize when the methodology tab is clicked
document.getElementById('methodology-nav').addEventListener('click', () => {
  // Short delay to ensure the page has loaded
  setTimeout(initDimensionToggles, 200);
});