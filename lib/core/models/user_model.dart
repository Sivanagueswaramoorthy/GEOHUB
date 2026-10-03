import 'package:cloud_firestore/cloud_firestore.dart';
import '../constants/app_constants.dart';

class UserModel {
  final String uid;
  final String email;
  final String name;
  final String role;
  final String? team;
  final String? teamRole;
  final bool isVolunteer;
  final String status;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const UserModel({
    required this.uid,
    required this.email,
    required this.name,
    this.role = AppConstants.roleMember,
    this.team,
    this.teamRole,
    this.isVolunteer = false,
    this.status = AppConstants.statusPending,
    this.createdAt,
    this.updatedAt,
  });

  // Role Checks
  bool get isSuperAdmin => role == AppConstants.roleSuperAdmin;
  bool get isAdmin => role == AppConstants.roleAdmin || isSuperAdmin;
  bool get isTeamAdmin => role == AppConstants.roleTeamAdmin;
  bool get isMember => role == AppConstants.roleMember;
  
  // Privilege Checks
  bool get canScanQr => isVolunteer || isAdmin || isSuperAdmin;
  bool get canManageTasks => isAdmin || isSuperAdmin || isTeamAdmin;
  bool get canCreateEvents => isAdmin || isSuperAdmin;
  bool get canUploadGallery =>
      isAdmin ||
      isSuperAdmin ||
      (team?.toLowerCase() == 'documentation');

  // Status Checks
  bool get isActive => status == AppConstants.statusActive;
  bool get isPending => status == AppConstants.statusPending;
  bool get isDisabled => status == AppConstants.statusDisabled;

  UserModel copyWith({
    String? uid,
    String? email,
    String? name,
    String? role,
    String? team,
    String? teamRole,
    bool? isVolunteer,
    String? status,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserModel(
      uid: uid ?? this.uid,
      email: email ?? this.email,
      name: name ?? this.name,
      role: role ?? this.role,
      team: team ?? this.team,
      teamRole: teamRole ?? this.teamRole,
      isVolunteer: isVolunteer ?? this.isVolunteer,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'email': email,
      'name': name,
      'role': role,
      'team': team,
      'teamRole': teamRole,
      'isVolunteer': isVolunteer,
      'status': status,
      'createdAt': createdAt != null ? Timestamp.fromDate(createdAt!) : FieldValue.serverTimestamp(),
      'updatedAt': updatedAt != null ? Timestamp.fromDate(updatedAt!) : FieldValue.serverTimestamp(),
    };
  }

  factory UserModel.fromMap(Map<String, dynamic> map, {String? docId}) {
    DateTime? parseTimestamp(dynamic val) {
      if (val is Timestamp) return val.toDate();
      if (val is String) return DateTime.tryParse(val);
      return null;
    }

    return UserModel(
      uid: docId ?? map['uid'] ?? '',
      email: map['email'] ?? '',
      name: map['name'] ?? '',
      role: map['role'] ?? AppConstants.roleMember,
      team: map['team'],
      teamRole: map['teamRole'],
      isVolunteer: map['isVolunteer'] == true,
      status: map['status'] ?? AppConstants.statusPending,
      createdAt: parseTimestamp(map['createdAt']),
      updatedAt: parseTimestamp(map['updatedAt']),
    );
  }

  factory UserModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> snapshot) {
    final data = snapshot.data() ?? {};
    return UserModel.fromMap(data, docId: snapshot.id);
  }
}
