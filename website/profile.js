let chosenUser = {};
let userRole = "";
let editFieldId = null;

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        const userId = user.uid; // השגת מזהה המשתמש המחובר
        fetchUserFromFirebase(userId);
    } else {
        console.error("No user is signed in.");
        alert("Please sign in to access your profile.");
        window.location.href = "login.html"; // הפניה לעמוד ההתחברות
    }
});

async function fetchUserFromFirebase(userId) {
    try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (userDoc.exists) {
            chosenUser = { id: userId, ...userDoc.data() };
            userRole = chosenUser.role; // שמירת התפקיד של המשתמש
            populateForm(chosenUser); // Populate form with user details
        } else {
            console.error("No such user!");
        }
    } catch (error) {
        console.error("Error fetching user from Firebase:", error);
    }
}

function populateForm(user) {
    document.getElementById("name").value = user.name || "";
    document.getElementById("email").value = user.email || "";
    document.getElementById("phone").value = user.phone || "";
    document.getElementById("password").value = user.password || "";
}

document.getElementById("profile-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    let editedUser = { ...chosenUser }; // Copy the original user data

    if (editFieldId) {
        if (editFieldId === "password") {
            firebase.auth().currentUser.updatePassword(password).then(() => {
                console.log("Password successfully updated!");
                editedUser[editFieldId] = password;
                saveUserDetails(editedUser);
            }).catch((error) => {
                console.error("Error updating password: ", error);
                alert("Error updating password: " + error.message);
            });
        } else {
            editedUser[editFieldId] = document.getElementById(editFieldId).value;
            saveUserDetails(editedUser);
        }
    }
});

function saveUserDetails(editedUser) {
    console.log("edit user by id:" + chosenUser.id);
    db.collection("users").doc(chosenUser.id).update(editedUser)
        .then(() => {
            console.log("User successfully updated!");
            alert("Profile updated successfully!");
            populateForm(editedUser); // Update form with new details
            chosenUser = editedUser; // Update chosenUser with new details
            toggleEditMode(false); // Switch back to read-only mode
        })
        .catch((error) => {
            console.error("Error updating user: ", error);
        });
}

document.getElementById("edit-name").addEventListener("click", function () {
    toggleEditField("name", true);
});

document.getElementById("edit-email").addEventListener("click", function () {
    toggleEditField("email", true);
});

document.getElementById("edit-phone").addEventListener("click", function () {
    toggleEditField("phone", true);
});

document.getElementById("edit-password").addEventListener("click", function () {
    toggleEditField("password", true);
});

document.getElementById("cancel-btn").addEventListener("click", function () {
    populateForm(chosenUser); // Reset form to original values
    toggleEditMode(false);
});

document.getElementById("back-btn").addEventListener("click", function () {
    if (userRole === "job_seeker") {
        window.location.href = "jobseeker.html";
    } else if (userRole === "employer") {
        window.location.href = "employer.html";
    } else {
        window.location.href = "website.html"; // דף ברירת מחדל
    }
});

function toggleEditMode(editMode) {
    const isReadOnly = !editMode;
    document.querySelectorAll("input").forEach(input => {
        if (input.id !== editFieldId) {
            input.readOnly = true; // Ensure other fields remain readonly
        } else {
            input.readOnly = !editMode;
        }
    });
    document.querySelectorAll(".edit-btn").forEach(button => {
        button.style.display = isReadOnly ? "inline" : "none";
    });
    document.getElementById("save-btn").style.display = editMode ? "inline" : "none";
    document.getElementById("cancel-btn").style.display = editMode ? "inline" : "none";
}

function toggleEditField(fieldId, editMode) {
    editFieldId = fieldId;
    const field = document.getElementById(fieldId);
    field.readOnly = !editMode;
    if (editMode) {
        toggleEditMode(true);
    }
}






