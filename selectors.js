// Button click behavior
document.querySelectorAll("nav a").forEach(button => {
  button.addEventListener("click", e => {
    e.preventDefault();
    
    // Remove active class from all buttons
    document.querySelectorAll("nav a").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    
    // Check if this is a page navigation or dimension change
    if (button.dataset.page) {
      // Handle page navigation
      const pageId = button.dataset.page;
      handlePageNavigation(pageId);
    } else if (button.dataset.dimension) {
      // Handle dimension change
      const dimension = button.dataset.dimension;
      handleDimensionChange(dimension);
      
      // Update the info panel for this dimension
      updateInfoPanel(dimension);
    }
  });
});

// Function to update the info panel based on the selected dimension
function updateInfoPanel(dimension) {
  // Hide all panel content sections
  document.querySelectorAll('.panel-content').forEach(panel => {
    panel.style.display = 'none';
  });
  
  // Show the panel for the selected dimension
  const selectedPanel = document.querySelector(`.panel-content[data-dimension="${dimension}"]`);
  if (selectedPanel) {
    selectedPanel.style.display = 'block';
  }
}
