function updateLegend(dimension) {
    // Remove existing legend if present
    const existingLegend = document.querySelector('.map-legend');
    if (existingLegend) {
      existingLegend.remove();
    }
  
    // Get the color scheme for the current dimension
    const colorSchemes = {
      "System Performance": {
        title: "System Performance",
        ranges: [
          { label: "Excellent (80-100)", color: "#4575b4" },
          { label: "Good (60-80)", color: "#91bfdb" },
          { label: "Moderate (40-60)", color: "#e0f3f8" },
          { label: "Poor (20-40)", color: "#fee090" },
          { label: "Critical (0-20)", color: "#fc8d59" },
          { label: "No Data", color: "#ccc" }
        ]
      },
      "Transition Readiness": {
        title: "Transition Readiness",
        ranges: [
          { label: "Very Ready (80-100)", color: "#01665e" },
          { label: "Ready (60-80)", color: "#5ab4ac" },
          { label: "Developing (40-60)", color: "#c7eae5" },
          { label: "Early Stage (20-40)", color: "#f6e8c3" },
          { label: "Not Ready (0-20)", color: "#d8b365" },
          { label: "No Data", color: "#ccc" }
        ]
      },
      "Tech Preparedness": {
        title: "Tech Preparedness",
        ranges: [
          { label: "Advanced (80-100)", color: "#1b7837" },
          { label: "Proficient (60-80)", color: "#7fbf7b" },
          { label: "Emerging (40-60)", color: "#d9f0d3" },
          { label: "Basic (20-40)", color: "#e7d4e8" },
          { label: "Limited (0-20)", color: "#af8dc3" },
          { label: "No Data", color: "#ccc" }
        ]
      },
      "Introduction": {
        title: "Index Overview",
        ranges: [
          { label: "High (75-100)", color: "#000000" },
          { label: "Medium-High (50-75)", color: "#4d4d4d" },
          { label: "Medium (25-50)", color: "#bababa" },
          { label: "Low (0-25)", color: "#e0e0e0" },
          { label: "No Data", color: "#ccc" }
        ]
      }
    };
  
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