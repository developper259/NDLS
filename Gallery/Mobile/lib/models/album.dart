class Album {
  final String id;
  final String name;
  final String? description;
  final int mediaCount;
  final String? coverUrl;

  Album({
    required this.id,
    required this.name,
    this.description,
    required this.mediaCount,
    this.coverUrl,
  });

  factory Album.fromJson(Map<String, dynamic> json) {
    return Album(
      id: json['id'].toString(),
      name: json['name'],
      description: json['description'],
      mediaCount: json['media_count'] ?? 0,
      coverUrl: json['cover_url'],
    );
  }
}
