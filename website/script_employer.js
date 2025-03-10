let mapRef = null; 
let firstLocation=false;
let markers = [];
let jobsData=[];
let applicationsData=[];
let usersData=[];
let selectedLocation = { latitude: 32.0153, longitude: 34.7874 }; // HIT Holon 
let employerID = null;

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        employerID = user.uid;
        filterById(employerID);
        fetchUserFromFirebase(employerID);
    }
});

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        employerID = user.uid;
        loadJobs(); // קריאת המשרות מה-Firebase כאשר המעסיק מחובר
        loadApplications(); // קריאת הבקשות בעת התחברות המעסיק

    } else {
        console.log("No user is signed in.");
    }
});

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


// קריאת המשרות מ-Firebase ושיוכן למעסיק המחובר
function getJobsFromFirebase(employerID) {
    db.collection("jobs").where("employerID", "==", employerID)
    .get()
    .then((querySnapshot) => {
        jobsData = []; // ריקון הנתונים הקודמים
        querySnapshot.forEach((doc) => {
            jobsData.push({ id: doc.id, ...doc.data() });
        });
        filterJobs(employerID); // רענון רשימת המשרות לאחר שליפת הנתונים
    })
    .catch((error) => {
        console.error("Error getting jobs: ", error);
    });
}

function loadJobs() {
    db.collection("jobs").where("employerID", "==", employerID)
        .get()
        .then((querySnapshot) => {
            jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            displayJobs();
        })
        .catch((error) => {
            console.error("Error loading jobs: ", error);
        });
}

function displayJobs() {
    const jobsList = document.getElementById("employerJobsList");
    removeAllChildNodes(jobsList);
    
    jobsData.forEach(job => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item", "list-group-item-action", "mb-1");
        listItem.style.padding = "5px"; 
        listItem.style.fontSize = "12px";
        listItem.textContent = job.description;
        listItem.id=job.id;
        listItem.addEventListener("click", function() { jobToEdit(job.id); });
        jobsList.appendChild(listItem);
    });
}


let jobsAfterFilter=[]; 

function appsList(app){
     let list = document.getElementById("applicationsList"); 
     let listItem = document.createElement("li");
     listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-start", "flex-column"); 
     let userName= document.createElement("h4");
     userName.innerHTML = app.name; listItem.append(userName); let jobDescription= document.createElement("h6");
     jobDescription.innerHTML = "applied for: "+app.description; listItem.append(jobDescription); 
     let appDate= document.createElement("h6"); 
     appDate.innerHTML = "on "+app.date; listItem.append(appDate); 
     let contactDetails= document.createElement("p");
     contactDetails.innerHTML = app.phone+" • "+app.email; listItem.append(contactDetails);
     list.append(listItem);
    }
// פונקציה לעדכון משרה חדשה
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
            employerID: employerID // נשתמש ב-employerID מהמעסיק המחובר
        };

        db.collection("jobs").add(newJob)
        .then((docRef) => {
            console.log("Job added with ID: ", docRef.id);
            showSuccessPopup("Job added successfully!");
            filterById(employerID); // רענון הרשימה לאחר הוספת המשרה החדשה
        })
        .catch((error) => {
            console.error("Error adding job: ", error);
            showErrorPopup("Failed to add job. Please try again.");
        });
    } else {
        alert("Please fill in all the job details.");
    }
}

// פונקציה לסינון משרות והפניות
function filterById(employerID) {
    filterJobs(employerID);
    filterApps(employerID);
}

// פונקציה לסינון המשרות של המעסיק והצגתן ברשימה מתחת למפה
function filterJobs(employerID) {
    const jobsList = document.getElementById("employerJobsList");
    removeAllChildNodes(jobsList);
    
    jobsData.forEach(job => {
        if (job.employerID === employerID) {
            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item", "list-group-item-action", "mb-1");
            listItem.style.padding = "5px"; 
            listItem.style.fontSize = "12px";
            listItem.textContent = job.description;

            listItem.addEventListener("click", function() { jobToEdit(job.id); });
            jobsList.appendChild(listItem);
        }
    });
}



// פונקציה להצגת פרטי מחפשי עבודה
function filterApps(employerID) {
    const relevantJobs = jobsData.filter(job => job.employerID === employerID);
    const relevantJobIds = relevantJobs.map(job => job.id);
    const relevantApplications = applicationsData.filter(application => relevantJobIds.includes(application.jobId));
    const applicationsWithUserDetails = relevantApplications.map(application => {
        const user = usersData.find(user => user.id === application.userId);
        const job = jobsData.find(job => job.id === application.jobId);
        return {
            jobId: application.jobId,
            userId: application.userId,
            date: application.date,
            description: job.description,
            name: user.name,
            email: user.email,
            phone: user.phone
        };
    });

    const jobApplicantsList = document.getElementById("jobApplicantsList");
    removeAllChildNodes(jobApplicantsList);

    if (applicationsWithUserDetails.length > 0) {
        applicationsWithUserDetails.forEach(applicant => {
            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-start", "flex-column");
            
            const userName = document.createElement("h4");
            userName.textContent = applicant.name;
            listItem.appendChild(userName);
            
            const appDate = document.createElement("h6");
            appDate.textContent = `Applied on: ${applicant.date}`;
            listItem.appendChild(appDate);
            
            const contactDetails = document.createElement("p");
            contactDetails.textContent = `${applicant.phone} • ${applicant.email}`;
            listItem.appendChild(contactDetails);
            
            jobApplicantsList.appendChild(listItem);
        });
    } else {
        const noApplicants = document.createElement("li");
        noApplicants.classList.add("list-group-item");
        noApplicants.textContent = "No applicants found for this job.";
    }
}


function showSuccessPopup(message) {
     const popup = document.createElement("div");
     popup.classList.add("popup-success"); 
     popup.innerText = message;
     document.body.appendChild(popup);
     setTimeout(() => { popup.remove(); }, 3000);
    }

    function editJob(jobId) {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); 
        const yyyy = today.getFullYear();
        const formattedDate = `${dd}/${mm}/${yyyy}`;
        
        if (document.getElementById("description").value && document.getElementById("salary").value) {
            let editedJob = {
                location: `${selectedLocation.latitude}, ${selectedLocation.longitude}`,
                description: document.getElementById("description").value,
                type: document.getElementById("type").value, 
                wage: document.getElementById("salary").value, 
                publicationDate: formattedDate,
                employerID: employerID
            };
    
            db.collection("jobs").doc(jobId).update(editedJob)
            .then(() => {
                console.log("Job updated with ID: ", jobId);
                showSuccessPopup("Job updated successfully!");
                loadJobs(); // רענון הרשימה לאחר עדכון המשרה
            })
            .catch((error) => {
                console.error("Error updating job: ", error);
                showErrorPopup("Failed to update job. Please try again.");
            });
        } else {
            alert("Please fill in all the job details.");
        }
    }
      
    
function deleteJob(jobId) {
    db.collection("jobs").doc(jobId).delete()
    .then(() => {
        console.log("Job deleted with ID: ", jobId);
        showSuccessPopup("Job deleted successfully!");
        loadJobs(); // רענון הרשימה לאחר מחיקת המשרה
    })
    .catch((error) => {
        console.error("Error deleting job: ", error);
        showErrorPopup("Failed to delete job. Please try again.");
    });
}

function loadApplications() {
    db.collection("applications")
        .where("employerID", "==", employerID)
        .get()
        .then((querySnapshot) => {
            const applicationsData = [];
            querySnapshot.forEach(async (doc) => {
                const application = doc.data();
                const userId = application.userId;
                const jobId = application.jobId;
                try {
                    const userDoc = await db.collection("users").doc(userId).get();
                    const jobsDoc = await db.collection("jobs").doc(jobId).get();
                    const userData = userDoc.data();
                    const jobsData = jobsDoc.data();
                    applicationsData.push({ application, userData,jobsData });
                    displayApplications(applicationsData);
                } catch (error) {
                    console.error("Error fetching user data: ", error);
                }
            });
        })
        .catch((error) => {
            console.error("Error loading applications: ", error);
        });
}

function displayApplications(applicationsData) {
    const applicationsList = document.getElementById("applicationsList");
    removeAllChildNodes(applicationsList);

    applicationsData.forEach(({ application, userData,jobsData }) => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-start", "flex-column");
        
        const jobDescription = document.createElement("h6");
        jobDescription.textContent = `Applied for: ${jobsData.description}`;
        listItem.appendChild(jobDescription);

        const userName = document.createElement("h6");
        userName.textContent = `Applied by: ${userData.name}`;
        listItem.appendChild(userName);
        
        const userEmail = document.createElement("h6");
        userEmail.textContent = `Email: ${userData.email}`;
        listItem.appendChild(userEmail);

        const userPhone = document.createElement("h6");
        userPhone.textContent = `Phone: ${userData.phone}`; // הוספת מספר הטלפון
        listItem.appendChild(userPhone);

        const appDate = document.createElement("h6");
        appDate.textContent = `On: ${application.date}`;
        listItem.appendChild(appDate);

        applicationsList.appendChild(listItem);
    });
}

    
    function jobToEdit(id) {
        let job = jobsData.find(job => job.id === id);
        if (!job) {
            console.error('Job not found.');
            return;
        }
        jobsData.forEach(job => {
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
        document.getElementById("description").value = job.description;
        document.getElementById("salary").value = job.wage;
        document.getElementById("type").value = job.type;
        document.getElementById("editJob").style.display = "block";
        document.getElementById("editJob").addEventListener("click", function() { editJob(job.id); });
        document.getElementById("editJob").style.display = "block";
        document.getElementById("deleteJob").addEventListener("click", function() { deleteJob(job.id); });
        document.getElementById("deleteJob").style.display = "block";
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
    
    function removeAllChildNodes(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
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
                    alert("Address Not Recognized!");
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
        firstLocation=true;
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
                if (firstLocation){
                    groupAndAddMarkers(); 
               }
            });
        }
        if (firstLocation){
             groupAndAddMarkers(); 
        }
        
    }

    
    