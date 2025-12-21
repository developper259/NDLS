const Album = require('../addon/album');

// Créer un nouvel album
const createAlbum = async (req, res) => {
    try {
        const { name, description } = req.body;
        const album = await Album.create({ name, description });
        
        res.status(201).json({
            success: true,
            data: album
        });
    } catch (error) {
        console.error('Erreur lors de la création de l\'album:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'album',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// Récupérer tous les albums
const getAllAlbums = async (req, res) => {
    try {
        const albums = await Album.getAll();
        res.json({
            success: true,
            data: albums
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des albums:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des albums',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// Récupérer un album par son ID
const getAlbumById = async (req, res) => {
    try {
        const album = await Album.getById(req.params.id);
        if (!album) {
            return res.status(404).json({
                success: false,
                message: 'Album non trouvé'
            });
        }
        
        res.json({
            success: true,
            data: album
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'album:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'album',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// Mettre à jour un album
const updateAlbum = async (req, res) => {
    try {
        const { name, description } = req.body;
        const album = await Album.update(req.params.id, { name, description });
        
        if (!album) {
            return res.status(404).json({
                success: false,
                message: 'Album non trouvé'
            });
        }
        
        res.json({
            success: true,
            data: album
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'album:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'album',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// Supprimer un album
const deleteAlbum = async (req, res) => {
    try {
        const result = await Album.delete(req.params.id);
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Album non trouvé'
            });
        }
        
        res.json({
            success: true,
            message: 'Album supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'album:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'album',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// Ajouter des médias à un album
const addMediaToAlbum = async (req, res) => {
    try {
        const { mediaIds } = req.body;
        const result = await Album.addMedia(req.params.albumId, mediaIds);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout des médias à l\'album:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'ajout des médias à l\'album',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// Supprimer des médias d'un album
const removeMediaFromAlbum = async (req, res) => {
    try {
        const { mediaIds } = req.body;
        const result = await Album.removeMedia(req.params.albumId, mediaIds);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Erreur lors de la suppression des médias de l\'album:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression des médias de l\'album',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

module.exports = {
    createAlbum,
    getAllAlbums,
    getAlbumById,
    updateAlbum,
    deleteAlbum,
    addMediaToAlbum,
    removeMediaFromAlbum
};
