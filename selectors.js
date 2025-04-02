// Handle navigation to information pages
function handlePageNavigation(pageId) {
    // Hide all views
    document.querySelectorAll('.active-view').forEach(element => {
      element.classList.remove('active-view');
    });
    
    // Show the selected page
    document.getElementById(`${pageId}-page`).classList.add('active-view');
  }

// Button click behavior
document.querySelectorAll("nav a").forEach(button => {
    button.addEventListener("click", e => {
      e.preventDefault();
      
      // Remove active class from all buttons
      document.querySelectorAll("nav a").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      
      // Check if this is a page navigation or dimension change
      if (button.dataset.page) {
        // Handle page navigation
        const pageId = button.dataset.page;
        handlePageNavigation(pageId);
      } else if (button.dataset.dimension) {
        // Handle dimension change
        const dimension = button.dataset.dimension;
        handleDimensionChange(dimension);
      }
    });
  });

const infoPanel = document.getElementById('info-panel');

document.getElementById('systems-performance-nav').addEventListener('click', () => {
  // Remove extra headers if present
  for (let i = 4; i <= 9; i++) {
    if (document.getElementById(`header-${i}`)) {
      document.getElementById(`header-${i}`).remove();
      document.getElementById(`description-${i}`).remove();
    }
  }

  document.getElementById('title').textContent = "System Performance Dimension";
  document.getElementById('header-1').textContent = "Economic Development and Growth";
  document.getElementById('header-2').textContent = "Environmental Sustainability";
  document.getElementById('header-3').textContent = "Energy Access and Security";
  document.getElementById('description-1').textContent = "Assesses power reliability, affordability, net imports, and financial impacts of energy system inefficiencies.";
  document.getElementById('description-2').textContent = "Evaluates energy intensity, carbon emissions, air pollution, and biodiversity impacts.";
  document.getElementById('description-3').textContent = "Examines electricity access, energy diversity, grid resilience, mini-grid development, and energy import dependency.";
});

document.getElementById('transition-readiness-nav').addEventListener('click', () => {
  for (let i = 4; i <= 9; i++) {
    if (document.getElementById(`header-${i}`)) {
      document.getElementById(`header-${i}`).remove();
      document.getElementById(`description-${i}`).remove();
    }
  }

  document.getElementById('title').textContent = "Transition Readiness Dimension";
  const headers = [
    "Regulation and Political Commitment",
    "Capital and Investment",
    "Institutions and Governance",
    "Infrastructure and Business Environment",
    "Human Capital",
    "Power System Structure"
  ];
  const descriptions = [
    "Assesses policies, regulatory frameworks, electrification planning, carbon pricing, and a country's commitment to sustainable energy goals.",
    "Evaluates foreign investment, economic freedom, climate finance access, and contributions from financial institutions supporting clean energy.",
    "Examines government stability, regulatory effectiveness, corruption perception, and sovereign credit ratings.",
    "Assesses infrastructure development, logistics performance, and the business environment for clean energy innovation.",
    "Evaluates STEM education, workforce skills, research investment, and public spending on education.",
    "Analyzes the electricity generation mix, per capita generation, and the balance between supply and demand."
  ];

  for (let i = 1; i <= headers.length; i++) {
    let header = document.getElementById(`header-${i}`);
    let desc = document.getElementById(`description-${i}`);

    if (!header) {
      header = document.createElement('h4');
      header.id = `header-${i}`;
      infoPanel.appendChild(header);
    }
    if (!desc) {
      desc = document.createElement('p');
      desc.id = `description-${i}`;
      infoPanel.appendChild(desc);
    }

    header.textContent = headers[i - 1];
    desc.textContent = descriptions[i - 1];
  }
});

document.getElementById('tech-preparedness-nav').addEventListener('click', () => {
  document.getElementById('title').textContent = "Technology-Specific Preparedness Dimension";
  
  for (let i = 4; i <= 9; i++) {
    if (document.getElementById(`header-${i}`)) {
      document.getElementById(`header-${i}`).remove();
      document.getElementById(`description-${i}`).remove();
    }
  }

  const headers = [
    "Solar", "Wind Turbines", "Natural Gas Turbine Power", 
    "Geothermal Power", "Nuclear Power", "Hydropower", 
    "Biomass-Based Power", "Hydrogen", "Carbon Capture and Storage"
  ];
  
  const descriptions = [
    "Assesses installed capacity, investment, land and water use, and regulatory support for photovoltaic and concentrated solar power.",
    "Evaluates installed capacity, investment, regulatory support, and wind resource potential.",
    "Examines installed capacity, investment, reserves, land use, and liquefied natural gas trade.",
    "Assesses installed capacity, investment, land and water use, and regulatory support.",
    "Evaluates installed capacity, investment, regulatory frameworks, uranium resources, and public acceptance.",
    "Examines installed capacity, investment, water stress, regulatory support, and flood risk.",
    "Assesses installed capacity, investment, land use, and regulatory support for bioenergy.",
    "Evaluates production capacity, investment, regulatory frameworks, and infrastructure for hydrogen development.",
    "Examines investment, installed capacity, regulatory support, and CO₂ reduction targets."
  ];

  for (let i = 1; i <= headers.length; i++) {
    let header = document.getElementById(`header-${i}`);
    let desc = document.getElementById(`description-${i}`);

    if (!header) {
      header = document.createElement('h4');
      header.id = `header-${i}`;
      infoPanel.appendChild(header);
    }
    if (!desc) {
      desc = document.createElement('p');
      desc.id = `description-${i}`;
      infoPanel.appendChild(desc);
    }

    header.textContent = headers[i - 1];
    desc.textContent = descriptions[i - 1];
  }
});
