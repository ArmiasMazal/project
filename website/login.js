document.getElementById("login-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!firebase.apps.length) {
      const firebaseConfig = {
          apiKey: "AIzaSyCidslFzlkdpTIlmuTyJTd9dA_yMcbc4zE",
          authDomain: "gis-project-64b97.firebaseapp.com",
          projectId: "gis-project-64b97",
          storageBucket: "gis-project-64b97.firebaseapp.com",
          messagingSenderId: "1060348225169",
          appId: "1:1060348225169:web:c2594ebc16c42651ff4130"
      };
      firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();
  const db = firebase.firestore();

  auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
          const user = userCredential.user;
          console.log("User logged in: ", user);

          // קבלת התפקיד של המשתמש מ-Firestore
          return db.collection("users").doc(user.uid).get();
      })
      .then((doc) => {
          if (doc.exists) {
              const userData = doc.data();
              const role = userData.role;

              if (role === "job_seeker") {
                  window.location.href = "jobseeker.html";
              } else if (role === "employer") {
                  window.location.href = "employer.html";
              } else {
                  console.error("Unknown role: ", role);
              }
          } else {
              console.error("No such document!");
          }
      })
      .catch((error) => {
          console.error("Error logging in: ", error);
          alert("Invalid email or password. Please try again.");
      });
});
