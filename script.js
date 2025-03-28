mapboxgl.accessToken = 'pk.eyJ1IjoiZ2xhc2VyamEiLCJhIjoiY201b2RybzhxMGt5ZDJrcTFoYWhuZGg1NSJ9.26_93f6771_YWY9BhIhnlw';

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/glaserja/cm72c3cvb007u01s31k928na5",
    center: [20, 5],
    zoom: 2
});

// Load both GeoJSON and CSV
Promise.all([
  fetch('https://raw.githubusercontent.com/ConnorBroughton/Sandbox-Project-Repository/main/Africa_Countries.geojson').then(res => res.json()),
  fetch('https://raw.githubusercontent.com/ConnorBroughton/Sandbox-Project-Repository/main/Africa_Energy_Index_Data.csv').then(res => res.text())
]).then(([geojson, csvText]) => {
  const scores = parseCSV(csvText);
  const averageScores = computeAverageScores(scores, 'System Performance');

  // Merge scores into GeoJSON properties
  geojson.features.forEach(feature => {
    const country = feature.properties.COUNTRYAFF;
    feature.properties.score = averageScores[country] ?? null;
  });

  // Add to map
  map.on('load', () => {
    map.addSource('countries', {
      type: 'geojson',
      data: geojson
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
          -1, '#ccc',  // No data (gray)
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

    // Tooltip on hover
    map.on('mousemove', 'country-fill', e => {
      const props = e.features[0].properties;
      const score = props.score !== null ? props.score.toFixed(1) : 'No data';
      const html = `<strong>${props.COUNTRYAFF}</strong><br>Score: ${score}`;
      popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
    });

    map.on('mouseleave', 'country-fill', () => {
      popup.remove();
    });

    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });
  });
});

// Parse CSV string into JS objects
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

// Compute average score per country for a specific dimension
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
