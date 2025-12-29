class Media {
  final String id;
  final String name;
  final String path;
  final String? thumb;
  final String type;
  final int size;
  final DateTime createdAt;
  final bool isFavorite;
  final int? width;
  final int? height;
  final int? duration;

  Media({
    required this.id,
    required this.name,
    required this.path,
    this.thumb,
    required this.type,
    required this.size,
    required this.createdAt,
    required this.isFavorite,
    this.width,
    this.height,
    this.duration,
  });

  factory Media.fromJson(Map<String, dynamic> json) {
    return Media(
      id: json['id'].toString(),
      name: json['name'],
      path: json['path'],
      thumb: json['thumb'],
      type: json['type'],
      size: json['size'],
      createdAt: DateTime.parse(json['createdAt']),
      isFavorite: json['favorite'] ?? false,
      width: json['width'],
      height: json['height'],
      duration: json['duration'],
    );
  }
}
