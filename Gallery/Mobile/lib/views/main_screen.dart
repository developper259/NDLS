import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/media_provider.dart';
import 'photos_screen.dart';
import 'albums_screen.dart';
import 'favorites_screen.dart';
import 'trash_screen.dart';
import '../services/upload_provider.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  static final List<Widget> _widgetOptions = <Widget>[
    const PhotosScreen(),
    const AlbumsScreen(),
    const FavoritesScreen(),
    const TrashScreen(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<MediaProvider>(context, listen: false).fetchAll();
      // Configurer le callback pour rafraîchir les médias après upload
      Provider.of<UploadProvider>(
        context,
        listen: false,
      ).setMediaRefreshCallback(() {
        Provider.of<MediaProvider>(context, listen: false).fetchAll();
      });
    });
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  void _showUploadMenu() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (BuildContext context) {
        return Consumer<UploadProvider>(
          builder: (context, provider, child) {
            return Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(20),
                  topRight: Radius.circular(20),
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Poignée pour le swipe
                  Container(
                    margin: const EdgeInsets.symmetric(vertical: 12),
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    child: Column(
                      children: [
                        _buildMenuItem(
                          icon: Icons.upload_file,
                          title: 'Importer un fichier',
                          onTap: () {
                            Navigator.of(context).pop();
                            _uploadFile();
                          },
                        ),
                        _buildMenuItem(
                          icon: Icons.photo_library,
                          title: 'Importer depuis la galerie',
                          onTap: () {
                            Navigator.of(context).pop();
                            _importFromGallery();
                          },
                        ),
                        _buildMenuItem(
                          icon: Icons.create_new_folder,
                          title: 'Créer un album',
                          onTap: () {
                            Navigator.of(context).pop();
                            _createAlbum();
                          },
                        ),
                        if (provider.queue.isNotEmpty)
                          _buildMenuItem(
                            icon: Icons.list,
                            title: 'Voir la file d\'attente',
                            onTap: () {
                              Navigator.of(context).pop();
                              _showUploadQueueBottomSheet();
                            },
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: Colors.blue[600], size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: Colors.black87,
                ),
              ),
            ),
            Icon(Icons.chevron_right, color: Colors.grey[400], size: 20),
          ],
        ),
      ),
    );
  }

  void _uploadFile() {
    Provider.of<UploadProvider>(context, listen: false).pickAndUploadFiles();
  }

  void _importFromGallery() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Import depuis la galerie bientôt disponible'),
      ),
    );
  }

  void _createAlbum() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Création d\'album bientôt disponible')),
    );
  }

  void _clearUploadQueue(BuildContext context) {
    final confirmed = showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Vider la file d\'attente'),
        content: const Text(
          'Êtes-vous sûr de vouloir vider toute la file d\'attente ?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Vider'),
          ),
        ],
      ),
    );

    confirmed.then((value) {
      if (value == true) {
        Provider.of<UploadProvider>(context, listen: false).clearQueue();
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('File d\'attente vidée')));
      }
    });
  }

  void _showUploadQueueBottomSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (BuildContext context) {
        return Consumer<UploadProvider>(
          builder: (context, provider, child) {
            return Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(20),
                  topRight: Radius.circular(20),
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Poignée pour le swipe
                  Container(
                    margin: const EdgeInsets.symmetric(vertical: 12),
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  // Header
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'File d\'attente${provider.queue.isNotEmpty ? ' (${provider.queue.length})' : ''}',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        Row(
                          children: [
                            if (provider.queue.isNotEmpty)
                              GestureDetector(
                                onTap: () => _clearUploadQueue(context),
                                child: Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.red[50],
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Icon(
                                    Icons.delete_outline,
                                    color: Colors.red[600],
                                    size: 20,
                                  ),
                                ),
                              ),
                            const SizedBox(width: 8),
                            GestureDetector(
                              onTap: () => Navigator.of(context).pop(),
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Colors.grey[100],
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: const Icon(
                                  Icons.close,
                                  color: Colors.black54,
                                  size: 20,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Divider
                  Container(height: 1, color: Colors.grey[200]),
                  // Content
                  if (provider.queue.isEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 40),
                      child: const Center(
                        child: Column(
                          children: [
                            Icon(
                              Icons.cloud_upload_outlined,
                              size: 64,
                              color: Colors.grey,
                            ),
                            SizedBox(height: 16),
                            Text(
                              'Aucun upload en cours',
                              style: TextStyle(
                                color: Colors.grey,
                                fontSize: 16,
                              ),
                            ),
                            SizedBox(height: 8),
                            Text(
                              'Appuyez sur + pour commencer',
                              style: TextStyle(
                                color: Colors.grey,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    Container(
                      constraints: const BoxConstraints(maxHeight: 400),
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: provider.queue.length,
                        itemBuilder: (context, index) {
                          final item = provider.queue[index];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.grey[50],
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.grey[200]!),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: Colors.blue[50],
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Icon(
                                        _getFileIcon(item.fileName),
                                        color: Colors.blue[600],
                                        size: 20,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            item.fileName,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w600,
                                              fontSize: 14,
                                            ),
                                            overflow: TextOverflow.ellipsis,
                                            maxLines: 1,
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            _getStatusText(item.status),
                                            style: TextStyle(
                                              color: _getStatusColor(
                                                item.status,
                                              ),
                                              fontSize: 12,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Icon(
                                      _getStatusIcon(item.status),
                                      color: _getStatusColor(item.status),
                                      size: 20,
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                if (item.status == UploadStatus.uploading)
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      LinearProgressIndicator(
                                        value: item.progress,
                                        backgroundColor: Colors.grey[200],
                                        valueColor:
                                            AlwaysStoppedAnimation<Color>(
                                              Colors.blue[600]!,
                                            ),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      const SizedBox(height: 6),
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            '${(item.progress * 100).toInt()}%',
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey[600],
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                          Text(
                                            'En cours...',
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: Colors.blue[600],
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                if (item.status == UploadStatus.completed)
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 6,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.green[50],
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          Icons.check_circle,
                                          color: Colors.green[600],
                                          size: 16,
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          'Upload terminé',
                                          style: TextStyle(
                                            color: Colors.green[600],
                                            fontSize: 12,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                if (item.status == UploadStatus.failed)
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 12,
                                          vertical: 6,
                                        ),
                                        decoration: BoxDecoration(
                                          color: Colors.red[50],
                                          borderRadius: BorderRadius.circular(
                                            6,
                                          ),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(
                                              Icons.error,
                                              color: Colors.red[600],
                                              size: 16,
                                            ),
                                            const SizedBox(width: 6),
                                            Text(
                                              'Erreur',
                                              style: TextStyle(
                                                color: Colors.red[600],
                                                fontSize: 12,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      if (item.errorMessage != null)
                                        Padding(
                                          padding: const EdgeInsets.only(
                                            top: 6,
                                          ),
                                          child: Text(
                                            item.errorMessage!,
                                            style: TextStyle(
                                              color: Colors.red[400],
                                              fontSize: 11,
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  const SizedBox(height: 16),
                ],
              ),
            );
          },
        );
      },
    );
  }

  IconData _getFileIcon(String fileName) {
    final extension = fileName.split('.').last.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return Icons.image;
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
      case 'webm':
        return Icons.videocam;
      default:
        return Icons.insert_drive_file;
    }
  }

  IconData _getStatusIcon(UploadStatus status) {
    switch (status) {
      case UploadStatus.pending:
        return Icons.schedule;
      case UploadStatus.uploading:
        return Icons.cloud_upload;
      case UploadStatus.completed:
        return Icons.check_circle;
      case UploadStatus.failed:
        return Icons.error;
    }
  }

  Color _getStatusColor(UploadStatus status) {
    switch (status) {
      case UploadStatus.pending:
        return Colors.grey;
      case UploadStatus.uploading:
        return Colors.blue;
      case UploadStatus.completed:
        return Colors.green;
      case UploadStatus.failed:
        return Colors.red;
    }
  }

  String _getStatusText(UploadStatus status) {
    switch (status) {
      case UploadStatus.pending:
        return 'En attente';
      case UploadStatus.uploading:
        return 'Téléchargement...';
      case UploadStatus.completed:
        return 'Terminé';
      case UploadStatus.failed:
        return 'Échec';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _selectedIndex, children: _widgetOptions),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.photo_library),
            label: 'Photos',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.photo_album),
            label: 'Albums',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.favorite),
            label: 'Favorites',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.delete), label: 'Trash'),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Theme.of(context).colorScheme.primary,
        unselectedItemColor: Colors.grey,
        onTap: _onItemTapped,
        showUnselectedLabels: true,
      ),
      floatingActionButton: Consumer<UploadProvider>(
        builder: (context, provider, child) {
          return Stack(
            children: [
              FloatingActionButton(
                onPressed: _showUploadMenu,
                child: const Icon(Icons.add),
              ),
              // Badge pour montrer le nombre d'uploads en cours
              if (provider.queue.isNotEmpty)
                Positioned(
                  right: 0,
                  top: 0,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 18,
                      minHeight: 18,
                    ),
                    child: Text(
                      '${provider.queue.length}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
