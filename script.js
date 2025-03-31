mapboxgl.accessToken = 'pk.eyJ1IjoiYW5kZXI5MjQiLCJhIjoiY201b2RweHNhMGxjazJscTI0cm92MDNuOCJ9.DUSIWV2_-BR0a9LOqhn15w';

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/ander924/cm8ukbb3x00nq01s38w30d4md",
  center: [20, 5],
  zoom: 2.3,
  minZoom: 1, 
  maxZoom: 3
});

let parsedData = []; // Store CSV rows in memory
let geoData = null;  // Original GeoJSON

// Load GeoJSON and CSV once
Promise.all([
  fetch('https://raw.githubusercontent.com/ConnorBroughton/Sandbox-Project-Repository/main/Africa_Countries.geojson').then(res => res.json()),
  fetch('https://raw.githubusercontent.com/ConnorBroughton/Sandbox-Project-Repository/main/Africa_Energy_Index_Data_Final.csv').then(res => res.text())
]).then(([geojson, csvText]) => {
  parsedData = parseCSV(csvText);
  geoData = geojson;

  map.on('load', () => {
    updateMapForDimension("System Performance");
  });
});

// Button click behavior
document.querySelectorAll("nav a").forEach(button => {
  button.addEventListener("click", e => {
    e.preventDefault();
    const dimension = button.dataset.dimension;

    document.querySelectorAll("nav a").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    updateMapForDimension(dimension);
  });
});

// Parse CSV text into JS objects
function parseCSV(text) {
  const rows = text.trim().split('\n');
  const headers = rows[0].split(',');
  return rows.slice(1).map(row => {
    const values = row.split(',');
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = h === 'Score' ? parseFloat(values[i]) : values[i];
    });
    return obj;
  });
}

// Compute average scores by country for a given dimension
function computeAverageScores(data, dimension) {
  const grouped = {};
  data.forEach(row => {
    if (row.Dimension === dimension && !isNaN(row.Score)) {
      if (!grouped[row.COUNTRYAFF]) grouped[row.COUNTRYAFF] = [];
      grouped[row.COUNTRYAFF].push(row.Score);
    }
  });

  const averages = {};
  for (const country in grouped) {
    const scores = grouped[country];
    averages[country] = scores.reduce((a, b) => a + b, 0) / scores.length;
  }
  return averages;
}

function updateMapForDimension(dimension) {
  const averageScores = computeAverageScores(parsedData, dimension);
  
  // Calculate the ranking for each country
  const allCountryScores = Object.entries(averageScores)
    .sort((a, b) => b[1] - a[1]);
    
  // Create ranking map for easy lookup
  const rankings = {};
  allCountryScores.forEach((item, index) => {
    rankings[item[0]] = index + 1;
  });
  
  // Apply updated scores and rankings to the geoData
  geoData.features.forEach(feature => {
    const country = feature.properties.COUNTRYAFF;
    feature.properties.score = averageScores[country] ?? null;
    feature.properties.rank = rankings[country] ?? null;
    feature.properties.totalCountries = allCountryScores.length;
  });

  // If the source already exists, just update the data
  if (map.getSource('countries')) {
    map.getSource('countries').setData(geoData);
  } else {
    map.addSource('countries', {
      type: 'geojson',
      data: geoData
    });

    // Create a more distinct color scheme for the selected dimension
    const colorSchemes = {
      "System Performance": {
        noData: '#ccc',
        colors: [
          [0, '#d73027'],    // Deep red (poorest performance)
          [20, '#fc8d59'],   // Orange-red
          [40, '#fee090'],   // Light yellow
          [60, '#e0f3f8'],   // Light blue
          [80, '#91bfdb'],   // Medium blue
          [100, '#4575b4']   // Deep blue (best performance)
        ]
      },
      "Transition Readiness": {
        noData: '#ccc',
        colors: [
          [0, '#8c510a'],    // Brown (least ready)
          [20, '#d8b365'],   // Light brown
          [40, '#f6e8c3'],   // Beige
          [60, '#c7eae5'],   // Light teal
          [80, '#5ab4ac'],   // Teal
          [100, '#01665e']   // Dark teal (most ready)
        ]
      },
      "Tech Preparedness": {
        noData: '#ccc',
        colors: [
          [0, '#762a83'],    // Purple (least prepared)
          [20, '#af8dc3'],   // Light purple
          [40, '#e7d4e8'],   // Very light purple
          [60, '#d9f0d3'],   // Light green
          [80, '#7fbf7b'],   // Medium green
          [100, '#1b7837']   // Dark green (most prepared)
        ]
      },
      "Introduction": {
        noData: '#ccc',
        colors: [
          [0, '#878787'],    // Dark gray
          [25, '#bababa'],   // Medium gray
          [50, '#e0e0e0'],   // Light gray
          [75, '#4d4d4d'],   // Very dark gray
          [100, '#000000']   // Black
        ]
      }
    };
    
    // Get the color scheme for the current dimension
    const scheme = colorSchemes[dimension] || colorSchemes["System Performance"];
    
    // Build the color interpolation array
    const colorInterpolation = ['interpolate', ['linear'], ['coalesce', ['get', 'score'], -1]];
    colorInterpolation.push(-1, scheme.noData);
    
    // Add all color stops
    scheme.colors.forEach(stop => {
      colorInterpolation.push(stop[0], stop[1]);
    });
    
    map.addLayer({
      id: 'country-fill',
      type: 'fill',
      source: 'countries',
      paint: {
        'fill-color': colorInterpolation,
        'fill-opacity': 0.85
      }
    });

    map.addLayer({
      id: 'country-outline',
      type: 'line',
      source: 'countries',
      paint: {
        'line-color': '#fff',
        'line-width': 1
      }
    });

    const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });

    // Add cursor change on hover
    map.on('mouseenter', 'country-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    
    map.on('mouseleave', 'country-fill', () => {
      map.getCanvas().style.cursor = '';
    });

    map.on('mousemove', 'country-fill', e => {
      const props = e.features[0].properties;
      const countryName = props.COUNTRYAFF;
      const score = typeof props.score === 'number' ? props.score.toFixed(1) : 'No data';
      
      // Get country-specific data from parsedData
      const countryData = parsedData.filter(row => row.COUNTRYAFF === countryName && 
                                                  row.Dimension === dimension);
      
      // Compute ranking
      const allCountryScores = Object.entries(computeAverageScores(parsedData, dimension))
        .sort((a, b) => b[1] - a[1]);
      const countryRank = allCountryScores.findIndex(item => item[0] === countryName) + 1;
      const totalCountries = allCountryScores.length;
      
      // Get sub-dimension scores
      const subDimensions = {};
      countryData.forEach(row => {
        subDimensions[row['Sub-Dimension']] = row.Score;
      });
      
      // Get top sub-dimension and challenge sub-dimension
      let topSubDim = {name: 'N/A', score: 0};
      let lowSubDim = {name: 'N/A', score: 100};
      
      Object.entries(subDimensions).forEach(([name, score]) => {
        if (score > topSubDim.score) {
          topSubDim = {name, score};
        }
        if (score < lowSubDim.score) {
          lowSubDim = {name, score};
        }
      });
      
      // Build the popup HTML
      let popupHTML = `
        <div class="country-popup">
          <h3>${countryName}</h3>
          <table class="popup-table">
            <tr>
              <td><strong>${dimension} Score:</strong></td>
              <td>${score}/100</td>
            </tr>
            <tr>
              <td><strong>Ranking:</strong></td>
              <td>${countryRank} of ${totalCountries}</td>
            </tr>
            <tr class="sub-heading">
              <td colspan="2"><strong>Key Metrics</strong></td>
            </tr>`;
      
      // Add the top 3 sub-dimensions if available
      const subDimKeys = Object.keys(subDimensions).slice(0, 3);
      subDimKeys.forEach(subDim => {
        const subScore = subDimensions[subDim];
        popupHTML += `
            <tr>
              <td>${subDim}:</td>
              <td>${subScore ? subScore.toFixed(1) : 'N/A'}</td>
            </tr>`;
      });
      
      popupHTML += `
            <tr class="sub-heading">
              <td colspan="2"><strong>Highlights</strong></td>
            </tr>
            <tr>
              <td><strong>Strength:</strong></td>
              <td>${topSubDim.name}: ${topSubDim.score.toFixed(1)}</td>
            </tr>
            <tr>
              <td><strong>Challenge:</strong></td>
              <td>${lowSubDim.name}: ${lowSubDim.score.toFixed(1)}</td>
            </tr>
          </table>
        </div>`;
      
      popup.setLngLat(e.lngLat).setHTML(popupHTML).addTo(map);
    });

    map.on('mouseleave', 'country-fill', () => {
      popup.remove();
    });
  }
  
  // Add a legend to the map
  updateLegend(dimension);
}

// Create or update the legend based on the selected dimension
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

document.getElementById('systems-performance-nav').addEventListener('click', () => {
  document.getElementById('description-1').innerHTML = "Systems performance description 1";
  document.getElementById('description-2').innerHTML = "Systems performance description 2";
  document.getElementById('description-3').innerHTML = "Systems performance description 3";
  }
);

document.getElementById('transition-readiness-nav').addEventListener('click', () => {
  document.getElementById('description-1').innerHTML = "Transition Readiness description 1";
  document.getElementById('description-2').innerHTML = "Transition Readiness description 2";
  document.getElementById('description-3').innerHTML = "Transition Readiness description 3";
  }
);