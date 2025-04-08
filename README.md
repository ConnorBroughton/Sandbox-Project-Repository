# CATF African Renewable Energy Transition Map

## Project Overview

The CATF African Renewable Energy Transition Map is an interactive web application developed in collaboration with the Clean Air Task Force, University of Toronto's Geography & Planning department, the Munk School of Global Affairs, and Georgetown University. The tool provides a comprehensive visualization of energy technology deployment and readiness across African countries.

## Key Features

- Interactive map of African countries
- Three primary dimensions of analysis:
  1. System Performance
  2. Transition Readiness
  3. Technology-Specific Preparedness
- Detailed country-level energy metrics
- Comprehensive methodology and data sources

## Tech Stack
- HTML5
- CSS3
- JavaScript
- Mapbox GL JS
- CSV data processing

## How to Use the Tool

1. **Navigate Dimensions**
   - Use the navigation bar to switch between:
     - Introduction
     - Methodology
     - System Performance
     - Transition Readiness
     - Tech Preparedness

2. **Explore the Map**
   - Click on countries to view detailed metrics
   - Use the search bar to find specific countries
   - Hover over countries to see basic information

## Data Upload Guide

### CSV File Structure

To upload new data, you must follow a specific CSV file structure. The CSV should have the following columns:

1. **COUNTRYAFF**: Country name (must match exactly with country names in the GeoJSON file)
2. **Dimension**: One of three dimensions
   - "System Performance"
   - "Transition Readiness"
   - "Tech Preparedness"
3. **Sub-Dimension**: Specific sub-category within the dimension
4. **Score**: Numerical score (0-100)

### Example CSV Structure

```csv
COUNTRYAFF,Dimension,Sub-Dimension,Score
Algeria,System Performance,Economic Development and Growth,65.5
Egypt,Transition Readiness,Regulation and Political Commitment,72.3
Kenya,Tech Preparedness,Solar,58.9
```
An example of the CSV structure will be added to the CATF spreadsheet for example use.

### Upload Process

1. Ensure your CSV follows the exact structure above
2. Replace the existing CSV file in the project repository
3. The file should be named `Africa_Energy_Index_Data_Final.csv`
4. Maintain the exact column names and order

### Validation Tips

- Double-check country names for exact matches
- Ensure scores are between 0 and 100
- Include all three dimensions
- Cover sub-dimensions as defined in the methodology

## Data Sources

The project draws data from:
- World Bank
- International Energy Agency (IEA)
- International Renewable Energy Agency (IRENA)
- United Nations
- IMF
- And many other reputable international organizations


## Contributing

Contributions are welcome! Please:
- Follow the data upload guidelines
- Verify data accuracy
- Maintain the existing code structure

- contact glaser.jag@gmail.com for any questions or inquiries
