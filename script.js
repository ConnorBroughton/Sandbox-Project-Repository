mapboxgl.accessToken = 'pk.eyJ1IjoiYW5kZXI5MjQiLCJhIjoiY201b2RweHNhMGxjazJscTI0cm92MDNuOCJ9.DUSIWV2_-BR0a9LOqhn15w';

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/ander924/cm8ukbb3x00nq01s38w30d4md",
  center: [20, 5],
  zoom: 2
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

// Update the map layer with scores for the selected dimension
function updateMapForDimension(dimension) {
  const averageScores = computeAverageScores(parsedData, dimension);

  // Apply updated scores to the geoData
  geoData.features.forEach(feature => {
    const country = feature.properties.COUNTRYAFF;
    feature.properties.score = averageScores[country] ?? null;
  });

  // If the source already exists, just update the data
  if (map.getSource('countries')) {
    map.getSource('countries').setData(geoData);
  } else {
    map.addSource('countries', {
      type: 'geojson',
      data: geoData
    });

    map.addLayer({
      id: 'country-fill',
      type: 'fill',
      source: 'countries',
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'score'], -1],
          -1, '#ccc',
           0, '#f03b20',
          50, '#feb24c',
         100, '#31a354'
        ],
        'fill-opacity': 0.8
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
