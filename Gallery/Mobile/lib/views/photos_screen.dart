import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/media_provider.dart';
import '../widgets/photo_grid.dart';

class PhotosScreen extends StatelessWidget {
  const PhotosScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Photos')),
      body: Consumer<MediaProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.media.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.media.isEmpty) {
            return RefreshIndicator(
              onRefresh: () => provider.fetchAll(),
              child: SingleChildScrollView(
                physics:
                    const AlwaysScrollableScrollPhysics(), // Permet le scroll même si le contenu est petit
                child: Center(
                  child: Container(
                    constraints: BoxConstraints(
                      minHeight:
                          MediaQuery.of(context).size.height -
                          MediaQuery.of(context).padding.top -
                          kToolbarHeight, // Hauteur minimale pour permettre le scroll
                    ),
                    child: const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.photo_library_outlined,
                          size: 64,
                          color: Colors.grey,
                        ),
                        SizedBox(height: 16),
                        Text(
                          'No media found.',
                          style: TextStyle(fontSize: 16, color: Colors.grey),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Pull down to refresh',
                          style: TextStyle(fontSize: 14, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }

          return PhotoGrid(media: provider.media);
        },
      ),
    );
  }
}
