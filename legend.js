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
          { label: "Excellent (80-100)", color: "#457b9d" },
          { label: "Good (60-80)", color: "#a8dadc" },
          { label: "Moderate (40-60)", color: "#fff3b0" },
          { label: "Poor (20-40)", color: "#f4a261" },
          { label: "Critical (0-20)", color: "#E76f51" },
          { label: "No Data", color: "#ccc" }
        ]
      },
      "Transition Readiness": {
        title: "Transition Readiness",
        ranges: [
          { label: "Very Ready (80-100)", color: "#283618" },
          { label: "Ready (60-80)", color: "#606c38" },
          { label: "Developing (40-60)", color: "#fefae0" },
          { label: "Early Stage (20-40)", color: "#dda15e" },
          { label: "Not Ready (0-20)", color: "#bc6c25" },
          { label: "No Data", color: "#ccc" }
        ]
      },
      "Tech Preparedness": {
        title: "Tech Preparedness",
        ranges: [
          { label: "Advanced (80-100)", color: "#006d77" },
          { label: "Proficient (60-80)", color: "#83c5be" },
          { label: "Emerging (40-60)", color: "#ffd9da" },
          { label: "Basic (20-40)", color: "#ea638c" },
          { label: "Limited (0-20)", color: "#89023e" },
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

function clearLegend() {
  const existingLegend = document.querySelector('.map-legend');
  if (existingLegend) {
    existingLegend.remove();
  }
}