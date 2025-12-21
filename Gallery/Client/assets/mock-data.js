// ================================
// DONNÉES DE DÉMONSTRATION
// Supprimez ce fichier et connectez votre API
// ================================

// Simuler des données mockées pour la démo
// Cette fonction remplace temporairement les appels API

(function() {
    // Données mockées
    const MOCK_MEDIA = [
        {
            id: "1",
            url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1280&fit=crop",
            thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
            type: "photo",
            format: "JPG",
            name: "Alps_mountains.jpg",
            size: 3.2,
            width: 1920,
            height: 1280,
            dateAdded: "2024-12-15T10:30:00Z",
            category: "nature"
        },
        {
            id: "2",
            url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&h=1280&fit=crop",
            thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop",
            type: "photo",
            format: "JPG",
            name: "Night_sky.jpg",
            size: 4.5,
            width: 1920,
            height: 1080,
            dateAdded: "2024-12-14T14:20:00Z",
            category: "nature"
        },
        {
            id: "3",
            url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&h=2400&fit=crop",
            thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&h=450&fit=crop",
            type: "photo",
            format: "PNG",
            name: "Architecture_01.png",
            size: 2.8,
            width: 1600,
            height: 2400,
            dateAdded: "2024-12-13T09:15:00Z",
            category: "architecture"
        },
        {
            id: "4",
            url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=1800&fit=crop",
            thumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=450&fit=crop",
            type: "photo",
            format: "JPG",
            name: "City_street.jpg",
            size: 1.9,
            width: 1200,
            height: 1800,
            dateAdded: "2024-12-12T16:45:00Z",
            category: "architecture"
        },
        {
            id: "5",
            url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&h=1280&fit=crop",
            thumbnail: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop",
            type: "photo",
            format: "JPG",
            name: "Friends_portrait.jpg",
            size: 2.1,
            width: 1920,
            height: 1280,
            dateAdded: "2024-12-11T11:30:00Z",
            category: "people"
        },
        {
            id: "6",
            url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1600&h=2400&fit=crop",
            thumbnail: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=450&fit=crop",
            type: "photo",
            format: "PNG",
            name: "Portrait_man.png",
            size: 5.2,
            width: 1600,
            height: 2400,
            dateAdded: "2024-12-10T08:00:00Z",
            category: "people"
        },
        {
            id: "7",
            url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&h=1067&fit=crop",
            thumbnail: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=267&fit=crop",
            type: "photo",
            format: "JPG",
            name: "Dog_golden.jpg",
            size: 1.8,
            width: 1600,
            height: 1067,
            dateAdded: "2024-12-09T15:20:00Z",
            category: "pets"
        },
        {
            id: "8",
            url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1920&h=1280&fit=crop",
            thumbnail: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop",
            type: "photo",
            format: "JPG",
            name: "Cat_orange.jpg",
            size: 2.4,
            width: 1920,
            height: 1280,
            dateAdded: "2024-12-08T12:10:00Z",
            category: "pets"
        },
        {
            id: "9",
            url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1280&fit=crop",
            thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
            type: "photo",
            format: "JPG",
            name: "Man_portrait.jpg",
            size: 3.7,
            width: 1920,
            height: 1280,
            dateAdded: "2024-12-07T09:45:00Z",
            category: "people"
        },
        {
            id: "10",
            url: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1920&h=1080&fit=crop",
            thumbnail: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=225&fit=crop",
            type: "video",
            format: "MP4",
            name: "Ocean_waves.mp4",
            size: 45.6,
            width: 1920,
            height: 1080,
            duration: 32,
            dateAdded: "2024-12-06T18:30:00Z",
            category: "nature"
        },
        {
            id: "11",
            url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&h=1280&fit=crop",
            thumbnail: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop",
            type: "photo",
            format: "JPG",
            name: "Lake_sunset.jpg",
            size: 2.9,
            width: 1920,
            height: 1280,
            dateAdded: "2024-12-05T22:15:00Z",
            category: "nature"
        },
        {
            id: "12",
            url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&h=1080&fit=crop",
            thumbnail: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=225&fit=crop",
            type: "video",
            format: "MP4",
            name: "City_timelapse.mp4",
            size: 78.3,
            width: 1920,
            height: 1080,
            duration: 45,
            dateAdded: "2024-12-04T14:00:00Z",
            category: "architecture"
        }
    ];

    const MOCK_STORAGE = {
        used: 12.4,
        total: 15,
        unit: "GB"
    };

    // Override API methods pour la démo
    const originalGetMedia = ApiService.prototype.getMedia;
    ApiService.prototype.getMedia = async function(filters) {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_MEDIA;
    };

    const originalGetStorage = ApiService.prototype.getStorage;
    ApiService.prototype.getStorage = async function() {
        await new Promise(resolve => setTimeout(resolve, 200));
        return MOCK_STORAGE;
    };

    const originalUploadFile = ApiService.prototype.uploadFile;
    ApiService.prototype.uploadFile = async function(file, onProgress) {
        // Simuler upload progress
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (onProgress) onProgress(i);
        }
        
        return {
            success: true,
            media: {
                id: Date.now().toString(),
                url: URL.createObjectURL(file),
                thumbnail: URL.createObjectURL(file),
                type: file.type.startsWith('video/') ? 'video' : 'photo',
                format: file.name.split('.').pop().toUpperCase(),
                name: file.name,
                size: file.size / (1024 * 1024),
                width: 1920,
                height: 1080,
                dateAdded: new Date().toISOString()
            }
        };
    };

    const originalDeleteMedia = ApiService.prototype.deleteMedia;
    ApiService.prototype.deleteMedia = async function(id) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true };
    };

    console.log('📸 Mode démo activé - Données mockées chargées');
    console.log('📝 Pour connecter votre API, modifiez config.js et supprimez mock-data.js');
})();
