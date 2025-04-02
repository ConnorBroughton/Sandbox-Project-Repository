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
    title.textContent = dimension + " Index"; // Use dimension name for title
    legend.appendChild(title);
  
    // Add legend items
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'legend-items';
  
    // Use scheme.colors instead of scheme.ranges
    scheme.colors.forEach((colorStop, index) => {
      const item = document.createElement('div');
      item.className = 'legend-item';
  
      const colorBox = document.createElement('div');
      colorBox.className = 'color-box';
      colorBox.style.backgroundColor = colorStop[1]; // Use the color from the colorStop
  
      const label = document.createElement('span');
      
      // Create range labels based on thresholds
      if (index < scheme.colors.length - 1) {
        label.textContent = `${colorStop[0]}-${scheme.colors[index+1][0]}`;
      } else {
        label.textContent = `${colorStop[0]}+`;
      }
  
      item.appendChild(colorBox);
      item.appendChild(label);
      itemsContainer.appendChild(item);
    });

    // Add a "No Data" legend item
    const noDataItem = document.createElement('div');
    noDataItem.className = 'legend-item';
    
    const noDataColorBox = document.createElement('div');
    noDataColorBox.className = 'color-box';
    noDataColorBox.style.backgroundColor = scheme.noData;
    
    const noDataLabel = document.createElement('span');
    noDataLabel.textContent = 'No Data';
    
    noDataItem.appendChild(noDataColorBox);
    noDataItem.appendChild(noDataLabel);
    itemsContainer.appendChild(noDataItem);
  
    legend.appendChild(itemsContainer);
  
    // Add to map container
    document.getElementById('map').appendChild(legend);
  }