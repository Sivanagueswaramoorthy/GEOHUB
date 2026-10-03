import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/auth_providers.dart';
import '../models/event_model.dart';
import '../models/event_registration_model.dart';

class EventFilter {
  final String? status;
  final String? academicYear;
  final String? type;

  const EventFilter({this.status, this.academicYear, this.type});

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is EventFilter &&
          runtimeType == other.runtimeType &&
          status == other.status &&
          academicYear == other.academicYear &&
          type == other.type;

  @override
  int get hashCode => status.hashCode ^ academicYear.hashCode ^ type.hashCode;
}

// Stream Events with Role-based filtering
final eventsStreamProvider =
    StreamProvider.family<List<EventModel>, EventFilter>((ref, filter) {
  final firestore = ref.watch(firestoreProvider);
  final user = ref.watch(currentUserProfileProvider).value;

  Query<Map<String, dynamic>> query = firestore.collection(AppConstants.colEvents);

  if (user == null || !user.isAdmin) {
    // Regular members only see approved and live events
    query = query.where('status', whereIn: [
      AppConstants.eventStatusApproved,
      AppConstants.eventStatusLive,
      AppConstants.eventStatusCompleted,
    ]);
  } else {
    // Admin filtering
    if (filter.status != null && filter.status!.isNotEmpty) {
      query = query.where('status', isEqualTo: filter.status);
    }
  }

  if (filter.academicYear != null && filter.academicYear!.isNotEmpty) {
    query = query.where('academicYear', isEqualTo: filter.academicYear);
  }

  if (filter.type != null && filter.type!.isNotEmpty) {
    query = query.where('type', isEqualTo: filter.type);
  }

  return query.snapshots().map((snapshot) {
    final list = snapshot.docs.map((doc) => EventModel.fromFirestore(doc)).toList();
    list.sort((a, b) => b.dateTime.compareTo(a.dateTime));
    return list;
  });
});

// Stream Event Details
final eventDetailProvider =
    StreamProvider.family<EventModel?, String>((ref, eventId) {
  final firestore = ref.watch(firestoreProvider);
  return firestore
      .collection(AppConstants.colEvents)
      .doc(eventId)
      .snapshots()
      .map((doc) => doc.exists ? EventModel.fromFirestore(doc) : null);
});

// Check if user is registered for this event
final isUserRegisteredProvider =
    StreamProvider.family<bool, String>((ref, eventId) {
  final user = ref.watch(currentUserProfileProvider).value;
  if (user == null) return Stream.value(false);

  final firestore = ref.watch(firestoreProvider);
  final regDocId = '${eventId}_${user.uid}';

  return firestore
      .collection(AppConstants.colEventRegistrations)
      .doc(regDocId)
      .snapshots()
      .map((doc) => doc.exists);
});

// Event Actions Controller
final eventActionsControllerProvider = Provider((ref) {
  return EventActionsController(
    firestore: ref.watch(firestoreProvider),
    ref: ref,
  );
});

class EventActionsController {
  final FirebaseFirestore _firestore;
  final Ref _ref;

  EventActionsController({
    required FirebaseFirestore firestore,
    required Ref ref,
  })  : _firestore = firestore,
        _ref = ref;

  Future<String> createEvent(EventModel event) async {
    final user = _ref.read(currentUserProfileProvider).value;
    if (user == null) throw Exception('User not authenticated');

    final docRef = _firestore.collection(AppConstants.colEvents).doc();
    final newEvent = event.copyWith(
      id: docRef.id,
      createdBy: user.uid,
      createdAt: DateTime.now(),
      status: user.isSuperAdmin
          ? AppConstants.eventStatusApproved
          : AppConstants.eventStatusSubmitted,
    );

    await docRef.set(newEvent.toMap());
    return docRef.id;
  }

  Future<void> updateEvent(EventModel event) async {
    await _firestore
        .collection(AppConstants.colEvents)
        .doc(event.id)
        .update(event.toMap());
  }

  Future<void> updateEventStatus(String eventId, String newStatus) async {
    await _firestore
        .collection(AppConstants.colEvents)
        .doc(eventId)
        .update({'status': newStatus});
  }

  Future<void> registerForEvent(String eventId) async {
    final user = _ref.read(currentUserProfileProvider).value;
    if (user == null) throw Exception('User not authenticated');

    final regDocId = '${eventId}_${user.uid}';
    final regRef = _firestore.collection(AppConstants.colEventRegistrations).doc(regDocId);

    final reg = EventRegistrationModel(
      id: regDocId,
      eventId: eventId,
      userId: user.uid,
      userName: user.name,
      userEmail: user.email,
      registeredAt: DateTime.now(),
    );

    await regRef.set(reg.toMap());
  }

  Future<void> assignVolunteers(String eventId, List<String> volunteerUserIds) async {
    await _firestore
        .collection(AppConstants.colEvents)
        .doc(eventId)
        .update({'volunteerUserIds': volunteerUserIds});
  }
}
