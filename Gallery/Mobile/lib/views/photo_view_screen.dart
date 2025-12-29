import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/media.dart';
import '../app_config.dart';
import '../services/api_service.dart';
import '../services/media_provider.dart';

class PhotoViewScreen extends StatefulWidget {
  final Media media;
  final List<Media> allMedia;

  const PhotoViewScreen({
    super.key,
    required this.media,
    required this.allMedia,
  });

  @override
  State<PhotoViewScreen> createState() => _PhotoViewScreenState();
}

class _PhotoViewScreenState extends State<PhotoViewScreen> {
  bool _isFavorite = false;
  late PageController _pageController;
  late int _currentIndex;
  bool _isZoomed = false; // État du zoom
  bool _showUI = true; // État de visibilité de l'UI
  late TransformationController _transformationController;

  @override
  void initState() {
    super.initState();
    _isFavorite = widget.media.isFavorite;
    _currentIndex = widget.allMedia.indexOf(widget.media);
    _pageController = PageController(initialPage: _currentIndex);
    _transformationController = TransformationController();
    _preloadImages();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _transformationController.dispose();
    super.dispose();
  }

  // Helper pour construire l'image avec chargement progressif
  Widget _buildImageWithQuality({required String imageUrl, String? thumbUrl}) {
    return FadeInImage(
      placeholder: CachedNetworkImageProvider(
        thumbUrl ?? imageUrl, // Utilise le thumbnail comme placeholder
        maxWidth: 400,
        maxHeight: 400,
      ),
      image: CachedNetworkImageProvider(
        imageUrl, // Image haute qualité
        maxWidth: 2048,
        maxHeight: 2048,
      ),
      fit: BoxFit.contain,
      width: double.infinity,
      height: double.infinity,
      // Transition de fondu pour une apparition douce
      fadeInDuration: const Duration(milliseconds: 200),
      fadeOutDuration: const Duration(milliseconds: 200),
      // Assure que le placeholder ne saute pas
      placeholderFit: BoxFit.contain,
    );
  }

  void _preloadImages() {
    // Précharger les images adjacentes pour un swipe fluide
    final preloadRange = 1; // Réduire à 1 pour moins de latence
    final start = (_currentIndex - preloadRange).clamp(
      0,
      widget.allMedia.length - 1,
    );
    final end = (_currentIndex + preloadRange).clamp(
      0,
      widget.allMedia.length - 1,
    );

    // Précharger les images adjacentes de manière asynchrone
    for (int i = start; i <= end; i++) {
      if (i >= 0 && i < widget.allMedia.length && i != _currentIndex) {
        final media = widget.allMedia[i];
        final imageUrl = AppConfig.baseUrl + media.path;

        // Précharger l'image avec des paramètres optimisés
        CachedNetworkImage(
          imageUrl: imageUrl,
          memCacheWidth: 800, // Taille réduite pour chargement plus rapide
          memCacheHeight: 800,
          cacheKey: imageUrl,
        );
      }
    }
  }

  void _onPageChanged(int index) {
    setState(() {
      _currentIndex = index;
      _isFavorite = widget.allMedia[index].isFavorite;
    });
    // Précharger les nouvelles images adjacentes
    _preloadImages();
  }

  Future<void> _toggleFavorite(BuildContext context) async {
    try {
      final apiService = ApiService();
      final currentMedia = widget.allMedia[_currentIndex];
      if (_isFavorite) {
        await apiService.removeMediaFavorite(currentMedia);
      } else {
        await apiService.setMediaFavorite(currentMedia);
      }
      // Update local state immediately
      setState(() {
        _isFavorite = !_isFavorite;
      });
      // Refresh the media list
      await Provider.of<MediaProvider>(context, listen: false).fetchAll();
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _downloadMedia() async {
    final currentMedia = widget.allMedia[_currentIndex];
    final url = AppConfig.baseUrl + currentMedia.path;
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _shareMedia() async {
    final currentMedia = widget.allMedia[_currentIndex];
    final url = AppConfig.baseUrl + currentMedia.path;
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _deleteMedia(BuildContext context) async {
    final currentMedia = widget.allMedia[_currentIndex];
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Media'),
        content: const Text('Are you sure you want to delete this media?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final apiService = ApiService();
        await apiService.moveToTrash(currentMedia.id);
        // Refresh the media list
        await Provider.of<MediaProvider>(context, listen: false).fetchAll();
        if (context.mounted) {
          Navigator.of(context).pop();
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('Error: $e')));
        }
      }
    }
  }

  void _showInfo(BuildContext context) {
    final currentMedia = widget.allMedia[_currentIndex];
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(currentMedia.name),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Type: ${currentMedia.type}'),
            Text('Size: ${currentMedia.size} bytes'),
            if (currentMedia.width != null && currentMedia.height != null)
              Text('Dimensions: ${currentMedia.width}x${currentMedia.height}'),
            Text('Created: ${currentMedia.createdAt}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _isZoomed || !_showUI
          ? Colors.black
          : Colors.transparent,
      body: Stack(
        children: [
          // Background (blur ou noir selon l'état)
          if (!_isZoomed && _showUI)
            BackdropFilter(
              filter: ImageFilter.blur(
                sigmaX: AppConfig.lightboxBlur,
                sigmaY: AppConfig.lightboxBlur,
              ),
              child: Container(color: AppConfig.overlay.withOpacity(0.5)),
            ),
          // PageView for swipe navigation
          PageView.builder(
            controller: _pageController,
            onPageChanged: _onPageChanged,
            itemCount: widget.allMedia.length,
            itemBuilder: (context, index) {
              final media = widget.allMedia[index];
              final imageUrl = AppConfig.baseUrl + media.path;
              final thumbUrl = media.thumb != null
                  ? AppConfig.baseUrl + media.thumb!
                  : null;

              return GestureDetector(
                onTap: () {
                  setState(() {
                    _showUI = !_showUI; // Toggle seulement l'UI
                    // Ne réinitialiser l'image que si le zoom est à 1.0
                    final transform = _transformationController.value;
                    final scale = transform.getMaxScaleOnAxis();
                    if (scale <= 1.0) {
                      _transformationController.value = Matrix4.identity();
                    }
                  });
                },
                child: Center(
                  child: InteractiveViewer(
                    transformationController: _transformationController,
                    minScale: 1.0,
                    maxScale: 5.0,
                    boundaryMargin: EdgeInsets.zero, // L'image colle aux bords
                    onInteractionEnd: (details) {
                      // Vérifier si le zoom est trop faible et réinitialiser
                      final transform = _transformationController.value;
                      final scale = transform.getMaxScaleOnAxis();
                      if (scale <= 1.0) {
                        // Réinitialiser à la position initiale
                        _transformationController.value = Matrix4.identity();
                      }
                    },
                    child: _buildImageWithQuality(
                      imageUrl: imageUrl,
                      thumbUrl: thumbUrl,
                    ),
                  ),
                ),
              );
            },
          ),
          // UI Elements (cachés quand _showUI est false)
          if (_showUI) ...[
            // Close button
            Positioned(
              top: 40,
              right: 20,
              child: IconButton(
                icon: const Icon(Icons.close, color: Colors.white, size: 30),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ),
            // Page indicator
            if (widget.allMedia.length > 1)
              Positioned(
                top: 40,
                left: 20,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${_currentIndex + 1} / ${widget.allMedia.length}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            // Action buttons
            Positioned(
              bottom: 40,
              left: 20,
              right: 20,
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.7),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    IconButton(
                      icon: Icon(
                        _isFavorite ? Icons.favorite : Icons.favorite_border,
                        color: Colors.white,
                        size: 28,
                      ),
                      onPressed: () => _toggleFavorite(context),
                    ),
                    IconButton(
                      icon: const Icon(
                        Icons.info,
                        color: Colors.white,
                        size: 28,
                      ),
                      onPressed: () => _showInfo(context),
                    ),
                    IconButton(
                      icon: const Icon(
                        Icons.download,
                        color: Colors.white,
                        size: 28,
                      ),
                      onPressed: _downloadMedia,
                    ),
                    IconButton(
                      icon: const Icon(
                        Icons.share,
                        color: Colors.white,
                        size: 28,
                      ),
                      onPressed: _shareMedia,
                    ),
                    IconButton(
                      icon: const Icon(
                        Icons.delete,
                        color: Colors.red,
                        size: 28,
                      ),
                      onPressed: () => _deleteMedia(context),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
