class ContextMenu {
  constructor() {
    this.menu = document.createElement("div");
    this.menu.className = "context-menu";
    document.body.appendChild(this.menu);
    this.currentApp = null;
    this.currentMedia = null;
    this.currentIndex = null;
    this.currentAlbumId = null;

    // Fermer le menu lors d'un clic ailleurs
    document.addEventListener("click", () => this.hide());

    // Fermer le menu lors d'un défilement
    window.addEventListener("scroll", () => this.hide(), true);

    // Empêcher le menu contextuel par défaut sur le menu
    this.menu.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      return false;
    });

    // Lier les méthodes
    this.handleOpenLightbox = this.handleOpenLightbox.bind(this);
    this.handleDownload = this.handleDownload.bind(this);
    this.handleShare = this.handleShare.bind(this);
    this.handleToggleFavorite = this.handleToggleFavorite.bind(this);
    this.handleAddToAlbum = this.handleAddToAlbum.bind(this);
    this.handleMoveToTrash = this.handleMoveToTrash.bind(this);
    this.handleRestore = this.handleRestore.bind(this);
    this.handleDeletePermanently = this.handleDeletePermanently.bind(this);
    this.handleRemoveFromAlbum = this.handleRemoveFromAlbum.bind(this);

    this.handleOpenAlbum = this.handleOpenAlbum.bind(this);
    this.handleDeleteAlbum = this.handleDeleteAlbum.bind(this);
  }

  show(event, media, app) {
    event.preventDefault();
    this.hide();
    
    if (app.currentView === "albums") {
      this.currentAlbumId = media;
    } else {
      this.currentMedia = media;
      this.currentIndex = app.getIndexMediaById(media.id);
    }

    // Stocker les références
    this.currentApp = app;

    // Créer le contenu du menu
    this.menu.innerHTML = this.buildMenuContent(media, app);
    this.menu.classList.add("visible");

    // Ajouter les écouteurs d'événements
    this.addEventListeners();

    // Positionner le menu
    const x = Math.min(
      event.clientX,
      window.innerWidth - this.menu.offsetWidth - 10
    );
    const y = Math.min(
      event.clientY,
      window.innerHeight - this.menu.offsetHeight - 10
    );

    this.menu.style.left = `${x}px`;
    this.menu.style.top = `${y}px`;
  }

  hide() {
    this.menu.classList.remove("visible");
  }

  addEventListeners() {
    const items = this.menu.querySelectorAll(".context-menu-item");
    items.forEach((item) => {
      const action = item.dataset.action;
      if (action) {
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          const handlerName = `handle${
            action.charAt(0).toUpperCase() + action.slice(1)
          }`;
          if (typeof this[handlerName] === "function") {
            this[handlerName](e);
          }
        });
      }
    });
  }

  // Gestionnaires d'événements
  handleOpenLightbox() {
    if (this.currentApp && this.currentIndex !== null) {
      this.currentApp.openLightbox(this.currentIndex);
      this.hide();
    }
  }

  handleDownload() {
    if (this.currentApp && this.currentMedia) {
      this.currentApp.downloadMedia(this.currentMedia.id);
      this.hide();
    }
  }

  handleShare() {
    if (this.currentApp && this.currentMedia) {
      this.currentApp.shareMedia(this.currentMedia.id);
      this.hide();
    }
  }

  handleToggleFavorite() {
    if (this.currentApp && this.currentMedia) {
      this.currentApp.changeMediaFavorite(this.currentMedia.id);
      this.hide();
    }
  }

  handleAddToAlbum() {
    if (this.currentApp && this.currentMedia) {
      this.currentApp.AddToAlbum(this.currentMedia.id);
      this.hide();
    }
  }

  handleMoveToTrash() {
    if (this.currentApp && this.currentMedia) {
      this.currentApp.deleteMedia(this.currentMedia.id);
      this.hide();
    }
  }

  handleRestore() {
    if (this.currentApp && this.currentMedia) {
      this.currentApp.restoreFromTrash(this.currentMedia.id);
      this.hide();
    }
  }

  handleDeletePermanently() {
    if (this.currentApp && this.currentMedia) {
      this.currentApp.deleteMedia(this.currentMedia.id);
      this.hide();
    }
  }

  handleRemoveFromAlbum() {
    if (this.currentApp && this.currentMedia) {
      this.currentApp.removeFromAlbum(this.currentMedia.id);
      this.hide();
    }
  }

  handleOpenAlbum() {
    this.currentApp.openAlbum(this.currentAlbumId);
    this.hide();
  }

  handleDeleteAlbum() {
    this.currentApp.deleteAlbum(this.currentAlbumId);
    this.hide();
  }

  buildMenuContent(media, app) {
    const isInTrash = app.currentView === "trash";
    const isFavorite = media.favorite;
    const isInAlbumView = app.currentView === "album-view";
    const isInAlbumSelector = app.currentView == "albums";
    let menuItems = [];

    if (isInAlbumSelector) {
      menuItems.push(`
      <div class="context-menu-item" data-action="openAlbum">
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
          <path d="M8 15h8v-2H8v2zm0-4h8V9H8v2zm-1-5h10V5H7v1zm0 12v-1h10v1H7z"/>
        </svg>
        Ouvrir
      </div>
      
      <div class="context-menu-item text-danger" data-action="deleteAlbum">
          <svg class="icon" viewBox="0 0 24 24" style="color: red">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
          <span style="color: red">Supprimer</span>
        </div>
    `);
      return menuItems.join("\n");
    }

    // Options communes
    menuItems.push(`
      <div class="context-menu-item" data-action="openLightbox">
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
          <path d="M8 15h8v-2H8v2zm0-4h8V9H8v2zm-1-5h10V5H7v1zm0 12v-1h10v1H7z"/>
        </svg>
        Ouvrir
      </div>
      
      <div class="context-menu-item" data-action="download">
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
        Télécharger
      </div>
    `);

    // Options qui ne s'affichent pas dans la corbeille
    if (!isInTrash) {
      menuItems.push(`
        <div class="context-menu-item" data-action="share">
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/>
          </svg>
          Partager
        </div>
        
        <div class="context-menu-divider"></div>
        
        <div class="context-menu-item" data-action="toggleFavorite">
          <svg class="icon" viewBox="0 0 24 24">
            <path fill="${
              isFavorite ? "white" : "none"
            }" stroke="currentColor" stroke-width="2" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          ${isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        </div>
        
        ${
          !isInAlbumView
            ? `
        <div class="context-menu-item" data-action="addToAlbum">
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Ajouter à un album
        </div>
        `
            : `
        <div class="context-menu-item" data-action="removeFromAlbum">
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
          Enlever de l'album
        </div>`
        }
        
        <div class="context-menu-divider"></div>
        
        <div class="context-menu-item text-danger" data-action="moveToTrash">
          <svg class="icon" viewBox="0 0 24 24" style="color: red">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
          <span style="color: red">Déplacer vers la corbeille</span>
        </div>
      `);
    } else {
      // Options spécifiques à la corbeille
      menuItems.push(`
        <div class="context-menu-item" data-action="restore">
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
          </svg>
          Restaurer
        </div>
        
        <div class="context-menu-divider"></div>
        
        <div class="context-menu-item text-danger" data-action="deletePermanently">
          <svg class="icon" viewBox="0 0 24 24" style="color: red">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
          <span style="color: red">Supprimer définitivement</span>
        </div>
      `);
    }

    return menuItems.join("\n");
  }
}

// Initialisation du menu contextuel
const contextMenu = new ContextMenu();
