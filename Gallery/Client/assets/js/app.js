// ================================
// APPLICATION PRINCIPALE
// ================================

class GalleryApp {
  constructor() {
    this.media = [];
    this.filteredMedia = [];
    this.storage = null;
    this.selectedItems = new Set();
    this.currentLightboxIndex = -1;
    this.currentView = "photos"; // 'photos', 'albums', 'favorites', 'trash', 'album-view'
    this.isLoading = true;
    this.uploadQueue = []; // File d'upload

    this.albumManager = new AlbumManager(this);

    this.init();
  }

  // Initialisation
  async init() {
    this.bindEvents();
    this.initDropdown();
    Promise.all([this.loadMedia(), this.loadStorage()]).then(() => {
      this.isLoading = false;
    });
    this.render();
  }

  // Bindage des événements
  bindEvents() {
    // Recherche
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.applyFilters();
        }, CONFIG.UI.DEBOUNCE_SEARCH);
      });
    }

    // Upload
    const uploadBtn = document.getElementById("upload-btn");
    const fileInput = document.getElementById("file-input");

    uploadBtn?.addEventListener("click", () => fileInput?.click());
    fileInput?.addEventListener("change", (e) =>
      this.handleUpload(e.target.files)
    );

    // Drag & Drop
    if (CONFIG.UPLOAD.DRAG_DROP_ENABLED) {
      const dropZone = document.getElementById("gallery-container");
      if (dropZone) {
        dropZone.addEventListener("dragover", (e) => {
          e.preventDefault();
          dropZone.classList.add("drag-over");
        });
        dropZone.addEventListener("dragleave", () => {
          dropZone.classList.remove("drag-over");
        });
        dropZone.addEventListener("drop", (e) => {
          e.preventDefault();
          dropZone.classList.remove("drag-over");
          this.handleUpload(e.dataTransfer.files);
        });
      }
    }

    // Navigation
    document
      .getElementById("nav-photos")
      ?.addEventListener("click", () => this.setActiveView("photos"));
    document
      .getElementById("nav-albums")
      ?.addEventListener("click", () => this.setActiveView("albums"));
    document
      .getElementById("nav-favorites")
      ?.addEventListener("click", () => this.setActiveView("favorites"));
    document
      .getElementById("nav-trash")
      ?.addEventListener("click", () => this.setActiveView("trash"));

    // Sidebar toggle mobile
    document.getElementById("sidebar-toggle")?.addEventListener("click", () => {
      document.getElementById("sidebar")?.classList.toggle("open");
      document.getElementById("sidebar-overlay")?.classList.toggle("active");
    });

    document
      .getElementById("sidebar-overlay")
      ?.addEventListener("click", () => {
        document.getElementById("sidebar")?.classList.remove("open");
        document.getElementById("sidebar-overlay")?.classList.remove("active");
      });

    // Lightbox keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (this.currentLightboxIndex === -1) return;

      switch (e.key) {
        case "Escape":
          this.closeLightbox();
          break;
        case "ArrowLeft":
          this.navigateLightbox(-1);
          break;
        case "ArrowRight":
          this.navigateLightbox(1);
          break;
      }
    });
  }

  // Charger les données
  async loadMedia() {
    this.fetchFilteredMedia("/media");
  }

  // Charger le stockage
  async loadStorage() {
    try {
      const storageData = await api.getStorage();
      if (storageData.success) {
        this.storage = {
          used: storageData.disk.used,
          total: storageData.disk.total,
        };
        this.renderStorage();
      }
    } catch (error) {
      console.error("Erreur lors du chargement du stockage:", error);
    }
  }

  async loadFavorite() {
    this.isLoading = true;
    this.renderLoading();

    try {
      const favoriteData = await api.getFavorite();
      if (favoriteData.success) {
        this.media = favoriteData?.data || [];
        this.filteredMedia = [...this.media];
      }
    } catch (error) {
      console.error("Erreur lors du chargement du stockage:", error);
    }

    this.isLoading = false;
    this.render();
  }

  // Changer la vue active
  setActiveView(view) {
    document
      .querySelectorAll(".nav-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document.getElementById(`nav-${view}`)?.classList.add("active");

    window.albumManager.currentAlbumId = null;
    window.albumManager.hideAlbumTitle();

    switch (view) {
      case "albums":
        this.albumManager.loadAlbums();
        break;

      case "favorites":
        // Faire une requête API pour les favoris
        this.loadFavorite();
        break;

      case "trash":
        // Faire une requête API pour la corbeille
        this.fetchFilteredMedia("/trash");
        break;

      case "photos":
        this.loadMedia();
        break;
      default:
        this.loadMedia();
        break;
    }

    // Mettre à jour la vue courante
    this.currentView = view;
    this.updatePageTitle();

    // Fermer la sidebar sur mobile
    if (window.innerWidth <= 768) {
      document.getElementById("sidebar")?.classList.remove("open");
      document.getElementById("sidebar-overlay")?.classList.remove("active");
    }
  }

  setFilteredMedia(media) {
    this.filteredMedia = media;
  }

  // Mettre à jour le titre de la page en fonction de la vue active
  updatePageTitle() {
    const titles = {
      photos: "Toutes les photos",
      albums: "Albums",
      favorites: "Favoris",
      trash: "Corbeille",
    };

    const titleElement = document.querySelector(".page-title");
    if (titleElement) {
      titleElement.textContent = titles[this.currentView] || "Galerie";
    }
  }

  // Méthode pour récupérer les médias filtrés depuis l'API
  async fetchFilteredMedia(endpoint) {
    this.isLoading = true;
    this.renderLoading();

    try {
      const response = await api.request(endpoint);
      if (response.success) {
        this.media = response.data || [];
        this.setFilteredMedia([...this.media]);

        // Trier par date de création la plus récente en premier
        this.filteredMedia.sort(
          (a, b) => new Date(b.creation_date) - new Date(a.creation_date)
        );
      } else {
        throw new Error(
          response.message || "Erreur lors du chargement des données"
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      this.showToast(
        error.message || "Erreur lors du chargement des données",
        "error"
      );
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  // Upload de fichiers
  async handleUpload(files) {
    if (!files || files.length === 0) return;

    const validFiles = [];

    // Valider les fichiers
    for (const file of files) {
      const validation = CONFIG.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        this.showToast(validation.errors.join(", "), "error");
      }
    }

    // Traiter chaque fichier valide
    for (const file of validFiles) {
      this.addToUploadQueue(file);
    }
    this.processUploadQueue();
  }

  // Supprimer un média
  async deleteMedia(mediaId) {
    if (this.currentView === "trash") {
      // Confirmation pour la suppression définitive
      if (
        !confirm(
          CONFIG.MESSAGES.DELETE_CONFIRM + " Cette action est irréversible."
        )
      )
        return;
    } else {
      // Confirmation pour le déplacement vers la corbeille
      if (!confirm(CONFIG.MESSAGES.DELETE_CONFIRM)) return;
    }

    try {
      let response;

      if (this.currentView === "trash") {
        // Suppression définitive depuis la corbeille
        response = await api.deletePermanently(mediaId);
      } else {
        // Déplacement vers la corbeille
        response = await api.deleteMedia(mediaId);
      }

      if (response.success) {
        // Mettre à jour les listes
        this.filteredMedia = this.filteredMedia.filter((m) => m.id !== mediaId);

        if (this.currentLightboxIndex > -1) {
          if (this.currentLightboxIndex === 0) this.navigateLightbox(1);
          else this.navigateLightbox(-1);
        }

        this.refreshMedia();

        // Afficher un message de succès
        this.showToast(
          this.currentView === "trash"
            ? CONFIG.MESSAGES.DELETE_PERMANENT_SUCCESS
            : CONFIG.MESSAGES.MOVE_TO_TRASH_SUCCESS,
          "success"
        );
      } else {
        throw new Error(response.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur de suppression:", error);
      this.showToast(
        error.message ||
          (this.currentView === "trash"
            ? CONFIG.MESSAGES.DELETE_PERMANENT_ERROR
            : CONFIG.MESSAGES.MOVE_TO_TRASH_ERROR),
        "error"
      );
    }
  }

  refreshMedia() {
    if (this.currentView === "album-view" && this.albumManager.currentAlbumId) {
      this.albumManager.openAlbum(this.albumManager.currentAlbumId);
      return;
    }
    this.setActiveView(this.currentView);
  }

  getIndexMediaById(id) {
    return this.filteredMedia.findIndex((m) => m.id === id);
  }
  getMediaById(id) {
    return this.filteredMedia.find((m) => m.id === id);
  }
  // ================================
  // FAVORIS
  // ================================

  changeMediaFavorite(mediaId) {
    const media = this.getMediaById(mediaId);
    if (media.favorite) {
      api.removeMediaFavorite(media);
    } else {
      api.setMediaFavorite(media);
    }

    this.filteredMedia.forEach((m) => {
      if (m.id === mediaId) {
        m.favorite = !m.favorite;
      }
    });

    if (this.currentLightboxIndex > -1) {
      const favoriteIcon = document.querySelector(
        `.lightbox-actions .material-icons`
      );
      if (favoriteIcon) {
        favoriteIcon.textContent = media.favorite
          ? "favorite"
          : "favorite_border";
      }
    }

    this.refreshMedia();
  }

  // ================================
  // MENU DÉROULANT
  // ================================

  /**
   * Initialise le menu déroulant du header
   */
  initDropdown() {
    const btnPlus = document.getElementById("btn-plus");
    const dropdownMenu = document.getElementById("dropdown-menu");

    if (!btnPlus || !dropdownMenu) return;

    // Toggle menu
    btnPlus.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
    });

    // Fermer le menu en cliquant à l'extérieur
    document.addEventListener("click", (e) => {
      if (!dropdownMenu.contains(e.target) && e.target !== btnPlus) {
        dropdownMenu.classList.remove("show");
      }
    });

    // Gérer les actions du menu
    document.getElementById("import-file")?.addEventListener("click", () => {
      dropdownMenu.classList.remove("show");
      this.handleImportFile();
    });

    document.getElementById("create-album")?.addEventListener("click", () => {
      dropdownMenu.classList.remove("show");
      this.handleCreateAlbum();
    });
  }

  /**
   * Gère l'importation de fichier
   */
  async handleImportFile() {
    // Ouvre le sélecteur de fichiers
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*,video/*";

    input.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        this.handleUpload(files);
      }
    });

    input.click();
  }

  /**
   * Gère la création d'album
   */
  async handleCreateAlbum() {
    const albumName = await this.openInputText(
      "Nouvel album",
      "Entrez le nom de l'album...",
      "Créer"
    );

    if (albumName) {
      try {
        const response = await api.createAlbum({ name: albumName });
        if (response.success) {
          this.showToast(`Album "${albumName}" créé avec succès`, "success");
          // Recharger les albums si on est dans la vue albums
          if (this.currentView === "albums") {
            this.albumManager.loadAlbums();
          }
        } else {
          throw new Error(response.message || "Erreur lors de la création");
        }
      } catch (error) {
        this.showToast(
          error.message || "Erreur lors de la création de l'album",
          "error"
        );
      }
    }
  }

  // ================================
  // UTILITAIRES
  // ================================

  /**
   * Ouvre une popup de saisie de texte
   * @param {string} title - Titre de la popup
   * @param {string} placeholder - Placeholder du champ de saisie
   * @param {string} confirmText - Texte du bouton de confirmation
   * @returns {Promise<string|null>} - La valeur saisie ou null si annulé
   */
  async openInputText(
    title = "Saisir un texte",
    placeholder = "Entrez votre texte...",
    confirmText = "Créer"
  ) {
    return new Promise((resolve) => {
      // Créer l'overlay
      const overlay = document.createElement("div");
      overlay.className = "input-popup-overlay";

      // Créer la popup
      const popup = document.createElement("div");
      popup.className = "input-popup";

      popup.innerHTML = `
        <h3>${title}</h3>
        <input 
          type="text" 
          class="input-popup-field"
          placeholder="${placeholder}"
          autocomplete="off"
        >
        <div class="button-group">
          <button class="input-popup-cancel btn-secondary">Annuler</button>
          <button class="input-popup-confirm btn-primary">${confirmText}</button>
        </div>
      `;

      // Ajouter la popup au DOM
      overlay.appendChild(popup);
      document.body.appendChild(overlay);

      // Focus sur le champ de saisie
      const input = popup.querySelector(".input-popup-field");
      input.focus();

      // Gérer les événements
      const handleSubmit = () => {
        const value = input.value.trim();
        cleanup();
        resolve(value || null);
      };

      const handleCancel = () => {
        cleanup();
        resolve(null);
      };

      const handleKeydown = (e) => {
        if (e.key === "Enter") {
          handleSubmit();
        } else if (e.key === "Escape") {
          handleCancel();
        }
      };

      const cleanup = () => {
        document.removeEventListener("keydown", handleKeydown);
        overlay.remove();
      };

      // Attacher les événements
      popup
        .querySelector(".input-popup-confirm")
        .addEventListener("click", handleSubmit);
      popup
        .querySelector(".input-popup-cancel")
        .addEventListener("click", handleCancel);
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          handleCancel();
        }
      });
      document.addEventListener("keydown", handleKeydown);

      // Empêcher la propagation du clic sur la popup
      popup.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    });
  }

  /**
   * Ouvre un sélecteur d'albums
   * @param {string} title - Titre de la popup
   * @param {Array} items - Liste des éléments à afficher
   * @param {string} confirmText - Texte du bouton de confirmation
   * @returns {Promise<Object|null>} - L'élément choisi ou null si annulé
   */
  async openItemSelector(
    title = "Sélectionner un élément",
    items = [],
    confirmText = "Sélectionner"
  ) {
    return new Promise((resolve) => {
      // Créer l'overlay
      const overlay = document.createElement("div");
      overlay.className = "input-popup-overlay";

      // Créer la popup
      const popup = document.createElement("div");
      popup.className = "input-popup";

      // Générer la liste des éléments
      const itemsList = items
        .map(
          (item) => `
        <div class="album-selector-item" data-itemId="${item.id}">
          <div class="album-selector-thumbnail">
            <img src="${
              item.thumbnail.startsWith("data:")
                ? item.thumbnail
                : `${CONFIG.BASE_URL + item.thumbnail}`
            }" alt="${item.name}" loading="lazy">
          </div>
          <div class="album-selector-info">
            <div class="album-selector-name">${item.name}</div>
            <div class="album-selector-count">${item.mediaCount || 0} média${
            item.mediaCount !== 1 ? "s" : ""
          }</div>
          </div>
        </div>
      `
        )
        .join("");

      popup.innerHTML = `
        <h3>${title}</h3>
        <div class="album-selector-list">
          ${
            itemsList ||
            '<div class="album-selector-empty">Aucun élément disponible</div>'
          }
        </div>
        <div class="button-group">
          <button class="input-popup-cancel btn-secondary">Annuler</button>
          <button class="album-selector-confirm btn-primary" disabled>${confirmText}</button>
        </div>
      `;

      // Ajouter la popup au DOM
      overlay.appendChild(popup);
      document.body.appendChild(overlay);

      let selectedAlbum = null;

      // Gérer les événements
      const handleConfirm = () => {
        cleanup();
        resolve(selectedAlbum);
      };

      const handleCancel = () => {
        cleanup();
        resolve(null);
      };

      const handleKeydown = (e) => {
        if (e.key === "Enter" && selectedAlbum) {
          handleConfirm();
        } else if (e.key === "Escape") {
          handleCancel();
        }
      };

      const cleanup = () => {
        document.removeEventListener("keydown", handleKeydown);
        overlay.remove();
      };

      // Gérer la sélection d'album
      const albumItems = popup.querySelectorAll(".album-selector-item");
      const confirmBtn = popup.querySelector(".album-selector-confirm");

      albumItems.forEach((item) => {
        item.addEventListener("click", () => {
          // Désélectionner l'item précédent
          popup
            .querySelectorAll(".album-selector-item")
            .forEach((i) => i.classList.remove("selected"));

          // Sélectionner le nouvel item
          item.classList.add("selected");
          selectedAlbum = items.find(
            (itm) => parseInt(itm.id) === parseInt(item.dataset.itemid)
          );
          // Activer le bouton de confirmation
          confirmBtn.disabled = false;
        });
      });

      // Attacher les événements
      confirmBtn.addEventListener("click", handleConfirm);
      popup
        .querySelector(".input-popup-cancel")
        .addEventListener("click", handleCancel);
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          handleCancel();
        }
      });
      document.addEventListener("keydown", handleKeydown);

      // Empêcher la propagation du clic sur la popup
      popup.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    });
  }

  // ================================
  // RENDU
  // ================================

  render() {
    this.renderStorage();
    this.renderGallery();
  }

  renderLoading() {
    const container = document.getElementById("photo-grid");
    if (!container) return;

    container.innerHTML = `
            <div class="loading-skeleton">
                ${Array(8)
                  .fill("")
                  .map(
                    (_, i) => `
                    <div class="skeleton-item" style="height: ${
                      Math.random() * 100 + 150
                    }px"></div>
                `
                  )
                  .join("")}
            </div>
        `;
  }

  renderStorage() {
    const storageEl = document.getElementById("storage-section");
    if (!storageEl || !this.storage) return;
    const percentage = this.storage.used.percentage;
    let statusClass = "";

    if (percentage >= CONFIG.STORAGE.SHOW_CRITICAL_AT) {
      statusClass = "critical";
    } else if (percentage >= CONFIG.STORAGE.SHOW_WARNING_AT) {
      statusClass = "warning";
    }

    storageEl.innerHTML = `
            <div class="storage-header">
                <span class="material-icons">storage</span>
                <span>${CONFIG.MESSAGES.STORAGE}</span>
            </div>
            <div class="storage-bar ${statusClass}">
                <div class="storage-progress" style="width: ${percentage}%"></div>
            </div>
            <p class="storage-text">
                ${this.storage.used.formatted} utilisés sur ${this.storage.total.formatted}
            </p>`;
  }

  renderCount() {
    const photoCount = this.filteredMedia.filter(
      (m) => m.type === "image"
    ).length;
    const videoCount = this.filteredMedia.filter(
      (m) => m.type === "video"
    ).length;

    const statsEl = document.getElementById("media-stats");
    // Stats
    if (statsEl) {
      statsEl.innerHTML = `
                <div class="stat">
                    <span class="material-icons">image</span>
                    <span><strong>${photoCount}</strong> ${
        photoCount !== 1 ? CONFIG.MESSAGES.PHOTOS : CONFIG.MESSAGES.PHOTO
      }</span>
                </div>
                <div class="stat">
                    <span class="material-icons">videocam</span>
                    <span><strong>${videoCount}</strong> ${
        videoCount !== 1 ? CONFIG.MESSAGES.VIDEOS : CONFIG.MESSAGES.VIDEO
      }</span>
                </div>
            `;
    }
  }

  renderGallery() {
    const container = document.getElementById("photo-grid");
    if (!container) return;

    this.renderCount();

    if (this.filteredMedia.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="material-icons empty-icon">image_search</span>
          <p class="empty-title">${CONFIG.MESSAGES.NO_MEDIA}</p>
          <p class="empty-desc">${CONFIG.MESSAGES.NO_MEDIA_DESC}</p>
        </div>
      `;
      return;
    }

    const groupedMedia = this.filteredMedia.reduce((acc, media) => {
      const date = new Date(media.creation_date);
      const year = date.getFullYear();
      const currentYear = new Date().getFullYear();
      const month = date.toLocaleString("fr-FR", { month: "long" });
      const monthKey =
        year === currentYear
          ? `${month.charAt(0).toUpperCase() + month.slice(1)}`
          : `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;

      // Format du jour: "Sat. Nov. 30, 2024"
      const dayKey = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      // Initialiser le mois si nécessaire
      if (!acc[monthKey]) {
        acc[monthKey] = {};
      }

      // Initialiser le jour si nécessaire
      if (!acc[monthKey][dayKey]) {
        acc[monthKey][dayKey] = [];
      }

      acc[monthKey][dayKey].push(media);
      return acc;
    }, {});

    let galleryHtml = "";
    for (const monthName in groupedMedia) {
      galleryHtml += `<h2 class="group-title">${monthName}</h2>`;
      galleryHtml += '<div class="photo-list-group">';

      // Trier les jours par ordre chronologique (plus récent au plus vieux)
      const sortedDays = Object.keys(groupedMedia[monthName]).sort((a, b) => {
        return new Date(b) - new Date(a);
      });

      for (const dayName of sortedDays) {
        galleryHtml += '<div class="day-container">';
        galleryHtml += `<h3 class="day-title">${dayName}</h3>`;
        galleryHtml += '<div class="photo-day-group">';

        groupedMedia[monthName][dayName].forEach((media) => {
          const globalIndex = this.filteredMedia.indexOf(media);
          galleryHtml += `
          <div class="photo-item" data-id="${
            media.id
          }" data-index="${globalIndex}" 
               data-tooltip="Cliquez pour agrandir" onclick="app.openLightbox(${globalIndex})" 
               oncontextmenu="app.showContextMenu(event, ${globalIndex})">
              ${
                media.type === "video"
                  ? `
                <div class="video-badge">
                    <span class="material-icons">videocam</span>
                    ${
                      media.duration
                        ? CONFIG.formatDuration(media.duration)
                        : ""
                    }
                </div>
              `
                  : ""
              }
              <img src="${
                media.thumb
                  ? CONFIG.BASE_URL + media.thumb
                  : CONFIG.BASE_URL + media.path
              }" 
                   alt="${media.name}" loading="lazy" 
                   onload="this.parentElement.classList.add('loaded')">
              <div class="photo-overlay">
                  <button class="select-btn" onclick="event.stopPropagation(); app.toggleSelect('${
                    media.id
                  }')">
                      <span class="material-icons">check</span>
                  </button>
              </div>
              <div class="favorite-overlay ${
                media.favorite ? "item-favorite" : ""
              }">
                  <button class="favorite-btn">
                      <span class="material-icons">favorite</span>
                  </button>
              </div>
          </div>`;
        });

        galleryHtml += "</div>";
        galleryHtml += "</div>";
      }

      galleryHtml += "</div>";
    }

    container.innerHTML = galleryHtml;

    this.selectedItems.forEach((id) => {
      const el = container.querySelector(`[data-id="${id}"]`);
      if (el) el.classList.add("selected");
    });
  }

  // ================================
  // LIGHTBOX
  // ================================

  openLightbox(index) {
    this.currentLightboxIndex = index;
    const media = this.filteredMedia[index];
    if (!media) return;

    document.body.style.overflow = "hidden";

    const lightbox = document.getElementById("lightbox");
    if (!lightbox) return;

    const hasPrev = index > 0;
    const hasNext = index < this.filteredMedia.length - 1;
    lightbox.innerHTML = `
            <div class="lightbox-backdrop" onclick="app.closeLightbox()"></div>
            <button class="lightbox-close" onclick="app.closeLightbox()">
                <span class="material-icons">close</span>
            </button>
            
            ${
              hasPrev
                ? `
                <button class="lightbox-nav prev" onclick="event.stopPropagation(); app.navigateLightbox(-1)">
                    <span class="material-icons">chevron_left</span>
                </button>
            `
                : ""
            }
            
            ${
              hasNext
                ? `
                <button class="lightbox-nav next" onclick="event.stopPropagation(); app.navigateLightbox(1)">
                    <span class="material-icons">chevron_right</span>
                </button>
            `
                : ""
            }
            
            <div class="lightbox-content" onclick="event.stopPropagation()">
                ${
                  media.type === "video"
                    ? `
                    <video src="${
                      CONFIG.BASE_URL + media.path
                    }" controls autoplay class="lightbox-media"></video>
                `
                    : `
                    <img src="${CONFIG.BASE_URL + media.path}" alt="${
                        media.name
                      }" class="lightbox-media">
                `
                }
            </div>
            
            <div class="lightbox-toolbar">
                <div class="lightbox-info">
                    <p class="lightbox-filename">${media.name}</p>
                    <p class="lightbox-counter">${index + 1} / ${
      this.filteredMedia.length
    }</p>
                </div>
                <div class="lightbox-actions">
                    <button class="lightbox-btn" onclick="app.changeMediaFavorite(app.filteredMedia[${index}].id)">
                        <span class="material-icons">${
                          media.favorite ? "favorite" : "favorite_border"
                        }</span>
                    </button>
                    <button class="lightbox-btn" onclick="app.toggleInfoPanel()">
                        <span class="material-icons">info</span>
                    </button>
                    <button class="lightbox-btn" onclick="app.downloadMedia(app.filteredMedia[${index}].id)">
                        <span class="material-icons">download</span>
                    </button>
                    <button class="lightbox-btn" onclick="app.shareMedia(app.filteredMedia[${index}].id)">
                        <span class="material-icons">share</span>
                    </button>
                    <button class="lightbox-btn danger" onclick="app.deleteMedia(app.filteredMedia[${index}].id)">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </div>
            
            <div class="lightbox-info-panel" id="info-panel">
                <div class="info-row">
                    <span class="info-label">${CONFIG.MESSAGES.FILE_TYPE}</span>
                    <span>${
                      media.type === "video" ? "Vidéo" : "Image"
                    } • ${media.path.split(".").pop().toUpperCase()}</span>
                </div>
                ${
                  media.size
                    ? `
                <div class="info-row">
                    <span class="info-label">${CONFIG.MESSAGES.FILE_SIZE}</span>
                    <span>${(media.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                `
                    : ""
                }
                ${
                  media.dimension
                    ? `
                <div class="info-row">
                    <span class="info-label">${CONFIG.MESSAGES.DIMENSIONS}</span>
                    <span>${media.dimension.width} × ${media.dimension.height}</span>
                </div>
                `
                    : ""
                }
                <div class="info-row">
                    <span class="info-label">Date de création</span>
                    <span>${new Date(
                      media.creation_date
                    ).toLocaleString()}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date d'ajout</span>
                    <span>${new Date(media.upload_date).toLocaleString()}</span>
                </div>
            </div>
        `;

    lightbox.classList.add("active");
  }

  closeLightbox() {
    this.currentLightboxIndex = -1;
    document.body.style.overflow = "";
    document.getElementById("lightbox")?.classList.remove("active");
    this.refreshMedia();
  }

  navigateLightbox(direction) {
    const newIndex = this.currentLightboxIndex + direction;
    if (newIndex >= 0 && newIndex < this.filteredMedia.length) {
      this.openLightbox(newIndex);
    }
  }

  toggleInfoPanel() {
    document.getElementById("info-panel")?.classList.toggle("active");
  }

  // ================================
  // GESTION DE LA FILE D'UPLOAD
  // ================================

  /**
   * Ajoute un fichier à la file d'upload
   * @param {File} file - Fichier à uploader
   */
  addToUploadQueue(file) {
    const uploadItem = {
      id: Date.now() + Math.random(),
      file: file,
      progress: 0,
      status: "pending", // 'pending', 'uploading', 'completed', 'error'
      startTime: null,
      estimatedTimeRemaining: null,
      error: null,
    };

    this.uploadQueue.push(uploadItem);
    this.createUploadNotification(uploadItem);
  }

  /**
   * Traite la file d'upload
   */
  async processUploadQueue() {
    const pendingItems = this.uploadQueue.filter(
      (item) => item.status === "pending"
    );

    for (const item of pendingItems) {
      await this.uploadSingleFile(item);
    }
  }

  /**
   * Upload un fichier individuel
   * @param {Object} uploadItem - Item d'upload
   */
  async uploadSingleFile(uploadItem) {
    uploadItem.status = "uploading";
    uploadItem.startTime = Date.now();
    this.updateUploadNotification(uploadItem);

    try {
      const result = await api.uploadFile(uploadItem.file, (progress) => {
        uploadItem.progress = progress;
        this.calculateEstimatedTime(uploadItem);
        this.updateUploadNotification(uploadItem);
      });

      if (result.success) {
        uploadItem.status = "completed";
        uploadItem.progress = 100;
        this.updateUploadNotification(uploadItem);

        // Recharger les données après un upload réussi
        await this.loadMedia();
        await this.loadStorage();

        // Supprimer la notification après 3 secondes
        setTimeout(() => {
          this.removeUploadNotification(uploadItem.id);
        }, 3000);
      } else {
        throw new Error(result.message || "Erreur lors de l'upload");
      }
    } catch (error) {
      uploadItem.status = "error";
      uploadItem.error = error.message || "Erreur lors de l'upload";
      this.updateUploadNotification(uploadItem);
    }
  }

  /**
   * Calcule le temps restant estimé
   * @param {Object} uploadItem - Item d'upload
   */
  calculateEstimatedTime(uploadItem) {
    if (uploadItem.progress > 0 && uploadItem.startTime) {
      const elapsed = Date.now() - uploadItem.startTime;
      const totalEstimated = (elapsed / uploadItem.progress) * 100;
      const remaining = totalEstimated - elapsed;
      uploadItem.estimatedTimeRemaining = Math.max(0, remaining);
    }
  }

  /**
   * Crée une notification d'upload
   * @param {Object} uploadItem - Item d'upload
   */
  createUploadNotification(uploadItem) {
    const container = document.getElementById("upload-queue-container");
    if (!container) {
      const uploadContainer = document.createElement("div");
      uploadContainer.id = "upload-queue-container";
      uploadContainer.className = "upload-queue-container";
      document.body.appendChild(uploadContainer);
    }

    const notification = document.createElement("div");
    notification.id = `upload-${uploadItem.id}`;
    notification.className = "upload-notification";
    notification.innerHTML = `
      <div class="upload-info">
        <div class="upload-filename">${uploadItem.file.name}</div>
        <div class="upload-details">
          <span class="upload-progress-text">0%</span>
          <span class="upload-time-remaining"></span>
        </div>
      </div>
      <div class="upload-progress-circle">
        <svg class="progress-svg" width="40" height="40">
          <circle class="progress-bg" cx="20" cy="20" r="16"></circle>
          <circle class="progress-bar" cx="20" cy="20" r="16"></circle>
        </svg>
        <div class="progress-percentage">0%</div>
      </div>
      <button class="upload-cancel" onclick="app.cancelUpload('${uploadItem.id}')">×</button>
    `;

    document.getElementById("upload-queue-container").appendChild(notification);
  }

  /**
   * Met à jour une notification d'upload
   * @param {Object} uploadItem - Item d'upload
   */
  updateUploadNotification(uploadItem) {
    const notification = document.getElementById(`upload-${uploadItem.id}`);
    if (!notification) return;

    const progressText = notification.querySelector(".upload-progress-text");
    const timeRemaining = notification.querySelector(".upload-time-remaining");
    const progressBar = notification.querySelector(".progress-bar");
    const progressPercentage = notification.querySelector(
      ".progress-percentage"
    );

    if (progressText)
      progressText.textContent = `${Math.round(uploadItem.progress)}%`;
    if (progressPercentage)
      progressPercentage.textContent = `${Math.round(uploadItem.progress)}%`;

    if (
      uploadItem.estimatedTimeRemaining &&
      uploadItem.status === "uploading"
    ) {
      const seconds = Math.round(uploadItem.estimatedTimeRemaining / 1000);
      if (timeRemaining) timeRemaining.textContent = `${seconds}s restantes`;
    } else if (uploadItem.status === "completed") {
      if (timeRemaining) timeRemaining.textContent = "Terminé";
      notification.classList.add("upload-completed");
    } else if (uploadItem.status === "error") {
      if (timeRemaining)
        timeRemaining.textContent = uploadItem.error || "Erreur";
      notification.classList.add("upload-error");
    }

    // Mettre à jour le cercle de progression
    if (progressBar) {
      const circumference = 2 * Math.PI * 16;
      const offset =
        circumference - (uploadItem.progress / 100) * circumference;
      progressBar.style.strokeDashoffset = offset;
    }
  }

  /**
   * Supprime une notification d'upload
   * @param {string} uploadId - ID de l'upload
   */
  removeUploadNotification(uploadId) {
    const notification = document.getElementById(`upload-${uploadId}`);
    if (notification) {
      notification.remove();
    }

    // Supprimer de la file d'attente
    this.uploadQueue = this.uploadQueue.filter((item) => item.id !== uploadId);
  }

  /**
   * Annule un upload
   * @param {string} uploadId - ID de l'upload
   */
  cancelUpload(uploadId) {
    const uploadItem = this.uploadQueue.find((item) => item.id == uploadId);
    if (uploadItem) {
      uploadItem.status = "cancelled";
      this.removeUploadNotification(uploadId);
    }
  }

  // ================================
  // UTILITAIRES
  // ================================

  toggleSelect(id) {
    if (this.selectedItems.has(id)) {
      this.selectedItems.delete(id);
    } else {
      this.selectedItems.add(id);
    }

    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) el.classList.toggle("selected");
  }

  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 300);
    }, CONFIG.UI.TOAST_DURATION);
  }

  // ================================
  // MENU CONTEXTUEL
  // ================================

  showContextMenu(event, index) {
    event.preventDefault();
    event.stopPropagation();

    const media = this.filteredMedia[index];
    if (!media) return false;

    // Stocker l'index du média pour les actions ultérieures
    this.contextMenuMediaIndex = index;

    // Afficher le menu contextuel
    if (window.contextMenu) {
      window.contextMenu.show(event, media, this);
    }

    return false;
  }

  // Télécharger un média
  async downloadMedia(mediaId) {
    const media = this.getMediaById(mediaId);
    if (!media) return;

    try {
      const response = await fetch(CONFIG.BASE_URL + media.path);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        media.filename ||
        `media-${media.id}${media.type === "image" ? ".jpg" : ".mp4"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      this.showToast("Téléchargement démarré", "success");
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      this.showToast("Erreur lors du téléchargement", "error");
    }
  }

  // Partager un média
  async shareMedia(mediaId) {
    const media = this.getMediaById(mediaId);
    if (!media) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: media.title || "Média partagé",
          text: media.description || "Regardez ce média",
          url: media.url,
        });
      } else {
        // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
        await navigator.clipboard.writeText(media.url);
        this.showToast("Lien copié dans le presse-papier", "info");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Erreur lors du partage:", error);
      }
    }
  }

  // Afficher la boîte de dialogue pour ajouter à un album
  async AddToAlbum(mediaId) {
    // Charger les albums existants
    const albums = await this.albumManager.getAlbums();

    console.log("Albums chargés:", albums);

    // Ouvrir le sélecteur d'albums
    const selectedAlbum = await this.openItemSelector(
      "Ajouter à un album",
      albums,
      "Ajouter"
    );

    if (selectedAlbum) {
      // Ajouter le média à l'album sélectionné
      try {
        const response = await api.addMediaToAlbum(selectedAlbum.id, mediaId);
        if (response.success) {
          this.showToast(`Média ajouté à "${selectedAlbum.name}"`, "success");
        } else {
          throw new Error(response.message || "Erreur lors de l'ajout");
        }
      } catch (error) {
        this.showToast(
          error.message || "Erreur lors de l'ajout au album",
          "error"
        );
      }
    }
  }

  // Restaurer un média depuis la corbeille
  async restoreFromTrash(mediaId) {
    // Confirmation pour la restauration
    if (!confirm("Êtes-vous sûr de vouloir restaurer ce média ?")) return;

    try {
      const response = await api.restoreFromTrash(mediaId);

      if (response && response.success) {
        // Mettre à jour la liste des médias
        this.filteredMedia = this.filteredMedia.filter((m) => m.id !== mediaId);

        // Recharger les données
        this.refreshMedia();

        // Fermer le lightbox s'il est ouvert
        if (this.currentLightboxIndex > -1) {
          this.closeLightbox();
        }

        this.showToast(
          response.message || "Média restauré avec succès",
          "success"
        );
      } else {
        throw new Error(
          response?.message || "Erreur lors de la restauration du média"
        );
      }
    } catch (error) {
      console.error("Erreur lors de la restauration du média:", error);
      this.showToast(
        error.message || "Erreur lors de la restauration du média",
        "error"
      );
    }
  }

  async removeFromAlbum(mediaId) {
    try {
      const albumId = this.albumManager.currentAlbumId;
      const response = await api.removeMediaFromAlbum(albumId, mediaId);

      if (response && response.success) {
        // Mettre à jour la liste des médias
        this.filteredMedia = this.filteredMedia.filter((m) => m.id !== mediaId);

        // Recharger les données
        this.refreshMedia();

        this.showToast(
          response.message || "Média retiré de l'album avec succès",
          "success"
        );
      } else {
        throw new Error(
          response?.message || "Erreur lors du retrait du média de l'album"
        );
      }
    } catch (error) {
      console.error("Erreur lors du retrait du média de l'album:", error);
      this.showToast(
        error.message || "Erreur lors du retrait du média de l'album",
        "error"
      );
    }
  }

  async openAlbum(albumId) {
    console.log(albumId);
    this.albumManager.openAlbum(albumId);
  }

  async deleteAlbum(albumId) {
    this.albumManager.deleteAlbum(albumId);
  }
}

// Initialiser l'application
let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new GalleryApp();
});
