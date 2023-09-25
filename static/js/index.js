var maxBounds = L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180));
var map = L.map('map', {
    center: [29, -10],
    zoom: 5,
    maxBounds: maxBounds, 
    maxZoom: 25,
    minZoom: 1
});
var streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 25,
});

var topographicLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 25,
});

var cartoDBDarkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    maxZoom: 25,
});

var cartoDBVoyagerLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
    maxZoom: 25,
});

var satelliteLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    maxZoom: 25,
    accessToken: API_KEY
});

var satellitesrtLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    maxZoom: 25,
    accessToken: API_KEY
});

var nightnavLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/navigation-night-v1/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    maxZoom: 25,
    accessToken: API_KEY
});

var daynavLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    maxZoom: 25,
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

daynavLayer.addTo(map);

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


const sidebar = document.getElementById("sidecontent");
const sidebar2 = document.getElementById("sidecontent2")

function findMostRecentEarthquake(data) {
    data.sort((a, b) => {
        const dateA = new Date(a["Timestamp"] || a["Date"]);
        const dateB = new Date(b["Timestamp"] || b["Date"]);
        return dateB - dateA;
    });

    return data[0];
}





document.addEventListener("DOMContentLoaded", function () {
    const mostRecentEarthquake = findMostRecentEarthquake(data);

    displayEarthquakeInfo(mostRecentEarthquake);
    filterAndDisplayEarthquakes();

});
let isEarthquakeInfoDisplayed = false;


function displayEarthquakeInfo(earthquake) {
    const numberOfFeltReports = parseInt(earthquake["Number of felt reports"]);
    const numberOfStations = parseInt(earthquake["Number of Stations"]);

    const localTime = new Date(earthquake["Local Time"]);
    const dayPart = `${localTime.getFullYear()}-${(localTime.getMonth() + 1).toString().padStart(2, '0')}-${localTime.getDate().toString().padStart(2, '0')}`;
    const timePart = `${localTime.getHours().toString().padStart(2, '0')}:${localTime.getMinutes().toString().padStart(2, '0')}:${localTime.getSeconds().toString().padStart(2, '0')}`;

    const content = `
        <p><strong><span style="color: black;">Place:</span></strong> ${earthquake["Place"]}</p>
        <p><strong><span style="color: black;">Latitude:</span></strong> ${earthquake["Latitude"]}</p>
        <p><strong><span style="color: black;">Longitude:</span></strong> ${earthquake["Longitude"]}</p>
        <p><strong><span style="color: black;">Local Day:</span></strong> ${dayPart}</p>
        <p><strong><span style="color: black;">Local Hour (GMT+1):</span></strong> ${timePart}</p>
        <p><strong><span style="color: black;">Type:</span></strong> ${earthquake["(Earthquake | Quarry)"]}</p>
        <p><strong><span style="color: black;">Magnitude:</span></strong> ${earthquake["Magnitude"]}</p>
        <p><strong><span style="color: black;">Depth (km):</span></strong> ${earthquake["Depth (km)"]}</p>
        <p><strong><span style="color: black;">Number of felt reports:</span></strong> ${numberOfFeltReports}</p>
        <p><strong><span style="color: black;">Number of stations:</span></strong> ${numberOfStations}</p>
        <p><strong><span style="color: black;">Algorithm:</span></strong> ${earthquake["Method/Algrothim"]}</p>
        <button class="clear-button">Clear</button>
    `;
    const content2 = `
        <p><strong><span style="color: black;">Place:</span></strong> ${earthquake["Place"]}</p>
        <p><strong><span style="color: black;">Latitude:</span></strong> ${earthquake["Latitude"]}</p>
        <p><strong><span style="color: black;">Longitude:</span></strong> ${earthquake["Longitude"]}</p>
        <p><strong><span style="color: black;">Local Day:</span></strong> ${dayPart}</p>
        <p><strong><span style="color: black;">Local Hour (GMT+1):</span></strong> ${timePart}</p>
        <p><strong><span style="color: black;">Type:</span></strong> ${earthquake["(Earthquake | Quarry)"]}</p>
        <p><strong><span style="color: black;">Magnitude:</span></strong> ${earthquake["Magnitude"]}</p>
        <p><strong><span style="color: black;">Depth (km):</span></strong> ${earthquake["Depth (km)"]}</p>
        <p><strong><span style="color: black;">Number of felt reports:</span></strong> ${numberOfFeltReports}</p>
        <p><strong><span style="color: black;">Number of stations:</span></strong> ${numberOfStations}</p>
        <p><strong><span style="color: black;">Algorithm:</span></strong> ${earthquake["Method/Algrothim"]}</p>
        <button class="clear-button2">Clear</button>
    `;
    sidebar.innerHTML = content;
    sidebar2.innerHTML = content2;
    isEarthquakeInfoDisplayed = true;
    const clearButton = document.querySelector(".clear-button");
    const clearButton2 = document.querySelector(".clear-button2");
    clearButton.addEventListener("click", clearSidebar);
    clearButton2.addEventListener("click", clearSidebar2);

}

function clearSidebar() {
    sidebar.innerHTML = `<button class="clear-button">Clear</button>`;
    isEarthquakeInfoDisplayed = false;
}

function clearSidebar2() {
    sidebar2.innerHTML = `<button class="clear-button2">Clear</button>`;
    isEarthquakeInfoDisplayed = false;
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



function filterAndDisplayEarthquakes() {
    const magnitudeThreshold = parseFloat(document.getElementById("magnitudeSlider").value);
    const startYear = parseInt(document.getElementById("slider-1").value);
    const endYear = parseInt(document.getElementById("slider-2").value);
    circleMarkersLayer.clearLayers();

    const colorStops = [0, 3, 4, 6, 7, 9];
    const colors = ["#008000", "#FFFF00", "#FFA500", "#FF0000", "#800080", "#300025"];
    data.forEach(function (earthquake) {
        const magnitude = parseFloat(earthquake["Magnitude"]);
        const dateStr = earthquake["Local Time"];
        const date = new Date(dateStr);
        const year = date.getFullYear();
        if (magnitude >= magnitudeThreshold && year >= startYear && year <= endYear) {
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

            const circleMarker = L.circleMarker([lon, lat], {
                radius: magnitude * 2.5,
                fillColor: color,
                fillOpacity: 0.7,
                color: "#000",
                weight: 1,
            });

            const popupContent = `Place: ${earthquake["Place"]}<br>Magnitude: ${magnitude}`;
            circleMarker.bindTooltip(popupContent);

            circleMarker.on("click", function () {
                displayEarthquakeInfo(earthquake);
            });
            circleMarkersLayer.addLayer(circleMarker);
        }
    });
}

document.getElementById("magnitudeSlider").addEventListener("input", filterAndDisplayEarthquakes);
document.getElementById("slider-1").addEventListener("input", filterAndDisplayEarthquakes);
document.getElementById("slider-2").addEventListener("input", filterAndDisplayEarthquakes);


