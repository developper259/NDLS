import 'package:flutter/material.dart';
import '../models/media.dart';
import '../models/album.dart';
import 'api_service.dart';

class MediaProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Media> _media = [];
  List<Album> _albums = [];
  List<Media> _favorites = [];
  List<Media> _trash = [];
  bool _isLoading = false;

  List<Media> get media => _media;
  List<Album> get albums => _albums;
  List<Media> get favorites => _favorites;
  List<Media> get trash => _trash;
  bool get isLoading => _isLoading;

  Future<void> fetchAll() async {
    _isLoading = true;
    notifyListeners();
    try {
      await Future.wait([
        _apiService.getMedia().then((data) => _media = data),
        _apiService.getAlbums().then((data) => _albums = data),
        _apiService.getFavorites().then((data) => _favorites = data),
        _apiService.getTrash().then((data) => _trash = data),
      ]);
    } catch (e) {
      // Handle error
      // ignore: avoid_print
      print('Error fetching data: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
