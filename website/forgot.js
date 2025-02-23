document.getElementById("forgot-password-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value;

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

  auth.sendPasswordResetEmail(email)
      .then(() => {
          console.log("Password reset email sent!");
          alert("Password reset email sent. Please check your inbox.");
          window.location.href = "login.html";
      })
      .catch((error) => {
          console.error("Error resetting password: ", error);
          alert("Error resetting password. Please try again.");
      });
});
