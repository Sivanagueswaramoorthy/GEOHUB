import 'package:cloud_firestore/cloud_firestore.dart';

class TeamModel {
  final String id;
  final String name;
  final String description;
  final List<String> adminUserIds;
  final List<String> memberUserIds;

  const TeamModel({
    required this.id,
    required this.name,
    this.description = '',
    this.adminUserIds = const [],
    this.memberUserIds = const [],
  });

  int get totalMembers => memberUserIds.length;
  int get totalAdmins => adminUserIds.length;

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'adminUserIds': adminUserIds,
      'memberUserIds': memberUserIds,
    };
  }

  factory TeamModel.fromMap(Map<String, dynamic> map, {String? docId}) {
    return TeamModel(
      id: docId ?? map['id'] ?? '',
      name: map['name'] ?? '',
      description: map['description'] ?? '',
      adminUserIds: List<String>.from(map['adminUserIds'] ?? []),
      memberUserIds: List<String>.from(map['memberUserIds'] ?? []),
    );
  }

  factory TeamModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    return TeamModel.fromMap(doc.data() ?? {}, docId: doc.id);
  }
}
