import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/media.dart';
import '../app_config.dart';
import '../views/photo_view_screen.dart';
import '../services/media_provider.dart';

class PhotoGrid extends StatelessWidget {
  final List<Media> media;

  const PhotoGrid({super.key, required this.media});

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async {
        await Provider.of<MediaProvider>(context, listen: false).fetchAll();
      },
      child: GridView.builder(
        padding: const EdgeInsets.all(4.0),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount:
              3, // 3 colonnes au lieu de 4 pour des thumbnails plus grands
          crossAxisSpacing: 4.0,
          mainAxisSpacing: 4.0,
        ),
        itemCount: media.length,
        itemBuilder: (context, index) {
          final item = media[index];
          final thumbUrl = item.thumb != null
              ? AppConfig.baseUrl + item.thumb!
              : null;

          return GestureDetector(
            onTap: () {
              Navigator.of(context).push(
                PageRouteBuilder(
                  opaque: false, // Makes the route transparent
                  pageBuilder: (BuildContext context, _, __) {
                    return PhotoViewScreen(media: item, allMedia: media);
                  },
                ),
              );
            },
            child: GridTile(
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(2), // Bord arrondi de 2px
                  color: Colors.grey[200],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(
                    2,
                  ), // Clip l'image avec les bords arrondis
                  child: Stack(
                    children: [
                      // Image thumbnail avec zoom (BoxFit.cover)
                      thumbUrl != null
                          ? CachedNetworkImage(
                              imageUrl: thumbUrl,
                              fit: BoxFit
                                  .cover, // Zoom sur l'image pour remplir le carré
                              width: double.infinity,
                              height: double.infinity,
                              memCacheWidth:
                                  400, // Taille augmentée pour des thumbnails plus grands
                              memCacheHeight: 400,
                              cacheKey: thumbUrl,
                              placeholder: (context, url) => Container(
                                color: Colors.grey[200],
                                child: const Center(
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      Colors.grey,
                                    ),
                                  ),
                                ),
                              ),
                              errorWidget: (context, url, error) => Container(
                                color: Colors.grey[200],
                                child: const Icon(
                                  Icons.broken_image,
                                  color: Colors.grey,
                                ),
                              ),
                            )
                          : Container(
                              color: Colors.grey[200],
                              child: const Icon(
                                Icons.photo,
                                color: Colors.grey,
                              ),
                            ),
                      // Cœur de favoris en haut à droite
                      if (item.isFavorite)
                        Positioned(
                          top: 4,
                          right: 4,
                          child: Container(
                            padding: const EdgeInsets.all(2),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.9),
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.2),
                                  blurRadius: 2,
                                  offset: const Offset(0, 1),
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.favorite,
                              color: Colors.red,
                              size:
                                  18, // Taille légèrement augmentée pour les thumbnails plus grands
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
