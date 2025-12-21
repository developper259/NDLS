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
    this.currentView = "photos"; // 'photos', 'albums', 'favorites', 'trash'
    this.filters = {
      type: "all",
      sizeRange: "all",
      sortBy: "date_desc",
      search: "",
    };
    this.isLoading = true;

    this.init();
  }

  // Initialisation
  async init() {
    this.bindEvents();
    Promise.all([this.loadMedia(), this.loadStorage()]);
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
          this.filters.search = e.target.value;
          this.applyFilters();
        }, CONFIG.UI.DEBOUNCE_SEARCH);
      });
    }

    // Filtres
    document.getElementById("filter-type")?.addEventListener("change", (e) => {
      this.filters.type = e.target.value;
      this.applyFilters();
    });

    document.getElementById("filter-size")?.addEventListener("change", (e) => {
      this.filters.sizeRange = e.target.value;
      this.applyFilters();
    });

    document.getElementById("filter-sort")?.addEventListener("change", (e) => {
      this.filters.sortBy = e.target.value;
      this.applyFilters();
    });

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

    // Toggle filtres
    document.getElementById("toggle-filters")?.addEventListener("click", () => {
      document.getElementById("filters-content")?.classList.toggle("collapsed");
      document.getElementById("toggle-filters")?.classList.toggle("collapsed");
    });
  }

  // Charger les données
  async loadMedia() {
    this.isLoading = true;
    this.renderLoading();

    try {
      const mediaResponse = await api.getMedia(this.filters);

      // Mise à jour pour gérer la nouvelle structure de réponse
      this.media = mediaResponse?.data || [];
      this.filteredMedia = [...this.media];
    } catch (error) {
      console.error("Erreur chargement:", error);
      this.showToast(CONFIG.MESSAGES.LOAD_ERROR, "error");
    }

    this.isLoading = false;
    this.render();
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

  // Changer la vue active
  setActiveView(view) {
    document
      .querySelectorAll(".nav-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document.getElementById(`nav-${view}`)?.classList.add("active");

    switch (view) {
      case "albums":
        // Rediriger vers la page albums
        window.location.href = "/albums/";
        return;

      case "favorites":
        // Faire une requête API pour les favoris
        this.fetchFilteredMedia("/favoris");
        break;

      case "trash":
        // Faire une requête API pour la corbeille
        this.fetchFilteredMedia("/trash");
        break;

      case "photos":
      default:
        // Recharger tous les médias
        this.loadMedia().then(() => {
          this.currentView = "photos";
          // Filtrer pour ne montrer que les images
          this.filteredMedia = this.media.filter(
            (item) => !item.isTrashed && item.type === "image"
          );
          this.render();
          this.updatePageTitle();
        });
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
        console.log(this.media);
        this.filteredMedia = [...this.media];
        console.log(this.filteredMedia);

        // Trier par date d'ajout la plus récente en premier
        this.filteredMedia.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
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
      try {
        this.showToast(`Upload: ${file.name}...`, "info");

        const result = await api.uploadFile(file, (progress) => {
          CONFIG.log(`Upload progress: ${progress}%`);
        });

        if (result.success) {
          // Recharger les données après un upload réussi
          await this.loadMedia();
          await this.loadStorage();
          this.showToast(CONFIG.MESSAGES.UPLOAD_SUCCESS, "success");
        } else {
          throw new Error(result.message || "Erreur lors de l'upload");
        }
      } catch (error) {
        console.error("Erreur d'upload:", error);
        this.showToast(error.message || CONFIG.MESSAGES.UPLOAD_ERROR, "error");
      }
    }
  }

  // Supprimer un média
  async deleteMedia(media) {
    if (!confirm(CONFIG.MESSAGES.DELETE_CONFIRM)) return;

    try {
      let response;

      if (this.currentView === "trash") {
        // Suppression définitive depuis la corbeille
        response = await api.deletePermanently(media.id);
      } else {
        // Déplacement vers la corbeille
        response = await api.deleteMedia(media.id);
      }

      if (response.success) {
        // Mettre à jour les listes
        this.media = this.media.filter((m) => m.id !== media.id);
        this.filteredMedia = this.filteredMedia.filter(
          (m) => m.id !== media.id
        );

        this.navigateLightbox(-1);

        // Recharger les données
        if (this.currentView === "trash") {
          await this.fetchFilteredMedia("/api/trash");
        } else {
          await this.loadMedia();
        }

        // Mettre à jour le stockage
        await this.loadStorage();

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

  // Télécharger un média
  downloadMedia(media) {
    try {
      const url = CONFIG.BASE_URL + media.path;

      const link = document.createElement("a");
      link.href = url;
      link.download = media.name || "image";
      link.target = "_blank";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.showToast(CONFIG.MESSAGES.DOWNLOAD_START, "success");
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      this.showToast(CONFIG.MESSAGES.DOWNLOAD_ERROR, "error");
    }
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
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                </svg>
                <span>${CONFIG.MESSAGES.STORAGE}</span>
            </div>
            <div class="storage-bar ${statusClass}">
                <div class="storage-progress" style="width: ${percentage}%"></div>
            </div>
            <p class="storage-text">
                ${this.storage.used.formatted} utilisés sur ${this.storage.total.formatted}
            </p>`;
  }

  renderGallery() {
    const container = document.getElementById("photo-grid");
    const statsEl = document.getElementById("media-stats");
    if (!container) return;

    // Mise à jour pour gérer les types 'image' et 'video' au lieu de 'photo' et 'video'
    const photoCount = this.filteredMedia.filter(
      (m) => m.type === "image"
    ).length;
    const videoCount = this.filteredMedia.filter(
      (m) => m.type === "video"
    ).length;
    // Stats
    if (statsEl) {
      statsEl.innerHTML = `
                <div class="stat">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span><strong>${photoCount}</strong> ${
        photoCount !== 1 ? CONFIG.MESSAGES.PHOTOS : CONFIG.MESSAGES.PHOTO
      }</span>
                </div>
                <div class="stat">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                    <span><strong>${videoCount}</strong> ${
        videoCount !== 1 ? CONFIG.MESSAGES.VIDEOS : CONFIG.MESSAGES.VIDEO
      }</span>
                </div>
            `;
    }

    // Grille vide
    if (this.filteredMedia.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <p class="empty-title">${CONFIG.MESSAGES.NO_MEDIA}</p>
                    <p class="empty-desc">${CONFIG.MESSAGES.NO_MEDIA_DESC}</p>
                </div>
            `;
      return;
    }
    console.log(this.filteredMedia);
    // Grille des médias
    container.innerHTML = this.filteredMedia
      .map(
        (media, index) => `
            <div class="photo-item" data-id="${
              media.id
            }" onclick="app.openLightbox(${index})">
                ${
                  media.type === "video"
                    ? `
                    <div class="video-badge">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
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
                }" alt="${
          media.name
        }" loading="lazy" onload="this.parentElement.classList.add('loaded')">
                <div class="photo-overlay">
                    <button class="select-btn" onclick="event.stopPropagation(); app.toggleSelect('${
                      media.id
                    }')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        `
      )
      .join("");

    // Marquer les éléments sélectionnés
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            
            ${
              hasPrev
                ? `
                <button class="lightbox-nav prev" onclick="event.stopPropagation(); app.navigateLightbox(-1)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
            `
                : ""
            }
            
            ${
              hasNext
                ? `
                <button class="lightbox-nav next" onclick="event.stopPropagation(); app.navigateLightbox(1)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
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
                    <button class="lightbox-btn" onclick="app.toggleInfoPanel()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                    </button>
                    <button class="lightbox-btn" onclick="app.downloadMedia(app.filteredMedia[${index}])">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </button>
                    <button class="lightbox-btn danger" onclick="app.deleteMedia(app.filteredMedia[${index}])">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
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
                  media.width && media.height
                    ? `
                <div class="info-row">
                    <span class="info-label">${CONFIG.MESSAGES.DIMENSIONS}</span>
                    <span>${media.width} × ${media.height} px</span>
                </div>
                `
                    : ""
                }
                <div class="info-row">
                    <span class="info-label">${
                      CONFIG.MESSAGES.DATE_ADDED
                    }</span>
                    <span>${new Date(
                      media.createdAt
                    ).toLocaleDateString()}</span>
                </div>
            </div>
        `;

    lightbox.classList.add("active");
  }

  closeLightbox() {
    this.currentLightboxIndex = -1;
    document.body.style.overflow = "";
    document.getElementById("lightbox")?.classList.remove("active");
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
}

// Initialiser l'application
let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new GalleryApp();
});
