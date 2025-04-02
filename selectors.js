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

  document.getElementById('systems-performance-nav').addEventListener('click', () => {
    document.getElementById('description-1').innerHTML = "Energy Access: Measures the population's access to reliable electricity services.";
    document.getElementById('description-2').innerHTML = "Energy Security: Evaluates the diversity, reliability, and resilience of energy supply.";
    document.getElementById('description-3').innerHTML = "Energy Equity: Assesses the affordability and fairness of energy distribution across populations.";
    }
  );
  
  document.getElementById('transition-readiness-nav').addEventListener('click', () => {
    document.getElementById('description-1').innerHTML = "Policy Framework: Evaluates the strength and implementation of energy transition policies.";
    document.getElementById('description-2').innerHTML = "Investment Environment: Measures the flows and enabling conditions for clean energy investment.";
    document.getElementById('description-3').innerHTML = "Infrastructure Readiness: Assesses the adaptability of existing energy infrastructure for transition.";
    }
  );
  
  document.getElementById('tech-preparedness-nav').addEventListener('click', () => {
    document.getElementById('description-1').innerHTML = "Digital Integration: Measures the use of digital technologies in energy management systems.";
    document.getElementById('description-2').innerHTML = "Innovation Capacity: Evaluates R&D capabilities and technology adoption rates.";
    document.getElementById('description-3').innerHTML = "Technical Expertise: Assesses the availability of skilled workforce for advanced energy solutions.";
    }
  );