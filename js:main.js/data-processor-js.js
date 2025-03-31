// data-processor.js - Functions for processing and transforming data

/**
 * Parses CSV text into array of objects
 * @param {string} text - CSV content as string
 * @returns {Array} Array of objects with CSV data
 */
export function parseCSV(text) {
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

/**
 * Computes average scores by country for a given dimension
 * @param {Array} data - Parsed CSV data 
 * @param {string} dimension - The dimension to calculate averages for
 * @returns {Object} Object with country codes as keys and average scores as values
 */
export function computeAverageScores(data, dimension) {
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