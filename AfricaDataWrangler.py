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
    "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon", "Central African Republic",
    "Chad", "Comoros", "Congo (Brazzaville)", "Congo (Kinshasa)", "Côte d'Ivoire", "Djibouti", "Egypt", "Equatorial Guinea",
    "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia",
    "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger",
    "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa",
    "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe"
]

# Function to generate fake data within ±15% of base value
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
output_path = "/Users/jimbo/Downloads/Africa_Energy_Index_FAKE.csv"
df.to_csv(output_path, index=False)

print(f"✅ File saved to: {output_path}")