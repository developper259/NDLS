// ================================
// SERVICE API
// ================================

class ApiService {
    constructor() {
        this.baseUrl = CONFIG.API_BASE_URL;
    }

    // Requête générique
    async request(endpoint, options = {}) {
        const url = CONFIG.getApiUrl(endpoint, options.params || {});
        
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };

        const config = {
            method: options.method || 'GET',
            headers: { ...defaultHeaders, ...options.headers }
        };

        if (options.body) {
            config.body = options.body instanceof FormData 
                ? options.body 
                : JSON.stringify(options.body);
            
            if (options.body instanceof FormData) {
                delete config.headers['Content-Type'];
            }
        }

        CONFIG.log('API Request:', url, config);

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();
            CONFIG.log('API Response:', data);
            return data;

        } catch (error) {
            CONFIG.log('API Error:', error);
            throw error;
        }
    }

    // Récupérer tous les médias
    async getMedia(filters = {}) {
        const queryParams = new URLSearchParams();
        
        if (filters.type && filters.type !== 'all') {
            queryParams.append('type', filters.type);
        }
        if (filters.minSize) {
            queryParams.append('minSize', filters.minSize);
        }
        if (filters.maxSize) {
            queryParams.append('maxSize', filters.maxSize);
        }
        if (filters.sortBy) {
            queryParams.append('sortBy', filters.sortBy);
        }
        if (filters.search) {
            queryParams.append('search', filters.search);
        }

        const endpoint = CONFIG.ENDPOINTS.MEDIA + (queryParams.toString() ? '?' + queryParams.toString() : '');
        return this.request(endpoint);
    }

    // Récupérer les infos de stockage
    async getStorage() {
        return this.request(CONFIG.ENDPOINTS.STORAGE);
    }

    // Upload de fichiers
    async uploadFile(file, onProgress) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('media', file);

            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    onProgress(progress);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (e) {
                        resolve({ success: true });
                    }
                } else {
                    reject(new Error(`Upload failed: ${xhr.status}`));
                }
            });

            xhr.addEventListener('error', (e) => {
                reject(new Error('Upload failed'));
            });

            xhr.open('POST', CONFIG.getApiUrl(CONFIG.ENDPOINTS.UPLOAD));
            xhr.send(formData);
        });
    }

    // Supprimer un média
    async deleteMedia(id) {
        return this.request(CONFIG.ENDPOINTS.DELETE, {
            method: 'DELETE',
            params: { id }
        });
    }

    // Télécharger un média
    downloadMedia(media) {
        const link = document.createElement('a');
        link.href = media.url;
        link.download = media.name || 'download';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Instance globale
const api = new ApiService();
