function updateLegend(dimension) {
  // Remove existing legend if present
  clearLegend()
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

function clearLegend() {
const existingLegend = document.querySelector('.map-legend');
if (existingLegend) {
  existingLegend.remove();
}
}