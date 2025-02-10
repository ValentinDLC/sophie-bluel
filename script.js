fetch("https://r-1-production.up.railway.app/api/docs/") // Change "/api/test" selon ton API
  .then(response => {
    if (!response.ok) {
      throw new Error(`Erreur HTTP! Statut : ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log("Réponse de l'API :", data); // Affiche la réponse dans la console
    document.getElementById("result").textContent = JSON.stringify(data, null, 2);
  })
  .catch(error => console.error("Erreur de requête :", error));
