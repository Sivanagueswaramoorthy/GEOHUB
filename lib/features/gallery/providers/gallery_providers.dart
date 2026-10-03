import 'dart:typed_data';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/auth_providers.dart';
import '../models/document_model.dart';

class GalleryFilter {
  final String? eventId;
  final String? category;

  const GalleryFilter({this.eventId, this.category});

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is GalleryFilter &&
          runtimeType == other.runtimeType &&
          eventId == other.eventId &&
          category == other.category;

  @override
  int get hashCode => eventId.hashCode ^ category.hashCode;
}

// Stream documents matching filter
final documentsStreamProvider =
    StreamProvider.family<List<DocumentModel>, GalleryFilter>((ref, filter) {
  final firestore = ref.watch(firestoreProvider);
  Query<Map<String, dynamic>> query = firestore.collection(AppConstants.colDocuments);

  if (filter.eventId != null && filter.eventId!.isNotEmpty) {
    query = query.where('eventId', isEqualTo: filter.eventId);
  }
  if (filter.category != null && filter.category!.isNotEmpty) {
    query = query.where('category', isEqualTo: filter.category);
  }

  return query.snapshots().map((snapshot) {
    final docs = snapshot.docs.map((d) => DocumentModel.fromFirestore(d)).toList();
    docs.sort((a, b) => b.uploadedAt.compareTo(a.uploadedAt));
    return docs;
  });
});

// Gallery Actions Controller
final galleryActionsControllerProvider = Provider((ref) {
  return GalleryActionsController(
    firestore: ref.watch(firestoreProvider),
    storage: ref.watch(storageProvider),
    ref: ref,
  );
});

class GalleryActionsController {
  final FirebaseFirestore _firestore;
  final FirebaseStorage _storage;
  final Ref _ref;

  GalleryActionsController({
    required FirebaseFirestore firestore,
    required FirebaseStorage storage,
    required Ref ref,
  })  : _firestore = firestore,
        _storage = storage,
        _ref = ref;

  Future<void> uploadDocumentFile({
    required String eventId,
    required String academicYear,
    required String category,
    required String fileName,
    required Uint8List bytes,
  }) async {
    final user = _ref.read(currentUserProfileProvider).value;
    if (user == null) throw Exception('User not authenticated');

    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final cleanFileName = fileName.replaceAll(RegExp(r'[^a-zA-Z0-9._-]'), '_');
    // Storage structure: {academicYear}/{eventId}/{category}/{fileId}.extension
    final storagePath = '$academicYear/$eventId/$category/${timestamp}_$cleanFileName';

    final ref = _storage.ref().child(storagePath);
    final uploadTask = await ref.putData(bytes);
    final downloadUrl = await uploadTask.ref.getDownloadURL();

    final docRef = _firestore.collection(AppConstants.colDocuments).doc();
    final document = DocumentModel(
      id: docRef.id,
      eventId: eventId,
      category: category,
      storagePath: storagePath,
      downloadUrl: downloadUrl,
      fileName: fileName,
      uploadedBy: user.uid,
      uploadedAt: DateTime.now(),
      teamId: user.team ?? 'Documentation',
    );

    await docRef.set(document.toMap());
  }

  Future<void> saveDocumentLink({
    required String eventId,
    required String category,
    required String fileName,
    required String directUrl,
  }) async {
    final user = _ref.read(currentUserProfileProvider).value;
    if (user == null) throw Exception('User not authenticated');

    final docRef = _firestore.collection(AppConstants.colDocuments).doc();
    final document = DocumentModel(
      id: docRef.id,
      eventId: eventId,
      category: category,
      storagePath: 'external',
      downloadUrl: directUrl,
      fileName: fileName,
      uploadedBy: user.uid,
      uploadedAt: DateTime.now(),
      teamId: user.team ?? 'Documentation',
    );

    await docRef.set(document.toMap());
  }
}
