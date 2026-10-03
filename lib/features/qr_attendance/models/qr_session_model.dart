import 'package:cloud_firestore/cloud_firestore.dart';

class QrSessionModel {
  final String id;
  final String eventId;
  final String userId;
  final String token;
  final DateTime expiresAt;
  final bool used;

  const QrSessionModel({
    required this.id,
    required this.eventId,
    required this.userId,
    required this.token,
    required this.expiresAt,
    this.used = false,
  });

  bool get isExpired => DateTime.now().isAfter(expiresAt);

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'eventId': eventId,
      'userId': userId,
      'token': token,
      'expiresAt': Timestamp.fromDate(expiresAt),
      'used': used,
    };
  }

  factory QrSessionModel.fromMap(Map<String, dynamic> map, {String? docId}) {
    DateTime parseDate(dynamic val) {
      if (val is Timestamp) return val.toDate();
      if (val is String) return DateTime.tryParse(val) ?? DateTime.now();
      return DateTime.now();
    }

    return QrSessionModel(
      id: docId ?? map['id'] ?? '',
      eventId: map['eventId'] ?? '',
      userId: map['userId'] ?? '',
      token: map['token'] ?? '',
      expiresAt: parseDate(map['expiresAt']),
      used: map['used'] == true,
    );
  }

  factory QrSessionModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    return QrSessionModel.fromMap(doc.data() ?? {}, docId: doc.id);
  }
}
