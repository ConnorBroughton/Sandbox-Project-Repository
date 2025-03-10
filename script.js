mapboxgl.accessToken = 'pk.eyJ1IjoiYW5kZXI5MjQiLCJhIjoiY201b2RweHNhMGxjazJscTI0cm92MDNuOCJ9.DUSIWV2_-BR0a9LOqhn15w';

let initialZoom = 10.5; // Initial zoom
let currentIndex = 0;
let map; // Declare the map globally

// Function to create and initialize the map
const createMap = () => {
    if (!map) {
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/ander924/cm6sdtrs2004t01qshcd17pgy',
            center: [-123.086, 49.249],
            zoom: initialZoom,
            minZoom: 8
        });
        map.setZoom(initialZoom); // Only update zoom if the map already exists
    }
};

// Initialize the map
createMap();

// Zoom in function
const zoomIn = () => {
    initialZoom += 0.5;
    map.setZoom(initialZoom);
};

// Zoom out function
const zoomOut = () => {
    initialZoom -= 0.5;
    map.setZoom(initialZoom);
};

// Toggle Legend Visibility
const renameButton = () => {
    const button = document.getElementById("button");
    const legend = document.getElementById("legend");
    const carousel = document.getElementById("carousel");

    if (button.innerHTML === "Hide Legend") {
        button.innerHTML = "Show Legend";
        legend.style.zIndex = "-100";
        carousel.style.zIndex = "-100";
    } else {
        button.innerHTML = "Hide Legend";
        legend.style.zIndex = "100";
        carousel.style.zIndex = "100";
    }
};
