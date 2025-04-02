mapboxgl.accessToken = 'pk.eyJ1IjoiYW5kZXI5MjQiLCJhIjoiY201b2RweHNhMGxjazJscTI0cm92MDNuOCJ9.DUSIWV2_-BR0a9LOqhn15w';

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v11", // Using a default Mapbox style
  center: [20, 5],
  zoom: 2.3,
  minZoom: 1,
  maxZoom: 3
});

let parsedData = []; // Store CSV rows in memory
let geoData = null;  // Original GeoJSON
let currentDimension; // Track the current dimension

// Load GeoJSON and CSV once
Promise.all([
  fetch('https://raw.githubusercontent.com/ConnorBroughton/Sandbox-Project-Repository/main/Africa_Countries.geojson').then(res => res.json()),
  fetch('https://raw.githubusercontent.com/ConnorBroughton/Sandbox-Project-Repository/main/Africa_Energy_Index_Data_Final.csv').then(res => res.text())
]).then(([geojson, csvText]) => {
  parsedData = parseCSV(csvText);
  geoData = geojson;
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


