import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/auth_providers.dart';

// Live stream of attendance records for an event
final eventAttendanceCountProvider =
    StreamProvider.family<int, String>((ref, eventId) {
  final firestore = ref.watch(firestoreProvider);
  return firestore
      .collection(AppConstants.colAttendance)
      .where('eventId', isEqualTo: eventId)
      .snapshots()
      .map((snapshot) => snapshot.docs.length);
});

// QR Controller
final qrAttendanceControllerProvider = Provider((ref) {
  return QrAttendanceController(
    functions: ref.watch(functionsProvider),
    firestore: ref.watch(firestoreProvider),
    ref: ref,
  );
});

class QrAttendanceController {
  final FirebaseFunctions _functions;
  final FirebaseFirestore _firestore;
  final Ref _ref;

  QrAttendanceController({
    required FirebaseFunctions functions,
    required FirebaseFirestore firestore,
    required Ref ref,
  })  : _functions = functions,
        _firestore = firestore,
        _ref = ref;

  Future<String> generateEventQr({required String eventId}) async {
    final user = _ref.read(currentUserProfileProvider).value;
    if (user == null) throw Exception('User not authenticated');

    try {
      final callable = _functions.httpsCallable(AppConstants.fnGenerateEventQr);
      final result = await callable.call({
        'eventId': eventId,
        'userId': user.uid,
      });

      return result.data['token'] as String;
    } catch (_) {
      // Fallback direct generation for development/offline test
      final token = 'GEO-${DateTime.now().millisecondsSinceEpoch}-${user.uid.substring(0, 4)}';
      await _firestore.collection(AppConstants.colQrSessions).add({
        'eventId': eventId,
        'userId': user.uid,
        'token': token,
        'expiresAt': Timestamp.fromDate(DateTime.now().add(const Duration(seconds: 60))),
        'used': false,
      });
      return token;
    }
  }

  Future<Map<String, dynamic>> markAttendanceFromQr({
    required String eventId,
    required String token,
  }) async {
    try {
      final callable = _functions.httpsCallable(AppConstants.fnMarkAttendanceFromQr);
      final result = await callable.call({
        'eventId': eventId,
        'token': token.trim(),
      });

      return Map<String, dynamic>.from(result.data as Map);
    } catch (e) {
      // Fallback check against Firestore qr_sessions for local/dev testing
      final sessionQuery = await _firestore
          .collection(AppConstants.colQrSessions)
          .where('eventId', isEqualTo: eventId)
          .where('token', isEqualTo: token.trim())
          .limit(1)
          .get();

      if (sessionQuery.docs.isEmpty) {
        throw Exception('Invalid QR code token for this event');
      }

      final doc = sessionQuery.docs.first;
      final data = doc.data();

      if (data['used'] == true) {
        throw Exception('This QR code token has already been used');
      }

      final expiresAt = (data['expiresAt'] as Timestamp).toDate();
      if (DateTime.now().isAfter(expiresAt)) {
        throw Exception('This QR token has expired. Ask attendee to refresh QR.');
      }

      final attendeeUserId = data['userId'] as String;

      // Mark session as used
      await doc.reference.update({'used': true});

      // Fetch student name
      final userDoc = await _firestore
          .collection(AppConstants.colUsers)
          .doc(attendeeUserId)
          .get();
      final attendeeName = userDoc.data()?['name'] ?? 'Student';

      final volunteer = _ref.read(currentUserProfileProvider).value;

      // Create attendance doc
      final attId = '${eventId}_$attendeeUserId';
      await _firestore.collection(AppConstants.colAttendance).doc(attId).set({
        'id': attId,
        'eventId': eventId,
        'userId': attendeeUserId,
        'userName': attendeeName,
        'scannedBy': volunteer?.uid ?? 'scanner',
        'checkInTime': FieldValue.serverTimestamp(),
        'method': 'qr',
      });

      // Increment attendance count in event
      await _firestore.collection(AppConstants.colEvents).doc(eventId).update({
        'attendanceCount': FieldValue.increment(1),
      });

      return {
        'success': true,
        'userName': attendeeName,
        'userId': attendeeUserId,
      };
    }
  }
}
