var maxBounds = L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180));
var map = L.map('map', {
    center: [0, 0],
    zoom: 1,
    maxBounds: maxBounds, 
    maxZoom: 25,
    minZoom: 1
});

var streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 25,
    
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var topographicLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 25,
    attribution: '&copy; <a href="https://www.opentopomap.org">OpenTopoMap</a> contributors'
});

var cartoDBDarkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    maxZoom: 25,
    attribution: 'Map data &copy; <a href="https://www.carto.com/">CartoDB</a> contributors'
});

var cartoDBVoyagerLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
    maxZoom: 25,
    attribution: 'Map data &copy; <a href="https://www.carto.com/">CartoDB</a> contributors'
});

var satelliteLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    maxZoom: 25,
    attribution: 'Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
    accessToken: API_KEY
});

var satellitesrtLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    maxZoom: 25,
    attribution: 'Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
    accessToken: API_KEY
});

var nightnavLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/navigation-night-v1/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    maxZoom: 25,
    attribution: 'Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
    accessToken: API_KEY
});

var daynavLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    maxZoom: 25,
    attribution: 'Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
    accessToken: API_KEY
});

var baseLayers = {
    "Street Map": streetLayer,
    "Topographic Map": topographicLayer,
    "Dark Map": cartoDBDarkLayer,
    "Voyager Map": cartoDBVoyagerLayer,
    "Satellite Map": satelliteLayer,
    "Satellite Street Map": satellitesrtLayer,
    "Night Navigation Map": nightnavLayer,
    "Day Navigation Map": daynavLayer
};
cartoDBDarkLayer.addTo(map);
const tectonicPlatesLayer = L.geoJSON(plates, {
    style: {
        color: 'green', 
        weight: 2,
    }
});

const overlays = {
    "Tectonic Plates": tectonicPlatesLayer
};
tectonicPlatesLayer.addTo(map)
L.control.layers(baseLayers, overlays).addTo(map);

const circleMarkersLayer = L.layerGroup().addTo(map);


const apiUrl = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

const currentDate = new Date();
const startDate = currentDate.toISOString().split('T')[0]; // Start of today
const endDate = startDate; // End of today

const parameters = {
    format: 'geojson',
    starttime: `${startDate}T00:00:00`,
    endtime: `${endDate}T23:59:59`,
    minlatitude: -90,
    maxlatitude: 90,
    minlongitude: -180,
    maxlongitude: 180,
    maxdepth: 1000,
    orderby: "time"
};

function fetchEarthquakeData() {
    const queryString = new URLSearchParams(parameters).toString();
    const requestUrl = `${apiUrl}?${queryString}`;

    return fetch(requestUrl)
        .then((response) => response.json())
        .then((data) => {
            const extractedData = data.features.map((feature) => {
                const { geometry, properties } = feature;
                const { coordinates } = geometry;
                const [longitude, latitude, depth] = coordinates;
                const localTimeUTC = new Date(properties.time);

                const localTimeMorocco = new Intl.DateTimeFormat('en-US', {
                    timeZone: 'Africa/Casablanca',
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    timeZoneName: 'short',
                }).format(localTimeUTC);

                const { type, mag, place } = properties;

                return {
                    "Place": place,
                    "Latitude": latitude,
                    "Longitude": longitude,
                    "Local Time (Morocco)": localTimeMorocco,
                    "Type": type,
                    "Magnitude": mag,
                    "Depth (km)": depth
                };
            });
            const totalCount = extractedData.length;

            return { data: extractedData, totalCount };
        })
        .catch((error) => {
            console.error('Error fetching earthquake data:', error);
        });
}

document.addEventListener("DOMContentLoaded", function () {
    fetchEarthquakeData()
        .then((result) => {
            const extractedData = result.data;
            const totalCount = result.totalCount;
            document.getElementById("numofeq").textContent = `Total Earthquakes: ${totalCount}`;
            document.getElementById("numofeq").insertAdjacentHTML('afterend', '<br>Refresh to update');
            displayEarthquakeInfo(extractedData[0]);
            DisplayEarthquakes(extractedData);
        });
});


function displayEarthquakeInfo(earthquake) {
    const content = `
        <p><strong><span style="color: green">Place:</span></strong> ${earthquake["Place"]}</p>
        <p><strong><span style="color: green;">Latitude:</span></strong> ${earthquake["Latitude"]}</p>
        <p><strong><span style="color: green;">Longitude:</span></strong> ${earthquake["Longitude"]}</p>
        <p><strong><span style="color: green;">Local Time:</span></strong> ${earthquake["Local Time (Morocco)"]}</p>
        <p><strong><span style="color: green;">Type:</span></strong> ${earthquake["Type"]}</p>
        <p><strong><span style="color: green;">Magnitude:</span></strong> ${earthquake["Magnitude"]}</p>
        <p><strong><span style="color: green;">Depth (km):</span></strong> ${earthquake["Depth (km)"]}</p>
        <button class="clear-button">Clear</button>
    `;
    const content2 = `
        <p><strong><span style="color: green;">Place:</span></strong> ${earthquake["Place"]}</p>
        <p><strong><span style="color: green;">Latitude:</span></strong> ${earthquake["Latitude"]}</p>
        <p><strong><span style="color: green;">Longitude:</span></strong> ${earthquake["Longitude"]}</p>
        <p><strong><span style="color: green;">Local Time:</span></strong> ${earthquake["Local Time (Morocco)"]}</p>
        <p><strong><span style="color: green;">Type:</span></strong> ${earthquake["Type"]}</p>
        <p><strong><span style="color: green;">Magnitude:</span></strong> ${earthquake["Magnitude"]}</p>
        <p><strong><span style="color: green;">Depth (km):</span></strong> ${earthquake["Depth (km)"]}</p>
        <button class="clear-button2">Clear</button>
    `;
    const sidebar = document.getElementById("sidecontent");
    const sidebar2 = document.getElementById("sidecontent2");
    sidebar.innerHTML = content;
    sidebar2.innerHTML = content2;
    const clearButton = document.querySelector(".clear-button");
    const clearButton2 = document.querySelector(".clear-button2")
    clearButton.addEventListener("click", clearSidebar);
    clearButton2.addEventListener("click", clearSidebar2);
}

function clearSidebar() {
    const sidebar = document.getElementById("sidecontent");
    sidebar.innerHTML = '<button class="clear-button">Clear</button>';
}
function clearSidebar2() {
    const sidebar2 = document.getElementById("sidecontent2");
    sidebar2.innerHTML = '<button class="clear-button2">Clear</button>';
}
var legend = L.control({ position: "bottomleft" });

legend.onAdd = function (map) {
    var legendDiv = L.DomUtil.create("div", "legend");
    legendDiv.innerHTML = `
        <label>
            <input type="checkbox" id="legend-toggle"> Show Legend
        </label>
        <div class="legend" id="legend-content">
            <h5>Magnitude Legend</h5>
            <i style="background: #008000"></i><span>mag < 3 </span><br>
            <i style="background: #FFFF00"></i><span>3 &le; mag < 4</span><br>
            <i style="background: #FFA500"></i><span>4 &le; mag < 6</span><br>
            <i style="background: #FF0000"></i><span>6 &le; mag < 7</span><br>
            <i style="background: #800080"></i><span>7 &le; mag < 9</span><br>
            <i style="background: #300025"></i><span>mag > 9</span><br>
        </div>
    `;
    return legendDiv;
};
legend.addTo(map);

var legendToggle = document.getElementById("legend-toggle");
var legendContent = document.getElementById("legend-content");

legendToggle.addEventListener("change", function () {
    if (legendToggle.checked) {
        legendContent.style.display = "block";
    } else {
        legendContent.style.display = "none";
    }
});

legendContent.style.display = "none";
overlays["Legend"] = legend;



function updateEarthquakeData() {
    fetchEarthquakeData()
        .then((extractedData) => {
            displayEarthquakeInfo(extractedData[0]);
            DisplayEarthquakes(extractedData)
            const oneDayInMillis = 24 * 60 * 60 * 1000;
            setTimeout(updateEarthquakeData, oneDayInMillis);
        });
}

updateEarthquakeData();
window.onload = function () {
    updateEarthquakeData();
};
function DisplayEarthquakes(data) {
    circleMarkersLayer.clearLayers();

    const colorStops = [0, 3, 4, 6, 7];
    const colors = ["#008000", "#FFFF00", "#FFA500", "#FF0000", "#800080"];

    data.forEach(function (earthquake) {
        const magnitude = parseFloat(earthquake["Magnitude"]);
        const dateStr = earthquake["Local Time"];
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const lat = parseFloat(earthquake["Latitude"]);
        const lon = parseFloat(earthquake["Longitude"]);

        let color = colors[0];
        for (let i = 0; i < colorStops.length; i++) {
            if (magnitude >= colorStops[i]) {
                color = colors[i];
            } else {
                break;
            }
        }

        const circleMarker = L.circleMarker([lat, lon], {
            radius: magnitude * 2,
            fillColor: color,
            fillOpacity: 0.8,
            color: "#000",
            weight: 1,
        });

        const popupContent = `Place: ${earthquake["Place"]}<br>Magnitude: ${magnitude}`;

        circleMarker.bindTooltip(popupContent);

        circleMarker.on("click", function () {
            displayEarthquakeInfo(earthquake);
        });
        circleMarkersLayer.addLayer(circleMarker);

    });
}

