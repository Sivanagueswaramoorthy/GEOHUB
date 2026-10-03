import 'package:cloud_firestore/cloud_firestore.dart';

class NotificationModel {
  final String id;
  final String title;
  final String body;
  final String? type; // task, event, join_request, announcement
  final String? targetId;
  final String? recipientUserId;
  final String? topic;
  final DateTime createdAt;
  final bool read;

  const NotificationModel({
    required this.id,
    required this.title,
    required this.body,
    this.type,
    this.targetId,
    this.recipientUserId,
    this.topic,
    required this.createdAt,
    this.read = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'body': body,
      'type': type,
      'targetId': targetId,
      'recipientUserId': recipientUserId,
      'topic': topic,
      'createdAt': Timestamp.fromDate(createdAt),
      'read': read,
    };
  }

  factory NotificationModel.fromMap(Map<String, dynamic> map, {String? docId}) {
    DateTime parseDate(dynamic val) {
      if (val is Timestamp) return val.toDate();
      if (val is String) return DateTime.tryParse(val) ?? DateTime.now();
      return DateTime.now();
    }

    return NotificationModel(
      id: docId ?? map['id'] ?? '',
      title: map['title'] ?? '',
      body: map['body'] ?? '',
      type: map['type'],
      targetId: map['targetId'],
      recipientUserId: map['recipientUserId'],
      topic: map['topic'],
      createdAt: parseDate(map['createdAt']),
      read: map['read'] == true,
    );
  }

  factory NotificationModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    return NotificationModel.fromMap(doc.data() ?? {}, docId: doc.id);
  }
}
