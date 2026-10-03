import 'package:cloud_firestore/cloud_firestore.dart';

class EventRegistrationModel {
  final String id;
  final String eventId;
  final String userId;
  final String userName;
  final String userEmail;
  final DateTime registeredAt;

  const EventRegistrationModel({
    required this.id,
    required this.eventId,
    required this.userId,
    required this.userName,
    required this.userEmail,
    required this.registeredAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'eventId': eventId,
      'userId': userId,
      'userName': userName,
      'userEmail': userEmail,
      'registeredAt': Timestamp.fromDate(registeredAt),
    };
  }

  factory EventRegistrationModel.fromMap(Map<String, dynamic> map, {String? docId}) {
    DateTime parseDate(dynamic val) {
      if (val is Timestamp) return val.toDate();
      if (val is String) return DateTime.tryParse(val) ?? DateTime.now();
      return DateTime.now();
    }

    return EventRegistrationModel(
      id: docId ?? map['id'] ?? '',
      eventId: map['eventId'] ?? '',
      userId: map['userId'] ?? '',
      userName: map['userName'] ?? '',
      userEmail: map['userEmail'] ?? '',
      registeredAt: parseDate(map['registeredAt']),
    );
  }

  factory EventRegistrationModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    return EventRegistrationModel.fromMap(doc.data() ?? {}, docId: doc.id);
  }
}
