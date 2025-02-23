document.getElementById("sign-up-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  // Initialize Firebase only if it hasn't been initialized
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

  auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
          const user = userCredential.user;
          return db.collection("users").doc(user.uid).set({
              name: name,
              email: email,
              phone: phone,
              role: role
          });
      })
      .then(() => {
          console.log("User signed up and data saved!");
          window.location.href = "login.html";
      })
      .catch((error) => {
          console.error("Error signing up: ", error);
      });
});
