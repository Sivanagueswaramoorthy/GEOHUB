import 'package:cloud_firestore/cloud_firestore.dart';

class JoinRequestModel {
  final String id;
  final String userId;
  final String userName;
  final String userEmail;
  final String teamId;
  final String status; // pending, approved, rejected
  final String? requestedRole;
  final String? reviewedBy;
  final DateTime createdAt;

  const JoinRequestModel({
    required this.id,
    required this.userId,
    required this.userName,
    required this.userEmail,
    required this.teamId,
    this.status = 'pending',
    this.requestedRole,
    this.reviewedBy,
    required this.createdAt,
  });

  bool get isPending => status == 'pending';
  bool get isApproved => status == 'approved';
  bool get isRejected => status == 'rejected';

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'userName': userName,
      'userEmail': userEmail,
      'teamId': teamId,
      'status': status,
      'requestedRole': requestedRole,
      'reviewedBy': reviewedBy,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }

  factory JoinRequestModel.fromMap(Map<String, dynamic> map, {String? docId}) {
    DateTime parseDate(dynamic val) {
      if (val is Timestamp) return val.toDate();
      if (val is String) return DateTime.tryParse(val) ?? DateTime.now();
      return DateTime.now();
    }

    return JoinRequestModel(
      id: docId ?? map['id'] ?? '',
      userId: map['userId'] ?? '',
      userName: map['userName'] ?? '',
      userEmail: map['userEmail'] ?? '',
      teamId: map['teamId'] ?? '',
      status: map['status'] ?? 'pending',
      requestedRole: map['requestedRole'],
      reviewedBy: map['reviewedBy'],
      createdAt: parseDate(map['createdAt']),
    );
  }

  factory JoinRequestModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    return JoinRequestModel.fromMap(doc.data() ?? {}, docId: doc.id);
  }
}
