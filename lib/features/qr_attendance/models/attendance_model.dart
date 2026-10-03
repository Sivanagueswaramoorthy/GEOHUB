import 'package:cloud_firestore/cloud_firestore.dart';

class AttendanceModel {
  final String id;
  final String eventId;
  final String userId;
  final String? userName;
  final String scannedBy;
  final DateTime checkInTime;
  final String method;

  const AttendanceModel({
    required this.id,
    required this.eventId,
    required this.userId,
    this.userName,
    required this.scannedBy,
    required this.checkInTime,
    this.method = 'qr',
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'eventId': eventId,
      'userId': userId,
      'userName': userName,
      'scannedBy': scannedBy,
      'checkInTime': Timestamp.fromDate(checkInTime),
      'method': method,
    };
  }

  factory AttendanceModel.fromMap(Map<String, dynamic> map, {String? docId}) {
    DateTime parseDate(dynamic val) {
      if (val is Timestamp) return val.toDate();
      if (val is String) return DateTime.tryParse(val) ?? DateTime.now();
      return DateTime.now();
    }

    return AttendanceModel(
      id: docId ?? map['id'] ?? '',
      eventId: map['eventId'] ?? '',
      userId: map['userId'] ?? '',
      userName: map['userName'],
      scannedBy: map['scannedBy'] ?? '',
      checkInTime: parseDate(map['checkInTime']),
      method: map['method'] ?? 'qr',
    );
  }

  factory AttendanceModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    return AttendanceModel.fromMap(doc.data() ?? {}, docId: doc.id);
  }
}
