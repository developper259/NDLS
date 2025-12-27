// ================================
// CONFIGURATION DE L'APPLICATION
// ================================

const CONFIG = {
  // URL de votre API - MODIFIEZ ICI
  API_BASE_URL: "http://localhost:3000/api",
  BASE_URL: "http://localhost:3000",

  // Endpoints de l'API
  ENDPOINTS: {
    MEDIA: "/media",
    STORAGE: "/storage",
    UPLOAD: "/media/upload",
    TRASH: "/trash",
    DELETE: "/media/{id}",
    DOWNLOAD: "/media/{id}/download",
    ALBUMS: "/albums",
  },

  // ID de l'album des favoris
  FAVORITES_ALBUM_ID: "1",

  // Paramètres de la galerie
  GALLERY: {
    ITEMS_PER_PAGE: 50,
    DEFAULT_VIEW: "grid",
    COLUMNS: 4,
    GAP: 12,
    ENABLE_INFINITE_SCROLL: false,
    LAZY_LOADING: true,
  },

  // Paramètres d'upload
  UPLOAD: {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_IMAGE_TYPES: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ],
    ALLOWED_VIDEO_TYPES: [
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "video/avi",
    ],
    MULTIPLE: true,
    DRAG_DROP_ENABLED: true,
    SHOW_PROGRESS: true,
  },

  // Paramètres de stockage
  STORAGE: {
    SHOW_WARNING_AT: 80,
    SHOW_CRITICAL_AT: 90,
  },

  // Filtres disponibles
  FILTERS: {
    TYPES: [
      { value: "all", label: "Tous les médias" },
      { value: "photo", label: "Photos uniquement" },
      { value: "video", label: "Vidéos uniquement" },
    ],
    SIZES: [
      { value: "all", label: "Toutes tailles" },
      { value: "small", label: "Petit (< 2 MB)", min: 0, max: 2 },
      { value: "medium", label: "Moyen (2-10 MB)", min: 2, max: 10 },
      { value: "large", label: "Grand (> 10 MB)", min: 10, max: 999999 },
    ],
    SORTS: [
      { value: "date_desc", label: "Plus récent" },
      { value: "date_asc", label: "Plus ancien" },
      { value: "size_desc", label: "Plus grand" },
      { value: "size_asc", label: "Plus petit" },
      { value: "name_asc", label: "Nom (A-Z)" },
      { value: "name_desc", label: "Nom (Z-A)" },
    ],
  },

  // Messages et textes (facilement traduisibles)
  MESSAGES: {
    APP_NAME: "Memories",
    SEARCH_PLACEHOLDER: "Rechercher dans vos photos...",
    UPLOAD_BUTTON: "Importer",
    UPLOAD_SUCCESS: "Fichiers uploadés avec succès!",
    UPLOAD_ERROR: "Erreur lors de l'upload",
    UPLOAD_PROGRESS: "Upload en cours...",
    DELETE_SUCCESS: "Média supprimé avec succès",
    DELETE_ERROR: "Erreur lors de la suppression",
    DELETE_CONFIRM: "Êtes-vous sûr de vouloir supprimer ce média ?",
    DELETE_PERMANENT_CONFIRM:
      "Êtes-vous sûr de vouloir supprimer définitivement ce média ? Cette action est irréversible.",
    RESTORE_CONFIRM: "Êtes-vous sûr de vouloir restaurer ce média ?",
    DOWNLOAD_START: "Téléchargement démarré",
    DOWNLOAD_ERROR: "Erreur lors du téléchargement",
    LOAD_ERROR: "Erreur lors du chargement des médias",
    DELETE_PERMANENT_SUCCESS: "Média supprimé définitivement",
    DELETE_PERMANENT_ERROR: "Erreur lors de la suppression définitive",
    MOVE_TO_TRASH_SUCCESS: "Média déplacé vers la corbeille",
    MOVE_TO_TRASH_ERROR: "Erreur lors du déplacement vers la corbeille",
    RESTORE_SUCCESS: "Média restauré depuis la corbeille",
    RESTORE_ERROR: "Erreur lors de la restauration du média",
    EMPTY_TRASH_SUCCESS: "Corbeille vidée avec succès",
    EMPTY_TRASH_ERROR: "Erreur lors de la vidange de la corbeille",
    TRASH_EMPTY: "La corbeille est vide",
    FILTER_ERROR: "Erreur lors de l'application des filtres",
    NO_MEDIA: "Aucun média trouvé",
    NO_MEDIA_DESC: "Importez des photos ou vidéos pour commencer",
    PHOTOS: "photos",
    PHOTO: "photo",
    VIDEOS: "vidéos",
    VIDEO: "vidéo",
    ALBUMS: "albums",
    ALBUM: "album",
    STORAGE: "Stockage",
    STORAGE_USED: "{used} {unit} sur {total} {unit} utilisés",
    FILTERS: "Filtres",
    TYPE: "Type",
    SIZE: "Taille",
    SORT_BY: "Trier par",
    INFO: "Informations",
    DOWNLOAD: "Télécharger",
    DELETE: "Supprimer",
    CLOSE: "Fermer",
    PREVIOUS: "Précédent",
    NEXT: "Suivant",
    DATE_ADDED: "Date d'ajout",
    DIMENSIONS: "Dimensions",
    FILE_TYPE: "Type",
    FILE_SIZE: "Taille",
    PRIVACY: "Confidentialité",
    TERMS: "Conditions",
  },

  // Animation et UI
  UI: {
    ANIMATION_DURATION: 3000,
    TOAST_DURATION: 3000,
    DEBOUNCE_SEARCH: 300,
    LIGHTBOX_BLUR: 24,
    HOVER_SCALE: 1.02,
    THEME: "light", // 'light' ou 'dark'
  },

  // Couleurs personnalisables
  COLORS: {
    PRIMARY: "#2563eb",
    PRIMARY_HOVER: "#1d4ed8",
    BACKGROUND: "#ffffff",
    FOREGROUND: "#0f172a",
    MUTED: "#f1f5f9",
    MUTED_FOREGROUND: "#64748b",
    BORDER: "#e2e8f0",
    DANGER: "#ef4444",
    SUCCESS: "#22c55e",
    WARNING: "#f59e0b",
    OVERLAY: "rgba(0, 0, 0, 0.95)",
  },

  // Debug mode
  DEBUG: false,
};

// ================================
// FONCTIONS UTILITAIRES
// ================================

// Construire les URLs d'API
CONFIG.getApiUrl = function (endpoint, params = {}) {
  let url = this.API_BASE_URL + endpoint;

  Object.keys(params).forEach((key) => {
    url = url.replace(`{${key}}`, params[key]);
  });

  return url;
};

// Valider un fichier
CONFIG.validateFile = function (file) {
  const errors = [];

  if (file.size > this.UPLOAD.MAX_FILE_SIZE) {
    const maxMB = this.UPLOAD.MAX_FILE_SIZE / 1024 / 1024;
    errors.push(`Le fichier ${file.name} est trop volumineux (max ${maxMB}MB)`);
  }

  const allowedTypes = [
    ...this.UPLOAD.ALLOWED_IMAGE_TYPES,
    ...this.UPLOAD.ALLOWED_VIDEO_TYPES,
  ];
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Le type de fichier ${file.type} n'est pas supporté`);
  }

  return {
    valid: errors.length === 0,
    errors: errors,
  };
};

// Détecter si c'est une image ou vidéo
CONFIG.getMediaType = function (file) {
  if (this.UPLOAD.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "photo";
  }
  if (this.UPLOAD.ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return "video";
  }
  return "unknown";
};

// Formater la taille de fichier
CONFIG.formatFileSize = function (bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Formater la durée vidéo
CONFIG.formatDuration = function (seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Formater la date
CONFIG.formatDate = function (dateString, options = {}) {
  const defaultOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("fr-FR", {
    ...defaultOptions,
    ...options,
  });
};

// Export pour modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
