import 'package:flutter/material.dart';
import '../models/album.dart';
import '../app_config.dart';

class AlbumGrid extends StatelessWidget {
  final List<Album> albums;

  const AlbumGrid({super.key, required this.albums});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.all(8.0),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 8.0,
        mainAxisSpacing: 8.0,
        childAspectRatio: 1.0,
      ),
      itemCount: albums.length,
      itemBuilder: (context, index) {
        final album = albums[index];
        final coverUrl = album.coverUrl != null
            ? AppConfig.baseUrl + (album.coverUrl ?? '')
            : null;

        return Card(
          clipBehavior: Clip.antiAlias,
          child: GridTile(
            footer: GridTileBar(
              backgroundColor: Colors.black45,
              title: Text(album.name, style: const TextStyle(fontSize: 16)),
              subtitle: Text('${album.mediaCount} items'),
            ),
            child: coverUrl != null
                ? Image.network(
                    coverUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return const Icon(Icons.broken_image, size: 48);
                    },
                  )
                : const Icon(Icons.photo_album, size: 48, color: Colors.grey),
          ),
        );
      },
    );
  }
}
