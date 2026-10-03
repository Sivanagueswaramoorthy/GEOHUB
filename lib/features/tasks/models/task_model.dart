import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../core/constants/app_constants.dart';

class TaskModel {
  final String id;
  final String title;
  final String description;
  final String teamId;
  final List<String> assignedUserIds;
  final DateTime deadline;
  final String status;
  final List<String> proofUrls;
  final String createdBy;
  final DateTime createdAt;

  const TaskModel({
    required this.id,
    required this.title,
    this.description = '',
    required this.teamId,
    this.assignedUserIds = const [],
    required this.deadline,
    this.status = AppConstants.taskStatusTodo,
    this.proofUrls = const [],
    required this.createdBy,
    required this.createdAt,
  });

  bool get isTodo => status == AppConstants.taskStatusTodo;
  bool get isInProgress => status == AppConstants.taskStatusInProgress;
  bool get isDone => status == AppConstants.taskStatusDone;

  bool isAssignedTo(String userId) => assignedUserIds.contains(userId);

  TaskModel copyWith({
    String? id,
    String? title,
    String? description,
    String? teamId,
    List<String>? assignedUserIds,
    DateTime? deadline,
    String? status,
    List<String>? proofUrls,
    String? createdBy,
    DateTime? createdAt,
  }) {
    return TaskModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      teamId: teamId ?? this.teamId,
      assignedUserIds: assignedUserIds ?? this.assignedUserIds,
      deadline: deadline ?? this.deadline,
      status: status ?? this.status,
      proofUrls: proofUrls ?? this.proofUrls,
      createdBy: createdBy ?? this.createdBy,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'teamId': teamId,
      'assignedUserIds': assignedUserIds,
      'deadline': Timestamp.fromDate(deadline),
      'status': status,
      'proofUrls': proofUrls,
      'createdBy': createdBy,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }

  factory TaskModel.fromMap(Map<String, dynamic> map, {String? docId}) {
    DateTime parseDate(dynamic val) {
      if (val is Timestamp) return val.toDate();
      if (val is String) return DateTime.tryParse(val) ?? DateTime.now();
      return DateTime.now();
    }

    return TaskModel(
      id: docId ?? map['id'] ?? '',
      title: map['title'] ?? '',
      description: map['description'] ?? '',
      teamId: map['teamId'] ?? '',
      assignedUserIds: List<String>.from(map['assignedUserIds'] ?? []),
      deadline: parseDate(map['deadline']),
      status: map['status'] ?? AppConstants.taskStatusTodo,
      proofUrls: List<String>.from(map['proofUrls'] ?? []),
      createdBy: map['createdBy'] ?? '',
      createdAt: parseDate(map['createdAt']),
    );
  }

  factory TaskModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    return TaskModel.fromMap(doc.data() ?? {}, docId: doc.id);
  }
}
