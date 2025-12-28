class AlbumManager {
  constructor(app) {
    this.albums = [];
    this.currentAlbumId = null;
    this.app = app; // Sera défini par l'application principale
  }

  /**
   * Charge la liste des albums depuis l'API
   */
  async loadAlbums() {
    try {
      const response = await api.getAlbums();
      if (response.success) {
        this.albums = response.data || [];
        this.renderAlbumsGrid();
      }
    } catch (error) {
      console.error("Erreur lors du chargement des albums:", error);
      this.app.showToast("Erreur lors du chargement des albums", "error");
    }
  }

  async renderCount() {
    const albumCount = (await this.getAlbums()).length;
    const statsEl = document.getElementById("media-stats");

    // Stats
    if (statsEl) {
      statsEl.innerHTML = `
                <div class="stat">
                    <span class="material-icons">folder</span>
                    <span><strong>${albumCount}</strong> ${
        albumCount !== 1 ? CONFIG.MESSAGES.ALBUMS : CONFIG.MESSAGES.ALBUM
      }</span>
                </div>`;
    }
  }

  async getAlbums() {
    const response = await api.getAlbums();
    if (response.success) {
      this.albums = response.data;
      return response.data || [];
    }
    this.albums = [];
    return [];
  }

  /**
   * Affiche la grille des albums
   */
  renderAlbumsGrid() {
    this.app.currentView = "albums";
    this.renderCount();
    const container = document.getElementById("photo-grid");
    if (!container) return;

    // On active le mode albums pour la grille
    container.className = "photo-grid albums-mode";

    if (!this.albums || this.albums.length === 0) {
      container.innerHTML = `<div class="empty-state">...</div>`;
      return;
    }

    container.innerHTML = this.albums
      .map((album) => {
        const thumbnailSrc = album.thumbnail
          ? album.thumbnail.startsWith("data:")
            ? album.thumbnail
            : CONFIG.BASE_URL + album.thumbnail
          : "assets/placeholder.jpg";

        return `
      <div class="album-card-wrapper" data-album-id="${album.id}" oncontextmenu="app.albumManager.showContextMenu(event, ${album.id})">
        <div class="album-image-wrapper">
          <img src="${thumbnailSrc}" alt="${album.name}" loading="lazy" onload="this.parentElement.classList.add('loaded')">
        </div>
        <div class="album-title-wrapper">
          <span class="album-name-text">${album.name}</span>
        </div>
      </div>
    `;
      })
      .join("");

    // Écouteurs d'événements
    container.querySelectorAll(".album-card-wrapper").forEach((card) => {
      card.addEventListener("click", (e) =>
        this.openAlbum(card.dataset.albumId, e)
      );
    });
  }

  /**
   * Ouvre un album spécifique
   * @param {string} albumId - ID de l'album à ouvrir
   * @param {Event} event - Événement de clic
   */
  async openAlbum(albumId, event) {
    event?.preventDefault();
    this.currentAlbumId = albumId;
    this.app.currentView = "album-view";

    try {
      this.app.renderLoading();
      const response = await api.getAlbumMedia(albumId);

      if (response.success) {
        // Afficher le titre de l'album
        const albumName = await this.getAlbumName(albumId);
        this.showAlbumTitle(albumName);

        this.app.setFilteredMedia(response.data || []);
        this.app.updatePageTitle(albumName);
        this.app.renderGallery();
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'album:", error);
      this.app.showToast("Erreur lors du chargement de l'album", "error");
    }
  }

  async deleteAlbum(albumId) {
    api.deleteAlbum(albumId).then(() => {
      this.refresh();
    });
  }

  /**
   * Affiche le titre de l'album
   * @param {string} albumName - Nom de l'album
   */
  showAlbumTitle(albumName) {
    const titleContainer = document.getElementById("album-title-container");
    if (titleContainer) {
      titleContainer.style.display = "block";
      titleContainer.querySelector("#album-title").textContent = albumName;

      // Ajouter l'écouteur d'événement pour le bouton retour
      document
        .getElementById("back-to-albums")
        .addEventListener("click", () => {
          this.backToAlbums();
        });
    }
  }

  /**
   * Masque le titre de l'album
   */
  hideAlbumTitle() {
    const titleContainer = document.getElementById("album-title-container");
    if (titleContainer) {
      titleContainer.style.display = "none";
      this.currentAlbumId = null;
    }
  }

  /**
   * Retourne à la liste des albums
   */
  backToAlbums() {
    this.currentAlbumId = null;
    this.hideAlbumTitle();
    this.app.setActiveView("albums");
    this.app.updatePageTitle("Albums");
    this.renderAlbumsGrid();
  }

  /**
   * Obtient le nom d'un album à partir de son ID
   * @param {string} albumId - ID de l'album
   * @returns {string} Nom de l'album ou "Album inconnu"
   */
  async getAlbumName(albumId) {
    const albums = await this.getAlbums();
    const album = albums.find((a) => parseInt(a.id) === parseInt(albumId));
    if (!album) {
      console.warn(`Album with ID ${albumId} not found in albums list`, albums);
      return "Album inconnu";
    }
    return album.name;
  }

  /**
   * Rafraîchit la liste des albums
   */
  async refresh() {
    await this.loadAlbums();
  }

  showContextMenu(event, albumId) {
    event.preventDefault();
    event.stopPropagation();

    if (!albumId) return false;

    // Afficher le menu contextuel
    if (window.contextMenu) {
      window.contextMenu.show(event, albumId, this.app);
    }

    return false;
  }
}

// Initialisation globale pour le débogage
window.albumManager = new AlbumManager();
