import pandas as pd
import json

# GitHub raw URLs
csv_url = "/Users/jimbo/Downloads/Africa_Energy_Index_Data.csv"
geojson_url = "/Users/jimbo/Downloads/Africa_Countries.geojson"

# Load CSV from GitHub
csv_df = pd.read_csv(csv_url)
csv_countries = set(name.strip().lower() for name in csv_df['COUNTRYAFF'].dropna().unique())

# Load GeoJSON from GitHub
geojson_data = requests.get(geojson_url).json()
geojson_countries = [feature['properties']['COUNTRYAFF'] for feature in geojson_data['features']]
geojson_normalized = set(name.strip().lower() for name in geojson_countries)

# Find unmatched countries
unmatched = []
for original in geojson_countries:
    normalized = original.strip().lower()
    if normalized not in csv_countries:
        unmatched.append(original)

# Output unmatched
print("Unmatched GeoJSON country names:")
for name in unmatched:
    print(f'"{name}": "",')

    # Save the name map to a JSON file in Downloads
output_path = "/Users/jimbo/Downloads/name_map_template.json"

name_map = {name: "" for name in unmatched}

with open(output_path, 'w') as f:
    json.dump(name_map, f, indent=2)

print(f"\nSaved name_map_template.json to: {output_path}")

