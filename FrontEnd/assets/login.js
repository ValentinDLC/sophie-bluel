// Récupère les éléments du formulaire
const form = document.getElementById("form");
const email = document.getElementById("email");
const password = document.getElementById("password");
const error = document.querySelector(".error-message");
error.innerText = "";

// Fonction pour rediriger l'utilisateur vers la page d'accueil
function welcomeHome() {
  document.location.href = "./index.html";
}

// Ajoute un événement d'envoi de formulaire pour empêcher le rechargement de la page
form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Crée un objet user avec les valeurs du formulaire
  let user = {
    email: email.value,
    password: password.value,
  };

  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  })
    .then((Response) => {
      if (Response.ok) {
        return Response.json();
      } else if (Response.status === 401) {
        console.log("unauthorized");
        error.innerText = "Erreur de Mot de passe et/ou identifiant";
        //if status 404, display unknow user
      } else if (Response.status === 404) {
        console.log("user not found");
        error.innerText = "Utilisateur inconnu";
      }
    })

    .then((data) => {
      // Stocke le token de connexion dans le stockage de session
      sessionStorage.setItem("token", data.token);
      // Appelle la fonction welcomeHome pour rediriger l'utilisateur vers la page d'accueil
      welcomeHome();
    })

    .catch((error) => {
      console.log(error);
    });
});