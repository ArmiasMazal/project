let mapRef = null;
let markers = [];
let selectedLocation = { latitude: "31.5", longitude: "35" };
let jobsData = [
    { id:"3",location: "32.079190427494176, 34.76864670707262", description: "מחפשים טבח/ית לצוות, למשרה מלאה בואו להצטרף לצוות שהוא כמו משפחה!!", type:"full time", wage:"45", publicationDate:"01/02/2025",emplpoyerID:"1" },
    { id:"4",location: "32.079190427494176, 34.76864670707262", description: "מחפשים מארחת לצוות, למשרה חלקית בואי להצטרף לצוות שהוא כמו משפחה!!", type:"part time", wage:"35", publicationDate:"10/02/2025",emplpoyerID:"1" },
    { id:"2",location: "32.31353217383461, 34.84667905081852", description: "מחפשים קונדיטור/ית לצוות, למשרה מלאה בואו להצטרף לצוות המלון !!",type:"full time", wage:"50", publicationDate:"01/01/2025",emplpoyerID:"2" },
    { id:"1",location: "31.662033197806444, 34.55998114149099", description: "מחפשים אח/ות למחלקת יולדות, למשרה מלאה.דרוש/ה אח/ות עם ניסיון והמלצות!!",type:"full time", wage:"40", publicationDate:"01/11/2024",emplpoyerID:"3" }
];
let jobsAfterFilter=[];
const zoomLevels = [
    { zoomLevel: 7, distanceKm: 512 },
    { zoomLevel: 8, distanceKm: 256 },
    { zoomLevel: 9, distanceKm: 112},
    { zoomLevel: 10, distanceKm: 32},
    { zoomLevel: 11, distanceKm: 16 },
    { zoomLevel: 12, distanceKm: 8 },
    { zoomLevel: 13, distanceKm: 4 },
    { zoomLevel: 14, distanceKm: 2 },
    { zoomLevel: 15, distanceKm: 1 }
];


function filterJobs() {
    jobsAfterFilter = [];
    const submittedSalary = parseFloat(document.getElementById("salary").value);
    const submittedDate = new Date(document.getElementById("date").value);
    const submittedType = document.getElementById("type").value;
    
    jobsData.forEach(job => {
        let canEnter = true;
        if (!isNaN(submittedSalary) && submittedSalary > job.wage) canEnter = false;
        if (!isNaN(submittedDate) && submittedDate > new Date(job.publicationDate)) canEnter = false;
        if (submittedType && submittedType !== job.type) canEnter = false;
        if (canEnter) jobsAfterFilter.push(job);
    });

    if (jobsAfterFilter.length === 0) {
        alert("We couldn't find jobs that match these filters");
    }
    removeAllChildNodes(document.getElementById("jobsList"));
    jobsAfterFilter.forEach(job => {
        const [latitude, longitude] = job.location.split(", ").map(Number);
        if (locationsDistance(latitude, longitude) < getZoomLevel(parseInt(document.getElementById("distanceChange").value))) {
            jobsList(job, latitude, longitude);
        }
    });

}

function getZoomLevel(num) {
    let res = zoomLevels.find(item => item.zoomLevel === num);
    if (res) {
        return res.distanceKm;
    } 
    else {
        return 450;
    }
}

function rangeTicks(){
    const slider = document.getElementById('distanceChange');
    const ticks = document.getElementById('ticks');
    const min = parseInt(slider.min);
    const max = parseInt(slider.max);
    const step = parseInt(slider.step);
    let j=0;
    for (let i = min; i <= max; i += step) {
        const tick = document.createElement('div');
        tick.classList.add('tick');

        const line = document.createElement('div');
        line.classList.add('line');
        tick.appendChild(line);

        const label = document.createElement('div');
        label.classList.add('label');
        label.innerText = zoomLevels[j].distanceKm.toFixed(0)+" KM";
        tick.appendChild(label);
        ticks.appendChild(tick);
        j++;
    }
}
function jobsList(job,lat,long){
    let list = document.getElementById("jobsList");
    let listItem = document.createElement("li");
    listItem.classList.add("list-group-item", "list-group-item-action", "mb-1");
    listItem.style.padding = "5px"; // Adjust padding to make the item smaller
    listItem.style.fontSize = "12px"; // Adjust font size to make the text smaller
    listItem.addEventListener("click", function() { showJob(job.id); });
    listItem.id = job.id;
    listItem.innerHTML = job.description + " (" + locationsDistance(lat, long).toFixed(2) + " KM)";
    list.append(listItem);

}
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }
function locationsDistance(lat, lon) {
   const toRadians = (degrees) => degrees * (Math.PI / 180);
 
   const R = 6371; 
   const dLat = toRadians(selectedLocation.latitude - lat);
   const dLon = toRadians(selectedLocation.longitude - lon);
   const a =
     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
     Math.cos(toRadians(lat)) * Math.cos(toRadians(selectedLocation.latitude)) *
     Math.sin(dLon / 2) * Math.sin(dLon / 2);
   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
 
   return R * c;
}
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
    iconAnchor: [30, 30],
    popupAnchor: [0, -30],
});

const selectedLocationIcon = L.divIcon({
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
        🏠
      </div>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    popupAnchor: [0, -30],
});

function initializeMap(zoom = 7) {
    zoom=document.getElementById("distanceChange").value;
    //console.log("Showing around: " + selectedLocation.latitude + ", " + selectedLocation.longitude);
    if (mapRef) {
        mapRef.setView([selectedLocation.latitude, selectedLocation.longitude], zoom);
    } else {
        mapRef = L.map('map').setView([selectedLocation.latitude, selectedLocation.longitude], zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapRef);
    }
    filterJobs();
    groupAndAddMarkers(); 
}

function groupAndAddMarkers() {
    let groupedLocations = {};
    jobsAfterFilter.forEach(item => {
        const [latitude, longitude] = item.location.split(", ").map(Number);
        if (isNaN(latitude) || isNaN(longitude)) {
            console.warn(`Missing or invalid coordinates for item:`, item);
            return;
        }
        const key = `${latitude},${longitude}`;
        if (!groupedLocations[key]) {
            groupedLocations[key] = { items: [], icon: BusinessesIcon };
        }
        groupedLocations[key].items.push(item);
    });

    const selectedKey = `${selectedLocation.latitude},${selectedLocation.longitude}`;
    if (!groupedLocations[selectedKey]) {
        groupedLocations[selectedKey] = { items: [], icon: selectedLocationIcon };
    }
    groupedLocations[selectedKey].items.push({ description: "chosen location",id:"" });

    addMarkersToMap(groupedLocations);
}

function addMarkersToMap(groupedLocations) {
    markers.forEach(marker => marker.remove());
    markers = [];

    for (const key in groupedLocations) {
        const [latitude, longitude] = key.split(",").map(Number);
        if (isNaN(latitude) || isNaN(longitude)) {
            console.warn(`Invalid coordinates: ${latitude}, ${longitude}`);
            continue;
        }

        const popupContent = generatePopupContent(groupedLocations[key].items);
        const marker = L.marker([latitude, longitude], { icon: groupedLocations[key].icon });
        marker.bindPopup(popupContent, { maxHeight: 400 });
        marker.addTo(mapRef);
        markers.push(marker);
    }
}

function generatePopupContent(items) {
    return `
        <div>
        ${items.map(item => 
            `<div>
              <p>${item.description || 'Unnamed'}</p>
              ${item.id ? `<button value=${item.id} onclick='showJob(this.value)'>More Details</button>` : ''}
            </div>`
          ).join('')}
                  </div>
    `;
}

function submitLocation() {
    const address = document.getElementById("address").value;
    forwardGeocode(address).then(coordinates => {
        //console.log(`The coordinates for the address are: ${JSON.stringify(coordinates)}`);
        selectedLocation.latitude = coordinates.lat;
        selectedLocation.longitude = coordinates.lon;

        initializeMap();
    }).catch(error => {
        console.error('Error:', error);
    });
}

async function forwardGeocode(address) {
    const apiKey = '678d0f6e83e2a988572710gtp534d4c';
    const url = `https://geocode.maps.co/search?q=${encodeURIComponent(address)}&api_key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
                return { lat: data[0].lat, lon: data[0].lon };
            } else {
                alert("Address Not Recognized!")
                throw new Error("No results found");
            }
        } else {
            throw new Error(`Error: ${response.status}`);
        }
    } catch (error) {
        console.error('Error:', error);
        throw new Error('An error occurred');
    }
}
async function getStations(location) {
    let fixedLoc = location.replace(/\s+/g, ''); 
    const apiKey = 'iK36yK63sjpS1Dcs0qf0bhSOBGiekuIhH81ERyUEvYY';
    const url = `https://transit.hereapi.com/v8/stations?in=${fixedLoc};r=1000000&apiKey=${apiKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        if (data.stations && data.stations.length > 0) {
            return data.stations;
        } else {
            throw new Error("No results found");
        }
    } catch (error) {
        console.error('Error:', error);
        throw new Error('An error occurred while fetching stations');
    }
}

function showJob(id){
    
    let job = jobsAfterFilter.find(job => job.id === id);
    if (!job) {
        console.error('Job not found.');
        return;
    }
    let details = document.getElementById("jobDetails");
    if (!details) {
        console.error('Element jobDetails not found.');
        return;
    }
    jobsAfterFilter.forEach(job => {
        if(job.id==id){
            document.getElementById(job.id).classList.add("active");
        }
        else{
            document.getElementById(job.id).classList.remove("active");        }
    });
    removeAllChildNodes(details);
    let jobDescription = document.createElement("h5");
    jobDescription.classList.add("card-text");
    jobDescription.innerHTML = job.description;
    details.append(jobDescription);
    let jobApply = document.createElement("button");
    jobApply.classList.add("mt-0","mb-2");
    jobApply.innerHTML ="Apply to the job";
    jobApply.addEventListener("click", function() { apply(job.id,1); });
    details.append(jobApply);
    let jobDate = document.createElement("h6");
    jobDate.classList.add("card-subtitle", "mb-2", "text-body-secondary");
    jobDate.innerHTML = `Published: ${job.publicationDate}`;
    details.append(jobDate);
    let jobWage = document.createElement("h6");
    jobWage.classList.add("card-subtitle", "mb-2", "text-body-secondary");
    jobWage.innerHTML = `${job.wage}₪ per hour`;
    details.append(jobWage);
    let jobType = document.createElement("h6");
    jobType.classList.add("card-subtitle", "mb-2", "text-body-secondary");
    jobType.innerHTML = job.type;
    details.append(jobType);
    (async () => {
        try {
            let stations = await getStations(job.location);
            if (stations) {
                stations.forEach(station => {
                    let jobStation = document.createElement("p");
                    jobStation.classList.add("card-subtitle", "mb-1", "text-body-secondary");
                    jobStation.innerHTML = "🚍 " + station.place.name;
                    details.append(jobStation);
                });
            }
        } catch (error) {
            console.error(error.message);
        }
    })();
    
}
function apply(jobId,userId){
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();
    const formattedDate = `${dd}/${mm}/${yyyy}`;
    let newApplication= { jobId:jobId,userId:userId,date:formattedDate };
    console.log(newApplication);
}
function shareLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    selectedLocation.latitude = position.coords.latitude;
    selectedLocation.longitude = position.coords.longitude;
    initializeMap();

}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}
