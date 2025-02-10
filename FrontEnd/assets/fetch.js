// Cache les éléments du DOM
const elements = {
    navFilters: document.querySelector(".filters-nav"),
    gallery: document.querySelector(".gallery"),
    asideModal: document.querySelector("#modal"),
    galleryModal: document.querySelector(".modal-box-gallery"),
    modalGallery: document.querySelector(".modal-gallery"),
    addModal: document.querySelector(".modal-add-picture"),
    selectForm: document.querySelector("#category"),
    body: document.querySelector("body"),
    galleryTitle: document.querySelector("#portfolio h2"),
    logButton: document.querySelector("#logButton"),
    addWork: document.querySelector("#add-box"),
    inputElement: document.querySelector("#title"),
    selectElement: document.querySelector("#category"),
    fileInputElement: document.querySelector("#image"),
    submitButton: document.querySelector("#validate-button"),
    inputFile: document.querySelector("#image")
  };
  // Récupère le token de session
  const token = window.sessionStorage.getItem("token");
  
  // Utilise DocumentFragment pour les mises à jour du DOM en lot
  const createElements = (data, createFn) => {
    // Crée un fragment de document
    const fragment = document.createDocumentFragment();
    data.forEach(item => {
      // Crée un élément pour chaque item
      const element = createFn(item);
      fragment.appendChild(element);
    });
    return fragment;
  };
  
  // Crée un bouton pour chaque catégorie
  const createButton = (category) => {
    const button = document.createElement("button");
    button.dataset.tag = category.name;
    button.dataset.id = category.id;
    button.textContent = category.name;
    return button;
  };
  
  // Crée un projet pour chaque élément de la galerie
  const createProject = (project) => {
    const figure = document.createElement("figure");
    figure.dataset.tag = project.category.name;
    figure.dataset.id = project.id;
    figure.innerHTML = `
      <img src="${project.imageUrl}" alt="${project.title}">
      <figcaption>${project.title}</figcaption>
    `;
    return figure;
  };
  
  // Crée une option pour chaque catégorie
  const createOption = (category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    return option;
  };
  
  // Récupère les données à partir d'une URL
  const fetchData = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Data recovery error");
    return response.json();
  };
  
  // Récupère les travaux en fonction d'une catégorie
  const getWorks = async (categoryId = null) => {
    try {
      const projects = await fetchData("http://localhost:5678/api/works");
      const filteredProjects = categoryId
        ? projects.filter(project => project.category.id == categoryId)
        : projects;
  
      elements.gallery.innerHTML = '';
      elements.modalGallery.innerHTML = '';
  
      const galleryFragment = createElements(filteredProjects, createProject);
      const modalFragment = createElements(filteredProjects, createModalProject);
  
      elements.gallery.appendChild(galleryFragment);
      elements.modalGallery.appendChild(modalFragment);
    } catch (error) {
      console.error("Error fetching works:", error);
    }
  };
  
  // Récupère les catégories
  const getCategories = async () => {
    try {
      const categories = await fetchData("http://localhost:5678/api/categories");
      const buttonFragment = createElements(categories, createButton);
      const optionFragment = createElements(categories, createOption);
  
      elements.navFilters.appendChild(buttonFragment);
      elements.selectForm.appendChild(optionFragment);
  
      addFilterListeners();
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  
  // Ajoute des listeners d'événement pour les boutons de filtre
  const addFilterListeners = () => {
    const buttons = elements.navFilters.querySelectorAll("button");
    buttons.forEach(button => {
      button.addEventListener("click", function() {
        const categoryId = this.dataset.id;
        buttons.forEach(btn => btn.classList.remove("is-active"));
        this.classList.add("is-active");
        getWorks(categoryId);
      });
    });
  };
  
  // Initialise l'application
  const main = async () => {
    await getWorks();
    await getCategories();
    if (token) adminPage();
  };
  
  // Affiche la page d'administration
  const adminPage = () => {
    elements.body.insertAdjacentHTML('afterbegin', `
      <div class="edit-bar">
        <span class="edit"><i class="fa-solid fa-pen-to-square"></i>Mode édition</span>
      </div>
    `);
  
    elements.galleryTitle.insertAdjacentHTML('afterend', `
      <a id="open-modal" href="#modal" class="edit-link">
        <i class="fa-solid fa-pen-to-square"></i>modifier
      </a>
    `);
  
    elements.navFilters.style.display = "none";
    elements.logButton.innerHTML = `<a href="./index.html">logout</a>`;
    elements.logButton.addEventListener("click", logOut);
  
    const modalLink = document.querySelector("#open-modal");
    modalLink.addEventListener("click", openModal);
  };
  
  // Supprime un travail
  const deleteWork = async (workID) => {
    try {
      await fetch(`http://localhost:5678/api/works/${workID}`, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          Authorization: `bearer ${token}`,
        },
      });
      getWorks();
    } catch (error) {
      console.error("Error deleting work:", error);
    }
  };
  
  // Crée un projet pour la modale
  const createModalProject = (project) => {
    const figure = document.createElement("figure");
    figure.dataset.tag = project.id;
    figure.innerHTML = `
      <img src="${project.imageUrl}" alt="${project.title}" class="modal-project-img">
      <i class="trash-icon fas fa-trash-alt" data-id="${project.id}"></i>
    `;
    figure.querySelector('.trash-icon').addEventListener("click", function(event) {
      event.preventDefault();
      if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
        deleteWork(this.dataset.id);
      }
    });
    return figure;
  };
  
  // Affiche une prévisualisation de l'image
  const showPreview = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewBox = document.querySelector(".upload-picture-box");
      let previewImage = previewBox.querySelector("#preview-image");
      
      if (!previewImage) {
        previewImage = document.createElement("img");
        previewImage.id = "preview-image";
        previewImage.style.cssText = "position: absolute; object-fit: contain; width: 100%; height: 100%;";
        previewBox.appendChild(previewImage);
      }
      
      previewImage.src = e.target.result;
      
      document.querySelector(".upload-button").style.display = "none";
      document.querySelector(".picture-icon").style.display = "none";
      document.querySelector(".type-files").style.display = "none";
    };
    
    reader.readAsDataURL(file);
  };
  
  // Vérifie si le formulaire est valide
  const checkForm = () => {
    const isValid = elements.inputElement.value !== "" &&
                    elements.selectElement.value !== "" &&
                    elements.fileInputElement.value !== "";
    
    elements.submitButton.style.backgroundColor = isValid ? "#1D6154" : "#a7a7a7";
    elements.submitButton.style.color = isValid ? "#ffffff" : "";
  };
  
  // Ajoute un travail
  const addWorks = async (formData) => {
    try {
      const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });
  
      if (!response.ok) throw new Error("Failed to add project");
  
      await getWorks();
      closeModal();
      console.log("Le projet a été ajouté !");
    } catch (error) {
      console.error("Error adding work:", error);
    }
  };
  
  // Valide le formulaire
  const validateForm = (event) => {
    event.preventDefault();
  
    const errors = {
      img: elements.fileInputElement.files.length === 0 ? "Image obligatoire" : "",
      title: elements.inputElement.value === "" ? "Titre obligatoire" : "",
      category: elements.selectElement.value === "" ? "Catégorie obligatoire" : "",
    };
  
    document.querySelector("#error-img").textContent = errors.img;
    document.querySelector("#error-title").textContent = errors.title;
    document.querySelector("#error-category").textContent = errors.category;
  
    if (Object.values(errors).every(error => error === "")) {
      const formData = new FormData(elements.addWork);
      addWorks(formData);
    }
  };
  
  
  // Ouvre la modale
  const openModal = () => {
    elements.asideModal.classList.remove("unactive-modal");
    elements.asideModal.setAttribute("aria-hidden", "false");
    elements.galleryModal.classList.remove("unactive-modal");
  
    const addPicButton = document.querySelector("#add-photo");
    const closeIcon = document.querySelector(".close-icon");
    const closeIcon2 = document.querySelector(".close-icon-2");
    const backIcon = document.querySelector(".back-icon");
  
    addPicButton.addEventListener("click", () => {
      elements.galleryModal.classList.add("unactive-modal");
      elements.addModal.classList.remove("unactive-modal");
    });
  
    closeIcon.addEventListener("click", closeModal);
    closeIcon2.addEventListener("click", closeModal);
    backIcon.addEventListener("click", () => {
      elements.galleryModal.classList.remove("unactive-modal");
      elements.addModal.classList.add("unactive-modal");
    });
  
    elements.addWork.addEventListener("submit", validateForm);
    elements.asideModal.addEventListener("click", (event) => {
      if (event.target === elements.asideModal) closeModal();
    });
  
    getWorks();
  };
  
  // Ferme la modale
  const closeModal = () => {
    elements.asideModal.classList.add("unactive-modal");
    elements.galleryModal.classList.add("unactive-modal");
    elements.addModal.classList.add("unactive-modal");
  
    elements.addWork.reset();
    resetPreview();
    elements.submitButton.style.backgroundColor = "#a7a7a7";
  };
  
  // Réinitialise la prévisualisation de l'image
  const resetPreview = () => {
    const previewImage = document.querySelector("#preview-image");
    if (previewImage) previewImage.remove();
  
    document.querySelector(".upload-button").style.display = "block";
    document.querySelector(".picture-icon").style.display = "";
    document.querySelector(".type-files").style.display = "";
  };
  
  // Se déconnecte
  const logOut = () => {
    sessionStorage.removeItem("token");
    window.location.href = "./index.html";
  };
  
  // Événements
  elements.inputFile.addEventListener("change", showPreview);
  elements.inputElement.addEventListener("input", checkForm);
  elements.selectElement.addEventListener("input", checkForm);
  elements.fileInputElement.addEventListener("change", checkForm);
  
  // Initialise l'application
  main();