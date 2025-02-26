let mapRef = null;
let firstLocation= false;
let jobsData=[];
let selectedLocation = { latitude: 32.0153, longitude: 34.7874 }; // HIT Holon
let markers = [];

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
async function fetchUserFromFirebase(userId) {
    try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (userDoc.exists) {
            let chosenUser = { id: userId, ...userDoc.data() };
            document.getElementById("welcome").innerHTML="Welcome "+chosenUser.name+", "+document.getElementById("welcome").innerHTML;

        } else {
            console.error("No such user!");
        }
    } catch (error) {
        console.error("Error fetching user from Firebase:", error);
    }
}

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

    removeAllChildNodes(document.getElementById("jobsList"));
    jobsAfterFilter.forEach(job => {
        const [latitude, longitude] = job.location.split(", ").map(Number);
        if (locationsDistance(latitude, longitude) < getZoomLevel(parseInt(document.getElementById("distanceChange").value))) {
            jobsList(job, latitude, longitude);
        }
    });
    loadUserApplications();

}

function shareLocation() {
    firstLocation=true;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function loadUserApplications() {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.error("No user is signed in.");
        return;
    }

    const userId = user.uid;

    db.collection("applications")
        .where("userId", "==", userId)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const application = doc.data();
                markJobAsApplied(application.jobId);
            });
        })
        .catch((error) => {
            console.error("Error loading user applications: ", error);
        });
}

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        fetchUserFromFirebase(user.uid);
       // loadUserApplications(); // קריאת הבקשות של המשתמש
    }
});


function getZoomLevel(num) {
    let res = zoomLevels.find(item => item.zoomLevel === num);
    if (res) {
        return res.distanceKm;
    } 
    else {
        return 450;
    }
}

function rangeTicks() {
    const slider = document.getElementById('distanceChange');
    const ticks = document.getElementById('ticks');
    const step = parseInt(slider.step);
    
    // Clear previous ticks
    while (ticks.firstChild) {
        ticks.removeChild(ticks.firstChild);
    }

    for (let i = parseInt(slider.min); i <= parseInt(slider.max); i += step) {
        const tick = document.createElement('div');
        tick.classList.add('tick');
        tick.setAttribute('data-zoom', i);
        
        const line = document.createElement('div');
        line.classList.add('line');
        tick.appendChild(line);
        
        const label = document.createElement('div');
        label.classList.add('label');
        label.innerText = zoomLevels[i - parseInt(slider.min)].distanceKm.toFixed(0) + " KM";
        tick.appendChild(label);
        ticks.appendChild(tick);
        
        tick.addEventListener('click', function() {
            slider.value = i;
            initializeMap(i);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    rangeTicks();
});

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
    let applyArea = document.createElement("div");
    applyArea.id="apply"+job.id;
    list.append(applyArea);

    loadUserApplications();

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
        display: flex;
        align-items: center;
        justify-content: center;
        color: black; 
        font-size: 22px;
      ">
        🏬
      </div>
    `,
    iconSize: [22, 22], // שינוי בגודל האייקון
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
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

function initializeMap(zoom = 10) {
    if (mapRef) {
        mapRef.setView([selectedLocation.latitude, selectedLocation.longitude], zoom);
    } else {
        mapRef = L.map('map').setView([selectedLocation.latitude, selectedLocation.longitude], zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapRef);

        mapRef.on('zoomend', function() {
            const currentZoom = mapRef.getZoom();
            document.getElementById('distanceChange').value = currentZoom;
            updateSliderLabel(currentZoom);
            filterJobs(); // Update the job list based on the current zoom level
        });
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
    if (firstLocation){
        const selectedKey = `${selectedLocation.latitude},${selectedLocation.longitude}`;
        if (!groupedLocations[selectedKey]) {
            groupedLocations[selectedKey] = { items: [], icon: selectedLocationIcon };
        }
        groupedLocations[selectedKey].items.push({ description: "chosen location", id: "" });
    }
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
    firstLocation=true;
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

async function fetchJobsFromFirebase() {
    try {
        const snapshot = await db.collection("jobs").get();
        jobsData = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log("Fetched job data:", data); // בקרת אש: מידע המשרה שנשלף
            return {
                id: doc.id,
                ...data,
                employerID: data.employerID // ווידוא ששדה employerID נשמר
            };
        });

        console.log("Jobs data after fetching from Firebase:", jobsData); // בקרת אש: מידע המשרות לאחר השליפה
        initializeMap();
        filterJobs();
    } catch (error) {
        console.error("Error fetching jobs from Firebase:", error);
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
            if(document.getElementById(job.id)){
                document.getElementById(job.id).classList.add("active");
            }
        }
        else{
            if(document.getElementById(job.id)){
                document.getElementById(job.id).classList.remove("active");       
             }
        }
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

function apply(jobId) {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.error("No user is signed in.");
        alert("Please sign in to apply for jobs.");
        return;
    }

    const userId = user.uid;  // קבלת ה-ID של המשתמש המחובר
    const job = jobsData.find(job => job.id === jobId);
    if (!job) {
        console.error("Job not found.");
        return;
    }

    console.log("Job information before applying:", job); // בקרת אש: מידע המשרה לפני הגשת הבקשה

    const employerID = job.employerID;
    if (!employerID) {
        console.error("Employer ID is undefined.");
        return;
    }

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const formattedDate = `${dd}/${mm}/${yyyy}`;

    const newApplication = {
        jobId: jobId,
        userId: userId,  // שימוש ב-ID של המשתמש המחובר
        employerID: employerID,  // הוספת ID של המעסיק לבקשה
        date: formattedDate
    };

    console.log("Prepared application data:", newApplication); // בקרת אש: מידע הבקשה

    db.collection("applications").add(newApplication)
        .then(() => {
            console.log("Application submitted:", newApplication);
            alert("Your application has been submitted.");
            markJobAsApplied(jobId); // הוספת סימון שהגשת בקשה
        })
        .catch((error) => {
            console.error("Error submitting application:", error);
            alert("There was an error submitting your application. Please try again.");
        });
}


function showPosition(position) {
    selectedLocation.latitude = position.coords.latitude;
    selectedLocation.longitude = position.coords.longitude;
    initializeMap();

}

function updateSliderLabel(currentZoom) {
    const slider = document.getElementById('distanceChange');
    const ticks = document.getElementById('ticks').children;

    slider.value = currentZoom;

    for (let i = 0; i < ticks.length; i++) {
        const tick = ticks[i];
        const label = tick.querySelector('.label');
        if (parseInt(tick.getAttribute('data-zoom')) === currentZoom) {
            tick.classList.add('active-tick');
            label.style.fontWeight = 'bold';
        } else {
            tick.classList.remove('active-tick');
            label.style.fontWeight = 'normal';
        }
    }
}

function markJobAsApplied(jobId) {
    const listItem = document.getElementById("apply"+jobId); 
    if (listItem) {
        removeAllChildNodes(listItem); 
        listItem.classList.add("applied");
        const appliedText = document.createElement("span");
        appliedText.classList.add("badge", "bg-success", "ms-2");
        appliedText.innerText = "Applied";
        appliedText.id="applied";
        listItem.appendChild(appliedText);
    }
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
