mapboxgl.accessToken = 'pk.eyJ1IjoiYW5kZXI5MjQiLCJhIjoiY201b2RweHNhMGxjazJscTI0cm92MDNuOCJ9.DUSIWV2_-BR0a9LOqhn15w';

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/satellite-v9", // Using a default Mapbox style
  center: [20, 5],
  zoom: 2.3,
  minZoom: 1,
  maxZoom: 3,
  projection: 'mercator'
  // projection: 'mercator'
});

let parsedData = []; // Store CSV rows in memory
let geoData = null;  // Original GeoJSON
let currentDimension; // Track the current dimension
let mapMoved = false;

const redirectCATF = () => {
  window.open("https://www.catf.us/", "_blank");
}

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
  // Create an object to group scores by country
  const grouped = {};

  // Iterate through the data to group scores
  data.forEach(row => {
    // Only process rows matching the specified dimension and with valid scores
    if (row.Dimension === dimension && !isNaN(row.Score)) {
      // Initialize an array for the country if it doesn't exist
      if (!grouped[row.COUNTRYAFF]) grouped[row.COUNTRYAFF] = [];
      
      // Add the score to the country's array of scores
      grouped[row.COUNTRYAFF].push(row.Score);
    }
  });

  // Create an object to store average scores
  const averages = {};

  // Calculate the average score for each country
  for (const country in grouped) {
    // Get all scores for the current country
    const scores = grouped[country];
    
    // Calculate average by summing all scores and dividing by number of scores
    // reduce() adds up all scores (a + b), starting with initial value 0
    // Then divide by the total number of scores to get the mean
    // Claude 3.7 came up with this optimized solution and I am using it here
    averages[country] = scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  // Return the object with countries and their average scores
  return averages;
}
