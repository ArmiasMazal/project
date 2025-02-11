

let mapRef = null;
let groupedLocations = {};
let markers = [];

const BusinessesIcon = L.divIcon({
    className: "custom-icon",
    html: `
      <div style="
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 22px;
      ">
        🏬
      </div>
    `,
    iconSize: [60, 60],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
});

window.initializeMap = function() {
    if (mapRef) return;
    mapRef = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef);
    groupAndAddMarkers();
};

function groupAndAddMarkers() {
    groupedLocations = {};
    const allData = [
        { location: "32.079190427494176, 34.76864670707262", descript: "טבח..." },
        { location: "32.079190427494176, 34.76864670707262", descript: "מארחת..." },
        { location: "32.31353217383461, 34.84667905081852", descript: "קונדיטור..." },
        { location: "31.662033197806444, 34.55998114149099", descript: "אחות..." }
    ];
    allData.forEach(item => {
        let splitLocation = item.location.split(", ");
        let latitude = splitLocation[0];
        let longitude = splitLocation[1];
        if (!latitude || !longitude) {
          console.warn(`Missing coordinates for item:`, item);
          return;
        }

        const key = `${latitude},${longitude}`;
        if (!groupedLocations[key]) {
          groupedLocations[key] = { items: [], icon: BusinessesIcon };
        }
        groupedLocations[key].items.push(item);
      });
      addMarkersToMap();
}

function addMarkersToMap() {
    for (const key in groupedLocations) {
        const items = groupedLocations[key].items;
        const firstItem = items[0];

        let splitLocation = firstItem.location.split(", ");
        let latitude = parseFloat(splitLocation[0]);
        let longitude = parseFloat(splitLocation[1]);

        if (isNaN(latitude) || isNaN(longitude)) {
          console.warn(`Invalid coordinates: ${latitude}, ${longitude}`);
          continue;
        }

        const popupContent = generatePopupContent(items);
        const marker = L.marker([latitude, longitude], { icon: BusinessesIcon });

        marker.bindPopup(popupContent, { maxHeight: 400 });
        marker.addTo(mapRef);
        markers.push(marker);
      }
}

function generatePopupContent(items) {
    let content = '<div class="popup-content">';
    items.forEach(item => {
        content += `<div> ${item.descript || 'Unnamed'} <br/><button>More Details</button></div>`;
    });
    content += '</div>';
    return content;
}
