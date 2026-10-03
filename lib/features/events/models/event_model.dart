import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../core/constants/app_constants.dart';

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
  final String createdBy;
  final DateTime createdAt;
  final int attendanceCount;

  const EventModel({
    required this.id,
    required this.title,
    required this.type,
    required this.dateTime,
    required this.venue,
    this.description = '',
    this.budget = 0.0,
    this.posterUrl,
    this.status = AppConstants.eventStatusDraft,
    required this.academicYear,
    this.volunteerUserIds = const [],
    required this.createdBy,
    required this.createdAt,
    this.attendanceCount = 0,
  });

  bool get isDraft => status == AppConstants.eventStatusDraft;
  bool get isSubmitted => status == AppConstants.eventStatusSubmitted;
  bool get isApproved => status == AppConstants.eventStatusApproved;
  bool get isLive => status == AppConstants.eventStatusLive;
  bool get isCompleted => status == AppConstants.eventStatusCompleted;
  bool get isArchived => status == AppConstants.eventStatusArchived;

  bool isVolunteer(String userId) => volunteerUserIds.contains(userId);

  EventModel copyWith({
    String? id,
    String? title,
    String? type,
    DateTime? dateTime,
    String? venue,
    String? description,
    double? budget,
    String? posterUrl,
    String? status,
    String? academicYear,
    List<String>? volunteerUserIds,
    String? createdBy,
    DateTime? createdAt,
    int? attendanceCount,
  }) {
    return EventModel(
      id: id ?? this.id,
      title: title ?? this.title,
      type: type ?? this.type,
      dateTime: dateTime ?? this.dateTime,
      venue: venue ?? this.venue,
      description: description ?? this.description,
      budget: budget ?? this.budget,
      posterUrl: posterUrl ?? this.posterUrl,
      status: status ?? this.status,
      academicYear: academicYear ?? this.academicYear,
      volunteerUserIds: volunteerUserIds ?? this.volunteerUserIds,
      createdBy: createdBy ?? this.createdBy,
      createdAt: createdAt ?? this.createdAt,
      attendanceCount: attendanceCount ?? this.attendanceCount,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'type': type,
      'dateTime': Timestamp.fromDate(dateTime),
      'venue': venue,
      'description': description,
      'budget': budget,
      'posterUrl': posterUrl,
      'status': status,
      'academicYear': academicYear,
      'volunteerUserIds': volunteerUserIds,
      'createdBy': createdBy,
      'createdAt': Timestamp.fromDate(createdAt),
      'attendanceCount': attendanceCount,
    };
  }

  factory EventModel.fromMap(Map<String, dynamic> map, {String? docId}) {
    DateTime parseDate(dynamic val) {
      if (val is Timestamp) return val.toDate();
      if (val is String) return DateTime.tryParse(val) ?? DateTime.now();
      return DateTime.now();
    }

    return EventModel(
      id: docId ?? map['id'] ?? '',
      title: map['title'] ?? '',
      type: map['type'] ?? 'Academic',
      dateTime: parseDate(map['dateTime']),
      venue: map['venue'] ?? '',
      description: map['description'] ?? '',
      budget: (map['budget'] as num?)?.toDouble() ?? 0.0,
      posterUrl: map['posterUrl'],
      status: map['status'] ?? AppConstants.eventStatusDraft,
      academicYear: map['academicYear'] ?? '2025-26',
      volunteerUserIds: List<String>.from(map['volunteerUserIds'] ?? []),
      createdBy: map['createdBy'] ?? '',
      createdAt: parseDate(map['createdAt']),
      attendanceCount: (map['attendanceCount'] as num?)?.toInt() ?? 0,
    );
  }

  factory EventModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    return EventModel.fromMap(doc.data() ?? {}, docId: doc.id);
  }
}
