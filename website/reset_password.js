document.getElementById("reset-password-form").addEventListener("submit", function(event) {
  event.preventDefault();

  const password = document.getElementById("password").value;
  const auth = firebase.auth();
  const db = firebase.firestore();

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const oobCode = urlParams.get('oobCode');

  if (oobCode) {
    auth.verifyPasswordResetCode(oobCode)
      .then((email) => {
        console.log("Verification successful. Email: ", email);

        auth.confirmPasswordReset(oobCode, password)
          .then(() => {
            console.log("Password has been reset successfully in Firebase Auth.");
            alert("Password has been reset successfully. Please log in with your new password.");

            // Sign in the user with new password
            auth.signInWithEmailAndPassword(email, password)
              .then((userCredential) => {
                const user = userCredential.user;
                console.log("User signed in: ", user);

                // Update the password in Firestore
                db.collection("users").doc(user.uid).update({
                  password: password // חשוב להשתמש ב-hashing אם מאחסנים סיסמאות
                }).then(() => {
                  console.log("Password updated in Firestore!");
                  alert("Password updated in Firestore!");
                  window.location.href = "login.html";
                }).catch((error) => {
                  console.error("Error updating password in Firestore: ", error);
                  alert("Error updating password in Firestore. Please try again.");
                });
              })
              .catch((error) => {
                console.error("Error signing in: ", error);
                alert("Error signing in. Please try again.");
              });
          })
          .catch((error) => {
            console.error("Error resetting password in Firebase Auth: ", error);
            alert("Error resetting password. Please try again.");
          });
      })
      .catch((error) => {
        console.error("Invalid or expired action code: ", error);
        alert("Invalid or expired action code. Please try again.");
      });
  } else {
    alert("Invalid or expired action code. Please try again.");
  }
});





