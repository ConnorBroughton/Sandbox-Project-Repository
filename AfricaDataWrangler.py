import pandas as pd
import numpy as np

# Base data rows (Nigeria's actual scores)
base_data = [
    ("Transition Readiness", "Regulation and Political Commitment", 83.0025),
    ("Transition Readiness", "Capital and Investment", 43.01700616),
    ("Transition Readiness", "Institutions and Governance", 20.32666667),
    ("Transition Readiness", "Infrastructure and Business Environment", 29.86467778),
    ("Transition Readiness", "Human Capital", 24.17606452),
    ("Transition Readiness", "Power System Structure", 16.68833333),
    ("System Performance", "Economic Development and Growth", 56.01392739),
    ("System Performance", "Environmental Sustainability", 52.37022222),
    ("System Performance", "Energy Access and Security", 58.63733958),
    ("Technology Specific Preparedness", "Solar", pd.NA),
    ("Technology Specific Preparedness", "Wind Turbines", pd.NA),
    ("Technology Specific Preparedness", "Natural Gas Turbine Power", pd.NA),
    ("Technology Specific Preparedness", "Geothermal Power", pd.NA),
    ("Technology Specific Preparedness", "Nuclear Power", pd.NA),
    ("Technology Specific Preparedness", "Hydropower", pd.NA),
    ("Technology Specific Preparedness", "Biomass-based Power", pd.NA),
    ("Technology Specific Preparedness", "Hydrogen", 5.984195402),
    ("Technology Specific Preparedness", "Carbon Capture and Storage", 5.708333333),
]

# 54 African countries
african_countries = [
    'Burkina Faso', 'Cabo Verde', "Côte d'Ivoire", 'Gambia', 'Ghana', 'Guinea',
    'Guinea-Bissau', 'Liberia', 'Mali', 'Mauritania', 'Morocco', 'Senegal',
    'Sierra Leone', 'Angola', 'Botswana', 'Burundi', 'Comoros', 'Congo',
    'Congo DRC', 'Gabon', 'Kenya', 'Lesotho', 'Malawi', 'Mozambique',
    'Namibia', 'Rwanda', 'Sao Tome and Principe', 'South Africa', 'Eswatini',
    'Tanzania', 'Zambia', 'Zimbabwe', 'Madagascar', 'Mauritius', 'Seychelles',
    'Algeria', 'Benin', 'Cameroon', 'Central African Republic', 'Chad',
    'Equatorial Guinea', 'Libya', 'Niger', 'Nigeria', 'Togo', 'Tunisia',
    'Djibouti', 'Egypt', 'Eritrea', 'Ethiopia', 'South Sudan', 'Sudan',
    'Uganda', 'Somalia'
]

# Function to generate fake data within ±50% of base value
def generate_similar_score(base_score):
    if pd.isna(base_score):
        return pd.NA
    min_val = base_score * (1 - 0.50)
    max_val = base_score * (1 + 0.50)
    return round(np.random.uniform(min_val, max_val), 4)

# Expand the dataset
rows = []
for country in african_countries:
    for dimension, sub_dimension, base_score in base_data:
        if country == "Nigeria":
            score = base_score
        else:
            score = generate_similar_score(base_score)
        rows.append({
            "Dimension": dimension,
            "Sub-Dimension": sub_dimension,
            "Score": score,
            "Country": country
        })

# Create DataFrame and export
df = pd.DataFrame(rows)
output_path = "/Users/jimbo/Downloads/Africa_Energy_Index_FINAL.csv"
df.to_csv(output_path, index=False)

print(f"✅ File saved to: {output_path}")