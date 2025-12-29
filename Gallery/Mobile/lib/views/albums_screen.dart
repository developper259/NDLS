import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/media_provider.dart';
import '../widgets/album_grid.dart';

class AlbumsScreen extends StatelessWidget {
  const AlbumsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Albums')),
      body: Consumer<MediaProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.albums.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.albums.isEmpty) {
            return const Center(child: Text('No albums found.'));
          }

          return AlbumGrid(albums: provider.albums);
        },
      ),
    );
  }
}
