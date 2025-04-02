function updateLegend(dimension) {
    // Remove existing legend if present
    const existingLegend = document.querySelector('.map-legend');
    if (existingLegend) {
      existingLegend.remove();
    }
    
    const scheme = colorSchemes[dimension] || colorSchemes["System Performance"];
  
    // Create legend container
    const legend = document.createElement('div');
    legend.className = 'map-legend';
  
    // Add title
    const title = document.createElement('div');
    title.className = 'legend-title';
    title.textContent = scheme.title;
    legend.appendChild(title);
  
    // Add legend items
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'legend-items';
  
    scheme.ranges.forEach(range => {
      const item = document.createElement('div');
      item.className = 'legend-item';
  
      const colorBox = document.createElement('div');
      colorBox.className = 'color-box';
      colorBox.style.backgroundColor = range.color;
  
      const label = document.createElement('span');
      label.textContent = range.label;
  
      item.appendChild(colorBox);
      item.appendChild(label);
      itemsContainer.appendChild(item);
    });
  
    legend.appendChild(itemsContainer);
  
    // Add to map container
    document.getElementById('map').appendChild(legend);
  }