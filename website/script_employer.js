
let mapRef = null;
let markers = [];
let selectedLocation = { latitude: 32.0153, longitude: 34.7874 }; // HIT Holon
let jobsData = [
    { id:"3",location: "32.079190427494176, 34.76864670707262", description: "מחפשים טבח/ית לצוות, למשרה מלאה בואו להצטרף לצוות שהוא כמו משפחה!!", type:"full time", wage:"45", publicationDate:"01/02/2025",employerID:"1" },
    { id:"4",location: "32.079190427494176, 34.76864670707262", description: "מחפשים מארחת לצוות, למשרה חלקית בואי להצטרף לצוות שהוא כמו משפחה!!", type:"part time", wage:"35", publicationDate:"10/02/2025",employerID:"1" },
    { id:"2",location: "32.31353217383461, 34.84667905081852", description: "מחפשים קונדיטור/ית לצוות, למשרה מלאה בואו להצטרף לצוות המלון !!",type:"full time", wage:"50", publicationDate:"01/01/2025",employerID:"2" },
    { id:"1",location: "31.662033197806444, 34.55998114149099", description: "מחפשים אח/ות למחלקת יולדות, למשרה מלאה.דרוש/ה אח/ות עם ניסיון והמלצות!!",type:"full time", wage:"40", publicationDate:"01/11/2024",employerID:"3" }
 ];
 let applicationsData = [
    { jobId:"3",userId:"2",date:"31/01/2025" },
    { jobId:"4",userId:"1",date:"15/02/2025" },
    { jobId:"2",userId:"4",date:"12/01/2025" },
    { jobId:"1",userId:"3",date:"17/01/2025" },
    { jobId:"4",userId:"4",date:"28/01/2025" },
    { jobId:"3",userId:"4",date:"30/01/2025" }
    ];
let usersData = [
    { id:"1", name:"shira shir",email:"shir@gmail.com",phone:"0547778899",password:"1234",role:"jobseeker"},
    { id:"2", name:"ben cohen",email:"bc@gmail.com",phone:"0501234567",password:"0987654321",role:"jobseeker"},
    { id:"3", name:"dana din",email:"dana@gmail.com",phone:"0506743388",password:"pass",role:"jobseeker"},
    { id:"4", name:"hel lo",email:"nice69@gmail.com",phone:"0538479253",password:"asdf",role:"jobseeker"}
];
let jobsAfterFilter=[];
function jobsList(list,job){
    let listItem = document.createElement("li");
    listItem.classList.add("list-group-item", "list-group-item-action", "mb-1");
    listItem.style.padding = "5px"; 
    listItem.style.fontSize = "12px"; 
    listItem.addEventListener("click", function() { jobToEdit(job.id); });
    listItem.id = ("job"+job.id);
    listItem.innerHTML = job.description;
    list.append(listItem);
    
}
function appsList(app){
    let list = document.getElementById("applicationsList");
    let listItem = document.createElement("li");
    listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-start", "flex-column");
    let userName= document.createElement("h4");
    userName.innerHTML = app.name;
    listItem.append(userName);
    let jobDescription= document.createElement("h6");
    jobDescription.innerHTML = "applied for: "+app.description;
    listItem.append(jobDescription);
    let appDate= document.createElement("h6");
    appDate.innerHTML = "on "+app.date;
    listItem.append(appDate);
    let contactDetails= document.createElement("p");
    contactDetails.innerHTML = app.phone+" • "+app.email;
    listItem.append(contactDetails);
    list.append(listItem);
    
}
function filterById(id=1){
    filterJobs(id);
    filterApps(id);
}

function submitJob() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); 
    const yyyy = today.getFullYear();
    const formattedDate = `${dd}/${mm}/${yyyy}`;
    
    if (document.getElementById("description").value && document.getElementById("salary").value) {
        let newJob = {
            location: `${selectedLocation.latitude}, ${selectedLocation.longitude}`,
            description: document.getElementById("description").value,
            type: document.getElementById("type").value, 
            wage: document.getElementById("salary").value, 
            publicationDate: formattedDate,
            employerID: "1"
        };

        db.collection("jobs").add(newJob)
        .then((docRef) => {
            console.log("Job added with ID: ", docRef.id);
            showSuccessPopup("Job added successfully!");
        })
        .catch((error) => {
            console.error("Error adding job: ", error);
            showErrorPopup("Failed to add job. Please try again.");
        });
    } else {
        alert("Please fill in all the job details.");
    }
}

function showSuccessPopup(message) {
    const popup = document.createElement("div");
    popup.classList.add("popup-success");
    popup.innerText = message;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 3000);
}

function showErrorPopup(message) {
    const popup = document.createElement("div");
    popup.classList.add("popup-error");
    popup.innerText = message;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 3000);
}

function editJob(jobId){
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); 
    const yyyy = today.getFullYear();
    const formattedDate = `${dd}/${mm}/${yyyy}`;
    if(document.getElementById("description").value&&document.getElementById("description").value&&document.getElementById("salary").value){
        console.log("edit job by id:"+jobId);
        let edittedJob={
            location:selectedLocation.latitude+", "+selectedLocation.longitude,
            description: document.getElementById("description").value,
            type:document.getElementById("type").value, 
            wage:document.getElementById("salary").value, 
            publicationDate:formattedDate,
            employerID:"1" };
        console.log(edittedJob);
    }
    else{
        alert("fill in all the job details");
    }
}
function deleteJob(jobId){
    console.log("deleted job by id:"+jobId);
}
function filterApps(employerID) {
    const relevantJobs =[];
    jobsData.forEach(job => {
        if(job.employerID==employerID){
            relevantJobs.push(job);
        }
    });
    const relevantJobIds = relevantJobs.map(job => job.id);
    const relevantApplications = applicationsData.filter(application => relevantJobIds.includes(application.jobId));
    const applicationsWithUserDetails = relevantApplications.map(application => {
        const user = usersData.find(user => user.id === application.userId);
        const job = jobsData.find(job => job.id === application.jobId);
        return {
            jobId: application.jobId,
            userId: application.userId,
            date: application.date,
            description:job.description,
            name: user.name,
            email: user.email,
            phone: user.phone
        };
    });
    if (applicationsWithUserDetails.length > 0) {
        removeAllChildNodes(document.getElementById("applicationsList"));
        applicationsWithUserDetails.forEach(app => {
            appsList(app);
        });
    } else {
        console.log("No applications found for the given employerID.");
    }
}
function jobToEdit(id){
    
    let job = jobsAfterFilter.find(job => job.id === id);
    if (!job) {
        console.error('Job not found.');
        return;
    }
    document.getElementById("description").value=job.description;
    document.getElementById("salary").value=job.wage;
    document.getElementById("type").value=job.type;
    document.getElementById("editJob").style.display="block";
    document.getElementById("editJob").addEventListener("click", function() { editJob(job.id); });
    document.getElementById("editJob").style.display="block";
    document.getElementById("deleteJob").addEventListener("click", function() { deleteJob(job.id); });
    document.getElementById("deleteJob").style.display="block";
    jobsAfterFilter.forEach(job => {
        if(job.id==id){
            document.getElementById("job"+job.id).classList.add("active");
        }
        else{
            document.getElementById("job"+job.id).classList.remove("active");
        }
    });
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

function initializeMap(zoom = 15) {
    if (mapRef) {
        mapRef.setView([selectedLocation.latitude, selectedLocation.longitude], zoom);
    } else {
        mapRef = L.map('map').setView([selectedLocation.latitude, selectedLocation.longitude], zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapRef);

        // Add click event to map
        mapRef.on('click', function(e) {
            selectedLocation.latitude = e.latlng.lat;
            selectedLocation.longitude = e.latlng.lng;
            groupAndAddMarkers();
        });
    }
    groupAndAddMarkers(); 
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }
function filterJobs(employerID) {
    jobsAfterFilter = [];
    jobsData.forEach(job => {
        if(job.employerID==employerID){
            jobsAfterFilter.push(job);
        }
    });
    let list = document.getElementById("jobsList");
    removeAllChildNodes(list);
    if (jobsAfterFilter.length === 0) {
        alert("You don't have any jobs");
    }
    else{
        let title = document.createElement("h3");
        title.classList.add("mb-1");
        title.style.padding = "5px"; 
        title.style.fontSize = "15px"; 
        title.innerHTML = "Your jobs: click a job to edit it";
        list.append(title);
    }
    jobsAfterFilter.forEach(job => {
        jobsList(list,job);
    });
}

function groupAndAddMarkers() {
    // ננקה את הסמנים הישנים
    markers.forEach(marker => marker.remove());
    markers = [];

    // נוסיף את המיקום הנבחר
    let groupedLocations = {};
    const selectedKey = `${selectedLocation.latitude},${selectedLocation.longitude}`;
    if (!groupedLocations[selectedKey]) {
        groupedLocations[selectedKey] = { items: [], icon: BusinessesIcon };
    }
    groupedLocations[selectedKey].items.push({ description: "chosen location", id: "" });

    // נוסיף את הסמנים החדשים למפה
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

mapRef.on('click', function(e) {
    selectedLocation.latitude = e.latlng.lat;
    selectedLocation.longitude = e.latlng.lng;
    groupAndAddMarkers();
});

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


