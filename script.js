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

// Add this to script.js
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


