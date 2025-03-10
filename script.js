

mapboxgl.accessToken = 'pk.eyJ1IjoiYW5kZXI5MjQiLCJhIjoiY201b2RweHNhMGxjazJscTI0cm92MDNuOCJ9.DUSIWV2_-BR0a9LOqhn15w';
let initialZoom = 10.5 //initial zoom
let currentIndex = 0

// carousel slide
$('#carousel').on('slide.bs.carousel', function (event) {
    currentIndex = event.to; 
    createMap(initialZoom)
});

//creating map
const createMap = (zoomValue) => {
    const carousel = document.getElementById("carousel")
    carousel.style.zIndex = "-100"

	const map = new mapboxgl.Map({
		container: 'map', 
		style: 'mapbox://styles/ander924/cm6sdtrs2004t01qshcd17pgy', // style URL
		center: [-123.086, 49.249], // starting view [lng, lat]
		zoom: zoomValue, // starting zoom
		minZoom: zoomValue //can't zoom out
	})
	
	map.on('load', () => {
		// Load Public Art GeoJSON into github
		map.addSource('public-art', {
			type: 'geojson',
			data: 'https://raw.githubusercontent.com/NAnder924/GGR472_Lab2/refs/heads/main/public-art.geojson'
		});
	//details regarding markers for public art
		map.addLayer({
			id: 'public-art-layer',
			type: 'circle', //type of marker
			source: 'public-art', //using the source for public art added above
			paint: {
				'circle-radius': 3, //circle radius size
				'circle-color': 'orange',  //colour of circle
				'circle-stroke-width': 0.5, //border of circle width
				'circle-stroke-color': 'rgb(252, 134, 0)' //border of circle colour
			}
		});
	
		// Load Community Gardens and Food Trees GeoJSON into github
		map.addSource('community-gardens-and-food-trees', {
			type: 'geojson',
			data: 'https://raw.githubusercontent.com/NAnder924/GGR472_Lab2/refs/heads/main/community-gardens-and-food-trees.geojson'
		});
	//details regarding markers for community gardens and food trees
		map.addLayer({
			id: 'community-gardens-and-food-trees', 
			type: 'circle', //type of marker
			source: 'community-gardens-and-food-trees', //using the source for community gardens and foodtrees added above
			paint: {
				'circle-radius': 3, //circle radius size
				'circle-color': 'blue', //colour of circle
				'circle-stroke-width': 1, //border of circle width
				'circle-stroke-color': 'rgb(41, 14, 159)' //border of circle colour
			}
		})
            //filter legend variables based on carousel slide
        const updateLayerVisibility = (index) => {
            if (index === 0) { //first slide both visible
                map.setLayoutProperty('public-art-layer', 'visibility', 'visible');
                map.setLayoutProperty('community-gardens-and-food-trees', 'visibility', 'visible');
            } else if (index === 1) { //second slide first variable visible only
                map.setLayoutProperty('public-art-layer', 'visibility', 'visible');
                map.setLayoutProperty('community-gardens-and-food-trees', 'visibility', 'none');
            } else if (index === 2) { //third slide second variable visible only
                map.setLayoutProperty('public-art-layer', 'visibility', 'none');
                map.setLayoutProperty('community-gardens-and-food-trees', 'visibility', 'visible');
            }
        };
            //variable visibility based on the cuurent carousel slide
        updateLayerVisibility(currentIndex)
	});
}

createMap(initialZoom)
// creating legend popout and map characteristics
//zoom in every 0.5 per button press
const zoomIn = () => {
    initialZoom += 0.5
    createMap(initialZoom)
}
//zoom out every 0.5 per button press
const zoomOut = () => {
    initialZoom -= 0.5
    createMap(initialZoom)
}

// making button change from show legend to hide legend depending if opened or not
const renameButton = () => {
	const button = document.getElementById("button");
    const legend = document.getElementById("legend")
    const carousel = document.getElementById("carousel")

    if (button.innerHTML === "Hide Legend") {
        button.innerHTML = "Show Legend"
        legend.style.zIndex = "-100"
        carousel.style.zIndex = "-100"

    } else {
        button.innerHTML = "Hide Legend"
        legend.style.zIndex = "100"
        carousel.style.zIndex = "100"
    }
}
