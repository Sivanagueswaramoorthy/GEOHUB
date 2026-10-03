import 'package:cloud_firestore/cloud_firestore.dart';

class DocumentModel {
  final String id;
  final String eventId;
  final String category; // photos, videos, bills, reports
  final String storagePath;
  final String downloadUrl;
  final String fileName;
  final String uploadedBy;
  final DateTime uploadedAt;
  final String teamId;

  const DocumentModel({
    required this.id,
    required this.eventId,
    required this.category,
    required this.storagePath,
    required this.downloadUrl,
    required this.fileName,
    required this.uploadedBy,
    required this.uploadedAt,
    this.teamId = 'Documentation',
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'eventId': eventId,
      'category': category,
      'storagePath': storagePath,
      'downloadUrl': downloadUrl,
      'fileName': fileName,
      'uploadedBy': uploadedBy,
      'uploadedAt': Timestamp.fromDate(uploadedAt),
      'teamId': teamId,
    };
  }

  factory DocumentModel.fromMap(Map<String, dynamic> map, {String? docId}) {
    DateTime parseDate(dynamic val) {
      if (val is Timestamp) return val.toDate();
      if (val is String) return DateTime.tryParse(val) ?? DateTime.now();
      return DateTime.now();
    }

    return DocumentModel(
      id: docId ?? map['id'] ?? '',
      eventId: map['eventId'] ?? '',
      category: map['category'] ?? 'photos',
      storagePath: map['storagePath'] ?? '',
      downloadUrl: map['downloadUrl'] ?? '',
      fileName: map['fileName'] ?? '',
      uploadedBy: map['uploadedBy'] ?? '',
      uploadedAt: parseDate(map['uploadedAt']),
      teamId: map['teamId'] ?? 'Documentation',
    );
  }

  factory DocumentModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    return DocumentModel.fromMap(doc.data() ?? {}, docId: doc.id);
  }
}
