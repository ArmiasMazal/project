let usersData = [];
let chosenUser = {};

async function fetchUsersFromFirebase() {
    try {
        const snapshot = await db.collection("users").get();
        usersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        filterUser(1); // ברירת מחדל 1, אבל צריך להשתמש במזהה המשתמש המחובר
    } catch (error) {
        console.error("Error fetching user from Firebase:", error);
    }
}

function filterUser(id) { 
    usersData.forEach(user => {
        if (user.id === id) {
            chosenUser = user;
        }
    });
}

document.getElementById("profile-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    let editedUser = {
        name: chosenUser.name,
        email: chosenUser.email,
        phone: chosenUser.phone,
        password: chosenUser.password
    };

    if (name !== "") {
        editedUser.name = name;
    }
    if (email !== "") {
        editedUser.email = email;
    }
    if (phone !== "") {
        editedUser.phone = phone;
    }
    if (password !== "") {
        editedUser.password = password; // כדאי להוסיף כאן פונקציית אבטחה כמו hashing
    }

    console.log("edit user by id:" + chosenUser.id);
    db.collection("users").doc(chosenUser.id).update(editedUser)
        .then(() => {
            console.log("User successfully updated!");
        })
        .catch((error) => {
            console.error("Error updating user: ", error);
        });
   //אחרי שיש את המזהה משתמש הנכון - לבדוק שהעדכון עובד
});
