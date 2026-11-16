class EventModel {
  final String id;
  final String title;
  final String type;
  final DateTime dateTime;
  final String venue;
  final String description;
  final double budget;
  final String? posterUrl;
  final String status;
  final String academicYear;
  final List<String> volunteerUserIds;

  const EventModel({
    required this.id,
    required this.title,
    this.type = 'Academic',
    required this.dateTime,
    required this.venue,
    this.description = '',
    this.budget = 0.0,
    this.posterUrl,
    this.status = 'approved',
    this.academicYear = '2025-26',
    this.volunteerUserIds = const [],
  });

  bool get isLive => status == 'live';
  bool get isApproved => status == 'approved';
  bool get isDraft => status == 'draft';
  bool get isCompleted => status == 'completed';

  factory EventModel.fromJson(Map<String, dynamic> json) {
    DateTime parseDate(dynamic val) {
      if (val is String) {
        return DateTime.tryParse(val) ?? DateTime.now();
      }
      return DateTime.now();
    }

    return EventModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Event',
      type: json['type']?.toString() ?? 'Academic',
      dateTime: parseDate(json['date_time']),
      venue: json['venue']?.toString() ?? 'Campus Ground',
      description: json['description']?.toString() ?? '',
      budget: (json['budget'] as num?)?.toDouble() ?? 0.0,
      posterUrl: json['poster_url']?.toString(),
      status: json['status']?.toString() ?? 'approved',
      academicYear: json['academic_year']?.toString() ?? '2025-26',
      volunteerUserIds: (json['volunteer_user_ids'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'type': type,
      'date_time': dateTime.toIso8601String(),
      'venue': venue,
      'description': description,
      'budget': budget,
      'poster_url': posterUrl,
      'status': status,
      'academic_year': academicYear,
      'volunteer_user_ids': volunteerUserIds,
    };
  }
}
